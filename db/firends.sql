DROP TABLE IF EXISTS friends;

CREATE TABLE friends (
  _id_friends  INTEGER PRIMARY KEY AUTOINCREMENT,
  id_friend1   INTEGER NOT NULL,
  id_friend2   INTEGER NOT NULL,
  CHECK (id_friend1 < id_friend2),
  UNIQUE (id_friend1, id_friend2)
);

INSERT INTO friends (id_friend1, id_friend2) VALUES
(1,2),
(1,5),
(1,7),
(2,3),
(2,4),
(2,8),
(3,6),
(3,9),
(4,10),
(5,6),
(5,11),
(6,12),
(7,8),
(7,13),
(8,14),
(9,15),
(10,16),
(11,12),
(13,14),
(15,16);