#!/usr/bin/env -S deno run -A
import { readFile } from "node:fs/promises";
import process from "node:process";
import { $ } from "npm:zx";
import * as core from "npm:@actions/core";
import { temporaryFile, temporaryWrite } from "npm:tempy";
import { glob } from "npm:glob";

const path = core.getInput("path");
const files = core.getMultilineInput("files");
const source = core.getInput("source");
const latest = core.getBooleanInput("latest");

process.chdir(path);
$.cwd = process.cwd();

const fileList = await glob(files.concat("[Rr][Ee][Aa][Dd][Mm][Ee].{md,mdown,markdown}", "[Ll][Ii][CcSs][Ee][Nn][CcSs][Ee]*", "devcontainer-feature.json"), { ignore: [".git/**"], dot: true });

const archivePath = temporaryFile();
await $`tar -cvf ${archivePath} ${fileList}`;

const devcontainerFeature = JSON.parse(
  await readFile("devcontainer-feature.json", "utf8")
);

const image = core.getInput("image").replace("*", devcontainerFeature.id);

const annotations = {
  $manifest: {
    "com.github.package.type": "devcontainer_feature",
    "dev.containers.metadata": JSON.stringify(devcontainerFeature),
    "org.opencontainers.image.source": source,
  },
  [archivePath]: {
    "org.opencontainers.image.title": `devcontainer-feature-${devcontainerFeature.id}.tgz`,
  },
};
const annotationsPath = await temporaryWrite(JSON.stringify(annotations), {
  extension: "json",
});

await $`oras push \
  --config /dev/null:application/vnd.devcontainers \
  --annotation-file ${annotationsPath} \
  ${image}:${devcontainerFeature.version} \
  ${archivePath}:application/vnd.devcontainers.layer.v1+tar`;

const [major, minor, patch] = devcontainerFeature.version
  .split(".")
  .map((x) => parseInt(x));

await $`oras tag \
  ${image}:${devcontainerFeature.version} \
  ${image}:${major}.${minor}`;

await $`oras tag \
  ${image}:${devcontainerFeature.version} \
  ${image}:${major}`;

if (latest) {
  await $`oras tag \
    ${image}:${devcontainerFeature.version} \
    ${image}:latest`;
}

for (const id of devcontainerFeature.legacyIds ?? []) {
  const legacyImage = core.getInput("image").replace("*", id);
  if (legacyImage === image) {
    continue;
  }

  await $`oras push \
    --config /dev/null:application/vnd.devcontainers \
    --annotation-file ${annotationsPath} \
    ${legacyImage}:${devcontainerFeature.version} \
    ${archivePath}:application/vnd.devcontainers.layer.v1+tar`;
  
  const [major, minor, patch] = devcontainerFeature.version
    .split(".")
    .map((x) => parseInt(x));
  
  await $`oras tag \
    ${legacyImage}:${devcontainerFeature.version} \
    ${legacyImage}:${major}.${minor}`;
  
  await $`oras tag \
    ${legacyImage}:${devcontainerFeature.version} \
    ${legacyImage}:${major}`;
  
  if (latest) {
    await $`oras tag \
      ${legacyImage}:${devcontainerFeature.version} \
      ${legacyImage}:latest`;
  }
}
