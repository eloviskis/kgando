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

  if (req.query.feed === 'friends' && uid) {
    // Feed de parcas: só reviews de amigos aceitos
    const friendIds = db.prepare(`
      SELECT CASE WHEN requester_id = ? THEN addressee_id ELSE requester_id END AS friend_id
      FROM friends WHERE (requester_id = ? OR addressee_id = ?) AND status = 'accepted'
    `).all(uid, uid, uid).map(r => r.friend_id);

    if (friendIds.length === 0) {
      return res.json({ reviews: [], total: 0, page, limit, no_friends: true });
    }

    const placeholders = friendIds.map(() => '?').join(',');
    const reviews = db.prepare(
      `${SELECT_REVIEW} WHERE r.user_id IN (${placeholders}) ORDER BY r.created_at DESC LIMIT ? OFFSET ?`
    ).all(uid, ...friendIds, limit, offset);
    const total = db.prepare(
      `SELECT COUNT(*) AS c FROM reviews WHERE user_id IN (${placeholders})`
    ).all(...friendIds)[0].c;
    return res.json({ reviews, total, page, limit });
  }

  const reviews = db.prepare(`${SELECT_REVIEW} ORDER BY r.created_at DESC LIMIT ? OFFSET ?`)
    .all(uid, limit, offset);
  const total = db.prepare('SELECT COUNT(*) AS c FROM reviews').get().c;
  res.json({ reviews, total, page, limit });
});

