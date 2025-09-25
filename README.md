# Urbex Project API

Small Express + better-sqlite3 API with users and scenarios.

## Structure

- `launch.js`: App entrypoint (Express, CORS, routes, health)
- `controllers/`
  - `users.routes.js`: `/api/users`, `/api/users/:id`, `/api/login`, `/api/register`
  - `scenarios.routes.js`: `/api/scenarios`, `/api/scenarios/:id`
- `db/`
  - `index.js`: shared better-sqlite3 connection
  - `bdd.db`: SQLite file (ignored in git)
  - `schema.sql`: current schema reference (doc/source of truth)
- `scripts/`
  - `seed-scenarios.js`: simple seed to add 3 scenarios

## Install & Run

```bash
npm i
npm start
```

## Seed

```bash
npm run db:seed:scenarios
```

## Env

- `DB_PATH` (default `db/bdd.db`)
- `DB_VERBOSE` (any truthy value to log SQL)

## Notes

- SQL scripts: `db/schema.sql` mirrors the current minimal schema for reference and future rebuilds. Keep it updated; you can add more seed scripts as needed.
