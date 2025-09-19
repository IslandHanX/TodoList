// backend/src/db.js
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 优先使用环境变量（容器里指向 /data/todos.db，可写）
const DB_PATH =
  process.env.SQLITE_PATH || path.join(__dirname, "..", "todos.db");
const schemaFile = path.join(__dirname, "schema.sql");

// 若目录不存在则创建（如 /data）
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);

const schema = fs.readFileSync(schemaFile, "utf-8");
db.exec(schema);

export default db;
