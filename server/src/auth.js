// Authentication: password hashing (crypto.scrypt), JWT issuance/verification,
// and an Express middleware that attaches `req.userId` (and `req.userRole`).
// Every user-data route relies on this middleware — this is how we enforce
// "a user can only touch their own rows" (the replacement for RLS).

import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { db } from './db.js';

const JWT_SECRET = process.env.FITWELL_JWT_SECRET ?? 'fitwell-local-dev-secret-change-me';
const TOKEN_TTL = '30d';

// ---- password hashing (scrypt, salt stored with hash) ----------------------
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 64).toString('hex');
  const a = Buffer.from(candidate, 'hex');
  const b = Buffer.from(hash, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// ---- token helpers ---------------------------------------------------------
export function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: TOKEN_TTL },
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// ---- middleware ------------------------------------------------------------
// Expects `Authorization: Bearer <token>` and attaches req.userId / req.userRole.
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Invalid or expired session' });

  req.userId = payload.sub;
  req.userRole = payload.role || 'user';
  next();
}

// Gates routes to admins. Must run after requireAuth.
// The role is re-read from the DB on every request so that a user who is
// promoted/demoted (or whose token's role claim is stale) gets the correct,
// current verdict — never a stale value from the token.
export function requireAdmin(req, res, next) {
  const row = db.prepare('select role from users where id = ?').get(req.userId);
  if (!row || row.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// Look up a user by id (used for the /auth/me restore flow).
export function findUserById(id) {
  return db.prepare('select id, email, full_name, role, created_at from users where id = ?').get(id);
}

export function findUserByEmail(email) {
  return db.prepare('select * from users where email = ?').get(email);
}
