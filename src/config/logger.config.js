import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import winston from "winston";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDir = path.resolve(__dirname, "./../../../logs");

if (!fs.existsSync(logDir)) {
  console.log("Creating logs directory outside 'userprofileservice'...");
  fs.mkdirSync(logDir);
}

const logger = winston.createLogger({
  level: "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, "user_profile_service_error.log"),
      level: "error",
    }),
    new winston.transports.File({
      filename: path.join(logDir, "user_profile_service.log"),
    }),
  ],
});

export default logger;
