import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

const DB_PATH = process.env.DB_PATH || "db/bdd.db";
const SCHEMA_PATH = "db/schema.sql";

if (fs.existsSync(DB_PATH)) {
  fs.rmSync(DB_PATH);
}

const raw = fs.readFileSync(SCHEMA_PATH, "utf8");
const db = new Database(DB_PATH);

// Apply pragma explicitly
db.pragma("foreign_keys = ON");

// Remove comments and PRAGMA lines, then execute statements individually
const cleaned = raw
  .split("\n")
  .map((l) => l.trim())
  .filter(
    (l) => l && !l.startsWith("--") && !l.toLowerCase().startsWith("pragma")
  )
  .join("\n");

const statements = cleaned
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

for (const stmt of statements) {
  db.exec(stmt);
}

db.close();

console.log(`DB reset done: ${path.resolve(DB_PATH)}`);
