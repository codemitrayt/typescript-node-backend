import { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";
import { databaseConfig } from "../configs/database.configs";
import { logger } from "../logger";

export class Database {
  private pool: Pool;

  constructor() {
    this.pool = new Pool(databaseConfig);

    // Event handlers for monitoring
    this.pool.on("connect", () => {
      logger.info("Database connection established");
    });

    this.pool.on("error", (err) => {
      logger.error("Unexpected database error:", err);
      process.exit(-1);
    });
  }

  // Basic query method
  async query<T extends QueryResultRow>(
    text: string,
    params?: unknown[],
  ): Promise<QueryResult<T>> {
    const start = Date.now();
    try {
      const result = await this.pool.query<T>(text, params);
      const duration = Date.now() - start;
      logger.info({
        msg: "Executed query",
        data: { text, duration, rows: result.rowCount },
      });
      return result;
    } catch (error) {
      logger.error({
        msg: "Database query error:",
        error: JSON.stringify(error),
      });
      throw error;
    }
  }

  // Transaction support
  async transaction<T>(
    callback: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const result = await callback(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  // Get a client for multiple queries
  async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  // Graceful shutdown
  async close(): Promise<void> {
    await this.pool.end();
    logger.info({ msg: "Database pool has ended" });
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.query("SELECT NOW()");
      return result.rows.length > 0;
    } catch (error) {
      logger.error({
        msg: "Health check failed:",
        error: JSON.stringify(error),
      });
      return false;
    }
  }
}

export const db = new Database();
