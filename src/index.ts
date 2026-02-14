import { AppService } from "./services";

const serverApp = new AppService();
serverApp.start();

import { AppDataSource } from "./config";
import { logger } from "./logger";

AppDataSource.initialize()
  .then(() => {
    logger.info("Database connected successfully");
  })
  .catch((error) => {
    logger.error("Database connection failed:", error);
  });

export default serverApp.getApp();
