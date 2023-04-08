import { fileURLToPath } from "node:url";
import swc from "@swc/core";
import { handleSaveJsFile } from "../utils/fs.js";
import {
  dirname,
  extname,
  join,
  parse,
  resolve as resolvePath,
} from "node:path";
import config from "./config.js";
import { findSwcrc } from "../libs/swc.js";
import fs from "node:fs/promises";
import { logger } from "../utils/logger.js";
import esbuild from "esbuild";
import { esbuildDecorators } from "@anatine/esbuild-decorators";

const swcrc = await findSwcrc();
const extensionsRegex = /\.m?ts$/;
let build = false;

let outDir;

let bundle = false;

let outBundle;

let isBundled = false;

const packageModules = [];

if (process.argv.includes("--build-the-proyect-couse-the-user-wants!")) {
  build = true;
  outDir =
    process.argv[
      process.argv.indexOf("--build-the-proyect-couse-the-user-wants!") + 1
    ];

  process.argv = process.argv.filter(
    (v) => v !== "--build-the-proyect-couse-the-user-wants!" && v !== outDir
  );
}

if (process.argv.includes("--lets-bundle-this-project!")) {
  bundle = true;

  outBundle =
    process.argv[process.argv.indexOf("--lets-bundle-this-project!") + 1];

  process.argv = process.argv.filter(
    (v) => v !== "--lets-bundle-this-project!" && v !== outBundle
  );
}

let decoratorsMetaData = {
  name: "decorators-meta-data",
  setup(build) {
    build.onLoad({ filter: /ts$/ }, async (args) => {
      const { code } = await swc.transformFile(args.path);
      return {
        contents: code,
        loader: "js",
      };
    });
  },
};

export async function load(url, context, nextLoad) {
  if (extensionsRegex.test(url)) {
    const parseUrl = parse(fileURLToPath(url));

    const { code, map } = await swc.transformFile(fileURLToPath(url), {
      ...swcrc,
      filename: parseUrl.name,
    });

    if (build && !bundle) {
      if (!config.getConf()["basePath"]) {
        config.setConf("basePath", parseUrl.dir);
      }

      const aux = parseUrl.dir.split(config.getConf()["basePath"])[1];

      const newPath = join(outDir, aux);

      const newFullPath = resolvePath(
        newPath,
        parseUrl.name + parseUrl.ext.replace(/ts$/g, "js")
      );

      await handleSaveJsFile({ code, map }, newFullPath);
    }

    if (bundle && !build && !isBundled) {
      const filePath = fileURLToPath(url);
      const parsePath = parse(filePath);
      if (!packageModules.length) {
        await getPackageModules(url);
      }
      const fileName = parsePath.name + parsePath.ext;

      await esbuild.build({
        entryPoints: [filePath],
        write: true,
        platform: "node",
        bundle: true,
        packages: "external",
        target: "node14.8",
        format: "esm",
        plugins: [decoratorsMetaData],
        sourcemap: swcrc.sourceMaps ? true : false,
        outfile: outBundle,
        minify: swcrc.minify ? true : false,
      });

      isBundled = true;
    }

    return {
      format: "module",
      shortCircuit: true,
      source: code,
    };
  }

  context.format ||= "commonjs";

  return nextLoad(url, context);
}

async function getPackageModules(url) {
  const isFilePath = !!extname(url);
  const dir = isFilePath ? dirname(fileURLToPath(url)) : url;

  const packagePath = resolvePath(dir, "package.json");

  const data = await fs
    .readFile(packagePath, { encoding: "utf8" })
    .then((file) => JSON.parse(file))
    .catch((e) => {
      if (e?.code !== "ENOENT") logger.error(e);
    });

  if (data) {
    if (data.dependencies) {
      Object.keys(data.dependencies).forEach((d) => {
        if (!packageModules.includes(d)) {
          packageModules.push(d);
        }
      });
    }

    if (data.devDependencies) {
      Object.keys(data.devDependencies).forEach((d) => {
        if (!packageModules.includes(d)) {
          packageModules.push(d);
        }
      });
    }

    if (data.peerDependencies) {
      Object.keys(data.peerDependencies).forEach((d) => {
        if (!packageModules.includes(d)) {
          packageModules.push(d);
        }
      });
    }
  }

  return dir.length > 1 && (await getPackageModules(resolvePath(dir, "..")));
}
