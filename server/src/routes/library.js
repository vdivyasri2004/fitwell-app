// Public reference data: exercises and workouts (read-only). This implements:
//   GET /api/exercises
//   GET /api/workouts?goal=&limit=
//   GET /api/workouts/:id
//   GET /api/workouts/:id/exercises   (workout_exercises joined with exercises)
import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';
import { wrap } from './_helpers.js';

const router = Router();
router.use(requireAuth);

router.get('/exercises', wrap((req, res) => {
  const lim = Math.min(parseInt(req.query.limit ?? '300', 10) || 300, 500);
  const rows = db.prepare('select * from exercises order by name asc limit ?').all(lim);
  return res.json(rows);
}));

router.get('/workouts', wrap((req, res) => {
  const { goal, limit } = req.query;
  const lim = Math.min(parseInt(limit ?? '100', 10) || 100, 500);
  let rows;
  if (goal) {
    rows = db.prepare('select * from workouts where goal = ? order by difficulty asc limit ?').all(String(goal), lim);
  } else {
    rows = db.prepare('select * from workouts order by name asc limit ?').all(lim);
  }
  // Fallback: if goal filter returned nothing, return a general set so the app
  // always has something to show.
  if (goal && rows.length === 0) {
    rows = db.prepare('select * from workouts order by name asc limit ?').all(lim);
  }
  return res.json(rows);
}));

router.get('/workouts/:id', wrap((req, res) => {
  const row = db.prepare('select * from workouts where id = ?').get(req.params.id);
  return res.json(row ?? null);
}));

router.get('/workouts/:id/exercises', wrap((req, res) => {
  const rows = db.prepare(`select we.*, e.id as "exercises:id", e.name as "exercises:name",
    e.category as "exercises:category", e.muscle_group as "exercises:muscle_group",
    e.difficulty as "exercises:difficulty", e.equipment as "exercises:equipment",
    e.instructions as "exercises:instructions", e.duration_minutes as "exercises:duration_minutes",
    e.estimated_calories as "exercises:estimated_calories"
    from workout_exercises we
    join exercises e on e.id = we.exercise_id
    where we.workout_id = ? order by we.order_index asc`).all(req.params.id);

  const out = rows.map((r) => {
    const { 'exercises:id': eid, 'exercises:name': ename, 'exercises:category': ecat,
      'exercises:muscle_group': emg, 'exercises:difficulty': ediff, 'exercises:equipment': eeq,
      'exercises:instructions': eins, 'exercises:duration_minutes': edur, 'exercises:estimated_calories': ecal,
      ...rest } = r;
    return { ...rest, exercises: { id: eid, name: ename, category: ecat, muscle_group: emg, difficulty: ediff, equipment: eeq, instructions: eins, duration_minutes: edur, estimated_calories: ecal } };
  });
  return res.json(out);
}));

export default router;
