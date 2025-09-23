import fs from "fs";
import db from "../db/index.js";

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
      password_user: "max",
      mail_user: "max@example.com",
      firstname_user: "Max",
      name_user: "Mich",
      url_img_user: "",
    },
    {
      username_user: "polina",
      password_user: "polina",
      mail_user: "polina@example.com",
      firstname_user: "Polina",
      name_user: "Bevz",
      url_img_user: null,
    },
    {
      username_user: "louis",
      password_user: "louis",
      mail_user: "louis@example.com",
      firstname_user: "Louis",
      name_user: "Janquart",
      url_img_user: null,
    },
  ];

  const stmt = db.prepare(
    "INSERT INTO users (username_user, password_user, mail_user, firstname_user, name_user, url_img_user) VALUES (?, ?, ?, ?, ?, ?)"
  );

  const insertMany = db.transaction((rows) => {
    for (const u of rows) {
      stmt.run(
        u.username_user,
        u.password_user,
        u.mail_user,
        u.firstname_user,
        u.name_user,
        u.url_img_user
      );
    }
  });
  insertMany(data);
  console.log(`Inserted ${data.length} users.`);
  exit(0);
} catch (e) {
  console.error("Seed users failed:", e.message);
  exit(1);
}
