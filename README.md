# Produkt Module (SQLite)

## Configuration

Create a `.env` (see `.env.example`) to control:

- `PORT` — server port (default 3000)
- `ALLOWED_ORIGINS` — comma-separated origins for CORS
- `JSON_LIMIT` — request body limit (default 1mb)
- `MAX_BATCH` — max items for `/api/books/fetch-list`
- `AUTO_ENRICH` — set `1` to auto-enrich on start
- `DB_FILE` — path to SQLite file (default `./data/books.db`)
- `USE_FILE_FALLBACK` — `1` to use JSON file store instead of SQLite

## Health Check

- `GET /healthz` returns `{ ok: true }` when the server is up.

## Deploy to Render (via GitHub)

1) On Render: **New +** → **Web Service** → connect your GitHub repo `katyakkk33/MyLibrary`.
2) Choose branch `main` and set:
	- **Build Command**: `npm ci && npm run build`
	- **Start Command**: `npm start`
3) Add **Environment Variables** in Render:
	- `JWT_SECRET` (required)
	- `ALLOWED_ORIGINS` = your Render URL, e.g. `https://your-service.onrender.com`
	- `DB_FILE` = `/var/data/books.db` (recommended for SQLite)
	- Optional: `AUTO_ENRICH=0`, `DEBUG_DB=0`
4) Add a **Persistent Disk** (recommended for SQLite):
	- Mount path: `/var/data`
	- Size: 1 GB (or more)
5) Deploy, then open `https://your-service.onrender.com/healthz`.


## Notes (Refactor)
- Added helmet, tighter CORS, rate limiting on `/api/books`.
- Idempotent migrations tracker `_migrations`.
- Fixed duplicate `cover_url` in V3 migration.
- Added pagination & query filtering via `GET /api/books?query=&status=&limit=&offset=`.
- Implemented `/api/books/enrich` to fetch covers/ISBN/description from Open Library.


## Clean layout
This project was flattened to a single folder with only essentials:
- `src/` (server, routes, controllers, db, utils, models)
- `frontend/` (static UI)
- `migrations/sqlite/` (schema changes; idempotent)
- `seeds/` (initial data)
- `data/` (SQLite file lives here)
- `run_all.bat` (Windows launchers)
