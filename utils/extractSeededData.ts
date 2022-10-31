import { parse as parseYaml } from "std/encoding/yaml.ts";

export const extractSeededData = async <T = unknown>(
  filename: string,
): Promise<T> => {
  const rawData = await Deno.readTextFile(filename);
  const data = parseYaml(rawData) as T;
  return data;
};
