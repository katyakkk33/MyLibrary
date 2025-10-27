import path from 'path';
import fs from 'fs';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import { runMigrations } from './db';
import { migrateLegacyIfNeeded } from './legacy/migrate';
import { importFromJsonIfNeeded } from './bootstrap/importFromJson';
import bookRoutes from './routes/bookRoutes';
import externalRoutes from './routes/externalRoutes';
import debugRoutes from './routes/debugRoutes'; // опційно (увімкнеться, якщо DEBUG_DB=1)

dotenv.config();

/* ----------------- helpers ----------------- */
function normalizePort(val?: string): number {
  const s = (val ?? '').trim();
  const n = parseInt(s || '3000', 10);
  if (Number.isFinite(n) && n >= 0 && n < 65536) return n;
  return 3000;
}
function parseOrigins(raw?: string): (string | RegExp)[] {
  const s = (raw ?? '').trim();
  if (!s) return [/^http:\/\/localhost(?::\d+)?$/i, /^http:\/\/127\.0\.0\.1(?::\d+)?$/i];
  return s.split(',').map(x => x.trim()).filter(Boolean);
}

/* ----------------- env ----------------- */
const PORT = normalizePort(process.env.PORT);
const JSON_LIMIT = (process.env.JSON_LIMIT || '1mb').trim();
const ALLOWED = parseOrigins(process.env.ALLOWED_ORIGINS);
const DB_FILE = (process.env.DB_FILE || path.resolve(__dirname, '..', 'data', 'books.db')).trim();

/* ----------------- app ----------------- */
const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "img-src": [
        "'self'",
        "data:",
        "https://covers.openlibrary.org",
        "https://books.google.com",
        "https://books.googleusercontent.com",
        "https://lh3.googleusercontent.com",
        "https://images-na.ssl-images-amazon.com",
        "https://static.yakaboo.ua",
        "https://archive.org",
        "https://*.archive.org"
      ],
      "connect-src": [
        "'self'",
        "https://openlibrary.org",
        "https://www.googleapis.com"
      ],
      "script-src-attr": ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginResourcePolicy: { policy: "same-origin" }
}));


app.use(express.json({ limit: JSON_LIMIT }));

/* ----------------- migrations ----------------- */
try {
  const dataDir = path.resolve(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  runMigrations();
  migrateLegacyIfNeeded();      // імпорт зі старих таблиць у books, якщо books порожня
  importFromJsonIfNeeded();     // імпорт з data/books.json, якщо books порожня
} catch (e) {
  console.error('Migrations failed:', e);
}

/* ----------------- config log ----------------- */
try {
  const fullDbPath = DB_FILE.startsWith('.') ? path.resolve(__dirname, '..', DB_FILE) : DB_FILE;
  console.log('Config:', {
    PORT,
    DB_FILE: fullDbPath,
    JSON_LIMIT,
    ALLOWED_ORIGINS: ALLOWED
  });
  console.log('DB exists:', fs.existsSync(fullDbPath));
} catch { /* no-op */ }

/* ----------------- health ----------------- */
app.get('/healthz', (_req: Request, res: Response) => res.json({ ok: true }));

/* ----------------- debug (optional) ----------------- */
if (process.env.DEBUG_DB === '1') {
  app.use('/debug', debugRoutes);
}

/* ----------------- api ----------------- */
app.use('/api/books', bookRoutes);

// Зовнішній пошук — обидва шляхи працюють:
app.use('/api/ext', externalRoutes);
app.use('/api/external', externalRoutes);

/* ----------------- static frontend ----------------- */
const frontendDir = path.resolve(__dirname, '..', 'frontend');
app.use(express.static(frontendDir));
app.get('*', (_req, res) => {
  const indexFile = path.join(frontendDir, 'index.html');
  if (fs.existsSync(indexFile)) res.sendFile(indexFile);
  else res.status(404).send('frontend not found');
});

/* ----------------- errors ----------------- */
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

/* ----------------- start ----------------- */
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
