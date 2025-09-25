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
  const row = db.prepare("SELECT COUNT(*) AS c FROM missions").get();
  const count = row?.c ?? 0;
  if (count > 0) {
    console.log(`Missions already present (${count}), skipping.`);
    exit(0);
  }

  const scenarios = db
    .prepare(
      "SELECT _id_scenario, title_scenario FROM scenarios ORDER BY _id_scenario"
    )
    .all();
  if (scenarios.length === 0) {
    console.error("No scenarios found; seed scenarios first.");
    exit(1);
  }

  const scenarioId = scenarios[0]._id_scenario; // "Les ruines oubliées"

  const data = [
    {
      _id_scenario: scenarioId,
      position_mission: 1,
      title_mission: "Le réfectoire des moines",
      latitude: 50.8503,
      longitude: 4.3517,
      riddle_text: "Sous la table des murmures, cherche le mot gravé.",
      answer_word: "silence",
    },
    {
      _id_scenario: scenarioId,
      position_mission: 2,
      title_mission: "Le jardin de l'abbé",
      latitude: 50.8511,
      longitude: 4.3522,
      riddle_text:
        "Comptez les pas jusqu'à l'arbre tordu, notez la lettre cachée.",
      answer_word: "ombre",
    },
    {
      _id_scenario: scenarioId,
      position_mission: 3,
      title_mission: "Les catacombes",
      latitude: 50.852,
      longitude: 4.353,
      riddle_text: "Parmi les noms effacés, la clé se répète trois fois.",
      answer_word: "clave",
    },
    {
      _id_scenario: scenarioId,
      position_mission: 4,
      title_mission: "Le donjon",
      latitude: 50.8528,
      longitude: 4.354,
      riddle_text: "Du haut de la tour, alignez les points cardinaux.",
      answer_word: "nord",
    },
    {
      _id_scenario: scenarioId,
      position_mission: 5,
      title_mission: "La chapelle souterraine",
      latitude: 50.8531,
      longitude: 4.3549,
      riddle_text: "Sous la pierre fissurée, le mot se dévoile.",
      answer_word: "serment",
    },
  ];

  const stmt = db.prepare(
    `INSERT INTO missions (_id_scenario, position_mission, title_mission, latitude, longitude, riddle_text, answer_word)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );

  const insertMany = db.transaction((rows) => {
    for (const m of rows) {
      stmt.run(
        m._id_scenario,
        m.position_mission,
        m.title_mission,
        m.latitude,
        m.longitude,
        m.riddle_text,
        m.answer_word
      );
    }
  });

  insertMany(data);
  console.log(`Inserted ${data.length} missions.`);
  exit(0);
} catch (e) {
  console.error("Seed missions failed:", e.message);
  exit(1);
}
