// scripts/addColumns.js
const path = require('path');
const Database = require('better-sqlite3');

const dbFile = path.resolve(__dirname, '..', 'data', 'books.db');
const db = new Database(dbFile);

function hasColumn(name) {
  const cols = db.prepare("PRAGMA table_info(books)").all();
  return cols.some(c => c.name === name);
}

db.pragma('foreign_keys = OFF');

if (!hasColumn('isbn'))        db.exec("ALTER TABLE books ADD COLUMN isbn TEXT");
if (!hasColumn('cover_url'))   db.exec("ALTER TABLE books ADD COLUMN cover_url TEXT");
if (!hasColumn('description')) db.exec("ALTER TABLE books ADD COLUMN description TEXT");

db.pragma('foreign_keys = ON');

console.log('✅ OK: columns ensured.');
