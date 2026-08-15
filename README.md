# Todo App

> **Organize your tasks. Get things done.**

A complete, small, full-stack web application that demonstrates practical software
engineering practices: a React frontend, a FastAPI REST API, a SQLite database with
SQLAlchemy, Pydantic validation, automated tests with coverage, Docker, and
GitHub Actions CI.

## Features

- Create, view, edit and delete tasks
- Mark tasks as completed and back to pending
- Search tasks by title and description
- Filter by status (Pending / Completed) and priority (Low / Medium / High)
- Live task statistics (total, pending, completed, high priority)
- Overdue task detection
- Form validation with user-friendly error messages
- Notifications for every action and API error
- Delete confirmation dialog
- Loading and empty states
- Responsive black-and-white design
- Automatic API documentation (Swagger and ReDoc)
- Automated tests and test coverage
- Containerized production build served by FastAPI
- Continuous integration with GitHub Actions

## Technology Stack

| Layer      | Technology                                            |
| ---------- | ----------------------------------------------------- |
| Frontend   | React (functional components + hooks), Vite, Fetch API |
| Backend    | Python, FastAPI, Uvicorn                               |
| Database   | SQLite via SQLAlchemy ORM                              |
| Validation | Pydantic                                               |
| Testing    | Pytest, pytest-cov, FastAPI TestClient, HTTPX          |
| DevOps     | Docker, GitHub Actions                                 |

## Architecture

```text
React Frontend
      |
      v
FastAPI REST API
      |
      v
SQLAlchemy ORM
      |
      v
SQLite Database
```

The browser talks to the FastAPI backend over JSON. During development the Vite
dev server proxies `/api` requests to FastAPI; in production FastAPI serves the
built React app directly from `frontend/dist`.

## Folder Structure

```text
.
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # FastAPI app, CORS, static frontend
│   │   ├── database.py      # engine, session, get_db dependency
│   │   ├── models.py        # SQLAlchemy Todo model
│   │   ├── schemas.py       # Pydantic request/response schemas
│   │   └── routes.py        # REST API endpoints
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── conftest.py      # isolated test database + fixtures
│   │   ├── test_api.py      # health, docs, schema tests
│   │   └── test_tasks.py    # CRUD, validation, error tests
│   ├── requirements.txt
│   └── pytest.ini
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── Statistics.jsx
│   │   │   ├── TodoForm.jsx
│   │   │   ├── TodoList.jsx
│   │   │   ├── TodoItem.jsx
│   │   │   ├── SearchFilter.jsx
│   │   │   └── Notification.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── main.jsx
│   │   └── api.js           # centralised Fetch API calls
│   ├── index.html
│   ├── package.json
│   └── vite.config.js       # dev proxy /api -> localhost:8000
├── .github/workflows/ci.yml # GitHub Actions pipeline
├── Dockerfile               # multi-stage production build
├── .dockerignore
└── README.md
```

## Installation

### Backend

```bash
cd backend
python -m venv venv
```

Linux/macOS:

```bash
source venv/bin/activate
```

Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

### Frontend

```bash
cd frontend
npm install
```

## Development

Start the backend (the `todos.db` SQLite database is created automatically):

```bash
cd backend
uvicorn app.main:app --reload
```

Start the frontend:

```bash
cd frontend
npm run dev
```



Vite proxies every `/api` request to FastAPI, so the frontend uses clean
relative URLs.

## API

| Method | Endpoint                    | Description                          |
| ------ | --------------------------- | ------------------------------------ |
| POST   | `/api/todos`                | Create a todo (201)                  |
| GET    | `/api/todos`                | List all todos                       |
| GET    | `/api/todos/stats`          | Task statistics                      |
| GET    | `/api/todos/{id}`           | Get a single todo                    |
| PUT    | `/api/todos/{id}`           | Update a todo                        |
| PATCH  | `/api/todos/{id}/complete`  | Toggle completed / pending           |
| DELETE | `/api/todos/{id}`           | Delete a todo (204)                  |
| GET    | `/health`                   | Health check                         |

## Production Build

```bash
cd frontend
npm run build
```

FastAPI automatically serves the generated `frontend/dist` build at
http://localhost:8000 — no separate frontend server is needed in production.

## Testing

```bash
cd backend
pytest
```

Tests use an isolated SQLite database (`test_todos.db` in the system temp
directory) so the production database is never touched.

## Coverage

```bash
pytest --cov=app --cov-report=term-missing
pytest --cov=app --cov-report=html
```

The HTML report is written to `backend/htmlcov/index.html`. The project
currently covers 96% of the application code (target: at least 80%).

## Docker

```bash
docker build -t todo-app .
docker run -p 8000:8000 todo-app
```

Then open http://localhost:8000. The Dockerfile is multi-stage: it builds the
React app with Node, installs the Python dependencies with `python:3.11-slim`,
copies both into the image and starts Uvicorn on port 8000.

## API Documentation

FastAPI generates OpenAPI documentation automatically:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Git Workflow

The project uses Git with feature branches and meaningful commits:

```bash
git init
git add .
git commit -m "Initial project setup"
```

Suggested branches:

- `feature/todo-api` — backend API
- `feature/react-ui` — frontend dashboard
- `feature/testing` — automated tests
- `feature/docker` — containerization
- `feature/ci` — GitHub Actions pipeline

Work happens on a feature branch, then a pull request merges it into `main`
after review and passing CI.

## CI

`.github/workflows/ci.yml` runs on every push and pull request. It checks out
the repository, sets up Python 3.11, installs backend dependencies, runs the
test suite, and runs the coverage report. The pipeline fails automatically
whenever a test fails.

## Why Test Coverage?

Coverage measures which lines of code are executed by the tests. It identifies
untested paths (like the 404 error branches) so tests can be added for them,
giving confidence that the API behaves correctly before it is deployed.

## Clean Code

- Backend: small single-responsibility functions, meaningful names, type
  hints, PEP 8, schemas/models/routes separated, no duplicated API logic,
  proper exception handling, no raw SQL built from user input.
- Frontend: functional React components with hooks, centralised API calls in
  `api.js`, simple `useState`/`useEffect` state management, no UI frameworks,
  no unnecessary dependencies.