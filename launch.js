import express from "express";
import cors from "cors";

import usersRoutes from "./controllers/users.routes.js";
import scenariosRoutes from "./controllers/scenarios.routes.js";

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/", usersRoutes);
app.use("/api/", scenariosRoutes);

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
