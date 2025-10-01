#!/usr/bin/env node
/**
 * Orchestrator: reset (optional) + full seed pipeline + optional publish + enrichment.
 * Usage:
 *  node scripts/seed-all.js                -> just seeds (no reset)
 *  node scripts/seed-all.js --reset        -> reset DB then seeds
 *  node scripts/seed-all.js --publish      -> publish first N scenarios
 *  node scripts/seed-all.js --scores       -> randomize players score/xp
 *  node scripts/seed-all.js --media        -> add simple image blocks if missing
 *  Flags can be combined.
 */
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import Database from 'better-sqlite3'

const ROOT = path.resolve(process.cwd())
const DB_PATH = process.env.DB_PATH || path.join(ROOT, 'db/bdd.db')

const args = new Set(process.argv.slice(2))

const run = (cmd) => {
  console.log(`→ ${cmd}`)
  execSync(cmd, { stdio: 'inherit' })
}

try {
  if (args.has('--reset')) {
    run('node scripts/db-reset.js')
  } else if (!fs.existsSync(DB_PATH)) {
    console.log('DB not found: running reset automatically')
    run('node scripts/db-reset.js')
  }

  // Core seed order
  run('node scripts/seed-scenarios.js')
  run('node scripts/seed-missions.js')
  run('node scripts/seed-mission_dependencies.js')
  run('node scripts/seed-blocks.js')
  run('node scripts/seed-communes.js')
  run('node scripts/seed-scenario_communes.js')
  run('node scripts/seed-users_players_progress.js')

  const db = new Database(DB_PATH)

  if (args.has('--publish')) {
    const info = db.prepare('UPDATE scenarios SET is_published=1 WHERE _id_scenario IN (SELECT _id_scenario FROM scenarios ORDER BY _id_scenario LIMIT 5) AND is_published=0').run()
    console.log(`Published scenarios: ${info.changes}`)
  }

  if (args.has('--scores')) {
    const players = db.prepare('SELECT _id_user FROM players').all()
    const upScore = db.prepare('UPDATE players SET score=?, xp=?, level=? WHERE _id_user=?')
    let updated = 0
    for (const p of players) {
      // deterministic pseudo-random based on id
      const base = p._id_user * 9301 % 500
      const score = 300 + base * 7
      const xp = (score % 1500) + 50
      const level = 1 + Math.floor(xp / 250)
      const res = upScore.run(score, xp, level, p._id_user)
      updated += res.changes || 0
    }
    console.log(`Updated player scores/xp/level: ${updated}`)
  }

  if (args.has('--media')) {
    const missionWithoutImg = db.prepare(`SELECT m._id_mission FROM missions m WHERE NOT EXISTS (SELECT 1 FROM blocks b WHERE b.owner_type='mission' AND b._id_mission=m._id_mission AND b.type_block='image') LIMIT 10`).all()
    const insertBlock = db.prepare(`INSERT INTO blocks (owner_type,_id_mission,position_block,type_block,content_text,url_media,caption) VALUES ('mission',?, 99,'image',NULL,?,?)`)
    let added = 0
    for (const m of missionWithoutImg) {
      const url = `https://picsum.photos/seed/mission${m._id_mission}/600/400`
      const cap = 'Illustration'
      const res = insertBlock.run(m._id_mission, url, cap)
      added += res.changes || 0
    }
    console.log(`Image blocks added: ${added}`)
  }

  db.close()
  console.log('Seed orchestration complete ✅')
  process.exit(0)
} catch (e) {
  console.error('Orchestrator failed:', e.message)
  process.exit(1)
}
