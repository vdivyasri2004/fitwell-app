// Food logs. All scoped to the authenticated user.
import { Router } from 'express';
import { db, genId, mapFoodRow } from '../db.js';
import { requireAuth } from '../auth.js';
import { wrap } from './_helpers.js';

const router = Router();
router.use(requireAuth);

const JOIN_SELECT = `fl.*, fi.id as "food_items:id", fi.name as "food_items:name",
  fi.category as "food_items:category", fi.serving_unit as "food_items:serving_unit",
  fi.serving_size as "food_items:serving_size", fi.calories as "food_items:calories",
  fi.protein_g as "food_items:protein_g", fi.carbs_g as "food_items:carbs_g",
  fi.fat_g as "food_items:fat_g", fi.fiber_g as "food_items:fiber_g",
  fi.is_vegetarian as "food_items:is_vegetarian", fi.contains_egg as "food_items:contains_egg",
  fi.is_vegan as "food_items:is_vegan", fi.contains_dairy as "food_items:contains_dairy",
  fi.contains_peanuts as "food_items:contains_peanuts", fi.contains_gluten as "food_items:contains_gluten",
  fi.contains_soy as "food_items:contains_soy", fi.contains_seafood as "food_items:contains_seafood",
  fi.description as "food_items:description"`;

function toJoined(row) {
  if (!row) return null;
  const { 'food_items:id': fid, 'food_items:name': fname, 'food_items:category': fcat,
    'food_items:serving_unit': fsunit, 'food_items:serving_size': fssize,
    'food_items:calories': fcal, 'food_items:protein_g': fprot, 'food_items:carbs_g': fcarb,
    'food_items:fat_g': ffat, 'food_items:fiber_g': ffib, 'food_items:is_vegetarian': fveg,
    'food_items:contains_egg': fegg, 'food_items:is_vegan': fvegan, 'food_items:contains_dairy': fdairy,
    'food_items:contains_peanuts': fpeanut, 'food_items:contains_gluten': fgluten,
    'food_items:contains_soy': fsoy, 'food_items:contains_seafood': fseafood,
    'food_items:description': fdesc, ...rest } = row;
  const food = fid ? { id: fid, name: fname, category: fcat, serving_unit: fsunit, serving_size: fssize,
    calories: fcal, protein_g: fprot, carbs_g: fcarb, fat_g: ffat, fiber_g: ffib,
    is_vegetarian: !!fveg, contains_egg: !!fegg, is_vegan: !!fvegan, contains_dairy: !!fdairy,
    contains_peanuts: !!fpeanut, contains_gluten: !!fgluten, contains_soy: !!fsoy,
    contains_seafood: !!fseafood, description: fdesc } : undefined;
  return { ...rest, food_items: food };
}

router.post('/', wrap((req, res) => {
  const b = req.body || {};
  const id = genId('fl_');
  db.prepare(`insert into food_logs
    (id, user_id, food_item_id, meal_type, quantity, calories, protein_g, carbs_g, fat_g, logged_at)
    values (@id, @userId, @food_item_id, @meal_type, @quantity, @calories, @protein_g, @carbs_g, @fat_g, @logged_at)`)
    .run({
      id, userId: req.userId, food_item_id: b.food_item_id ?? null,
      meal_type: b.meal_type ?? 'snack', quantity: b.quantity ?? 1,
      calories: b.calories ?? 0, protein_g: b.protein_g ?? 0,
      carbs_g: b.carbs_g ?? 0, fat_g: b.fat_g ?? 0, logged_at: b.logged_at ?? new Date().toISOString(),
    });
  const row = db.prepare(`select ${JOIN_SELECT} from food_logs fl left join food_items fi on fi.id = fl.food_item_id where fl.id = ?`).get(id);
  return res.status(201).json(toJoined(row));
}));

router.get('/', wrap((req, res) => {
  const { from, to, limit } = req.query;
  const lim = Math.min(parseInt(limit ?? '100', 10) || 100, 500);
  if (from && to) {
    const rows = db.prepare(`select ${JOIN_SELECT} from food_logs fl left join food_items fi on fi.id = fl.food_item_id where fl.user_id = ? and fl.logged_at >= ? and fl.logged_at <= ? order by fl.logged_at asc limit ?`).all(req.userId, String(from), String(to), lim);
    return res.json(rows.map(toJoined));
  }
  if (from && !to) {
    const rows = db.prepare(`select ${JOIN_SELECT} from food_logs fl left join food_items fi on fi.id = fl.food_item_id where fl.user_id = ? and fl.logged_at >= ? order by fl.logged_at asc limit ?`).all(req.userId, String(from), lim);
    return res.json(rows.map(toJoined));
  }
  const rows = db.prepare(`select ${JOIN_SELECT} from food_logs fl left join food_items fi on fi.id = fl.food_item_id where fl.user_id = ? order by fl.logged_at desc limit ?`).all(req.userId, lim);
  return res.json(rows.map(toJoined));
}));

router.put('/:id', wrap((req, res) => {
  const b = req.body || {};
  const allowed = ['food_item_id', 'meal_type', 'quantity', 'calories', 'protein_g', 'carbs_g', 'fat_g', 'logged_at'];
  const sets = [];
  const params = { id: req.params.id, userId: req.userId };
  for (const k of allowed) {
    if (Object.prototype.hasOwnProperty.call(b, k)) { sets.push(`${k} = @${k}`); params[k] = b[k]; }
  }
  if (sets.length === 0) return res.status(400).json({ error: 'Nothing to update.' });
  const info = db.prepare(`update food_logs set ${sets.join(', ')} where id = @id and user_id = @userId`).run(params);
  if (info.changes === 0) return res.status(404).json({ error: 'Log not found.' });
  const row = db.prepare(`select ${JOIN_SELECT} from food_logs fl left join food_items fi on fi.id = fl.food_item_id where fl.id = ?`).get(req.params.id);
  return res.json(toJoined(row));
}));

router.delete('/:id', wrap((req, res) => {
  const info = db.prepare('delete from food_logs where id = ? and user_id = ?').run(req.params.id, req.userId);
  if (info.changes === 0) return res.status(404).json({ error: 'Log not found.' });
  return res.status(204).end();
}));

export default router;
