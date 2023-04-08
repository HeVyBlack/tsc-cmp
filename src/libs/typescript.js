import ts from "typescript";
import fs from "node:fs/promises";
import path from "path";
import { logger } from "../utils/logger.js";

export async function readDefaultTsConfig(
  tsConfigPath = path.join(process.cwd(), "tsconfig.json")
) {
  const baseCompilerOptions = {
    target: "ESNext",
    module: "NodeNext",
    moduleResolution: "NodeNext",
    allowImportingTsExtensions: true,
    noEmit: true,
    strict: true,
    experimentalDecorators: true,
    emitDecoratorMetadata: true,
    strictPropertyInitialization: false,
  };

  const { options } = ts.convertCompilerOptionsFromJson(
    baseCompilerOptions,
    process.cwd()
  );

  if (!tsConfigPath) {
    return baseCompilerOptions;
  }

  let compilerOptions = options;

  const fullTsConfigPath = path.resolve(tsConfigPath);

  if (!(await fs.stat(fullTsConfigPath).catch(() => {}))) {
    await fs.writeFile(
      fullTsConfigPath,
      JSON.stringify({ compilerOptions: baseCompilerOptions })
    );

    return compilerOptions;
  }

  try {
    const { config } = ts.readConfigFile(fullTsConfigPath, ts.sys.readFile);

    const { options, errors, fileNames } = ts.parseJsonConfigFileContent(
      config,
      ts.sys,
      path.dirname(fullTsConfigPath)
    );
    if (!errors.length) {
      compilerOptions = options;
      compilerOptions.files = fileNames;
    } else {
      logger.error(
        `Convert compiler options from json failed, ${errors
          .map((d) => d.messageText)
          .join("\n")}`
      );
    }
  } catch (e) {
    logger.error(`Read ${tsConfigPath} failed: ${e.message}`);
  }

  compilerOptions.configFilePath = path.join(process.cwd(), "tsconfig.json");

  return compilerOptions;
}

export function typeCheck(fileNames, options) {
  const program = ts.createProgram(fileNames, options);

  let allDiagnostics = ts.getPreEmitDiagnostics(program);

  if (!allDiagnostics.length) {
    return true;
  } else {
    logger.info(
      ts.formatDiagnosticsWithColorAndContext(allDiagnostics, {
        getCurrentDirectory: () => process.cwd(),
        getCanonicalFileName: ts.sys.useCaseSensitiveFileNames
          ? (filename) => filename
          : (filename) => filename.toLowerCase(),
        getNewLine: () => ts.sys.newLine,
      })
    );
    return false;
  }
}
