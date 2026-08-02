# API and AI setup

## Built-in FastAPI API

Start the backend and open:

- Swagger UI: `http://localhost:8000/docs`
- OpenAPI JSON: `http://localhost:8000/openapi.json`
- Health: `http://localhost:8000/api/health`

The frontend already calls this API. You do not have to manually write API requests.

## OpenAI setup

The application is fully testable without an OpenAI key. In that mode, a deterministic local formatter creates the article structure. To enable richer generation:

1. Create an API key in the OpenAI Platform.
2. Open `backend/.env`.
3. Add:

```env
OPENAI_API_KEY=sk-proj-your-key
OPENAI_MODEL=gpt-5-mini
```

4. Restart the backend terminal.
5. Login and generate a new note.

Never place the key in `frontend/.env`, React code or GitHub source. Any Vite variable can become visible in the browser bundle.

## OpenAI-compatible providers

The service can call an OpenAI-compatible base URL:

```env
OPENAI_API_KEY=provider-key
OPENAI_BASE_URL=https://provider.example.com/v1
OPENAI_MODEL=provider-model-name
```

Compatibility varies by provider. The code expects a Responses-style endpoint and `response.output_text`. When a provider fails and `AI_FALLBACK_ON_ERROR=true`, the offline generator is used and the editor shows a warning.

## Important endpoints

| Method | Route | Authentication | Purpose |
|---|---|---:|---|
| POST | `/api/auth/login` | No | Owner login |
| POST | `/api/auth/change-password` | Yes | Change the owner password |
| GET | `/api/posts` | No | List posts |
| GET | `/api/posts/{slug}` | No | Read one post |
| POST | `/api/posts` | Yes | Save a post |
| PATCH | `/api/posts/{id}` | Yes | Edit/publish/apply/save |
| POST | `/api/ai/generate` | Yes | Generate an editable draft |
| POST | `/api/uploads` | Yes | Upload JPG/PNG/WebP cover |
| GET | `/api/stats` | No | Dashboard statistics |
| GET | `/api/reviews/due` | Yes | Due review items |
| POST | `/api/reviews/{id}/grade` | Yes | Schedule the next review |
| GET/POST | `/api/progress` | Yes | Book progress |
| GET | `/api/admin/export` | Yes | Export posts, raw notes, progress and review history |


## Owner backup API

The **Settings & Data** page calls `GET /api/admin/export` with the owner bearer token and downloads the response as JSON. Uploaded images are files rather than database rows, so copy `backend/uploads/` alongside the JSON backup.
