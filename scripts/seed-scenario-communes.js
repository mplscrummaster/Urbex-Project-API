/**
 * Seed statique des liaisons scenario_communes d'après l'état actuel validé.
 * Idempotent: on remplace l'ensemble des liens par ce jeu canonique.
 */
import db from "../db/index.js";

const LINKS = [
  { title: "Les ruines oubliées", _id_commune: 873 }, // Mouscron
  { title: "Les ombres de la ville", _id_commune: 930 }, // Durbuy
  { title: "Les passages interdits", _id_commune: 639 }, // Momignies
  { title: "Le réseau invisible", _id_commune: 1153 }, // Sainte-Ode
  { title: "Sous la poussière du temps", _id_commune: 809 }, // Malines
  { title: "Exploration Ancienne Usine", _id_commune: 802 }, // Namur
  { title: "La clé des profondeurs", _id_commune: 1029 }, // Yvoir
  { title: "La clé des profondeurs", _id_commune: 1042 }, // Ciney
  { title: "Mémoire des murs", _id_commune: 702 }, // Incourt
  { title: "Mémoire des murs", _id_commune: 912 }, // Perwez
  { title: "Mémoire des murs", _id_commune: 963 }, // Ramillies
  { title: "Les vestiges du silence", _id_commune: 922 }, // Gerpinnes
  { title: "Les vestiges du silence", _id_commune: 976 }, // Charleroi
  { title: "Les vestiges du silence", _id_commune: 1132 }, // Châtelet
  { title: "Chroniques souterraines", _id_commune: 594 }, // Lievegem
  { title: "Chroniques souterraines", _id_commune: 925 }, // Eeklo
];

const seedScenarioCommunes = () => {
  const findScenario = db.prepare(
    "SELECT _id_scenario FROM scenarios WHERE title_scenario = ?"
  );
  const clear = db.prepare("DELETE FROM scenario_communes");
  const insert = db.prepare(
    "INSERT OR IGNORE INTO scenario_communes (_id_scenario, _id_commune) VALUES (?, ?)"
  );

  const run = db.transaction(() => {
    clear.run();
    let inserted = 0;
    const warnings = [];
    for (const { title, _id_commune } of LINKS) {
      const s = findScenario.get(title);
      if (!s) {
        warnings.push(`Scenario not found for title: ${title}`);
        continue;
      }
      const res = insert.run(s._id_scenario, _id_commune);
      inserted += res.changes || 0;
    }
    return { inserted, warnings };
  });

  const { inserted, warnings } = run();
  console.log(
    `scenario_communes seed complete. Links inserted: ${inserted}. Warnings: ${warnings.length}`
  );
  if (warnings.length) {
    for (const w of warnings) console.warn("WARN:", w);
  }
};

seedScenarioCommunes();
