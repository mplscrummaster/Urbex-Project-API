import { Router } from "express";
import db from "../db/index.js";

const router = Router();

// GET /api/scenarios/:id/missions — ordered missions for a scenario
router.get("/scenarios/:id/missions", (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ error: "invalid id" });
  }
  try {
    const rows = db
      .prepare(
        `SELECT 
           _id_mission AS id,
           position_mission AS position,
           title_mission AS title,
           latitude,
           longitude,
           riddle_text,
           answer_word,
           url_img_mission AS url_img
         FROM missions
         WHERE _id_scenario = ?
         ORDER BY position_mission ASC`
      )
      .all(id);
    res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/missions/:id — single mission detail
router.get("/missions/:id", (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ error: "invalid id" });
  }
  try {
    const row = db
      .prepare(
        `SELECT 
           m._id_mission AS id,
           m.position_mission AS position,
           m.title_mission AS title,
           m.latitude,
           m.longitude,
           m.riddle_text,
           m.answer_word,
           m.url_img_mission AS url_img,
           s._id_scenario AS scenario_id,
           s.title_scenario AS scenario_title
         FROM missions m
         JOIN scenarios s ON s._id_scenario = m._id_scenario
         WHERE m._id_mission = ?`
      )
      .get(id);
    if (!row) return res.status(404).json({ error: "mission not found" });
    res.json(row);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
