import dotenv from "dotenv";
dotenv.config();

function number(val, fallback) {
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
}

export const NODE_ENV = process.env.NODE_ENV || "development";
export const PORT = number(process.env.PORT, 3000);
export const DB_PATH = process.env.DB_PATH || "db/bdd.db";
export const DB_VERBOSE = !!process.env.DB_VERBOSE;
export const JWT_SECRET = process.env.JWT_SECRET || "dev-secret"; // DO NOT use in prod
export const BCRYPT_SALT_ROUNDS = number(process.env.BCRYPT_SALT_ROUNDS, 10);

export default {
  NODE_ENV,
  PORT,
  DB_PATH,
  DB_VERBOSE,
  JWT_SECRET,
  BCRYPT_SALT_ROUNDS,
};
