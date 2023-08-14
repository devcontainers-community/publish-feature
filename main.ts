#!/usr/bin/env node
import { readFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import process from "node:process"
import { $ } from "execa"
import * as core from "@actions/core"
import { temporaryFile, temporaryWrite } from 'tempy';

const image = core.getInput("image");
const files = core.getMultilineInput("files").map(x => fglob())
const repository = core.getInput("repository");
const githubServerURL = core.getInput("github_server_url");

const devcontainerFeature = await readFile("devcontainer-feature.json")

const config = {
  mediaType: "application/vnd.devcontainers",
};
const annotations = {
  "$manifest": {
    "com.github.package.type": "devcontainer_collection",
    "dev.containers.metadata": JSON.stringify(devcontainerFeature),
    "org.opencontainers.image.source": githubServerURL + "/" + repository,
  }
}

const archivePath = temporaryFile();
await $`tar -cvf ${archivePath} ${files}`;

const configPath = temporaryWrite(JSON.stringify(config), { extension: "json" });
const annotationsPath = temporaryWrite(JSON.stringify(annotations), { extension: "json" });
await $`oras push \
  --config ${configPath} \
  --annotation-file ${annotationsPath} \
  ${image}:${tag} \
  ${archivePath}:application/vnd.devcontainers.layer.v1+tar`
