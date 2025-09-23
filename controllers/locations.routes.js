import { Router } from "express";
import db from "../db/index.js";

const router = Router();

// GET /api/locations — list all locations (dev convenience)
router.get("/locations", (_req, res) => {
  try {
    const rows = db
      .prepare(
        `SELECT 
           l._id_location AS id,
           l.title_location,
           l.intro_location,
           l.url_img_location,
           l.latitude,
           l.longitude,
           l.riddle_text,
           l.answer_word,
           s._id_scenario AS scenario_id,
           s.title_scenario AS scenario_title
         FROM locations l
         JOIN scenarios s ON s._id_scenario = l._id_scenario`
      )
      .all();
    res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/scenarios/:id/locations — locations for a scenario
router.get("/scenarios/:id/locations", (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ error: "invalid id" });
  }
  try {
    const rows = db
      .prepare(
        `SELECT 
           _id_location AS id,
           title_location,
           intro_location,
           url_img_location,
           latitude,
           longitude,
           riddle_text,
           answer_word
         FROM locations WHERE _id_scenario = ?`
      )
      .all(id);
    res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/locations/:id — single location
router.get("/locations/:id", (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ error: "invalid id" });
  }
  try {
    const row = db
      .prepare(
        `SELECT 
           l._id_location AS id,
           l.title_location,
           l.intro_location,
           l.url_img_location,
           l.latitude,
           l.longitude,
           l.riddle_text,
           l.answer_word,
           s._id_scenario AS scenario_id,
           s.title_scenario AS scenario_title
         FROM locations l
         JOIN scenarios s ON s._id_scenario = l._id_scenario
         WHERE l._id_location = ?`
      )
      .get(id);
    if (!row) return res.status(404).json({ error: "location not found" });
    res.json(row);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
