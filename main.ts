#!/usr/bin/env -S deno run -A
import { readFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import process from "node:process"
import { $ } from "execa"
import * as core from "@actions/core"
import { temporaryFile } from 'tempy';

const image = core.getInput("image");
const files = core.getInput("files").split(/,?\s+/g).filter(x => existsSync(x));
const repository = core.getInput("repository");

const config = {
  mediaType: "application/vnd.devcontainers"
}
const annotations = {
  "$config": {
    "hello": "world"
  },
  "$manifest": {
    "foo": "bar"
  },
  "cake.txt": {
    "fun": "more cream"
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
