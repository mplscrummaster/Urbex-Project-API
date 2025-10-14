# Urbex Project API

Express + better-sqlite3 API (ESM) powering scenarios, missions, users & progress.

## Structure (simplified)

- `launch.js` – Express bootstrap (routes, middleware, error handling)
- `controllers/` – Route modules (users, scenarios, communes, etc.)
- `db/`
  - `schema.sql` – Canonical schema (keep in sync with migrations/changes)
  - `bdd.db` – Runtime SQLite database (ignored)
  - `index.js` – Shared better-sqlite3 connection
- `middleware/` – Auth & RBAC utilities
- `scripts/`
  - `db-reset.js` – Drops & recreates schema from `schema.sql`
  - `seed.js` – Unified seeding pipeline (replaces former many `seed-*` scripts)
  - `seed-communes.js` – Heavy canonical communes dataset (only run once or with flag)

Legacy individual `seed-*.js` files have been removed and merged into `seed.js` to reduce clutter.

## Install & Run

```bash
npm i
npm start
```

Server starts on the port defined in env (check `launch.js`).

## Seeding Workflow

We now use ONE orchestrated script: `scripts/seed.js`.

### Common commands

| Action                                  | Command                |
| --------------------------------------- | ---------------------- |
| Reset DB (schema only)                  | `npm run db:reset`     |
| Seed (incremental/idempotent)           | `npm run seed`         |
| Fresh full seed incl. communes & extras | `npm run seed:fresh`   |
| Publish first 5 scenarios               | `npm run seed:publish` |
| Full extras (publish + scores + media)  | `npm run seed:all`     |

### Flags (can be combined)

`node scripts/seed.js [--with-communes] [--publish[=N]] [--scores] [--media] [--verbose]`

- `--with-communes` – Also seed communes (only needed the first time unless you reset)
- `--publish[=N]` – Publish first N scenarios (default 5)
- `--scores` – Deterministic score/xp/level assignment for players
- `--media` – Add placeholder image blocks to up to 10 missions missing one
- `--verbose` – Detailed step logging

### What the unified seed does

1. (Optional) Communes dataset (if `--with-communes` and table empty)
2. Ensures canonical scenario titles exist
3. Ensures each scenario has 3–7 missions with unique (globally de‑duplicated) titles/riddles
4. Inserts deterministic mission dependency links (OR IGNORE)
5. Guarantees intro/outro & at least one mission text block per mission
6. Replaces `scenario_communes` with canonical link set (incl. Fleurus cluster)
7. Ensures admin + scenarists + players + progress/bookmarks
8. Optional enhancements (publish, scores, media)

All steps are idempotent: re-running won’t duplicate content; missing pieces are added.

## Environment Variables

| Var          | Default     | Description                    |
| ------------ | ----------- | ------------------------------ |
| `DB_PATH`    | `db/bdd.db` | SQLite file path               |
| `DB_VERBOSE` | (unset)     | If truthy, logs SQL statements |
| `PORT`       | `3000`      | API port (see `launch.js`)     |

## Development Notes

- Keep `schema.sql` authoritative; modify tables there and run `npm run db:reset` then `npm run seed:fresh`.
- Seeding avoids random for test determinism (uses simple deterministic math + incremental uniqueness suffixes).
- To add a new canonical scenario title: edit the `SCENARIO_TITLES` array in `scripts/seed.js`.
- To add or adjust scenario↔commune mapping: edit `SCENARIO_COMMUNE_LINKS` inside `scripts/seed.js`.

## Minimal Health Check

`GET /api/health` (if implemented) or root path can be used to verify the server is up.

## License / Usage

Internal educational/demo project. Adapt freely inside your team context.
