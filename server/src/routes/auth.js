// Auth endpoints. Contracts:
//   POST /api/auth/register  {email, password, full_name} -> 201 {token, user}
//   POST /api/auth/login     {email, password}            -> 200 {token, user}
//   GET  /api/auth/me        (Bearer)                     -> 200 {user}
//   POST /api/auth/forgot-password {email}                -> 200 {reset_url}
//   POST /api/auth/reset-password  {token, password}      -> 200 {ok}
import { Router } from 'express';
import { db, genId } from '../db.js';
import {
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
  findUserById,
  findUserByEmail,
  requireAuth,
} from '../auth.js';

const router = Router();

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/register', (req, res) => {
  const { email, password, full_name } = req.body || {};
  if (!email || !emailRe.test(String(email))) return res.status(400).json({ error: 'A valid email is required.' });
  if (!password || String(password).length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });

  const normalized = String(email).toLowerCase().trim();
  if (findUserByEmail(normalized)) return res.status(409).json({ error: 'An account with this email already exists.' });

  const id = genId('u_');
  const fullName = (full_name ?? '').toString().trim();
  db.prepare('insert into users (id, email, password_hash, full_name, role) values (?,?,?,?,?)')
    .run(id, normalized, hashPassword(String(password)), fullName, 'user');
  db.prepare('insert into profiles (id, full_name) values (?,?)').run(id, fullName);

  const user = findUserById(id);
  return res.status(201).json({ token: signToken(user), user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role } });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

  const row = findUserByEmail(String(email).toLowerCase().trim());
  if (!row || !verifyPassword(String(password), row.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  return res.json({ token: signToken(row), user: { id: row.id, email: row.email, full_name: row.full_name, role: row.role } });
});

router.get('/me', requireAuth, (req, res) => {
  const user = findUserById(req.userId);
  if (!user) return res.status(401).json({ error: 'Account not found.' });
  return res.json({ user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role } });
});

// Local dev: there is no email provider, so we return a signed reset link that
// the user can open (the mobile/web reset screen will call /reset-password).
router.post('/forgot-password', (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Email is required.' });
  const row = findUserByEmail(String(email).toLowerCase().trim());
  if (!row) return res.status(200).json({ ok: true }); // do not reveal whether the account exists

  const token = signToken({ id: row.id, purpose: 'password_reset' });
  return res.json({ ok: true, reset_url: `fitwell://reset-password?token=${token}` });
});

router.post('/reset-password', (req, res) => {
  const { token, password } = req.body || {};
  if (!token) return res.status(400).json({ error: 'A reset token is required.' });
  if (!password || String(password).length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });

  const payload = verifyToken(String(token));
  if (!payload || payload.purpose !== 'password_reset') return res.status(400).json({ error: 'This reset link is invalid or expired.' });

  db.prepare('update users set password_hash = ? where id = ?').run(hashPassword(String(password)), payload.id);
  return res.json({ ok: true });
});

export default router;
