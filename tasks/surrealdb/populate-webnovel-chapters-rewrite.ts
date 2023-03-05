#!/usr/bin/env -S deno run --allow-env --allow-net --allow-read --allow-write

import "std/dotenv/load.ts";
import { parse as parseArgs } from "std/flags/mod.ts";

import { extractSeededData } from "../../utils/extractSeededData.ts";
import { Chapter } from "../../types/media.ts";
import { SeedDataFiles } from "../../constants/media.ts";
import { connect } from "../../utils/db/surrealdb.ts";

// Connect to the database.
const [db, dbError] = await connect({
  url: Deno.env.get("SURREALDB_URL") ?? "",
  namespace: Deno.env.get("SURREALDB_NAMESPACE") ?? "",
  database: Deno.env.get("SURREALDB_DATABASE") ?? "",
  username: Deno.env.get("SURREALDB_USERNAME") ?? "",
  password: Deno.env.get("SURREALDB_PASSWORD") ?? "",
});
if (dbError !== null) {
  db.close();
  console.error(dbError);
  Deno.exit(1);
}

const getItems = async (): Promise<Chapter[]> => {
  const args = parseArgs(Deno.args);
  const filters = {
    onlyVolume: args["only-volume"] ? args["only-volume"] : 0,
    onlyChapter: args["only-chapter"] ? args["only-chapter"] : 0,
  };

  const data = await extractSeededData<Chapter[]>(
    SeedDataFiles.TWI_WEBNOVEL_REWRITE_CHAPTERS,
  );
  return (data || []).filter((chapter) => {
    if (filters.onlyVolume === 0) return true;
    return (chapter.partOf.webNovel?.ref || 0) === filters.onlyVolume;
  }).filter((chapter) => {
    if (filters.onlyChapter === 0) return true;
    return (chapter.partOf.webNovel?.order || 0) === filters.onlyChapter;
  });
};

const timeout = async (ms: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, ms));
};

try {
  const chapters = await getItems();
  console.log(`Processing ${chapters.length} item(s).`);

  const promises: Promise<Partial<Chapter>>[] = [];
  for (const chapter of chapters) {
    console.log(
      `Upserting: Volume ${chapter.partOf.webNovelRewrite?.ref || 0} Chapter #${
        chapter.partOf.webNovelRewrite?.order || 0
      }: ${chapter.partOf.webNovelRewrite?.title || ""}`,
    );

    const { id, ...props } = chapter;
    promises.push(db.update(`chapter:${id}`, props));

    // Due to some race condition, we need to add a timeout when creating the
    // promises or else it will hang indefinitely.
    await timeout(10);
  }

  await Promise.all(promises);
} catch (error) {
  console.log(error);
}

const chapters = await db.select<Chapter>("chapter");
console.log(`Total chapters: ${chapters.length}.`);

db.close();
