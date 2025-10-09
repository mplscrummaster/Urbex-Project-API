import db from "../db/index.js";
import { missions } from "./seed-missions.js";

// Génère les dépendances de mission
// Règle : si une mission a un prérequis, toutes les suivantes ont le même (et peuvent en avoir d'autres)
// Certains scénarios n'ont aucune dépendance

const dependencies = [];
const scenarioMissions = {};
for (const mission of missions) {
  if (!scenarioMissions[mission._id_scenario])
    scenarioMissions[mission._id_scenario] = [];
  scenarioMissions[mission._id_scenario].push(mission);
}

for (const scenarioId in scenarioMissions) {
  const missionsList = scenarioMissions[scenarioId].sort(
    (a, b) => a.position_mission - b.position_mission
  );
  // Décide aléatoirement si ce scénario aura des dépendances
  const hasDeps = Math.random() < 0.7; // 70% des scénarios ont des dépendances
  let prereqIdx = hasDeps
    ? Math.floor(Math.random() * (missionsList.length - 1))
    : null;
  let prereqMission = hasDeps ? missionsList[prereqIdx] : null;
  for (let i = 0; i < missionsList.length; i++) {
    const mission = missionsList[i];
    // Si la mission est après le prérequis, elle hérite du prérequis
    if (hasDeps && i > prereqIdx) {
      dependencies.push({
        _id_mission: mission._id_mission,
        _id_mission_required: prereqMission._id_mission,
      });
      // Possibilité d'ajouter d'autres dépendances (ex: chainage)
      if (Math.random() < 0.3 && i > prereqIdx + 1) {
        dependencies.push({
          _id_mission: mission._id_mission,
          _id_mission_required: missionsList[i - 1]._id_mission,
        });
      }
    }
  }
}

const insertDep = db.prepare(`
  INSERT INTO mission_dependencies (_id_mission, _id_mission_required) VALUES (?, ?)
`);
const insertAllDeps = db.transaction(() => {
  for (const dep of dependencies) {
    insertDep.run(dep._id_mission, dep._id_mission_required);
  }
});

insertAllDeps();
console.log(`Seed mission_dependencies: ${dependencies.length} liens insérés.`);

export { dependencies };
