#!/usr/bin/env -S deno run --allow-env --allow-net --allow-read --allow-write

import "std/dotenv/load.ts";
import { stringify as convertToYaml } from "std/encoding/yaml.ts";

import { extractSeededData } from "../../utils/extractSeededData.ts";
import { AudioBook } from "../../types/media.ts";
import { AudioBookNode } from "../../types/innfo.ts";
import { SeedDataFiles } from "../../constants/media.ts";

const getItems = async (): Promise<AudioBook[]> => {
  const data = await extractSeededData<AudioBook[]>(
    SeedDataFiles.TWI_AUDIBLE_AUDIOBOOKS,
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
  const audioBooks = await getItems();
  console.log(`Processing ${audioBooks.length} item(s).`);

  const promises: Promise<void>[] = [];
  for (const audioBook of audioBooks) {
    console.log(
      `Processing: Audio Book ${audioBook.index}: ${audioBook.title}`,
    );

    const node: AudioBookNode = {
      id: audioBook.id,
      index: audioBook.index,
      title: audioBook.title,
    };
    const text = convertToYaml(node);
    promises.push(dumpToFile("nodes/AudioBook/", `${audioBook.id}.inn`, text));
  }

  await Promise.all(promises);
} catch (error) {
  console.log(error);
}
