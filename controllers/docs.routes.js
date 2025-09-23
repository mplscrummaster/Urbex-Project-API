import { Router } from "express";

const router = Router();

const routes = [
  // health
  { method: "GET", path: "/health" },
  // auth & users
  { method: "GET", path: "/api/users" },
  { method: "GET", path: "/api/users/:id" },
  { method: "POST", path: "/api/login" },
  { method: "POST", path: "/api/register" },
  { method: "GET", path: "/api/me" },
  // scenarios
  { method: "GET", path: "/api/scenarios" },
  { method: "GET", path: "/api/scenarios/:id" },
  { method: "GET", path: "/api/scenarios/:id/full" },
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
];

router.get("/", (_req, res) => {
  return res.status(200).json({ routes });
});

router.get("/docs", (_req, res) => {
  return res.status(200).json({ routes });
});

export default router;
