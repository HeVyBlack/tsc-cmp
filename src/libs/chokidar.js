import chokidar from "chokidar";
import config from "../utils/config.js";
import { typeCheck } from "./typescript.js";

export async function timeToWatch({ dir, base, ext, name }) {
  if (config.getArgv()["--noTypeCheck"]) {
    const watcher = watchNoTs(dir);
  } else {
    await watchTs(dir);
  }
}

async function watchNoTs(dir) {
  const watcher = chokidar.watch(dir, {
    persistent: true,
  });

  watcher.on("change", async () => {
    await config.killChild();
    console.clear();
    await config.setChild();
  });

  watcher.on("ready", async () => {
    await config.setChild();
    watcher.on("add", async () => {
      await config.killChild();
      console.clear();
      await config.setChild();
    });
  });
}

async function watchTs(dir) {
  const watcher = chokidar.watch(dir, { persistent: true });
  watcher.on("change", async () => {
    await config.killChild();
    console.clear();
    const res = typeCheck([config.getSourcePath()], config.getTsConfig());
    if (res) await config.setChild();
  });
  watcher.on("ready", async () => {
    const res = typeCheck([config.getSourcePath()], config.getTsConfig());
    if (res) await config.setChild();
    watcher.on("add", async () => {
      await config.killChild();
      console.clear();
      const res = typeCheck([config.getSourcePath()], config.getTsConfig());
      if (res) await config.setChild();
    });
  });
}
