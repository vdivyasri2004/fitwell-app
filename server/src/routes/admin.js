// Admin endpoints. All require a valid session AND the 'admin' role, which is
// verified server-side from the token (never trusted from the client).
import { Router } from 'express';
import { db, genId, mapFoodRow } from '../db.js';
import { requireAuth, requireAdmin } from '../auth.js';
import { wrap } from './_helpers.js';

const router = Router();
router.use(requireAuth, requireAdmin);

// ---- stats ---------------------------------------------------------------
router.get('/stats', wrap((req, res) => {
  const one = (sql) => db.prepare(sql).get().c;
  res.json({
    users: one('select count(*) as c from users'),
    foods: one('select count(*) as c from food_items'),
    exercises: one('select count(*) as c from exercises'),
    workouts: one('select count(*) as c from workouts'),
    food_logs: one('select count(*) as c from food_logs'),
    workout_logs: one('select count(*) as c from workout_logs'),
    admins: one("select count(*) as c from users where role = 'admin'"),
  });
}));

// ---- users ---------------------------------------------------------------
router.get('/users', wrap((req, res) => {
  const rows = db.prepare(`select u.id, u.email, u.role, u.created_at, u.full_name as u_full_name,
    p.full_name, p.age, p.gender, p.fitness_goal, p.dietary_preference, p.onboarded
    from users u left join profiles p on p.id = u.id order by u.created_at desc`).all();
  const out = rows.map((r) => ({
    id: r.id,
    full_name: r.full_name || r.u_full_name || '',
    email: r.email,
    age: r.age ?? null,
    gender: r.gender ?? '',
    fitness_goal: r.fitness_goal ?? '',
    dietary_preference: r.dietary_preference ?? '',
    onboarded: !!r.onboarded,
    created_at: r.created_at,
    is_admin: r.role === 'admin',
  }));
  res.json(out);
}));

router.put('/users/:id/role', wrap((req, res) => {
  const { role } = req.body || {};
  if (role !== 'user' && role !== 'admin') return res.status(400).json({ error: 'Role must be user or admin.' });
  const info = db.prepare('update users set role = ? where id = ?').run(role, req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'User not found.' });
  res.json({ ok: true });
}));

router.delete('/users/:id', wrap((req, res) => {
  if (req.params.id === req.userId) return res.status(400).json({ error: 'You cannot delete your own account.' });
  const info = db.prepare('delete from users where id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'User not found.' });
  res.json({ ok: true });
}));

// ---- foods ---------------------------------------------------------------
router.get('/foods', wrap((req, res) => {
  const term = String(req.query.term ?? '').trim();
  let rows;
  if (term) {
    rows = db.prepare('select * from food_items where name like ? order by name asc').all(`%${term}%`);
  } else {
    rows = db.prepare('select * from food_items order by name asc').all();
  }
  res.json(rows.map(mapFoodRow));
}));

router.post('/foods', wrap((req, res) => {
  const b = req.body || {};
  const existing = b.id ? db.prepare('select id from food_items where id = ?').get(b.id) : null;
  const food = {
    id: existing ? b.id : (b.id || genId('f_')),
    name: b.name ?? '', category: b.category ?? 'General', serving_unit: b.serving_unit ?? 'serving',
    serving_size: b.serving_size ?? 100, calories: b.calories ?? 0, protein_g: b.protein_g ?? 0,
    carbs_g: b.carbs_g ?? 0, fat_g: b.fat_g ?? 0, fiber_g: b.fiber_g ?? 0,
    is_vegetarian: b.is_vegetarian ? 1 : 0, contains_egg: b.contains_egg ? 1 : 0,
    is_vegan: b.is_vegan ? 1 : 0, contains_dairy: b.contains_dairy ? 1 : 0,
    contains_peanuts: b.contains_peanuts ? 1 : 0, contains_gluten: b.contains_gluten ? 1 : 0,
    contains_soy: b.contains_soy ? 1 : 0, contains_seafood: b.contains_seafood ? 1 : 0,
    description: b.description ?? '',
  };
  const cols = Object.keys(food).join(',');
  const ph = Object.keys(food).map((k) => '@' + k).join(',');
  db.prepare(`insert into food_items (${cols}) values (${ph})
    on conflict(id) do update set
      name=excluded.name, category=excluded.category, serving_unit=excluded.serving_unit,
      serving_size=excluded.serving_size, calories=excluded.calories, protein_g=excluded.protein_g,
      carbs_g=excluded.carbs_g, fat_g=excluded.fat_g, fiber_g=excluded.fiber_g,
      is_vegetarian=excluded.is_vegetarian, contains_egg=excluded.contains_egg,
      is_vegan=excluded.is_vegan, contains_dairy=excluded.contains_dairy,
      contains_peanuts=excluded.contains_peanuts, contains_gluten=excluded.contains_gluten,
      contains_soy=excluded.contains_soy, contains_seafood=excluded.contains_seafood,
      description=excluded.description`).run(food);
  const row = db.prepare('select * from food_items where id = ?').get(food.id);
  res.status(existing ? 200 : 201).json(mapFoodRow(row));
}));

router.delete('/foods/:id', wrap((req, res) => {
  const info = db.prepare('delete from food_items where id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Food not found.' });
  res.json({ ok: true });
}));

