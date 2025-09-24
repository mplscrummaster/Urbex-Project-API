#!/usr/bin/env node
/**
 * Import minimal communes dataset from the provided CSV (communes-belgique.csv)
 * Keeps only: names (FR/NL/DE), centroid (geo point), full GeoJSON polygon. (municipality_code removed in v2 schema)
 * Assumptions:
 * - Separator: ';'
 * - File encoding: UTF-8 with BOM
 * - Columns (subset used):
 *   Geo Point;Geo Shape;Year;Region code;Province code;Arrondissement code;Canton code;Municipality code;...;Municipality name (French);... (we ignore municipality_code now)
 * - Geo Point is 'lat, lon' (string) -> we split by comma.
 * - Geo Shape is a JSON string with doubled quotes inside (already CSV-escaped). We'll parse after unescaping.
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const db = require("better-sqlite3")("db/bdd.db");

const FILE = process.argv.includes("--file")
  ? process.argv[process.argv.indexOf("--file") + 1]
  : "data/communes-belgique.csv";
const RESET = process.argv.includes("--reset");

if (!fs.existsSync(FILE)) {
  console.error("Fichier introuvable:", FILE);
  process.exit(1);
}

if (RESET) {
  console.log("RESET demandé: purge de la table communes...");
  db.prepare("DELETE FROM communes").run();
}

// Quick header mapping indices
let headerParsed = false;
let idx = {};

// Prepare simple insert (no municipality_code). We allow duplicates only if exact same set appears; no OR REPLACE.
const insertStmt = db.prepare(`INSERT INTO communes (
  name_fr, name_nl, name_de, geo_point_lat, geo_point_lon, geo_shape_geojson, postal_codes
) VALUES (?, ?, ?, ?, ?, ?, NULL)`);

let inserted = 0;
let skipped = 0;
let lines = 0;

function parseCsvLine(raw) {
  // Basic state machine for ; separator with quotes
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (c === '"') {
      if (inQuotes && raw[i + 1] === '"') {
        // escaped quote
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ";" && !inQuotes) {
      out.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  out.push(cur);
  return out;
}

function cleanBom(s) {
  return s.replace(/^\uFEFF/, "");
}

const rl = readline.createInterface({
  input: fs.createReadStream(FILE, { encoding: "utf8" }),
});

rl.on("line", (line) => {
  lines++;
  if (!headerParsed) {
    const cols = parseCsvLine(cleanBom(line));
    cols.forEach((name, i) => {
      idx[name.trim()] = i;
    });
    const needed = [
      "Geo Point",
      "Geo Shape",
      "Municipality name (French)",
      "Municipality name (Dutch)",
      "Municipality name (German)",
    ];
    const missing = needed.filter((n) => idx[n] === undefined);
    if (missing.length) {
      console.error("Colonnes manquantes dans le CSV:", missing);
      process.exit(1);
    }
    headerParsed = true;
    return;
  }
  if (!line.trim()) return; // ignore empty
  const cols = parseCsvLine(line);
  // municipality_code ignored; we rely on natural names+geometry; if all names empty skip

  // Names (empty strings become null)
  const nameFr = (cols[idx["Municipality name (French)"]] || "").trim() || null;
  const nameNl = (cols[idx["Municipality name (Dutch)"]] || "").trim() || null;
  const nameDe = (cols[idx["Municipality name (German)"]] || "").trim() || null;

  // Geo Point: "lat, lon" -> numeric
  const geoPointRaw = (cols[idx["Geo Point"]] || "").trim();
  let lat = null,
    lon = null;
  if (geoPointRaw.includes(",")) {
    const parts = geoPointRaw.split(",").map((s) => s.trim());
    if (parts.length === 2) {
      // The file shows pattern: latitude, longitude
      const la = parseFloat(parts[0]);
      const lo = parseFloat(parts[1]);
      if (!isNaN(la) && !isNaN(lo)) {
        lat = la;
        lon = lo;
      }
    }
  }

  // Geo Shape: raw GeoJSON string with internal quotes already normalised by parseCsvLine
  let geoShape = (cols[idx["Geo Shape"]] || "").trim();
  if (geoShape) {
    // The content is something like: {"coordinates": ..., "type": "Polygon"}
    // Already valid JSON because CSV escaping removed doubled quotes.
    // Validate minimal structure (optional)
    try {
      const obj = JSON.parse(geoShape);
      if (!obj.type || !obj.coordinates) {
        // If invalid, keep raw but note skip for geometry
        // console.warn('GeoJSON invalide pour', nis);
      }
      // We store original text for fidelity (rather than re-serializing which could reorder spacing)
    } catch (e) {
      // Geometry invalid, keep as null to avoid polluting
      geoShape = null;
    }
  } else {
    geoShape = null;
  }

  try {
    if (!nameFr && !nameNl && !nameDe) {
      skipped++;
      return;
    }
    insertStmt.run(nameFr, nameNl, nameDe, lat, lon, geoShape);
    inserted++;
  } catch (e) {
    skipped++;
    // console.error('Insertion ratée pour', nis, e.message);
  }
});

rl.on("close", () => {
  console.log(
    `Terminé. Lignes lues=${lines}, insérées=${inserted}, ignorées=${skipped}`
  );
});
