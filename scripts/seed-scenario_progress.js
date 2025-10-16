import db from "../db/index.js";
// Clear scenario_progress table before seeding
db.prepare("DELETE FROM scenario_progress").run();
import { players } from "./seed-players.js";
// Récupère les scénarios directement depuis la base
const scenarios = db.prepare("SELECT * FROM scenarios").all();
// Fetch scenario IDs from missions table only
const scenarioRows = db
  .prepare("SELECT DISTINCT _id_scenario FROM missions")
  .all();
const validScenarioIds = scenarioRows.map((row) => row._id_scenario);

// Génère la progression des scénarios pour chaque joueur
// Bookmark: 5 à 10 scénarios aléatoires
// Commencés: 1 à 2 scénarios (non terminés)
// Terminés: 1 à 3 scénarios (tous les bookmarks ne sont pas forcément commencés/terminés)

const scenarioProgress = [];
for (const player of players) {
  // Bookmarks: pick only scenario IDs that exist in missions
  const bookmarkCount = Math.min(
    validScenarioIds.length,
    Math.floor(Math.random() * 6) + 5
  ); // 5 à 10, but not more than available
  const bookmarked = [...validScenarioIds]
    .sort(() => Math.random() - 0.5)
    .slice(0, bookmarkCount);

  // Terminés
  const completedCount = Math.floor(Math.random() * 3) + 1; // 1 à 3
  const completed = [...bookmarked]
    .sort(() => Math.random() - 0.5)
    .slice(0, completedCount);

  // Commencés (non terminés)
  const startedCount = Math.floor(Math.random() * 2) + 1; // 1 à 2
  const started = [...bookmarked]
    .filter((sid) => !completed.includes(sid))
    .sort(() => Math.random() - 0.5)
    .slice(0, startedCount);

  // Génère les entrées
  for (const sid of bookmarked) {
    let status = "not_started";
    let started_at = null;
    let completed_at = null;
    if (completed.includes(sid)) {
      status = "completed";
      started_at = new Date(Date.now() - Math.random() * 1e9).toISOString();
      completed_at = new Date(Date.now() - Math.random() * 1e8).toISOString();
    } else if (started.includes(sid)) {
      status = "started";
      started_at = new Date(Date.now() - Math.random() * 1e9).toISOString();
    }
    scenarioProgress.push({
      _id_user: player._id_user,
      _id_scenario: sid,
      status,
      bookmarked: 1,
      started_at,
      completed_at,
      last_interaction_at: new Date().toISOString(),
    });
  }
}

const insertProgress = db.prepare(`
  INSERT INTO scenario_progress (
    _id_user, _id_scenario, status, bookmarked, started_at, completed_at, last_interaction_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const validProgress = scenarioProgress.filter(
  (p) => p._id_scenario !== undefined && p._id_scenario !== null
);
const ignoredProgress = scenarioProgress.filter(
  (p) => p._id_scenario === undefined || p._id_scenario === null
);
if (ignoredProgress.length > 0) {
  console.warn(`Entrées ignorées (scenario_progress):`, ignoredProgress);
}

// Remove duplicate (_id_user, _id_scenario) pairs
const uniqueProgress = [];
const seen = new Set();
for (const p of validProgress) {
  const key = `${p._id_user}_${p._id_scenario}`;
  if (!seen.has(key)) {
    uniqueProgress.push(p);
    seen.add(key);
  }
}

const insertAllProgress = db.transaction(() => {
  for (const p of uniqueProgress) {
    insertProgress.run(
      p._id_user,
      p._id_scenario,
      p.status,
      p.bookmarked,
      p.started_at,
      p.completed_at,
      p.last_interaction_at
    );
  }
});

insertAllProgress();
console.log(
  `Seed scenario_progress: ${uniqueProgress.length} entrées insérées. (${
    ignoredProgress.length + validProgress.length - uniqueProgress.length
  } ignorées)`
);

export { scenarioProgress };
