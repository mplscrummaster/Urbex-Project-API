import sqlite3 from "sqlite3";
import { Connect_DB } from "../connectDB.js";
const endpoint = "api/";

const ROUTES_GET = [
  { "/api/users": "get all users" },
  {
    "/api/login": {
      mail_user: "test@gmail.com",
      password_user: "test",
    },
  },
  // "/users/:id_user/programs",
  // "/users/:id_user/programs/:id_program/seasons/:id_season/weeks/:id_week/sessions/:id_session/exercises",
];

const ROUTES_POST = [
  {
    "/api/register/": {
      username_user: "test",
      password_user: "test",
      mail_user: "test@gmail.com",
      firstname_user: "test",
      name_user: "test",
      url_img_user: null,
    },
  },
];

const ROUTES_DELETE = [""];

const connectDB = new Connect_DB().instance;
const express = connectDB.getExpress();

//==============================
// BDD
//==============================

const db = new sqlite3.Database(`bdd.db`, (err) => {
  if (err) console.error("Erreur de connexion à la BDD");
  else console.log("Connecté à la BDD");
});

//-------------------------------
//fin BDD
//-------------------------------

//------------------------------
//fin doc
//------------------------------

//========================================================================
// Routes GET
//========================================================================
//...
//Users
//...
/**
 * Select de tous les users
 */
express.get("/users", (req, res) => {
  console.log("inside users route");
  db.all(`SELECT * FROM users `, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
// /**
//  * Select d'un user via son id
//  */
// express.get("/users/:_id_user", (req, res) => {
//   const { _id_user } = req.params;
//   console.log("inside userid route");

//   db.all(`SELECT * FROM users WHERE _id_user = ?`, [_id_user], (err, rows) => {
//     if (err) return res.status(500).json({ error: err.message });
//     res.json(rows);
//   });
// });

/**
 * login avec username et password
 */
express.post("/login", (req, res) => {
  const { username_user: mail_user, password_user } = req.body;
  console.log("inside login route");

  db.all(
    `SELECT * FROM users WHERE mail_user = ? AND password
	_user = ?`,
    [mail_user, password_user],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });

      if (row.length === 0) res.status(401).json("bad login or password");
      else res.status(200).json(row);
    }
  );
});
//========================================================================
// Routes CREATE
//========================================================================

//Ajouter un user
express.post(`/register`, (req, res) => {
  console.log("inside register route");
  const keys = Object.keys(req.body);
  // console.log("keys", keys);
  const values = Object.values(req.body);
  // console.log("values", values);
  // console.log(
  // 	'keys.map(() => "?").join(",")',
  // 	keys.map(() => "?")
  // );
  db.run(
    `INSERT INTO users (${keys.join(",")}) 
		VALUES (${keys.map(() => "?").join(",")})`,
    values,
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, ...req.body });
    }
  );
});
//========================================================================
// Routes UPDATE/PUT
//========================================================================

//========================================================================
// Routes DELETE
//========================================================================

// express.delete("/formations/:id", (req, res) => {
//   const id = req.params.id;
//   db.run(`DELETE FROM formations WHERE id_formation = ${id}`, function (err) {
//     if (err) return res.status(500).json({ error: err.message });
//     res.status(200).json({ deleted: this.changes });
//   });
// });

//---------------------------
// FIN Routes DELETE
//---------------------------
/**
 * Documentation de l'api
 */
express.get(`/`, (req, res) => {
  const tmpDoc = {
    ROUTES_GET,
    ROUTES_POST,
    ROUTES_DELETE,
  };
  return res.status(200).json(tmpDoc);
});
export default express;
