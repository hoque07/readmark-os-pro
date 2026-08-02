# Architecture

## Local development

```text
Browser at :5173
    ↓ JSON/HTTP
React + TypeScript + Vite
    ↓ Bearer JWT
FastAPI at :8000
    ↓ SQLAlchemy 2 ORM
SQLite file: backend/data/readmark.db
    ↓ optional
OpenAI Responses API
```

## Production choices

### Recommended single-service deployment

The Dockerfile builds the React frontend, copies it into the Python image, and FastAPI serves both the API and the SPA. PostgreSQL is selected by setting `DATABASE_URL`. This avoids cross-origin configuration and gives one public URL.

### Split deployment

- Frontend: GitHub Pages, Netlify, Vercel or Cloudflare Pages.
- Backend: Render, Railway, Fly.io or another Python host.
- Database: PostgreSQL.
- Set `VITE_API_URL` to the backend `/api` URL.
- Add the frontend origin to backend `CORS_ORIGINS`.

## Core modules

- `backend/app/models.py`: persistent domain models.
- `backend/app/routers/`: API endpoints.
- `backend/app/services/ai_service.py`: AI provider abstraction and offline fallback.
- `frontend/src/api/client.ts`: typed frontend API client.
- `frontend/src/contexts/AuthContext.tsx`: owner session.
- `frontend/src/pages/AddNote.tsx`: note-to-blog authoring workflow.

## Data lifecycle

1. Owner enters a raw reading note.
2. `/api/ai/generate` converts it into structured JSON and Markdown.
3. Owner edits the generated draft.
4. `/api/posts` saves the final version.
5. Dashboard, library, article, stats and review endpoints read the same database record.
6. Review grading creates a review event and computes the next review date.
7. The owner export endpoint creates a portable JSON snapshot without exposing passwords.
