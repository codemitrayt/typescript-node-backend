import morgan from "morgan";

import { ENV } from "../configs";
import { logger } from "../logger";
import { NODE_ENV } from "../constants";

const stream = {
  write: (message: string) => logger.http(message.trim()),
};

const skip = () => {
  const env = ENV.NODE_ENV;
  return env !== NODE_ENV.DEVELOPMENT;
};

export const morganMiddleware = morgan(
  ":remote-addr :method :url :status - :response-time ms",
  { stream, skip },
);
