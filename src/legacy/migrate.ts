import { all, get, run } from '../db';

// ширший набір можливих назв колонок
const TITLE_CANDIDATES  = ['tytul','title','name','nazva','назва','book_title','book','bookname','book_name'];
const AUTHOR_CANDIDATES = ['autor','author','avtor','writer','book_author','автор','author_name'];
const PAGES_CANDIDATES  = ['kilkist_storinyok','pages','page_count','num_pages','сторінок','pages_count'];
const STATUS_CANDIDATES = ['status','state','статус'];
const ISBN_CANDIDATES   = ['isbn','isbn13','isbn_13','isbn10','isbn_10'];
const COVER_CANDIDATES  = ['cover_url','cover','image','img','poster','thumbnail','coverurl','cover_url_l'];
const DESC_CANDIDATES   = ['description','desc','about','summary','annotation','anotation','опис','summary_text'];

type TableInfo = { name: string };
type ColumnInfo = { name: string };

function pick(colnames: string[], candidates: string[]): string | null {
  const lower = colnames.map(c => c.toLowerCase());
  for (const c of candidates) {
    const i = lower.indexOf(c);
    if (i >= 0) return colnames[i];
  }
  return null;
}

function normalizeStatus(raw: any): 'PROCHYTANA' | 'PLANUYU' {
  const s = String(raw ?? '').toLowerCase();
  if (['read','done','прочитано','прочитана','finished','готово','прочитано'].some(k => s.includes(k))) return 'PROCHYTANA';
  return 'PLANUYU';
}

export function migrateLegacyIfNeeded() {
  const cnt = get<{ c: number }>('SELECT COUNT(*) AS c FROM books');
  if ((cnt?.c ?? 0) > 0) {
    console.log(`Legacy migrate: books already has ${cnt?.c} rows — skip.`);
    return;
  }

  const tables = all<TableInfo>(`SELECT name FROM sqlite_master
    WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT IN ('_migrations','books')`);

  if (!tables.length) {
    console.log('Legacy migrate: no user tables found.');
    return;
  }

  // оцінюємо всі таблиці та вибираємо найкращу за кількістю знайдених колонок
  type Candidate = { tname: string, cols: string[], score: number,
    titleCol: string|null, authorCol: string|null, pagesCol: string|null,
    statusCol: string|null, isbnCol: string|null, coverCol: string|null, descCol: string|null };

  const cands: Candidate[] = [];
  for (const t of tables) {
    const tname = t.name;
    const cols = all<ColumnInfo>(`PRAGMA table_info("${tname.replace(/"/g,'""')}")`).map(c => c.name);
    if (!cols.length) continue;

    const titleCol  = pick(cols, TITLE_CANDIDATES);
    const authorCol = pick(cols, AUTHOR_CANDIDATES);
    if (!titleCol || !authorCol) continue;

    const pagesCol  = pick(cols, PAGES_CANDIDATES);
    const statusCol = pick(cols, STATUS_CANDIDATES);
    const isbnCol   = pick(cols, ISBN_CANDIDATES);
    const coverCol  = pick(cols, COVER_CANDIDATES);
    const descCol   = pick(cols, DESC_CANDIDATES);

    const score = 10 // базовий за наявність title+author
      + (pagesCol?1:0) + (statusCol?1:0) + (isbnCol?1:0) + (coverCol?1:0) + (descCol?1:0);

    cands.push({ tname, cols, score, titleCol, authorCol, pagesCol, statusCol, isbnCol, coverCol, descCol });
  }

  if (!cands.length) {
    console.log('Legacy migrate: no legacy tables with (title+author) found — nothing to import.');
    return;
  }

  cands.sort((a,b)=>b.score-a.score);
  const best = cands[0];
  console.log('Legacy migrate: best table candidate ->', {
    table: best.tname,
    title: best.titleCol, author: best.authorCol,
    pages: best.pagesCol, status: best.statusCol,
    isbn: best.isbnCol, cover: best.coverCol, desc: best.descCol
  });

  // читаємо всі рядки з найкращої таблиці
  const safeName = `"${best.tname.replace(/"/g,'""')}"`;
  const select = [
    `"${(best.titleCol as string).replace(/"/g,'""')}" AS c0`,
    `"${(best.authorCol as string).replace(/"/g,'""')}" AS c1`,
    best.pagesCol  ? `"${best.pagesCol.replace(/"/g,'""')}" AS c2`  : 'NULL AS c2',
    best.statusCol ? `"${best.statusCol.replace(/"/g,'""')}" AS c3` : 'NULL AS c3',
    best.isbnCol   ? `"${best.isbnCol.replace(/"/g,'""')}" AS c4`   : 'NULL AS c4',
    best.coverCol  ? `"${best.coverCol.replace(/"/g,'""')}" AS c5`  : 'NULL AS c5',
    best.descCol   ? `"${best.descCol.replace(/"/g,'""')}" AS c6`   : 'NULL AS c6',
  ].join(', ');

  const rows = all<Record<string, unknown>>(`SELECT ${select} FROM ${safeName}`);
  let imported = 0;
  for (const r of rows) {
    const tytul = String(r.c0 ?? '').trim();
    const autor = String(r.c1 ?? '').trim();
    if (!tytul || !autor) continue;

    const pages = r.c2 == null ? null : Number(r.c2) || null;
    const status = normalizeStatus(r.c3);
    const isbn = r.c4 ? String(r.c4) : null;
    const cover_url = r.c5 ? String(r.c5) : null;
    const description = r.c6 ? String(r.c6) : null;

    const exists = get('SELECT id FROM books WHERE tytul=? AND autor=?', [tytul, autor]);
    if (exists) continue;

    run(
      `INSERT INTO books (tytul, autor, kilkist_storinyok, status, data_dodania, isbn, cover_url, description)
       VALUES (?, ?, ?, ?, datetime('now'), ?, ?, ?)`,
      [tytul, autor, pages, status, isbn, cover_url, description]
    );
    imported++;
  }

  console.log(`Legacy migrate: imported ${imported} rows from table "${best.tname}".`);
}
