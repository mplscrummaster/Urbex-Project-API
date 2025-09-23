-- Minimal SQLite schema used by the app (users, scenarios)

CREATE TABLE IF NOT EXISTS users (
  _id_user       INTEGER PRIMARY KEY AUTOINCREMENT,
  username_user  TEXT NOT NULL UNIQUE,
  password_user  TEXT NOT NULL,
  mail_user      TEXT NOT NULL UNIQUE,
  firstname_user TEXT,
  name_user      TEXT,
  url_img_user   TEXT
);

CREATE INDEX IF NOT EXISTS idx_users_mail ON users(mail_user);

CREATE TABLE IF NOT EXISTS scenarios (
  _id_scenario     INTEGER PRIMARY KEY AUTOINCREMENT,
  title_scenario   TEXT NOT NULL,
  intro_scenario   TEXT,
  url_img_scenario TEXT
);
