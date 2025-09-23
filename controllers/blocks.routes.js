import { Router } from "express";
import db from "../db/index.js";

const router = Router();

// GET /api/scenarios/:id/intro — ordered intro blocks for a scenario
router.get("/scenarios/:id/intro", (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(id) || id <= 0)
    return res.status(400).json({ error: "invalid id" });
  try {
    const rows = db
      .prepare(
        `SELECT 
           _id_block AS id,
           position_block AS position,
           type_block AS type,
           content_text,
           url_media,
           caption
         FROM blocks
         WHERE owner_type = 'scenario_intro' AND _id_scenario = ?
         ORDER BY position_block ASC`
      )
      .all(id);
    res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/scenarios/:id/outro — ordered outro blocks for a scenario
router.get("/scenarios/:id/outro", (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(id) || id <= 0)
    return res.status(400).json({ error: "invalid id" });
  try {
    const rows = db
      .prepare(
        `SELECT 
           _id_block AS id,
           position_block AS position,
           type_block AS type,
           content_text,
           url_media,
           caption
         FROM blocks
         WHERE owner_type = 'scenario_outro' AND _id_scenario = ?
         ORDER BY position_block ASC`
      )
      .all(id);
    res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/missions/:id/blocks — ordered content blocks for a mission
router.get("/missions/:id/blocks", (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(id) || id <= 0)
    return res.status(400).json({ error: "invalid id" });
  try {
    const rows = db
      .prepare(
        `SELECT 
           _id_block AS id,
           position_block AS position,
           type_block AS type,
           content_text,
           url_media,
           caption
         FROM blocks
         WHERE owner_type = 'mission' AND _id_mission = ?
         ORDER BY position_block ASC`
      )
      .all(id);
    res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
