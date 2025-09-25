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
  const insertStmt = db.prepare(
    `INSERT INTO blocks (owner_type, _id_scenario, _id_mission, position_block, type_block, content_text, url_media, caption)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const insert = (...args) => insertStmt.run(...args);

  const scenarios = db
    .prepare(
      `SELECT _id_scenario, title_scenario FROM scenarios ORDER BY _id_scenario`
    )
    .all();
  if (scenarios.length === 0) {
    console.error("No scenario found; seed scenarios first.");
    exit(1);
  }

  // Text generators
  const introText = (title) =>
    `Bienvenue dans « ${title} ». Avancez prudemment : chaque détail compte, chaque trace raconte une histoire. Laissez vos sens guider les premiers pas.`;
  const outroText = (title) =>
    `Fin de « ${title} ». Vous avez percé une part du mystère : emportez ce que vous avez découvert, il vous servira ailleurs.`;
  const missionText = (scTitle, mTitle, index) =>
    `Mission ${index}. « ${mTitle} ». Dans le cadre de « ${scTitle} », observez le lieu, écoutez ses échos. Une marque discrète, un alignement suspect, un mot qui revient : trouvez-le.`;

  let created = 0;

  db.transaction(() => {
    for (const sc of scenarios) {
      // Scenario intro (ensure minimum one text block)
      const hasIntro = db
        .prepare(
          `SELECT 1 FROM blocks WHERE owner_type='scenario_intro' AND _id_scenario=? LIMIT 1`
        )
        .get(sc._id_scenario);
      if (!hasIntro) {
        insert(
          "scenario_intro",
          sc._id_scenario,
          null,
          1,
          "text",
          introText(sc.title_scenario),
          null,
          null
        );
        created++;
      }

      // Scenario outro (ensure minimum one text block)
      const hasOutro = db
        .prepare(
          `SELECT 1 FROM blocks WHERE owner_type='scenario_outro' AND _id_scenario=? LIMIT 1`
        )
        .get(sc._id_scenario);
      if (!hasOutro) {
        insert(
          "scenario_outro",
          sc._id_scenario,
          null,
          1,
          "text",
          outroText(sc.title_scenario),
          null,
          null
        );
        created++;
      }

      // Mission blocks (ensure minimum one text block per mission)
      const missions = db
        .prepare(
          `SELECT _id_mission, title_mission, position_mission FROM missions WHERE _id_scenario=? ORDER BY position_mission`
        )
        .all(sc._id_scenario);
      for (const m of missions) {
        const hasMissionBlock = db
          .prepare(
            `SELECT 1 FROM blocks WHERE owner_type='mission' AND _id_mission=? LIMIT 1`
          )
          .get(m._id_mission);
        if (!hasMissionBlock) {
          insert(
            "mission",
            null,
            m._id_mission,
            1,
            "text",
            missionText(sc.title_scenario, m.title_mission, m.position_mission),
            null,
            null
          );
          created++;
        }
      }
    }
  })();

  if (created === 0) {
    console.log(
      "No new blocks inserted (all scenarios and missions already have minimum text blocks)."
    );
  } else {
    console.log(`Inserted ${created} text blocks (intros/outros/missions).`);
  }
  exit(0);
} catch (e) {
  console.error("Seed blocks failed:", e.message);
  exit(1);
}
