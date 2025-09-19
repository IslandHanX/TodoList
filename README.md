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
{
  "error": {
    "message": "Human readable message",
    "field": "optional_field_name"
  }
}
```

### `GET /todos`

List todos with optional filters.

**Query params**

- `q` _(string)_ – fuzzy search in title (max 200 chars, trimmed)
- `status` _(string)_ – one of `all|completed|pending` (default `all`)
- `priority` _(string)_ – one of `low|medium|high` (optional)

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
  "completed": false, // optional, default false
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
  tests/
    todos.test.mjs      # API test suite
  package.json
  Dockerfile

/frontend
  src/
    components/         # React components
      Header.jsx        # App header with theme/view toggles
      Composer.jsx      # Todo creation form with voice input
      Toolbar.jsx       # Search and filter controls
      TodoGrid.jsx      # List view component
      BoardView.jsx     # Kanban board view
      MiniCalendar.jsx  # Calendar navigation
      DailyList.jsx     # Daily todo list
      Modal.jsx         # Error/success modals
      Select.jsx        # Custom dropdown component
      Sticker.jsx       # Individual todo item
      *.module.css      # Component-specific styles
    hooks/
      useTheme.js       # Dark/light theme management
      useTodos.js       # Todo CRUD operations
    services/
      todos.js          # API service layer
    utils/
      orderTodos.js     # Todo sorting utilities
    lib/
      apiClient.js      # HTTP client with error handling
    App.jsx             # Main app component
    main.jsx            # React app entry point
    index.css           # Global styles and CSS variables
  package.json
  .env                  # VITE_API_BASE=http://localhost:4000
  Dockerfile            # Builds static site and serves via nginx

docker-compose.yml      # Orchestration for api + web
```

---

## 5) Assumptions & decisions

- **Architecture refactor** The app started as a single App.jsx for speed, then was factored into components/hooks/services as it grew to keep the codebase maintainable.
- **Filter consistency** After editing a sticker that’s part of a filtered result, the application re-apply the current filters immediately (real-time “onApply”) so the item appears/disappears correctly without a manual re-search.
- **Edit field UX** Sticker editing uses a multiline <textarea> (replacing a cramped single-line input) to handle longer titles comfortably.
- **SQLite for simplicity.** Single-user / small data set is expected. `better-sqlite3` is synchronous and fast for this use case.
- **Simple server-side logging.** The API prints 4xx/5xx to the terminal:
  - 400/404 via `console.warn`
  - 500 via `console.error` (with stack)
  - Empty search results log an info line (does **not** error).
- **Structured error shape** `{ error: { message, field? } }` to let the UI highlight the offending field.
- **Title length** capped at 200 chars to keep UI sane and DB efficient.
- **Frontend build-time API base.** `VITE_API_BASE` is baked at build time. For Docker, set it before building the image.
- **Voice input** uses the browser **Web Speech API** (Chrome-family). It’s optional. The mic button is disabled if the browser doesn’t expose `SpeechRecognition` (Chrome/Edge typically do).
- **SQLite persistence in Docker.** In the setup of developing, the DB file lived inside the API container image (under `/app/backend/todos.db`). Rebuilding the image can reset data. For the persistence across rebuilds, mount a volume and point the DB path there (./data:/data).
- **Board View Layout** On small screens, cards can only be dragged vertically. This is intentional. For a real mobile app, we’d explore touch gestures to move items between “Todo” and “Done.”

---

## 6) Limitations / known issues

- **Refresh resets view** It always returns to the default List view. One can persist the selected view (list/calendar/board) to localStorage (or the URL hash/query) and restore it on app init so a refresh keeps the current view.
- **No deadline field** There’s no deadline/due date, so the Calendar view groups and orders tasks by creation time only.
- **No auth / multi-user separation.** It’s a demo app; all data is global.
- **Validation is minimal.** Only title & priority are validated; no rate limiting, etc.
- **Voice input availability.** Web Speech API support varies by browser/OS and language.
- **CORS:** Currently open to all origins (`app.use(cors())`) for local/dev. Configure allowed origins for production.

---

## 7) Troubleshooting

- **Frontend can’t reach API:** Ensure `frontend/.env` has `VITE_API_BASE=http://localhost:4000` _before_ `npm run build` / Docker build.
- **500 with SQLite** (“readonly database”): if you move to a mounted volume, ensure the container user owns the DB file and directory (`chown -R app:app /data` and open with write perms).
- **See server logs:**
  ```bash
  # dev
  cd backend && npm run dev
  ```

# docker

docker-compose logs -f api

````

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
````

---

If anything doesn’t work as written, please open an issue or ping me—happy to fix the docs so the steps are guaranteed reproducible.
