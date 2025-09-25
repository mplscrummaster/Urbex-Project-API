import fs from "fs";
import db from "../db/index.js";

const DB_PATH = process.env.DB_PATH || "db/bdd.db";

const exit = (code = 0) => {
  process.exit(code);
};

if (!fs.existsSync(DB_PATH)) {
  console.error(`Database not found at ${DB_PATH}`);
  exit(1);
}

try {
  const scenarios = db
    .prepare(
      `SELECT _id_scenario, title_scenario FROM scenarios ORDER BY _id_scenario`
    )
    .all();
  if (scenarios.length === 0) {
    console.log("No scenarios found; seed scenarios/missions first. Skipping.");
    exit(0);
  }

  const getMissions = db.prepare(
    `SELECT _id_mission, position_mission FROM missions WHERE _id_scenario=? ORDER BY position_mission`
  );
  const insert = db.prepare(
    `INSERT OR IGNORE INTO mission_dependencies(_id_mission,_id_mission_required) VALUES (?,?)`
  );

  let inserted = 0;
  const tx = db.transaction(() => {
    for (const sc of scenarios) {
      const ms = getMissions.all(sc._id_scenario);
      if (ms.length < 3) continue;
      const byPos = new Map(ms.map((m) => [m.position_mission, m]));

      if (byPos.has(3) && byPos.has(2)) {
        const info = insert.run(
          byPos.get(3)._id_mission,
          byPos.get(2)._id_mission
        );
        inserted += info.changes || 0;
      }
      if (byPos.has(3) && byPos.has(1)) {
        const info = insert.run(
          byPos.get(3)._id_mission,
          byPos.get(1)._id_mission
        );
        inserted += info.changes || 0;
      }
      if (byPos.has(4) && byPos.has(2)) {
        const info = insert.run(
          byPos.get(4)._id_mission,
          byPos.get(2)._id_mission
        );
        inserted += info.changes || 0;
      }
      if (byPos.has(4) && byPos.has(3)) {
        const info = insert.run(
          byPos.get(4)._id_mission,
          byPos.get(3)._id_mission
        );
        inserted += info.changes || 0;
      }
      if (byPos.has(5) && byPos.has(3)) {
        const info = insert.run(
          byPos.get(5)._id_mission,
          byPos.get(3)._id_mission
        );
        inserted += info.changes || 0;
      }
      if (byPos.has(5) && byPos.has(2)) {
        const info = insert.run(
          byPos.get(5)._id_mission,
          byPos.get(2)._id_mission
        );
        inserted += info.changes || 0;
      }
      if (byPos.has(6) && byPos.has(4)) {
        const info = insert.run(
          byPos.get(6)._id_mission,
          byPos.get(4)._id_mission
        );
        inserted += info.changes || 0;
      }
      if (byPos.has(6) && byPos.has(5)) {
        const info = insert.run(
          byPos.get(6)._id_mission,
          byPos.get(5)._id_mission
        );
        inserted += info.changes || 0;
      }
    }
  });

  tx();
  if (inserted === 0) {
    console.log(
      "No new mission dependency links inserted (possibly already present)."
    );
  } else {
    console.log(
      `Inserted ${inserted} mission dependency links across scenarios.`
    );
  }
  exit(0);
} catch (e) {
  console.error("Seed mission_dependencies failed:", e.message);
  exit(1);
}
