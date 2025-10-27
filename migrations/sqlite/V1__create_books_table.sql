CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tytul TEXT NOT NULL,
  autor TEXT NOT NULL,
  data_dodania TEXT NOT NULL DEFAULT (datetime('now')),
  kilkist_storinyok INTEGER NOT NULL CHECK (kilkist_storinyok > 0),
  status TEXT NOT NULL DEFAULT 'PLANUYU',
  CONSTRAINT books_unique UNIQUE (tytul, autor)
);