// POST /api/reviews
router.post('/', requireAuth, (req, res) => {
  const { bathroom_id, title, comment, quality, duration, relief, smell, sticker, custom_display } = req.body;
  if (!quality || !duration || !relief || !smell)
    return res.status(400).json({ error: 'Preencha qualidade, duração, alívio e cheiro.' });

  const id = randomUUID();
  db.prepare(
    'INSERT INTO reviews (id,user_id,bathroom_id,title,comment,quality,duration,relief,smell,sticker,custom_display) VALUES (?,?,?,?,?,?,?,?,?,?,?)'
  ).run(id, req.user.id, bathroom_id || null, title || '', comment || '', quality, duration, relief, smell, sticker || '', custom_display || null);

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
  console.log('PUT /api/reviews/:id', { id: req.params.id, body: req.body, userId: req.user.id });
  const rev = db.prepare('SELECT id, user_id, bathroom_id FROM reviews WHERE id=?').get(req.params.id);
  if (!rev) return res.status(404).json({ error: 'Review não encontrada.' });
  if (rev.user_id !== req.user.id) return res.status(403).json({ error: 'Sem permissão.' });

  const { bathroom_id, title, comment, quality, duration, relief, smell, sticker, custom_display } = req.body;
  console.log('Campos recebidos:', { quality, duration, relief, smell, types: { 
    quality: typeof quality, 
    duration: typeof duration 
  }});
  if (!quality || !duration || !relief || !smell)
    return res.status(400).json({ error: 'Preencha qualidade, duração, alívio e cheiro.' });

  const updateResult = db.prepare(`
    UPDATE reviews SET
      bathroom_id = ?,
      title = ?,
      comment = ?,
      quality = ?,
      duration = ?,
      relief = ?,
      smell = ?,
      sticker = ?,
      custom_display = ?
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
    custom_display || null,
    req.params.id
  );
  console.log('Update result:', updateResult);

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
  console.log('Review atualizada:', review);
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

  // Verifica se já curtiu (idempotente: retorna o estado atual sem erro)
  const existing = db.prepare('SELECT 1 FROM review_likes WHERE user_id=? AND review_id=?').get(req.user.id, req.params.id);
  if (existing) {
    const { likes_count } = db.prepare('SELECT likes_count FROM reviews WHERE id=?').get(req.params.id);
    return res.json({ likes_count, liked: true });
  }

  db.prepare('INSERT INTO review_likes (user_id,review_id) VALUES (?,?)').run(req.user.id, req.params.id);
  // Ressincroniza o contador com contagem real
  const real = db.prepare('SELECT COUNT(*) AS c FROM review_likes WHERE review_id=?').get(req.params.id).c;
  db.prepare('UPDATE reviews SET likes_count=? WHERE id=?').run(real, req.params.id);

  if (rev.user_id !== req.user.id) {
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

  const real2 = db.prepare('SELECT COUNT(*) AS c FROM review_likes WHERE review_id=?').get(req.params.id).c;
  res.json({ likes_count: real2, liked: true });
});

// DELETE /api/reviews/:id/like
router.delete('/:id/like', requireAuth, (req, res) => {
  db.prepare('DELETE FROM review_likes WHERE user_id=? AND review_id=?').run(req.user.id, req.params.id);
  // Ressincroniza o contador com contagem real (evita desync por race conditions)
  const real = db.prepare('SELECT COUNT(*) AS c FROM review_likes WHERE review_id=?').get(req.params.id).c;
  db.prepare('UPDATE reviews SET likes_count=? WHERE id=?').run(real, req.params.id);
  res.json({ likes_count: real, liked: false });
});

// GET /api/reviews/:id/comments
router.get('/:id/comments', (req, res) => {
  const uid = currentUserId(req);
  const comments = db.prepare(`
    SELECT rc.*, u.display_name, u.avatar_text, u.avatar_color
    FROM review_comments rc JOIN users u ON u.id=rc.user_id
    WHERE rc.review_id=? ORDER BY rc.created_at ASC
  `).all(req.params.id);

  // Carrega reações de todos os comentários desta review em uma query só
  const allReactions = db.prepare(`
    SELECT cr.comment_id, cr.emoji, COUNT(*) AS count
    FROM comment_reactions cr
    JOIN review_comments rc ON rc.id = cr.comment_id
    WHERE rc.review_id = ?
    GROUP BY cr.comment_id, cr.emoji
  `).all(req.params.id);

  const myReactions = uid ? db.prepare(`
    SELECT cr.comment_id, cr.emoji
    FROM comment_reactions cr
    JOIN review_comments rc ON rc.id = cr.comment_id
    WHERE rc.review_id = ? AND cr.user_id = ?
  `).all(req.params.id, uid) : [];

  const reactMap = {};
  allReactions.forEach(r => {
    if (!reactMap[r.comment_id]) reactMap[r.comment_id] = [];
    reactMap[r.comment_id].push({ emoji: r.emoji, count: r.count });
  });
  const myMap = {};
  myReactions.forEach(r => { myMap[r.comment_id] = r.emoji; });

  const result = comments.map(c => ({
    ...c,
    reactions: reactMap[c.id] || [],
    my_reaction: myMap[c.id] || null,
  }));
  res.json(result);
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

// POST /api/reviews/:id/comments/:cid/react — reagir ou remover reação de um comentário
router.post('/:id/comments/:cid/react', requireAuth, (req, res) => {
  const VALID_EMOJIS = ['👍','❤️','😂','😮','😢','😡'];
  const { emoji } = req.body;
  if (!VALID_EMOJIS.includes(emoji))
    return res.status(400).json({ error: 'Reação inválida.' });

  const c = db.prepare('SELECT id, user_id FROM review_comments WHERE id=?').get(req.params.cid);
  if (!c) return res.status(404).json({ error: 'Comentário não encontrado.' });

  const existing = db.prepare('SELECT emoji FROM comment_reactions WHERE user_id=? AND comment_id=?')
    .get(req.user.id, req.params.cid);

  if (existing?.emoji === emoji) {
    // Mesma reação → remove (toggle off)
    db.prepare('DELETE FROM comment_reactions WHERE user_id=? AND comment_id=?').run(req.user.id, req.params.cid);
  } else {
    // Reação nova ou diferente → upsert
    db.prepare('INSERT INTO comment_reactions (user_id,comment_id,emoji) VALUES (?,?,?) ON CONFLICT(user_id,comment_id) DO UPDATE SET emoji=excluded.emoji')
      .run(req.user.id, req.params.cid, emoji);

    // Notifica o dono do comentário (se não for ele mesmo reagindo)
    if (c.user_id !== req.user.id) {
      const me = db.prepare('SELECT display_name FROM users WHERE id=?').get(req.user.id);
      const APP_URL = process.env.APP_URL || 'https://kgando.com';
      createNotification({
        userId: c.user_id,
        type: 'comment_reaction',
        fromUserId: req.user.id,
        entityId: req.params.id,
        message: `${me?.display_name || 'Alguém'} reagiu ao seu comentário com ${emoji}`,
        link: `${APP_URL}/#reviews`,
      });
    }
  }

  const reactions = db.prepare('SELECT emoji, COUNT(*) AS count FROM comment_reactions WHERE comment_id=? GROUP BY emoji')
    .all(req.params.cid);
  const my_reaction = existing?.emoji === emoji ? null : emoji;
  res.json({ reactions, my_reaction });
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

  res.status(201).json({ ...comment, reactions: [], my_reaction: null });
});

module.exports = router;
