import express from "express";
import db from "../db/index.js";
import requireAuth from "../middleware/auth.js";

const router = express.Router();

// Helpers
function getScenarioProgress(userId, scenarioId) {
  const scenario = db
    .prepare(`SELECT * FROM scenarios WHERE _id_scenario = ?`)
    .get(scenarioId);
  if (!scenario) return null;
  const progress = db
    .prepare(
      `SELECT * FROM scenario_progress WHERE _id_user = ? AND _id_scenario = ?`
    )
    .get(userId, scenarioId);
  const missions = db
    .prepare(
      `SELECT _id_mission, title_mission AS title, position_mission AS position FROM missions WHERE _id_scenario = ? ORDER BY position_mission`
    )
    .all(scenarioId);
  const completedMissionRows = db
    .prepare(
      `SELECT _id_mission FROM mission_progress WHERE _id_user = ? AND _id_mission IN (SELECT _id_mission FROM missions WHERE _id_scenario = ? )`
    )
    .all(userId, scenarioId);
  const completedMissionIds = new Set(
    completedMissionRows.map((r) => r._id_mission)
  );

  // prerequisites
  const depsRows = db
    .prepare(
      `SELECT md._id_mission, md._id_mission_required FROM mission_dependencies md JOIN missions m ON m._id_mission = md._id_mission WHERE m._id_scenario = ?`
    )
    .all(scenarioId);
  const depsMap = depsRows.reduce((acc, r) => {
    (acc[r._id_mission] ||= []).push(r._id_mission_required);
    return acc;
  }, {});

  const missionsWithState = missions.map((m) => {
    const required = depsMap[m._id_mission] || [];
    const locked = required.some((req) => !completedMissionIds.has(req));
    return {
      ...m,
      completed: completedMissionIds.has(m._id_mission),
      locked,
      prerequisites: required,
    };
  });

  return {
    scenario: {
      _id_scenario: scenario._id_scenario,
      title: scenario.title_scenario,
    },
    progress: progress
      ? {
          status: progress.status,
          bookmarked: !!progress.bookmarked,
          started_at: progress.started_at,
          completed_at: progress.completed_at,
        }
      : { status: "not_started", bookmarked: false },
    missions: missionsWithState,
  };
}

// Start (or bookmark) a scenario
router.post("/scenarios/:id/start", requireAuth, (req, res) => {
  const userId = req.auth.sub;
  const scenarioId = Number(req.params.id);
  const scenario = db
    .prepare(`SELECT * FROM scenarios WHERE _id_scenario = ?`)
    .get(scenarioId);
  if (!scenario) return res.status(404).json({ error: "Scenario not found" });

  const now = new Date().toISOString();
  const existing = db
    .prepare(
      `SELECT * FROM scenario_progress WHERE _id_user = ? AND _id_scenario = ?`
    )
    .get(userId, scenarioId);
  if (!existing) {
    db.prepare(
      `INSERT INTO scenario_progress(_id_user,_id_scenario,status,bookmarked,started_at,last_interaction_at) VALUES (?,?,?,?,?,?)`
    ).run(userId, scenarioId, "started", 1, now, now);
  } else if (existing.status === "not_started") {
    db.prepare(
      `UPDATE scenario_progress SET status='started', started_at=?, bookmarked=1, last_interaction_at=? WHERE _id_user=? AND _id_scenario=?`
    ).run(now, now, userId, scenarioId);
  } else {
    // ensure it's bookmarked
    if (!existing.bookmarked) {
      db.prepare(
        `UPDATE scenario_progress SET bookmarked=1, last_interaction_at=? WHERE _id_user=? AND _id_scenario=?`
      ).run(now, userId, scenarioId);
    }
  }
  return res.json(getScenarioProgress(userId, scenarioId));
});

// Explicit bookmark without starting (status stays not_started)
router.post("/scenarios/:id/bookmark", requireAuth, (req, res) => {
  const userId = req.auth.sub;
  const scenarioId = Number(req.params.id);
  const scenario = db
    .prepare(`SELECT 1 FROM scenarios WHERE _id_scenario = ?`)
    .get(scenarioId);
  if (!scenario) return res.status(404).json({ error: "Scenario not found" });
  const now = new Date().toISOString();
  const existing = db
    .prepare(
      `SELECT * FROM scenario_progress WHERE _id_user = ? AND _id_scenario = ?`
    )
    .get(userId, scenarioId);
  if (!existing) {
    db.prepare(
      `INSERT INTO scenario_progress(_id_user,_id_scenario,status,bookmarked,last_interaction_at) VALUES (?,?,?,?,?)`
    ).run(userId, scenarioId, "not_started", 1, now);
  } else if (!existing.bookmarked) {
    db.prepare(
      `UPDATE scenario_progress SET bookmarked=1,last_interaction_at=? WHERE _id_user=? AND _id_scenario=?`
    ).run(now, userId, scenarioId);
  }
  return res.json(getScenarioProgress(userId, scenarioId));
});

