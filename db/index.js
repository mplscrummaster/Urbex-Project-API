import Database from "better-sqlite3";

const DB_PATH = process.env.DB_PATH || "db/bdd.db";

const db = new Database(DB_PATH, {
  verbose: process.env.DB_VERBOSE ? console.log : undefined,
});

export default db;
