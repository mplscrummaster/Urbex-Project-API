import express from "express";
import db from "../db/index.js";
import { requireAuth } from "../middleware/auth.js";
import { canEditMission } from "../middleware/rbac.js";

const router = express.Router();

// Add prerequisites to a mission (replace set)
router.put(
  "/missions/:id/prerequisites",
  requireAuth,
  canEditMission,
  (req, res) => {
    const missionId = Number(req.params.id);
    const { prerequisites } = req.body; // array of mission IDs
    if (!Array.isArray(prerequisites))
      return res.status(400).json({ error: "prerequisites must be an array" });
    // ensure all missions exist and belong to same scenario
    const mission = db
      .prepare(`SELECT * FROM missions WHERE _id_mission=?`)
      .get(missionId);
    if (!mission) return res.status(404).json({ error: "Mission not found" });
    const placeholders = prerequisites.map(() => "?").join(",");
    if (prerequisites.length) {
      const others = db
        .prepare(
          `SELECT _id_mission, _id_scenario FROM missions WHERE _id_mission IN (${placeholders})`
        )
        .all(...prerequisites);
      if (others.length !== prerequisites.length)
        return res
          .status(400)
          .json({ error: "One or more prerequisite missions not found" });
      if (others.some((o) => o._id_scenario !== mission._id_scenario))
        return res
          .status(400)
          .json({ error: "Prerequisites must be in same scenario" });
      if (prerequisites.includes(missionId))
        return res
          .status(400)
          .json({ error: "Mission cannot depend on itself" });
    }

    db.transaction(() => {
      db.prepare(`DELETE FROM mission_dependencies WHERE _id_mission=?`).run(
        missionId
      );
      const insert = db.prepare(
        `INSERT INTO mission_dependencies(_id_mission,_id_mission_required) VALUES (?,?)`
      );
      for (const reqId of prerequisites) insert.run(missionId, reqId);
    })();

    const deps = db
      .prepare(
        `SELECT _id_mission_required FROM mission_dependencies WHERE _id_mission=?`
      )
      .all(missionId)
      .map((r) => r._id_mission_required);
    res.json({ _id_mission: missionId, prerequisites: deps });
  }
);

// Get prerequisites for a mission
router.get("/missions/:id/prerequisites", requireAuth, (req, res) => {
  const missionId = Number(req.params.id);
  const mission = db
    .prepare(`SELECT * FROM missions WHERE _id_mission=?`)
    .get(missionId);
  if (!mission) return res.status(404).json({ error: "Mission not found" });
  const deps = db
    .prepare(
      `SELECT _id_mission_required FROM mission_dependencies WHERE _id_mission=?`
    )
    .all(missionId)
    .map((r) => r._id_mission_required);
  res.json({ _id_mission: missionId, prerequisites: deps });
});

export default router;
