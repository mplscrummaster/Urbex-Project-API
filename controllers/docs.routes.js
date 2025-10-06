import { Router } from "express";

const router = Router();

export const routes = [
  // health
  { method: "GET", path: "/health" },
  // auth & users
  // users (admin-only list)
  { method: "GET", path: "/api/users" },
  { method: "GET", path: "/api/users/:id" },
  { method: "POST", path: "/api/login" },
  { method: "POST", path: "/api/register" },
  { method: "GET", path: "/api/me" },
  // scenarios
  { method: "GET", path: "/api/scenarios" },
  { method: "GET", path: "/api/scenarios/:id" },
  { method: "GET", path: "/api/scenarios/:id/full" },
  // scenario -> communes aggregated pins (map dataset) (supports ?published=1)
  { method: "GET", path: "/api/scenarios/communes" },
  { method: "POST", path: "/api/scenarios" },
  { method: "PUT", path: "/api/scenarios/:id" },
  { method: "DELETE", path: "/api/scenarios/:id" },
  // missions
  { method: "GET", path: "/api/scenarios/:id/missions" },
  { method: "GET", path: "/api/missions/:id" },
  { method: "POST", path: "/api/scenarios/:id/missions" },
  { method: "PUT", path: "/api/missions/:id" },
  { method: "DELETE", path: "/api/missions/:id" },
  { method: "PUT", path: "/api/scenarios/:id/missions/reorder" },
  // blocks
  { method: "GET", path: "/api/scenarios/:id/intro" },
  { method: "GET", path: "/api/scenarios/:id/outro" },
  { method: "GET", path: "/api/missions/:id/blocks" },
  { method: "POST", path: "/api/scenarios/:id/intro/blocks" },
  { method: "POST", path: "/api/scenarios/:id/outro/blocks" },
  { method: "POST", path: "/api/missions/:id/blocks" },
  { method: "PUT", path: "/api/blocks/:id" },
  { method: "DELETE", path: "/api/blocks/:id" },
  { method: "PUT", path: "/api/scenarios/:id/intro/blocks/reorder" },
  { method: "PUT", path: "/api/scenarios/:id/outro/blocks/reorder" },
  { method: "PUT", path: "/api/missions/:id/blocks/reorder" },
  // progress & bookmarks
  { method: "POST", path: "/api/scenarios/:id/start" },
  { method: "POST", path: "/api/scenarios/:id/bookmark" },
  { method: "DELETE", path: "/api/scenarios/:id/bookmark" },
  { method: "GET", path: "/api/scenarios/:id/progress" },
  { method: "POST", path: "/api/missions/:id/complete" },
  { method: "GET", path: "/api/me/scenarios" },
  // mission prerequisites
  { method: "PUT", path: "/api/missions/:id/prerequisites" },
  { method: "GET", path: "/api/missions/:id/prerequisites" },
  // players
  { method: "GET", path: "/api/me/player" },
  { method: "PUT", path: "/api/me/player" },
  { method: "GET", path: "/api/players" },
  { method: "GET", path: "/api/players/:id" },
  // communes (read-only)
  { method: "GET", path: "/api/communes" },
  { method: "GET", path: "/api/communes/:id" },
  { method: "GET", path: "/api/scenarios/:id/communes" },
  { method: "POST", path: "/api/scenarios/:id/communes" },
  // admin
  // removed: /api/admin/users (now /api/users is admin-only)
  { method: "PUT", path: "/api/users/:id/role" },
];

router.get("/", (_req, res) => {
  return res.status(200).json({ routes });
});

router.get("/docs", (_req, res) => {
  return res.status(200).json({ routes });
});

export default router;
