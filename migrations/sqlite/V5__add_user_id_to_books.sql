ALTER TABLE books ADD COLUMN user_id INTEGER;

UPDATE books
SET user_id = 1
WHERE user_id IS NULL;
