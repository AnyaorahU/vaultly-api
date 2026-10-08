import PG from "pg";
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER } from "./env";

const { Pool } = PG;

export const pool = new Pool({
  host: DB_HOST,
  port: DB_PORT ?? 5432,
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD,
});
console.log("Pool connecting to:", process.env.DB_NAME);
