import { Database } from "../../db";

export interface User {
  id: number;
  email: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export class UserService {
  constructor(private db: Database) {}

  async findById(id: number): Promise<User | null> {
    const result = await this.db.query<User>(
      "SELECT * FROM users WHERE id = $1",
      [id],
    );
    return result.rows[0] || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db.query<User>(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );
    return result.rows[0] || null;
  }

  async create(email: string, name: string): Promise<User> {
    const result = await this.db.query<User>(
      `INSERT INTO users (email, name, created_at, updated_at)
       VALUES ($1, $2, NOW(), NOW())
       RETURNING *`,
      [email, name],
    );
    return result.rows[0];
  }

  async update(id: number, name: string): Promise<User | null> {
    const result = await this.db.query<User>(
      `UPDATE users 
       SET name = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [name, id],
    );
    return result.rows[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.db.query("DELETE FROM users WHERE id = $1", [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async findAll(limit = 100, offset = 0): Promise<User[]> {
    const result = await this.db.query<User>(
      "SELECT * FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2",
      [limit, offset],
    );
    return result.rows;
  }
}
