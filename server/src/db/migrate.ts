import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";
import { config } from "../config.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const sql = postgres(config.databaseUrl, { max: 1 });
  const drizzleDir = join(__dirname, "../../drizzle");
  if (!existsSync(drizzleDir)) {
    console.log("[migrate] no drizzle/ folder yet; run npm run db:generate first or use MOCK_MODE without DB");
    await sql.end();
    return;
  }
  const files = readdirSync(drizzleDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const f of files) {
    const body = readFileSync(join(drizzleDir, f), "utf8");
    console.log("[migrate] applying", f);
    await sql.unsafe(body);
  }
  await sql.end();
  console.log("[migrate] done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
