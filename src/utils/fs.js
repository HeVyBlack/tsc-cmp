import fs from "node:fs/promises";
import path from "node:path";
import { logger } from "./logger.js";

async function createDir(dir) {
  await fs.mkdir(dir).catch(async (e) => {
    if (e?.code === "ENOENT") {
      await createDir(path.resolve(dir, ".."));
      await createDir(dir);
    } else if (e?.code === "EEXIST") {
    } else console.error(e);
  });
}

export async function handleSaveJsFile({ code, map }, out) {
  const fileInfo = path.parse(out);
  await createDir(fileInfo.dir);

  if (map) {
    const mapExt = fileInfo.ext.concat(".map");
    const mapName = fileInfo.name + mapExt;
    const mapPath = path.resolve(fileInfo.dir, mapName);
    code += `\n//# sourceMappingURL=${mapName}`;
    await fs.writeFile(mapPath, map);
  }

  await fs.writeFile(out, code.replace(/.ts";/g, '.js";')).catch((e) => {
    if (e.code === "ENOTDIR") {
      logger.error(
        "Out dir can't be create, couse its name is be using by a file!"
      );
      process.exit(1);
    }
  });
}