// ---- exercises -----------------------------------------------------------
router.get('/exercises', wrap((req, res) => {
  res.json(db.prepare('select * from exercises order by name asc').all());
}));

router.post('/exercises', wrap((req, res) => {
  const b = req.body || {};
  const existing = b.id ? db.prepare('select id from exercises where id = ?').get(b.id) : null;
  const ex = {
    id: existing ? b.id : (b.id || genId('e_')),
    name: b.name ?? '', category: b.category ?? 'General', muscle_group: b.muscle_group ?? 'Full body',
    difficulty: b.difficulty ?? 'beginner', equipment: b.equipment ?? 'None',
    instructions: b.instructions ?? '', duration_minutes: b.duration_minutes ?? 0,
    estimated_calories: b.estimated_calories ?? 0,
  };
  const cols = Object.keys(ex).join(',');
  const ph = Object.keys(ex).map((k) => '@' + k).join(',');
  db.prepare(`insert into exercises (${cols}) values (${ph})
    on conflict(id) do update set name=excluded.name, category=excluded.category,
      muscle_group=excluded.muscle_group, difficulty=excluded.difficulty, equipment=excluded.equipment,
      instructions=excluded.instructions, duration_minutes=excluded.duration_minutes,
      estimated_calories=excluded.estimated_calories`).run(ex);
  const row = db.prepare('select * from exercises where id = ?').get(ex.id);
  res.status(existing ? 200 : 201).json(row);
}));

router.delete('/exercises/:id', wrap((req, res) => {
  const info = db.prepare('delete from exercises where id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Exercise not found.' });
  res.json({ ok: true });
}));

// ---- workouts ------------------------------------------------------------
router.get('/workouts', wrap((req, res) => {
  res.json(db.prepare('select * from workouts order by name asc').all());
}));

router.post('/workouts', wrap((req, res) => {
  const b = req.body || {};
  const existing = b.id ? db.prepare('select id from workouts where id = ?').get(b.id) : null;
  const wk = {
    id: existing ? b.id : (b.id || genId('wo_')),
    name: b.name ?? '', description: b.description ?? '', goal: b.goal ?? 'maintain',
    difficulty: b.difficulty ?? 'beginner', duration_minutes: b.duration_minutes ?? 0,
    workout_type: b.workout_type ?? 'General',
  };
  const cols = Object.keys(wk).join(',');
  const ph = Object.keys(wk).map((k) => '@' + k).join(',');
  db.prepare(`insert into workouts (${cols}) values (${ph})
    on conflict(id) do update set name=excluded.name, description=excluded.description,
      goal=excluded.goal, difficulty=excluded.difficulty, duration_minutes=excluded.duration_minutes,
      workout_type=excluded.workout_type`).run(wk);
  const row = db.prepare('select * from workouts where id = ?').get(wk.id);
  res.status(existing ? 200 : 201).json(row);
}));

router.delete('/workouts/:id', wrap((req, res) => {
  const info = db.prepare('delete from workouts where id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Workout not found.' });
  res.json({ ok: true });
}));

router.get('/workouts/:id/exercises', wrap((req, res) => {
  const rows = db.prepare(`select we.id, we.exercise_id, e.name, e.muscle_group,
    we.order_index, we.sets, we.reps, we.duration_seconds, we.rest_seconds
    from workout_exercises we join exercises e on e.id = we.exercise_id
    where we.workout_id = ? order by we.order_index asc`).all(req.params.id);
  res.json(rows);
}));

// Replace the exercise list of a workout: delete existing, re-insert given ones.
router.put('/workouts/:id/exercises', wrap((req, res) => {
  const b = req.body || {};
  const exercises = Array.isArray(b.exercises) ? b.exercises : [];
  const del = db.prepare('delete from workout_exercises where workout_id = ?').run(req.params.id);
  const ins = db.prepare('insert into workout_exercises (id, workout_id, exercise_id, order_index, sets, reps, duration_seconds, rest_seconds) values (?,?,?,?,?,?,?,?)');
  const tx = db.transaction((items) => {
    for (const it of items) {
      ins.run(genId('we_'), req.params.id, it.exercise_id, it.order_index ?? 0, it.sets ?? 3, it.reps ?? 10, it.duration_seconds ?? 0, it.rest_seconds ?? 60);
    }
  });
  tx(exercises);
  const rows = db.prepare(`select we.id, we.exercise_id, e.name, e.muscle_group,
    we.order_index, we.sets, we.reps, we.duration_seconds, we.rest_seconds
    from workout_exercises we join exercises e on e.id = we.exercise_id
    where we.workout_id = ? order by we.order_index asc`).all(req.params.id);
  res.json(rows);
}));

export default router;
