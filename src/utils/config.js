import { readDefaultTsConfig } from "../libs/typescript.js";
import CHILD from "./child.js";
import { logger } from "./logger.js";
let hookPath;
let sourcePath;
let child;
let tsConfig;

export function getTsConfig() {
  return tsConfig;
}

const args = {};
class Config {
  constructor() {}

  async setTsConfig() {
    tsConfig = await readDefaultTsConfig();
  }

  setArgv(name, value) {
    args[name] = value;
  }
  getArgv() {
    return args;
  }
  setHookPath(p) {
    hookPath = p;
  }
  getHookPath() {
    return hookPath;
  }
  setSourcePath(p) {
    sourcePath = p;
  }
  getSourcePath() {
    return sourcePath;
  }
  async setChild() {
    const file = this.getSourcePath();
    if (!file) {
      logger.error("Source path doesn't exists!");
      process.exit(1);
    }

    const hook = this.getHookPath();

    const args = [
      "--enable-source-maps",
      "--no-warnings",
      "--loader",
      hook,
      file,
    ];

    if (this.getArgv()["--build"]) {
      args.push("--build-the-proyect-couse-the-user-wants!");
      args.push(this.getArgv()["--out-dir"]);
    }

    if (this.getArgv()["--bundle"]) {
      args.push("--lets-bundle-this-project!");
      args.push(this.getArgv()["--out-bundle"]);
    }

    child = await CHILD(args);
  }
  async killChild() {
    if (!child) return;
    await child.kill();
  }
  getTsConfig() {
    return tsConfig;
  }
}

const config = new Config();

export default config;
