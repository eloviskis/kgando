const router = require('express').Router();
const { randomUUID } = require('crypto');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { createNotification } = require('./notifications');

function currentUserId(req) {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Bearer ')) return null;
  try { return jwt.verify(h.slice(7), process.env.JWT_SECRET).id; } catch { return null; }
}

const SELECT_REVIEW = `
  SELECT r.*,
         u.display_name, u.avatar_text, u.avatar_color, u.username,
         b.name AS bathroom_name, b.neighborhood AS bathroom_neighborhood,
         b.rating AS bathroom_rating,
         CASE WHEN rl.user_id IS NOT NULL THEN 1 ELSE 0 END AS liked_by_me
  FROM reviews r
  JOIN users u ON u.id = r.user_id
  LEFT JOIN bathrooms b ON b.id = r.bathroom_id
  LEFT JOIN review_likes rl ON rl.review_id = r.id AND rl.user_id = ?
`;

// GET /api/reviews
router.get('/', (req, res) => {
  const uid = currentUserId(req);
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 20);
  const offset = (page - 1) * limit;

  const reviews = db.prepare(`${SELECT_REVIEW} ORDER BY r.created_at DESC LIMIT ? OFFSET ?`)
    .all(uid, limit, offset);
  const total = db.prepare('SELECT COUNT(*) AS c FROM reviews').get().c;
  res.json({ reviews, total, page, limit });
});

// POST /api/reviews
router.post('/', requireAuth, (req, res) => {
  const { bathroom_id, title, comment, quality, duration, relief, smell, sticker } = req.body;
  if (!quality || !duration || !relief || !smell)
    return res.status(400).json({ error: 'Preencha qualidade, duração, alívio e cheiro.' });

  const id = randomUUID();
  db.prepare(
    'INSERT INTO reviews (id,user_id,bathroom_id,title,comment,quality,duration,relief,smell,sticker) VALUES (?,?,?,?,?,?,?,?,?,?)'
  ).run(id, req.user.id, bathroom_id || null, title || '', comment || '', quality, duration, relief, smell, sticker || '');

  // Atualizar rating e contagem do banheiro
  if (bathroom_id) {
    const scoreMap = { good: 5, ok: 3, bad: 1, light: 5, satisfied: 3, incomplete: 1, roses: 5, neutral: 3, toxic: 1 };
    const q = scoreMap[quality] || 3;
    const r = scoreMap[relief]  || 3;
    const s = scoreMap[smell]   || 3;
    const avg = Math.round((q + r + s) / 3 * 10) / 10;
    db.prepare(`
      UPDATE bathrooms SET
        reviews_count = reviews_count + 1,
        rating = ROUND((rating * reviews_count + ?) / (reviews_count + 1), 1)
      WHERE id = ?
    `).run(avg, bathroom_id);
  }

  const review = db.prepare(`${SELECT_REVIEW} WHERE r.id=?`).get(req.user.id, id);
  res.status(201).json(review);
});

// PUT /api/reviews/:id — atualizar própria review
router.put('/:id', requireAuth, (req, res) => {
  const rev = db.prepare('SELECT id, user_id, bathroom_id FROM reviews WHERE id=?').get(req.params.id);
  if (!rev) return res.status(404).json({ error: 'Review não encontrada.' });
  if (rev.user_id !== req.user.id) return res.status(403).json({ error: 'Sem permissão.' });

  const { bathroom_id, title, comment, quality, duration, relief, smell, sticker } = req.body;
  if (!quality || !duration || !relief || !smell)
    return res.status(400).json({ error: 'Preencha qualidade, duração, alívio e cheiro.' });

  db.prepare(`
    UPDATE reviews SET
      bathroom_id = ?,
      title = ?,
      comment = ?,
      quality = ?,
      duration = ?,
      relief = ?,
      smell = ?,
      sticker = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    bathroom_id || null,
    title || '',
    comment || '',
    quality,
    duration,
    relief,
    smell,
    sticker || '',
    req.params.id
  );

  // Se o banheiro mudou, atualizar ratings
  if (bathroom_id && bathroom_id !== rev.bathroom_id) {
    const scoreMap = { light: 5, satisfied: 3, incomplete: 1, roses: 5, neutral: 3, toxic: 1 };
    const q = quality; // quality já é um número de 1 a 5
    const r = scoreMap[relief]  || 3;
    const s = scoreMap[smell]   || 3;
    const avg = Math.round((q + r + s) / 3 * 10) / 10;
    
    // Remove do banheiro antigo
    if (rev.bathroom_id) {
      db.prepare(`
        UPDATE bathrooms SET reviews_count = MAX(0, reviews_count - 1)
        WHERE id = ?
      `).run(rev.bathroom_id);
    }
    
    // Adiciona ao novo banheiro
    db.prepare(`
      UPDATE bathrooms SET
        reviews_count = reviews_count + 1,
        rating = ROUND((rating * reviews_count + ?) / (reviews_count + 1), 1)
      WHERE id = ?
    `).run(avg, bathroom_id);
  }

  const review = db.prepare(`${SELECT_REVIEW} WHERE r.id=?`).get(req.user.id, req.params.id);
  res.json(review);
});

// GET /api/reviews/:id — obter uma review específica
router.get('/:id', (req, res) => {
  const uid = currentUserId(req);
  const review = db.prepare(`${SELECT_REVIEW} WHERE r.id=?`).get(uid, req.params.id);
  if (!review) return res.status(404).json({ error: 'Review não encontrada.' });
  res.json(review);
});

// DELETE /api/reviews/:id — deletar própria review
router.delete('/:id', requireAuth, (req, res) => {
  const rev = db.prepare('SELECT id, user_id FROM reviews WHERE id=?').get(req.params.id);
  if (!rev) return res.status(404).json({ error: 'Review não encontrada.' });
  if (rev.user_id !== req.user.id) return res.status(403).json({ error: 'Sem permissão.' });
  db.prepare('DELETE FROM reviews WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// POST /api/reviews/:id/like
router.post('/:id/like', requireAuth, (req, res) => {
  const rev = db.prepare('SELECT id, user_id FROM reviews WHERE id=?').get(req.params.id);
  if (!rev) return res.status(404).json({ error: 'Review não encontrado.' });

  let inserted = false;
  try {
    db.prepare('INSERT INTO review_likes (user_id,review_id) VALUES (?,?)').run(req.user.id, req.params.id);
    db.prepare('UPDATE reviews SET likes_count=likes_count+1 WHERE id=?').run(req.params.id);
    inserted = true;
  } catch { /* already liked — ignore */ }

  if (inserted && rev.user_id !== req.user.id) {
    const me = db.prepare('SELECT display_name FROM users WHERE id=?').get(req.user.id);
    const APP_URL = process.env.APP_URL || 'https://kgando.com';
    createNotification({
      userId: rev.user_id,
      type: 'review_like',
      fromUserId: req.user.id,
      entityId: req.params.id,
      message: `${me?.display_name || 'Alguém'} curtiu sua avaliação!`,
      link: `${APP_URL}/#reviews`,
    });
  }

  const { likes_count } = db.prepare('SELECT likes_count FROM reviews WHERE id=?').get(req.params.id);
  res.json({ likes_count, liked: true });
});

