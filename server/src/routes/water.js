// Water logs (scoped to authenticated user).
import { Router } from 'express';
import { db, genId } from '../db.js';
import { requireAuth } from '../auth.js';
import { wrap } from './_helpers.js';

const router = Router();
router.use(requireAuth);

router.post('/', wrap((req, res) => {
  const b = req.body || {};
  const id = genId('w_');
  db.prepare('insert into water_logs (id, user_id, amount_ml, drink_type, logged_at) values (?,?,?,?,?)')
    .run(id, req.userId, b.amount_ml ?? 0, b.drink_type ?? 'water', b.logged_at ?? new Date().toISOString());
  const row = db.prepare('select * from water_logs where id = ?').get(id);
  return res.status(201).json(row);
}));

router.get('/', wrap((req, res) => {
  const { from, to } = req.query;
  let rows;
  if (from && to) {
    rows = db.prepare('select * from water_logs where user_id = ? and logged_at >= ? and logged_at <= ? order by logged_at asc').all(req.userId, String(from), String(to));
  } else {
    rows = db.prepare('select * from water_logs where user_id = ? order by logged_at desc').all(req.userId);
  }
  return res.json(rows);
}));

router.delete('/:id', wrap((req, res) => {
  const info = db.prepare('delete from water_logs where id = ? and user_id = ?').run(req.params.id, req.userId);
  if (info.changes === 0) return res.status(404).json({ error: 'Log not found.' });
  return res.status(204).end();
}));

export default router;
