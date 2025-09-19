# Todo Check - Todo Management Application

A modern todo management application with multiple view modes (list, calendar, board) and complete CRUD operations.

## Project Overview

Todo Check is a full-stack todo management application with a separated frontend and backend architecture:
- **Backend**: Node.js + Express + SQLite
- **Frontend**: React + Vite
- **Deployment**: Docker + Docker Compose
# My Todo List

A tiny full-stack todo app:

- **Frontend:** React + Vite, custom UI (light/dark), voice input (Web Speech API), calendar view, kanban view.  
- **Backend:** Express + better-sqlite3 (SQLite), simple REST API with validation & structured errors.

---

## 1) How to install & run

### Option A — Run locally (recommended for development)

```bash
# 1) Backend
cd backend
npm i
npm run dev            # starts http://localhost:4000

# 2) Frontend
cd ../frontend
cp .env.example .env   # if you have an example file; otherwise create .env (see below)
# Make sure .env contains: VITE_API_BASE=http://localhost:4000
npm i
npm run dev            # opens http://localhost:5173
```

**Frontend env (.env)**
```
VITE_API_BASE=http://localhost:4000
```

Open the frontend at the URL Vite prints (usually http://localhost:5173).  
The app will call the API at `http://localhost:4000`.

### Option B — Run with Docker Compose (for a local “prod-like” run)

```bash
# from repo root
docker compose up -d

# View logs
docker compose logs -f api
docker compose logs -f web
```

- **Frontend (nginx):** http://localhost:8080  
- **API:** http://localhost:4000

> Note: In Docker mode the frontend is a static production build served by nginx.  
> Ensure `frontend/.env` had `VITE_API_BASE=http://localhost:4000` **before** building the image.

---

## 2) How to run the tests

Simple API tests live in `backend/tests/`.

```bash
cd backend
npm i
npm test
# or
node tests/run.js
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
  docker compose logs -f api
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

## Features

- ✅ Create, edit, and delete todos
- 🔍 Search by title, filter by status and priority
- 📅 Calendar view - view todos by date
- 📋 Board view - group todos by status
- 🎨 Dark/light theme toggle
- 📱 Responsive design
- 🚀 Real-time data synchronization

## Tech Stack

### Backend
- **Node.js** (ES Modules)
- **Express.js** - Web framework
- **better-sqlite3** - SQLite database
- **CORS** - Cross-origin support

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool
- **React Icons** - Icon library
- **CSS Modules** - Style management

### Development Tools
- **Docker** - Containerization
- **Jest** - Testing framework
- **ESLint** - Code linting
- **Nodemon** - Development hot reload

## Installation and Running

### Method 1: Docker Compose (Recommended)

1. **Clone the project**
```bash
git clone <repository-url>
cd Todo_Check
```

2. **Start services**
```bash
docker-compose up --build
```

3. **Access the application**
- Frontend: http://localhost:8080
- Backend API: http://localhost:4000

### Method 2: Local Development

#### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

Backend will start at http://localhost:4000

#### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

Frontend will start at http://localhost:5173

## Running Tests

### Backend API Tests

Ensure the backend service is running, then execute:

```bash
cd backend
npm test
```

Tests will verify all API endpoints functionality, including:
- Creating todos
- Getting todo lists
- Updating todos
- Deleting todos
- Search and filter functionality
- Error handling

### Frontend Tests

```bash
cd frontend
npm run lint
```

## API Endpoints Documentation

### Basic Information
- **Base URL**: `http://localhost:4000`
- **Content-Type**: `application/json`

### Endpoint List

#### 1. Health Check
```http
GET /
```
**Response**: `{ "ok": true, "service": "sticker-todo-api" }`

#### 2. Create Todo
```http
POST /todos
```
**Request Body**:
```json
{
  "title": "Learn React",
  "priority": "high",
  "completed": false
}
```
**Response** (201):
```json
{
  "id": 1,
  "title": "Learn React",
  "completed": false,
  "priority": "high",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

#### 3. Get Todo List
```http
GET /todos?q=search_term&status=all&priority=high
```
**Query Parameters**:
- `q`: Search keyword (optional)
- `status`: Status filter - `all`|`completed`|`pending` (default: `all`)
- `priority`: Priority filter - `low`|`medium`|`high` (optional)

**Response** (200):
```json
[
  {
    "id": 1,
    "title": "Learn React",
    "completed": false,
    "priority": "high",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

#### 4. Get Single Todo
```http
GET /todos/:id
```
**Response** (200): Single todo object
**Error** (404): `{ "error": { "message": "Todo not found" } }`

#### 5. Update Todo
```http
PUT /todos/:id
```
**Request Body**:
```json
{
  "title": "Updated title",
  "completed": true,
  "priority": "medium"
}
```
**Response** (200): Updated todo object

#### 6. Delete Todo
```http
DELETE /todos/:id
```
**Response** (204): No content

### Error Response Format

All error responses follow a unified format:
```json
{
  "error": {
    "message": "Error description",
    "field": "field_name" // Optional, for field validation errors
  }
}
```

### Status Code Reference

- `200` - Success
- `201` - Created successfully
- `204` - Deleted successfully
- `400` - Bad request (invalid parameters)
- `404` - Resource not found
- `500` - Internal server error

## Data Model

### Todo Object Structure
```typescript
interface Todo {
  id: number;           // Auto-increment primary key
  title: string;        // Title (required, max 200 characters)
  completed: boolean;   // Completion status
  priority: string;     // Priority: 'low' | 'medium' | 'high'
  createdAt: string;    // Creation time (ISO 8601 format)
}
```

### Database Schema
```sql
CREATE TABLE todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  completed INTEGER NOT NULL DEFAULT 0,
  priority TEXT NOT NULL DEFAULT 'low',
  createdAt TEXT NOT NULL
);
```

## Project Structure

```
Todo_Check/
├── backend/                 # Backend service
│   ├── src/
│   │   ├── index.js        # Server entry point
│   │   ├── db.js           # Database connection
│   │   ├── routes/
│   │   │   └── todos.js    # API routes
│   │   └── schema.sql      # Database schema
│   ├── tests/
│   │   └── todos.test.mjs  # API tests
│   └── package.json
├── frontend/               # Frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API services
│   │   ├── utils/          # Utility functions
│   │   └── lib/            # Library files
│   └── package.json
└── docker-compose.yml      # Docker orchestration
```

## Design Decisions and Assumptions

### Technology Choices
1. **SQLite**: Chosen over PostgreSQL/MySQL because this is a single-user application, SQLite is lightweight and requires no additional configuration
2. **better-sqlite3**: Better performance and more modern API compared to sqlite3
3. **React 19**: Using the latest version for optimal performance and development experience
4. **Vite**: Faster build times and better development experience compared to Create React App

### Architecture Decisions
1. **Frontend/Backend Separation**: Enables independent development and deployment
2. **RESTful API**: Follows REST principles with clear API design
3. **Unified Error Handling**: All API errors return a consistent format
4. **Optimistic Updates**: Frontend updates UI before API calls to improve user experience

### Feature Design
1. **Multiple View Modes**: Accommodates different user preferences
2. **Real-time Search**: Instant filtering as you type, no search button needed
3. **Theme Toggle**: Supports dark/light mode
4. **Responsive Design**: Adapts to different screen sizes

## Known Limitations and Issues

### Current Limitations
1. **Single-user Application**: No user authentication system, all data is shared
2. **Local Storage**: Data stored in local SQLite file, no cloud synchronization
3. **No Offline Support**: Requires network connection to use
4. **No Data Backup**: No automatic backup mechanism

### Potential Issues
1. **Concurrent Writes**: SQLite may experience lock waits with high concurrent writes
2. **Data Migration**: No database version management and migration mechanism
3. **Error Recovery**: Some network errors may require manual page refresh
4. **Performance**: List rendering may be slow with large amounts of data (virtual scrolling not implemented)

### Improvement Suggestions
1. Add user authentication and permission management
2. Implement data export/import functionality
3. Add data backup and recovery mechanisms
4. Optimize rendering performance for large datasets
5. Add unit tests and integration tests
6. Implement PWA support for offline functionality

## Development Guide

### Adding New Features
1. Backend: Add new routes in `backend/src/routes/todos.js`
2. Frontend: Add API calls in `frontend/src/services/todos.js`
3. Tests: Add test cases in `backend/tests/todos.test.mjs`

### Code Standards
- Use ESLint for code linting
- Follow existing code style
- Add appropriate comments and documentation

### Deployment
- Use Docker Compose for production deployment
- Ensure environment variables are properly configured
- Regularly backup database files

## License

ISC License

## Contributing

Issues and Pull Requests are welcome to improve this project!