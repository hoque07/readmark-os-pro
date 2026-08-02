# Deployment guide

## Option A: Render single-service deployment

This is the easiest complete deployment because the frontend, backend and API use one domain.

1. Push the repository to GitHub.
2. In Render choose **New → Blueprint**.
3. Connect the repository. Render detects `render.yaml`.
4. Enter `ADMIN_EMAIL`, `ADMIN_PASSWORD` and optionally `OPENAI_API_KEY`. The blueprint sets `ENVIRONMENT=production`, so local demo credentials are not displayed.
5. Deploy.
6. The Docker image builds the frontend and runs FastAPI.
7. Render supplies PostgreSQL through `DATABASE_URL`.

Before a public launch, use a strong owner password and do not use the local default credentials.

## Option B: GitHub Pages frontend + hosted FastAPI backend

1. Deploy the backend first to Render/Railway.
2. Set the backend environment:

```env
DATABASE_URL=postgresql+psycopg://...
CORS_ORIGINS=https://YOUR_USERNAME.github.io
SERVE_FRONTEND=false
```

3. In GitHub repository **Settings → Secrets and variables → Actions → Variables**, create:

```text
VITE_API_URL=https://YOUR-BACKEND.example.com/api
```

4. In **Settings → Pages**, choose **GitHub Actions**.
5. Run the `Deploy Frontend to GitHub Pages` workflow.

The included workflow sets `VITE_BASE_PATH` to the repository name and enables `VITE_USE_HASH_ROUTER=true`. This makes project-site assets and client-side routes work under URLs such as `https://YOUR_USERNAME.github.io/readmark-os/`. The recommended Render single-service path is still simpler because the API and frontend share one origin.

## Database migration from local SQLite

SQLite is intentionally used for the easiest local setup. Production should use PostgreSQL. The current release creates tables automatically at startup. For future schema changes, add Alembic migrations before operating with valuable production data.

## Backup

Local data:

```text
backend/data/readmark.db
backend/uploads/
```

Stop the backend before copying the SQLite database. Back up both locations together. The owner can additionally download a portable JSON export from **Settings & Data**.

Production PostgreSQL backups depend on the host. Enable managed database backups before storing important long-term content.
