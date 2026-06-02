const router = require('express').Router();
const { randomUUID } = require('crypto');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { createNotification } = require('./notifications');

const USER_FIELDS = 'id, username, display_name, avatar_text, avatar_color';

// GET /api/friends — lista amigos aceitos do usuário logado
router.get('/', requireAuth, (req, res) => {
  const rows = db.prepare(`
    SELECT u.${USER_FIELDS}, f.status, f.id AS friendship_id, f.created_at AS friends_since
    FROM friends f
    JOIN users u ON (
      CASE WHEN f.requester_id = ? THEN u.id = f.addressee_id
           ELSE u.id = f.requester_id END
    )
    WHERE (f.requester_id = ? OR f.addressee_id = ?) AND f.status = 'accepted'
  `).all(req.user.id, req.user.id, req.user.id);
  res.json(rows);
});

// GET /api/friends/requests — pedidos pendentes recebidos
router.get('/requests', requireAuth, (req, res) => {
  const rows = db.prepare(`
    SELECT u.${USER_FIELDS}, f.id AS friendship_id, f.created_at
    FROM friends f JOIN users u ON u.id = f.requester_id
    WHERE f.addressee_id = ? AND f.status = 'pending'
    ORDER BY f.created_at DESC
  `).all(req.user.id);
  res.json(rows);
});

// GET /api/friends/status/:userId — status com outro usuário
router.get('/status/:userId', requireAuth, (req, res) => {
  const f = db.prepare(`
    SELECT id, status, requester_id FROM friends
    WHERE (requester_id=? AND addressee_id=?) OR (requester_id=? AND addressee_id=?)
  `).get(req.user.id, req.params.userId, req.params.userId, req.user.id);
  if (!f) return res.json({ status: 'none' });
  res.json({ status: f.status, friendship_id: f.id, i_requested: f.requester_id === req.user.id });
});

// POST /api/friends/:userId — enviar pedido
router.post('/:userId', requireAuth, (req, res) => {
  if (req.params.userId === req.user.id) return res.status(400).json({ error: 'Não pode adicionar a si mesmo.' });
  if (!db.prepare('SELECT id FROM users WHERE id=?').get(req.params.userId))
    return res.status(404).json({ error: 'Usuário não encontrado.' });
  const existing = db.prepare(`
    SELECT id FROM friends
    WHERE (requester_id=? AND addressee_id=?) OR (requester_id=? AND addressee_id=?)
  `).get(req.user.id, req.params.userId, req.params.userId, req.user.id);
  if (existing) return res.status(409).json({ error: 'Pedido já existe.' });
  const id = randomUUID();
  db.prepare('INSERT INTO friends (id,requester_id,addressee_id) VALUES (?,?,?)').run(id, req.user.id, req.params.userId);
  const me = db.prepare('SELECT display_name FROM users WHERE id=?').get(req.user.id);
  const APP_URL = process.env.APP_URL || 'https://kgando.com';
  createNotification({ userId: req.params.userId, type: 'friend_request', fromUserId: req.user.id, entityId: id, message: `${me?.display_name || 'Alguém'} quer ser seu parça de cocô!`, link: `${APP_URL}/#profile?id=${req.user.id}` });
  res.status(201).json({ ok: true, friendship_id: id });
});

// PUT /api/friends/:id/accept — aceitar pedido
router.put('/:id/accept', requireAuth, (req, res) => {
  const f = db.prepare('SELECT * FROM friends WHERE id=?').get(req.params.id);
  if (!f) return res.status(404).json({ error: 'Pedido não encontrado.' });
  if (f.addressee_id !== req.user.id) return res.status(403).json({ error: 'Sem permissão.' });
  db.prepare("UPDATE friends SET status='accepted' WHERE id=?").run(req.params.id);
  const me = db.prepare('SELECT display_name FROM users WHERE id=?').get(req.user.id);
  const APP_URL2 = process.env.APP_URL || 'https://kgando.com';
  createNotification({ userId: f.requester_id, type: 'friend_accepted', fromUserId: req.user.id, entityId: f.id, message: `${me?.display_name || 'Alguém'} aceitou seu pedido de amizade!`, link: `${APP_URL2}/#profile?id=${req.user.id}` });
  res.json({ ok: true });
});

// DELETE /api/friends/:userId — remover amizade ou cancelar pedido
router.delete('/:userId', requireAuth, (req, res) => {
  const r = db.prepare(`
    DELETE FROM friends
    WHERE (requester_id=? AND addressee_id=?) OR (requester_id=? AND addressee_id=?)
  `).run(req.user.id, req.params.userId, req.params.userId, req.user.id);
  if (r.changes === 0) return res.status(404).json({ error: 'Amizade não encontrada.' });
  res.json({ ok: true });
});

// GET /api/friends/of/:userId — amigos de um usuário (público)
router.get('/of/:userId', (req, res) => {
  const rows = db.prepare(`
    SELECT u.${USER_FIELDS}
    FROM friends f
    JOIN users u ON (
      CASE WHEN f.requester_id = ? THEN u.id = f.addressee_id
           ELSE u.id = f.requester_id END
    )
    WHERE (f.requester_id = ? OR f.addressee_id = ?) AND f.status = 'accepted'
    LIMIT 30
  `).all(req.params.userId, req.params.userId, req.params.userId);
  res.json(rows);
});

module.exports = router;
