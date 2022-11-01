#!/usr/bin/env -S deno run --allow-env --allow-net --allow-read --allow-write

import "std/dotenv/load.ts";

import { extractSeededData } from "../../utils/extractSeededData.ts";
import { WebVolume } from "../../types/media.ts";
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

const getItems = async (): Promise<WebVolume[]> => {
  const data = await extractSeededData<WebVolume[]>(
    SeedDataFiles.TWI_WEBNOVEL_VOLUMES,
  );
  return data;
};

try {
  const volumes = await getItems();
  console.log(`Processing ${volumes.length} item(s).`);

  const promises: Promise<Partial<WebVolume>>[] = [];
  for (const volume of volumes) {
    console.log(
      `Upserting: Volume ${volume.index}: ${volume.title}`,
    );

    const { id, ...props } = volume;
    promises.push(db.update(`volume:${id}`, props));
  }

  await Promise.all(promises);
} catch (error) {
  console.log(error);
}

const volumes = await db.select<WebVolume>("volume");
console.log(`Total volumes: ${volumes.length}.`);

db.close();
