import { Router } from "express";
import db from "../db/index.js";

const router = Router();

// Connexion unique better-sqlite3 via module partagé

// GET /api/scenarios — liste des scénarios (lecture seule)
router.get("/scenarios", (_req, res) => {
  try {
    const rows = db
      .prepare(
        `SELECT _id_scenario AS id, title_scenario, intro_scenario, url_img_scenario FROM scenarios`
      )
      .all();
    res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/scenarios/:id — un scénario par id
router.get("/scenarios/:id", (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ error: "invalid id" });
  }
  try {
    const row = db
      .prepare(
        `SELECT _id_scenario AS id, title_scenario, intro_scenario, url_img_scenario FROM scenarios WHERE _id_scenario = ?`
      )
      .get(id);
    if (!row) return res.status(404).json({ error: "scenario not found" });
    res.json(row);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
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
