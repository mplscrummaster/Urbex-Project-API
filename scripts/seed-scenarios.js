import sqlite3 from "sqlite3";
import fs from "fs";

const DB_PATH = "db/bdd.db";

function exit(code = 0) {
  process.exit(code);
}

if (!fs.existsSync(DB_PATH)) {
  console.error(`Database not found at ${DB_PATH}`);
  exit(1);
}

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error("SQLite connection error:", err.message);
    exit(1);
  }
});

db.serialize(() => {
  db.get("SELECT COUNT(*) AS c FROM scenarios", (err, row) => {
    if (err) {
      console.error("Failed to count scenarios:", err.message);
      db.close();
      return exit(1);
    }
    const count = row?.c ?? 0;
    if (count > 0) {
      console.log(`Scenarios already present (${count}), skipping.`);
      db.close();
      return exit(0);
    }

    const stmt = db.prepare(
      "INSERT INTO scenarios (title_scenario, intro_scenario, url_img_scenario) VALUES (?, ?, ?)"
    );
    const data = [
      [
        "Bruxelles abandonnée",
        "Explorez les lieux oubliés de Bruxelles: usines, hôpitaux et gares à l'abandon.",
        "https://example.com/img/scenario-bruxelles.jpg",
      ],
      [
        "Charleroi underground",
        "Sous-sol industriel et friches: itinéraire urbex au cœur du Pays Noir.",
        "https://example.com/img/scenario-charleroi.jpg",
      ],
      [
        "Liège méconnue",
        "De lîgotés aux terrils: parcours entre héritage et mystères.",
        "https://example.com/img/scenario-liege.jpg",
      ],
    ];

    for (const [t, i, u] of data) {
      stmt.run([t, i, u]);
    }
    stmt.finalize((e) => {
      if (e) {
        console.error("Failed to insert scenarios:", e.message);
        db.close();
        return exit(1);
      }
      console.log(`Inserted ${data.length} scenarios.`);
      db.close();
      return exit(0);
    });
  });
});
