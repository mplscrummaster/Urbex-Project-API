import db from "../db/index.js";
import path from "path";
import { communes } from "./seed-communes.cjs";

// Helper: Calculate distance between two lat/lon points (Haversine formula)
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Find adjacent communes (within 10km)
function findAdjacentCommunes(commune, allCommunes, max = 2) {
  const adjacents = allCommunes.filter((c) => {
    if (c._id_commune === commune._id_commune) return false;
    const dist = getDistance(
      commune.geo_point_lat,
      commune.geo_point_lon,
      c.geo_point_lat,
      c.geo_point_lon
    );
    return dist < 10;
  });
  return adjacents.slice(0, max);
}

// Récupère les scénarios et communes réels depuis la base
const dbCommunes = db.prepare("SELECT * FROM communes").all();
const dbScenarios = db.prepare("SELECT * FROM scenarios").all();
console.log("Communes:", dbCommunes.length, "Scénarios:", dbScenarios.length);
console.log("First 3 communes:", dbCommunes.slice(0, 3));
console.log(
  "Database file:",
  db.name || (db.database && db.database.name) || "unknown"
);
const majorCommuneNames = [
  "Charleroi",
  "Fleurus",
  "Namur",
  "Mons",
  "Liège",
  "Bruxelles",
];
const scenarioCommuneLinks = [];
const scenarioCommuneSet = new Set();
let idx = 0;
// 5 scénarios pour chaque ville majeure (total 30 scénarios)
for (const major of majorCommuneNames
  .map((name) => dbCommunes.find((c) => c.name_fr === name))
  .filter(Boolean)) {
  for (let i = 0; i < 5; i++) {
    if (idx >= dbScenarios.length) break;
    const scenario = dbScenarios[idx];
    if (!scenario) continue;
    const key = `${scenario._id_scenario}_${major._id_commune}`;
    if (!scenarioCommuneSet.has(key)) {
      scenarioCommuneLinks.push({
        _id_scenario: scenario._id_scenario,
        _id_commune: major._id_commune,
      });
      scenarioCommuneSet.add(key);
    }
    idx++;
  }
}
// 10 scénarios (1 commune)
for (let i = 0; i < 10; i++) {
  if (idx >= dbScenarios.length) break;
  const scenario = dbScenarios[idx];
  if (!scenario) continue;
  const commune = dbCommunes[Math.floor(Math.random() * dbCommunes.length)];
  if (!commune) continue;
  const key = `${scenario._id_scenario}_${commune._id_commune}`;
  if (!scenarioCommuneSet.has(key)) {
    scenarioCommuneLinks.push({
      _id_scenario: scenario._id_scenario,
      _id_commune: commune._id_commune,
    });
    scenarioCommuneSet.add(key);
  }
  idx++;
}
// 8 scénarios (2 communes adjacentes)
for (let i = 0; i < 8; i++) {
  if (idx >= dbScenarios.length) break;
  const scenario = dbScenarios[idx];
  if (!scenario) continue;
  const commune = dbCommunes[Math.floor(Math.random() * dbCommunes.length)];
  if (!commune) continue;
  const key = `${scenario._id_scenario}_${commune._id_commune}`;
  if (!scenarioCommuneSet.has(key)) {
    scenarioCommuneLinks.push({
      _id_scenario: scenario._id_scenario,
      _id_commune: commune._id_commune,
    });
    scenarioCommuneSet.add(key);
  }
  const adjacents = findAdjacentCommunes(commune, dbCommunes, 1);
  if (adjacents[0]) {
    const adjKey = `${scenario._id_scenario}_${adjacents[0]._id_commune}`;
    if (!scenarioCommuneSet.has(adjKey)) {
      scenarioCommuneLinks.push({
        _id_scenario: scenario._id_scenario,
        _id_commune: adjacents[0]._id_commune,
      });
      scenarioCommuneSet.add(adjKey);
    }
  }
  idx++;
}
// 2 scénarios (3 communes adjacentes)
for (let i = 0; i < 2; i++) {
  if (idx >= dbScenarios.length) break;
  const scenario = dbScenarios[idx];
  if (!scenario) continue;
  const commune = dbCommunes[Math.floor(Math.random() * dbCommunes.length)];
  if (!commune) continue;
  const key = `${scenario._id_scenario}_${commune._id_commune}`;
  if (!scenarioCommuneSet.has(key)) {
    scenarioCommuneLinks.push({
      _id_scenario: scenario._id_scenario,
      _id_commune: commune._id_commune,
    });
    scenarioCommuneSet.add(key);
  }
  const adjacents = findAdjacentCommunes(commune, dbCommunes, 2);
  adjacents.forEach((adj) => {
    const adjKey = `${scenario._id_scenario}_${adj._id_commune}`;
    if (!scenarioCommuneSet.has(adjKey)) {
      scenarioCommuneLinks.push({
        _id_scenario: scenario._id_scenario,
        _id_commune: adj._id_commune,
      });
      scenarioCommuneSet.add(adjKey);
    }
  });
  idx++;
}

// Insère les liens dans la table scenario_communes
const insert = db.prepare(
  "INSERT INTO scenario_communes (_id_scenario, _id_commune) VALUES (?, ?)"
);

let inserted = 0;
for (const link of scenarioCommuneLinks) {
  if (
    typeof link._id_scenario === "undefined" ||
    typeof link._id_commune === "undefined"
  ) {
    console.warn("Aucune commune trouvée pour le scénario", link._id_scenario);
    continue;
  }
  try {
    insert.run(link._id_scenario, link._id_commune);
    inserted++;
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT_PRIMARYKEY") {
      // Doublon, ignorer
      continue;
    }
    console.error("Erreur SQL:", err.message, link);
  }
}

console.log(`Liens scenario_communes insérés : ${inserted}`);

export { scenarioCommuneLinks };
