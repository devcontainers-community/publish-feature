#!/usr/bin/env -S deno run -A
import { readFile } from "node:fs/promises";
import process from "node:process";
import { $ } from "npm:zx";
import * as core from "npm:@actions/core";
import { temporaryFile, temporaryWrite } from "npm:tempy";
import fg from "npm:fast-glob";

const path = core.getInput("path");
const files = core.getMultilineInput("files");
const source = core.getInput("source");
const image = core.getInput("image");
const latest = core.getBooleanInput("latest");

process.chdir(path);
$.cwd = process.cwd();

const fileList = await fg(files, { ignore: [".git/**"], dot: true });

const archivePath = temporaryFile();
await $`tar -cvf ${archivePath} ${fileList}`;

const devcontainerFeature = JSON.parse(
  await readFile("devcontainer-feature.json", "utf8")
);

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
