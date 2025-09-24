import { Router } from "express";
import db from "../db/index.js";
import requireAuth from "../middleware/auth.js";
import { isAdmin, canEditScenario } from "../middleware/rbac.js";

const router = Router();

// GET /api/communes - list communes (basic list, optional filter by region/province, q search)
router.get("/communes", (req, res) => {
  try {
    const { region, province, q } = req.query || {};
    const clauses = [];
    const params = [];
    if (region) {
      clauses.push("region = ?");
      params.push(region);
    }
    if (province) {
      clauses.push("province = ?");
      params.push(province);
    }
    if (q) {
      clauses.push("LOWER(name_commune) LIKE ?");
      params.push(`%${String(q).toLowerCase()}%`);
    }
    const where = clauses.length ? "WHERE " + clauses.join(" AND ") : "";
    const rows = db
      .prepare(
        `SELECT _id_commune AS id, name_commune, nis_code, region, province, latitude, longitude FROM communes ${where} ORDER BY name_commune ASC`
      )
      .all(...params);
    res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/communes/:id - single commune with scenarios referencing it
router.get("/communes/:id", (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(id) || id <= 0)
    return res.status(400).json({ error: "invalid id" });
  try {
    const commune = db
      .prepare(
        `SELECT _id_commune AS id, name_commune, nis_code, region, province, latitude, longitude FROM communes WHERE _id_commune = ?`
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

// POST /api/communes - create (admin only)
router.post("/communes", requireAuth, (req, res) => {
  if (!isAdmin(req.auth?.sub))
    return res.status(403).json({ error: "forbidden" });
  const {
    name_commune,
    nis_code = null,
    region = null,
    province = null,
    latitude = null,
    longitude = null,
  } = req.body || {};
  if (!name_commune)
    return res.status(400).json({ error: "name_commune is required" });
  try {
    const info = db
      .prepare(
        `INSERT INTO communes (name_commune, nis_code, region, province, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(name_commune, nis_code, region, province, latitude, longitude);
    const created = db
      .prepare(
        `SELECT _id_commune AS id, name_commune, nis_code, region, province, latitude, longitude FROM communes WHERE _id_commune = ?`
      )
      .get(Number(info.lastInsertRowid));
    res.status(201).json(created);
  } catch (err) {
    if (
      String(err.message || "")
        .toLowerCase()
        .includes("unique")
    ) {
      return res.status(409).json({ error: "nis_code already exists" });
    }
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/communes/:id - update (admin only)
router.put("/communes/:id", requireAuth, (req, res) => {
  if (!isAdmin(req.auth?.sub))
    return res.status(403).json({ error: "forbidden" });
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(id) || id <= 0)
    return res.status(400).json({ error: "invalid id" });
  const allowed = [
    "name_commune",
    "nis_code",
    "region",
    "province",
    "latitude",
    "longitude",
  ];
  const payload = req.body || {};
  const keys = Object.keys(payload).filter((k) => allowed.includes(k));
  if (keys.length === 0)
    return res.status(400).json({ error: "no valid fields to update" });
  try {
    const setClause = keys.map((k) => `${k} = ?`).join(", ");
    const values = keys.map((k) => payload[k]);
    const info = db
      .prepare(`UPDATE communes SET ${setClause} WHERE _id_commune = ?`)
      .run(...values, id);
    if (info.changes === 0)
      return res.status(404).json({ error: "commune not found" });
    const updated = db
      .prepare(
        `SELECT _id_commune AS id, name_commune, nis_code, region, province, latitude, longitude FROM communes WHERE _id_commune = ?`
      )
      .get(id);
    res.json(updated);
  } catch (err) {
    if (
      String(err.message || "")
        .toLowerCase()
        .includes("unique")
    ) {
      return res.status(409).json({ error: "nis_code already exists" });
    }
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/communes/:id - delete (admin only, cascades link rows)
router.delete("/communes/:id", requireAuth, (req, res) => {
  if (!isAdmin(req.auth?.sub))
    return res.status(403).json({ error: "forbidden" });
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(id) || id <= 0)
    return res.status(400).json({ error: "invalid id" });
  try {
    const info = db
      .prepare("DELETE FROM communes WHERE _id_commune = ?")
      .run(id);
    if (info.changes === 0)
      return res.status(404).json({ error: "commune not found" });
    return res.status(204).send();
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
        `SELECT c._id_commune AS id, c.name_commune, c.nis_code, c.region, c.province, c.latitude, c.longitude
      FROM scenario_communes sc
      JOIN communes c ON c._id_commune = sc._id_commune
      WHERE sc._id_scenario = ? ORDER BY c.name_commune ASC`
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
        `SELECT c._id_commune AS id, c.name_commune, c.nis_code, c.region, c.province, c.latitude, c.longitude
      FROM scenario_communes sc JOIN communes c ON c._id_commune = sc._id_commune WHERE sc._id_scenario = ? ORDER BY c.name_commune ASC`
      )
      .all(scenarioId);
    res.status(200).json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
