// One-shot seed script: inits schema, inserts reference foods/exercises/workouts
// (skip already-present rows by name), and creates a demo admin user.
// Safe to run repeatedly.

import { db, initSchema, genId } from './db.js';
import { hashPassword } from './auth.js';
import { FOODS, EXERCISES, WORKOUTS, ADMIN } from './seed-data.js';
import crypto from 'crypto';

// Deterministic UUID-ish id from a name (stable across re-runs).
function stableId(name) {
  const h = crypto.createHash('sha256').update(name).digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
}

function seedFoods() {
  const has = db.prepare('select 1 from food_items where name = ?');
  const hasFn = (name) => has.get(name);
  const ins = db.prepare(`insert or ignore into food_items
    (id, name, category, serving_unit, serving_size, calories, protein_g, carbs_g, fat_g, fiber_g,
     is_vegetarian, contains_egg, is_vegan, contains_dairy, contains_peanuts, contains_gluten, contains_soy, contains_seafood, description)
    values (@id, @name, @category, @serving_unit, @serving_size, @calories, @protein_g, @carbs_g, @fat_g, @fiber_g,
     @is_vegetarian, @contains_egg, @is_vegan, @contains_dairy, @contains_peanuts, @contains_gluten, @contains_soy, @contains_seafood, @description)`);
  const tx = db.transaction((items) => {
    let count = 0;
    for (const f of items) {
      if (hasFn(f.name)) continue;
      ins.run({ id: stableId('food:' + f.name), ...f });
      count++;
    }
    return count;
  });
  return tx(FOODS);
}

function seedExercises() {
  const has = db.prepare('select 1 from exercises where name = ?');
  const hasFn = (name) => has.get(name);
  const ins = db.prepare(`insert or ignore into exercises
    (id, name, category, muscle_group, difficulty, equipment, instructions, duration_minutes, estimated_calories)
    values (@id, @name, @category, @muscle_group, @difficulty, @equipment, @instructions, @duration_minutes, @estimated_calories)`);
  const tx = db.transaction((items) => {
    let count = 0;
    for (const e of items) {
      if (hasFn(e.name)) continue;
      ins.run({ id: stableId('exercise:' + e.name), ...e });
      count++;
    }
    return count;
  });
  return tx(EXERCISES);
}

function seedWorkouts() {
  const exId = db.prepare('select id from exercises where name = ?');
  const hasWorkout = db.prepare('select 1 from workouts where name = ?');
  const hasWkFn = (name) => hasWorkout.get(name);
  const insWorkout = db.prepare(`insert or ignore into workouts
    (id, name, description, goal, difficulty, duration_minutes, workout_type)
    values (@id, @name, @description, @goal, @difficulty, @duration_minutes, @workout_type)`);
  const hasWe = db.prepare('select 1 from workout_exercises where workout_id = ? and exercise_id = ?');
  const hasWeFn = (wid, eid) => hasWe.get(wid, eid);
  const insWe = db.prepare(`insert or ignore into workout_exercises
    (id, workout_id, exercise_id, order_index, sets, reps, duration_seconds, rest_seconds)
    values (@id, @workout_id, @exercise_id, @order_index, @sets, @reps, @duration_seconds, @rest_seconds)`);

  const tx = db.transaction((items) => {
    let wCount = 0;
    let weCount = 0;
    for (const w of items) {
      if (hasWkFn(w.name)) continue;
      const wid = stableId('workout:' + w.name);
      insWorkout.run({ id: wid, name: w.name, description: w.description, goal: w.goal, difficulty: w.difficulty, duration_minutes: w.duration_minutes, workout_type: w.workout_type });
      wCount++;
      (w.exercises || []).forEach(([name, sets, reps, dur, rest], i) => {
        const ex = exId.get(name);
        if (!ex) return;
        const exercise_id = ex.id;
        if (hasWeFn(wid, exercise_id)) return;
        insWe.run({ id: stableId(`we:${w.name}:${name}`), workout_id: wid, exercise_id, order_index: i, sets, reps, duration_seconds: dur, rest_seconds: rest });
        weCount++;
      });
    }
    return { wCount, weCount };
  });
  return tx(WORKOUTS);
}

function seedAdmin() {
  const existing = db.prepare('select id from users where email = ?').get(ADMIN.email);
  if (existing) {
    db.prepare('update users set role = ?, full_name = ? where id = ?').run(ADMIN.role, ADMIN.full_name, existing.id);
    return existing.id;
  }
  const id = stableId('user:' + ADMIN.email);
  db.prepare(`insert into users (id, email, password_hash, full_name, role) values (?, ?, ?, ?, ?)`)
    .run(id, ADMIN.email, hashPassword(ADMIN.password), ADMIN.full_name, ADMIN.role);
  db.prepare(`insert into profiles (id, full_name) values (?, ?)`).run(id, ADMIN.full_name);
  return id;
}

export function runSeed() {
  initSchema();
  const foods = seedFoods();
  const ex = seedExercises();
  const wk = seedWorkouts();
  const adminId = seedAdmin();
  return { foods, exercises: ex, workouts: wk.weCount, workoutsCreated: wk.wCount, adminId };
}

// Run directly when executed (not imported).
const isMain = process.argv[1] && import.meta.url.endsWith('/seed.js');
if (import.meta.url === `file://${process.argv[1]}`) {
  const r = runSeed();
  console.log('Seed complete:', r);
  console.log('Demo admin login:', ADMIN.email, '/', ADMIN.password);
}
