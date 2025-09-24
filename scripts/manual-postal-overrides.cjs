#!/usr/bin/env node
/**
 * Ajout de corrections manuelles pour quelques communes non résolues ou ambigües.
 * - Ham-sur-Heure-Nalinnes: codes postaux officiels: 6120, 6121, 6122 (sections: Ham-sur-Heure, Nalinnes, Jamioulx, Marbaix-la-Tour)
 * - Saint-Nicolas (Liège) vs Sint-Niklaas (Saint-Nicolas en FR) -> déjà mappé sur 9100 pour Sint-Niklaas.
 *   Pour la commune de Saint-Nicolas (province de Liège): code postal principal 4420 + sections 4421, 4422 (Tilleur, Montegnée). On ajoute 4420,4421,4422.
 * - Kapellen: ne doit PAS contenir 3381 (qui correspond à la section Kapellen de Glabbeek). On force uniquement 2950.
 */
const db = require("better-sqlite3")("db/bdd.db");

function setCodesByExactName(frName, codes) {
  const row = db
    .prepare("SELECT _id_commune FROM communes WHERE name_fr = ?")
    .get(frName);
  if (!row) {
    console.warn("Nom introuvable pour override:", frName);
    return 0;
  }
  db.prepare("UPDATE communes SET postal_codes = ? WHERE _id_commune = ?").run(
    JSON.stringify(codes),
    row._id_commune
  );
  console.log("Override appliqué:", frName, "=>", codes.join(","));
  return 1;
}

let updated = 0;
updated += setCodesByExactName("Ham-sur-Heure-Nalinnes", [
  "6120",
  "6121",
  "6122",
]);
// Kapellen: suppression du code parasite 3381 (autre localité homonyme)
updated += setCodesByExactName("Kapellen", ["2950"]);
// Désambiguïsation Saint-Nicolas – on identifie celle SANS codes (Liège).
const saintRows = db
  .prepare(
    "SELECT _id_commune, postal_codes FROM communes WHERE name_fr='Saint-Nicolas'"
  )
  .all();
for (const r of saintRows) {
  if (!r.postal_codes) {
    db.prepare("UPDATE communes SET postal_codes=? WHERE _id_commune=?").run(
      JSON.stringify(["4420", "4421", "4422"]),
      r._id_commune
    );
    console.log("Override appliqué: Saint-Nicolas (Liège) => 4420,4421,4422");
    updated++;
  }
}

console.log("Overrides terminés. Communes mises à jour:", updated);
