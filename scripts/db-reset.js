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

// Ensure foreign keys
db.pragma("foreign_keys = ON");

// Execute schema as-is; SQLite can handle comments and PRAGMA lines inside
db.exec(raw);

db.close();

console.log(`DB reset done: ${path.resolve(DB_PATH)}`);
