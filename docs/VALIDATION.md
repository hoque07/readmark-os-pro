# Validation report

Validation performed before the release ZIP was created:

## Passed

- Python source compilation for the complete FastAPI application and tests.
- Backend integration tests: health, authentication, offline generation, publishing, public article access, review scheduling, reading progress and owner JSON export.
- Live FastAPI smoke test against `/api/health` and `/api/posts`.
- Frontend TypeScript syntax and internal type audit across all `src/*.ts` and `src/*.tsx` files.
- GitHub Pages configuration audit for repository subpaths and HashRouter deployment.
- Secret-handling audit: OpenAI keys are backend-only; public post responses exclude raw notes; drafts and export require owner authentication.

## Environment limitation

The execution environment used to assemble this release could not complete an installation from the public npm registry, so a real `npm run build` with downloaded third-party packages was not executed here. The Windows setup script explicitly uses `https://registry.npmjs.org/`, and the included GitHub CI workflow runs the full frontend build after you push.

On your PC, `setup-windows.bat` performs the definitive dependency installation, backend tests and frontend typecheck. After setup, also run:

```powershell
cd frontend
npm run build
```

A successful build creates `frontend/dist/`.
