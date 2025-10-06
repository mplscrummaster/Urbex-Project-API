import { Router } from "express";
import db from "../db/index.js";
import requireAuth from "../middleware/auth.js";
import { canEditScenario } from "../middleware/rbac.js";

const router = Router();

// NOTE: Communes dataset is canonical & read-only; geometry column removed (geo_shape_geojson) as polygons no longer used.

// READ communes
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
      postal_codes
    FROM communes ${where} ORDER BY name_fr ASC`;
    const rows = db.prepare(sql).all(...params);
    res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Unified GeoJSON FeatureCollection (must be BEFORE /communes/:id to avoid param capture)
router.get("/communes/shapes.geojson", (_req, res) => {
  try {
    const rows = db
      .prepare(
        `SELECT c._id_commune AS id, c.name_fr, c.name_nl, c.name_de, cs.geo_shape_geojson
         FROM commune_shapes cs JOIN communes c ON c._id_commune = cs._id_commune
         ORDER BY c._id_commune ASC`
      )
      .all();
    const features = [];
    for (const r of rows) {
      if (!r.geo_shape_geojson) continue;
      try {
        const geom = JSON.parse(r.geo_shape_geojson);
        features.push({
          type: "Feature",
          geometry: geom,
          properties: {
            id: r.id,
            name_fr: r.name_fr,
            name_nl: r.name_nl,
            name_de: r.name_de,
          },
        });
      } catch {
        /* ignore malformed geometry */
      }
    }
    res.setHeader("Content-Type", "application/geo+json");
    res.json({ type: "FeatureCollection", features });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// READ commune
router.get("/communes/:id", (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(id) || id <= 0)
    return res.status(400).json({ error: "invalid id" });
  try {
    const commune = db
      .prepare(
        `SELECT c._id_commune AS id, c.name_fr, c.name_nl, c.name_de, c.geo_point_lat AS lat, c.geo_point_lon AS lon, c.postal_codes, cs.geo_shape_geojson
         FROM communes c LEFT JOIN commune_shapes cs ON cs._id_commune = c._id_commune WHERE c._id_commune = ?`
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

// Shape only (to fetch polygon lazily on map interaction)
router.get("/communes/:id/shape", (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(id) || id <= 0)
    return res.status(400).json({ error: "invalid id" });
  try {
    const shape = db
      .prepare(
        `SELECT cs._id_commune AS id, cs.geo_shape_geojson FROM commune_shapes cs WHERE cs._id_commune = ?`
      )
      .get(id);
    if (!shape) return res.status(404).json({ error: "shape not found" });
    res.json(shape);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Batch shapes: GET /communes/shapes?ids=1,2,3 (comma-separated)
router.get("/communes/shapes", (req, res) => {
  try {
    const raw = (req.query.ids || "").toString().trim();
    if (!raw) return res.json([]);
    const cleaned = [
      ...new Set(
        raw
          .split(",")
          .map((v) => parseInt(v, 10))
          .filter((n) => Number.isFinite(n) && n > 0)
      ),
    ];
    if (!cleaned.length) return res.json([]);
    if (cleaned.length > 120)
      return res.status(400).json({ error: "too many ids (max 120)" });
    const placeholders = cleaned.map(() => "?").join(",");
    const rows = db
      .prepare(
        `SELECT _id_commune AS id, geo_shape_geojson FROM commune_shapes WHERE _id_commune IN (${placeholders})`
      )
      .all(...cleaned);
    res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// All shapes (no id filter) – intended for full pre-load on front map (use with compression!)
router.get("/communes/shapes/all", (_req, res) => {
  try {
    const rows = db
      .prepare(
        `SELECT _id_commune AS id, geo_shape_geojson FROM commune_shapes ORDER BY _id_commune ASC`
      )
      .all();
    res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// READ scenario communes
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

// CREATE scenario communes
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
