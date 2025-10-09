import db from "../db/index.js";
import { players } from "./seed-players.js";
// Fetch missions from DB for correct IDs
const missionRows = db
  .prepare("SELECT _id_mission, _id_scenario, position_mission FROM missions")
  .all();
const missions = missionRows;
import { scenarioProgress } from "./seed-scenario_progress.js";

// Génère la progression des missions pour chaque joueur
// Toutes les missions d'un scénario terminé sont terminées
// Pour un scénario commencé, les missions terminées sont dans l'ordre

const missionProgress = [];
for (const player of players) {
  // Récupère les scénarios terminés et commencés
  const completedScenarios = scenarioProgress
    .filter((p) => p._id_user === player._id_user && p.status === "completed")
    .map((p) => p._id_scenario);
  const startedScenarios = scenarioProgress
    .filter((p) => p._id_user === player._id_user && p.status === "started")
    .map((p) => p._id_scenario);

  // Missions des scénarios terminés : toutes terminées
  for (const sid of completedScenarios) {
    const missionsInScenario = missions.filter((m) => m._id_scenario === sid);
    for (const m of missionsInScenario) {
      missionProgress.push({
        _id_user: player._id_user,
        _id_mission: m._id_mission,
        completed_at: new Date(Date.now() - Math.random() * 1e8).toISOString(),
      });
    }
  }

  // Missions des scénarios commencés : quelques missions terminées, dans l'ordre
  for (const sid of startedScenarios) {
    const missionsInScenario = missions
      .filter((m) => m._id_scenario === sid)
      .sort((a, b) => a.position_mission - b.position_mission);
    const count =
      Math.floor(Math.random() * (missionsInScenario.length - 1)) + 1; // au moins 1 mission terminée
    for (let i = 0; i < count; i++) {
      missionProgress.push({
        _id_user: player._id_user,
        _id_mission: missionsInScenario[i]._id_mission,
        completed_at: new Date(Date.now() - Math.random() * 1e8).toISOString(),
      });
    }
  }
}

const insertMissionProgress = db.prepare(`
  INSERT INTO mission_progress (
    _id_user, _id_mission, completed_at
  ) VALUES (?, ?, ?)
`);

// Remove duplicate (_id_user, _id_mission) pairs
const uniqueProgress = [];
const seen = new Set();
for (const p of missionProgress) {
  const key = `${p._id_user}_${p._id_mission}`;
  if (!seen.has(key)) {
    uniqueProgress.push(p);
    seen.add(key);
  }
}

const insertAllMissionProgress = db.transaction(() => {
  for (const p of uniqueProgress) {
    insertMissionProgress.run(p._id_user, p._id_mission, p.completed_at);
  }
});

insertAllMissionProgress();
console.log(
  `Seed mission_progress: ${uniqueProgress.length} entrées insérées. (${
    missionProgress.length - uniqueProgress.length
  } ignorées)`
);

export { missionProgress };
