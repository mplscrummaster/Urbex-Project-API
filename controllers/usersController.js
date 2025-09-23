import { Router } from "express";
import db from "../db/index.js";
const router = Router();

// Connexion unique better-sqlite3 via module partagé

// GET /api/users — liste des users (champs non sensibles)
router.get("/users", (req, res) => {
  console.log("inside users route");
  try {
    const rows = db.prepare(
      `SELECT _id_user AS id, username_user, mail_user, firstname_user, name_user, url_img_user FROM users`
    ).all();
    res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/users/:id — un user par id (champs non sensibles)
router.get("/users/:id", (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ error: "invalid id" });
  }
  console.log("inside user by id route", { id });
  try {
    const row = db
      .prepare(
        `SELECT _id_user AS id, username_user, mail_user, firstname_user, name_user, url_img_user FROM users WHERE _id_user = ?`
      )
      .get(id);
    if (!row) return res.status(404).json({ error: "user not found" });
    res.json(row);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
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
  try {
    const row = db
      .prepare(
        `SELECT _id_user AS id, username_user, mail_user, firstname_user, name_user, url_img_user FROM users WHERE mail_user = ? AND password_user = ?`
      )
      .get(mail_user, password_user);
    if (!row) return res.status(401).json("bad login or password");
    res.status(200).json(row);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
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
  try {
    const placeholders = keys.map(() => "?").join(",");
    const stmt = db.prepare(
      `INSERT INTO users (${keys.join(",")}) VALUES (${placeholders})`
    );
    const info = stmt.run(values);
    res.status(201).json({ id: info.lastInsertRowid, ...req.body });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
// GET /api/ — mini doc JSON des endpoints de ce router
router.get(`/`, (_req, res) => {
  return res.status(200).json({
    routes: [
      { method: "GET", path: "/api/users" },
      { method: "GET", path: "/api/users/:id" },
      { method: "POST", path: "/api/login" },
      { method: "POST", path: "/api/register" },
      // Scenarios (lecture seule)
      { method: "GET", path: "/api/scenarios" },
      { method: "GET", path: "/api/scenarios/:id" },
    ],
  });
});
export default router;
