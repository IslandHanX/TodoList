// backend/src/db.js
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// resolve current file and directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// database file path (env var takes precedence; falls back to project-local file)
const DB_PATH =
  process.env.SQLITE_PATH || path.join(__dirname, "..", "todos.db");

// SQL schema file that defines tables/indexes
const schemaFile = path.join(__dirname, "schema.sql");

// ensure the folder for the DB file exists (safe if it already exists)
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

// open or create the SQLite database (synchronous, file-backed)
const db = new Database(DB_PATH);

// bootstrap schema on startup (idempotent if schema uses IF NOT EXISTS)
const schema = fs.readFileSync(schemaFile, "utf-8");
db.exec(schema);

// export a shared DB connection for the rest of the app
export default db;
