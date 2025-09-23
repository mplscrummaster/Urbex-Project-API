import sqlite3 from "sqlite3";
import { Router } from "express";
const router = Router();

// Connexion SQLite unique (BDD déplacée dans le dossier db/)
const db = new sqlite3.Database(`db/bdd.db`, (err) => {
  if (err) console.error("Erreur de connexion à la BDD");
  else console.log("Connecté à la BDD");
});

// GET /api/users — liste des users (champs non sensibles)
router.get("/users", (req, res) => {
  console.log("inside users route");
  db.all(
    `SELECT _id_user AS id, username_user, mail_user, firstname_user, name_user, url_img_user FROM users`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});
// /**
//  * Select d'un user via son id
//  */
// express.get("/users/:_id_user", (req, res) => {
//   const { _id_user } = req.params;
//   console.log("inside userid route");

//   db.all(`SELECT * FROM users WHERE _id_user = ?`, [_id_user], (err, rows) => {
//     if (err) return res.status(500).json({ error: err.message });
//     res.json(rows);
//   });
// });

// POST /api/login — authentifie par email + mot de passe
router.post("/login", (req, res) => {
  const { mail_user, password_user } = req.body;
  console.log("inside login route");

  db.all(
    `SELECT _id_user AS id, username_user, mail_user, firstname_user, name_user, url_img_user FROM users WHERE mail_user = ? AND password_user = ?`,
    [mail_user, password_user],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      if (rows.length === 0) res.status(401).json("bad login or password");
      else res.status(200).json(rows[0]);
    }
  );
});
// POST /api/register — crée un user (validation simple)
router.post(`/register`, (req, res) => {
  console.log("inside register route");
  const keys = Object.keys(req.body);
  // console.log("keys", keys);
  const values = Object.values(req.body);
  // console.log("values", values);
  // console.log(
  // 	'keys.map(() => "?").join(",")',
  // 	keys.map(() => "?")
  // );
  db.run(
    `INSERT INTO users (${keys.join(",")}) 
		VALUES (${keys.map(() => "?").join(",")})`,
    values,
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, ...req.body });
    }
  );
});
// GET /api/ — mini doc JSON des endpoints de ce router
router.get(`/`, (_req, res) => {
  return res.status(200).json({
    routes: [
      { method: "GET", path: "/api/users" },
      { method: "POST", path: "/api/login" },
      { method: "POST", path: "/api/register" },
    ],
  });
});
export default router;
