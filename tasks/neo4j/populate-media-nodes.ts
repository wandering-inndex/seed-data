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
          .run(
            `
MERGE (webVolume:WebVolume {
  id: $id,
  index: $index,
  title: $title
})
ON CREATE
  SET webVolume.created = timestamp()
RETURN webVolume.id AS id
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
          .run(
            `
MERGE (electronicBook:ElectronicBook {
  id: $id,
  index: $index,
  title: $title
})
ON CREATE
  SET electronicBook.created = timestamp()
RETURN electronicBook.id AS id
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
          .run(
            `
MERGE (audioBook:AudioBook {
  id: $id,
  index: $index,
  title: $title
})
ON CREATE
  SET audioBook.created = timestamp()
RETURN audioBook.id AS id
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
          .run(
            `
MATCH (webVolume:WebVolume {id: $webVolumeId})
${eBookId !== "" ? eBookQueryMatch : ""}
${audioBookId !== "" ? audioBookQueryMatch : ""}
MERGE (chapter:Chapter {
  id: $id,
  webNovelTitle: $webNovelTitle,
  webNovelOrder: $webNovelOrder,
  eBookOrder: $eBookOrder,
  audioBookOrder: $audioBookOrder
})
MERGE (chapter)-[:PART_OF]->(webVolume)
ON CREATE
  SET chapter.created = timestamp()
${eBookId !== "" ? eBookQueryMerge : ""}
${audioBookId !== "" ? audioBookQueryMerge : ""}
RETURN chapter.id AS id
          `,
            {
              id: chapter.id,
              webNovelTitle: chapter.partOf.webNovel!.title ?? "",
              webNovelOrder: chapter.partOf.webNovel!.order ?? -1,
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
