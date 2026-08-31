// Profile endpoints. The authenticated user's id (from the token) always wins;
// any client-supplied user id is ignored. Mechanical field mapping for booleans
// and JSON (exclusions are stored as a JSON string).

import { Router } from 'express';
import { db, genId } from '../db.js';
import { requireAuth } from '../auth.js';
import { wrap, pick } from './_helpers.js';

const router = Router();
router.use(requireAuth);

const FIELD_KEYS = [
  'full_name', 'age', 'gender', 'height_cm', 'weight_kg', 'activity_level',
  'fitness_goal', 'dietary_preference', 'exclusions', 'preferred_workout_duration_minutes',
  'sleep_goal_minutes', 'calorie_target', 'protein_target', 'water_target_ml',
  'step_target', 'calorie_target_source', 'protein_target_source', 'water_target_source',
];

function rowToProfile(row) {
  if (!row) return null;
  let exclusions = row.exclusions;
  try { exclusions = JSON.parse(row.exclusions); } catch { exclusions = []; }
  return { ...row, exclusions, onboarded: !!row.onboarded };
}

router.get('/', wrap((req, res) => {
  const row = db.prepare('select * from profiles where id = ?').get(req.userId);
  return res.json(rowToProfile(row) ?? null);
}));

// Profile creation for onboarding. Registration already creates a minimal
// profile row, so this is an upsert (insert-or-update) keyed by user id.
router.post('/', wrap((req, res) => {
  const body = { ...req.body };
  const fields = pick(body, FIELD_KEYS);
  if (!fields.full_name) {
    const existing = db.prepare('select full_name from profiles where id = ?').get(req.userId);
    fields.full_name = body.full_name ?? existing?.full_name ?? '';
  }
  if (Object.keys(fields).length === 0) fields.full_name = body.full_name ?? '';
  // Exclusions must be stored as JSON text.
  const exclusions = JSON.stringify(Array.isArray(fields.exclusions) ? fields.exclusions : []);
  const onboarded = Object.prototype.hasOwnProperty.call(body, 'onboarded') ? (body.onboarded ? 1 : 0) : 1;
  delete fields.exclusions;
  delete fields.onboarded;

  const keys = Object.keys(fields);
  const allCols = keys.concat('exclusions', 'onboarded', 'id');
  const allPlaceholders = keys.map((k) => '@' + k).concat('@exclusions', '@onboarded', '@id');
  const vals = { ...fields, exclusions, onboarded, id: req.userId };
  const updates = keys.filter((k) => k !== 'full_name')
    .concat('exclusions', 'onboarded')
    .map((k) => `${k} = excluded.${k}`).join(', ');

  if (keys.length) {
    db.prepare(`insert into profiles (${allCols.join(', ')})
                values (${allPlaceholders.join(', ')})
                on conflict(id) do update set
                  full_name = excluded.full_name${updates ? ', ' + updates : ''}
                `).run(vals);
  } else {
    db.prepare('update profiles set exclusions = @exclusions, onboarded = @onboarded where id = @id')
      .run(vals);
  }

  const row = db.prepare('select * from profiles where id = ?').get(req.userId);
  return res.status(201).json(rowToProfile(row));
}));

router.put('/', wrap((req, res) => {
  const body = { ...req.body };
  const existing = db.prepare('select * from profiles where id = ?').get(req.userId);
  if (!existing) {
    // Upsert: create minimal profile first.
    db.prepare('insert into profiles (id, full_name) values (?,?)').run(req.userId, body.full_name ?? '');
  }
  const fields = pick(body, FIELD_KEYS);
  const updates = [];
  const vals = { id: req.userId };
  // `onboarded` is a boolean flag stored as an integer; handle it separately.
  if (Object.prototype.hasOwnProperty.call(body, 'onboarded')) {
    vals.onboarded = body.onboarded ? 1 : 0;
    updates.push('onboarded = @onboarded');
  }
  for (const k of Object.keys(fields)) {
    if (k === 'exclusions') {
      vals[k] = JSON.stringify(Array.isArray(fields[k]) ? fields[k] : []);
    } else if (k === 'onboarded') {
      vals[k] = fields[k] ? 1 : 0;
    } else {
      vals[k] = fields[k];
    }
    updates.push(`${k} = @${k}`);
  }
  updates.push("updated_at = datetime('now')");
  db.prepare(`update profiles set ${updates.join(', ')} where id = @id`).run(vals);

  const row = db.prepare('select * from profiles where id = ?').get(req.userId);
  return res.json(rowToProfile(row));
}));

export default router;
