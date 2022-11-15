#!/usr/bin/env -S deno run --allow-env --allow-net --allow-read --allow-write

// deno-lint-ignore-file no-explicit-any

import "std/dotenv/load.ts";
import { crypto, DigestAlgorithm, toHashString } from "std/crypto/mod.ts";

import { ManagedTransaction, Result } from "neo4j";

import { extractSeededData } from "../../utils/extractSeededData.ts";
import { MentionedBracketContentsPerChapter } from "../../types/brackets.ts";
import { SeedDataFiles } from "../../constants/brackets.ts";
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

const computeHash = async (text: string): Promise<string> => {
  // We only need a simple hash for this, so we will use SHA-1.
  const algorithm: DigestAlgorithm = "SHA-1";
  const hash = await crypto.subtle.digest(
    algorithm,
    new TextEncoder().encode(text),
  );
  return toHashString(hash);
};

const getBracketsPerChapter = async (): Promise<
  MentionedBracketContentsPerChapter[]
> => {
  const data = await extractSeededData<MentionedBracketContentsPerChapter[]>(
    SeedDataFiles.BRACKETS_PER_CHAPTER,
  );
  return data;
};

const createNodeTransaction = (
  tx: ManagedTransaction,
  bracketContentId: string,
  bracketContent: string,
): Result<any> => {
  const query = `
    MERGE (bracketContent:BracketContent {
      id: $id,
      content: $content
    })
    ON CREATE
      SET bracketContent.created = timestamp()
    RETURN bracketContent.id AS id
    `;

  return tx.run(query, {
    id: bracketContentId,
    content: bracketContent,
  });
};

const createRelationshipTransaction = (
  tx: ManagedTransaction,
  chapterId: string,
  bracketContentId: string,
): Result<any> => {
  const query = `
MERGE (bc:BracketContent {id: $bracketContentId})
MERGE (ch:Chapter {id: $chapterId})
MERGE (bc)-[:MENTIONED_IN]->(ch)
RETURN bc.id, ch.id
`;

  return tx.run(query, {
    bracketContentId,
    chapterId,
  });
};

const allBracketsPerChapter = await getBracketsPerChapter();

const mapBracketContents = new Map<string, string>();
for (const bracketsPerChapter of allBracketsPerChapter) {
  const bracketContents = bracketsPerChapter.mentions ?? [];
  for (const bracketContent of bracketContents) {
    const hash = await computeHash(bracketContent);
    if (!mapBracketContents.has(hash)) {
      mapBracketContents.set(hash, bracketContent);
    }
  }
}

console.log(
  `Found ${mapBracketContents.size} unique bracket(s) from ${allBracketsPerChapter.length} chapter(s)`,
);

const keysOfBracketContents: string[] = [];
mapBracketContents.forEach((_value, key) => {
  keysOfBracketContents.push(key);
});

const sessionCreateNodes = db.session();
try {
  await sessionCreateNodes.executeWrite((tx) => {
    const allPromises: Result<any>[] = [];

    for (const key of keysOfBracketContents) {
      const content = mapBracketContents.get(key) ?? "";
      allPromises.push(createNodeTransaction(tx, key, content));
    }

    console.log(`Upserting ${allPromises.length} node(s)...`);

    return Promise.all(allPromises);
  });
} catch (error) {
  console.log(error);
} finally {
  await sessionCreateNodes.close();
}

const sessionCreateRelationships = db.session();
try {
  await sessionCreateRelationships.executeWrite(async (tx) => {
    const allPromises: Result<any>[] = [];

    for (const bracketsPerChapter of allBracketsPerChapter) {
      const chapterId = bracketsPerChapter.id;
      const bracketContents: string[] = bracketsPerChapter.mentions ?? [];
      for (const bracketContent of bracketContents) {
        const bracketContentId = await computeHash(bracketContent);
        allPromises.push(
          createRelationshipTransaction(tx, chapterId, bracketContentId),
        );
      }
    }

    console.log(`Upserting ${allPromises.length} relationship(s)...`);

    return Promise.all(allPromises);
  });
} catch (error) {
  console.log(error);
} finally {
  await sessionCreateRelationships.close();
}

db.close();
