#!/usr/bin/env node
/**
 * Applies pending SQL files from supabase/migrations/ (in filename order)
 * to the database in SUPABASE_DB_CONNECTION_STRING.
 * Tracks applied files in a schema_migrations table so it is safe to run
 * before every `next dev`.
 */
const { Client } = require("pg");
const { readFileSync, readdirSync } = require("fs");
const { resolve, basename } = require("path");

const ROOT = resolve(__dirname, "..");
const MIGRATIONS_DIR = resolve(ROOT, "supabase", "migrations");

function loadEnvFile(path) {
  try {
    const text = readFileSync(path, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !(m[1] in process.env)) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
      }
    }
  } catch {
    /* missing file is fine */
  }
}

async function main() {
  loadEnvFile(resolve(ROOT, ".env"));

  const conn = process.env.SUPABASE_DB_CONNECTION_STRING;
  if (!conn) {
    console.warn("[db:migrate] SUPABASE_DB_CONNECTION_STRING not set; skipping.");
    return;
  }

  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const client = new Client({
    connectionString: conn,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  await client.query(`
    create table if not exists schema_migrations (
      filename text primary key,
      applied_at timestamptz not null default now()
    )
  `);

  const { rows } = await client.query("select filename from schema_migrations");
  const applied = new Set(rows.map((r) => r.filename));

  const pending = files.filter((f) => !applied.has(f));
  if (pending.length === 0) {
    console.log("[db:migrate] Schema is up to date.");
    await client.end();
    return;
  }

  for (const file of pending) {
    const sql = readFileSync(resolve(MIGRATIONS_DIR, file), "utf8");
    console.log(`[db:migrate] Applying ${file} ...`);
    await client.query("begin");
    try {
      await client.query(sql);
      await client.query("insert into schema_migrations (filename) values ($1)", [file]);
      await client.query("commit");
      console.log(`[db:migrate]   OK ${file}`);
    } catch (err) {
      await client.query("rollback");
      console.error(`[db:migrate] FAILED ${file}: ${err.message}`);
      await client.end();
      process.exit(1);
    }
  }

  await client.end();
  console.log("[db:migrate] Done.");
}

main().catch((e) => {
  console.error("[db:migrate]", e.message);
  process.exit(1);
});
