// Sleep logs (scoped to authenticated user).
import { Router } from 'express';
import { db, genId } from '../db.js';
import { requireAuth } from '../auth.js';
import { wrap } from './_helpers.js';

const router = Router();
router.use(requireAuth);

router.post('/', wrap((req, res) => {
  const b = req.body || {};
  const id = genId('sl_');
  db.prepare('insert into sleep_logs (id, user_id, bedtime, wake_time, duration_minutes, sleep_quality, notes) values (?,?,?,?,?,?,?)')
    .run(id, req.userId, b.bedtime ?? '', b.wake_time ?? '', b.duration_minutes ?? 0, b.sleep_quality ?? null, b.notes ?? null);
  const row = db.prepare('select * from sleep_logs where id = ?').get(id);
  return res.status(201).json(row);
}));

router.get('/', wrap((req, res) => {
  const lim = Math.min(parseInt(req.query.limit ?? '60', 10) || 60, 500);
  const rows = db.prepare('select * from sleep_logs where user_id = ? order by created_at desc, bedtime desc limit ?').all(req.userId, lim);
  return res.json(rows);
}));

router.put('/:id', wrap((req, res) => {
  const b = req.body || {};
  const allowed = ['bedtime', 'wake_time', 'duration_minutes', 'sleep_quality', 'notes'];
  const sets = [];
  const params = { id: req.params.id, userId: req.userId };
  for (const k of allowed) {
    if (Object.prototype.hasOwnProperty.call(b, k)) { sets.push(`${k} = @${k}`); params[k] = b[k] ?? null; }
  }
  if (sets.length === 0) return res.status(400).json({ error: 'Nothing to update.' });
  const info = db.prepare(`update sleep_logs set ${sets.join(', ')} where id = @id and user_id = @userId`).run(params);
  if (info.changes === 0) return res.status(404).json({ error: 'Log not found.' });
  const row = db.prepare('select * from sleep_logs where id = ?').get(req.params.id);
  return res.json(row);
}));

router.delete('/:id', wrap((req, res) => {
  const info = db.prepare('delete from sleep_logs where id = ? and user_id = ?').run(req.params.id, req.userId);
  if (info.changes === 0) return res.status(404).json({ error: 'Log not found.' });
  return res.status(204).end();
}));

export default router;
