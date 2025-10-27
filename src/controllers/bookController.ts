import { Request, Response } from 'express';
import { all, get, run } from '../db';
import { Book, NewBook } from '../models/Book';
import { normalizeBookPayload, validateBookData } from '../utils/validator';

// Helpers
const rowToBook = (r: any): Book => ({
  id: r.id,
  tytul: r.tytul,
  autor: r.autor,
  kilkist_storinyok: r.kilkist_storinyok ?? undefined,
  status: r.status,
  data_dodania: r.data_dodania,
  isbn: r.isbn ?? null,
  cover_url: r.cover_url ?? null,
  description: r.description ?? null
});

export async function listBooks(req: Request, res: Response) {
  const q = String(req.query.query ?? '').trim();
  const status = String(req.query.status ?? '').trim().toUpperCase();
  const limit = Math.min(parseInt(String(req.query.limit ?? '20')) || 20, 100);
  const offset = Math.max(parseInt(String(req.query.offset ?? '0')) || 0, 0);

  const where: string[] = [];
  const args: any[] = [];
  if (q) { where.push('(tytul LIKE ? OR autor LIKE ?)'); args.push(`%${q}%`, `%${q}%`); }
  if (status === 'PROCHYTANA' || status === 'PLANUYU') { where.push('status = ?'); args.push(status); }

  const sql = `SELECT * FROM books ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
               ORDER BY datetime(data_dodania) DESC
               LIMIT ? OFFSET ?`;
  const rows = all<Book>(sql, [...args, limit, offset]);
  res.json({ items: rows.map(rowToBook), limit, offset });
}

export async function getBookById(req: Request, res: Response) {
  const id = Number(req.params.id);
  const row = get<Book>('SELECT * FROM books WHERE id=?', [id]);
  if (!row) return res.status(404).json({ error: 'Не знайдено' });
  res.json(rowToBook(row));
}

export async function createBook(req: Request, res: Response) {
  const payload: NewBook = normalizeBookPayload(req.body);
  const err = validateBookData(payload);
  if (err) return res.status(422).json({ error: err });

  try {
    const result = run(
      `INSERT INTO books (tytul, autor, kilkist_storinyok, status, data_dodania, isbn, cover_url, description)
       VALUES (?, ?, ?, ?, datetime('now'), ?, ?, ?)`,
      [payload.tytul, payload.autor, payload.kilkist_storinyok, payload.status,
       payload.isbn ?? null, payload.cover_url ?? null, payload.description ?? null]
    );
    const row = get<Book>('SELECT * FROM books WHERE id=?', [result.lastInsertRowid]);
    res.status(201).json(rowToBook(row));
  } catch (e: any) {
    if (String(e.message).includes('UNIQUE')) {
      return res.status(409).json({ error: 'Книга з таким tytul+autor вже існує.' });
    }
    throw e;
  }
}

export async function updateBook(req: Request, res: Response) {
  const id = Number(req.params.id);
  const existing = get<Book>('SELECT * FROM books WHERE id=?', [id]);
  if (!existing) return res.status(404).json({ error: 'Не знайдено' });

  const payload: NewBook = normalizeBookPayload({ ...existing, ...req.body });
  const err = validateBookData(payload);
  if (err) return res.status(422).json({ error: err });

  try {
    run(
      `UPDATE books SET tytul=?, autor=?, kilkist_storinyok=?, status=?, isbn=?, cover_url=?, description=? WHERE id=?`,
      [payload.tytul, payload.autor, payload.kilkist_storinyok, payload.status,
       payload.isbn ?? null, payload.cover_url ?? null, payload.description ?? null, id]
    );
    const row = get<Book>('SELECT * FROM books WHERE id=?', [id]);
    res.json(rowToBook(row));
  } catch (e: any) {
    if (String(e.message).includes('UNIQUE')) {
      return res.status(409).json({ error: 'Конфлікт унікальності tytul+autor.' });
    }
    throw e;
  }
}

export async function deleteBook(req: Request, res: Response) {
  const id = Number(req.params.id);
  const info = run('DELETE FROM books WHERE id=?', [id]);
  if (!info.changes) return res.status(404).json({ error: 'Не знайдено' });
  res.json({ ok: true });
}

export async function bulkCreate(req: Request, res: Response) {
  const items: any[] = Array.isArray(req.body) ? req.body : [];
  const results: any = { created: 0, skipped: 0, conflicts: [] };
  for (const it of items) {
    const payload = normalizeBookPayload(it);
    const err = validateBookData(payload);
    if (err) { results.skipped++; continue; }
    try {
      run(
        `INSERT INTO books (tytul, autor, kilkist_storinyok, status, data_dodania, isbn, cover_url, description)
         VALUES (?, ?, ?, ?, datetime('now'), ?, ?, ?)`,
        [payload.tytul, payload.autor, payload.kilkist_storinyok, payload.status,
         payload.isbn ?? null, payload.cover_url ?? null, payload.description ?? null]
      );
      results.created++;
    } catch (e: any) {
      if (String(e.message).includes('UNIQUE')) {
        results.skipped++;
        results.conflicts.push({ tytul: payload.tytul, autor: payload.autor });
      } else {
        results.skipped++;
      }
    }
  }
  res.json(results);
}

