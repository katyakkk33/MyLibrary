import { Router } from 'express';
import { all } from '../db';

const router = Router();

router.get('/db', (_req, res) => {
  try {
    const tables = all<{ name: string }>(`SELECT name FROM sqlite_master
      WHERE type='table' AND name NOT LIKE 'sqlite_%'`);
    const details = tables.map(t => {
      const cols = all<{ name: string, type: string }>(`PRAGMA table_info("${t.name.replace(/"/g,'""')}")`)
        .map(c => ({ name: c.name, type: (c as any).type }));
      const cnt = all<{ c: number }>(`SELECT COUNT(*) AS c FROM "${t.name.replace(/"/g,'""')}"`)[0]?.c ?? 0;
      return { table: t.name, count: cnt, columns: cols };
    });
    res.json({ tables: details });
  } catch (e: any) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

export default router;
