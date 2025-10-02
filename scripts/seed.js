#!/usr/bin/env node
/**
 * Unified seeding script (consolidates former seed-*.js files except heavy communes dataset).
 *
 * What it does (in order):
 *   1. (OPTIONAL) If --with-communes flag passed AND table empty, seeds communes by executing existing seed-communes.js
 *   2. Scenarios (ensure canonical list of titles exists – no duplicates)
 *   3. Missions (ensure each scenario has deterministic 3..7 missions with unique titles/riddles/answers)
 *   4. Mission dependencies (insert OR IGNORE deterministic links)
 *   5. Blocks (ensure intro/outro + one block per mission)
 *   6. Scenario <-> communes links (replace all with canonical LINKS set)
 *   7. Users / players / scenarists / progress + bookmarks
 *   8. Optional extras via flags:
 *        --publish  : publish first N scenarios (default 5)
 *        --scores   : assign deterministic score/xp/level to players
 *        --media    : add placeholder image block to up to 10 missions missing an image
 *
 * Flags:
 *   --with-communes  Include step 1 (communes). Otherwise run `node scripts/seed-communes.js` separately once.
 *   --publish[=N]    Publish first N scenarios (default 5)
 *   --scores
 *   --media
 *   --verbose        More detailed logging
 *
 * NOTE: Previous individual scripts removed: seed-scenarios, seed-missions, seed-mission_dependencies,
 *       seed-blocks, seed-scenario_communes, seed-users_players_progress, seed-all.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import db from "../db/index.js";

const argsRaw = process.argv.slice(2);
const flags = new Set();
const kv = new Map();
for (const a of argsRaw) {
  if (a.includes("=")) {
    const [k, v] = a.split("=");
    flags.add(k);
    kv.set(k, v);
  } else {
    flags.add(a);
  }
}
const verbose = flags.has("--verbose");
const log = (...m) => {
  if (verbose) console.log("[seed]", ...m);
};

const runIf = (cond, label, fn) => {
  if (!cond) {
    log(`Skip ${label}`);
    return { skipped: true };
  }
  log(`Run ${label}`);
  return fn();
};

// 1. Communes (delegated to existing heavy script if requested)
const seedCommunesIfRequested = () => {
  if (!flags.has("--with-communes")) return { skipped: true };
  const exists = db.prepare("SELECT 1 FROM communes LIMIT 1").get();
  if (exists) {
    log("Communes already present; skipping.");
    return { skipped: true };
  }
  const script = path.join(process.cwd(), "scripts", "seed-communes.js");
  if (!fs.existsSync(script)) {
    console.warn("seed-communes.js not found, cannot seed communes.");
    return { skipped: true };
  }
  console.log("→ Seeding communes (first time)...");
  // Quote the path because workspace folder has spaces
  execSync(`node "${script}"`, { stdio: "inherit" });
  return { inserted: "external-script" };
};

// 2. Scenarios
const SCENARIO_TITLES = [
  "Les ruines oubliées",
  "Le réseau invisible",
  "Sous la poussière du temps",
  "Les ombres de la ville",
  "Les passages interdits",
  "La clé des profondeurs",
  "Mémoire des murs",
  "Les vestiges du silence",
  "Chroniques souterraines",
  // Newer additions
  "Fissures de lumière",
  "Cartographie des échos",
  "Lignes fantômes",
  "La chambre scellée",
  "Balises du passé",
  "Fragments de verrière",
  "Strates dormantes",
  "Le souffle des turbines",
  "Grille 47",
  "Protocoles oubliés",
  "Balcon sur l'oubli",
  "Anamorphose rouillée",
  "Les arches inversées",
  "Signal de minuit",
  "Opposition de phase",
  "Le plan isométrique",

  "Spectres d'atelier",
  "Route des charbons",
  "Indice triangulé",
  "Révolution silencieuse",
];

function seedScenarios() {
  const existing = new Set(
    db
      .prepare("SELECT title_scenario FROM scenarios")
      .all()
      .map((r) => r.title_scenario)
  );
  const stmt = db.prepare(
    "INSERT INTO scenarios (title_scenario, is_published) VALUES (?,0)"
  );
  let inserted = 0;
  const tx = db.transaction(() => {
    for (const t of SCENARIO_TITLES) {
      if (!existing.has(t)) {
        stmt.run(t);
        inserted++;
      }
    }
  });
  tx();
  return { inserted };
}

// 3. Missions
// Nouveau pool étendu de titres (>= 180) pour garantir quasi unicité sans suffixes numériques
// Important: stable order => déterminisme.
const missionTitlePool = [
  "Réacteur de surface",
  "Crypte latérale",
  "Atrium effondré",
  "Galerie des poutrelles",
  "Salle des archives froides",
  "Atelier des engrenages",
  "Observatoire muré",
  "Passerelle vitrée",
  "Colonne fracturée",
  "Réservoir occidental",
  "Sas des turbines",
  "Dalle magnétique",
  "Ponton intérieur",
  "Citerne oubliée",
  "Nef industrielle",
  "Puits de service",
  "Tunnel radial",
  "Chambre des soupapes",
  "Plateforme 19",
  "Mezzanine fractale",
  "Registre des signaux",
  "Laboratoire secondaire",
  "Serre calcinée",
  "Hall spiralé",
  "Carrousel d'ascenseur",
  "Corridor métrique",
  "Coffre des matrices",
  "Portique isolé",
  "Oratoire métallique",
  "Nervure portante",
  "Trémie basse",
  "Collecteur nord",
  "Capteur dormant",
  "Cage méridienne",
  "Laminoir spectral",
  "Vestiaire saturé",
  "Index cartographique",
  "Console cryogénique",
  "Dépôt lambrissé",
  "Ruelle voltée",
  "Bastion interne",
  "Cantine suspendue",
  "Balcon d'inspection",
  "Bureau capitonné",
  "Traverse inclinée",
  "Nacelle rouillée",
  "Croisée thermique",
  "Palier oblong",
  "Segment annulaire",
  "Fourreau d'accès",
  "Tranchée méridienne",
  "Plateau quartz",
  "Alcôve radiante",
  "Refuge filtrant",
  "Chambre magnétique",
  "Galerie caténaire",
  "Cage optique",
  "Replat granité",
  "Tableau d'alimentation",
  "Isoloir sonore",
  "Bief latéral",
  "Portique crypte",
  "Niche de maintenance",
  "Plenum scellé",
  "Bulle d'inspection",
  "Collecteur axial",
  "Digue interne",
  "Capsule logistique",
  "Soute prismatique",
  "Cage à inertie",
  "Corniche nord-est",
  "Fenil reconverti",
  "Pilier matriciel",
  "Estrade cataphote",
  "Chicane d'amarrage",
  "Bastide technique",
  "Placard phonique",
  "Ratelier sigma",
  "Estran de service",
  "Traverse orbitale",
  "Palier télescopique",
  "Tunnel segmenté",
  "Couloir isotrope",
  "Jardinet de ballast",
  "Aire triangulée",
  "Plateforme radiale",
  "Jauge d'expansion",
  "Voûte d'équilibrage",
  "Pieu d'ancrage",
  "Treuil dormant",
  "Chambre calcaire",
  "Sonde périphérique",
  "Console vectorielle",
  "Puits cryostatique",
  "Grille modulaire",
  "Soute occipitale",
  "Anneau de phase",
  "Liseré d'inspection",
  "Chape de confinement",
  "Corolle interne",
  "Bandeau thermique",
  "Bassin miroir",
  "Lanterneau scellé",
  "Arcature fracturée",
  "Traversée iso",
  "Culée rivetée",
  "Caniveau dormant",
  "Fenêtre obturée",
  "Écoinçon sud",
  "Pilastre effrité",
  "Compas mural",
  "Index photométrique",
  "Jauge stellaire",
  "Dalle vibratoire",
  "Nacelle spectrale",
  "Colonne torsadée",
  "Banc de calibration",
  "Pont roulant",
  "Galerie des flux",
  "Chambre d'harmonisation",
  "Module de charge",
  "Plateau isolant",
  "Récepteur à quartz",
  "Foyer auxiliaire",
  "Sas transducteur",
  "Cellule d'ombrage",
  "Diffuseur central",
  "Loge blindée",
  "Pavillon vectoriel",
  "Châssis secondaire",
  "Crypte parabolique",
  "Estrade polaire",
  "Méandre nord",
  "Méandre sud",
  "Méandre ouest",
  "Méandre est",
  "Tonnelle minérale",
  "Traverse tangentielle",
  "Refuge anhydre",
  "Caisse de résonance",
  "Spirale de service",
  "Étagère hydrostatique",
  "Canal annulaire",
  "Fenêtre radiale",
  "Poutre isobare",
  "Pont thermique",
  "Traverse d'embranchement",
  "Voile porteur",
  "Auge fractale",
  "Liaison orthogonale",
  "Déversoir interne",
  "Aire isotherme",
  "Console de phase",
  "Nervure luminescente",
  "Cavité pendulaire",
  "Segment orthogonal",
  "Becquet de soutènement",
  "Coffret nodal",
  "Tube focal",
  "Bande de roulement",
  "Voûte anhydre",
  "Antenne obsolète",
  "Sas oblong",
  "Chambre des gradients",
  "Couloir fractal",
  "Serre vectorielle",
  "Pilier basal",
  "Estrade thermique",
  "Niche spectrale",
  "Digue fracturée",
  "Banquette composite",
  "Batterie auxiliaire",
  "Cartouche d'ancrage",
  "Linteau vibré",
  "Cage circumférentielle",
  "Citerne radiale",
  "Traverse en treillis",
  "Refuge basaltique",
  "Console latente",
  "Chambre spiralée",
  "Plateforme crypte",
  "Anneau dormant",
  "Nacelle polarisée",
  "Point d'étalonnage",
  "Écluse interne",
  "Écluse externe",
  "Atrium focal",
  "Passerelle orthogonale",
  "Jardin minéralisé",
  "Baie partiellement murée",
  "Miroir d'alignement",
  "Borne vectorielle",
  "Trémie suspendue",
  "Sous-pont canal",
  "Carrefour nodal",
  "Chambre en encorbellement",
  "Cavité de torsion",
  "Refuge d'urgence",
  "Passe étroite",
  "Soute radiante",
];
// We now generate unique riddles deterministically; keep an answer word pool.
const RIDDLE_TEMPLATES = [
  "Dans « {TITLE} » repère le détail oublié et saisis « {ANSWER} ».",
  "Sous l'arche de « {TITLE} », compte les marques puis entre « {ANSWER} ».",
  "Autour de « {TITLE} » une plaque discrète confirme le mot: {ANSWER}.",
  "Silence et poussière dans « {TITLE} » : le mot caché est {ANSWER}.",
  "Repère la lumière résiduelle de « {TITLE} » et valide {ANSWER}.",
  "Analyse les traces dans « {TITLE} » – solution: {ANSWER}.",
  "Cherche l'inscription centrale de « {TITLE} » et écris {ANSWER}.",
  "Additionne les signes de « {TITLE} »; le résultat symbolique est {ANSWER}.",
  "Cadre brisé de « {TITLE} » : motif clé → {ANSWER}.",
  "Écoute l'écho sous « {TITLE} » et confirme {ANSWER}.",
  "Pivot rouillé de « {TITLE} » : mot registre = {ANSWER}.",
  "Filigrane résiduel de « {TITLE} » révèle {ANSWER}.",
  "Calque structurel de « {TITLE} » encode {ANSWER}.",
  "Relief principal de « {TITLE} » = code {ANSWER}.",
  "Topographie interne de « {TITLE} » produit {ANSWER}.",
  "Strate active de « {TITLE} » identifiée : {ANSWER}.",
];
const ANSWER_WORDS = [
  "ambre",
  "serment",
  "nord",
  "bleu",
  "clef",
  "echo",
  "minuit",
  "rouge",
  "silence",
  "est",
  "lueur",
  "signal",
  "phase",
  "quartz",
  "brique",
  "poussiere",
  "ombre",
  "valve",
  "ligne",
  "code",
  "ancrage",
  "fissure",
  "verre",
  "acier",
  "spectre",
  "plaque",
  "fenetre",
  "cadre",
  "horizon",
  "pilier",
  "arc",
  "poutre",
  "voile",
  "pierre",
  "indice",
  "piste",
  "trace",
  "flux",
  "noeud",
  "sonde",
  "grille",
  "phase",
  "delta",
  "omega",
  "alpha",
  "beta",
  "sigma",
  "gamma",
  "lambda",
  "zenith",
  "crypte",
  "goulet",
  "anode",
  "cathode",
  "spire",
  "anneau",
  "pivot",
  "axe",
  "miroir",
  "balise",
  "focale",
  "strie",
  "frise",
  "joint",
  "verin",
  "plinthe",
  "socle",
  "marbre",
  "graph",
  "module",
  "treuil",
  "ardoise",
  "rampe",
  "verrou",
  "seuil",
  "bastion",
  "coffre",
  "canal",
  "clave",
  "glace",
  "liant",
  "nexus",
  "plafond",
  "glissiere",
  "ressort",
  "profil",
  "coque",
  "voix",
  "grain",
  "torsion",
  "jauge",
  "claveau",
  "delta2",
  "gamma2",
  "sigma2",
];

const makeUniqueFactory = (used) => (base) => {
  if (!used.has(base)) {
    used.add(base);
    return base;
  }
  let i = 2;
  while (true) {
    const cand = `${base} #${i}`;
    if (!used.has(cand)) {
      used.add(cand);
      return cand;
    }
    i++;
  }
};

const jitter = (seed, maxDelta) => {
  let x = (Math.sin(seed * 12.9898) * 43758.5453) % 1;
  if (x < 0) x = -x;
  return (x - 0.5) * 2 * maxDelta;
};
const seededBetween = (seed, min, max) => {
  let x = (Math.sin(seed) * 10000) % 1;
  if (x < 0) x = -x;
  return x * (max - min) + min;
};

function seedMissions() {
  const scenarios = db
    .prepare("SELECT _id_scenario FROM scenarios ORDER BY _id_scenario")
    .all();
  const existingCount = db.prepare("SELECT COUNT(*) c FROM missions").get().c;
  const stmtInsert = db.prepare(
    `INSERT INTO missions (_id_scenario, position_mission, title_mission, latitude, longitude, riddle_text, answer_word) VALUES (?,?,?,?,?,?,?)`
  );
  let inserted = 0;
  const txInsert = db.transaction(() => {
    for (const sc of scenarios) {
      const counts = db
        .prepare(
          "SELECT COUNT(*) c, COALESCE(MAX(position_mission),0) maxpos FROM missions WHERE _id_scenario=?"
        )
        .get(sc._id_scenario);
      const have = counts.c || 0;
      const desired = 3 + (sc._id_scenario % 5); // 3..7 missions par scénario
      if (have >= desired) continue; // déjà assez
      const startPos = counts.maxpos + 1;
      // Récupère les communes associées pour ancrer géographiquement les missions
      const communes = db
        .prepare(
          `SELECT c.geo_point_lat AS lat, c.geo_point_lon AS lon FROM scenario_communes sc JOIN communes c ON c._id_commune=sc._id_commune WHERE sc._id_scenario=?`
        )
        .all(sc._id_scenario);
      const hasCommunes = communes.length > 0;
      const centerFallbackLat = seededBetween(
        sc._id_scenario * 1.7,
        49.8,
        51.2
      );
      const centerFallbackLon = seededBetween(sc._id_scenario * 2.3, 3.0, 5.8);
      for (let i = 0; i < desired - have; i++) {
        // placeholder riddle / answer (will be overwritten deterministically after normalization)
        const r = "riddle-temp";
        const a = "answer";
        // Attribution d'une commune d'ancrage (rotation sur la liste) si dispo
        let baseLat = centerFallbackLat;
        let baseLon = centerFallbackLon;
        if (hasCommunes) {
          const anchor = communes[(startPos + i - 1) % communes.length];
          if (anchor?.lat != null && anchor?.lon != null) {
            baseLat = Number(anchor.lat);
            baseLon = Number(anchor.lon);
          }
        }
        // Jitter local limité pour rester dans / autour de la commune
        const lat = Number(
          (
            baseLat + jitter(sc._id_scenario * 1000 + (startPos + i) * 7, 0.008)
          ).toFixed(6)
        );
        const lon = Number(
          (
            baseLon +
            jitter(sc._id_scenario * 1000 + (startPos + i) * 13, 0.012)
          ).toFixed(6)
        );
        // Titre provisoire (sera normalisé ensuite) : on prend dans le pool en avançant
        const provisionalTitle =
          missionTitlePool[
            (existingCount + inserted + i) % missionTitlePool.length
          ];
        stmtInsert.run(
          sc._id_scenario,
          startPos + i,
          provisionalTitle,
          lat,
          lon,
          r,
          a
        );
        inserted++;
      }
    }
  });
  txInsert();

  // Normalisation / unification des titres : objectif -> tous uniques sans suffixes numériques
  const missionsOrdered = db
    .prepare(
      `SELECT m._id_mission, m._id_scenario, m.position_mission, m.title_mission, s.title_scenario
     FROM missions m JOIN scenarios s ON s._id_scenario = m._id_scenario
     ORDER BY m._id_scenario, m.position_mission, m._id_mission`
    )
    .all();
  const seen = new Map();
  let hasNumbered = false;
  let anyDuplicateOverLimit = false;
  for (const m of missionsOrdered) {
    if (/ #\d+$/.test(m.title_mission)) hasNumbered = true;
    const base = m.title_mission.replace(/ #\d+$/, "");
    const c = (seen.get(base) || 0) + 1;
    seen.set(base, c);
    if (c > 3) anyDuplicateOverLimit = true;
  }
  const needNormalize = hasNumbered || anyDuplicateOverLimit;
  // Always ensure titles are remapped in global unique order (even if earlier detection said not needed) so that riddles reference final titles deterministically.
  if (missionTitlePool.length < missionsOrdered.length) {
    console.warn(
      "[seed] Pool de titres insuffisant pour garantir unicité (",
      missionTitlePool.length,
      "<",
      missionsOrdered.length,
      ")"
    );
  }
  const updateTitle = db.prepare(
    "UPDATE missions SET title_mission=? WHERE _id_mission=?"
  );
  const updateBlock = db.prepare(
    `UPDATE blocks SET content_text=? WHERE owner_type='mission' AND _id_mission=? AND type_block='text'`
  );
  const updateRiddleAnswer = db.prepare(
    "UPDATE missions SET riddle_text=?, answer_word=? WHERE _id_mission=?"
  );
  const missionText = (scTitle, mTitle, pos) =>
    `Mission ${pos}. « ${mTitle} ». Dans « ${scTitle} », observez et déduisez.`;
  const usedRiddles = new Set();
  let riddlesUpdated = 0;
  let titlesUpdated = 0;
  const txFinalize = db.transaction(() => {
    for (let i = 0; i < missionsOrdered.length; i++) {
      const m = missionsOrdered[i];
      const newTitle = missionTitlePool[i % missionTitlePool.length];
      if (newTitle !== m.title_mission) {
        updateTitle.run(newTitle, m._id_mission);
        titlesUpdated++;
        updateBlock.run(
          missionText(m.title_scenario, newTitle, m.position_mission),
          m._id_mission
        );
      }
    }
    // Re-read with final titles for riddle generation
    const finals = db
      .prepare(
        `SELECT m._id_mission, m.title_mission FROM missions m ORDER BY m._id_scenario, m.position_mission, m._id_mission`
      )
      .all();
    for (let i = 0; i < finals.length; i++) {
      const mm = finals[i];
      const answer = ANSWER_WORDS[i % ANSWER_WORDS.length];
      const tpl = RIDDLE_TEMPLATES[i % RIDDLE_TEMPLATES.length];
      let riddle = tpl
        .replace("{TITLE}", mm.title_mission)
        .replace("{ANSWER}", answer);
      // Safety: ensure uniqueness if somehow duplicate built
      let attempt = 2;
      const base = riddle;
      while (usedRiddles.has(riddle)) {
        riddle = base + " #" + attempt++;
      }
      usedRiddles.add(riddle);
      updateRiddleAnswer.run(riddle, answer, mm._id_mission);
      riddlesUpdated++;
    }
  });
  txFinalize();
  const coordsUpdated = normalizeMissionCoordinates();
  return {
    inserted,
    normalized: titlesUpdated > 0,
    titlesUpdated,
    riddlesUpdated,
    coordsUpdated,
  };
}

// Normalise / réattribue les coordonnées des missions déjà existantes pour qu'elles soient ancrées sur les communes du scénario
function normalizeMissionCoordinates() {
  const missions = db
    .prepare(
      `SELECT m._id_mission, m._id_scenario, m.position_mission, m.latitude, m.longitude FROM missions m ORDER BY m._id_scenario, m.position_mission`
    )
    .all();
  const communesStmt = db.prepare(
    `SELECT c.geo_point_lat AS lat, c.geo_point_lon AS lon FROM scenario_communes sc JOIN communes c ON c._id_commune=sc._id_commune WHERE sc._id_scenario=? ORDER BY sc._id_commune`
  );
  const upd = db.prepare(
    "UPDATE missions SET latitude=?, longitude=? WHERE _id_mission=?"
  );
  let updated = 0;
  for (const m of missions) {
    const communes = communesStmt.all(m._id_scenario);
    if (!communes.length) continue; // rien pour ancrer
    const anchor = communes[(m.position_mission - 1) % communes.length];
    if (anchor?.lat == null || anchor?.lon == null) continue;
    const baseLat = Number(anchor.lat);
    const baseLon = Number(anchor.lon);
    const newLat = Number(
      (
        baseLat + jitter(m._id_scenario * 1000 + m.position_mission * 7, 0.006)
      ).toFixed(6)
    );
    const newLon = Number(
      (
        baseLon + jitter(m._id_scenario * 1000 + m.position_mission * 13, 0.009)
      ).toFixed(6)
    );
    // Mettre à jour si différence significative (> 1e-5 deg)
    if (
      Math.abs(newLat - m.latitude) > 0.00001 ||
      Math.abs(newLon - m.longitude) > 0.00001
    ) {
      upd.run(newLat, newLon, m._id_mission);
      updated++;
    }
  }
  return updated;
}

// 4. Mission dependencies (deterministic pattern based on positions)
function seedMissionDependencies() {
  const scenarios = db.prepare("SELECT _id_scenario FROM scenarios").all();
  const getM = db.prepare(
    "SELECT _id_mission, position_mission FROM missions WHERE _id_scenario=? ORDER BY position_mission"
  );
  const insert = db.prepare(
    "INSERT OR IGNORE INTO mission_dependencies(_id_mission,_id_mission_required) VALUES (?,?)"
  );
  let inserted = 0;
  const pattern = [
    // pairs: (dependentPos, requiredPos)
    [3, 2],
    [3, 1],
    [4, 2],
    [4, 3],
    [5, 3],
    [5, 2],
    [6, 4],
    [6, 5],
  ];
  const tx = db.transaction(() => {
    for (const sc of scenarios) {
      const ms = getM.all(sc._id_scenario);
      const byPos = new Map(ms.map((m) => [m.position_mission, m]));
      for (const [dep, req] of pattern) {
        if (byPos.has(dep) && byPos.has(req)) {
          const info = insert.run(
            byPos.get(dep)._id_mission,
            byPos.get(req)._id_mission
          );
          inserted += info.changes || 0;
        }
      }
    }
  });
  tx();
  return { inserted };
}

// 5. Blocks
function seedBlocks() {
  const insertStmt = db.prepare(
    `INSERT INTO blocks (owner_type,_id_scenario,_id_mission,position_block,type_block,content_text,url_media,caption) VALUES (?,?,?,?,?,?,?,?)`
  );
  const introText = (title) =>
    `Bienvenue dans « ${title} ». Avancez prudemment : chaque détail compte.`;
  const outroText = (title) =>
    `Fin de « ${title} ». Vous avez percé une part du mystère.`;
  const missionText = (scTitle, mTitle, pos) =>
    `Mission ${pos}. « ${mTitle} ». Dans « ${scTitle} », observez et déduisez.`;
  const scenarios = db
    .prepare("SELECT _id_scenario,title_scenario FROM scenarios")
    .all();
  let created = 0;
  const tx = db.transaction(() => {
    for (const sc of scenarios) {
      const hasIntro = db
        .prepare(
          "SELECT 1 FROM blocks WHERE owner_type='scenario_intro' AND _id_scenario=? LIMIT 1"
        )
        .get(sc._id_scenario);
      if (!hasIntro) {
        insertStmt.run(
          "scenario_intro",
          sc._id_scenario,
          null,
          1,
          "text",
          introText(sc.title_scenario),
          null,
          null
        );
        created++;
      }
      const hasOutro = db
        .prepare(
          "SELECT 1 FROM blocks WHERE owner_type='scenario_outro' AND _id_scenario=? LIMIT 1"
        )
        .get(sc._id_scenario);
      if (!hasOutro) {
        insertStmt.run(
          "scenario_outro",
          sc._id_scenario,
          null,
          1,
          "text",
          outroText(sc.title_scenario),
          null,
          null
        );
        created++;
      }
      const missions = db
        .prepare(
          "SELECT _id_mission,title_mission,position_mission FROM missions WHERE _id_scenario=? ORDER BY position_mission"
        )
        .all(sc._id_scenario);
      for (const m of missions) {
        const has = db
          .prepare(
            "SELECT 1 FROM blocks WHERE owner_type='mission' AND _id_mission=? LIMIT 1"
          )
          .get(m._id_mission);
        if (!has) {
          insertStmt.run(
            "mission",
            null,
            m._id_mission,
            1,
            "text",
            missionText(sc.title_scenario, m.title_mission, m.position_mission),
            null,
            null
          );
          created++;
        }
      }
    }
  });
  tx();
  return { inserted: created };
}

// 6. Scenario <-> communes links (canonical set – replace all)
const SCENARIO_COMMUNE_LINKS = [
  { title: "Les ruines oubliées", id: 873 },
  { title: "Les ombres de la ville", id: 930 },
  { title: "Les passages interdits", id: 639 },
  { title: "Le réseau invisible", id: 1153 },
  { title: "Sous la poussière du temps", id: 809 },
  { title: "La clé des profondeurs", id: 1029 },
  { title: "La clé des profondeurs", id: 1042 },
  { title: "Mémoire des murs", id: 702 },
  { title: "Mémoire des murs", id: 912 },
  { title: "Mémoire des murs", id: 963 },
  { title: "Les vestiges du silence", id: 922 },
  { title: "Les vestiges du silence", id: 976 },
  { title: "Les vestiges du silence", id: 1132 },
  { title: "Chroniques souterraines", id: 594 },
  { title: "Chroniques souterraines", id: 925 },
  // Fleurus cluster (id 1043)
  { title: "Fissures de lumière", id: 1043 },
  { title: "Cartographie des échos", id: 1043 },
  { title: "Lignes fantômes", id: 1043 },
  { title: "La chambre scellée", id: 1043 },
  { title: "Balises du passé", id: 1043 },
  // Newly persisted single-commune links added for scenarios that previously had none (IDs 15-29)
  { title: "Fragments de verrière", id: 595 },
  { title: "Strates dormantes", id: 596 },
  { title: "Le souffle des turbines", id: 597 },
  { title: "Grille 47", id: 598 },
  { title: "Protocoles oubliés", id: 599 },
  { title: "Balcon sur l'oubli", id: 600 },
  { title: "Anamorphose rouillée", id: 601 },
  { title: "Les arches inversées", id: 602 },
  { title: "Signal de minuit", id: 603 },
  { title: "Opposition de phase", id: 604 },
  { title: "Le plan isométrique", id: 605 },
  { title: "Spectres d'atelier", id: 606 },
  { title: "Route des charbons", id: 607 },
  { title: "Indice triangulé", id: 608 },
  { title: "Révolution silencieuse", id: 609 },
];

function seedScenarioCommunes() {
  const clear = db.prepare("DELETE FROM scenario_communes");
  const findScenario = db.prepare(
    "SELECT _id_scenario FROM scenarios WHERE title_scenario=?"
  );
  const insert = db.prepare(
    "INSERT OR IGNORE INTO scenario_communes (_id_scenario,_id_commune) VALUES (?,?)"
  );
  let inserted = 0;
  const warnings = [];
  const tx = db.transaction(() => {
    clear.run();
    for (const { title, id } of SCENARIO_COMMUNE_LINKS) {
      const s = findScenario.get(title);
      if (!s) {
        warnings.push(`Missing scenario: ${title}`);
        continue;
      }
      const info = insert.run(s._id_scenario, id);
      inserted += info.changes || 0;
    }
  });
  tx();
  return { inserted, warnings };
}

// 7. Users / players / scenarists / progress
function seedUsersPlayersProgress() {
  const passwordHash = bcrypt.hashSync("password123", 10);
  const ensureUser = (username, mail, role) => {
    const existing = db
      .prepare("SELECT _id_user, role_user FROM users WHERE username_user=?")
      .get(username);
    if (existing) {
      if (existing.role_user !== role)
        db.prepare("UPDATE users SET role_user=? WHERE _id_user=?").run(
          role,
          existing._id_user
        );
      db.prepare("INSERT OR IGNORE INTO players(_id_user) VALUES (?)").run(
        existing._id_user
      );
      return existing._id_user;
    }
    const info = db
      .prepare(
        "INSERT INTO users (username_user,password_user,mail_user,role_user) VALUES (?,?,?,?)"
      )
      .run(username, passwordHash, mail, role);
    const id = Number(info.lastInsertRowid);
    db.prepare(
      "INSERT INTO players (_id_user,nickname,bio,url_img_avatar,score,level,xp) VALUES (?,?,?,?,?,?,?)"
    ).run(id, username, null, null, 0, 1, 0);
    return id;
  };
  const admins = ["max", "polina", "louis"];
  const adminIds = admins.map((u) =>
    ensureUser(u, `${u}@example.com`, "admin")
  );
  const scenarists = ["sasha", "julien", "clara"];
  const scenaristIds = scenarists.map((u) =>
    ensureUser(u, `${u}@example.com`, "scenarist")
  );
  const players = Array.from({ length: 10 }).map(
    (_, i) => `player${String(i + 1).padStart(2, "0")}`
  );
  const playerIds = players.map((u) =>
    ensureUser(u, `${u}@example.com`, "player")
  );
  // nicknames/avatars
  const nicknames = [
    "Renard",
    "Corbeau",
    "Lynx",
    "Hermine",
    "Faucon",
    "Chouette",
    "Loup",
    "Blaireau",
    "Sanglier",
    "Héron",
  ];
  const getAvatar = (seed) =>
    `https://robohash.org/${encodeURIComponent(
      seed
    )}.png?set=set3&size=200x200`;
  let profileUpdated = 0;
  const updateStmt = db.prepare(
    `UPDATE players SET nickname=CASE WHEN nickname IS NULL OR nickname=? THEN ? ELSE nickname END, url_img_avatar=COALESCE(url_img_avatar, ?) WHERE _id_user=?`
  );
  for (let i = 0; i < playerIds.length; i++) {
    const id = playerIds[i];
    const username = players[i];
    const nick = nicknames[i % nicknames.length];
    const avatar = getAvatar(nick);
    const info = updateStmt.run(username, nick, avatar, id);
    profileUpdated += info.changes || 0;
  }
  // scenario ownership
  const scenarios = db
    .prepare(
      "SELECT _id_scenario, created_by FROM scenarios ORDER BY _id_scenario"
    )
    .all();
  for (let i = 0; i < scenarios.length; i++) {
    const sc = scenarios[i];
    const who = scenaristIds[i % scenaristIds.length];
    if (sc.created_by !== who)
      db.prepare("UPDATE scenarios SET created_by=? WHERE _id_scenario=?").run(
        who,
        sc._id_scenario
      );
  }
  // progress & bookmarks
  const getMissionsForScenario = db.prepare(
    "SELECT _id_mission FROM missions WHERE _id_scenario=? ORDER BY position_mission"
  );
  const insertScenarioProgress = db.prepare(
    `INSERT INTO scenario_progress (_id_user,_id_scenario,status,bookmarked,started_at,completed_at,last_interaction_at) VALUES (?,?,?,?,?,?,?)`
  );
  const insertMissionProgress = db.prepare(
    "INSERT OR IGNORE INTO mission_progress (_id_user,_id_mission) VALUES (?,?)"
  );
  const hasScenarioProgress = db.prepare(
    "SELECT 1 FROM scenario_progress WHERE _id_user=? AND _id_scenario=?"
  );
  let spInserted = 0,
    mpInserted = 0;
  const nowIso = () => new Date().toISOString();
  const allScenarioIds = scenarios.map((s) => s._id_scenario);
  for (let i = 0; i < playerIds.length; i++) {
    const userId = playerIds[i];
    if (!allScenarioIds.length) break;
    const choices = [];
    for (let k = 0; k < Math.min(3, allScenarioIds.length); k++)
      choices.push(allScenarioIds[(i + k) % allScenarioIds.length]);
    const now = nowIso();
    if (choices[0] != null && !hasScenarioProgress.get(userId, choices[0])) {
      insertScenarioProgress.run(
        userId,
        choices[0],
        "not_started",
        1,
        null,
        null,
        now
      );
      spInserted++;
    }
    if (choices[1] != null && !hasScenarioProgress.get(userId, choices[1])) {
      insertScenarioProgress.run(
        userId,
        choices[1],
        "started",
        1,
        now,
        null,
        now
      );
      spInserted++;
    }
    if (choices[2] != null && !hasScenarioProgress.get(userId, choices[2])) {
      insertScenarioProgress.run(
        userId,
        choices[2],
        "completed",
        1,
        now,
        now,
        now
      );
      spInserted++;
      const missions = getMissionsForScenario.all(choices[2]);
      for (const m of missions) {
        const info = insertMissionProgress.run(userId, m._id_mission);
        mpInserted += info.changes || 0;
      }
    }
  }
  return {
    admins: adminIds.length,
    scenarists: scenaristIds.length,
    players: playerIds.length,
    profileUpdated,
    spInserted,
    mpInserted,
  };
}

// 8. Optional extras
function publishSome() {
  const raw = kv.get("--publish");
  const N = raw ? Number(raw) : 5;
  const info = db
    .prepare(
      "UPDATE scenarios SET is_published=1 WHERE _id_scenario IN (SELECT _id_scenario FROM scenarios ORDER BY _id_scenario LIMIT ?) AND is_published=0"
    )
    .run(N);
  return { published: info.changes || 0 };
}
function assignScores() {
  const players = db.prepare("SELECT _id_user FROM players").all();
  const up = db.prepare(
    "UPDATE players SET score=?, xp=?, level=? WHERE _id_user=?"
  );
  let updated = 0;
  for (const p of players) {
    const base = (p._id_user * 9301) % 500;
    const score = 300 + base * 7;
    const xp = (score % 1500) + 50;
    const level = 1 + Math.floor(xp / 250);
    const res = up.run(score, xp, level, p._id_user);
    updated += res.changes || 0;
  }
  return { playersUpdated: updated };
}
function addImageBlocks() {
  const missions = db
    .prepare(
      `SELECT m._id_mission FROM missions m WHERE NOT EXISTS (SELECT 1 FROM blocks b WHERE b.owner_type='mission' AND b._id_mission=m._id_mission AND b.type_block='image') LIMIT 10`
    )
    .all();
  const ins = db.prepare(
    `INSERT INTO blocks (owner_type,_id_scenario,_id_mission,position_block,type_block,content_text,url_media,caption) VALUES ('mission',NULL,?,99,'image',NULL,?,?)`
  );
  let added = 0;
  for (const m of missions) {
    const url = `https://picsum.photos/seed/mission${m._id_mission}/600/400`;
    const cap = "Illustration";
    const info = ins.run(m._id_mission, url, cap);
    added += info.changes || 0;
  }
  return { imageBlocks: added };
}

function main() {
  const summary = {};
  summary.communes = seedCommunesIfRequested();
  summary.scenarios = seedScenarios();
  summary.missions = seedMissions();
  summary.missionDeps = seedMissionDependencies();
  summary.blocks = seedBlocks();
  summary.scenarioCommunes = seedScenarioCommunes();
  summary.users = seedUsersPlayersProgress();
  if (flags.has("--publish")) summary.publish = publishSome();
  if (flags.has("--scores")) summary.scores = assignScores();
  if (flags.has("--media")) summary.media = addImageBlocks();
  console.log("Seed complete ✅");
  console.table(
    Object.fromEntries(
      Object.entries(summary).map(([k, v]) => [k, JSON.stringify(v)])
    )
  );
}

try {
  main();
  process.exit(0);
} catch (e) {
  console.error("Unified seed failed:", e);
  process.exit(1);
}
