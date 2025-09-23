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
  const row = db.prepare("SELECT COUNT(*) AS c FROM locations").get();
  const count = row?.c ?? 0;
  if (count > 0) {
    console.log(`Locations already present (${count}), skipping.`);
    exit(0);
  }

  // Fetch scenario ids to link locations appropriately
  const scenarios = db
    .prepare(
      "SELECT _id_scenario, title_scenario FROM scenarios ORDER BY _id_scenario"
    )
    .all();
  if (scenarios.length === 0) {
    console.error("No scenarios found; seed scenarios first.");
    exit(1);
  }

  // Map sample titles to scenario 1 for demo; you can spread later
  const scenarioId = scenarios[0]._id_scenario;

  const data = [
    {
      _id_scenario: scenarioId,
      title_location: "Le réfectoire des moines",
      intro_location: "Ancienne salle de repas, voûtes encore visibles.",
      url_img_location: null,
      latitude: 50.8503,
      longitude: 4.3517,
      riddle_text: "Sous la table des murmures, cherche le mot gravé.",
      answer_word: "silence",
    },
    {
      _id_scenario: scenarioId,
      title_location: "Le jardin de l'abbé",
      intro_location: "Vestiges de plates-bandes et statues renversées.",
      url_img_location: null,
      latitude: 50.8511,
      longitude: 4.3522,
      riddle_text:
        "Comptez les pas jusqu'à l'arbre tordu, notez la lettre cachée.",
      answer_word: "ombre",
    },
    {
      _id_scenario: scenarioId,
      title_location: "La chapelle souterraine",
      intro_location: "Chapelle oubliée, entrée dissimulée sous les dalles.",
      url_img_location: null,
      latitude: 50.852,
      longitude: 4.353,
      riddle_text: "Au pied de la croix sans nom, le mot attend.",
      answer_word: "foi",
    },
  ];

  const stmt = db.prepare(
    `INSERT INTO locations (_id_scenario, title_location, intro_location, url_img_location, latitude, longitude, riddle_text, answer_word)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const insertMany = db.transaction((rows) => {
    for (const l of rows) {
      stmt.run(
        l._id_scenario,
        l.title_location,
        l.intro_location,
        l.url_img_location,
        l.latitude,
        l.longitude,
        l.riddle_text,
        l.answer_word
      );
    }
  });

  insertMany(data);
  console.log(`Inserted ${data.length} locations.`);
  exit(0);
} catch (e) {
  console.error("Seed locations failed:", e.message);
  exit(1);
}
