# Contributing to ReadMark OS

Thanks for helping improve ReadMark OS. Small, focused pull requests are easiest to review.

## Development workflow

1. Fork the repository and create a branch from `main`.
2. Run `setup-windows.bat` on Windows, or install the backend and frontend dependencies manually from the README.
3. Make your change without committing `.env`, SQLite databases, uploads, build output, or dependency folders.
4. Run `backend/.venv/Scripts/python.exe -m pytest -q` and `npm run build` from `frontend/`.
5. Open a pull request that explains the user impact and includes screenshots for visual changes.

Please report security issues privately as described in [SECURITY.md](SECURITY.md).
