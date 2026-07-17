/**
 * Optional DB bootstrap. MOCK_MODE API runs without Postgres.
 * When DATABASE_URL is reachable, call migrate via `npm run db:migrate`.
 */
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { config } from "../config.js";
import * as schema from "./schema.js";

export function createDb() {
  const client = postgres(config.databaseUrl, { max: 10 });
  return drizzle(client, { schema });
}

export type Db = ReturnType<typeof createDb>;
