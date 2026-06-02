const router = require('express').Router();
const { randomUUID } = require('crypto');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { createNotification } = require('./notifications');

// GET /api/testimonials/:userId — depoimentos do usuário
router.get('/:userId', (req, res) => {
  const rows = db.prepare(`
    SELECT t.*, u.display_name, u.username, u.avatar_text, u.avatar_color
    FROM testimonials t JOIN users u ON u.id = t.from_user_id
    WHERE t.to_user_id = ? AND t.approved = 1
    ORDER BY t.created_at DESC
  `).all(req.params.userId);
  res.json(rows);
});

// GET /api/testimonials/pending/mine — depoimentos pendentes de aprovação (meus)
router.get('/pending/mine', requireAuth, (req, res) => {
  const rows = db.prepare(`
    SELECT t.*, u.display_name, u.username, u.avatar_text, u.avatar_color
    FROM testimonials t JOIN users u ON u.id = t.from_user_id
    WHERE t.to_user_id = ? AND t.approved = 0
    ORDER BY t.created_at DESC
  `).all(req.user.id);
  res.json(rows);
});

// PUT /api/testimonials/:id/approve — aprovar depoimento
router.put('/:id/approve', requireAuth, (req, res) => {
  const t = db.prepare('SELECT * FROM testimonials WHERE id=?').get(req.params.id);
  if (!t) return res.status(404).json({ error: 'Depoimento não encontrado.' });
  if (t.to_user_id !== req.user.id) return res.status(403).json({ error: 'Sem permissão.' });
  
  db.prepare('UPDATE testimonials SET approved=1 WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// PUT /api/testimonials/:id/reject — rejeitar/remover depoimento
router.put('/:id/reject', requireAuth, (req, res) => {
  const t = db.prepare('SELECT * FROM testimonials WHERE id=?').get(req.params.id);
  if (!t) return res.status(404).json({ error: 'Depoimento não encontrado.' });
  if (t.to_user_id !== req.user.id) return res.status(403).json({ error: 'Sem permissão.' });
  
  db.prepare('DELETE FROM testimonials WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// POST /api/testimonials/:userId — escrever depoimento
router.post('/:userId', requireAuth, (req, res) => {
  if (req.params.userId === req.user.id)
    return res.status(400).json({ error: 'Não pode escrever depoimento para si mesmo.' });
  if (!db.prepare('SELECT id FROM users WHERE id=?').get(req.params.userId))
    return res.status(404).json({ error: 'Usuário não encontrado.' });

  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: 'Depoimento vazio.' });

  const existing = db.prepare('SELECT id FROM testimonials WHERE from_user_id=? AND to_user_id=?')
    .get(req.user.id, req.params.userId);
  if (existing) {
    db.prepare('UPDATE testimonials SET content=?, created_at=datetime(\'now\') WHERE id=?')
      .run(content.trim(), existing.id);
    return res.json(db.prepare(`
      SELECT t.*, u.display_name, u.username, u.avatar_text, u.avatar_color
      FROM testimonials t JOIN users u ON u.id=t.from_user_id WHERE t.id=?
    `).get(existing.id));
  }

  const id = randomUUID();
  db.prepare('INSERT INTO testimonials (id,from_user_id,to_user_id,content) VALUES (?,?,?,?)')
    .run(id, req.user.id, req.params.userId, content.trim());

  const result = db.prepare(`
    SELECT t.*, u.display_name, u.username, u.avatar_text, u.avatar_color
    FROM testimonials t JOIN users u ON u.id=t.from_user_id WHERE t.id=?
  `).get(id);

  const APP_URL = process.env.APP_URL || 'https://kgando.com';
  createNotification({
    userId: req.params.userId,
    type: 'testimonial',
    fromUserId: req.user.id,
    entityId: id,
    message: `${result.display_name} escreveu um depoimento para você!`,
    link: `${APP_URL}/#profile?id=${req.params.userId}`,
  });

  res.status(201).json(result);
});

// DELETE /api/testimonials/:id — apagar depoimento (dono ou destinatário)
router.delete('/:id', requireAuth, (req, res) => {
  const t = db.prepare('SELECT * FROM testimonials WHERE id=?').get(req.params.id);
  if (!t) return res.status(404).json({ error: 'Depoimento não encontrado.' });
  if (t.from_user_id !== req.user.id && t.to_user_id !== req.user.id)
    return res.status(403).json({ error: 'Sem permissão.' });
  db.prepare('DELETE FROM testimonials WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
