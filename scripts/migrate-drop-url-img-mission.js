import db from "../db/index.js";

// SQLite doesn't support DROP COLUMN directly. We rebuild the table without url_img_mission.
// This migration is idempotent: it checks current pragma table_info to determine if the column exists.

function columnExists(table, col) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all();
  return cols.some((c) => c.name === col);
}

try {
  if (!columnExists("missions", "url_img_mission")) {
    console.log("Column url_img_mission already absent. Nothing to do.");
    process.exit(0);
  }

  db.transaction(() => {
    db.prepare(
      `
      CREATE TABLE IF NOT EXISTS missions_new (
        _id_mission       INTEGER PRIMARY KEY AUTOINCREMENT,
        _id_scenario      INTEGER NOT NULL,
        position_mission  INTEGER NOT NULL DEFAULT 1,
        title_mission     TEXT NOT NULL,
        latitude          REAL NOT NULL,
        longitude         REAL NOT NULL,
        riddle_text       TEXT NOT NULL,
        answer_word       TEXT NOT NULL,
        FOREIGN KEY (_id_scenario) REFERENCES scenarios(_id_scenario) ON DELETE CASCADE
      );
    `
    ).run();

    db.prepare(
      `
      INSERT INTO missions_new (
        _id_mission, _id_scenario, position_mission, title_mission, latitude, longitude, riddle_text, answer_word
      )
      SELECT _id_mission, _id_scenario, position_mission, title_mission, latitude, longitude, riddle_text, answer_word
      FROM missions;
    `
    ).run();

    db.prepare(`DROP TABLE missions;`).run();
    db.prepare(`ALTER TABLE missions_new RENAME TO missions;`).run();
    db.prepare(
      `CREATE INDEX IF NOT EXISTS idx_missions_scenario ON missions(_id_scenario, position_mission);`
    ).run();
  })();

  console.log("Migration complete: url_img_mission dropped from missions.");
  process.exit(0);
} catch (e) {
  console.error("Migration failed:", e.message);
  process.exit(1);
}
