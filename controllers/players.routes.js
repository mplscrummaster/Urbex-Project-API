import { Router } from "express";
import db from "../db/index.js";
import requireAuth from "../middleware/auth.js";

const router = Router();

function isAdmin(userId) {
  const row = db
    .prepare("SELECT role_user FROM users WHERE _id_user = ?")
    .get(userId);
  return row?.role_user === "admin";
}

// GET /api/me/player — current user's player profile
router.get("/me/player", requireAuth, (req, res) => {
  try {
    const player = db
      .prepare(
        `SELECT p._id_player AS id, p._id_user AS user_id, p.nickname, p.bio, p.url_img_avatar, p.score, p.level, p.xp, p.created_at
         FROM players p WHERE p._id_user = ?`
      )
      .get(req.auth?.sub);
    if (!player) return res.status(404).json({ error: "player not found" });
    res.json(player);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/me/player — update own player profile
router.put("/me/player", requireAuth, (req, res) => {
  const allowed = ["nickname", "bio", "url_img_avatar"];
  const payload = req.body || {};
  const keys = Object.keys(payload).filter((k) => allowed.includes(k));
  if (keys.length === 0)
    return res.status(400).json({ error: "no valid fields to update" });
  try {
    const setClause = keys.map((k) => `${k} = ?`).join(", ");
    const values = keys.map((k) => payload[k]);
    const info = db
      .prepare(`UPDATE players SET ${setClause} WHERE _id_user = ?`)
      .run(...values, req.auth?.sub);
    if (info.changes === 0)
      return res.status(404).json({ error: "player not found" });
    const player = db
      .prepare(
        `SELECT p._id_player AS id, p._id_user AS user_id, p.nickname, p.bio, p.url_img_avatar, p.score, p.level, p.xp, p.created_at
         FROM players p WHERE p._id_user = ?`
      )
      .get(req.auth?.sub);
    res.json(player);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/players — admin list of players
router.get("/players", requireAuth, (req, res) => {
  try {
    if (!isAdmin(req.auth?.sub))
      return res.status(403).json({ error: "forbidden" });
    const rows = db
      .prepare(
        `SELECT p._id_player AS id, u.username_user AS username, u.mail_user AS mail, p.nickname, p.score, p.level, p.xp
         FROM players p JOIN users u ON u._id_user = p._id_user`
      )
      .all();
    res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
