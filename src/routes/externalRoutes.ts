import { Router, Request, Response as ExResponse } from 'express';

const router = Router();

/* -------------------------------- helpers -------------------------------- */

async function fetchWithTimeout(url: string, ms = 8000): Promise<globalThis.Response> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal as AbortSignal });
  } finally {
    clearTimeout(t);
  }
}

async function headOk(url: string, ms = 6000): Promise<boolean> {
  try {
    const r = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    if (r.ok) return true;
  } catch {}
  try {
    const r2 = await fetchWithTimeout(url, ms);
    if (r2.ok && r2.headers.get('content-type')?.includes('image')) return true;
  } catch {}
  return false;
}

function pushUnique<T extends { url: string }>(arr: T[], it: T) {
  if (!it.url) return;
  if (!arr.find(x => x.url === it.url)) arr.push(it);
}

/* ------------------------------ /ext/search ------------------------------- */
/**
 * GET /api/ext/search?q=Назва — Автор
 * Шукач: OpenLibrary + Google Books, з fallback-ами (title-only).
 */
router.get('/search', async (req: Request, res: ExResponse) => {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) return res.json({ items: [] });

    const [titleRaw, authorRaw] = q.split('—').map(s => s?.trim() || '');
    const title = titleRaw || q;
    const author = authorRaw || '';

    type Item = {
      src: 'OL' | 'GB';
      title: string;
      author: string;
      pages: number;
      cover: string | null;
      isbn?: string;
      description?: string;
    };
    const items: Item[] = [];

    /* ---- OpenLibrary (title+author) ---- */
    try {
      const url = new URL('https://openlibrary.org/search.json');
      url.searchParams.set('title', title);
      if (author) url.searchParams.set('author', author);
      url.searchParams.set('limit', '10');

      const r = await fetchWithTimeout(url.toString(), 9000);
      if (r.ok) {
        const j: any = await r.json();
        (j?.docs || []).forEach((d: any) => {
          items.push({
            src: 'OL',
            title: d.title || '',
            author: (Array.isArray(d.author_name) && d.author_name[0]) || '',
            pages: d.number_of_pages_median || 0,
            cover: d.cover_i
              ? `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg`
              : (Array.isArray(d.isbn) && d.isbn[0]
                  ? `https://covers.openlibrary.org/b/isbn/${encodeURIComponent(d.isbn[0])}-L.jpg`
                  : null),
            isbn: Array.isArray(d.isbn) && d.isbn[0] ? String(d.isbn[0]) : undefined,
            description: d.first_sentence || d.subtitle || ''
          });
        });
      }
    } catch {}

    /* ---- Google Books (title+author) ---- */
    try {
      const url = new URL('https://www.googleapis.com/books/v1/volumes');
      const qStr = `intitle:${title}` + (author ? `+inauthor:${author}` : '');
      url.searchParams.set('q', qStr);
      url.searchParams.set('maxResults', '10');

      const r2 = await fetchWithTimeout(url.toString(), 9000);
      if (r2.ok) {
        const j2: any = await r2.json();
        (j2?.items || []).forEach((it: any) => {
          const v = it?.volumeInfo || {};
          const links = v.imageLinks || {};
          const thumb = links.thumbnail || links.smallThumbnail || links.small || null;
          items.push({
            src: 'GB',
            title: v.title || '',
            author: (Array.isArray(v.authors) && v.authors[0]) || '',
            pages: v.pageCount || 0,
            cover: thumb ? String(thumb).replace('http://', 'https://') : null,
            isbn:
              Array.isArray(v.industryIdentifiers) && v.industryIdentifiers[0]
                ? String(v.industryIdentifiers[0].identifier)
                : undefined,
            description: v.description || v.subtitle || ''
          });
        });
      }
    } catch {}

    /* ---- Fallback: title-only пошуки, якщо мало результатів ---- */
    if (items.length < 12) {
      // OpenLibrary title-only
      try {
        const url = new URL('https://openlibrary.org/search.json');
        url.searchParams.set('title', title);
        url.searchParams.set('limit', '10');
        const r = await fetchWithTimeout(url.toString(), 9000);
        if (r.ok) {
          const j: any = await r.json();
          (j?.docs || []).forEach((d: any) => {
            items.push({
              src: 'OL',
              title: d.title || '',
              author: (Array.isArray(d.author_name) && d.author_name[0]) || '',
              pages: d.number_of_pages_median || 0,
              cover: d.cover_i
                ? `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg`
                : (Array.isArray(d.isbn) && d.isbn[0]
                    ? `https://covers.openlibrary.org/b/isbn/${encodeURIComponent(d.isbn[0])}-L.jpg`
                    : null),
              isbn: Array.isArray(d.isbn) && d.isbn[0] ? String(d.isbn[0]) : undefined,
              description: d.first_sentence || d.subtitle || ''
            });
          });
        }
      } catch {}

      // Google Books title-only
      try {
        const url = new URL('https://www.googleapis.com/books/v1/volumes');
        url.searchParams.set('q', `intitle:${title}`);
        url.searchParams.set('maxResults', '10');
        const r2 = await fetchWithTimeout(url.toString(), 9000);
        if (r2.ok) {
          const j2: any = await r2.json();
          (j2?.items || []).forEach((it: any) => {
            const v = it?.volumeInfo || {};
            const links = v.imageLinks || {};
            const thumb = links.thumbnail || links.smallThumbnail || links.small || null;
            items.push({
              src: 'GB',
              title: v.title || '',
              author: (Array.isArray(v.authors) && v.authors[0]) || '',
              pages: v.pageCount || 0,
              cover: thumb ? String(thumb).replace('http://', 'https://') : null,
              isbn:
                Array.isArray(v.industryIdentifiers) && v.industryIdentifiers[0]
                  ? String(v.industryIdentifiers[0].identifier)
                  : undefined,
              description: v.description || v.subtitle || ''
            });
          });
        }
      } catch {}
    }

    // de-dup by title|author
    const uniq = new Map<string, Item>();
    items.forEach(it => {
      const k = `${(it.title || '').toLowerCase()}|${(it.author || '').toLowerCase()}`;
      if (!uniq.has(k)) uniq.set(k, it);
    });

    return res.json({ items: Array.from(uniq.values()) });
  } catch (e) {
    console.error('external search error:', e);
    return res.status(500).json({ items: [], error: 'external search failed' });
  }
});

