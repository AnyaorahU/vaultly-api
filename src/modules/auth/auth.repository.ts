import { pool } from "../../config/database";
import { CreateUserInput, SafeUser, User } from "../../types";

const getUserByEmail = async (email: string): Promise<User | null> => {
  const result = await pool.query<User>(
    `SELECT id, name, email, password, role, created_at, updated_at FROM users
        WHERE email = $1`,
    [email],
  );

  return result.rows[0] || null;
};

const getUserById = async (id: string): Promise<SafeUser> => {
  const result = await pool.query<SafeUser>(
    `
    SELECT id, name, email, role, created_at, updated_at FROM users
    WHERE id = $1
    `,
    [id],
  );

  return result.rows[0];
};

const createUser = async ({
  name,
  email,
  password,
}: CreateUserInput): Promise<SafeUser> => {
  const result = await pool.query<SafeUser>(
    `INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, role, created_at, updated_at`,
    [name, email, password],
  );

  return result.rows[0];
};

export default { getUserByEmail, getUserById, createUser };
