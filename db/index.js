import Database from "better-sqlite3";
import { DB_PATH, DB_VERBOSE } from "../config/index.js";

const db = new Database(DB_PATH, {
  verbose: DB_VERBOSE ? console.log : undefined,
});

export default db;
