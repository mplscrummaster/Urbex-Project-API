#!/usr/bin/env node
console.warn('[deprecated] Scenario<->communes links seeded in scripts/seed.js');
process.exit(0);
  { title: "Chroniques souterraines", _id_commune: 594 }, // Lievegem
  { title: "Chroniques souterraines", _id_commune: 925 }, // Eeklo
  // Nouveaux scénarios groupés à Fleurus (id 1043) – 5 scénarios
  { title: "Fissures de lumière", _id_commune: 1043 }, // Fleurus
  { title: "Cartographie des échos", _id_commune: 1043 }, // Fleurus
  { title: "Lignes fantômes", _id_commune: 1043 }, // Fleurus
  { title: "La chambre scellée", _id_commune: 1043 }, // Fleurus
  { title: "Balises du passé", _id_commune: 1043 }, // Fleurus
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
