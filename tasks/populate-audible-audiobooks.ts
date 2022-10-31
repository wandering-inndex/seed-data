#!/usr/bin/env -S deno run --allow-env --allow-net --allow-read --allow-write

import "std/dotenv/load.ts";

import { extractSeededData } from "../utils/extractSeededData.ts";
import { AudioBook } from "../types/media.ts";
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

const getItems = async (): Promise<AudioBook[]> => {
  const data = await extractSeededData<AudioBook[]>(
    SeedDataFiles.TWI_AUDIBLE_AUDIOBOOKS,
  );
  return data;
};

try {
  const audiobooks = await getItems();
  const count = audiobooks.length;
  console.log(`Processing ${count} item(s).`);

  const promises: Promise<Partial<AudioBook>>[] = [];
  for (const audiobook of audiobooks) {
    console.log(
      `Upserting: Audiobook ${audiobook.index}: ${audiobook.title}`,
    );

    const { id, ...props } = audiobook;
    promises.push(db.update(`audiobook:${id}`, props));
  }

  await Promise.all(promises);
} catch (error) {
  console.log(error);
}

const audiobooks = await db.select<AudioBook>("ebook");
console.log(`Total audiobooks: ${audiobooks.length}.`);

db.close();
