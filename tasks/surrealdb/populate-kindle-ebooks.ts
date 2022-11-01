#!/usr/bin/env -S deno run --allow-env --allow-net --allow-read --allow-write

import "std/dotenv/load.ts";

import { extractSeededData } from "../../utils/extractSeededData.ts";
import { ElectronicBook } from "../../types/media.ts";
import { SeedDataFiles } from "../../constants/media.ts";
import { connect } from "../../utils/db/surreal.ts";

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

const getItems = async (): Promise<ElectronicBook[]> => {
  const data = await extractSeededData<ElectronicBook[]>(
    SeedDataFiles.TWI_KINDLE_EBOOKS,
  );
  return data;
};

try {
  const ebooks = await getItems();
  console.log(`Processing ${ebooks.length} item(s).`);

  const promises: Promise<Partial<ElectronicBook>>[] = [];
  for (const ebook of ebooks) {
    console.log(
      `Upserting: E-book ${ebook.index}: ${ebook.title}`,
    );

    const { id, ...props } = ebook;
    promises.push(db.update(`ebook:${id}`, props));
  }

  await Promise.all(promises);
} catch (error) {
  console.log(error);
}

const ebooks = await db.select<ElectronicBook>("ebook");
console.log(`Total e-books: ${ebooks.length}.`);

db.close();
