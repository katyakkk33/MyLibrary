import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const DB_FILE = process.env.DB_FILE || path.resolve(__dirname, '..', 'data', 'books.db');
const db = new Database(DB_FILE);

// Безпечні pragma
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Прибираємо з SQL усі транзакційні директиви, які ламають вкладення
function stripTxn(sql: string): string {
  // Видаляємо BEGIN, BEGIN TRANSACTION, COMMIT, END, ROLLBACK — поодинці на рядок
  const re = /^(?:\s*(?:BEGIN(?:\s+TRANSACTION)?|COMMIT|END|ROLLBACK)\s*;?\s*)$/gmi;
  return sql.replace(re, '').trim();
}

export function runMigrations() {
  const migDir = path.resolve(__dirname, '..', 'migrations', 'sqlite');
  if (!fs.existsSync(migDir)) return;

  // Трекер застосованих міграцій
  db.exec(`CREATE TABLE IF NOT EXISTS _migrations (
    id TEXT PRIMARY KEY,
    applied_at TEXT DEFAULT (datetime('now'))
  )`);

  const files = fs.readdirSync(migDir)
    .filter(f => f.toLowerCase().endsWith('.sql'))
    .sort();

  for (const file of files) {
    const id = file;
    const already = db.prepare('SELECT 1 FROM _migrations WHERE id=?').get(id);
    if (already) continue;

    // Читаємо та «очищаємо» SQL від транзакцій
    const raw = fs.readFileSync(path.join(migDir, file), 'utf-8');
    const sql = stripTxn(raw);

    try {
      // Один сейвпоінт на файл
      db.exec('SAVEPOINT mig_apply');
      if (sql) db.exec(sql);
      db.prepare('INSERT INTO _migrations (id) VALUES (?)').run(id);
      db.exec('RELEASE mig_apply');
    } catch (e) {
      // Повертаємося до сейвпоінта, потім звільняємо його, щоб не тримати «вікно»
      try { db.exec('ROLLBACK TO mig_apply'); } catch {}
      try { db.exec('RELEASE mig_apply'); } catch {}
      // Додамо зрозуміліший меседж у лог
      const msg = e instanceof Error ? e.message : String(e);
      throw new Error(`Migration failed in ${file}: ${msg}`);
    }
  }
}

type Row = Record<string, unknown>;

export function all<T = Row>(sql: string, params: any[] = []): T[] {
  return db.prepare(sql).all(...params) as unknown as T[];
}

export function get<T = Row>(sql: string, params: any[] = []): T | undefined {
  return db.prepare(sql).get(...params) as unknown as (T | undefined);
}

export function run(sql: string, params: any[] = []) {
  const info = db.prepare(sql).run(...params);
  return { changes: info.changes, lastInsertRowid: Number(info.lastInsertRowid) };
}

export default db;
