import fs from "fs";
import db from "../db/index.js";
import bcrypt from "bcryptjs";

const DB_PATH = process.env.DB_PATH || "db/bdd.db";

const exit = (code = 0) => {
  process.exit(code);
};

if (!fs.existsSync(DB_PATH)) {
  console.error(`Database not found at ${DB_PATH}`);
  exit(1);
}

try {
  const row = db.prepare("SELECT COUNT(*) AS c FROM users").get();
  const count = row?.c ?? 0;
  const ensureAdmin = () => {
    const adminMail = "admin@example.com";
    const adminPasswordHash = bcrypt.hashSync("password123", 10);
    const existing = db
      .prepare("SELECT _id_user FROM users WHERE mail_user = ?")
      .get(adminMail);
    if (existing) {
      db.prepare(
        "UPDATE users SET role_user = 'admin', password_user = ? WHERE _id_user = ?"
      ).run(adminPasswordHash, existing._id_user);
      // Ensure player profile exists
      db.prepare("INSERT OR IGNORE INTO players (_id_user) VALUES (?)").run(
        existing._id_user
      );
      console.log(
        `Admin ensured: user id ${existing._id_user} (password reset to 'password123')`
      );
      return 0;
    } else {
      const info = db
        .prepare(
          "INSERT INTO users (username_user, password_user, mail_user, role_user) VALUES (?, ?, ?, ?)"
        )
        .run("admin", adminPasswordHash, adminMail, "admin");
      const userId = Number(info.lastInsertRowid);
      db.prepare(
        "INSERT INTO players (_id_user, nickname, bio, url_img_avatar, score, level, xp) VALUES (?, ?, ?, ?, ?, ?, ?)"
      ).run(userId, "admin", null, null, 0, 1, 0);
      console.log(`Admin created: user id ${userId} mail ${adminMail}`);
      return 1;
    }
  };

  if (count > 0) {
    console.log(
      `Users already present (${count}), seeding only admin ensure...`
    );
    ensureAdmin();
    exit(0);
  }

  const data = [
    {
      username_user: "admin",
      password_user: bcrypt.hashSync("password123", 10),
      mail_user: "admin@example.com",
      role_user: "admin",
    },
    {
      username_user: "max",
      password_user: bcrypt.hashSync("max", 10),
      mail_user: "max@example.com",
      role_user: "admin",
    },
    {
      username_user: "polina",
      password_user: bcrypt.hashSync("polina", 10),
      mail_user: "polina@example.com",
      role_user: "scenarist",
    },
    {
      username_user: "louis",
      password_user: bcrypt.hashSync("louis", 10),
      mail_user: "louis@example.com",
      role_user: "player",
    },
  ];

  const stmt = db.prepare(
    "INSERT INTO users (username_user, password_user, mail_user, role_user) VALUES (?, ?, ?, ?)"
  );

  const insertMany = db.transaction((rows) => {
    for (const u of rows) {
      const info = stmt.run(
        u.username_user,
        u.password_user,
        u.mail_user,
        u.role_user
      );
      // Create a default player profile for each user
      db.prepare(
        "INSERT INTO players (_id_user, nickname, bio, url_img_avatar, score, level, xp) VALUES (?, ?, ?, ?, ?, ?, ?)"
      ).run(Number(info.lastInsertRowid), u.username_user, null, null, 0, 1, 0);
    }
  });
  insertMany(data);
  console.log(
    `Inserted ${data.length} users (including admin with password 'password123').`
  );
  exit(0);
} catch (e) {
  console.error("Seed users failed:", e.message);
  exit(1);
}
