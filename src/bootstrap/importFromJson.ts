import fs from 'fs';
import path from 'path';
import { get, run } from '../db';

// Схема елемента у books.json
type JsonBook = {
  id?: number;
  tytul: string;
  autor: string;
  data_dodania?: string;
  kilkist_storinyok?: number | null;
  status?: 'PROCHYTANA' | 'PLANUYU';
  isbn?: string | null;
  cover_url?: string | null;
  description?: string | null;
};

function tryLoadJsonCandidates(): { file: string, items: JsonBook[] } | null {
  const candidates = [
    path.resolve(__dirname, '..', '..', 'data', 'books.json'),   // ./data/books.json
    path.resolve(__dirname, '..', '..', 'seeds', 'books.json'),  // ./seeds/books.json
    path.resolve(__dirname, '..', '..', 'seeds', 'seed.json'),   // на випадок, якщо файл так названий
  ];
  for (const f of candidates) {
    try {
      if (!fs.existsSync(f)) continue;
      const raw = fs.readFileSync(f, 'utf-8');
      const parsed = JSON.parse(raw);
      // підтримуємо як {books:[...]} так і просто [...]
      const items: JsonBook[] = Array.isArray(parsed) ? parsed :
        (Array.isArray(parsed?.books) ? parsed.books : []);
      if (Array.isArray(items) && items.length) {
        return { file: f, items };
      }
    } catch { /* skip */ }
  }
  return null;
}

export function importFromJsonIfNeeded() {
  // якщо вже є записи — не імпортуємо
  const cnt = get<{ c: number }>('SELECT COUNT(*) AS c FROM books');
  if ((cnt?.c ?? 0) > 0) {
    console.log(`JSON import: books already has ${cnt?.c} rows — skip.`);
    return;
  }

  const found = tryLoadJsonCandidates();
  if (!found) {
    console.log('JSON import: no books.json/seed.json found — nothing to import.');
    return;
  }

  let created = 0;
  for (const b of found.items) {
    const t = String(b.tytul ?? '').trim();
    const a = String(b.autor ?? '').trim();
    if (!t || !a) continue;

    // Уникаємо дубліката по (tytul, autor)
    const exists = get('SELECT id FROM books WHERE tytul=? AND autor=?', [t, a]);
    if (exists) continue;

    run(
      `INSERT INTO books (tytul, autor, kilkist_storinyok, status, data_dodania, isbn, cover_url, description)
       VALUES (?, ?, ?, ?, COALESCE(?, datetime('now')), ?, ?, ?)`,
      [
        t,
        a,
        b.kilkist_storinyok ?? null,
        (b.status === 'PROCHYTANA' || b.status === 'PLANUYU') ? b.status : 'PLANUYU',
        b.data_dodania ?? null,
        b.isbn ?? null,
        b.cover_url ?? null,
        b.description ?? null
      ]
    );
    created++;
  }
  console.log(`JSON import: imported ${created} books from ${found.file}`);
}
