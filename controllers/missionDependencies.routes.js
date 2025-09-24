import express from "express";
import db from "../db/index.js";
import requireAuth from "../middleware/auth.js";
import { canEditMission } from "../middleware/rbac.js";

const router = express.Router();

function requireCanEditMission(req, res, next) {
  const missionId = Number(req.params.id);
  if (!Number.isFinite(missionId) || missionId <= 0)
    return res.status(400).json({ error: "invalid mission id" });
  if (!canEditMission(req.auth?.sub, missionId))
    return res.status(403).json({ error: "forbidden" });
  next();
}

// Add / replace prerequisites set for a mission
router.put(
  "/missions/:id/prerequisites",
  requireAuth,
  requireCanEditMission,
  (req, res) => {
    const missionId = Number(req.params.id);
    const { prerequisites } = req.body || {};
    if (!Array.isArray(prerequisites))
      return res.status(400).json({ error: "prerequisites must be an array" });

    const mission = db
      .prepare(
        `SELECT _id_mission, _id_scenario FROM missions WHERE _id_mission=?`
      )
      .get(missionId);
    if (!mission) return res.status(404).json({ error: "Mission not found" });

    const unique = [
      ...new Set(
        prerequisites.map(Number).filter((n) => Number.isFinite(n) && n > 0)
      ),
    ];
    if (unique.includes(missionId))
      return res.status(400).json({ error: "Mission cannot depend on itself" });
    if (unique.length) {
      const placeholders = unique.map(() => "?").join(",");
      const others = db
        .prepare(
          `SELECT _id_mission, _id_scenario FROM missions WHERE _id_mission IN (${placeholders})`
        )
        .all(...unique);
      if (others.length !== unique.length)
        return res
          .status(400)
          .json({ error: "One or more prerequisite missions not found" });
      if (others.some((o) => o._id_scenario !== mission._id_scenario))
        return res
          .status(400)
          .json({ error: "Prerequisites must be in same scenario" });
    }

    db.transaction(() => {
      db.prepare(`DELETE FROM mission_dependencies WHERE _id_mission=?`).run(
        missionId
      );
      const insert = db.prepare(
        `INSERT INTO mission_dependencies(_id_mission,_id_mission_required) VALUES (?,?)`
      );
      for (const reqId of unique) insert.run(missionId, reqId);
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
