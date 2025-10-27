-- Add optional cover_url column if missing
PRAGMA foreign_keys=off;
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS _books_tmp_schema_check (id INTEGER);
-- Check if column exists
-- SQLite doesn't support conditional add easily; we recreate when missing.
-- But safer: attempt to add column in a try block is not supported either.
-- Use pragma table_info to decide in app; here simply try ALTER and ignore errors.
-- The app will run all .sql scripts; this ALTER will succeed only once.
ALTER TABLE books ADD COLUMN cover_url TEXT;
COMMIT;
PRAGMA foreign_keys=on;
