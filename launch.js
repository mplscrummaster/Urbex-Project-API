import express from "express";

import userController from "./controllers/usersController.js";
// import sportsController from "./API/sportsController.js";

//==============================
// server
//==============================
const app = express();
app.use(express.json());

// app.use("/sports_EP", sportsController);
app.use("/api/", userController);

const PORT = 80;
app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});
