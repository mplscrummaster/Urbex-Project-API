import db from "../db/index.js";

const scenarios = [
  { title_scenario: "Mémoire des murs" },
  { title_scenario: "Les vestiges du silence" },
  { title_scenario: "Lignes fantômes" },
  { title_scenario: "Sous la poussière du temps" },
  { title_scenario: "Le murmure des pierres" },
  { title_scenario: "Les couloirs oubliés" },
  { title_scenario: "L’écho des disparus" },
  { title_scenario: "Brumes intérieures" },
  { title_scenario: "Les ombres de la ville" },
  { title_scenario: "Cartographie du néant" },
  { title_scenario: "La clé des profondeurs" },
  { title_scenario: "Le passage secret" },
  { title_scenario: "Au-delà des grilles" },
  { title_scenario: "La porte sans nom" },
  { title_scenario: "Les chemins interdits" },
  { title_scenario: "Entre deux mondes" },
  { title_scenario: "L’expédition des ruines" },
  { title_scenario: "Le labyrinthe caché" },
  { title_scenario: "Horizon effacé" },
  { title_scenario: "Les toits du crépuscule" },
  { title_scenario: "Acier endormi" },
  { title_scenario: "Le dernier wagon" },
  { title_scenario: "Silence d’usine" },
  { title_scenario: "Centrale fantôme" },
  { title_scenario: "Les tuyaux de l’oubli" },
  { title_scenario: "Archives rouillées" },
  { title_scenario: "Station terminus" },
  { title_scenario: "Hangar du vent" },
  { title_scenario: "Lumières éteintes" },
  { title_scenario: "Friches et brasiers" },
  { title_scenario: "Forêt engloutie" },
  { title_scenario: "Rivière immobile" },
  { title_scenario: "Le lac des âmes" },
  { title_scenario: "Racines interdites" },
  { title_scenario: "La serre brisée" },
  { title_scenario: "Le jardin suspendu" },
  { title_scenario: "La falaise aux secrets" },
  { title_scenario: "Souffle des cavernes" },
  { title_scenario: "Poussière d’écume" },
  { title_scenario: "Vent des profondeurs" },
  { title_scenario: "La ville aux cent portes" },
  { title_scenario: "Les horloges immobiles" },
  { title_scenario: "Nuits sans fenêtres" },
  { title_scenario: "L’antichambre du temps" },
  { title_scenario: "Le théâtre des absents" },
  { title_scenario: "Échos d’ailleurs" },
  { title_scenario: "Le plafond des étoiles" },
  { title_scenario: "Dernier couloir" },
  { title_scenario: "Le grenier du monde" },
  { title_scenario: "Les marches vers l’invisible" },
];

const getNow = () => {
  return new Date().toISOString();
};

const getRandomScenaristId = () => {
  return Math.floor(Math.random() * 3) + 4;
};

const insertScenario = db.prepare(`
  INSERT INTO scenarios (
    title_scenario,
    is_published,
    created_at,
    updated_at,
    created_by
  ) VALUES (?, ?, ?, ?, ?)
`);

// Purge la table et réinitialise l'auto-increment pour éviter les doublons et garantir des IDs consécutifs
db.prepare("DELETE FROM scenarios").run();
try {
  db.prepare('DELETE FROM sqlite_sequence WHERE name="scenarios"').run(); // Réinitialise l'auto-increment
} catch (e) {
  console.warn("Impossible de réinitialiser l'auto-increment :", e.message);
}

const insertAllScenarios = db.transaction(() => {
  for (const scenario of scenarios) {
    insertScenario.run(
      scenario.title_scenario,
      1,
      getNow(),
      getNow(),
      getRandomScenaristId()
    );
  }
});

insertAllScenarios();

console.log(`Seed scenarios: ${scenarios.length} scénarios insérés.`);

export { scenarios };
