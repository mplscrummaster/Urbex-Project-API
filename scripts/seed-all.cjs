// Script d'orchestration pour seed toutes les tables dans l'ordre logique (CommonJS)
// Usage : node scripts/seed-all.cjs

const { execSync } = require("child_process");
const path = require("path");

console.log("\n--- Vidage de la base ---");
execSync('node "' + path.join(__dirname, "seed-reset-db.cjs") + '"', {
  stdio: "inherit",
});

const scripts = [
  "seed-users.js",
  "seed-players.js",
  "seed-communes.cjs",
  "seed-commune_shapes.js",
  "seed-scenarios.js",
  "seed-missions.js",
  "seed-blocks.js",
  "seed-scenario_communes.js",
  "seed-mission_dependencies.js",
  "seed-scenario_progress.js",
  "seed-mission_progress.js",
];

const scriptsDir = path.join(__dirname);

for (const script of scripts) {
  const scriptPath = path.join(scriptsDir, script);
  console.log(`\n--- Exécution : ${script} ---`);
  try {
    execSync(`node "${scriptPath}"`, { stdio: "inherit" });
  } catch (err) {
    console.error(`Erreur lors de l'exécution de ${script}:`, err.message);
    process.exit(1);
  }
}

console.log(
  "\nTous les scripts de seed ont été exécutés dans l'ordre logique."
);
