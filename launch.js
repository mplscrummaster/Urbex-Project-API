import express from "express";
import cors from "cors";
import compression from "compression";

import usersRoutes from "./controllers/users.routes.js";
import scenariosRoutes from "./controllers/scenarios.routes.js";
import missionsRoutes from "./controllers/missions.routes.js";
import blocksRoutes from "./controllers/blocks.routes.js";
import docsRoutes, {
  routes as documentedRoutes,
} from "./controllers/docs.routes.js";
import playersRoutes from "./controllers/players.routes.js";
import communesRoutes from "./controllers/communes.routes.js";
import progressRoutes from "./controllers/progress.routes.js";
import missionDependenciesRoutes from "./controllers/missionDependencies.routes.js";
import { PORT } from "./config/index.js";

const app = express();
// Response compression (gzip) for faster GeoJSON / JSON transfer
app.use(compression({ threshold: 1024 }));
const START_TIME = new Date().toISOString();
const BUILD_INFO = { started_at: START_TIME };
app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// Health (unique)
app.get("/health", (_req, res) => res.json({ ok: true, ...BUILD_INFO }));

app.use("/api/", usersRoutes);
app.use("/api/", scenariosRoutes);
app.use("/api/", missionsRoutes);
app.use("/api/", blocksRoutes);
app.use("/api/", docsRoutes);
app.use("/api/", playersRoutes);
app.use("/api/", communesRoutes);
app.use("/api/", progressRoutes);
app.use("/api/", missionDependenciesRoutes);

// Root: show API documentation summary instead of login form (frontend not served here)
app.get("/", (_req, res) => {
  res.status(200).json({ name: "Urbex API", routes: documentedRoutes });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
