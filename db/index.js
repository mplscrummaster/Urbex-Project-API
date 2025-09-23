import Database from "better-sqlite3";

const DB_PATH = "db/bdd.db";

// Single shared connection, readonly false to allow seeds/writes via API
const db = new Database(DB_PATH, {
  verbose: process.env.DB_VERBOSE ? console.log : undefined,
});

export default db;
