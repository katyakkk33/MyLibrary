ALTER TABLE books ADD COLUMN opis_67664 TEXT;

-- Note: some older/legacy databases might have had a `description` column.
-- This project schema (V1) does not include it, so referencing it here would
-- break migrations on fresh installs. The API still reads legacy values via
-- fallback mapping when present.
