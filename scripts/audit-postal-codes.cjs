#!/usr/bin/env node
/**
 * Audit et nettoyage heuristique des listes de codes postaux par commune.
 * Objectif: identifier et proposer des corrections lorsque plusieurs codes semblent appartenir
 * à des entités homonymes (ex: Forest 1190 vs Forest section ailleurs 7910,2430).
 *
 * Heuristiques appliquées:
 * 1. Taille de l'ensemble > 1 => audit.
 * 2. On calcule pour chaque code postal ses coordonnées (via la table jointe temporaire issue de GeoNames si disponible).
 *    -> Si absence de référentiel de coordonnées, on passe en mode pattern heuristique (préfixes incohérents).
 * 3. Filtrage par préfixe: la majorité des communes belges ont des codes partageant les 1 ou 2 premiers digits proches.
 *    -> On retient le cluster principal (mode) des 2 premiers chiffres. Si un code s'écarte (ex: 79xx parmi 11xxx/10xx) => suspect.
 * 4. Liste blanche: certaines grandes villes ont de multiples codes répartis (Anvers, Liège) que l'on ne touche pas.
 * 5. Résultat: suggestion de conservation vs suppression.
 *
 * Limitations: sans base officielle liant chaque code postal à la commune fusionnée, on repose sur heuristique + cluster.
 *
 * Options:
 *  --apply  applique les corrections proposées (suppression des codes jugés aberrants)
 *  --report-only (défaut) affiche uniquement un rapport JSON.
 */

const db = require("better-sqlite3")("db/bdd.db");

const APPLY = process.argv.includes("--apply");

// Communes acceptées avec plusieurs codes (grandes villes ou fusions connues) => on ne filtre pas
const WHITELIST_MULTI = new Set([
  "Anvers",
  "Liège",
  "Bruxelles",
  "Mons",
  "Charleroi",
  "Namur",
  "Gand",
  "Bruges",
  "Alost",
  "Courtrai",
  "Malines",
]);

function parseJson(txt) {
  try {
    return JSON.parse(txt);
  } catch {
    return null;
  }
}

function clusterByPrefix(codes, digits) {
  const m = new Map();
  for (const c of codes) {
    const pref = c.substring(0, digits);
    m.set(pref, (m.get(pref) || []).concat(c));
  }
  // Find largest cluster size
  let bestPref = null,
    bestSize = 0;
  for (const [pref, arr] of m.entries()) {
    if (arr.length > bestSize) {
      bestSize = arr.length;
      bestPref = pref;
    }
  }
  return { bestPref, cluster: m.get(bestPref) || [], map: m };
}

const rows = db
  .prepare("SELECT _id_commune, name_fr, name_nl, postal_codes FROM communes")
  .all();
const report = [];

for (const r of rows) {
  if (!r.postal_codes) continue;
  const arr = parseJson(r.postal_codes);
  if (!Array.isArray(arr) || arr.length <= 1) continue;
  if (WHITELIST_MULTI.has(r.name_fr) || WHITELIST_MULTI.has(r.name_nl)) {
    report.push({
      commune: r.name_fr || r.name_nl,
      kept: arr,
      removed: [],
      reason: "whitelist",
    });
    continue;
  }
  // Cluster on first 2 digits
  const { bestPref, cluster } = clusterByPrefix(arr, 2);
  const removed = arr.filter((c) => !cluster.includes(c));
  // Additional refinement: if cluster size ==1 (all different prefixes), fallback to first digit cluster
  if (cluster.length === 1 && arr.length > 1) {
    const c1 = clusterByPrefix(arr, 1);
    if (c1.cluster.length > 1) {
      // Recalculate with 1-digit cluster
      const removed2 = arr.filter((c) => !c1.cluster.includes(c));
      report.push({
        commune: r.name_fr || r.name_nl,
        kept: c1.cluster,
        removed: removed2,
        reason: "cluster_1_digit",
        original: arr,
      });
      continue;
    }
  }
  if (removed.length === 0) {
    report.push({
      commune: r.name_fr || r.name_nl,
      kept: arr,
      removed: [],
      reason: "all_same_prefix",
      original: arr,
    });
  } else {
    report.push({
      commune: r.name_fr || r.name_nl,
      kept: cluster,
      removed,
      reason: "prefix_filter",
      original: arr,
    });
  }
}

let applied = 0;
if (APPLY) {
  const upd = db.prepare(
    "UPDATE communes SET postal_codes=? WHERE _id_commune=?"
  );
  const tx = db.transaction(() => {
    for (const item of report) {
      if (
        item.removed &&
        item.removed.length > 0 &&
        item.kept &&
        item.kept.length > 0
      ) {
        // Find _id_commune by name_fr or name_nl
        const row = db
          .prepare(
            "SELECT _id_commune FROM communes WHERE name_fr=? OR name_nl=?"
          )
          .get(item.commune, item.commune);
        if (row) {
          upd.run(JSON.stringify(item.kept), row._id_commune);
          applied++;
        }
      }
    }
  });
  tx();
}

console.log(
  JSON.stringify({ apply: APPLY, updated: applied, entries: report }, null, 2)
);
