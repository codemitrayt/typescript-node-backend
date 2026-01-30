import { db } from "./db";
import { logger } from "./logger";
import { AppService } from "./services";

const serverApp = new AppService();
serverApp.start();

process.on("SIGTERM", async () => {
  logger.info("SIGTERM signal received: closing HTTP server");
  await db.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("SIGINT signal received: closing HTTP server");
  await db.close();
  process.exit(0);
});

export default serverApp.getApp();
