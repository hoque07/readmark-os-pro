# ReadMark OS 2.0

[![CI](https://github.com/hoque07/readmark-os-pro/actions/workflows/ci.yml/badge.svg)](https://github.com/hoque07/readmark-os-pro/actions/workflows/ci.yml)
[![Deploy to GitHub Pages](https://github.com/hoque07/readmark-os-pro/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/hoque07/readmark-os-pro/actions/workflows/deploy-pages.yml)
[![Live demo](https://img.shields.io/badge/demo-live-7758ff?logo=github)](https://hoque07.github.io/readmark-os-pro/)
[![License: MIT](https://img.shields.io/badge/license-MIT-ffbe3f.svg)](LICENSE)

**A local-first reading memory, story-blog, progress and spaced-review platform.**

ReadMark OS turns rough daily book notes into structured, editable blog posts. It runs fully on a local Windows PC through VS Code, stores content permanently in SQLite, supports optional OpenAI generation, and is ready for PostgreSQL and cloud deployment later.

## Live demo

Explore the responsive, read-only showcase at **[hoque07.github.io/readmark-os-pro](https://hoque07.github.io/readmark-os-pro/)**. GitHub Pages cannot run FastAPI or SQLite, so the public build uses bundled sample content. Clone the repository or use the D-drive Windows setup below for the complete owner workspace, AI generation, authentication, uploads, and permanent data.

![ReadMark OS UI reference](docs/ui-reference.png)

## What this project includes

### Product experience

- Premium dark digital-library interface.
- Responsive desktop, Android and iPhone layouts.
- Public dashboard, searchable library and distraction-free article reader.
- Owner-only AI Note Studio.
- Rough text or phone voice typing to structured blog draft.
- Editable title, excerpt, Markdown article, tags, key insight and action step.
- Draft and publish workflows.
- Cover image upload.
- Reading progress and active-book journeys.
- Owner Settings & Data page with complete JSON export.
- Saved-for-review lessons with spaced-review grading.
- Applied lesson tracking.
- PWA manifest and installable app shell.

### Engineering

- React 19 + TypeScript + Vite frontend.
- FastAPI backend with generated Swagger/OpenAPI docs.
- SQLAlchemy 2 ORM.
- SQLite local database and PostgreSQL production compatibility.
- JWT owner authentication and Argon2 password hashing.
- OpenAI Responses API integration.
- Safe offline generation when no API key is configured.
- Validated upload endpoint for JPG, PNG and WebP.
- CORS configuration for local network and split deployment.
- Dockerfile, Docker Compose, Render blueprint and GitHub Actions.
- Backend integration tests, frontend type audit and CI production-build workflow.
- VS Code tasks and debugger configuration.

---

## Instant UI preview before installing anything

Open this file directly in a browser:

```text
preview.html
```

It is a standalone interactive visual preview. The real React/FastAPI application starts after the setup steps below. Demo actions in the preview use browser storage and do not modify the FastAPI database.

---

# Fastest Windows setup

## 1. Requirements

Install these before opening the project:

- **Node.js:** Node 22 LTS recommended.
- **Python:** Python 3.11, 3.12 or 3.13.
- **VS Code:** current stable version.
- **Git:** needed only when you are ready to push.

During Python installation, enable **Add Python to PATH**.

## 2. Open the correct folder

Extract the ZIP. In VS Code choose:

```text
File → Open Folder → readmark-os-pro
```

The root opened in VS Code must directly contain:

```text
backend/
frontend/
docs/
setup-windows.bat
start-local.bat
README.md
```

On Windows, you can also double-click `open-in-vscode.bat` from File Explorer.

## 3. Install everything

Double-click:

```text
setup-windows.bat
```

Or from the VS Code terminal:

```powershell
.\setup-windows.bat
```

This script:

1. checks Node, npm and Python;
2. creates `backend/.venv`;
3. installs Python packages;
4. installs frontend packages;
5. creates local `.env` files;
6. runs the backend test;
7. runs the complete frontend TypeScript and production build.

Python and npm download caches are stored inside the project under `.cache/`. If the project is on `D:`, the large dependency downloads, `backend/.venv`, and `frontend/node_modules` remain on `D:` as well.

GitHub CI repeats the tests and production build after a push.

## 4. Start the complete site

Double-click:

```text
start-local.bat
```

Or run:

```powershell
.\start-local.bat
```

The script opens the backend in a separate PowerShell window and starts the frontend in the current window.

### Local links

| Service | URL |
|---|---|
| Full website | `http://localhost:5173` |
| FastAPI backend | `http://localhost:8000` |
| Interactive API docs | `http://localhost:8000/docs` |
| API health check | `http://localhost:8000/api/health` |

### Default local owner login

```text
Email: admin@example.com
Password: ChangeMe123!
```

These values come from `backend/.env`. They are intentionally simple for local testing. After login, use **Settings & Data → Change owner password** before a public deployment. For a brand-new production database, also set strong `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment values.

---

# Manual setup through the VS Code terminal

Use this only when you prefer to see each command.

## Backend

```powershell
cd backend
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Copy-Item .env.example .env
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Leave that terminal running.

## Frontend

Open a second VS Code terminal:

```powershell
cd frontend
npm install --registry=https://registry.npmjs.org/
Copy-Item .env.example .env
npm run dev
```

Open `http://localhost:5173`.

## VS Code task alternative

After setup:

```text
Terminal → Run Task → ReadMark: Start Full Stack
```

---

# First local test

1. Open `http://localhost:5173`.
2. Confirm that the seeded dashboard and three sample articles appear.
3. Choose **Owner Login**.
4. Login with the default local credentials.
5. Open **AI Note Studio**.
6. Enter a book name and at least 20 characters of rough notes.
7. Choose **Generate Blog Draft**.
8. Review and edit the generated Markdown.
9. Choose **Publish Now**.
10. Confirm that the new article appears in the library and dashboard.

The first startup creates:

```text
backend/data/readmark.db
```

That SQLite file stores your users, posts, progress and review history.

---

# AI setup

## The project works without any AI API

Without an API key, the backend uses an **offline structured generator**. It transforms the note into the correct blog sections and makes the full authoring, database and publishing workflow testable.

This is useful before spending money or connecting any external service.

## Connect OpenAI

Open:

```text
backend/.env
```

Add:

```env
OPENAI_API_KEY=sk-proj-your-real-key
OPENAI_MODEL=gpt-5-mini
```

Restart the backend terminal.

The API key is read only by FastAPI. It must never be placed in:

```text
frontend/.env
frontend/src/
GitHub source files
VITE_ environment variables
```

Vite variables are bundled into browser JavaScript and should be considered public.

OpenAI API billing is separate from a ChatGPT subscription. Set an API usage limit in the OpenAI Platform before regular use.

More details: [`docs/API_SETUP.md`](docs/API_SETUP.md)

---

# Preview from Android or iPhone on the same Wi-Fi

You can test the full local site from a phone without deploying it.

## 1. Find your PC IPv4 address

In PowerShell:

```powershell
ipconfig
```

Look for an address similar to:

```text
192.168.0.15
```

## 2. Change the frontend API address

Open:

```text
frontend/.env
```

Change:

```env
VITE_API_URL=http://localhost:8000/api
```

To your PC address:

```env
VITE_API_URL=http://192.168.0.15:8000/api
```

## 3. Allow the frontend origin in FastAPI

Open:

```text
backend/.env
```

Set:

```env
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://192.168.0.15:5173
```

Replace the example IP with your PC address.

## 4. Restart both servers

Then open on the phone:

```text
http://192.168.0.15:5173
```

Both devices must use the same Wi-Fi. When Windows Firewall asks, allow Node.js and Python on **Private networks**.

### iPhone app-style preview

In Safari:

```text
Share → Add to Home Screen
```

The local PWA shell can then open from the Home Screen while the PC servers are running.

---

# Important folders

```text
readmark-os-pro/
├── backend/
│   ├── app/
│   │   ├── routers/          API endpoints
│   │   ├── services/         AI, slug, seed and content logic
│   │   ├── config.py         environment configuration
│   │   ├── database.py       SQLAlchemy engine/session
│   │   ├── models.py         database models
│   │   ├── schemas.py        request/response validation
│   │   └── main.py           FastAPI application
│   ├── data/                 local SQLite database
│   ├── uploads/              uploaded cover images
│   ├── tests/
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── api/              typed API client
│   │   ├── components/       reusable interface components
│   │   ├── contexts/         authentication state
│   │   ├── pages/            complete app pages
│   │   └── styles/           full responsive theme
│   ├── public/               PWA icons
│   ├── package.json
│   └── .env
├── docs/
├── .github/workflows/
├── Dockerfile
├── docker-compose.yml
└── render.yaml
```

---

# Database and permanent storage

## Local storage

The default setting is:

```env
DATABASE_URL=sqlite:///./data/readmark.db
```

SQLite is ideal for one owner on a local PC. No database installation is required.

### Backup

Stop the backend, then copy:

```text
backend/data/readmark.db
backend/uploads/
```

Keep both together. The database contains metadata and text. The uploads folder contains image files. You can also login and use **Settings & Data → Download Backup** to export posts, drafts, raw notes, progress and review history as JSON.

## PostgreSQL later

For cloud deployment, set a PostgreSQL connection:

```env
DATABASE_URL=postgresql+psycopg://USER:PASSWORD@HOST:5432/DATABASE
```

The application uses SQLAlchemy, so the same models and endpoints work with SQLite and PostgreSQL.

---

# API guidance for a beginner

You do not need to manually create an API. FastAPI is already included and the React frontend is already connected to it.

Open:

```text
http://localhost:8000/docs
```

Swagger UI lets you inspect and test every endpoint.

Main routes:

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/login` | Owner login |
| POST | `/api/auth/change-password` | Change the owner password |
| GET | `/api/posts` | Search/list posts |
| GET | `/api/posts/{slug}` | Read one article |
| POST | `/api/ai/generate` | Turn raw note into editable blog |
| POST | `/api/posts` | Save a new post |
| PATCH | `/api/posts/{id}` | Edit or publish a post |
| POST | `/api/uploads` | Upload a cover image |
| GET | `/api/stats` | Dashboard statistics |
| GET/POST | `/api/progress` | Track active books |
| GET | `/api/admin/export` | Download an owner-only JSON backup |
| GET | `/api/reviews/due` | Get due reviews |
| POST | `/api/reviews/{id}/grade` | Save memory result |

Read [`docs/API_SETUP.md`](docs/API_SETUP.md) for payload and provider details.

---

# Editing the visual brand

Most theme variables are at the top of:

```text
frontend/src/styles/global.css
```

Core tokens:

```css
--bg: #07090e;
--panel: rgba(18, 22, 33, 0.82);
--amber: #ffbe3f;
--violet: #7758ff;
--green: #4ed8a1;
--radius-xl: 26px;
```

Main layout:

```text
frontend/src/components/Layout.tsx
```

Homepage:

```text
frontend/src/pages/Home.tsx
```

Authoring screen:

```text
frontend/src/pages/AddNote.tsx
```

Seeded sample content:

```text
backend/app/services/seed.py
```

After editing the frontend, Vite refreshes the browser automatically.

---

# Useful development commands

## Frontend

```powershell
cd frontend
npm run dev
npm run typecheck
npm run build
npm run preview
```

## Backend

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python -m pytest -q
python -m uvicorn app.main:app --reload
```

## Docker alternative

With Docker Desktop installed:

```powershell
docker compose up --build
```

Open:

```text
http://localhost:8000
```

The Docker build serves the compiled React application and FastAPI from one URL.

---

# Git workflow after local testing

```powershell
git init
git add .
git commit -m "Build ReadMark OS 2.0 full stack"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/readmark-os.git
git push -u origin main
```

Do not commit these files:

```text
backend/.env
frontend/.env
backend/data/readmark.db
backend/uploads/*
```

They are already covered by `.gitignore`.

---

# Deployment recommendation

GitHub Pages can host only the frontend. It cannot run FastAPI or store dynamic data.

For the complete application, the simplest production route is:

```text
GitHub repository
      ↓
Render/Railway Docker service
      ↓
FastAPI + built React frontend
      ↓
PostgreSQL
```

The included `Dockerfile` and `render.yaml` support this structure. A split GitHub Pages frontend and hosted backend is also documented. The included Pages workflow automatically uses the repository subpath and HashRouter, but the single-service deployment remains easier because it avoids split-domain CORS configuration.

Read [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md). The release checks and the npm-registry limitation of the build environment are recorded in [`docs/VALIDATION.md`](docs/VALIDATION.md).

---

# Security before public deployment

Change at least these values:

```env
SECRET_KEY=a-long-random-secret
ADMIN_EMAIL=your-real-email
ADMIN_PASSWORD=a-strong-unique-password
SEED_DEMO_DATA=false
```

Also:

- use HTTPS;
- use PostgreSQL rather than an ephemeral SQLite file;
- keep `OPENAI_API_KEY` only on the backend host;
- restrict `CORS_ORIGINS` to your real frontend domain;
- enable database backups;
- set OpenAI API usage limits;
- do not publish private diary content unless intended.

---

# Troubleshooting

## `python` or `py` is not recognized

Install Python and enable **Add Python to PATH**, then reopen VS Code.

## PowerShell blocks `Activate.ps1`

The provided scripts use an explicit interpreter path and normally avoid activation-policy problems. For manual activation only:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

## `npm` is not recognized

Install Node.js LTS and reopen VS Code.

## npm shows registry or package 404 errors

Reset npm to the public registry and retry:

```powershell
npm config set registry https://registry.npmjs.org/
npm ping
cd frontend
npm install
```

## Frontend says it cannot connect to FastAPI

Confirm:

```text
http://localhost:8000/api/health
```

Then check `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000/api
```

Restart Vite after changing `.env`.

## Login fails after changing `.env`

The owner is created only when the database is empty. For a fresh local reset:

1. stop the backend;
2. delete `backend/data/readmark.db`;
3. start the backend again.

This deletes local content, so back up first.

## OpenAI generation falls back to offline mode

Check:

- the key is in `backend/.env`;
- API billing is active;
- the model name is available to the project;
- the backend was restarted;
- the terminal contains the provider error.

The draft remains editable even when fallback mode is used.

## Phone opens the frontend but cannot load posts

The phone cannot use the PC's `localhost`. Use the PC IPv4 address in `VITE_API_URL`, add the phone-facing frontend origin to `CORS_ORIGINS`, restart both servers, and allow Windows Firewall access on Private networks.

---

# Current release boundaries

This is a strong production-oriented v2 foundation, but these should be considered future extensions:

- email verification and password reset UI;
- multiple public authors and role permissions;
- cloud object storage for images;
- Alembic migration history for long-running production databases;
- automated browser end-to-end tests;
- newsletter and comments;
- semantic search and vector memory;
- native push reminders.

The code is modular so these can be added without replacing the main architecture.

---

## Technical references

- FastAPI tutorial and API framework: https://fastapi.tiangolo.com/tutorial/
- FastAPI JWT security: https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/
- FastAPI CORS: https://fastapi.tiangolo.com/tutorial/cors/
- SQLAlchemy ORM: https://docs.sqlalchemy.org/en/20/orm/
- Vite guide: https://vite.dev/guide/
- OpenAI developer quickstart: https://platform.openai.com/docs/quickstart

## License

MIT. See [`LICENSE`](LICENSE).
