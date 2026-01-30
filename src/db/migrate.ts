import * as fs from "fs";
import * as path from "path";

import { db } from "./pool";
import { logger } from "../logger";

async function runMigrations() {
  try {
    // Create migrations table
    await db.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT NOW()
      )
    `);

    const migrationsDir = path.join(__dirname, "migrations");
    const files = fs.readdirSync(migrationsDir).sort();

    for (const file of files) {
      if (!file.endsWith(".sql")) continue;

      const migrationName = file.replace(".sql", "");

      // Check if already executed
      const result = await db.query(
        "SELECT * FROM migrations WHERE name = $1",
        [migrationName],
      );

      if (result.rows.length === 0) {
        logger.info(`Running migration: ${migrationName}`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");

        await db.transaction(async (client) => {
          await client.query(sql);
          await client.query("INSERT INTO migrations (name) VALUES ($1)", [
            migrationName,
          ]);
        });

        logger.info(`✓ Migration completed: ${migrationName}`);
      }
    }

    logger.info("All migrations completed");
  } catch (error) {
    logger.error("Migration error:", error);
    throw error;
  } finally {
    await db.close();
  }
}

runMigrations();
