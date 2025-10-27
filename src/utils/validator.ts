import { NewBook } from '../models/Book';

const normalize = (s: unknown) => String(s ?? '').trim();
const toInt = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : undefined;
};

export function normalizeBookPayload(body: any): NewBook {
  const statusRaw = normalize(body.status).toUpperCase();
  const status = statusRaw === 'PROCHYTANA' ? 'PROCHYTANA' : 'PLANUYU';
  const pages = toInt(body.kilkist_storinyok);

  return {
    tytul: normalize(body.tytul),
    autor: normalize(body.autor),
    kilkist_storinyok: pages,
    status,
    isbn: body.isbn ? normalize(body.isbn) : undefined,
    cover_url: body.cover_url ? normalize(body.cover_url) : undefined,
    description: body.description ? normalize(body.description) : undefined,
  };
}

export function validateBookData(b: NewBook): string | null {
  if (!b.tytul) return 'Поле "tytul" обов’язкове.';
  if (!b.autor) return 'Поле "autor" обов’язкове.';
  if (b.kilkist_storinyok !== undefined && (!Number.isInteger(b.kilkist_storinyok) || b.kilkist_storinyok! < 0)) {
    return 'Поле "kilkist_storinyok" має бути невід’ємним цілим.';
  }
  if (b.status !== 'PROCHYTANA' && b.status !== 'PLANUYU') {
    return 'Поле "status" має бути PROCHYTANA або PLANUYU.';
  }
  return null;
}
