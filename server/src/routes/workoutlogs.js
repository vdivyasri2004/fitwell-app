// Workout logs (scoped to authenticated user). Includes a nested `workouts`
// object matching the mobile WorkoutLog type.
import { Router } from 'express';
import { db, genId } from '../db.js';
import { requireAuth } from '../auth.js';
import { wrap } from './_helpers.js';

const router = Router();
router.use(requireAuth);

router.post('/', wrap((req, res) => {
  const b = req.body || {};
  const id = genId('wl_');
  db.prepare('insert into workout_logs (id, user_id, workout_id, duration_minutes, calories_burned, completed_at, notes) values (?,?,?,?,?,?,?)')
    .run(id, req.userId, b.workout_id ?? null, b.duration_minutes ?? 0, b.calories_burned ?? 0, b.completed_at ?? new Date().toISOString(), b.notes ?? null);
  const row = db.prepare(`select wl.*, w.id as "workouts:id", w.name as "workouts:name",
    w.description as "workouts:description", w.goal as "workouts:goal",
    w.difficulty as "workouts:difficulty", w.duration_minutes as "workouts:duration_minutes",
    w.workout_type as "workouts:workout_type"
    from workout_logs wl left join workouts w on w.id = wl.workout_id where wl.id = ?`).get(id);
  return res.status(201).json(toJoined(row));
}));

function toJoined(r) {
  if (!r) return null;
  const { 'workouts:id': wid, 'workouts:name': wname, 'workouts:description': wdesc,
    'workouts:goal': wgoal, 'workouts:difficulty': wdiff, 'workouts:duration_minutes': wdur,
    'workouts:workout_type': wtype, ...rest } = r;
  const workouts = wid ? { id: wid, name: wname, description: wdesc, goal: wgoal, difficulty: wdiff, duration_minutes: wdur, workout_type: wtype } : undefined;
  return { ...rest, workouts };
}

router.get('/', wrap((req, res) => {
  const { from, to, limit } = req.query;
  const lim = Math.min(parseInt(limit ?? '100', 10) || 100, 500);
  if (from && to) {
    const rows = db.prepare(`select wl.*, w.id as "workouts:id", w.name as "workouts:name",
      w.description as "workouts:description", w.goal as "workouts:goal", w.difficulty as "workouts:difficulty",
      w.duration_minutes as "workouts:duration_minutes", w.workout_type as "workouts:workout_type"
      from workout_logs wl left join workouts w on w.id = wl.workout_id
      where wl.user_id = ? and wl.completed_at >= ? and wl.completed_at <= ? order by wl.completed_at asc`).all(req.userId, String(from), String(to));
    return res.json(rows.map(toJoined));
  }
  const rows = db.prepare(`select wl.*, w.id as "workouts:id", w.name as "workouts:name",
    w.description as "workouts:description", w.goal as "workouts:goal", w.difficulty as "workouts:difficulty",
    w.duration_minutes as "workouts:duration_minutes", w.workout_type as "workouts:workout_type"
    from workout_logs wl left join workouts w on w.id = wl.workout_id
    where wl.user_id = ? order by wl.completed_at desc limit ?`).all(req.userId, lim);
  return res.json(rows.map(toJoined));
}));

export default router;
