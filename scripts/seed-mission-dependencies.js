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
  const missions = db
    .prepare(
      `SELECT _id_mission, _id_scenario, position_mission FROM missions ORDER BY position_mission`
    )
    .all();
  if (missions.length < 3) {
    console.log(
      "Not enough missions to seed dependencies (need >=3). Skipping."
    );
    exit(0);
  }

  const existing = db
    .prepare(`SELECT COUNT(*) as c FROM mission_dependencies`)
    .get().c;
  if (existing > 0) {
    console.log(
      `Mission dependencies already present (${existing}), skipping.`
    );
    exit(0);
  }

  // Simple demo chain: mission 3 depends on 1 and 2; mission 5 depends on 3
  const m1 = missions.find((m) => m.position_mission === 1);
  const m2 = missions.find((m) => m.position_mission === 2);
  const m3 = missions.find((m) => m.position_mission === 3);
  const m5 = missions.find((m) => m.position_mission === 5);

  const rows = [];
  if (m1 && m2 && m3) {
    rows.push([m3._id_mission, m1._id_mission]);
    rows.push([m3._id_mission, m2._id_mission]);
  }
  if (m3 && m5) {
    rows.push([m5._id_mission, m3._id_mission]);
  }

  if (!rows.length) {
    console.log("No dependency pattern matched, skipping.");
    exit(0);
  }

  const insert = db.prepare(
    `INSERT INTO mission_dependencies(_id_mission,_id_mission_required) VALUES (?,?)`
  );
  const tx = db.transaction(() => {
    for (const [mid, req] of rows) insert.run(mid, req);
  });
  tx();
  console.log(`Inserted ${rows.length} mission dependency links.`);
  exit(0);
} catch (e) {
  console.error("Seed mission dependencies failed:", e.message);
  exit(1);
}
