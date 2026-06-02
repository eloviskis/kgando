const router = require('express').Router();
const { randomUUID } = require('crypto');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { createNotification } = require('./notifications');

const VALID_TYPES = ['confiavel', 'legal', 'sexy'];

// GET /api/votes/:userId — votos recebidos + meus votos nesse usuário
router.get('/:userId', (req, res) => {
  const authHeader = req.headers.authorization || '';
  let myId = null;
  try {
    const jwt = require('jsonwebtoken');
    if (authHeader.startsWith('Bearer '))
      myId = jwt.verify(authHeader.slice(7), process.env.JWT_SECRET).id;
  } catch {}

  const counts = db.prepare(`
    SELECT vote_type, COUNT(*) AS count
    FROM profile_votes WHERE to_user_id=?
    GROUP BY vote_type
  `).all(req.params.userId);

  const myVotes = myId
    ? db.prepare('SELECT vote_type FROM profile_votes WHERE from_user_id=? AND to_user_id=?')
        .all(myId, req.params.userId).map(r => r.vote_type)
    : [];

  const result = {};
  VALID_TYPES.forEach(t => { result[t] = { count: 0, voted: myVotes.includes(t) }; });
  counts.forEach(({ vote_type, count }) => { if (result[vote_type]) result[vote_type].count = count; });
  res.json(result);
});

// POST /api/votes/:userId — votar
router.post('/:userId', requireAuth, (req, res) => {
  const { vote_type } = req.body;
  if (!VALID_TYPES.includes(vote_type)) return res.status(400).json({ error: 'Tipo inválido.' });
  if (req.params.userId === req.user.id) return res.status(400).json({ error: 'Não pode votar em si mesmo.' });
  if (!db.prepare('SELECT id FROM users WHERE id=?').get(req.params.userId))
    return res.status(404).json({ error: 'Usuário não encontrado.' });
  let inserted = false;
  try {
    db.prepare('INSERT INTO profile_votes (id,from_user_id,to_user_id,vote_type) VALUES (?,?,?,?)')
      .run(randomUUID(), req.user.id, req.params.userId, vote_type);
    inserted = true;
  } catch { /* já votou — ignora */ }

  if (inserted) {
    const me = db.prepare('SELECT display_name FROM users WHERE id=?').get(req.user.id);
    const APP_URL = process.env.APP_URL || 'https://kgando.com';
    const labels = { confiavel: 'Confiável', legal: 'Legal', sexy: 'Sexy' };
    createNotification({
      userId: req.params.userId,
      type: 'vote',
      fromUserId: req.user.id,
      message: `${me?.display_name || 'Alguém'} votou em você como ${labels[vote_type] || vote_type}!`,
      link: `${APP_URL}/#profile?id=${req.params.userId}`,
    });
  }
  res.json({ ok: true, voted: true });
});

// DELETE /api/votes/:userId — remover voto
router.delete('/:userId', requireAuth, (req, res) => {
  const { vote_type } = req.body;
  if (!VALID_TYPES.includes(vote_type)) return res.status(400).json({ error: 'Tipo inválido.' });
  db.prepare('DELETE FROM profile_votes WHERE from_user_id=? AND to_user_id=? AND vote_type=?')
    .run(req.user.id, req.params.userId, vote_type);
  res.json({ ok: true, voted: false });
});

module.exports = router;
