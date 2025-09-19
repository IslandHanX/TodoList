// backend/src/index.js
import express from "express";
import cors from "cors";
import todos from "./routes/todos.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/", (_req, res) => {
  res.json({ ok: true, service: "sticker-todo-api" });
});

app.use("/todos", todos);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`API listening on http://localhost:${PORT}`)
);

export default app;
