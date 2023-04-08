import { createLogger, format, transports } from "winston";
const { combine, printf } = format;

const customFormat = printf(({ level, message, label, timestamp }) => {
  return `${message}`;
});

export const logger = createLogger({
  format: combine(customFormat),
  transports: [new transports.Console()],
});
