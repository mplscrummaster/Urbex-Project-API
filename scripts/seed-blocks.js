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
  const row = db.prepare("SELECT COUNT(*) AS c FROM blocks").get();
  const count = row?.c ?? 0;
  if (count > 0) {
    console.log(`Blocks already present (${count}), skipping.`);
    exit(0);
  }

  const scenario = db
    .prepare("SELECT _id_scenario FROM scenarios ORDER BY _id_scenario LIMIT 1")
    .get();
  if (!scenario) {
    console.error("No scenario found; seed scenarios first.");
    exit(1);
  }

  const missions = db
    .prepare(
      "SELECT _id_mission FROM missions WHERE _id_scenario = ? ORDER BY position_mission"
    )
    .all(scenario._id_scenario);
  if (missions.length === 0) {
    console.error("No missions found; seed missions first.");
    exit(1);
  }

  const stmt =
    db.prepare(`INSERT INTO blocks (owner_type, _id_scenario, _id_mission, position_block, type_block, content_text, url_media, caption)
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
  const insertMany = db.transaction((rows) => {
    for (const r of rows) stmt.run(...r);
  });

  const intro = [
    [
      "scenario_intro",
      scenario._id_scenario,
      null,
      1,
      "text",
      "Bienvenue dans les ruines oubliées.",
      null,
      null,
    ],
    [
      "scenario_intro",
      scenario._id_scenario,
      null,
      2,
      "image",
      null,
      "https://example.com/intro1.jpg",
      "Entrée du site",
    ],
    [
      "scenario_intro",
      scenario._id_scenario,
      null,
      3,
      "audio",
      null,
      "https://example.com/ambiance.mp3",
      "Ambiance",
    ],
  ];

  const missionBlocks = missions.flatMap((m, i) => [
    [
      "mission",
      null,
      m._id_mission,
      1,
      "text",
      `Indice de la mission ${i + 1}.`,
      null,
      null,
    ],
    [
      "mission",
      null,
      m._id_mission,
      2,
      "image",
      null,
      `https://example.com/m${i + 1}.jpg`,
      `Photo ${i + 1}`,
    ],
  ]);

  const outro = [
    [
      "scenario_outro",
      scenario._id_scenario,
      null,
      1,
      "text",
      "Bravo, vous avez terminé la quête !",
      null,
      null,
    ],
    [
      "scenario_outro",
      scenario._id_scenario,
      null,
      2,
      "video",
      null,
      "https://example.com/outro.mp4",
      "Récapitulatif",
    ],
  ];

  insertMany([...intro, ...missionBlocks, ...outro]);
  console.log(
    `Inserted ${intro.length + missionBlocks.length + outro.length} blocks.`
  );
  exit(0);
} catch (e) {
  console.error("Seed blocks failed:", e.message);
  exit(1);
}
