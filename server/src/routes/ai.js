// AI conversations/messages persistence (scoped to the authenticated user) and
// a generation endpoint. When no AI provider key is configured on the server,
// /generate returns a 501 so the client falls back to its rule-based provider.

import { Router } from 'express';
import { db, genId } from '../db.js';
import { requireAuth } from '../auth.js';
import { wrap } from './_helpers.js';

const router = Router();
router.use(requireAuth);

// Conversations owned by the user.
router.get('/conversations', wrap((req, res) => {
  const rows = db.prepare('select * from ai_conversations where user_id = ? order by created_at desc limit 20').all(req.userId);
  return res.json(rows);
}));

router.post('/conversations', wrap((req, res) => {
  const b = req.body || {};
  const id = genId('ac_');
  db.prepare('insert into ai_conversations (id, user_id, title) values (?,?,?)').run(id, req.userId, b.title || 'Fitness Assistant');
  const row = db.prepare('select * from ai_conversations where id = ?').get(id);
  return res.status(201).json(row);
}));

// Messages belong to a conversation; ensure it's the user's own conversation.
router.get('/conversations/:id/messages', wrap((req, res) => {
  const conv = db.prepare('select * from ai_conversations where id = ? and user_id = ?').get(req.params.id, req.userId);
  if (!conv) return res.status(404).json({ error: 'Conversation not found.' });
  const rows = db.prepare('select * from ai_messages where conversation_id = ? order by created_at asc').all(req.params.id);
  return res.json(rows);
}));

router.post('/conversations/:id/messages', wrap((req, res) => {
  const b = req.body || {};
  const conv = db.prepare('select * from ai_conversations where id = ? and user_id = ?').get(req.params.id, req.userId);
  if (!conv) return res.status(404).json({ error: 'Conversation not found.' });
  const id = genId('am_');
  db.prepare('insert into ai_messages (id, conversation_id, role, content) values (?,?,?,?)')
    .run(id, req.params.id, b.role || 'user', b.content ?? '');
  const row = db.prepare('select * from ai_messages where id = ?').get(id);
  return res.status(201).json(row);
}));

// Generation endpoint. If an AI key is configured (FITWELL_AI_*), we would call
// it here; for the local build it returns 501 so clients use rule-based logic.
router.post('/generate', wrap((req, res) => {
  const configured = Boolean(process.env.FITWELL_AI_API_KEY);
  if (!configured) {
    return res.status(501).json({ error: 'AI provider is not configured on this server.' });
  }
  // Placeholder: wire a real LLM call here when a key is present.
  return res.status(501).json({ error: 'AI provider backend not wired up yet.' });
}));

export default router;
