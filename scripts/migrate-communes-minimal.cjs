#!/usr/bin/env node
// Migration: communes table v2 (remove municipality_code, add postal_codes TEXT)
const db = require("better-sqlite3")("db/bdd.db");

function tableInfo(name) {
  return db.prepare(`PRAGMA table_info(${name})`).all();
}

const has = db
  .prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='communes'"
  )
  .get();
if (has) {
  const info = tableInfo("communes");
  const colNames = info.map((c) => c.name);
  const hasMunicipalityCode = colNames.includes("municipality_code");
  const hasPostalCodes = colNames.includes("postal_codes");
  if (!hasMunicipalityCode && hasPostalCodes) {
    console.log(
      "Table communes déjà au format v2 (sans municipality_code, avec postal_codes). Rien à faire."
    );
    process.exit(0);
  }
  // Need to upgrade
  console.log(
    "Migration communes -> v2 (suppression municipality_code, ajout postal_codes)..."
  );
  db.exec("PRAGMA foreign_keys=OFF;");
  db.exec("ALTER TABLE communes RENAME TO _communes_old;");
}

// Create communes table v2 (no municipality_code, add postal_codes)
const createSql = `CREATE TABLE IF NOT EXISTS communes (
  _id_commune       INTEGER PRIMARY KEY AUTOINCREMENT,
  name_fr           TEXT,
  name_nl           TEXT,
  name_de           TEXT,
  geo_point_lat     REAL,
  geo_point_lon     REAL,
  geo_shape_geojson TEXT,
  postal_codes      TEXT
);`;

db.exec(createSql);

db.exec(
  `CREATE INDEX IF NOT EXISTS idx_communes_name_fr ON communes(name_fr);`
);
odb = "";
db.exec(
  `CREATE INDEX IF NOT EXISTS idx_communes_name_nl ON communes(name_nl);`
);
db.exec(
  `CREATE INDEX IF NOT EXISTS idx_communes_name_de ON communes(name_de);`
);

// If upgrading from old structure, copy data over (dropping municipality_code, initializing postal_codes NULL)
const oldHas = db
  .prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='_communes_old'"
  )
  .get();
if (oldHas) {
  const copyCols = [
    "name_fr",
    "name_nl",
    "name_de",
    "geo_point_lat",
    "geo_point_lon",
    "geo_shape_geojson",
  ];
  const existingCols = tableInfo("_communes_old").map((c) => c.name);
  const safeCols = copyCols.filter((c) => existingCols.includes(c));
  db.exec(
    `INSERT INTO communes (${safeCols.join(", ")}) SELECT ${safeCols.join(
      ", "
    )} FROM _communes_old;`
  );
  db.exec("DROP TABLE _communes_old;");
}

// Ensure scenario_communes exists (it didn't change structurally)
db.exec(`CREATE TABLE IF NOT EXISTS scenario_communes (
  _id_scenario INTEGER NOT NULL,
  _id_commune  INTEGER NOT NULL,
  PRIMARY KEY (_id_scenario, _id_commune),
  FOREIGN KEY (_id_scenario) REFERENCES scenarios(_id_scenario) ON DELETE CASCADE,
  FOREIGN KEY (_id_commune)  REFERENCES communes(_id_commune)  ON DELETE CASCADE
);`);

db.exec("PRAGMA foreign_keys=ON;");

console.log("Migration communes -> v2 terminée.");
