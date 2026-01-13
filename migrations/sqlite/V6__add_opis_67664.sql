ALTER TABLE books ADD COLUMN opis_67664 TEXT;

-- переносимо старі описи (якщо колонка description вже існує у старих БД)
UPDATE books
SET opis_67664 = description
WHERE opis_67664 IS NULL AND description IS NOT NULL;
