// Daily steps (scoped to authenticated user). One row per user per date.
import { Router } from 'express';
import { db, genId } from '../db.js';
import { requireAuth } from '../auth.js';
import { wrap } from './_helpers.js';

const router = Router();
router.use(requireAuth);

router.get('/', wrap((req, res) => {
  const { from, to } = req.query;
  if (from && to) {
    const rows = db.prepare('select * from daily_steps where user_id = ? and log_date >= ? and log_date <= ? order by log_date asc').all(req.userId, String(from), String(to));
    return res.json(rows);
  }
  const date = req.query.date;
  if (date) {
    const row = db.prepare('select * from daily_steps where user_id = ? and log_date = ?').get(req.userId, String(date));
    return res.json(row ?? null);
  }
  return res.json([]);
}));

// Upsert by (user_id, log_date).
router.put('/', wrap((req, res) => {
  const b = req.body || {};
  const date = b.log_date;
  if (!date) return res.status(400).json({ error: 'log_date is required.' });
  if (!('step_count' in b)) return res.status(400).json({ error: 'step_count is required.' });

  const existing = db.prepare('select id from daily_steps where user_id = ? and log_date = ?').get(req.userId, String(date));
  if (existing) {
    db.prepare('update daily_steps set step_count = ? where id = ?').run(b.step_count, existing.id);
    const row = db.prepare('select * from daily_steps where id = ?').get(existing.id);
    return res.json(row);
  }
  const id = genId('ds_');
  db.prepare('insert into daily_steps (id, user_id, step_count, log_date) values (?,?,?,?)')
    .run(id, req.userId, b.step_count, String(date));
  const row = db.prepare('select * from daily_steps where id = ?').get(id);
  return res.status(201).json(row);
}));

export default router;