// Enrich missing covers/ISBN/description via Open Library
async function fetchOpenLibraryMeta(title: string, author: string) {
  try {
    const q = encodeURIComponent(`${title} ${author}`.trim());
    const r = await fetch(`https://openlibrary.org/search.json?q=${q}&limit=1`);
    if (!r.ok) return null;
    const data: any = await r.json();
    const doc: any = data?.docs?.[0];
    if (!doc) return null;
    const isbn = Array.isArray(doc.isbn) ? doc.isbn[0] : undefined;
    let cover_url: string | undefined;
    if (doc.cover_i) {
      cover_url = `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
    } else if (isbn) {
      cover_url = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
    }
    const description = (typeof doc.first_sentence === 'string') ? doc.first_sentence : undefined;
    return { isbn, cover_url, description };
  } catch {
    return null;
  }
}

export async function enrichBooks(req: Request, res: Response) {
  try {
    // Беремо тільки ті колонки, які ТОЧНО існують у схемі
    const rows = all<{
      id: number;
      tytul: string;
      autor: string | null;
      isbn: string | null;
      cover_url: string | null;
      description: string | null;
    }>(
      `SELECT id, tytul, autor, isbn, cover_url, description
       FROM books`
    );

    let updated = 0;

    // Допоміжні ф-ції для пошуку (Node 20 має global fetch)
    async function tryOpenLibraryByIsbn(isbn: string) {
      const url = `https://covers.openlibrary.org/b/isbn/${encodeURIComponent(isbn)}-L.jpg`;
      const head = await fetch(url, { method: 'HEAD' });
      return head.ok ? url : null;
    }
    async function findCoverByTitleAuthor(title: string, author: string) {
      // OpenLibrary
      try {
        const r = await fetch(
          `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}${author ? `&author=${encodeURIComponent(author)}` : ''}&limit=1`
        );
        const j: any = await r.json();
        const d = j?.docs?.[0];
        if (d) {
          if (d.cover_i) return `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg`;
          if (Array.isArray(d.isbn) && d.isbn[0]) {
            return `https://covers.openlibrary.org/b/isbn/${encodeURIComponent(d.isbn[0])}-L.jpg`;
          }
        }
      } catch {}
      // Google Books
      try {
        const r = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(title)}${author ? '+inauthor:' + encodeURIComponent(author) : ''}&maxResults=1`
        );
        const j: any = await r.json();
        const v = j?.items?.[0]?.volumeInfo;
        const img = v?.imageLinks?.thumbnail || v?.imageLinks?.smallThumbnail;
        if (img) return String(img).replace('http://', 'https://');
      } catch {}
      return null;
    }
    async function findDescription(title: string, author: string) {
      try {
        const r = await fetch(
          `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}${author ? `&author=${encodeURIComponent(author)}` : ''}&limit=1`
        );
        const j: any = await r.json();
        const d = j?.docs?.[0];
        if (d?.first_sentence) return String(d.first_sentence);
        if (d?.subtitle) return String(d.subtitle);
      } catch {}
      try {
        const r = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(title)}${author ? '+inauthor:' + encodeURIComponent(author) : ''}&maxResults=1`
        );
        const j: any = await r.json();
        const v = j?.items?.[0]?.volumeInfo;
        if (v?.description) return String(v.description);
        if (v?.subtitle) return String(v.subtitle);
      } catch {}
      return null;
    }

    for (const b of rows) {
      const needCover = !b.cover_url || b.cover_url.trim() === '';
      const needDesc  = !b.description || b.description.trim() === '';

      if (!needCover && !needDesc) continue;

      let newCover: string | null = null;
      let newDesc: string | null = null;

      if (needCover) {
        if (b.isbn) {
          newCover = await tryOpenLibraryByIsbn(b.isbn);
        }
        if (!newCover) {
          newCover = await findCoverByTitleAuthor(b.tytul, b.autor || '');
        }
      }
      if (needDesc) {
        newDesc = await findDescription(b.tytul, b.autor || '');
      }

      if (newCover || newDesc) {
        run(
          `UPDATE books
             SET cover_url = COALESCE(?, cover_url),
                 description = COALESCE(?, description)
           WHERE id = ?`,
          [newCover ?? null, newDesc ?? null, b.id]
        );
        updated++;
      }
    }

    res.json({ updated });
  } catch (e) {
    console.error('enrichBooks failed:', e);
    res.status(500).json({ error: 'Enrich failed' });
  }
}
