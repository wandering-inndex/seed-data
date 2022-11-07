#!/usr/bin/env -S deno run --allow-env --allow-net --allow-read --allow-write

import "std/dotenv/load.ts";
import { stringify as convertToYaml } from "std/encoding/yaml.ts";

import { extractSeededData } from "../../utils/extractSeededData.ts";
import { ElectronicBook } from "../../types/media.ts";
import { ElectronicBookNode } from "../../types/nodes.ts";
import { SeedDataFiles } from "../../constants/media.ts";

const getItems = async (): Promise<ElectronicBook[]> => {
  const data = await extractSeededData<ElectronicBook[]>(
    SeedDataFiles.TWI_KINDLE_EBOOKS,
  );
  return data;
};

const dumpToFile = async (
  dir: string,
  fileName: string,
  content: string,
): Promise<void> => {
  await Deno.mkdir(dir, { recursive: true });
  await Deno.writeTextFile(`${dir}/${fileName}`, content);
};

try {
  const electronicBooks = await getItems();
  console.log(`Processing ${electronicBooks.length} item(s).`);

  const promises: Promise<void>[] = [];
  for (const electronicBook of electronicBooks) {
    console.log(
      `Processing: Electronic Book ${electronicBook.index}: ${electronicBook.title}`,
    );

    const node: ElectronicBookNode = {
      id: electronicBook.id,
      index: electronicBook.index,
      title: electronicBook.title,
    };
    const text = convertToYaml(node);
    promises.push(
      dumpToFile("nodes/ElectronicBook/", `${electronicBook.id}.inn`, text),
    );
  }

  await Promise.all(promises);
} catch (error) {
  console.log(error);
}
