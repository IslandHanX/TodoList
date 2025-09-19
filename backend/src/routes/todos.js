// backend/src/routes/todos.js
import express from "express";
import db from "../db.js";

const router = express.Router();

// constants for allowed values
const PRIORITIES = new Set(["low", "medium", "high"]);
const STATUSES = new Set(["all", "completed", "pending"]);

// map a DB row to the public todo shape
const rowToTodo = (row) => ({
  id: row.id,
  title: row.title,
  completed: !!row.completed,
  priority: row.priority,
  createdAt: row.createdAt,
});

// basic log helpers
function logWarn(status, message, extra = {}) {
  console.warn(
    `[${new Date().toISOString()}] ${status} ${message}`,
    Object.keys(extra).length ? extra : ""
  );
}

// unified error response helpers
function sendError(res, code, message, field, meta = {}) {
  console.warn(`[todos] ${code}`, { message, field, ...meta });
  return res.status(code).json({ error: { message, field } });
}
function badRequest(res, message, field) {
  return sendError(res, 400, message, field);
}
function notFound(res, message = "Todo not found") {
  logWarn(404, message);
  return res.status(404).json({ error: { message } });
}
function internalError(req, res, err) {
  console.error(`[todos] 500 ${req.method} ${req.originalUrl}`, err);
  return res.status(500).json({ error: { message: "Internal server error" } });
}

// input validation + normalization
function validateTitle(title) {
  const s = String(title ?? "").trim();
  if (!s) return { ok: false, msg: "Title is required", value: "" };
  if (s.length > 200) return { ok: false, msg: "Title is too long (max 200)" };
  return { ok: true, value: s };
}
function normalizeCompleted(v) {
  if (v === true || v === 1 || v === "1" || v === "true") return 1;
  if (v === false || v === 0 || v === "0" || v === "false") return 0;
  return 0;
}
function validatePriority(p) {
  if (p == null || p === "") return { ok: true, value: "low" };
  const s = String(p);
  if (!PRIORITIES.has(s))
    return { ok: false, msg: "Invalid priority", value: "low" };
  return { ok: true, value: s };
}

// POST /todos - create a todo
router.post("/", (req, res) => {
  try {
    const { title, completed = false, priority = "low" } = req.body || {};

    const t = validateTitle(title);
    if (!t.ok) return badRequest(res, t.msg, "title");

    const p = validatePriority(priority);
    if (!p.ok) return badRequest(res, p.msg, "priority");

    const createdAt = new Date().toISOString();
    const stmt = db.prepare(
      "INSERT INTO todos (title, completed, priority, createdAt) VALUES (?, ?, ?, ?)"
    );
    const info = stmt.run(
      t.value,
      normalizeCompleted(completed),
      p.value,
      createdAt
    );

    const todo = db
      .prepare("SELECT * FROM todos WHERE id = ?")
      .get(info.lastInsertRowid);
    return res.status(201).json(rowToTodo(todo));
  } catch (err) {
    return internalError(req, res, err);
  }
});

// GET /todos - list todos with optional filters
router.get("/", (req, res) => {
  try {
    let { q = "", status = "all", priority = "" } = req.query || {};

    if (!STATUSES.has(String(status)))
      return badRequest(
        res,
        "Invalid status (all|completed|pending)",
        "status"
      );

    if (priority !== "") {
      const pv = String(priority);
      if (!PRIORITIES.has(pv))
        return badRequest(res, "Invalid priority", "priority");
    }

    q = String(q).slice(0, 200);

    let sql = "SELECT * FROM todos";
    const clauses = [];
    const params = [];

    if (q) {
      clauses.push("title LIKE ?");
      params.push(`%${q}%`);
    }
    if (status === "completed") clauses.push("completed = 1");
    if (status === "pending") clauses.push("completed = 0");
    if (priority) {
      clauses.push("priority = ?");
      params.push(priority);
    }

    if (clauses.length) sql += " WHERE " + clauses.join(" AND ");
    sql += " ORDER BY id DESC";

    const rows = db.prepare(sql).all(...params);

    // lightweight observability for empty result sets
    if (rows.length === 0) {
      console.info(`[${new Date().toISOString()}] 200 SEARCH_EMPTY`, {
        q,
        status,
        priority,
      });
    }
    return res.json(rows.map(rowToTodo));
  } catch (err) {
    return internalError(req, res, err);
  }
});

// GET /todos/:id - read a single todo
router.get("/:id", (req, res) => {
  try {
    const row = db
      .prepare("SELECT * FROM todos WHERE id = ?")
      .get(req.params.id);
    if (!row) return notFound(res);
    return res.json(rowToTodo(row));
  } catch (err) {
    return internalError(req, res, err);
  }
});

// PUT /todos/:id - update a todo
router.put("/:id", (req, res) => {
  try {
    const id = req.params.id;
    const existing = db.prepare("SELECT * FROM todos WHERE id = ?").get(id);
    if (!existing) return notFound(res);

    let {
      title = existing.title,
      completed = existing.completed,
      priority = existing.priority,
    } = req.body || {};

    const t = validateTitle(title);
    if (!t.ok) return badRequest(res, t.msg, "title");

    const p = validatePriority(priority);
    if (!p.ok) return badRequest(res, p.msg, "priority");

    db.prepare(
      "UPDATE todos SET title = ?, completed = ?, priority = ? WHERE id = ?"
    ).run(t.value, normalizeCompleted(completed), p.value, id);

    const updated = db.prepare("SELECT * FROM todos WHERE id = ?").get(id);
    return res.json(rowToTodo(updated));
  } catch (err) {
    return internalError(req, res, err);
  }
});

// DELETE /todos/:id - delete a todo
router.delete("/:id", (req, res) => {
  try {
    const info = db
      .prepare("DELETE FROM todos WHERE id = ?")
      .run(req.params.id);
    if (info.changes === 0) return notFound(res);
    return res.status(204).send();
  } catch (err) {
    return internalError(req, res, err);
  }
});

export default router;
