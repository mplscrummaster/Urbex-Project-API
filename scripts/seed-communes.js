import fs from "fs";
import db from "../db/index.js";

const DB_PATH = process.env.DB_PATH || "db/bdd.db";

function exit(code = 0) {
  process.exit(code);
}

if (!fs.existsSync(DB_PATH)) {
  console.error(`Database not found at ${DB_PATH}`);
  exit(1);
}

try {
  const row = db.prepare("SELECT COUNT(*) AS c FROM communes").get();
  const count = row?.c ?? 0;
  if (count > 0) {
    console.log(`Communes already present (${count}), skipping.`);
    exit(0);
  }

  // Minimal starter set (can be expanded later or replaced by full import)
  const data = [
    {
      name_commune: "Bruxelles",
      nis_code: "21004",
      region: "Brussels",
      province: "Bruxelles-Capitale",
      latitude: 50.8466,
      longitude: 4.3528,
    },
    {
      name_commune: "Liège",
      nis_code: "62063",
      region: "Wallonia",
      province: "Liège",
      latitude: 50.6326,
      longitude: 5.5797,
    },
    {
      name_commune: "Namur",
      nis_code: "92094",
      region: "Wallonia",
      province: "Namur",
      latitude: 50.4674,
      longitude: 4.8718,
    },
    {
      name_commune: "Mons",
      nis_code: "53053",
      region: "Wallonia",
      province: "Hainaut",
      latitude: 50.4541,
      longitude: 3.9523,
    },
    {
      name_commune: "Anvers",
      nis_code: "11002",
      region: "Flanders",
      province: "Antwerpen",
      latitude: 51.2194,
      longitude: 4.4025,
    },
    {
      name_commune: "Gand",
      nis_code: "44021",
      region: "Flanders",
      province: "Oost-Vlaanderen",
      latitude: 51.0543,
      longitude: 3.7174,
    },
    {
      name_commune: "Bruges",
      nis_code: "31005",
      region: "Flanders",
      province: "West-Vlaanderen",
      latitude: 51.2093,
      longitude: 3.2247,
    },
  ];

  const stmt = db.prepare(
    `INSERT INTO communes (name_commune, nis_code, region, province, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?)`
  );
  const insertMany = db.transaction((rows) => {
    for (const c of rows) {
      stmt.run(
        c.name_commune,
        c.nis_code,
        c.region,
        c.province,
        c.latitude,
        c.longitude
      );
    }
  });
  insertMany(data);
  console.log(`Inserted ${data.length} communes.`);
  exit(0);
} catch (e) {
  console.error("Seed communes failed:", e.message);
  exit(1);
}
