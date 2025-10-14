/*Schema mis à jour avec les amis - le 13/10/2025*/
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA foreign_keys = OFF;

BEGIN TRANSACTION;

-- Drop indexes (si existent)
DROP INDEX IF EXISTS idx_blocks_mission;
DROP INDEX IF EXISTS idx_blocks_scenario;
DROP INDEX IF EXISTS idx_commune_shapes_commune;
DROP INDEX IF EXISTS idx_communes_name_de;
DROP INDEX IF EXISTS idx_communes_name_fr;
DROP INDEX IF EXISTS idx_communes_name_nl;
DROP INDEX IF EXISTS idx_mission_dependencies_required;
DROP INDEX IF EXISTS idx_mission_progress_mission;
DROP INDEX IF EXISTS idx_mission_progress_user;
DROP INDEX IF EXISTS idx_missions_scenario;
DROP INDEX IF EXISTS idx_players_user;
DROP INDEX IF EXISTS idx_scenario_communes_commune;
DROP INDEX IF EXISTS idx_scenario_communes_scenario;
DROP INDEX IF EXISTS idx_scenario_progress_scenario;
DROP INDEX IF EXISTS idx_scenario_progress_user;
DROP INDEX IF EXISTS idx_scenarios_creator;
DROP INDEX IF EXISTS idx_scenarios_published;
DROP INDEX IF EXISTS idx_users_mail;

-- Drop tables (ordre sûr)
DROP TABLE IF EXISTS blocks;
DROP TABLE IF EXISTS mission_dependencies;
DROP TABLE IF EXISTS mission_progress;
DROP TABLE IF EXISTS missions;
DROP TABLE IF EXISTS scenario_communes;
DROP TABLE IF EXISTS scenario_progress;
DROP TABLE IF EXISTS players;
DROP TABLE IF EXISTS commune_shapes;
DROP TABLE IF EXISTS communes;
DROP TABLE IF EXISTS scenarios;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS friends;

-- Create tables
CREATE TABLE users (
  _id_user       INTEGER PRIMARY KEY AUTOINCREMENT,
  username_user  TEXT NOT NULL UNIQUE,
  password_user  TEXT NOT NULL,
  mail_user      TEXT NOT NULL UNIQUE,
  role_user      TEXT NOT NULL DEFAULT 'player' CHECK (role_user IN ('player','scenarist','admin'))
);

CREATE TABLE scenarios (
  _id_scenario   INTEGER PRIMARY KEY AUTOINCREMENT,
  title_scenario TEXT NOT NULL,
  is_published   INTEGER NOT NULL DEFAULT 0, -- 0 draft / 1 published
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT NOT NULL DEFAULT (datetime('now')),
  created_by     INTEGER,
  FOREIGN KEY (created_by) REFERENCES users(_id_user) ON DELETE SET NULL
);

CREATE TABLE communes (
  _id_commune       INTEGER PRIMARY KEY AUTOINCREMENT,
  name_fr           TEXT,
  name_nl           TEXT,
  name_de           TEXT,
  geo_point_lat     REAL,
  geo_point_lon     REAL,
  postal_codes      TEXT
);

CREATE TABLE commune_shapes (
  _id_commune       INTEGER PRIMARY KEY,
  geo_shape_geojson TEXT,
  FOREIGN KEY (_id_commune) REFERENCES communes(_id_commune) ON DELETE CASCADE
);

CREATE TABLE missions (
  _id_mission       INTEGER PRIMARY KEY AUTOINCREMENT,
  _id_scenario      INTEGER NOT NULL,
  position_mission  INTEGER NOT NULL DEFAULT 1,
  title_mission     TEXT NOT NULL,
  latitude          REAL NOT NULL,
  longitude         REAL NOT NULL,
  riddle_text       TEXT NOT NULL,
  answer_word       TEXT NOT NULL,
  FOREIGN KEY (_id_scenario) REFERENCES scenarios(_id_scenario) ON DELETE CASCADE
);

CREATE TABLE mission_dependencies (
  _id_mission          INTEGER NOT NULL,
  _id_mission_required INTEGER NOT NULL,
  PRIMARY KEY (_id_mission, _id_mission_required),
  FOREIGN KEY (_id_mission) REFERENCES missions(_id_mission) ON DELETE CASCADE,
  FOREIGN KEY (_id_mission_required) REFERENCES missions(_id_mission) ON DELETE CASCADE,
  CHECK (_id_mission != _id_mission_required)
);

CREATE TABLE mission_progress (
  _id_user     INTEGER NOT NULL,
  _id_mission  INTEGER NOT NULL,
  completed_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (_id_user, _id_mission),
  FOREIGN KEY (_id_user) REFERENCES users(_id_user) ON DELETE CASCADE,
  FOREIGN KEY (_id_mission) REFERENCES missions(_id_mission) ON DELETE CASCADE
);

