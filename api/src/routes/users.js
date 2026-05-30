const router = require('express').Router();
const jwt = require('jsonwebtoken');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

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
  JOIN users u ON u.id=r.user_id
  LEFT JOIN bathrooms b ON b.id=r.bathroom_id
  LEFT JOIN review_likes rl ON rl.review_id=r.id AND rl.user_id=?
`;

// GET /api/users/search?q= — busca por username ou nome (somente perfis públicos)
router.get('/search', (req, res) => {
  const q = (req.query.q || req.query.username || '').trim().toLowerCase();
  if (!q) return res.status(400).json({ error: 'Informe o termo de busca.' });
  const users = db.prepare(`
    SELECT id, username, display_name, avatar_text, avatar_color, is_public
    FROM users
    WHERE (LOWER(username) LIKE ? OR LOWER(display_name) LIKE ?)
      AND (is_public = 1 OR is_public IS NULL)
      AND banned_at IS NULL
    LIMIT 20
  `).all(`%${q}%`, `%${q}%`);
  res.json(users);
});

// GET /api/users/public — lista todos os perfis públicos
router.get('/public', (req, res) => {
  const limit  = Math.min(parseInt(req.query.limit)  || 24, 48);
  const offset = parseInt(req.query.offset) || 0;
  const users = db.prepare(`
    SELECT u.id, u.username, u.display_name, u.avatar_text, u.avatar_color, u.bio,
           COUNT(r.id) AS reviews_count
    FROM users u
    LEFT JOIN reviews r ON r.user_id = u.id
    WHERE (u.is_public = 1 OR u.is_public IS NULL) AND u.banned_at IS NULL
    GROUP BY u.id
    ORDER BY reviews_count DESC, u.created_at DESC
    LIMIT ? OFFSET ?
  `).all(limit, offset);
  const total = db.prepare(`SELECT COUNT(*) AS c FROM users WHERE (is_public=1 OR is_public IS NULL) AND banned_at IS NULL`).get().c;
  res.json({ users, total, offset, limit });
});

// GET /api/users/stats — estatísticas reais do app
router.get('/stats', (req, res) => {
  const users    = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
  const reviews  = db.prepare('SELECT COUNT(*) AS c FROM reviews').get().c;
  const bathrooms = db.prepare('SELECT COUNT(*) AS c FROM bathrooms').get().c;
  const communities = db.prepare('SELECT COUNT(*) AS c FROM communities').get().c;
  res.json({ users, reviews, bathrooms, communities });
});

// GET /api/users/:id
router.get('/:id', (req, res) => {
  const user = db.prepare(
    'SELECT id,username,display_name,email,bio,avatar_text,avatar_color,is_public,birthday,city,country,relationship,mood,created_at FROM users WHERE id=?'
  ).get(req.params.id);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

  const reviews_count = db.prepare('SELECT COUNT(*) AS c FROM reviews WHERE user_id=?').get(req.params.id).c;
  const likes_total   = db.prepare('SELECT COALESCE(SUM(likes_count),0) AS t FROM reviews WHERE user_id=?').get(req.params.id).t;
  res.json({ ...user, reviews_count, likes_total });
});

// GET /api/users/birthdays/today — parcas que fazem aniversário hoje
router.get('/birthdays/today', requireAuth, (req, res) => {
  const today = new Date();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  // Verifica amigos que fazem aniversário hoje (MM-DD do campo birthday)
  const rows = db.prepare(`
    SELECT u.id, u.username, u.display_name, u.avatar_text, u.avatar_color, u.birthday
    FROM users u
    INNER JOIN friends f ON (
      (f.requester_id = ? AND f.addressee_id = u.id) OR
      (f.addressee_id = ? AND f.requester_id = u.id)
    )
    WHERE f.status = 'accepted'
      AND u.birthday IS NOT NULL
      AND substr(u.birthday, 6, 5) = ?
  `).all(req.user.id, req.user.id, `${mm}-${dd}`);
  res.json(rows);
});

// PUT /api/users/:id
router.put('/:id', requireAuth, (req, res) => {
  if (req.user.id !== req.params.id) return res.status(403).json({ error: 'Sem permissão.' });
  const { display_name, bio, avatar_text, avatar_color, is_public, birthday, city, country, relationship, mood } = req.body;
  db.prepare(`
    UPDATE users SET
      display_name = CASE WHEN ? IS NOT NULL THEN ? ELSE display_name END,
      bio          = CASE WHEN ? IS NOT NULL THEN ? ELSE bio END,
      avatar_text  = CASE WHEN ? IS NOT NULL AND ? != '' THEN ? ELSE avatar_text END,
      avatar_color = CASE WHEN ? IS NOT NULL AND ? != '' THEN ? ELSE avatar_color END,
      is_public    = CASE WHEN ? IS NOT NULL THEN ? ELSE is_public END,
      birthday     = CASE WHEN ? IS NOT NULL THEN ? ELSE birthday END,
      city         = CASE WHEN ? IS NOT NULL THEN ? ELSE city END,
      country      = CASE WHEN ? IS NOT NULL THEN ? ELSE country END,
      relationship = CASE WHEN ? IS NOT NULL THEN ? ELSE relationship END,
      mood         = CASE WHEN ? IS NOT NULL THEN ? ELSE mood END
    WHERE id=?
  `).run(
    display_name ?? null, display_name ?? null,
    bio ?? null, bio ?? null,
    avatar_text ?? null, avatar_text ?? null, avatar_text ?? null,
    avatar_color ?? null, avatar_color ?? null, avatar_color ?? null,
    is_public ?? null, is_public ?? null,
    birthday ?? null, birthday ?? null,
    city ?? null, city ?? null,
    country ?? null, country ?? null,
    relationship ?? null, relationship ?? null,
    mood ?? null, mood ?? null,
    req.params.id
  );

  const user = db.prepare(
    'SELECT id,username,display_name,email,bio,avatar_text,avatar_color,is_public,birthday,city,country,relationship,mood,created_at FROM users WHERE id=?'
  ).get(req.params.id);
  res.json(user);
});

// GET /api/users/:id/reviews
router.get('/:id/reviews', (req, res) => {
  const uid = currentUserId(req);
  const reviews = db.prepare(`${SELECT_REVIEW} WHERE r.user_id=? ORDER BY r.created_at DESC`).all(uid, req.params.id);
  res.json(reviews);
});

// POST /api/users/:id/view — registrar visita ao perfil
router.post('/:id/view', requireAuth, (req, res) => {
  if (req.params.id === req.user.id) return res.json({ ok: true });
  try {
    db.prepare(`
      INSERT INTO profile_views (viewer_id, viewed_id, viewed_at)
      VALUES (?, ?, datetime('now'))
      ON CONFLICT(viewer_id, viewed_id) DO UPDATE SET viewed_at=datetime('now')
    `).run(req.user.id, req.params.id);
  } catch (e) {
    // SQLite older: fallback
    try {
      db.prepare('DELETE FROM profile_views WHERE viewer_id=? AND viewed_id=?').run(req.user.id, req.params.id);
      db.prepare('INSERT INTO profile_views (viewer_id,viewed_id) VALUES (?,?)').run(req.user.id, req.params.id);
    } catch {}
  }
  res.json({ ok: true });
});

// GET /api/users/:id/views — quem visitou meu perfil
router.get('/:id/views', requireAuth, (req, res) => {
  if (req.params.id !== req.user.id) return res.status(403).json({ error: 'Só pode ver as visitas do seu próprio perfil.' });
  const rows = db.prepare(`
    SELECT u.id, u.username, u.display_name, u.avatar_text, u.avatar_color, pv.viewed_at
    FROM profile_views pv JOIN users u ON u.id = pv.viewer_id
    WHERE pv.viewed_id = ?
    ORDER BY pv.viewed_at DESC
    LIMIT 30
  `).all(req.params.id);
  res.json(rows);
});

// DELETE /api/users/:id — excluir própria conta (exige senha)
router.delete('/:id', requireAuth, (req, res) => {
  if (req.params.id !== req.user.id)
    return res.status(403).json({ error: 'Você só pode excluir sua própria conta.' });

  const { password } = req.body;
  if (!password)
    return res.status(400).json({ error: 'Informe sua senha para confirmar a exclusão.' });

  const bcrypt = require('bcryptjs');
  const user = db.prepare('SELECT * FROM users WHERE id=?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

  if (!bcrypt.compareSync(password, user.password_hash))
    return res.status(401).json({ error: 'Senha incorreta.' });

  // Exclui o usuário — ON DELETE CASCADE cuida das tabelas relacionadas
  db.prepare('DELETE FROM users WHERE id=?').run(req.user.id);
  res.json({ ok: true, message: 'Conta excluída com sucesso.' });
});

module.exports = router;
