import fs from 'fs';
import path from 'path';
import { runMigrations, get, run } from './db';

type SeedBook = {
  tytul: string;
  autor: string;
  kilkist_storinyok?: number;
  status: 'PROCHYTANA' | 'PLANUYU';
  isbn?: string | null;
  cover_url?: string | null;
  description?: string | null;
};

function main() {
  runMigrations();
  const seedFile = path.resolve(__dirname, '..', 'seeds', 'seed.json');
  const raw = fs.readFileSync(seedFile, 'utf-8');
  const items: SeedBook[] = JSON.parse(raw);
  let created = 0, skipped = 0;
  for (const b of items) {
    const exists = get('SELECT id FROM books WHERE tytul=? AND autor=?', [b.tytul, b.autor]);
    if (exists) { skipped++; continue; }
    run(
      `INSERT INTO books (tytul, autor, kilkist_storinyok, status, data_dodania, isbn, cover_url, description)
       VALUES (?, ?, ?, ?, datetime('now'), ?, ?, ?)`,
      [b.tytul, b.autor, b.kilkist_storinyok ?? null, b.status, b.isbn ?? null, b.cover_url ?? null, b.description ?? null]
    );
    created++;
  }
  console.log(JSON.stringify({ created, skipped }));
}

main();
