#!/usr/bin/env node

import fs from "node:fs/promises";
import { argv } from "node:process";
import path from "node:path";
import { timeToWatch } from "./libs/chokidar.js";
import config from "./utils/config.js";
import { typeCheck } from "./libs/typescript.js";
import { logger } from "./utils/logger.js";
import isValid from "is-valid-path";
import { fileURLToPath } from "node:url";

["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, async () => {
    await config.killChild();
    process.exit(0);
  });
});

if (argv.length === 2) {
  logger.error("Need a source file!");
  process.exit(1);
}

const [, , src] = argv;

const sourcePath = path.resolve(process.cwd(), src);

await fs.stat(sourcePath).catch(() => {
  logger.error("Source file doesn't exists!");
  process.exit(1);
});

if (argv.includes("--noTypeCheck")) {
  config.setArgv("--noTypeCheck", true);
} else await config.setTsConfig();

if (argv.includes("--build")) {
  const outBuild = process.argv[process.argv.indexOf("--build") + 1];
  if (!outBuild) {
    logger.error("A outdir is needed!");
    process.exit(1);
  }

  const outPath = path.resolve(process.cwd(), outBuild);

  if (!isValid(outPath)) {
    logger.error("Give a valid outdir!");
    process.exit(1);
  }

  config.setArgv("--out-dir", outPath);

  config.setArgv("--build", true);
}

if (argv.includes("--bundle")) {
  const outBundle = process.argv[process.argv.indexOf("--bundle") + 1];
  if (!outBundle) {
    logger.error("A out-file is needed!");
    process.exit(1);
  }

  const bundlePath = path.resolve(process.cwd(), outBundle);

  config.setArgv("--out-bundle", bundlePath);

  config.setArgv("--bundle", true);
}

const aux = path.parse(fileURLToPath(import.meta.url))["dir"];

config.setHookPath(path.resolve(aux, "./hooks/hooks.js"));

config.setSourcePath(sourcePath);

if (!argv.includes("--watch")) {
  if (argv.includes("--noTypeCheck")) {
    await config.setChild();
  } else {
    const res = typeCheck([sourcePath], config.getTsConfig());
    if (!res) process.exit(1);
    await config.setChild();
  }
} else if (argv.includes("--watch")) {
  config.setArgv("--watch", true);
  await timeToWatch(path.parse(sourcePath));
}
