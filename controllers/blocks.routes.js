import { Router } from "express";
import db from "../db/index.js";
import requireAuth from "../middleware/auth.js";

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

// CREATE intro block for scenario
router.post("/scenarios/:id/intro/blocks", requireAuth, (req, res) => {
  const scenarioId = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(scenarioId) || scenarioId <= 0)
    return res.status(400).json({ error: "invalid scenario id" });
  const {
    type_block,
    content_text = null,
    url_media = null,
    caption = null,
    position_block,
  } = req.body || {};
  if (!type_block)
    return res.status(400).json({ error: "type_block is required" });
  const owner_type = "scenario_intro";
  try {
    const exists = db
      .prepare("SELECT 1 FROM scenarios WHERE _id_scenario = ?")
      .get(scenarioId);
    if (!exists) return res.status(404).json({ error: "scenario not found" });

    let position = position_block;
    if (!Number.isFinite(position)) {
      const maxPos = db
        .prepare(
          `SELECT COALESCE(MAX(position_block), 0) AS maxp FROM blocks WHERE owner_type = ? AND _id_scenario = ?`
        )
        .get(owner_type, scenarioId)?.maxp;
      position = Number(maxPos) + 1;
    }
    const info = db
      .prepare(
        `INSERT INTO blocks (owner_type, _id_scenario, position_block, type_block, content_text, url_media, caption)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        owner_type,
        scenarioId,
        position,
        type_block,
        content_text,
        url_media,
        caption
      );
    const created = db
      .prepare(
        `SELECT _id_block AS id, position_block AS position, type_block AS type, content_text, url_media, caption
       FROM blocks WHERE _id_block = ?`
      )
      .get(Number(info.lastInsertRowid));
    return res.status(201).json(created);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// CREATE outro block for scenario
router.post("/scenarios/:id/outro/blocks", requireAuth, (req, res) => {
  const scenarioId = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(scenarioId) || scenarioId <= 0)
    return res.status(400).json({ error: "invalid scenario id" });
  const {
    type_block,
    content_text = null,
    url_media = null,
    caption = null,
    position_block,
  } = req.body || {};
  if (!type_block)
    return res.status(400).json({ error: "type_block is required" });
  const owner_type = "scenario_outro";
  try {
    const exists = db
      .prepare("SELECT 1 FROM scenarios WHERE _id_scenario = ?")
      .get(scenarioId);
    if (!exists) return res.status(404).json({ error: "scenario not found" });

    let position = position_block;
    if (!Number.isFinite(position)) {
      const maxPos = db
        .prepare(
          `SELECT COALESCE(MAX(position_block), 0) AS maxp FROM blocks WHERE owner_type = ? AND _id_scenario = ?`
        )
        .get(owner_type, scenarioId)?.maxp;
      position = Number(maxPos) + 1;
    }
    const info = db
      .prepare(
        `INSERT INTO blocks (owner_type, _id_scenario, position_block, type_block, content_text, url_media, caption)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        owner_type,
        scenarioId,
        position,
        type_block,
        content_text,
        url_media,
        caption
      );
    const created = db
      .prepare(
        `SELECT _id_block AS id, position_block AS position, type_block AS type, content_text, url_media, caption
       FROM blocks WHERE _id_block = ?`
      )
      .get(Number(info.lastInsertRowid));
    return res.status(201).json(created);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// CREATE block for a mission
router.post("/missions/:id/blocks", requireAuth, (req, res) => {
  const missionId = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(missionId) || missionId <= 0)
    return res.status(400).json({ error: "invalid mission id" });
  const {
    type_block,
    content_text = null,
    url_media = null,
    caption = null,
    position_block,
  } = req.body || {};
  if (!type_block)
    return res.status(400).json({ error: "type_block is required" });
  try {
    const exists = db
      .prepare("SELECT 1 FROM missions WHERE _id_mission = ?")
      .get(missionId);
    if (!exists) return res.status(404).json({ error: "mission not found" });
    let position = position_block;
    if (!Number.isFinite(position)) {
      const maxPos = db
        .prepare(
          `SELECT COALESCE(MAX(position_block), 0) AS maxp FROM blocks WHERE owner_type = 'mission' AND _id_mission = ?`
        )
        .get(missionId)?.maxp;
      position = Number(maxPos) + 1;
    }
    const info = db
      .prepare(
        `INSERT INTO blocks (owner_type, _id_mission, position_block, type_block, content_text, url_media, caption)
       VALUES ('mission', ?, ?, ?, ?, ?, ?)`
      )
      .run(missionId, position, type_block, content_text, url_media, caption);
    const created = db
      .prepare(
        `SELECT _id_block AS id, position_block AS position, type_block AS type, content_text, url_media, caption
       FROM blocks WHERE _id_block = ?`
      )
      .get(Number(info.lastInsertRowid));
    return res.status(201).json(created);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// UPDATE block
router.put("/blocks/:id", requireAuth, (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(id) || id <= 0)
    return res.status(400).json({ error: "invalid id" });
  const allowed = [
    "position_block",
    "type_block",
    "content_text",
    "url_media",
    "caption",
  ];
  const payload = req.body || {};
  const keys = Object.keys(payload).filter((k) => allowed.includes(k));
  if (keys.length === 0)
    return res.status(400).json({ error: "no valid fields to update" });
  try {
    const setClause = keys.map((k) => `${k} = ?`).join(", ");
    const values = keys.map((k) => payload[k]);
    const info = db
      .prepare(`UPDATE blocks SET ${setClause} WHERE _id_block = ?`)
      .run(...values, id);
    if (info.changes === 0)
      return res.status(404).json({ error: "block not found" });
    const updated = db
      .prepare(
        `SELECT _id_block AS id, position_block AS position, type_block AS type, content_text, url_media, caption FROM blocks WHERE _id_block = ?`
      )
      .get(id);
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE block
router.delete("/blocks/:id", requireAuth, (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(id) || id <= 0)
    return res.status(400).json({ error: "invalid id" });
  try {
    const info = db.prepare("DELETE FROM blocks WHERE _id_block = ?").run(id);
    if (info.changes === 0)
      return res.status(404).json({ error: "block not found" });
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// REORDER intro blocks for a scenario
router.put("/scenarios/:id/intro/blocks/reorder", requireAuth, (req, res) => {
  const scenarioId = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(scenarioId) || scenarioId <= 0)
    return res.status(400).json({ error: "invalid scenario id" });
  const items = Array.isArray(req.body) ? req.body : [];
  if (items.length === 0)
    return res.status(400).json({ error: "expected array of {id, position}" });
  const owner_type = "scenario_intro";
  try {
    const trx = db.transaction((updates) => {
      for (const u of updates) {
        if (!Number.isFinite(u.id) || !Number.isFinite(u.position)) {
          throw new Error("invalid id/position in payload");
        }
        db.prepare(
          "UPDATE blocks SET position_block = ? WHERE _id_block = ? AND owner_type = ? AND _id_scenario = ?"
        ).run(u.position, u.id, owner_type, scenarioId);
      }
    });
    trx(items);
    const rows = db
      .prepare(
        `SELECT _id_block AS id, position_block AS position, type_block AS type, content_text, url_media, caption
       FROM blocks WHERE owner_type = ? AND _id_scenario = ? ORDER BY position_block ASC`
      )
      .all(owner_type, scenarioId);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// REORDER outro blocks for a scenario
router.put("/scenarios/:id/outro/blocks/reorder", requireAuth, (req, res) => {
  const scenarioId = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(scenarioId) || scenarioId <= 0)
    return res.status(400).json({ error: "invalid scenario id" });
  const items = Array.isArray(req.body) ? req.body : [];
  if (items.length === 0)
    return res.status(400).json({ error: "expected array of {id, position}" });
  const owner_type = "scenario_outro";
  try {
    const trx = db.transaction((updates) => {
      for (const u of updates) {
        if (!Number.isFinite(u.id) || !Number.isFinite(u.position)) {
          throw new Error("invalid id/position in payload");
        }
        db.prepare(
          "UPDATE blocks SET position_block = ? WHERE _id_block = ? AND owner_type = ? AND _id_scenario = ?"
        ).run(u.position, u.id, owner_type, scenarioId);
      }
    });
    trx(items);
    const rows = db
      .prepare(
        `SELECT _id_block AS id, position_block AS position, type_block AS type, content_text, url_media, caption
       FROM blocks WHERE owner_type = ? AND _id_scenario = ? ORDER BY position_block ASC`
      )
      .all(owner_type, scenarioId);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// REORDER blocks for a mission
router.put("/missions/:id/blocks/reorder", requireAuth, (req, res) => {
  const missionId = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(missionId) || missionId <= 0)
    return res.status(400).json({ error: "invalid mission id" });
  const items = Array.isArray(req.body) ? req.body : [];
  if (items.length === 0)
    return res.status(400).json({ error: "expected array of {id, position}" });
  try {
    const trx = db.transaction((updates) => {
      for (const u of updates) {
        if (!Number.isFinite(u.id) || !Number.isFinite(u.position)) {
          throw new Error("invalid id/position in payload");
        }
        db.prepare(
          "UPDATE blocks SET position_block = ? WHERE _id_block = ? AND owner_type = 'mission' AND _id_mission = ?"
        ).run(u.position, u.id, missionId);
      }
    });
    trx(items);
    const rows = db
      .prepare(
        `SELECT _id_block AS id, position_block AS position, type_block AS type, content_text, url_media, caption
       FROM blocks WHERE owner_type = 'mission' AND _id_mission = ? ORDER BY position_block ASC`
      )
      .all(missionId);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
