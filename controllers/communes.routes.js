import { Router } from "express";
import db from "../db/index.js";
import requireAuth from "../middleware/auth.js";
import { canEditScenario } from "../middleware/rbac.js";

const router = Router();

// NOTE: Communes dataset is canonical & read-only; schema: name_fr, name_nl, name_de, geo_point_lat, geo_point_lon, geo_shape_geojson, postal_codes

// GET /api/communes - list communes (q search across multilingual names, optional postal filter)
router.get("/communes", (req, res) => {
  try {
    const { q, postal } = req.query || {};
    const clauses = [];
    const params = [];
    if (q) {
      const like = `%${String(q).toLowerCase()}%`;
      clauses.push(
        "(LOWER(name_fr) LIKE ? OR LOWER(name_nl) LIKE ? OR LOWER(name_de) LIKE ?)"
      );
      params.push(like, like, like);
    }
    if (postal) {
      // postal_codes stored as string e.g. '1000,1005' -> simple LIKE match
      clauses.push("postal_codes LIKE ?");
      params.push(`%${postal}%`);
    }
    const where = clauses.length ? "WHERE " + clauses.join(" AND ") : "";
    const sql = `SELECT 
      _id_commune AS id,
      name_fr,
      name_nl,
      name_de,
      geo_point_lat AS lat,
      geo_point_lon AS lon,
      postal_codes,
      geo_shape_geojson
    FROM communes ${where} ORDER BY name_fr ASC`;
    const rows = db.prepare(sql).all(...params);
    res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/communes/:id - single commune + associated scenarios
router.get("/communes/:id", (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(id) || id <= 0)
    return res.status(400).json({ error: "invalid id" });
  try {
    const commune = db
      .prepare(
        `SELECT _id_commune AS id, name_fr, name_nl, name_de, geo_point_lat AS lat, geo_point_lon AS lon, postal_codes, geo_shape_geojson FROM communes WHERE _id_commune = ?`
      )
      .get(id);
    if (!commune) return res.status(404).json({ error: "commune not found" });
    const scenarios = db
      .prepare(
        `SELECT s._id_scenario AS id, s.title_scenario
         FROM scenario_communes sc
         JOIN scenarios s ON s._id_scenario = sc._id_scenario
         WHERE sc._id_commune = ?
         ORDER BY s.title_scenario ASC`
      )
      .all(id);
    res.json({ ...commune, scenarios });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/scenarios/:id/communes - communes linked to scenario
router.get("/scenarios/:id/communes", (req, res) => {
  const scenarioId = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(scenarioId) || scenarioId <= 0)
    return res.status(400).json({ error: "invalid scenario id" });
  try {
    const rows = db
      .prepare(
        `SELECT c._id_commune AS id, c.name_fr, c.name_nl, c.name_de, c.geo_point_lat AS lat, c.geo_point_lon AS lon, c.postal_codes
         FROM scenario_communes sc
         JOIN communes c ON c._id_commune = sc._id_commune
         WHERE sc._id_scenario = ? ORDER BY c.name_fr ASC`
      )
      .all(scenarioId);
    res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/scenarios/:id/communes - attach communes to scenario (replace set) { commune_ids: [..] }
router.post("/scenarios/:id/communes", requireAuth, (req, res) => {
  const scenarioId = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(scenarioId) || scenarioId <= 0)
    return res.status(400).json({ error: "invalid scenario id" });
  const { commune_ids } = req.body || {};
  if (!Array.isArray(commune_ids))
    return res.status(400).json({ error: "commune_ids array required" });
  try {
    if (!canEditScenario(req.auth?.sub, scenarioId))
      return res.status(403).json({ error: "forbidden" });
    const uniqueIds = [
      ...new Set(commune_ids.filter((n) => Number.isFinite(n) && n > 0)),
    ];
    const existsScenario = db
      .prepare("SELECT 1 FROM scenarios WHERE _id_scenario = ?")
      .get(scenarioId);
    if (!existsScenario)
      return res.status(404).json({ error: "scenario not found" });
    // Validate communes
    if (uniqueIds.length) {
      const placeholders = uniqueIds.map(() => "?").join(",");
      const found = db
        .prepare(
          `SELECT _id_commune FROM communes WHERE _id_commune IN (${placeholders})`
        )
        .all(...uniqueIds)
        .map((r) => r._id_commune);
      if (found.length !== uniqueIds.length)
        return res.status(400).json({ error: "some commune_ids invalid" });
    }
    const trx = db.transaction((ids) => {
      db.prepare("DELETE FROM scenario_communes WHERE _id_scenario = ?").run(
        scenarioId
      );
      const insert = db.prepare(
        "INSERT INTO scenario_communes (_id_scenario, _id_commune) VALUES (?, ?)"
      );
      for (const idc of ids) insert.run(scenarioId, idc);
    });
    trx(uniqueIds);
    const rows = db
      .prepare(
        `SELECT c._id_commune AS id, c.name_fr, c.name_nl, c.name_de, c.geo_point_lat AS lat, c.geo_point_lon AS lon, c.postal_codes
         FROM scenario_communes sc JOIN communes c ON c._id_commune = sc._id_commune
         WHERE sc._id_scenario = ? ORDER BY c.name_fr ASC`
      )
      .all(scenarioId);
    res.status(200).json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
