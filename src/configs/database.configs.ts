import { NODE_ENV } from "../constants";
import { ENV } from "./env.configs";

export const databaseConfig = {
  host: ENV.DB_HOST,
  port: parseInt(ENV.DB_PORT, 10),
  database: ENV.DB_NAME,
  user: ENV.DB_USER,
  password: ENV.DB_PASSWORD,
  max: parseInt(ENV.DB_MAX_CONNECTIONS, 10),
  idleTimeoutMillis: parseInt(ENV.DB_IDLE_TIMEOUT, 10),
  connectionTimeoutMillis: parseInt(ENV.DB_CONNECTION_TIMEOUT, 10),
  ssl:
    ENV.NODE_ENV === NODE_ENV.PRODUCTION
      ? { rejectUnauthorized: false }
      : false,
};
