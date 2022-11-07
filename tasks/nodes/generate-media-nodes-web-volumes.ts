#!/usr/bin/env -S deno run --allow-env --allow-net --allow-read --allow-write

import "std/dotenv/load.ts";
import { stringify as convertToYaml } from "std/encoding/yaml.ts";

import { extractSeededData } from "../../utils/extractSeededData.ts";
import { WebVolume } from "../../types/media.ts";
import { WebVolumeNode } from "../../types/nodes.ts";
import { SeedDataFiles } from "../../constants/media.ts";

const getItems = async (): Promise<WebVolume[]> => {
  const data = await extractSeededData<WebVolume[]>(
    SeedDataFiles.TWI_WEBNOVEL_VOLUMES,
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
  const volumes = await getItems();
  console.log(`Processing ${volumes.length} item(s).`);

  const promises: Promise<void>[] = [];
  for (const volume of volumes) {
    console.log(
      `Processing: Web Volume ${volume.index}: ${volume.title}`,
    );

    const node: WebVolumeNode = {
      id: volume.id,
      index: volume.index,
      title: volume.title,
      wikiUrl: volume.wikiUrl,
    };
    const text = convertToYaml(node);
    promises.push(dumpToFile("nodes/WebVolume/", `${volume.id}.inn`, text));
  }

  await Promise.all(promises);
} catch (error) {
  console.log(error);
}
