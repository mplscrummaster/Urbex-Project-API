#!/usr/bin/env node
/**
 * Télécharge et traite le fichier GeoNames des codes postaux belges, puis
 * produit un CSV standardisé `data/postal-codes-belgique.csv` (colonnes: postcode;municipality)
 * et peut directement lancer l'enrichissement (option --enrich).
 *
 * Source: http://download.geonames.org/export/zip/ (fichier BE.zip)
 * Format du fichier BE.txt (tab séparé):
 *   country code (0)
 *   postal code (1)
 *   place name (2)
 *   admin name1 (3) (region)
 *   admin code1 (4)
 *   admin name2 (5) (province)
 *   admin code2 (6)
 *   admin name3 (7)
 *   admin code3 (8)
 *   latitude (9)
 *   longitude (10)
 *   accuracy (11)
 *
 * Nous utilisons postal code + place name. Certaines "place name" ne sont pas exactement
 * les noms officiels de communes (peuvent être des sections). On effectue un filtrage heuristique
 * pour ne garder qu'une meilleure correspondance avec les colonnes name_fr/name_nl/name_de existantes.
 *
 * Heuristique simple:
 *  - On charge toutes les variantes existantes (FR/NL/DE) normalisées dans un Set.
 *  - On ne conserve que les lignes dont le place name normalisé correspond à une des variantes.
 *  - On écrit les duos (postal, place name original) dans le CSV final (dedup).
 *  - Option --keep-all : désactive le filtrage et garde tout (peut produire des sections multiples).
 *
 * Options:
 *  --enrich : après génération, lance automatiquement `node scripts/enrich-postal-codes.cjs`.
 *  --keep-all : ne filtre pas par noms existants (utilise tout le BE.txt)
 *  --force : retélécharge même si fichier zip déjà présent.
 */

const fs = require("fs");
const path = require("path");
const https = require("https");
const AdmZip = require("adm-zip");
const { spawnSync } = require("child_process");
const db = require("better-sqlite3")("db/bdd.db");

const ZIP_URL = "https://download.geonames.org/export/zip/BE.zip";
const DATA_DIR = "data";
const ZIP_PATH = path.join(DATA_DIR, "BE.zip");
const RAW_TXT = path.join(DATA_DIR, "BE.txt");
const OUT_CSV = path.join(DATA_DIR, "postal-codes-belgique.csv");

const args = process.argv.slice(2);
const ENRICH = args.includes("--enrich");
const KEEP_ALL = args.includes("--keep-all");
const FORCE = args.includes("--force");

function log(...m) {
  console.log("[fetch-postal]", ...m);
}
function warn(...m) {
  console.warn("[fetch-postal][WARN]", ...m);
}
function error(...m) {
  console.error("[fetch-postal][ERROR]", ...m);
}

function normalize(s) {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .toLowerCase()
    .replace(/['’`´]/g, "")
    .replace(/[^a-z0-9]+/g, " ") // collapse
    .trim()
    .replace(/\s+/g, " ");
}

async function download() {
  await new Promise((resolve, reject) => {
    log("Téléchargement", ZIP_URL);
    const file = fs.createWriteStream(ZIP_PATH);
    https
      .get(ZIP_URL, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error("Status " + res.statusCode));
          return;
        }
        res.pipe(file);
        file.on("finish", () => file.close(resolve));
      })
      .on("error", reject);
  });
  log("BE.zip téléchargé.");
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function extract() {
  const zip = new AdmZip(ZIP_PATH);
  zip.extractAllTo(DATA_DIR, true);
  log("Extraction terminée.");
}

function buildNameSet() {
  const rows = db
    .prepare("SELECT name_fr, name_nl, name_de FROM communes")
    .all();
  const set = new Set();
  for (const r of rows) {
    [r.name_fr, r.name_nl, r.name_de].forEach((v) => {
      if (v) {
        set.add(normalize(v));
      }
    });
  }
  return set;
}

function processFile() {
  if (!fs.existsSync(RAW_TXT)) {
    error("Fichier BE.txt introuvable après extraction.");
    process.exit(1);
  }
  const raw = fs.readFileSync(RAW_TXT, "utf8");
  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const nameSet = KEEP_ALL ? null : buildNameSet();
  const out = [];
  const seen = new Set();
  let kept = 0,
    skipped = 0;
  for (const line of lines) {
    const cols = line.split("\t");
    if (cols.length < 12) continue;
    const postal = cols[1].trim();
    const place = cols[2].trim();
    if (!postal || !place) continue;
    const norm = normalize(place);
    if (!KEEP_ALL) {
      if (!nameSet.has(norm)) {
        skipped++;
        continue;
      }
    }
    const key = postal + "|" + place.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ postal, place });
    kept++;
  }
  log(
    "Lignes conservées:",
    kept,
    "ignorées:",
    skipped,
    "total initial:",
    lines.length
  );
  // Write CSV
  const csv =
    "postcode;municipality\n" +
    out.map((o) => `${o.postal};${o.place}`).join("\n") +
    "\n";
  fs.writeFileSync(OUT_CSV, csv, "utf8");
  log("Écrit", OUT_CSV, "(", out.length, "entrées )");
}

function runEnrich() {
  log("Lancement enrich-postal-codes.cjs");
  const r = spawnSync(process.execPath, ["scripts/enrich-postal-codes.cjs"], {
    stdio: "inherit",
  });
  if (r.status !== 0) {
    error("Enrichissement a échoué (code=" + r.status + ")");
    process.exit(r.status);
  }
}

(async () => {
  ensureDataDir();
  if (FORCE || !fs.existsSync(ZIP_PATH)) {
    await download();
  } else {
    log("ZIP déjà présent, utiliser --force pour retélécharger.");
  }
  extract();
  processFile();
  if (ENRICH) runEnrich();
})();
