import { Router } from "express";
import db from "../db/index.js";
import requireAuth from "../middleware/auth.js";
import { canEditScenario, canEditMission } from "../middleware/rbac.js";

const router = Router();

// CREATE scenario mission
router.post("/scenarios/:id/missions", requireAuth, (req, res) => {
  const scenarioId = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(scenarioId) || scenarioId <= 0) {
    return res.status(400).json({ error: "invalid scenario id" });
  }
  const {
    title_mission,
    latitude,
    longitude,
    riddle_text,
    answer_word,

    position_mission,
  } = req.body || {};
  if (
    !title_mission ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    !riddle_text ||
    !answer_word
  ) {
    return res.status(400).json({
      error:
        "title_mission, latitude, longitude, riddle_text, answer_word are required",
    });
  }
  try {
    const exists = db
      .prepare("SELECT 1 FROM scenarios WHERE _id_scenario = ?")
      .get(scenarioId);
    if (!exists) return res.status(404).json({ error: "scenario not found" });
    if (!canEditScenario(req.auth?.sub, scenarioId))
      return res.status(403).json({ error: "forbidden" });

    // determine position if not provided: max(position)+1
    let position = position_mission;
    if (!Number.isFinite(position)) {
      const maxPos = db
        .prepare(
          "SELECT COALESCE(MAX(position_mission), 0) AS maxp FROM missions WHERE _id_scenario = ?"
        )
        .get(scenarioId)?.maxp;
      position = Number(maxPos) + 1;
    }

    const stmt = db.prepare(`INSERT INTO missions
      (_id_scenario, position_mission, title_mission, latitude, longitude, riddle_text, answer_word)
      VALUES (?, ?, ?, ?, ?, ?, ?)`);
    const info = stmt.run(
      scenarioId,
      position,
      title_mission,
      latitude,
      longitude,
      riddle_text,
      answer_word
    );

    const created = db
      .prepare(
        `SELECT 
        _id_mission AS id,
        position_mission AS position,
        title_mission AS title,
        latitude, longitude,
        riddle_text, answer_word
      FROM missions WHERE _id_mission = ?`
      )
      .get(Number(info.lastInsertRowid));
    return res.status(201).json(created);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// READ mission
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

// READ scenario missions
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
           answer_word
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

// UPDATE mission
router.put("/missions/:id", requireAuth, (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(id) || id <= 0)
    return res.status(400).json({ error: "invalid id" });
  const allowed = [
    "position_mission",
    "title_mission",
    "latitude",
    "longitude",
    "riddle_text",
    "answer_word",
  ];
  const payload = req.body || {};
  const keys = Object.keys(payload).filter((k) => allowed.includes(k));
  if (keys.length === 0)
    return res.status(400).json({ error: "no valid fields to update" });
  try {
    if (!canEditMission(req.auth?.sub, id))
      return res.status(403).json({ error: "forbidden" });
    const setClause = keys.map((k) => `${k} = ?`).join(", ");
    const values = keys.map((k) => payload[k]);
    const info = db
      .prepare(`UPDATE missions SET ${setClause} WHERE _id_mission = ?`)
      .run(...values, id);
    if (info.changes === 0)
      return res.status(404).json({ error: "mission not found" });
    const updated = db
      .prepare(
        `SELECT 
        _id_mission AS id,
        position_mission AS position,
        title_mission AS title,
        latitude, longitude,
        riddle_text, answer_word
      FROM missions WHERE _id_mission = ?`
      )
      .get(id);
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// UPDATE scenario mission order
router.put("/scenarios/:id/missions/reorder", requireAuth, (req, res) => {
  const scenarioId = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(scenarioId) || scenarioId <= 0)
    return res.status(400).json({ error: "invalid scenario id" });
  const items = Array.isArray(req.body) ? req.body : [];
  if (items.length === 0)
    return res.status(400).json({ error: "expected array of {id, position}" });
  try {
    if (!canEditScenario(req.auth?.sub, scenarioId))
      return res.status(403).json({ error: "forbidden" });
    const trx = db.transaction((updates) => {
      for (const u of updates) {
        if (!Number.isFinite(u.id) || !Number.isFinite(u.position)) {
          throw new Error("invalid id/position in payload");
        }
        db.prepare(
          "UPDATE missions SET position_mission = ? WHERE _id_mission = ? AND _id_scenario = ?"
        ).run(u.position, u.id, scenarioId);
      }
    });
    trx(items);
    const rows = db
      .prepare(
        `SELECT _id_mission AS id, position_mission AS position, title_mission AS title, latitude, longitude, riddle_text, answer_word
       FROM missions WHERE _id_scenario = ? ORDER BY position_mission ASC`
      )
      .all(scenarioId);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE mission
router.delete("/missions/:id", requireAuth, (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(id) || id <= 0)
    return res.status(400).json({ error: "invalid id" });
  try {
    if (!canEditMission(req.auth?.sub, id))
      return res.status(403).json({ error: "forbidden" });
    const info = db
      .prepare("DELETE FROM missions WHERE _id_mission = ?")
      .run(id);
    if (info.changes === 0)
      return res.status(404).json({ error: "mission not found" });
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
