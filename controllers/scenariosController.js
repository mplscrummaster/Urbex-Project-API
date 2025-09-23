import sqlite3 from "sqlite3";
import { Router } from "express";

const router = Router();

// Connexion SQLite (même fichier que users)
const db = new sqlite3.Database(`db/bdd.db`, (err) => {
  if (err) console.error("Erreur de connexion à la BDD (scenarios)");
  else console.log("Connecté à la BDD (scenarios)");
});

// GET /api/scenarios — liste des scénarios (lecture seule)
router.get("/scenarios", (_req, res) => {
  db.all(
    `SELECT _id_scenario AS id, title_scenario, intro_scenario, url_img_scenario FROM scenarios`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// GET /api/scenarios/:id — un scénario par id
router.get("/scenarios/:id", (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ error: "invalid id" });
  }
  db.get(
    `SELECT _id_scenario AS id, title_scenario, intro_scenario, url_img_scenario FROM scenarios WHERE _id_scenario = ?`,
    [id],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: "scenario not found" });
      res.json(row);
    }
  );
});

// GET /api/ (scenarios doc)
router.get(`/`, (_req, res) => {
  return res.status(200).json({
    routes: [
      { method: "GET", path: "/api/scenarios" },
      { method: "GET", path: "/api/scenarios/:id" },
    ],
  });
});

export default router;
