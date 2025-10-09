import db from "../db/index.js";
import { fileURLToPath } from "url";

export const users = [
  {
    username_user: "max",
    password_user: "password123",
    mail_user: "max@example.com",
    role_user: "admin",
  },
  {
    username_user: "louis",
    password_user: "password123",
    mail_user: "louis@example.com",
    role_user: "admin",
  },
  {
    username_user: "polina",
    password_user: "password123",
    mail_user: "polina@example.com",
    role_user: "admin",
  },
  {
    username_user: "alice",
    password_user: "password123",
    mail_user: "alice@example.com",
    role_user: "scenarist",
  },
  {
    username_user: "bob",
    password_user: "password123",
    mail_user: "bob@example.com",
    role_user: "scenarist",
  },
  {
    username_user: "charlie",
    password_user: "password123",
    mail_user: "charlie@example.com",
    role_user: "scenarist",
  },
  {
    username_user: "player01",
    password_user: "password123",
    mail_user: "player01@example.com",
    role_user: "player",
  },
  {
    username_user: "player02",
    password_user: "password123",
    mail_user: "player02@example.com",
    role_user: "player",
  },
  {
    username_user: "player03",
    password_user: "password123",
    mail_user: "player03@example.com",
    role_user: "player",
  },
  {
    username_user: "player04",
    password_user: "password123",
    mail_user: "player04@example.com",
    role_user: "player",
  },
  {
    username_user: "player05",
    password_user: "password123",
    mail_user: "player05@example.com",
    role_user: "player",
  },
  {
    username_user: "player06",
    password_user: "password123",
    mail_user: "player06@example.com",
    role_user: "player",
  },
  {
    username_user: "player07",
    password_user: "password123",
    mail_user: "player07@example.com",
    role_user: "player",
  },
  {
    username_user: "player08",
    password_user: "password123",
    mail_user: "player08@example.com",
    role_user: "player",
  },
  {
    username_user: "player09",
    password_user: "password123",
    mail_user: "player09@example.com",
    role_user: "player",
  },
  {
    username_user: "player10",
    password_user: "password123",
    mail_user: "player10@example.com",
    role_user: "player",
  },
];

const insertUser = db.prepare(`
  INSERT INTO users (username_user, password_user, mail_user, role_user)
  VALUES (?, ?, ?, ?)
`);

const insertAllUsers = db.transaction(() => {
  for (const user of users) {
    insertUser.run(
      user.username_user,
      user.password_user,
      user.mail_user,
      user.role_user
    );
  }
});

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  insertAllUsers();
  console.log(`Seed users: ${users.length} users insérés.`);
}
