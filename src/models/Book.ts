export interface Book {
  id?: number;
  tytul: string;             // title
  autor: string;             // author
  kilkist_storinyok?: number; // pages
  status: 'PROCHYTANA' | 'PLANUYU';
  data_dodania?: string;     // ISO
  isbn?: string | null;
  cover_url?: string | null;
  description?: string | null;
  year_published?: number | null;
  genre?: string | null;
}
export type NewBook = Omit<Book, 'id' | 'data_dodania'>;
