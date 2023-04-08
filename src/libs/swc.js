import path from "node:path";
import fs from "node:fs/promises";

export async function findSwcrc() {
  let swcrcOptions = {
    jsc: {
      parser: {
        syntax: "typescript",
        tsx: false,
        decorators: true,
      },
      target: "esnext",
      transform: {
        decoratorMetadata: true,
      },
      loose: false,
    },
    module: {
      type: "nodenext",
    },
    isModule: true,
  };

  let swcrcDir = path.join(process.cwd(), ".swcrc");
  try {
    let swcrcContent = (await fs.readFile(swcrcDir)).toString();
    return JSON.parse(swcrcContent);
  } catch (e) {
    await fs.writeFile(swcrcDir, JSON.stringify(swcrcOptions));
    return swcrcOptions;
  }
}
