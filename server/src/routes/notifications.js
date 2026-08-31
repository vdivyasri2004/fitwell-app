// Notification settings (scoped to authenticated user). One row per user.
import { Router } from 'express';
import { db, genId } from '../db.js';
import { requireAuth } from '../auth.js';
import { wrap, pick } from './_helpers.js';

const router = Router();
router.use(requireAuth);

const KEYS = ['water_reminder', 'water_time', 'meal_reminder', 'meal_time', 'workout_reminder',
  'workout_time', 'sleep_reminder', 'sleep_time', 'weekly_summary', 'weekly_summary_day', 'weekly_summary_time'];

function toRow(r) {
  if (!r) return null;
  const out = { ...r };
  for (const k of ['water_reminder', 'meal_reminder', 'workout_reminder', 'sleep_reminder', 'weekly_summary']) {
    out[k] = !!r[k];
  }
  return out;
}

router.get('/', wrap((req, res) => {
  const row = db.prepare('select * from notification_settings where user_id = ?').get(req.userId);
  return res.json(toRow(row) ?? null);
}));

router.put('/', wrap((req, res) => {
  const body = { ...req.body };
  const existing = db.prepare('select id from notification_settings where user_id = ?').get(req.userId);
  const fields = pick(body, KEYS);
  const booleans = ['water_reminder', 'meal_reminder', 'workout_reminder', 'sleep_reminder', 'weekly_summary'];

  if (!existing) {
    const id = genId('ns_');
    const keys = Object.keys(fields);
    const cols = ['id', 'user_id', ...keys].join(',');
    const vals = { id, userId: req.userId };
    for (const k of keys) { vals[k] = booleans.includes(k) ? (fields[k] ? 1 : 0) : fields[k]; }
    const placeholders = ['@id', '@userId', ...keys.map((k) => '@' + k)].join(',');
    db.prepare(`insert into notification_settings (${cols}) values (${placeholders})`).run(vals);
    const row = db.prepare('select * from notification_settings where user_id = ?').get(req.userId);
    return res.json(toRow(row));
  }

  const sets = [];
  const vals = { userId: req.userId };
  for (const k of Object.keys(fields)) {
    vals[k] = booleans.includes(k) ? (fields[k] ? 1 : 0) : fields[k];
    sets.push(`${k} = @${k}`);
  }
  if (sets.length) db.prepare(`update notification_settings set ${sets.join(', ')} where user_id = @userId`).run(vals);
  const row = db.prepare('select * from notification_settings where user_id = ?').get(req.userId);
  return res.json(toRow(row));
}));

export default router;
