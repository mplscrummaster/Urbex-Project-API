import dotenv from "dotenv";
dotenv.config(); // no-op if .env absent

// Minimal helper
const toNumber = (v, fallback) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

export const NODE_ENV = process.env.NODE_ENV || "development";
export const PORT = toNumber(process.env.PORT, 3000);
export const DB_PATH = process.env.DB_PATH || "db/bdd.db";
export const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
export const BCRYPT_SALT_ROUNDS = toNumber(process.env.BCRYPT_SALT_ROUNDS, 10);

// Fail fast in non-dev if secret not overridden
if (NODE_ENV !== "development" && JWT_SECRET === "dev-secret") {
  throw new Error(
    "Insecure JWT_SECRET. Set a strong JWT_SECRET in the environment."
  );
}

// No default export to avoid duplicate namespace patterns elsewhere
