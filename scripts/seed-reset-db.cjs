// Vide toutes les tables de la base SQLite
const Database = require("better-sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "../db/bdd.db");
const db = new Database(dbPath);

const tables = [
  "mission_progress",
  "scenario_progress",
  "mission_dependencies",
  "blocks",
  "missions",
  "scenario_communes",
  "commune_shapes",
  "communes",
  "players",
  "scenarios",
  "users",
];

for (const table of tables) {
  db.prepare(`DELETE FROM ${table}`).run();
  db.prepare(`DELETE FROM sqlite_sequence WHERE name='${table}'`).run();
}

db.close();
console.log("Toutes les tables ont été vidées.");
