// Public reference data: foods. Read-only for end users; writes go through /api/admin.
import { Router } from 'express';
import { db } from '../db.js';
import { mapFoodRow } from '../db.js';
import { requireAuth } from '../auth.js';
import { wrap } from './_helpers.js';

const router = Router();
router.use(requireAuth);

router.get('/', wrap((req, res) => {
  const { q, category, limit } = req.query;
  const lim = Math.min(parseInt(limit ?? '300', 10) || 300, 500);
  let sql = 'select * from food_items';
  const clauses = [];
  const params = {};
  if (category) {
    clauses.push('category = @category');
    params.category = String(category);
  }
  if (q && String(q).trim()) {
    clauses.push('name like @q');
    params.q = `%${String(q).trim()}%`;
  }
  if (clauses.length) sql += ' where ' + clauses.join(' and ');
  sql += ' order by name asc limit @lim';
  params.lim = lim;
  const rows = db.prepare(sql).all(params);
  return res.json(rows.map(mapFoodRow));
}));

router.get('/categories', wrap((req, res) => {
  const rows = db.prepare('select distinct category as c from food_items order by c').all();
  return res.json(rows.map((r) => r.c));
}));

export default router;
