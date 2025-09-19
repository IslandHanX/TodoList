# 📒 My Todo List

A tiny full-stack todo app:

- **Frontend:** React + Vite, custom UI (light/dark), voice input (Web Speech API), list view, calendar view, board view.  
- **Backend:** Express + better-sqlite3 (SQLite), REST API with validation & structured errors.

---

## 1) How to install & run

### Option A — Run with Docker Compose (for a local “prod-like” run)

```bash
# from repo root
docker-compose up -d

# View logs
docker-compose logs -f api
docker-compose logs -f web
```

- **Frontend (nginx):** http://localhost:8080  
- **API:** http://localhost:4000

> Note: In Docker mode the frontend is a static production build served by nginx.  
> Ensure `frontend/.env` had `VITE_API_BASE=http://localhost:4000` **before** building the image.

### Option B — Run locally

```bash
# 1) Backend
cd backend
npm i
npm run dev            # starts http://localhost:4000

# 2) Frontend
cd ../frontend
# Create .env file with: VITE_API_BASE=http://localhost:4000
npm i
npm run dev            # opens http://localhost:5173
```

**Frontend env (.env)**
```
VITE_API_BASE=http://localhost:4000
```

Open the frontend at the URL Vite prints (usually http://localhost:5173).  
The app will call the API at `http://localhost:4000`.

---

## 2) How to run the tests

Simple API tests live in `backend/tests/`.

```bash
cd backend
npm i
npm test
# or
node tests/todos.test.mjs
```

These tests cover:

- Creating a todo successfully
- Fetching a non-existent todo (404)
- Creating a todo without a title (400)
- Listing + filtering todos (status/priority/query)
- Updating + deleting a todo

---

## 3) API reference

Base URL: `http://localhost:4000`

All responses are JSON. Errors are **structured** like:
```json
{ "error": { "message": "Human readable message", "field": "optional_field_name" } }
```

### `GET /todos`
List todos with optional filters.

**Query params**
- `q` *(string)* – fuzzy search in title (max 200 chars, trimmed)
- `status` *(string)* – one of `all|completed|pending` (default `all`)
- `priority` *(string)* – one of `low|medium|high` (optional)

**Example**
```
GET /todos?q=milk&status=pending&priority=high
200 OK
[
  {
    "id": 42,
    "title": "Buy milk",
    "completed": false,
    "priority": "high",
    "createdAt": "2025-09-19T11:43:22.000Z"
  }
]
```

### `POST /todos`
Create a todo.

**Body**
```json
{
  "title": "Buy milk",
  "completed": false,          // optional, default false
  "priority": "low|medium|high" // optional, default low
}
```

**Validation**
- `title` required, trimmed, **max 200 chars**
- `priority` must be one of `low|medium|high` (defaults to `low`)

**Success**
```
201 Created
{ "id": 43, "title": "Buy milk", "completed": false, "priority": "low", "createdAt": "2025-09-19T11:43:22.000Z" }
```

**Error (examples)**
```
400 Bad Request
{ "error": { "message": "Title is required", "field": "title" } }

400 Bad Request
{ "error": { "message": "Invalid priority", "field": "priority" } }
```

### `GET /todos/:id`
Fetch a single todo.

```
GET /todos/99999
404 Not Found
{ "error": { "message": "Todo not found" } }
```

### `PUT /todos/:id`
Update fields on a todo.

**Body** (partial allowed; all fields validated)
```json
{ "title": "New title", "completed": true, "priority": "medium" }
```

**Success**
```
200 OK
{ "id": 43, "title": "New title", "completed": true, "priority": "medium", "createdAt": "..." }
```

**Typical errors**
```
404 Not Found
{ "error": { "message": "Todo not found" } }

400 Bad Request
{ "error": { "message": "Title is too long (max 200)", "field": "title" } }
```

### `DELETE /todos/:id`
Delete a todo.

```
204 No Content
```

**Errors**
```
404 Not Found
{ "error": { "message": "Todo not found" } }
```

---

## 4) Project structure

```
/backend
  src/
    index.js            # Express app bootstrap (CORS, JSON, routes)
    db.js               # better-sqlite3 connection + schema init
    routes/
      todos.js          # All /todos endpoints, validation, logging
    schema.sql          # Table DDL
  tests/                # Minimal API tests
  Dockerfile

/frontend
  src/                  # React app
  .env                  # VITE_API_BASE=http://localhost:4000
  Dockerfile            # Builds static site and serves via nginx

docker-compose.yml      # Orchestration for api + web
```

---

## 5) Assumptions & decisions

- **SQLite for simplicity.** Single-user / small data set is expected. `better-sqlite3` is synchronous and fast for this use case.
- **Simple server-side logging.** The API prints 4xx/5xx to the terminal:
  - 400/404 via `console.warn`
  - 500 via `console.error` (with stack)
  - Empty search results log an info line (does **not** error).
- **Structured error shape** `{ error: { message, field? } }` to let the UI highlight the offending field.
- **Title length** capped at 200 chars to keep UI sane and DB efficient.
- **Frontend build-time API base.** `VITE_API_BASE` is baked at build time. For Docker, set it before building the image.
- **Voice input** uses the browser **Web Speech API** (Chrome-family). It’s optional; gracefully degrades when unsupported.

---

## 6) Limitations / known issues (being honest)

- **SQLite persistence in Docker.** In the current setup, the DB file lives inside the API container image (under `/app/backend/todos.db`). Rebuilding the image can reset data. If you need persistence across rebuilds, mount a volume and point the DB path there (or switch to a managed DB).
- **No auth / multi-user separation.** It’s a demo app; all data is global.
- **Validation is minimal.** Only title & priority are validated; no rate limiting, etc.
- **Voice input availability.** Web Speech API support varies by browser/OS and language.
- **CORS:** Backend currently allows `*` for simplicity. Lock this down in production.

---

## 7) Troubleshooting

- **Frontend can’t reach API:** Ensure `frontend/.env` has `VITE_API_BASE=http://localhost:4000` *before* `npm run build` / Docker build.  
- **500 with SQLite** (“readonly database”): if you move to a mounted volume, ensure the container user owns the DB file and directory (`chown -R app:app /data` and open with write perms).
- **See server logs:**
  ```bash
  # dev
  cd backend && npm run dev

# docker
docker-compose logs -f api
  ```

---

## 8) Useful curl examples

```bash
# List
curl http://localhost:4000/todos

# Create
curl -X POST http://localhost:4000/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy milk","priority":"high"}'

# Update
curl -X PUT http://localhost:4000/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'

# Delete
curl -X DELETE http://localhost:4000/todos/1
```

---

## 9) Scripts

**Backend**
- `npm run dev` – start API with hot-reload (nodemon)
- `npm start` – start API (production)
- `npm test` – run test suite

**Frontend**
- `npm run dev` – Vite dev server
- `npm run build` – production build
- `npm run preview` – preview build locally

---

If anything doesn’t work as written, please open an issue or ping me—happy to fix the docs so the steps are guaranteed reproducible.
