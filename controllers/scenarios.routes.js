import { Router } from "express";
import db from "../db/index.js";
import requireAuth from "../middleware/auth.js";

const router = Router();

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

// CREATE scenario
router.post("/scenarios", requireAuth, (req, res) => {
  const {
    title_scenario,
    intro_scenario = null,
    url_img_scenario = null,
  } = req.body || {};
  if (!title_scenario)
    return res.status(400).json({ error: "title_scenario is required" });
  try {
    const info = db
      .prepare(
        `INSERT INTO scenarios (title_scenario, intro_scenario, url_img_scenario) VALUES (?, ?, ?)`
      )
      .run(title_scenario, intro_scenario, url_img_scenario);
    const created = db
      .prepare(
        `SELECT _id_scenario AS id, title_scenario, intro_scenario, url_img_scenario FROM scenarios WHERE _id_scenario = ?`
      )
      .get(Number(info.lastInsertRowid));
    return res.status(201).json(created);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// UPDATE scenario
router.put("/scenarios/:id", requireAuth, (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(id) || id <= 0)
    return res.status(400).json({ error: "invalid id" });
  const allowed = ["title_scenario", "intro_scenario", "url_img_scenario"];
  const payload = req.body || {};
  const keys = Object.keys(payload).filter((k) => allowed.includes(k));
  if (keys.length === 0)
    return res.status(400).json({ error: "no valid fields to update" });
  try {
    const setClause = keys.map((k) => `${k} = ?`).join(", ");
    const values = keys.map((k) => payload[k]);
    const info = db
      .prepare(`UPDATE scenarios SET ${setClause} WHERE _id_scenario = ?`)
      .run(...values, id);
    if (info.changes === 0)
      return res.status(404).json({ error: "scenario not found" });
    const updated = db
      .prepare(
        `SELECT _id_scenario AS id, title_scenario, intro_scenario, url_img_scenario FROM scenarios WHERE _id_scenario = ?`
      )
      .get(id);
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE scenario (cascades to missions and blocks)
router.delete("/scenarios/:id", requireAuth, (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(id) || id <= 0)
    return res.status(400).json({ error: "invalid id" });
  try {
    const info = db
      .prepare("DELETE FROM scenarios WHERE _id_scenario = ?")
      .run(id);
    if (info.changes === 0)
      return res.status(404).json({ error: "scenario not found" });
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;

// GET /api/scenarios/:id/full — scenario + intro blocks + missions (with blocks) + outro blocks
router.get("/scenarios/:id/full", (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ error: "invalid id" });
  }
  try {
    // Scenario
    const scenario = db
      .prepare(
        `SELECT _id_scenario AS id, title_scenario, intro_scenario, url_img_scenario FROM scenarios WHERE _id_scenario = ?`
      )
      .get(id);
    if (!scenario) return res.status(404).json({ error: "scenario not found" });

    // Intro blocks
    const introBlocks = db
      .prepare(
        `SELECT _id_block AS id, position_block AS position, type_block AS type, content_text, url_media, caption
         FROM blocks WHERE owner_type = 'scenario_intro' AND _id_scenario = ? ORDER BY position_block ASC`
      )
      .all(id);

    // Outro blocks
    const outroBlocks = db
      .prepare(
        `SELECT _id_block AS id, position_block AS position, type_block AS type, content_text, url_media, caption
         FROM blocks WHERE owner_type = 'scenario_outro' AND _id_scenario = ? ORDER BY position_block ASC`
      )
      .all(id);

    // Missions for scenario (ordered)
    const missions = db
      .prepare(
        `SELECT _id_mission AS id, position_mission AS position, title_mission AS title, latitude, longitude, riddle_text, answer_word, url_img_mission AS url_img
         FROM missions WHERE _id_scenario = ? ORDER BY position_mission ASC`
      )
      .all(id);

    // If no missions, return without mission blocks
    if (missions.length === 0) {
      return res.json({ scenario, introBlocks, missions: [], outroBlocks });
    }

    // Fetch all mission blocks in one query and group by mission id
    const missionIds = missions.map((m) => m.id);
    const placeholders = missionIds.map(() => "?").join(",");
    const missionBlocks = db
      .prepare(
        `SELECT _id_block AS id, position_block AS position, type_block AS type, content_text, url_media, caption, _id_mission AS mission_id
         FROM blocks WHERE owner_type = 'mission' AND _id_mission IN (${placeholders}) ORDER BY _id_mission, position_block ASC`
      )
      .all(...missionIds);

    const byMission = new Map();
    for (const m of missions) byMission.set(m.id, []);
    for (const b of missionBlocks) {
      const arr = byMission.get(b.mission_id);
      if (arr)
        arr.push({
          id: b.id,
          position: b.position,
          type: b.type,
          content_text: b.content_text,
          url_media: b.url_media,
          caption: b.caption,
        });
    }

    const missionsWithBlocks = missions.map((m) => ({
      ...m,
      blocks: byMission.get(m.id) || [],
    }));

    res.json({
      scenario,
      introBlocks,
      missions: missionsWithBlocks,
      outroBlocks,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
