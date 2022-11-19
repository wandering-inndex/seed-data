#!/usr/bin/env -S deno run --allow-env --allow-net --allow-read --allow-write

import "std/dotenv/load.ts";
import { parse as parseArgs } from "std/flags/mod.ts";

import { extractSeededData } from "../../utils/extractSeededData.ts";
import {
  AudioBook,
  Chapter,
  ElectronicBook,
  WebVolume,
} from "../../types/media.ts";
import { SeedDataFiles } from "../../constants/media.ts";
import { connect } from "../../utils/db/neo4j.ts";
import {
  AudioBookNode,
  ChapterNode,
  ElectronicBookNode,
  WebVolumeNode,
} from "../../types/nodes.ts";

const [db, dbError] = await connect({
  url: Deno.env.get("NEO4J_URI") ?? "",
  username: Deno.env.get("NEO4J_USERNAME") ?? "",
  password: Deno.env.get("NEO4J_PASSWORD") ?? "",
});
if (dbError !== null) {
  db.close();
  console.error(dbError);
  Deno.exit(1);
}

const getChapters = async (): Promise<Chapter[]> => {
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
    return chapter.partOf.webNovel!.ref === filters.onlyVolume;
  }).filter((chapter) => {
    if (filters.onlyChapter === 0) return true;
    return chapter.partOf.webNovel!.order === filters.onlyChapter;
  });
};

const getWebVolumes = async (): Promise<WebVolume[]> => {
  const data = await extractSeededData<WebVolume[]>(
    SeedDataFiles.TWI_WEBNOVEL_VOLUMES,
  );
  return data;
};

const getElectronicBooks = async (): Promise<ElectronicBook[]> => {
  const data = await extractSeededData<ElectronicBook[]>(
    SeedDataFiles.TWI_KINDLE_EBOOKS,
  );
  return data;
};

const getAudioBooks = async (): Promise<AudioBook[]> => {
  const data = await extractSeededData<AudioBook[]>(
    SeedDataFiles.TWI_AUDIBLE_AUDIOBOOKS,
  );
  return data;
};

const session = db.session();

try {
  const webVolumes = await getWebVolumes();
  const mapWebVolumes = new Map<number, WebVolume>();
  webVolumes.forEach((webVolume) => {
    mapWebVolumes.set(webVolume.index, webVolume);
  });

  console.log(`Processing ${webVolumes.length} web volume(s).`);
  await session.executeWrite((tx) =>
    Promise.all(
      webVolumes.map((webVolume) =>
        tx
          .run<WebVolumeNode>(
            `
MERGE (webVolume:WebVolume { id: $id })
ON CREATE
  SET
    webVolume.index = $index,
    webVolume.title = $title,
    webVolume.created = timestamp()
ON MATCH
  SET
    webVolume.index = $index,
    webVolume.title = $title
RETURN webVolume
`,
            {
              id: webVolume.id,
              index: webVolume.index ?? -1,
              title: webVolume.title ?? "",
            },
          )
      ),
    )
  );

  const electronicBooks = await getElectronicBooks();
  const mapElectronicBooks = new Map<number, ElectronicBook>();
  electronicBooks.forEach((electronicBook) => {
    mapElectronicBooks.set(electronicBook.index, electronicBook);
  });
  console.log(`Processing ${electronicBooks.length} electronic book(s).`);
  await session.executeWrite((tx) =>
    Promise.all(
      electronicBooks.map((electronicBook) =>
        tx
          .run<ElectronicBookNode>(
            `
MERGE (electronicBook:ElectronicBook { id: $id })
ON CREATE
  SET
    electronicBook.index = $index,
    electronicBook.title = $title,
    electronicBook.created = timestamp()
ON MATCH
  SET
    electronicBook.index = $index,
    electronicBook.title = $title
RETURN electronicBook
`,
            {
              id: electronicBook.id,
              index: electronicBook.index ?? -1,
              title: electronicBook.title ?? "",
            },
          )
      ),
    )
  );

  const audioBooks = await getAudioBooks();
  const mapAudioBooks = new Map<number, AudioBook>();
  audioBooks.forEach((audioBook) => {
    mapAudioBooks.set(audioBook.index, audioBook);
  });
  console.log(`Processing ${audioBooks.length} electronic book(s).`);
  await session.executeWrite((tx) =>
    Promise.all(
      audioBooks.map((audioBook) =>
        tx
          .run<AudioBookNode>(
            `
MERGE (audioBook:AudioBook { id: $id })
ON CREATE
  SET
    audioBook.index = $index,
    audioBook.title = $title,
    audioBook.created = timestamp()
ON MATCH
  SET
    audioBook.index = $index,
    audioBook.title = $title
RETURN audioBook
`,
            {
              id: audioBook.id,
              index: audioBook.index ?? -1,
              title: audioBook.title ?? "",
            },
          )
      ),
    )
  );

  const chapters = await getChapters();
  console.log(`Processing ${chapters.length} chapter(s).`);
  await session.executeWrite((tx) =>
    Promise.all(
      chapters.map((chapter) => {
        const webVolumeId =
          mapWebVolumes.get(chapter.partOf.webNovel!.ref ?? 0)?.id ?? "";
        const eBookId =
          mapElectronicBooks.get(chapter.partOf.eBook?.ref ?? 0)?.id ?? "";
        const eBookQueryMatch =
          `, (electronicBook:ElectronicBook {id: $eBookId})`;
        const eBookQueryMerge = `MERGE (chapter)-[:PART_OF]->(electronicBook)`;

        const audioBookId =
          mapAudioBooks.get(chapter.partOf.audioBook?.ref ?? 0)?.id ?? "";
        const audioBookQueryMatch =
          `, (audioBook:AudioBook {id: $audioBookId})`;
        const audioBookQueryMerge = `MERGE (chapter)-[:PART_OF]->(audioBook)`;

        return tx
          .run<ChapterNode>(
            `
MATCH (webVolume:WebVolume {id: $webVolumeId})
${eBookId !== "" ? eBookQueryMatch : ""}
${audioBookId !== "" ? audioBookQueryMatch : ""}
MERGE (chapter:Chapter { id: $id })
SET
  chapter.metaChapterType = $metaChapterType,
  chapter.metaShow = $metaShow,
  chapter.webNovelTitle = $webNovelTitle,
  chapter.webNovelOrder = $webNovelOrder,
  chapter.webNovelWords = $webNovelWords,
  chapter.eBookOrder = $eBookOrder,
  chapter.audioBookOrder = $audioBookOrder
MERGE (chapter)-[:PART_OF]->(webVolume)
ON CREATE
  SET chapter.created = timestamp()
${eBookId !== "" ? eBookQueryMerge : ""}
${audioBookId !== "" ? audioBookQueryMerge : ""}
RETURN chapter
          `,
            {
              id: chapter.id,
              metaChapterType: chapter.meta.chapterType,
              metaShow: chapter.meta.show,
              webNovelTitle: chapter.partOf.webNovel!.title ?? "",
              webNovelOrder: chapter.partOf.webNovel!.order ?? -1,
              webNovelWords: chapter.partOf.webNovel!.totalWords ?? 0,
              eBookOrder: chapter.partOf.eBook?.order ?? -1,
              audioBookOrder: chapter.partOf.audioBook?.order ?? -1,
              webVolumeId,
              eBookId,
              audioBookId,
            },
          );
      }),
    )
  );
} catch (error) {
  console.log(error);
} finally {
  await session.close();
}

db.close();
