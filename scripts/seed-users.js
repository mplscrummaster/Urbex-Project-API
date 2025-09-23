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

try {
  const row = db.prepare("SELECT COUNT(*) AS c FROM users").get();
  const count = row?.c ?? 0;
  if (count > 0) {
    console.log(`Users already present (${count}), skipping.`);
    exit(0);
  }

  const data = [
    {
      username_user: "max",
      password_user: bcrypt.hashSync("max", 10),
      mail_user: "max@example.com",
      firstname_user: "Max",
      name_user: "Mich",
      url_img_user: "",
      role_user: "admin",
    },
    {
      username_user: "polina",
      password_user: bcrypt.hashSync("polina", 10),
      mail_user: "polina@example.com",
      firstname_user: "Polina",
      name_user: "Bevz",
      url_img_user: null,
      role_user: "scenarist",
    },
    {
      username_user: "louis",
      password_user: bcrypt.hashSync("louis", 10),
      mail_user: "louis@example.com",
      firstname_user: "Louis",
      name_user: "Janquart",
      url_img_user: null,
      role_user: "player",
    },
  ];

  const stmt = db.prepare(
    "INSERT INTO users (username_user, password_user, mail_user, firstname_user, name_user, url_img_user, role_user) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );

  const insertMany = db.transaction((rows) => {
    for (const u of rows) {
      const info = stmt.run(
        u.username_user,
        u.password_user,
        u.mail_user,
        u.firstname_user,
        u.name_user,
        u.url_img_user,
        u.role_user
      );
      // Create a default player profile for each user
      db.prepare(
        "INSERT INTO players (_id_user, nickname, bio, url_img_avatar, score, level, xp) VALUES (?, ?, ?, ?, ?, ?, ?)"
      ).run(Number(info.lastInsertRowid), u.username_user, null, null, 0, 1, 0);
    }
  });
  insertMany(data);
  console.log(`Inserted ${data.length} users.`);
  exit(0);
} catch (e) {
  console.error("Seed users failed:", e.message);
  exit(1);
}
