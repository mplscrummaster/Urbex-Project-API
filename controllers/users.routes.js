import { Router } from "express";
import db from "../db/index.js";
const router = Router();

// GET /api/users — liste des users (champs non sensibles)
router.get("/users", (req, res) => {
  try {
    const rows = db
      .prepare(
        `SELECT _id_user AS id, username_user, mail_user, firstname_user, name_user, url_img_user FROM users`
      )
      .all();
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

// POST /api/login — authentifie par email + mot de passe
router.post("/login", (req, res) => {
  const { mail_user, password_user } = req.body;
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
  const keys = Object.keys(req.body);
  const values = Object.values(req.body);
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
      { method: "GET", path: "/api/scenarios" },
      { method: "GET", path: "/api/scenarios/:id" },
      { method: "GET", path: "/api/scenarios/:id/missions" },
      { method: "GET", path: "/api/missions/:id" },
      { method: "GET", path: "/api/scenarios/:id/intro" },
      { method: "GET", path: "/api/scenarios/:id/outro" },
      { method: "GET", path: "/api/missions/:id/blocks" },
    ],
  });
});

export default router;
