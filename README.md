# My Todo List - Todo Management Application

A modern todo management application with multiple view modes (list, calendar, board) and complete CRUD operations.

## Project Overview

Todo Check is a full-stack todo management application with a separated frontend and backend architecture:
- **Backend**: Node.js + Express + SQLite
- **Frontend**: React + Vite
- **Deployment**: Docker + Docker Compose

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
