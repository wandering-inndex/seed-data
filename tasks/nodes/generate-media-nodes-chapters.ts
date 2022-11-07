#!/usr/bin/env -S deno run --allow-env --allow-net --allow-read --allow-write

import "std/dotenv/load.ts";
import { stringify as convertToYaml } from "std/encoding/yaml.ts";

import { extractSeededData } from "../../utils/extractSeededData.ts";
import {
  AudioBook,
  Chapter,
  ElectronicBook,
  WebVolume,
} from "../../types/media.ts";
import { ChapterNode } from "../../types/nodes.ts";
import { SeedDataFiles } from "../../constants/media.ts";

const getChapters = async (): Promise<Chapter[]> => {
  const data = await extractSeededData<Chapter[]>(
    SeedDataFiles.TWI_WEBNOVEL_CHAPTERS,
  );
  return data;
};

const getWebVolumes = async (): Promise<Map<number, WebVolume>> => {
  const data = await extractSeededData<WebVolume[]>(
    SeedDataFiles.TWI_WEBNOVEL_VOLUMES,
  );

  const map = new Map<number, WebVolume>();
  data.forEach((volume) => {
    map.set(volume.index, volume);
  });

  return map;
};

const getAudioBooks = async (): Promise<Map<number, AudioBook>> => {
  const data = await extractSeededData<AudioBook[]>(
    SeedDataFiles.TWI_AUDIBLE_AUDIOBOOKS,
  );

  const map = new Map<number, AudioBook>();
  data.forEach((book) => {
    map.set(book.index, book);
  });

  return map;
};

const getElectronicBooks = async (): Promise<Map<number, ElectronicBook>> => {
  const data = await extractSeededData<ElectronicBook[]>(
    SeedDataFiles.TWI_AUDIBLE_AUDIOBOOKS,
  );

  const map = new Map<number, ElectronicBook>();
  data.forEach((book) => {
    map.set(book.index, book);
  });

  return map;
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
  const chapters = await getChapters();
  const webVolumes = await getWebVolumes();
  const audioBooks = await getAudioBooks();
  const electronicBooks = await getElectronicBooks();

  console.log(`Processing ${chapters.length} item(s).`);

  const promises: Promise<void>[] = [];
  for (const chapter of chapters) {
    console.log(
      `Upserting: Volume ${chapter.partOf.webNovel.ref} Chapter #${chapter.partOf.webNovel.order}: ${chapter.partOf.webNovel.title}`,
    );

    const node: ChapterNode = {
      id: chapter.id,
      wikiUrl: chapter.partOf.wiki.url ?? "",
      webNovelOrder: chapter.partOf.webNovel.order ?? 0,
      webNovelTitle: chapter.partOf.webNovel.title ?? "",
      eBookOrder: chapter.partOf.eBook.order ?? 0,
      eBookTitle: chapter.partOf.eBook.title ?? "",
      audioBookOrder: chapter.partOf.audioBook.order ?? 0,
      audioBookTitle: chapter.partOf.audioBook.title ?? "",
      PART_OF: [],
    };
    const webVolume = webVolumes.get(chapter.partOf.webNovel.ref ?? -1);
    if (webVolume) {
      node.PART_OF.push({
        label: "WebVolume",
        key: webVolume.id,
      });
    }

    const audioBook = audioBooks.get(chapter.partOf.audioBook.ref ?? -1);
    if (audioBook) {
      node.PART_OF.push({
        label: "AudioBook",
        key: audioBook.id,
      });
    }

    const electronicBook = electronicBooks.get(
      chapter.partOf.eBook.ref ?? -1,
    );
    if (electronicBook) {
      node.PART_OF.push({
        label: "ElectronicBook",
        key: electronicBook.id,
      });
    }

    const text = convertToYaml(node);
    promises.push(dumpToFile("nodes/Chapter/", `${chapter.id}.inn`, text));
  }

  await Promise.all(promises);
} catch (error) {
  console.log(error);
}
