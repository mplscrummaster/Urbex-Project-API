import fs from "fs";
import db from "../db/index.js";
import bcrypt from "bcryptjs";

const DB_PATH = process.env.DB_PATH || "db/bdd.db";

function exit(code = 0) {
  process.exit(code);
}

if (!fs.existsSync(DB_PATH)) {
  console.error(`Database not found at ${DB_PATH}`);
  exit(1);
}

function nowIso() {
  return new Date().toISOString();
}

try {
  // 1) Ensure core users with requested roles
  const passwordHash = bcrypt.hashSync("password123", 10);

  const ensureUser = (username, mail, role) => {
    const existing = db
      .prepare("SELECT _id_user, role_user FROM users WHERE username_user = ?")
      .get(username);
    if (existing) {
      if (existing.role_user !== role) {
        db.prepare("UPDATE users SET role_user=? WHERE _id_user=?").run(
          role,
          existing._id_user
        );
      }
      // Ensure player profile exists
      db.prepare("INSERT OR IGNORE INTO players (_id_user) VALUES (?)").run(
        existing._id_user
      );
      return existing._id_user;
    } else {
      const info = db
        .prepare(
          "INSERT INTO users (username_user, password_user, mail_user, role_user) VALUES (?, ?, ?, ?)"
        )
        .run(username, passwordHash, mail, role);
      const id = Number(info.lastInsertRowid);
      db.prepare(
        "INSERT INTO players (_id_user, nickname, bio, url_img_avatar, score, level, xp) VALUES (?, ?, ?, ?, ?, ?, ?)"
      ).run(id, username, null, null, 0, 1, 0);
      return id;
    }
  };

  const ids = {};
  ids.max = ensureUser("max", "max@example.com", "admin");
  ids.polina = ensureUser("polina", "polina@example.com", "admin");
  ids.louis = ensureUser("louis", "louis@example.com", "admin");

  // 2) Create a few scenarists
  const scenarists = [
    ["sasha", "sasha@example.com"],
    ["julien", "julien@example.com"],
    ["clara", "clara@example.com"],
  ];
  const scenaristIds = scenarists.map(([u, m]) =>
    ensureUser(u, m, "scenarist")
  );

  // 3) Create about 10 players
  const players = Array.from({ length: 10 }).map((_, i) => [
    `player${String(i + 1).padStart(2, "0")}`,
    `player${String(i + 1).padStart(2, "0")}@example.com`,
  ]);
  const playerIds = players.map(([u, m]) => ensureUser(u, m, "player"));

  // 3b) Give players nicknames and avatars (idempotent)
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
  const getAvatarUrl = (seed) =>
    `https://robohash.org/${encodeURIComponent(
      seed
    )}.png?set=set3&size=200x200`;
  const updatePlayerStmt = db.prepare(
    `UPDATE players
     SET nickname = CASE WHEN nickname IS NULL OR nickname = ? THEN ? ELSE nickname END,
         url_img_avatar = COALESCE(url_img_avatar, ?)
     WHERE _id_user = ?`
  );
  let profileUpdated = 0;
  for (let i = 0; i < playerIds.length; i++) {
    const userId = playerIds[i];
    const username = players[i][0];
    const nick = nicknames[i % nicknames.length];
    const avatar = getAvatarUrl(nick);
    const info = updatePlayerStmt.run(username, nick, avatar, userId);
    profileUpdated += info.changes || 0;
  }

  // 4) Assign each scenario to a scenarist as creator (created_by)
  const scenarios = db
    .prepare(
      "SELECT _id_scenario, title_scenario, created_by FROM scenarios ORDER BY _id_scenario"
    )
    .all();
  if (scenarios.length === 0) {
    console.warn("No scenarios found; seed scenarios first.");
  } else {
    for (let i = 0; i < scenarios.length; i++) {
      const sc = scenarios[i];
      const who = scenaristIds[i % scenaristIds.length];
      if (sc.created_by !== who) {
        db.prepare(
          "UPDATE scenarios SET created_by=? WHERE _id_scenario=?"
        ).run(who, sc._id_scenario);
      }
    }
  }

  // 5) For newly created players, add bookmarks and different progress in some scenarios
  const allScenarioIds = scenarios.map((s) => s._id_scenario);
  const getMissionsForScenario = db.prepare(
    "SELECT _id_mission FROM missions WHERE _id_scenario=? ORDER BY position_mission"
  );
  const insertScenarioProgress = db.prepare(
    `INSERT INTO scenario_progress (_id_user,_id_scenario,status,bookmarked,started_at,completed_at,last_interaction_at)
     VALUES (?,?,?,?,?,?,?)`
  );
  const insertMissionProgress = db.prepare(
    `INSERT OR IGNORE INTO mission_progress (_id_user,_id_mission) VALUES (?,?)`
  );
  const hasScenarioProgress = db.prepare(
    `SELECT 1 FROM scenario_progress WHERE _id_user=? AND _id_scenario=?`
  );

  let spInserted = 0;
  let mpInserted = 0;

  for (let i = 0; i < playerIds.length; i++) {
    const userId = playerIds[i];
    if (allScenarioIds.length === 0) break;
    const choices = [];
    // Pick up to 3 scenarios for variety (rotate deterministically)
    for (let k = 0; k < Math.min(3, allScenarioIds.length); k++) {
      choices.push(allScenarioIds[(i + k) % allScenarioIds.length]);
    }

    const now = nowIso();
    // 1st: bookmarked only (not_started)
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
    // 2nd: started
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
    // 3rd: completed + mission_progress for all missions
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

  console.log(
    `Users ensured: admins (max, polina, louis). Created scenarists: ${scenaristIds.length}. Created players: ${playerIds.length}.\n` +
      `Player profiles updated (nicknames/avatars): ${profileUpdated}. Scenario owners set: ${scenarios.length}.\n` +
      `Progress rows inserted: ${spInserted}. Mission completions inserted: ${mpInserted}.`
  );
  exit(0);
} catch (e) {
  console.error("Seed users/players/progress failed:", e.message);
  exit(1);
}
