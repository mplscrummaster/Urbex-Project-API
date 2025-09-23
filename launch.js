import express from "express";
import cors from "cors";

import userController from "./controllers/usersController.js";
// import sportsController from "./API/sportsController.js";

//==============================
// server
//==============================
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// Healthcheck simple
app.get("/health", (_req, res) => res.json({ ok: true }));

// app.use("/sports_EP", sportsController);
app.use("/api/", userController);

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