CREATE TABLE players (
  _id_player     INTEGER PRIMARY KEY AUTOINCREMENT,
  _id_user       INTEGER NOT NULL UNIQUE,
  nickname       TEXT,
  bio            TEXT,
  url_img_avatar TEXT,
  score          INTEGER NOT NULL DEFAULT 0,
  level          INTEGER NOT NULL DEFAULT 1,
  xp             INTEGER NOT NULL DEFAULT 0,
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (_id_user) REFERENCES users(_id_user) ON DELETE CASCADE
);

CREATE TABLE blocks (
  _id_block      INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_type     TEXT NOT NULL,
  _id_scenario   INTEGER,
  _id_mission    INTEGER,
  position_block INTEGER NOT NULL DEFAULT 1,
  type_block     TEXT NOT NULL,        -- 'text' | 'image' | 'video' | 'audio'
  content_text   TEXT,                 -- for text blocks
  url_media      TEXT,                 -- for media blocks
  caption        TEXT,
  FOREIGN KEY (_id_scenario) REFERENCES scenarios(_id_scenario) ON DELETE CASCADE,
  FOREIGN KEY (_id_mission)  REFERENCES missions(_id_mission)   ON DELETE CASCADE,
  CHECK (owner_type IN ('scenario_intro','mission','scenario_outro')),
  CHECK (
    (owner_type = 'scenario_intro'  AND _id_scenario IS NOT NULL AND _id_mission IS NULL) OR
    (owner_type = 'scenario_outro'  AND _id_scenario IS NOT NULL AND _id_mission IS NULL) OR
    (owner_type = 'mission'         AND _id_mission  IS NOT NULL AND _id_scenario IS NULL)
  )
);

CREATE TABLE scenario_communes (
  _id_scenario INTEGER NOT NULL,
  _id_commune  INTEGER NOT NULL,
  PRIMARY KEY (_id_scenario, _id_commune),
  FOREIGN KEY (_id_scenario) REFERENCES scenarios(_id_scenario) ON DELETE CASCADE,
  FOREIGN KEY (_id_commune)  REFERENCES communes(_id_commune)  ON DELETE CASCADE
);

CREATE TABLE scenario_progress (
  _id_user        INTEGER NOT NULL,
  _id_scenario    INTEGER NOT NULL,
  status          TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started','started','completed')),
  bookmarked      INTEGER NOT NULL DEFAULT 1,
  started_at      TEXT,
  completed_at    TEXT,
  last_interaction_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (_id_user, _id_scenario),
  FOREIGN KEY (_id_user) REFERENCES users(_id_user) ON DELETE CASCADE,
  FOREIGN KEY (_id_scenario) REFERENCES scenarios(_id_scenario) ON DELETE CASCADE
);

CREATE TABLE friends (
  _id_friends  INTEGER PRIMARY KEY AUTOINCREMENT,
  id_friend1   INTEGER NOT NULL,
  id_friend2   INTEGER NOT NULL,
  CHECK (id_friend1 < id_friend2),
  UNIQUE (id_friend1, id_friend2)
);

-- Create indexes
CREATE INDEX idx_blocks_mission  ON blocks(_id_mission, position_block);
CREATE INDEX idx_blocks_scenario ON blocks(_id_scenario, owner_type, position_block);
CREATE INDEX idx_commune_shapes_commune ON commune_shapes(_id_commune);
CREATE INDEX idx_communes_name_de ON communes(name_de);
CREATE INDEX idx_communes_name_fr ON communes(name_fr);
CREATE INDEX idx_communes_name_nl ON communes(name_nl);
CREATE INDEX idx_mission_dependencies_required ON mission_dependencies(_id_mission_required);
CREATE INDEX idx_mission_progress_mission ON mission_progress(_id_mission);
CREATE INDEX idx_mission_progress_user ON mission_progress(_id_user);
CREATE INDEX idx_missions_scenario ON missions(_id_scenario, position_mission);
CREATE INDEX idx_players_user ON players(_id_user);
CREATE INDEX idx_scenario_communes_commune  ON scenario_communes(_id_commune);
CREATE INDEX idx_scenario_communes_scenario ON scenario_communes(_id_scenario);
CREATE INDEX idx_scenario_progress_scenario ON scenario_progress(_id_scenario);
CREATE INDEX idx_scenario_progress_user ON scenario_progress(_id_user);
CREATE INDEX idx_scenarios_creator ON scenarios(created_by);
CREATE INDEX idx_scenarios_published ON scenarios(is_published);
CREATE INDEX idx_users_mail ON users(mail_user);

COMMIT;

PRAGMA foreign_keys = ON;