// Remove bookmark: delete progress & related mission progress to fully reset
router.delete("/scenarios/:id/bookmark", requireAuth, (req, res) => {
  const userId = req.auth.sub;
  const scenarioId = Number(req.params.id);
  const existing = db
    .prepare(
      `SELECT * FROM scenario_progress WHERE _id_user=? AND _id_scenario=?`
    )
    .get(userId, scenarioId);
  if (!existing) return res.status(204).end();
  db.transaction(() => {
    // delete mission progress for this scenario
    db.prepare(
      `DELETE FROM mission_progress WHERE _id_user=? AND _id_mission IN (SELECT _id_mission FROM missions WHERE _id_scenario=?)`
    ).run(userId, scenarioId);
    db.prepare(
      `DELETE FROM scenario_progress WHERE _id_user=? AND _id_scenario=?`
    ).run(userId, scenarioId);
  })();
  return res.status(204).end();
});

// Complete a mission
router.post("/missions/:id/complete", requireAuth, (req, res) => {
  const userId = req.auth.sub;
  const missionId = Number(req.params.id);
  const mission = db
    .prepare(`SELECT * FROM missions WHERE _id_mission = ?`)
    .get(missionId);
  if (!mission) return res.status(404).json({ error: "Mission not found" });

  // prerequisites check
  const unmet = db
    .prepare(
      `SELECT md._id_mission_required as req_id FROM mission_dependencies md WHERE md._id_mission=? AND md._id_mission_required NOT IN (SELECT _id_mission FROM mission_progress WHERE _id_user=?)`
    )
    .all(missionId, userId);
  if (unmet.length)
    return res.status(400).json({
      error: "Prerequisites not completed",
      missing: unmet.map((r) => r.req_id),
    });

  const now = new Date().toISOString();
  // ensure scenario progress row exists & started
  const scenarioProgress = db
    .prepare(
      `SELECT * FROM scenario_progress WHERE _id_user=? AND _id_scenario=?`
    )
    .get(userId, mission._id_scenario);
  if (!scenarioProgress) {
    db.prepare(
      `INSERT INTO scenario_progress(_id_user,_id_scenario,status,bookmarked,started_at,last_interaction_at) VALUES (?,?,?,?,?,?)`
    ).run(userId, mission._id_scenario, "started", 1, now, now);
  } else if (scenarioProgress.status === "not_started") {
    db.prepare(
      `UPDATE scenario_progress SET status='started', started_at=?, last_interaction_at=? WHERE _id_user=? AND _id_scenario=?`
    ).run(now, now, userId, mission._id_scenario);
  }

  // insert mission completion if not already
  try {
    db.prepare(
      `INSERT INTO mission_progress(_id_user,_id_mission) VALUES (?,?)`
    ).run(userId, missionId);
  } catch (e) {
    // ignore constraint errors (already completed)
  }

  // check if scenario is fully completed (all missions done)
  const totalMissions = db
    .prepare(`SELECT COUNT(*) as c FROM missions WHERE _id_scenario=?`)
    .get(mission._id_scenario).c;
  const completedCount = db
    .prepare(
      `SELECT COUNT(*) as c FROM mission_progress mp JOIN missions m ON m._id_mission=mp._id_mission WHERE mp._id_user=? AND m._id_scenario=?`
    )
    .get(userId, mission._id_scenario).c;
  if (totalMissions > 0 && completedCount === totalMissions) {
    db.prepare(
      `UPDATE scenario_progress SET status='completed', completed_at=?, last_interaction_at=? WHERE _id_user=? AND _id_scenario=?`
    ).run(now, now, userId, mission._id_scenario);
  } else {
    db.prepare(
      `UPDATE scenario_progress SET last_interaction_at=? WHERE _id_user=? AND _id_scenario=?`
    ).run(now, userId, mission._id_scenario);
  }

  return res.json(getScenarioProgress(userId, mission._id_scenario));
});

// Get scenario progress detail
router.get("/scenarios/:id/progress", requireAuth, (req, res) => {
  const data = getScenarioProgress(req.auth.sub, Number(req.params.id));
  if (!data) return res.status(404).json({ error: "Scenario not found" });
  return res.json(data);
});

// List my scenarios with progress (bookmarks first)
router.get("/me/scenarios", requireAuth, (req, res) => {
  const userId = req.auth.sub;
  const rows = db
    .prepare(
      `SELECT 
         s._id_scenario AS id,
         s.title_scenario AS title,
         COALESCE(sp.status,'not_started') as status,
         COALESCE(sp.bookmarked,0) as bookmarked,
         sp.started_at,
         sp.completed_at
       FROM scenarios s
       LEFT JOIN scenario_progress sp ON sp._id_scenario = s._id_scenario AND sp._id_user = ?
       WHERE sp.bookmarked = 1 OR sp.status IS NOT NULL
       ORDER BY sp.bookmarked DESC, sp.last_interaction_at DESC NULLS LAST, s.title_scenario`
    )
    .all(userId);
  return res.json(rows);
});

export default router;
