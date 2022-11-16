#!/usr/bin/env -S deno run --allow-env --allow-net --allow-read --allow-write

import "std/dotenv/load.ts";
import { stringify } from "std/encoding/csv.ts";
import { crypto, DigestAlgorithm, toHashString } from "std/crypto/mod.ts";

import { extractSeededData } from "../../utils/extractSeededData.ts";
import { MentionedBracketContentsPerChapter } from "../../types/brackets.ts";
import { SeedDataFiles } from "../../constants/brackets.ts";

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

const dumpToFile = async (
  dir: string,
  fileName: string,
  content: string,
): Promise<void> => {
  await Deno.mkdir(dir, { recursive: true });
  await Deno.writeTextFile(`${dir}/${fileName}`, content);
};

const allBracketsPerChapter = await getBracketsPerChapter();

interface ContentAndHash {
  [key: string]: string;
  content: string;
  hash: string;
}

const setBracketContentHash = new Set<string>();
const listContentAndHash: ContentAndHash[] = [];
for (const bracketsPerChapter of allBracketsPerChapter) {
  const bracketContents = bracketsPerChapter.mentions ?? [];
  for (const bracketContent of bracketContents) {
    const hash = await computeHash(bracketContent);
    if (!setBracketContentHash.has(hash)) {
      setBracketContentHash.add(hash);
      listContentAndHash.push({ content: bracketContent, hash });
    }
  }
}

console.log(
  `Found ${setBracketContentHash.size} unique bracket(s) from ${allBracketsPerChapter.length} chapter(s)`,
);

listContentAndHash.sort((a, b) => {
  return a.content.localeCompare(b.content, undefined, {
    sensitivity: "base",
  });
});

try {
  const text = stringify(listContentAndHash, {
    separator: "|",
    headers: true,
    columns: ["content", "hash"],
  });

  dumpToFile("data/brackets", "all.csv", text);
} catch (error) {
  console.log(error);
}
