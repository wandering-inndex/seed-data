#!/usr/bin/env -S deno run --allow-env --allow-net --allow-read --allow-write

import "std/dotenv/load.ts";
import { parse as parseArgs } from "std/flags/mod.ts";
import { parse as parsePath } from "std/path/posix.ts";

const getFileNames = async (currentPath: string): Promise<string[]> => {
  const fileNames: string[] = [];

  for await (const entry of Deno.readDir(currentPath)) {
    const entryPath = `${currentPath}/${entry.name}`;
    if (entry.isDirectory) {
      const childFileNames = await getFileNames(entryPath);
      fileNames.push(...childFileNames);
    } else if (entry.isFile) {
      fileNames.push(entryPath);
    }
  }

  return fileNames;
};

const extractIdFromPath = (filePath: string): string => {
  const file = parsePath(filePath);
  return file.name;
};

const dumpToFile = async (
  dir: string,
  fileName: string,
  content: string,
): Promise<void> => {
  await Deno.mkdir(dir, { recursive: true });
  await Deno.writeTextFile(`${dir}/${fileName}`, content);
};

const REGEX_INSIDE_BRACKETS = /\[(?<content>[^\]\[]+)\]/gm;
// Uncomment to get the broken brackets:
// const REGEX_BROKEN_BRACKETS = /\[(?<content>[^…—\]\[]+(—|…))/gm;

const getResults = (text: string, rule: RegExp): string[] => {
  const uniqueItems = new Set<string>();
  (text.match(rule) || []).forEach((result) => {
    uniqueItems.add(result.trim());
  });
  const results: string[] = [];
  for (const result of uniqueItems.values()) {
    results.push(result);
  }
  return results.sort();
};

try {
  const args = parseArgs(Deno.args);

  const inDir = (args["in"] ? args["in"] : "").trim();
  const outDir = (args["out"] ? args["out"] : "").trim();
  if (inDir === "" || outDir === "") {
    console.error("Must provide --in and --out arguments.");
    Deno.exit(1);
  }

  const decoder = new TextDecoder("utf-8");
  const files = await getFileNames(inDir);

  console.log(`Processing ${files.length} item(s):`);

  const keys: string[] = [];
  const results = new Map<string, string[]>();
  for (const file of files) {
    const id = extractIdFromPath(file);
    const rawInput = await Deno.readFile(file);
    const decodedText = decoder.decode(rawInput);

    const matches = getResults(decodedText, REGEX_INSIDE_BRACKETS);
    results.set(id, matches);
    keys.push(id);
  }

  let output = "";
  const sortedKeys = keys.sort();
  for (const key of sortedKeys) {
    output += '- id: "' + key + '"\n';
    output += "  mentions:\n";
    const matches = results.get(key) ?? [];
    for (const match of matches) {
      output += '    - "' + match + '"\n';
    }
  }

  const dir = `${outDir}`;
  await dumpToFile(dir, `per-chapters.yaml`, output);
} catch (e) {
  console.error(e);
}
