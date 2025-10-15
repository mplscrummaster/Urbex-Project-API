import { Router } from 'express';
import db from '../db/index.js';
import requireAuth from '../middleware/auth.js';

const router = Router();

// READ players
router.get('/players', (req, res) => {
  try {
    const rows = db
      .prepare(
        `SELECT p._id_player AS id, u.username_user AS username, p.nickname, p.url_img_avatar, p.score, p.level, p.xp
         FROM players p JOIN users u ON u._id_user = p._id_user`
      )
      .all();
    res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// READ player by id
router.get('/players/:id', (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(id) || id <= 0) return res.status(400).json({ error: 'invalid id' });
  try {
    const row = db
      .prepare(
        `SELECT p._id_player AS id, u.username_user AS username, p.nickname, p.url_img_avatar, p.score, p.level, p.xp
         FROM players p JOIN users u ON u._id_user = p._id_user WHERE p._id_player = ?`
      )
      .get(id);
    if (!row) return res.status(404).json({ error: 'player not found' });
    res.json(row);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// READ player profile (self)
router.get('/me/player', requireAuth, (req, res) => {
  try {
    const player = db
      .prepare(
        `SELECT p._id_player AS id, p._id_user AS user_id, p.nickname, p.bio, p.url_img_avatar, p.score, p.level, p.xp, p.created_at
         FROM players p WHERE p._id_user = ?`
      )
      .get(req.auth?.sub);
    if (!player) return res.status(404).json({ error: 'player not found' });
    res.json(player);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// READ player friends (self)
router.get('/me/friends', requireAuth, (req, res) => {
  try {
    const friends = db
      .prepare(
        ` SELECT DISTINCT
          pf._id_player AS id,
          u.username_user AS username,
          pf.nickname,
          pf.url_img_avatar,
          pf.score,
          pf.level,
          pf.xp
        FROM friends f
        JOIN players pf ON pf._id_player = CASE
                                            WHEN f.id_friend1 = ? THEN f.id_friend2
                                            ELSE f.id_friend1
                                          END
        JOIN users u ON u._id_user = pf._id_user
        WHERE ? IN (f.id_friend1, f.id_friend2)
        ORDER BY pf._id_player;`
      )
      .all(req.auth?.sub, req.auth?.sub);

    // console.log('req.auth?.sub', req.auth?.sub);
    if (!friends) return res.status(404).json({ error: 'friends not found' });
    res.json(friends);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
/**
 * Objet attendu : 
 * {
    "_id_user": 1,
  }
 */
router.get('/me/tutorial', requireAuth, (req, res) => {
  const _id_user = req.body._id_user;
  // console.log(_id_user);

  try {
    const player = db.prepare(`select * from startTutorial where _id_user = ?`).get(_id_user);
    if (!player) return res.status(404).json({ error: 'player not found' });
    res.json(player);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
/**
 * Objet attendu : 
 * {
    "_id_user": 1,
    "startTutorial" : 0
  }
 */
router.put('/me/tutorial', requireAuth, (req, res) => {
  const _id_user = req.body._id_user;
  const startTutorial = req.body.startTutorial;
  // console.log('_id_user', _id_user);
  // console.log('startTutorial', startTutorial);

  try {
    const player = db
      .prepare(
        `UPDATE startTutorial
          SET startTutorial = ?
          WHERE _id_user = ?;`
      )
      .run(startTutorial, _id_user);
    if (!player) return res.status(404).json({ error: 'player not found' });
    res.json(player);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// READ friend by nickname
router.get('/friends/:nickname', (req, res) => {
  const nickname = req.params.nickname;
  // console.log(nickname);

  try {
    const row = db.prepare(`select * from players where nickname = ?`).get(nickname);
    if (!row) return res.status(404).json({ error: 'player not found' });
    res.json(row);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// UPDATE player profile (self)
router.put('/me/player', requireAuth, (req, res) => {
  // Accept some alias field names for dev ergonomics
  const allowed = ['nickname', 'bio', 'url_img_avatar'];
  const aliasMap = {
    pseudo: 'nickname',
    description: 'bio',
    avatar: 'url_img_avatar',
    avatar_url: 'url_img_avatar',
  };
  const raw = req.body || {};
  const payload = {};
  for (const k of Object.keys(raw)) {
    const mapped = aliasMap[k] || k;
    if (allowed.includes(mapped)) {
      payload[mapped] = raw[k];
    }
  }

  const fieldNames = Object.keys(payload);
  const userId = req.auth?.sub;

  try {
    // Ensure a row exists (INSERT OR IGNORE is idempotent thanks to UNIQUE on _id_user)
    db.prepare('INSERT OR IGNORE INTO players (_id_user) VALUES (?)').run(userId);

    if (fieldNames.length === 0) {
      // Just return existing (or newly created blank) profile
      const player = db
        .prepare(
          `SELECT p._id_player AS id, p._id_user AS user_id, p.nickname, p.bio, p.url_img_avatar, p.score, p.level, p.xp, p.created_at
           FROM players p WHERE p._id_user = ?`
        )
        .get(userId);
      const created = player && player.nickname == null && player.bio == null && player.url_img_avatar == null; // heuristic
      return res.status(200).json({ ...player, created });
    }

    // Build dynamic UPDATE only for provided fields
    const setClause = fieldNames.map((f) => `${f} = ?`).join(', ');
    const values = fieldNames.map((f) => payload[f]);
    const info = db.prepare(`UPDATE players SET ${setClause} WHERE _id_user = ?`).run(...values, userId);

    if (info.changes === 0) {
      // This should be rare (would mean row vanished after INSERT OR IGNORE) => recreate explicitly
      db.prepare('INSERT INTO players (_id_user) VALUES (?)').run(userId);
      db.prepare(`UPDATE players SET ${setClause} WHERE _id_user = ?`).run(...values, userId);
    }

    const player = db
      .prepare(
        `SELECT p._id_player AS id, p._id_user AS user_id, p.nickname, p.bio, p.url_img_avatar, p.score, p.level, p.xp, p.created_at
         FROM players p WHERE p._id_user = ?`
      )
      .get(userId);
    res.json({ ...player, created: false });
  } catch (err) {
    console.error('/me/player upsert error', err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * Met à jour une ressource en fonction de deux IDs reçus dans le body JSON.
 * Exemple de body attendu :
 * {
 *   "id1": 123,
 *   "id2": 456
 * }
 */
router.post('/friends/add', (req, res) => {
  const { id1, id2 } = req.body || {};

  // Vérification basique
  if (!Number.isInteger(id1) || !Number.isInteger(id2)) {
    return res.status(400).json({ error: 'id1 et id2 sont obligatoires et doivent être des entiers' });
  }

  try {
    // Exemple de requête SQL : ici on met à jour une table fictive "liens"
    const info = db.prepare(`INSERT INTO friends (id_friend1, id_friend2) VALUES (?, ?);`).run(id1, id2);

    if (info.changes === 0) {
      return res.status(404).json({ error: 'Aucune ressource trouvée avec ces IDs' });
    }

    res.json({ success: true, updated: info.changes });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.delete('/friends/delete', requireAuth, (req, res) => {
  const { id1, id2 } = req.body || {};

  // Vérification basique
  if (!Number.isInteger(id1) || !Number.isInteger(id2)) {
    return res.status(400).json({ error: 'id1 et id2 sont obligatoires et doivent être des entiers' });
  }

  try {
    // Exemple de requête SQL : ici on met à jour une table fictive "liens"
    const info = db.prepare(`DELETE FROM friends WHERE id_friend1 = ? AND id_friend2 = ?;`).run(id1, id2);

    if (info.changes === 0) {
      return res.status(404).json({ error: 'Aucune ressource trouvée avec ces IDs' });
    }

    res.json({ success: true, updated: info.changes });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
