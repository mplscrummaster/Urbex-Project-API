import { Router } from "express";
import db from "../db/index.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// GET /api/scenarios — liste des scénarios (lecture seule)
router.get("/scenarios", (_req, res) => {
  try {
    const rows = db
      .prepare(
  `SELECT _id_scenario AS id, title_scenario, url_img_scenario, summary_scenario, difficulty, estimated_duration_min, is_published FROM scenarios`
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
  `SELECT _id_scenario AS id, title_scenario, url_img_scenario, summary_scenario, difficulty, estimated_duration_min, is_published FROM scenarios WHERE _id_scenario = ?`
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
  const body = req.body || {};
  const title_scenario = body.title_scenario;
  if (!title_scenario)
    return res.status(400).json({ error: "title_scenario is required" });
  const url_img_scenario = body.url_img_scenario ?? null;
  const summary_scenario = body.summary_scenario ?? null;
  const difficulty = body.difficulty ?? "easy";
  const estimated_duration_min = body.estimated_duration_min ?? null;
  const is_published = body.is_published ? 1 : 0;
  try {
    const info = db
      .prepare(
  `INSERT INTO scenarios (title_scenario,url_img_scenario,summary_scenario,difficulty,estimated_duration_min,is_published,created_by) VALUES (?,?,?,?,?,?,?)`
      )
      .run(
        title_scenario,
        url_img_scenario,
        summary_scenario,
        difficulty,
        estimated_duration_min,
        is_published,
        req.auth?._id_user ?? req.auth?.sub ?? null
      );
    const created = db
      .prepare(
        `SELECT _id_scenario AS id, title_scenario, url_img_scenario, summary_scenario, difficulty, estimated_duration_min, is_published, created_by FROM scenarios WHERE _id_scenario = ?`
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
  const allowed = [
    "title_scenario",
    "url_img_scenario",
    "summary_scenario",
    "difficulty",
    "estimated_duration_min",
    "is_published",
  ];
  const payload = req.body || {};
  const keys = Object.keys(payload).filter((k) => allowed.includes(k));
  if (keys.length === 0)
    return res.status(400).json({ error: "no valid fields to update" });
  try {
    // RBAC: allow if admin or author
    const owner = db
      .prepare("SELECT created_by FROM scenarios WHERE _id_scenario = ?")
      .get(id);
    if (!owner) return res.status(404).json({ error: "scenario not found" });
    const me = db
      .prepare("SELECT role_user FROM users WHERE _id_user = ?")
      .get(req.auth?.sub);
    const isAdmin = me?.role_user === "admin";
    const isAuthor = owner?.created_by === req.auth?.sub;
    if (!isAdmin && !isAuthor)
      return res.status(403).json({ error: "forbidden" });

    // Normalize boolean-like field
    if (keys.includes("is_published")) {
      payload.is_published = payload.is_published ? 1 : 0;
    }
    const setClause =
      keys.map((k) => `${k} = ?`).join(", ") + ", updated_at = datetime('now')";
    const values = keys.map((k) => payload[k]);
    const info = db
      .prepare(`UPDATE scenarios SET ${setClause} WHERE _id_scenario = ?`)
      .run(...values, id);
    if (info.changes === 0)
      return res.status(404).json({ error: "scenario not found" });
    const updated = db
      .prepare(
        `SELECT _id_scenario AS id, title_scenario, url_img_scenario, summary_scenario, difficulty, estimated_duration_min, is_published, created_by FROM scenarios WHERE _id_scenario = ?`
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
    // RBAC: allow if admin or author
    const owner = db
      .prepare("SELECT created_by FROM scenarios WHERE _id_scenario = ?")
      .get(id);
    if (!owner) return res.status(404).json({ error: "scenario not found" });
    const me = db
      .prepare("SELECT role_user FROM users WHERE _id_user = ?")
      .get(req.auth?.sub);
    const isAdmin = me?.role_user === "admin";
    const isAuthor = owner?.created_by === req.auth?.sub;
    if (!isAdmin && !isAuthor)
      return res.status(403).json({ error: "forbidden" });

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
          `SELECT _id_scenario AS id, title_scenario, url_img_scenario, summary_scenario, difficulty, estimated_duration_min, is_published FROM scenarios WHERE _id_scenario = ?`
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

    // Optionally enrich with progress if Authorization header is present and valid
    let progressData = null;
    try {
      // naive reuse of scenario_progress tables if auth decoded earlier in pipeline; if not ignore silently
      if (req.auth?._id_user) {
        const userId = req.auth._id_user;
        const sp = db
          .prepare(
            `SELECT status, bookmarked, started_at, completed_at FROM scenario_progress WHERE _id_user=? AND _id_scenario=?`
          )
          .get(userId, id);
        const completedMissionRows = db
          .prepare(
            `SELECT _id_mission FROM mission_progress WHERE _id_user=? AND _id_mission IN (SELECT _id_mission FROM missions WHERE _id_scenario=?)`
          )
          .all(userId, id);
        const completedSet = new Set(
          completedMissionRows.map((r) => r._id_mission)
        );
        progressData = {
          scenario: sp
            ? {
                status: sp.status,
                bookmarked: !!sp.bookmarked,
                started_at: sp.started_at,
                completed_at: sp.completed_at,
              }
            : { status: "not_started", bookmarked: false },
          completedMissionIds: Array.from(completedSet),
        };
      }
    } catch (_e) {
      // ignore progress enrichment errors to keep backwards compatibility
    }

    res.json({
      scenario,
      introBlocks,
      missions: missionsWithBlocks,
      outroBlocks,
      progress: progressData,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
