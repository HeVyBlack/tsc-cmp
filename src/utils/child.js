import { spawn } from "node:child_process";
import { execPath } from "node:process";
import { logger } from "./logger.js";
const CHILD = async function (args) {
  let child;
  child = spawn(execPath, args, {
    stdio: "inherit",
  });
  child.on("message", (data) => {
    logger.info(data);
  });
  child.on("error", (data) => {
    logger.error(data);
  });

  return child;
};

export default CHILD;
