import { Router } from "express";
import db from "../db/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import requireAuth from "../middleware/auth.js";
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
  const { mail_user, password_user } = req.body || {};
  if (!mail_user || !password_user) {
    return res
      .status(400)
      .json({ error: "mail_user and password_user are required" });
  }
  try {
    const row = db
      .prepare(
        `SELECT _id_user AS id, username_user, mail_user, firstname_user, name_user, url_img_user, password_user FROM users WHERE mail_user = ?`
      )
      .get(mail_user);
    if (!row) return res.status(401).json("bad login or password");
    // Support hashed passwords (preferred) with a legacy plaintext fallback
    let ok = false;
    try {
      ok = bcrypt.compareSync(password_user, row.password_user);
    } catch (_) {
      ok = false;
    }
    if (!ok) {
      // legacy fallback: if DB still has plaintext passwords
      ok = row.password_user === password_user;
    }
    if (!ok) return res.status(401).json("bad login or password");

    const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
    const token = jwt.sign({ sub: row.id, mail: row.mail_user }, JWT_SECRET, {
      expiresIn: "2h",
    });

    const { password_user: _pw, ...user } = row;
    // Back-compat: flatten user fields and add token at top-level
    res.status(200).json({ token, ...user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/register — crée un user (validation simple)
router.post(`/register`, (req, res) => {
  const {
    username_user,
    mail_user,
    password_user,
    firstname_user,
    name_user,
    url_img_user,
  } = req.body || {};
  if (!username_user || !mail_user || !password_user) {
    return res
      .status(400)
      .json({ error: "username_user, mail_user, password_user are required" });
  }
  try {
    const exists = db
      .prepare("SELECT 1 FROM users WHERE mail_user = ?")
      .get(mail_user);
    if (exists) return res.status(409).json({ error: "mail already used" });

    const hash = bcrypt.hashSync(password_user, 10);
    const stmt = db.prepare(
      `INSERT INTO users (username_user, password_user, mail_user, firstname_user, name_user, url_img_user) VALUES (?, ?, ?, ?, ?, ?)`
    );
    const info = stmt.run(
      username_user,
      hash,
      mail_user,
      firstname_user ?? null,
      name_user ?? null,
      url_img_user ?? null
    );

    const user = {
      id: Number(info.lastInsertRowid),
      username_user,
      mail_user,
      firstname_user: firstname_user ?? null,
      name_user: name_user ?? null,
      url_img_user: url_img_user ?? null,
    };

    const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
    const token = jwt.sign({ sub: user.id, mail: mail_user }, JWT_SECRET, {
      expiresIn: "2h",
    });

    // Back-compat response: flatten user fields and add token
    res.status(201).json({ token, ...user });
  } catch (err) {
    // Unique constraint fallback
    if (
      String(err.message || "")
        .toLowerCase()
        .includes("unique")
    ) {
      return res.status(409).json({ error: "username or mail already used" });
    }
    return res.status(500).json({ error: err.message });
  }
});

// auth middleware moved to ../middleware/auth.js

// GET /api/me — retourne l'utilisateur courant via JWT
router.get("/me", requireAuth, (req, res) => {
  try {
    const user = db
      .prepare(
        `SELECT _id_user AS id, username_user, mail_user, firstname_user, name_user, url_img_user FROM users WHERE _id_user = ?`
      )
      .get(req.auth?.sub);
    if (!user) return res.status(404).json({ error: "user not found" });
    res.json(user);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// mini-doc déplacée dans controllers/docs.routes.js

export default router;