// DELETE /api/reviews/:id/like
router.delete('/:id/like', requireAuth, (req, res) => {
  const r = db.prepare('DELETE FROM review_likes WHERE user_id=? AND review_id=?').run(req.user.id, req.params.id);
  if (r.changes === 0) return res.status(404).json({ error: 'Curtida não encontrada.' });
  db.prepare('UPDATE reviews SET likes_count=MAX(0,likes_count-1) WHERE id=?').run(req.params.id);
  const { likes_count } = db.prepare('SELECT likes_count FROM reviews WHERE id=?').get(req.params.id);
  res.json({ likes_count, liked: false });
});

// GET /api/reviews/:id/comments
router.get('/:id/comments', (req, res) => {
  const comments = db.prepare(`
    SELECT rc.*, u.display_name, u.avatar_text, u.avatar_color
    FROM review_comments rc JOIN users u ON u.id=rc.user_id
    WHERE rc.review_id=? ORDER BY rc.created_at ASC
  `).all(req.params.id);
  res.json(comments);
});

// DELETE /api/reviews/:id/comments/:cid — deletar próprio comentário
router.delete('/:id/comments/:cid', requireAuth, (req, res) => {
  const c = db.prepare('SELECT id, user_id FROM review_comments WHERE id=?').get(req.params.cid);
  if (!c) return res.status(404).json({ error: 'Comentário não encontrado.' });
  if (c.user_id !== req.user.id) return res.status(403).json({ error: 'Sem permissão.' });
  db.prepare('DELETE FROM review_comments WHERE id=?').run(req.params.cid);
  db.prepare('UPDATE reviews SET comments_count=MAX(0,comments_count-1) WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// POST /api/reviews/:id/comments
router.post('/:id/comments', requireAuth, (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ error: 'Comentário vazio.' });
  const rev = db.prepare('SELECT id, user_id FROM reviews WHERE id=?').get(req.params.id);
  if (!rev) return res.status(404).json({ error: 'Review não encontrado.' });

  const id = randomUUID();
  db.prepare('INSERT INTO review_comments (id,review_id,user_id,text) VALUES (?,?,?,?)').run(id, req.params.id, req.user.id, text.trim());
  db.prepare('UPDATE reviews SET comments_count=comments_count+1 WHERE id=?').run(req.params.id);

  const comment = db.prepare(`
    SELECT rc.*, u.display_name, u.avatar_text, u.avatar_color
    FROM review_comments rc JOIN users u ON u.id=rc.user_id WHERE rc.id=?
  `).get(id);

  if (rev.user_id !== req.user.id) {
    const APP_URL = process.env.APP_URL || 'https://kgando.com';
    createNotification({
      userId: rev.user_id,
      type: 'review_comment',
      fromUserId: req.user.id,
      entityId: req.params.id,
      message: `${comment.display_name} comentou na sua avaliação!`,
      link: `${APP_URL}/#reviews`,
    });
  }

  res.status(201).json(comment);
});

module.exports = router;
