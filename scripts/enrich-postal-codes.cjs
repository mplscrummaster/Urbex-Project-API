#!/usr/bin/env node
/**
 * Enrichit la table communes avec les codes postaux belges.
 *
 * Stratégie:
 *  - Lecture d'un fichier CSV (par défaut data/postal-codes-belgique.csv) contenant au moins: postcode;municipality_name
 *    (séparateur auto-détecté ; ou ,). Encodage UTF-8.
 *  - Normalisation des noms (lowercase, suppression accents, suppression ponctuation simple) pour faire la correspondance
 *    avec toutes les variantes disponibles dans la table communes (name_fr, name_nl, name_de).
 *  - Agrégation multi codes postaux pour une même commune (stockés en JSON stringifié dans postal_codes ou chaîne vide si aucun).
 *  - Option --dry-run pour ne pas écrire en base.
 *  - Option --file <path> pour spécifier une autre source.
 *  - Option --download <url> pour tenter de télécharger le fichier si absent (simple GET https, pas de redirections complexes).
 *
 * Remarques:
 *  - Certaines communes ont plusieurs codes postaux (ex: Bruxelles – 1000, 1020, 1030... via entités associées). On agrège tous.
 *  - Les noms bilingues (Lessines / Lessen) seront mappés car on indexe toutes les colonnes de nom.
 *  - Si une ligne ne matche aucune commune, elle est comptée comme "unmatched".
 *  - Si plusieurs communes matchent un même nom normalisé (rare), on loggue un avertissement et on ignore ce code pour éviter une attribution erronée.
 */

const fs = require("fs");
const path = require("path");
const https = require("https");
const db = require("better-sqlite3")("db/bdd.db");

const args = process.argv.slice(2);
function argHas(flag) {
  return args.includes(flag);
}
function argValue(flag) {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : undefined;
}

const DRY_RUN = argHas("--dry-run");
const FILE = argValue("--file") || "data/postal-codes-belgique.csv";
const DOWNLOAD_URL = argValue("--download");

function log(...m) {
  console.log("[postal-enrich]", ...m);
}
function warn(...m) {
  console.warn("[postal-enrich][WARN]", ...m);
}
function error(...m) {
  console.error("[postal-enrich][ERROR]", ...m);
}

// Basic ASCII normalizer
function normalizeName(str) {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .toLowerCase()
    .replace(/['’`´]/g, "")
    .replace(/[^a-z0-9]+/g, " ") // keep alnum collapse others to space
    .trim()
    .replace(/\s+/g, " ");
}

function detectDelimiter(headerLine) {
  const sc = (headerLine.match(/;/g) || []).length;
  const cc = (headerLine.match(/,/g) || []).length;
  return sc >= cc ? ";" : ",";
}

function ensureFileSync() {
  if (fs.existsSync(FILE)) return;
  if (!DOWNLOAD_URL) {
    error(
      `Fichier postal introuvable: ${FILE}. Fournis-le ou utilise --download <url>.`
    );
    process.exit(1);
  }
  log("Téléchargement du fichier depuis", DOWNLOAD_URL);
  return new Promise((resolve, reject) => {
    const outDir = path.dirname(FILE);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const fileStream = fs.createWriteStream(FILE);
    https
      .get(DOWNLOAD_URL, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error("Status code " + res.statusCode));
          return;
        }
        res.pipe(fileStream);
        fileStream.on("finish", () => fileStream.close(() => resolve()));
      })
      .on("error", reject);
  });
}

(async () => {
  if (!fs.existsSync(FILE)) {
    await ensureFileSync();
  }
  if (!fs.existsSync(FILE)) {
    error("Impossible d'obtenir le fichier codes postaux. Abort.");
    process.exit(1);
  }
  const raw = fs.readFileSync(FILE, "utf8");
  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) {
    error("Fichier vide.");
    process.exit(1);
  }
  const delimiter = detectDelimiter(lines[0]);
  const headers = lines[0].split(delimiter).map((h) => h.trim());

  // Try common header names
  const POSTCODE_KEYS = [
    "postcode",
    "postalcode",
    "cp",
    "code_postal",
    "postal_code",
  ];
  const NAME_KEYS = [
    "municipality",
    "commune",
    "municipality_name",
    "city",
    "naam",
    "gemeente",
  ];

  function findHeader(candidates) {
    const lower = headers.map((h) => h.toLowerCase());
    for (const cand of candidates) {
      const idx = lower.indexOf(cand.toLowerCase());
      if (idx >= 0) return { idx, name: headers[idx] };
    }
    return null;
  }

  const hPost = findHeader(POSTCODE_KEYS);
  const hName = findHeader(NAME_KEYS);
  if (!hPost || !hName) {
    error(
      "Colonnes attendues non trouvées. Headers présents:",
      headers.join(", ")
    );
    process.exit(1);
  }
  log(
    "Colonnes détectées -> postcode:",
    hPost.name,
    ", municipality:",
    hName.name,
    ", delimiter:",
    JSON.stringify(delimiter)
  );

  const communeRows = db
    .prepare("SELECT _id_commune, name_fr, name_nl, name_de FROM communes")
    .all();
  const nameMap = new Map(); // normalizedName -> Set of commune ids
  for (const row of communeRows) {
    const variants = [row.name_fr, row.name_nl, row.name_de];
    for (const v of variants) {
      if (!v) continue;
      const n = normalizeName(v);
      if (!n) continue;
      if (!nameMap.has(n)) nameMap.set(n, new Set());
      nameMap.get(n).add(row._id_commune);
    }
  }

  const communePostal = new Map(); // id -> Set(postcodes)
  let unmatched = 0;
  let ambiguous = 0;
  let processed = 0;

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(delimiter).map((c) => c.trim());
    const postcode = cols[hPost.idx];
    const nameRaw = cols[hName.idx];
    if (!postcode || !nameRaw) continue;
    const norm = normalizeName(nameRaw);
    const idsSet = nameMap.get(norm);
    if (!idsSet) {
      unmatched++;
      continue;
    }
    const ids = Array.from(idsSet);
    if (ids.length > 1) {
      ambiguous++;
      continue; // skip to avoid wrong assignment
    }
    const id = ids[0];
    if (!communePostal.has(id)) communePostal.set(id, new Set());
    communePostal.get(id).add(postcode);
    processed++;
  }

  log("Statistiques parsing postal codes:");
  log("  lignes traitées (match):", processed);
  log("  codes non appariés:", unmatched);
  log("  ignorés (ambigus):", ambiguous);

  const updateStmt = db.prepare(
    "UPDATE communes SET postal_codes = ? WHERE _id_commune = ?"
  );
  const tx = db.transaction(() => {
    for (const [id, setCodes] of communePostal.entries()) {
      const arr = Array.from(setCodes).sort();
      updateStmt.run(JSON.stringify(arr), id);
    }
  });

  if (DRY_RUN) {
    log(
      "Dry-run: aucune écriture en base. Communes qui recevraient des codes:",
      communePostal.size
    );
  } else {
    tx();
    log("Mise à jour effectuée. Communes enrichies:", communePostal.size);
  }

  // Rapport communes sans codes
  const noCodes = db
    .prepare("SELECT COUNT(*) as c FROM communes WHERE postal_codes IS NULL")
    .get().c;
  log("Communes sans codes postaux après enrichissement:", noCodes);
})();
