import fs from "fs";
import db from "../db/index.js";

const DB_PATH = "db/bdd.db";

const exit = (code = 0) => {
  process.exit(code);
};

if (!fs.existsSync(DB_PATH)) {
  console.error(`Database not found at ${DB_PATH}`);
  exit(1);
}

try {
  const row = db.prepare("SELECT COUNT(*) AS c FROM scenarios").get();
  const count = row?.c ?? 0;

  const stmt = db.prepare(
    "INSERT INTO scenarios (title_scenario, is_published) VALUES (?, 0)"
  );
  const data = [
    ["Les ruines oubliées"],
    ["Le réseau invisible"],
    ["Sous la poussière du temps"],
    ["Les ombres de la ville"],
    ["Les passages interdits"],
    ["La clé des profondeurs"],
    ["Mémoire des murs"],
    ["Les vestiges du silence"],
    ["Chroniques souterraines"],
  ];

  const insertMany = db.transaction((rows) => {
    for (const [t] of rows) {
      stmt.run(t);
    }
  });
  // If DB already has some scenarios, we still try to insert missing ones (avoid duplicates by title)
  const existingTitles = new Set(
    db
      .prepare("SELECT title_scenario FROM scenarios")
      .all()
      .map((r) => r.title_scenario)
  );
  const toInsert = data.filter(([t]) => !existingTitles.has(t));
  insertMany(toInsert);
  const added = toInsert.length;
  console.log(
    added === 0
      ? `No new scenarios inserted (already had ${count}).`
      : `Inserted ${added} scenarios (now total ~${count + added}).`
  );
  exit(0);
} catch (e) {
  console.error("Seed scenarios failed:", e.message);
  exit(1);
}
