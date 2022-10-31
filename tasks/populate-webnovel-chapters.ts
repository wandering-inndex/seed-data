#!/usr/bin/env -S deno run --allow-env --allow-net --allow-read --allow-write

import "std/dotenv/load.ts";
import { parse as parseArgs } from "std/flags/mod.ts";

import { extractSeededData } from "../utils/extractSeededData.ts";
import { Chapter } from "../types/media.ts";
import { SeedDataFiles } from "../constants/media.ts";
import { connect } from "../utils/db/surreal.ts";

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
    SeedDataFiles.TWI_WEBNOVEL_CHAPTERS,
  );
  return (data || []).filter((chapter) => {
    if (filters.onlyVolume === 0) return true;
    return chapter.partOf.webNovel.ref === filters.onlyVolume;
  }).filter((chapter) => {
    if (filters.onlyChapter === 0) return true;
    return chapter.partOf.webNovel.order === filters.onlyChapter;
  });
};

try {
  const chapters = await getItems();
  const count = chapters.length;
  console.log(`Processing ${count} item(s).`);

  const promises: Promise<Partial<Chapter>>[] = [];
  for (const chapter of chapters) {
    console.log(
      `Upserting: Volume ${chapter.partOf.webNovel.ref} Chapter #${chapter.partOf.webNovel.order}: ${chapter.partOf.webNovel.title}`,
    );

    const { id, ...props } = chapter;
    promises.push(db.update(`chapter:${id}`, props));
  }

  await Promise.all(promises);
} catch (error) {
  console.log(error);
}

const chapters = await db.select<Chapter>("chapter");
console.log(`Total chapters: ${chapters.length}.`);

db.close();