/* ------------------------------ /ext/cover -------------------------------- */
/**
 * GET /api/ext/cover?isbn=&title=&author=
 * Кандидати: OpenLibrary (isbn/cover_id/search), Google Books (isbn/title),
 * та додатково Yakaboo (скрейп першої картки), плюс GB frontcover через id.
 */
router.get('/cover', async (req: Request, res: ExResponse) => {
  try {
    const isbn = String(req.query.isbn || '').trim();
    const title = String(req.query.title || '').trim();
    const author = String(req.query.author || '').trim();

    const candidates: Array<{ url: string; source: string }> = [];

    /* 1) OpenLibrary за ISBN */
    if (isbn) {
      pushUnique(candidates, {
        url: `https://covers.openlibrary.org/b/isbn/${encodeURIComponent(isbn)}-L.jpg`,
        source: 'openlibrary:isbn'
      });
    }

    /* 2) Google Books за ISBN (+ frontcover контент, якщо є id і немає imageLinks) */
    if (isbn) {
      try {
        const u = new URL('https://www.googleapis.com/books/v1/volumes');
        u.searchParams.set('q', `isbn:${isbn}`);
        u.searchParams.set('maxResults', '1');

        const r = await fetchWithTimeout(u.toString(), 9000);
        if (r.ok) {
          const j: any = await r.json();
          const item = j?.items?.[0];
          const v = item?.volumeInfo;
          const img = v?.imageLinks?.thumbnail || v?.imageLinks?.smallThumbnail || null;
          if (img) {
            pushUnique(candidates, { url: String(img).replace('http://', 'https://'), source: 'google:isbn' });
          } else if (item?.id) {
            const contentUrl = `https://books.google.com/books/content?id=${encodeURIComponent(item.id)}&printsec=frontcover&img=1&zoom=1&source=gbs_api`;
            pushUnique(candidates, { url: contentUrl, source: 'google:isbn:content' });
          }
        }
      } catch {}
    }

    /* 3) OpenLibrary за title/author */
    if (title) {
      try {
        const u = new URL('https://openlibrary.org/search.json');
        u.searchParams.set('title', title);
        if (author) u.searchParams.set('author', author);
        u.searchParams.set('limit', '1');

        const r = await fetchWithTimeout(u.toString(), 9000);
        if (r.ok) {
          const j: any = await r.json();
          const d = j?.docs?.[0];
          if (d) {
            if (d.cover_i) {
              pushUnique(candidates, {
                url: `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg`,
                source: 'openlibrary:search'
              });
            } else if (Array.isArray(d.isbn) && d.isbn[0]) {
              pushUnique(candidates, {
                url: `https://covers.openlibrary.org/b/isbn/${encodeURIComponent(d.isbn[0])}-L.jpg`,
                source: 'openlibrary:search:isbn'
              });
            }
          }
        }
      } catch {}
    }

    /* 4) Google Books за title/author (та контент-URL, якщо є id) */
    if (title) {
      try {
        const u = new URL('https://www.googleapis.com/books/v1/volumes');
        const qStr = `intitle:${title}` + (author ? `+inauthor:${author}` : '');
        u.searchParams.set('q', qStr);
        u.searchParams.set('maxResults', '1');

        const r = await fetchWithTimeout(u.toString(), 9000);
        if (r.ok) {
          const j: any = await r.json();
          const item = j?.items?.[0];
          const v = item?.volumeInfo;
          const img = v?.imageLinks?.thumbnail || v?.imageLinks?.smallThumbnail || null;
          if (img) {
            pushUnique(candidates, { url: String(img).replace('http://', 'https://'), source: 'google:search' });
          } else if (item?.id) {
            const contentUrl = `https://books.google.com/books/content?id=${encodeURIComponent(item.id)}&printsec=frontcover&img=1&zoom=1&source=gbs_api`;
            pushUnique(candidates, { url: contentUrl, source: 'google:search:content' });
          }
        }
      } catch {}
    }

    /* 5) Fallback: title-only (OL + GB) якщо досі порожньо */
    if (!candidates.length && title) {
      // OL title-only
      try {
        const u = new URL('https://openlibrary.org/search.json');
        u.searchParams.set('title', title);
        u.searchParams.set('limit', '1');
        const r = await fetchWithTimeout(u.toString(), 9000);
        if (r.ok) {
          const j: any = await r.json();
          const d = j?.docs?.[0];
          if (d) {
            if (d.cover_i) {
              pushUnique(candidates, {
                url: `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg`,
                source: 'openlibrary:title'
              });
            } else if (Array.isArray(d.isbn) && d.isbn[0]) {
              pushUnique(candidates, {
                url: `https://covers.openlibrary.org/b/isbn/${encodeURIComponent(d.isbn[0])}-L.jpg`,
                source: 'openlibrary:title:isbn'
              });
            }
          }
        }
      } catch {}

      // GB title-only
      try {
        const u = new URL('https://www.googleapis.com/books/v1/volumes');
        u.searchParams.set('q', `intitle:${title}`);
        u.searchParams.set('maxResults', '1');

        const r = await fetchWithTimeout(u.toString(), 9000);
        if (r.ok) {
          const j: any = await r.json();
          const item = j?.items?.[0];
          const v = item?.volumeInfo;
          const img = v?.imageLinks?.thumbnail || v?.imageLinks?.smallThumbnail || null;
          if (img) {
            pushUnique(candidates, { url: String(img).replace('http://', 'https://'), source: 'google:title' });
          } else if (item?.id) {
            const contentUrl = `https://books.google.com/books/content?id=${encodeURIComponent(item.id)}&printsec=frontcover&img=1&zoom=1&source=gbs_api`;
            pushUnique(candidates, { url: contentUrl, source: 'google:title:content' });
          }
        }
      } catch {}
    }

    /* 6) (+C++) Yakaboo: пошук з User-Agent, щоб не блокував */
if (!candidates.length && title) {
  try {
    const yUrl = `https://www.yakaboo.ua/ua/search/?q=${encodeURIComponent(
      author ? `${title} ${author}` : title
    )}`;
    const r = await fetchWithTimeout(yUrl, 9000);
    if (r.ok) {
      const html = await r.text();
      // шукаємо будь-яке посилання на static.yakaboo.ua/media/catalog/product
      const m = html.match(/https:\/\/static\.yakaboo\.ua\/media\/catalog\/product\/[^"']+\.jpg/i);
      if (m && m[0]) {
        pushUnique(candidates, { url: m[0], source: 'yakaboo:search' });
      }
    } else {
      // резерв — спробуємо як браузер
      const r2 = await fetch(yUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36'
        }
      });
      if (r2.ok) {
        const html = await r2.text();
        const m = html.match(/https:\/\/static\.yakaboo\.ua\/media\/catalog\/product\/[^"']+\.jpg/i);
        if (m && m[0]) {
          pushUnique(candidates, { url: m[0], source: 'yakaboo:search:ua' });
        }
      }
    }
  } catch {}
}


    /* обираємо першу робочу URL */
    for (const c of candidates) {
      if (await headOk(c.url)) {
        return res.json({ url: c.url, source: c.source });
      }
    }

    return res.json({ url: null, source: null });
  } catch (e) {
    console.error('external cover error:', e);
    return res.status(500).json({ url: null, source: null, error: 'external cover failed' });
  }
});

export default router;
