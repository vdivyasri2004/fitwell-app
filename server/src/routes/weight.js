// Weight logs (scoped to authenticated user).
import { Router } from 'express';
import { db, genId } from '../db.js';
import { requireAuth } from '../auth.js';
import { wrap } from './_helpers.js';

const router = Router();
router.use(requireAuth);

router.post('/', wrap((req, res) => {
  const b = req.body || {};
  const id = genId('wt_');
  db.prepare('insert into weight_logs (id, user_id, weight_kg, logged_at) values (?,?,?,?)')
    .run(id, req.userId, b.weight_kg ?? 0, b.logged_at ?? new Date().toISOString());
  const row = db.prepare('select * from weight_logs where id = ?').get(id);
  return res.status(201).json(row);
}));

router.get('/', wrap((req, res) => {
  const { from, to, limit } = req.query;
  const lim = Math.min(parseInt(limit ?? '100', 10) || 100, 500);
  if (from && to) {
    const rows = db.prepare('select * from weight_logs where user_id = ? and logged_at >= ? and logged_at <= ? order by logged_at asc').all(req.userId, String(from), String(to));
    return res.json(rows);
  }
  const rows = db.prepare('select * from weight_logs where user_id = ? order by logged_at desc limit ?').all(req.userId, lim);
  return res.json(rows);
}));

router.get('/recent', wrap((req, res) => {
  const row = db.prepare('select * from weight_logs where user_id = ? order by logged_at desc limit 1').get(req.userId);
  return res.json(row ?? null);
}));

router.put('/:id', wrap((req, res) => {
  const b = req.body || {};
  if (!('weight_kg' in b)) return res.status(400).json({ error: 'weight_kg is required.' });
  const info = db.prepare('update weight_logs set weight_kg = ? where id = ? and user_id = ?').run(b.weight_kg, req.params.id, req.userId);
  if (info.changes === 0) return res.status(404).json({ error: 'Log not found.' });
  const row = db.prepare('select * from weight_logs where id = ?').get(req.params.id);
  return res.json(row);
}));

router.delete('/:id', wrap((req, res) => {
  const info = db.prepare('delete from weight_logs where id = ? and user_id = ?').run(req.params.id, req.userId);
  if (info.changes === 0) return res.status(404).json({ error: 'Log not found.' });
  return res.status(204).end();
}));

export default router;
