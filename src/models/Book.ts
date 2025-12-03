export interface Book {
  id?: number;
  tytul: string;              // title
  autor: string;              // author
  kilkist_storinyok?: number; // pages
  status: 'PROCHYTANA' | 'PLANUYU';
  data_dodania?: string;      // ISO
  isbn?: string | null;
  cover_url?: string | null;
  description?: string | null;
  user_id?: number;           // власник книги
}

export type NewBook = Omit<Book, 'id' | 'data_dodania' | 'user_id'>;
