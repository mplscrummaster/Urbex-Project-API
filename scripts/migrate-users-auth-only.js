import db from "../db/index.js";

function columnExists(table, column) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all();
  return cols.some((c) => c.name === column);
}

try {
  const hasFirstname = columnExists("users", "firstname_user");
  const hasName = columnExists("users", "name_user");
  const hasUrlImg = columnExists("users", "url_img_user");

  if (!hasFirstname && !hasName && !hasUrlImg) {
    console.log("Migration skipped: users table already auth-only");
    process.exit(0);
  }

  console.log(
    "Starting migration: users -> auth-only, backfill players profile..."
  );

  // Backup profile columns from users before restructuring the table
  const backups = db
    .prepare(
      `SELECT _id_user, username_user, firstname_user, name_user, url_img_user FROM users`
    )
    .all();

  db.transaction(() => {
    // Create new users table without profile columns
    db.prepare(
      `CREATE TABLE IF NOT EXISTS users_new (
        _id_user       INTEGER PRIMARY KEY AUTOINCREMENT,
        username_user  TEXT NOT NULL UNIQUE,
        password_user  TEXT NOT NULL,
        mail_user      TEXT NOT NULL UNIQUE,
        role_user      TEXT NOT NULL DEFAULT 'player' CHECK (role_user IN ('player','scenarist','admin'))
      )`
    ).run();

    // Copy data
    db.prepare(
      `INSERT INTO users_new (_id_user, username_user, password_user, mail_user, role_user)
       SELECT _id_user, username_user, password_user, mail_user, COALESCE(role_user,'player')
       FROM users`
    ).run();

    // Swap tables
    db.prepare(`DROP TABLE users`).run();
    db.prepare(`ALTER TABLE users_new RENAME TO users`).run();
    db.prepare(
      `CREATE INDEX IF NOT EXISTS idx_users_mail ON users(mail_user)`
    ).run();
  })();

  // Backfill players from backups
  const ensurePlayerStmt = db.prepare(
    `INSERT OR IGNORE INTO players (_id_user) VALUES (?)`
  );
  const getPlayerStmt = db.prepare(
    `SELECT nickname, url_img_avatar FROM players WHERE _id_user = ?`
  );
  const updatePlayerStmt = db.prepare(
    `UPDATE players SET nickname = COALESCE(?, nickname), url_img_avatar = COALESCE(?, url_img_avatar) WHERE _id_user = ?`
  );

  let updated = 0;
  for (const r of backups) {
    try {
      ensurePlayerStmt.run(r._id_user);
      const current = getPlayerStmt.get(r._id_user) || {};
      const fullName = [r.firstname_user, r.name_user]
        .filter(Boolean)
        .join(" ")
        .trim();
      const nickname = fullName || r.username_user || null;
      const avatar = r.url_img_user || null;
      // Only apply values if there is something meaningful to set
      const nickToSet = current.nickname ? null : nickname;
      const avatarToSet = current.url_img_avatar ? null : avatar;
      if (nickToSet != null || avatarToSet != null) {
        updatePlayerStmt.run(nickToSet, avatarToSet, r._id_user);
        updated++;
      }
    } catch (e) {
      console.warn(`Player backfill issue for user ${r._id_user}:`, e.message);
    }
  }

  console.log(
    `Migration complete: users table rebuilt to auth-only. Players updated/backfilled: ${updated}.`
  );
  process.exit(0);
} catch (e) {
  console.error("Migration failed:", e.message);
  process.exit(1);
}
