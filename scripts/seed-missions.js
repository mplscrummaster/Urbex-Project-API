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
  const row = db.prepare("SELECT COUNT(*) AS c FROM missions").get();
  const totalBefore = row?.c ?? 0;

  const scenarios = db
    .prepare(
      "SELECT _id_scenario, title_scenario FROM scenarios ORDER BY _id_scenario"
    )
    .all();
  if (scenarios.length === 0) {
    console.error("No scenarios found; seed scenarios first.");
    exit(1);
  }

  // Title pool and riddle/answer pool
  const titlePool = [
    "Le réfectoire des moines",
    "Le jardin de l'abbé",
    "La salle de contrôle",
    "Les catacombes",
    "Le donjon",
    "La chapelle souterraine",
    "Le hangar abandonné",
    "L'ancienne cimenterie",
    "La vieille gare",
  ];

  const riddlePool = [
    {
      r: "Sous la pierre fissurée, un seul mot demeure.",
      a: "serment",
    },
    {
      r: "Alignez les points cardinaux depuis l'ombre du pylône.",
      a: "nord",
    },
    {
      r: "Compte les fenêtres brisées, garde la couleur dominante.",
      a: "bleu",
    },
    {
      r: "Les initiales gravées forment ce mot.",
      a: "clef",
    },
    {
      r: "Sous la poussière, écoute ce qui revient toujours.",
      a: "echo",
    },
    {
      r: "Au centre du cadran, l'heure éternelle.",
      a: "minuit",
    },
    {
      r: "Trois croix alignées indiquent le mot à trouver.",
      a: "croix",
    },
    {
      r: "Derrière la grille, la couleur du portail donne la réponse.",
      a: "rouge",
    },
    {
      r: "Sous la table des murmures, cherche le mot gravé.",
      a: "silence",
    },
    {
      r: "Au pied de la statue, une seule direction.",
      a: "est",
    },
  ];

  const pickTitles = (offset, n) => {
    const arr = [];
    for (let i = 0; i < n; i++) {
      arr.push(titlePool[(offset + i) % titlePool.length]);
    }
    return arr;
  };

  const pickRiddle = (i) => {
    return riddlePool[i % riddlePool.length];
  };

  // Belgium-ish bounding box (rough): lat 49.5–51.6, lon 2.5–6.5
  const seededBetween = (seed, min, max) => {
    // simple LCG based on seed
    let x = (Math.sin(seed) * 10000) % 1;
    if (x < 0) x = -x;
    return x * (max - min) + min;
  };

  const clusterForScenario = (scnId) => {
    const latCenter = seededBetween(scnId * 1.7, 49.8, 51.2);
    const lonCenter = seededBetween(scnId * 2.3, 3.0, 5.8);
    return { latCenter, lonCenter };
  };
  const jitter = (seed, maxDelta) => {
    // returns value in [-maxDelta, +maxDelta]
    let x = (Math.sin(seed * 12.9898) * 43758.5453) % 1;
    if (x < 0) x = -x;
    return (x - 0.5) * 2 * maxDelta;
  };

  const stmt = db.prepare(
    `INSERT INTO missions (_id_scenario, position_mission, title_mission, latitude, longitude, riddle_text, answer_word)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );

  let inserted = 0;
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
      inserted++;
    }
  });

  for (let idx = 0; idx < scenarios.length; idx++) {
    const scn = scenarios[idx];
    const counts = db
      .prepare(
        "SELECT COUNT(*) AS c, COALESCE(MAX(position_mission),0) AS maxpos FROM missions WHERE _id_scenario = ?"
      )
      .get(scn._id_scenario);
    const have = counts.c || 0;
    const nextPos = counts.maxpos + 1;
    const desired = 3 + (scn._id_scenario % 5); // deterministic 3..7 per scenario
    if (have >= desired) continue;

    const need = desired - have;
    const titles = pickTitles(idx, need);
    const { latCenter, lonCenter } = clusterForScenario(scn._id_scenario);
    const rows = [];
    for (let i = 0; i < need; i++) {
      const { r, a } = pickRiddle(i + have);
      const lat = latCenter + jitter((i + 1) * scn._id_scenario, 0.02);
      const lon = lonCenter + jitter((i + 3) * scn._id_scenario, 0.03);
      rows.push({
        _id_scenario: scn._id_scenario,
        position_mission: nextPos + i,
        title_mission: titles[i],
        latitude: Number(lat.toFixed(6)),
        longitude: Number(lon.toFixed(6)),
        riddle_text: r,
        answer_word: a,
      });
    }
    insertMany(rows);
  }

  const totalAfter = db.prepare("SELECT COUNT(*) AS c FROM missions").get().c;
  console.log(
    inserted === 0
      ? `No new missions inserted (already had ${totalBefore}).`
      : `Inserted ${inserted} missions (now total ${totalAfter}).`
  );
  exit(0);
} catch (e) {
  console.error("Seed missions failed:", e.message);
  exit(1);
}
