-- Minimal SQLite schema used by the app (users, scenarios)

CREATE TABLE IF NOT EXISTS users (
  _id_user       INTEGER PRIMARY KEY AUTOINCREMENT,
  username_user  TEXT NOT NULL UNIQUE,
  password_user  TEXT NOT NULL,
  mail_user      TEXT NOT NULL UNIQUE,
  firstname_user TEXT,
  name_user      TEXT,
  url_img_user   TEXT,
  role_user      TEXT NOT NULL DEFAULT 'player' CHECK (role_user IN ('player','scenarist','admin'))
);

CREATE INDEX IF NOT EXISTS idx_users_mail ON users(mail_user);

CREATE TABLE IF NOT EXISTS scenarios (
  _id_scenario            INTEGER PRIMARY KEY AUTOINCREMENT,
  title_scenario          TEXT NOT NULL,
  intro_scenario          TEXT,
  url_img_scenario        TEXT,
  summary_scenario        TEXT, -- short abstract / teaser
  difficulty              TEXT NOT NULL DEFAULT 'easy' CHECK (difficulty IN ('easy','medium','hard')),
  estimated_duration_min  INTEGER, -- approximate time to finish
  is_published            INTEGER NOT NULL DEFAULT 0, -- 0 draft / 1 published
  updated_at              TEXT NOT NULL DEFAULT (datetime('now')),
  created_by              INTEGER,
  FOREIGN KEY (created_by) REFERENCES users(_id_user) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_scenarios_creator ON scenarios(created_by);

-- Missions belong to a scenario and include order, GPS, riddle, and answer
CREATE TABLE IF NOT EXISTS missions (
  _id_mission       INTEGER PRIMARY KEY AUTOINCREMENT,
  _id_scenario      INTEGER NOT NULL,
  position_mission  INTEGER NOT NULL DEFAULT 1,
  title_mission     TEXT NOT NULL,
  latitude          REAL NOT NULL,
  longitude         REAL NOT NULL,
  riddle_text       TEXT NOT NULL,
  answer_word       TEXT NOT NULL,
  url_img_mission   TEXT,
  FOREIGN KEY (_id_scenario) REFERENCES scenarios(_id_scenario) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_missions_scenario ON missions(_id_scenario, position_mission);

-- Ordered content blocks for scenario intros, mission bodies, and scenario conclusions
-- owner_type ∈ ('scenario_intro','mission','scenario_outro')
CREATE TABLE IF NOT EXISTS blocks (
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

CREATE INDEX IF NOT EXISTS idx_blocks_scenario ON blocks(_id_scenario, owner_type, position_block);
CREATE INDEX IF NOT EXISTS idx_blocks_mission  ON blocks(_id_mission, position_block);

-- Player profiles linked 1:1 to users
CREATE TABLE IF NOT EXISTS players (
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

CREATE INDEX IF NOT EXISTS idx_players_user ON players(_id_user);

-- Communes (Belgian municipalities) and many-to-many link with scenarios
CREATE TABLE IF NOT EXISTS communes (
  _id_commune    INTEGER PRIMARY KEY AUTOINCREMENT,
  name_commune   TEXT NOT NULL,
  nis_code       TEXT UNIQUE,            -- official Belgian NIS code (optional)
  region         TEXT,                   -- e.g. 'Wallonia', 'Flanders', 'Brussels'
  province       TEXT,                   -- e.g. 'Hainaut', 'Luxembourg', 'Limburg'
  latitude       REAL,                   -- optional centroid lat
  longitude      REAL                    -- optional centroid lon
);

CREATE INDEX IF NOT EXISTS idx_communes_name ON communes(name_commune);

CREATE TABLE IF NOT EXISTS scenario_communes (
  _id_scenario INTEGER NOT NULL,
  _id_commune  INTEGER NOT NULL,
  PRIMARY KEY (_id_scenario, _id_commune),
  FOREIGN KEY (_id_scenario) REFERENCES scenarios(_id_scenario) ON DELETE CASCADE,
  FOREIGN KEY (_id_commune)  REFERENCES communes(_id_commune)  ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_scenario_communes_scenario ON scenario_communes(_id_scenario);
CREATE INDEX IF NOT EXISTS idx_scenario_communes_commune  ON scenario_communes(_id_commune);

-- Player scenario progress (bookmarks + status)
CREATE TABLE IF NOT EXISTS scenario_progress (
  _id_user        INTEGER NOT NULL,
  _id_scenario    INTEGER NOT NULL,
  status          TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started','started','completed')),
  bookmarked      INTEGER NOT NULL DEFAULT 1, -- 1 if user wants it in bookmarks
  started_at      TEXT,
  completed_at    TEXT,
  last_interaction_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (_id_user, _id_scenario),
  FOREIGN KEY (_id_user) REFERENCES users(_id_user) ON DELETE CASCADE,
  FOREIGN KEY (_id_scenario) REFERENCES scenarios(_id_scenario) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_scenario_progress_user ON scenario_progress(_id_user);
CREATE INDEX IF NOT EXISTS idx_scenario_progress_scenario ON scenario_progress(_id_scenario);

-- Mission completion tracking
CREATE TABLE IF NOT EXISTS mission_progress (
  _id_user     INTEGER NOT NULL,
  _id_mission  INTEGER NOT NULL,
  completed_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (_id_user, _id_mission),
  FOREIGN KEY (_id_user) REFERENCES users(_id_user) ON DELETE CASCADE,
  FOREIGN KEY (_id_mission) REFERENCES missions(_id_mission) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_mission_progress_user ON mission_progress(_id_user);
CREATE INDEX IF NOT EXISTS idx_mission_progress_mission ON mission_progress(_id_mission);

-- Mission prerequisites (dependencies within same scenario)
CREATE TABLE IF NOT EXISTS mission_dependencies (
  _id_mission          INTEGER NOT NULL,
  _id_mission_required INTEGER NOT NULL,
  PRIMARY KEY (_id_mission, _id_mission_required),
  FOREIGN KEY (_id_mission) REFERENCES missions(_id_mission) ON DELETE CASCADE,
  FOREIGN KEY (_id_mission_required) REFERENCES missions(_id_mission) ON DELETE CASCADE,
  CHECK (_id_mission != _id_mission_required)
);

CREATE INDEX IF NOT EXISTS idx_mission_dependencies_required ON mission_dependencies(_id_mission_required);
