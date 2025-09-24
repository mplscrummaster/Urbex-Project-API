import fs from "fs";
import db from "../db/index.js";

const DB_PATH = "db/bdd.db";

function exit(code = 0) {
  process.exit(code);
}

if (!fs.existsSync(DB_PATH)) {
  console.error(`Database not found at ${DB_PATH}`);
  exit(1);
}

try {
  const row = db.prepare("SELECT COUNT(*) AS c FROM scenarios").get();
  const count = row?.c ?? 0;
  if (count > 0) {
    console.log(`Scenarios already present (${count}), skipping.`);
    exit(0);
  }

  const stmt = db.prepare(
    "INSERT INTO scenarios (title_scenario, url_img_scenario) VALUES (?, ?)"
  );
  const data = [
    ["Les ruines oubliées", null],
    ["Les ombres de la ville", null],
    ["Les passages interdits", null],
    ["Le réseau invisible", null],
    ["Sous la poussière du temps", null],
  ];

  const insertMany = db.transaction((rows) => {
    for (const [t, u] of rows) {
      stmt.run(t, u);
    }
  });
  insertMany(data);
  console.log(`Inserted ${data.length} scenarios.`);
  exit(0);
} catch (e) {
  console.error("Seed scenarios failed:", e.message);
  exit(1);
}
