// Small helpers to keep route handlers concise: async error wrapper and a
// per-request SQLite context. All statements are prepared once and cached.

import { db, genId } from '../db.js';

// Express async-error wrapper.
export const wrap = (fn) => (req, res, next) => {
  try {
    return fn(req, res, next);
  } catch (err) {
    next(err);
  }
};

// Ensure a profiles row exists for a user (lazily created).
export function ensureProfile(userId) {
  const row = db.prepare('select id from profiles where id = ?').get(userId);
  if (!row) {
    db.prepare('insert into profiles (id, full_name) values (?, ?)').run(userId, '');
  }
  return userId;
}

// Pull a camelCase-safe column allowlist from a request body.
export function pick(body, keys) {
  const out = {};
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(body, k)) out[k] = body[k];
  }
  return out;
}

export { db, genId };
