const router = require('express').Router();
const { randomUUID } = require('crypto');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { createNotification } = require('./notifications');

// GET /api/scraps  (recados para o usuário logado)
router.get('/', requireAuth, (req, res) => {
  const scraps = db.prepare(`
    SELECT s.*, u.display_name, u.avatar_text, u.avatar_color, u.username
    FROM scraps s JOIN users u ON u.id=s.from_user_id
    WHERE s.to_user_id=? ORDER BY s.created_at DESC LIMIT 50
  `).all(req.user.id);
  res.json(scraps);
});

// POST /api/scraps
router.post('/', requireAuth, (req, res) => {
  const { to_user_id, message } = req.body;
  if (!to_user_id || !message?.trim()) return res.status(400).json({ error: 'Destinatário e mensagem são obrigatórios.' });
  if (!db.prepare('SELECT id FROM users WHERE id=?').get(to_user_id))
    return res.status(404).json({ error: 'Usuário não encontrado.' });

  const id = randomUUID();
  db.prepare('INSERT INTO scraps (id,from_user_id,to_user_id,message) VALUES (?,?,?,?)').run(id, req.user.id, to_user_id, message.trim());
  const scrap = db.prepare(`
    SELECT s.*, u.display_name, u.avatar_text, u.avatar_color, u.username
    FROM scraps s JOIN users u ON u.id=s.from_user_id WHERE s.id=?
  `).get(id);
  const APP_URL = process.env.APP_URL || 'https://kgando.com';
  createNotification({ userId: to_user_id, type: 'scrap', fromUserId: req.user.id, entityId: id, message: `${scrap.display_name} te deixou um recado!`, link: `${APP_URL}/#profile:${to_user_id}` });
  res.status(201).json(scrap);
});

// DELETE /api/scraps/:id — deletar scrap recebido ou enviado
router.delete('/:id', requireAuth, (req, res) => {
  const s = db.prepare('SELECT id, from_user_id, to_user_id FROM scraps WHERE id=?').get(req.params.id);
  if (!s) return res.status(404).json({ error: 'Scrap não encontrado.' });
  if (s.from_user_id !== req.user.id && s.to_user_id !== req.user.id)
    return res.status(403).json({ error: 'Sem permissão.' });
  db.prepare('DELETE FROM scraps WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
