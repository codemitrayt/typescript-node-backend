import "reflect-metadata";
import { DataSource } from "typeorm";
import { ENV } from "./env.config";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: ENV.DATABASE_URL,
  host: ENV.DB_HOST,
  port: Number(ENV.DB_PORT),
  username: ENV.DB_USER,
  password: ENV.DB_PASSWORD,
  database: ENV.DB_NAME,
  ssl: ENV.DB_SSL === "true" ? { rejectUnauthorized: false } : false,

  synchronize: false,
  logging: false,
  entities: ["src/entities/**/*.ts"],
  migrations: ["src/migrations/**/*.ts"],
  subscribers: [],
});
