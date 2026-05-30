const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { randomUUID, randomBytes } = require('crypto');
const db = require('../db');

function genInviteCode() { return randomBytes(6).toString('hex'); }

// Middleware: verifica X-Admin-Key contra ADMIN_KEY no .env
function requireAdmin(req, res, next) {
  const key = req.headers['x-admin-key'];
  if (!key || key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Acesso negado.' });
  }
  next();
}

router.use(requireAdmin);

// ── Stats gerais ────────────────────────────────────────
router.get('/stats', (_req, res) => {
  const users       = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
  const reviews     = db.prepare('SELECT COUNT(*) AS c FROM reviews').get().c;
  const bathrooms   = db.prepare('SELECT COUNT(*) AS c FROM bathrooms').get().c;
  const communities = db.prepare('SELECT COUNT(*) AS c FROM communities').get().c;
  const scraps      = db.prepare('SELECT COUNT(*) AS c FROM scraps').get().c;
  const likes       = db.prepare('SELECT COUNT(*) AS c FROM review_likes').get().c;
  const comments    = db.prepare('SELECT COUNT(*) AS c FROM review_comments').get().c;
  const banned      = db.prepare("SELECT COUNT(*) AS c FROM users WHERE banned_at IS NOT NULL").get().c;

  const newUsersToday = db.prepare(
    "SELECT COUNT(*) AS c FROM users WHERE created_at >= date('now')"
  ).get().c;
  const newReviewsToday = db.prepare(
    "SELECT COUNT(*) AS c FROM reviews WHERE created_at >= date('now')"
  ).get().c;

  const activityLast7 = db.prepare(`
    SELECT date(created_at) AS day, COUNT(*) AS count
    FROM reviews WHERE created_at >= date('now', '-6 days')
    GROUP BY day ORDER BY day
  `).all();

  res.json({ users, reviews, bathrooms, communities, scraps, likes, comments, banned, newUsersToday, newReviewsToday, activityLast7 });
});

// ── Usuários ────────────────────────────────────────────
router.get('/users', (req, res) => {
  const search = req.query.q ? `%${req.query.q}%` : '%';
  const users = db.prepare(`
    SELECT u.id, u.username, u.display_name, u.email, u.avatar_text, u.avatar_color,
           u.bio, u.created_at, u.banned_at,
           COUNT(DISTINCT r.id) AS reviews_count,
           COALESCE(SUM(r.likes_count), 0) AS likes_total
    FROM users u
    LEFT JOIN reviews r ON r.user_id = u.id
    WHERE u.username LIKE ? OR u.display_name LIKE ? OR u.email LIKE ?
    GROUP BY u.id ORDER BY u.created_at DESC
  `).all(search, search, search);
  res.json(users);
});

router.put('/users/:id', (req, res) => {
  const u = db.prepare('SELECT id FROM users WHERE id=?').get(req.params.id);
  if (!u) return res.status(404).json({ error: 'Usuário não encontrado.' });
  const { display_name, bio, avatar_text, avatar_color, username, email } = req.body;
  db.prepare(`
    UPDATE users SET
      display_name = COALESCE(?,display_name),
      bio          = COALESCE(?,bio),
      avatar_text  = COALESCE(?,avatar_text),
      avatar_color = COALESCE(?,avatar_color),
      username     = COALESCE(?,username),
      email        = COALESCE(?,email)
    WHERE id=?
  `).run(display_name||null, bio||null, avatar_text||null, avatar_color||null,
         username?.toLowerCase()||null, email?.toLowerCase()||null, req.params.id);
  res.json(db.prepare('SELECT id,username,display_name,email,bio,avatar_text,avatar_color,banned_at,created_at FROM users WHERE id=?').get(req.params.id));
});

router.post('/users/:id/reset-password', (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 6) return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres.' });
  const hash = bcrypt.hashSync(password, 10);
  const r = db.prepare('UPDATE users SET password_hash=? WHERE id=?').run(hash, req.params.id);
  if (r.changes === 0) return res.status(404).json({ error: 'Usuário não encontrado.' });
  res.json({ ok: true });
});

router.post('/users/:id/toggle-ban', (req, res) => {
  const u = db.prepare('SELECT id, banned_at FROM users WHERE id=?').get(req.params.id);
  if (!u) return res.status(404).json({ error: 'Usuário não encontrado.' });
  if (u.banned_at) {
    db.prepare('UPDATE users SET banned_at=NULL WHERE id=?').run(req.params.id);
    res.json({ banned: false });
  } else {
    db.prepare("UPDATE users SET banned_at=datetime('now') WHERE id=?").run(req.params.id);
    res.json({ banned: true });
  }
});

router.delete('/users/:id', (req, res) => {
  if (!db.prepare('SELECT id FROM users WHERE id=?').get(req.params.id))
    return res.status(404).json({ error: 'Usuário não encontrado.' });
  db.prepare('DELETE FROM users WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// ── Reviews ─────────────────────────────────────────────
router.get('/reviews', (req, res) => {
  const search = req.query.q ? `%${req.query.q}%` : '%';
  const reviews = db.prepare(`
    SELECT r.*, u.display_name, u.username, u.avatar_text, u.avatar_color,
           b.name AS bathroom_name
    FROM reviews r
    JOIN users u ON u.id = r.user_id
    LEFT JOIN bathrooms b ON b.id = r.bathroom_id
    WHERE r.title LIKE ? OR u.username LIKE ? OR u.display_name LIKE ?
    ORDER BY r.created_at DESC
  `).all(search, search, search);
  res.json(reviews);
});

router.put('/reviews/:id', (req, res) => {
  if (!db.prepare('SELECT id FROM reviews WHERE id=?').get(req.params.id))
    return res.status(404).json({ error: 'Review não encontrada.' });
  const { title, comment, quality, duration, relief, smell, sticker } = req.body;
  db.prepare(`
    UPDATE reviews SET
      title    = COALESCE(?,title),
      comment  = COALESCE(?,comment),
      quality  = COALESCE(?,quality),
      duration = COALESCE(?,duration),
      relief   = COALESCE(?,relief),
      smell    = COALESCE(?,smell),
      sticker  = COALESCE(?,sticker)
    WHERE id=?
  `).run(title??null, comment??null, quality??null, duration??null,
         relief??null, smell??null, sticker??null, req.params.id);
  res.json(db.prepare('SELECT * FROM reviews WHERE id=?').get(req.params.id));
});

router.delete('/reviews/:id', (req, res) => {
  if (!db.prepare('SELECT id FROM reviews WHERE id=?').get(req.params.id))
    return res.status(404).json({ error: 'Review não encontrada.' });
  db.prepare('DELETE FROM reviews WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// ── Comentários ─────────────────────────────────────────
router.get('/comments', (req, res) => {
  const search = req.query.q ? `%${req.query.q}%` : '%';
  const comments = db.prepare(`
    SELECT rc.*, u.display_name, u.username, u.avatar_text, u.avatar_color,
           r.title AS review_title
    FROM review_comments rc
    JOIN users u ON u.id = rc.user_id
    JOIN reviews r ON r.id = rc.review_id
    WHERE rc.text LIKE ? OR u.username LIKE ?
    ORDER BY rc.created_at DESC
  `).all(search, search);
  res.json(comments);
});

router.delete('/comments/:id', (req, res) => {
  const c = db.prepare('SELECT id, review_id FROM review_comments WHERE id=?').get(req.params.id);
  if (!c) return res.status(404).json({ error: 'Comentário não encontrado.' });
  db.prepare('DELETE FROM review_comments WHERE id=?').run(req.params.id);
  db.prepare('UPDATE reviews SET comments_count=MAX(0,comments_count-1) WHERE id=?').run(c.review_id);
  res.json({ ok: true });
});

// ── Banheiros ───────────────────────────────────────────
router.get('/bathrooms', (req, res) => {
  const search = req.query.q ? `%${req.query.q}%` : '%';
  const bathrooms = db.prepare(`
    SELECT b.*, u.display_name AS creator_name
    FROM bathrooms b LEFT JOIN users u ON u.id = b.created_by
    WHERE b.name LIKE ? OR b.neighborhood LIKE ?
    ORDER BY b.created_at DESC
  `).all(search, search);
  res.json(bathrooms);
});

router.post('/bathrooms', (req, res) => {
  const { name, neighborhood, type } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Nome obrigatório.' });
  const id = randomUUID();
  db.prepare('INSERT INTO bathrooms (id,name,neighborhood,type) VALUES (?,?,?,?)').run(
    id, name.trim(), neighborhood || '', type || 'public'
  );
  res.status(201).json(db.prepare('SELECT * FROM bathrooms WHERE id=?').get(id));
});

router.put('/bathrooms/:id', (req, res) => {
  if (!db.prepare('SELECT id FROM bathrooms WHERE id=?').get(req.params.id))
    return res.status(404).json({ error: 'Banheiro não encontrado.' });
  const { name, neighborhood, type } = req.body;
  db.prepare(`
    UPDATE bathrooms SET
      name         = COALESCE(?,name),
      neighborhood = COALESCE(?,neighborhood),
      type         = COALESCE(?,type)
    WHERE id=?
  `).run(name||null, neighborhood||null, type||null, req.params.id);
  res.json(db.prepare('SELECT * FROM bathrooms WHERE id=?').get(req.params.id));
});

router.delete('/bathrooms/:id', (req, res) => {
  if (!db.prepare('SELECT id FROM bathrooms WHERE id=?').get(req.params.id))
    return res.status(404).json({ error: 'Banheiro não encontrado.' });
  db.prepare('DELETE FROM bathrooms WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// ── Comunidades ─────────────────────────────────────────
router.get('/communities', (req, res) => {
  const search = req.query.q ? `%${req.query.q}%` : '%';
  const communities = db.prepare(`
    SELECT c.*, u.display_name AS creator_name
    FROM communities c LEFT JOIN users u ON u.id = c.created_by
    WHERE c.name LIKE ? OR c.description LIKE ?
    ORDER BY c.created_at DESC
  `).all(search, search);
  res.json(communities);
});

router.post('/communities', (req, res) => {
  const { name, description, icon } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Nome obrigatório.' });
  const id = randomUUID();
  db.prepare('INSERT INTO communities (id,name,description,icon) VALUES (?,?,?,?)').run(
    id, name.trim(), description || '', icon || '💩'
  );
  res.status(201).json(db.prepare('SELECT * FROM communities WHERE id=?').get(id));
});

router.put('/communities/:id', (req, res) => {
  if (!db.prepare('SELECT id FROM communities WHERE id=?').get(req.params.id))
    return res.status(404).json({ error: 'Comunidade não encontrada.' });
  const { name, description, icon } = req.body;
  db.prepare(`
    UPDATE communities SET
      name        = COALESCE(?,name),
      description = COALESCE(?,description),
      icon        = COALESCE(?,icon)
    WHERE id=?
  `).run(name||null, description||null, icon||null, req.params.id);
  res.json(db.prepare('SELECT * FROM communities WHERE id=?').get(req.params.id));
});

router.delete('/communities/:id', (req, res) => {
  if (!db.prepare('SELECT id FROM communities WHERE id=?').get(req.params.id))
    return res.status(404).json({ error: 'Comunidade não encontrada.' });
  db.prepare('DELETE FROM communities WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// ── Convites ────────────────────────────────────────────
// GET /api/admin/invites
router.get('/invites', (_req, res) => {
  const invites = db.prepare(`
    SELECT i.*,
           uc.display_name AS creator_name, uc.username AS creator_username,
           uu.display_name AS used_by_name
    FROM invites i
    LEFT JOIN users uc ON uc.id = i.created_by
    LEFT JOIN users uu ON uu.id = i.used_by
    ORDER BY i.created_at DESC
  `).all();
  res.json(invites);
});

// POST /api/admin/invites/user/:id — gerar convite para um usuário específico
router.post('/invites/user/:id', (req, res) => {
  const user = db.prepare('SELECT id FROM users WHERE id=?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

  // Reusar código não usado se existir
  const existing = db.prepare('SELECT code FROM invites WHERE created_by=? AND used_by IS NULL').get(req.params.id);
  if (existing) return res.json({ code: existing.code });

  const code = genInviteCode();
  db.prepare('INSERT INTO invites (code, created_by) VALUES (?,?)').run(code, req.params.id);
  res.status(201).json({ code });
});

// POST /api/admin/invites/generate — gerar convite avulso (sem usuário)
router.post('/invites/generate', (_req, res) => {
  const code = genInviteCode();
  db.prepare('INSERT INTO invites (code) VALUES (?)').run(code);
  res.status(201).json({ code });
});

// DELETE /api/admin/invites/:code — revogar convite
router.delete('/invites/:code', (req, res) => {
  const r = db.prepare('DELETE FROM invites WHERE code=? AND used_by IS NULL').run(req.params.code);
  if (r.changes === 0) return res.status(404).json({ error: 'Convite não encontrado ou já foi usado.' });
  res.json({ ok: true });
});

// ── Scraps ──────────────────────────────────────────────
router.get('/scraps', (req, res) => {
  const scraps = db.prepare(`
    SELECT s.*,
           uf.display_name AS from_name, uf.avatar_text AS from_avatar, uf.avatar_color AS from_color,
           ut.display_name AS to_name,   ut.avatar_text AS to_avatar,   ut.avatar_color AS to_color
    FROM scraps s
    JOIN users uf ON uf.id = s.from_user_id
    JOIN users ut ON ut.id = s.to_user_id
    ORDER BY s.created_at DESC
  `).all();
  res.json(scraps);
});

router.delete('/scraps/:id', (req, res) => {
  if (!db.prepare('SELECT id FROM scraps WHERE id=?').get(req.params.id))
    return res.status(404).json({ error: 'Scrap não encontrado.' });
  db.prepare('DELETE FROM scraps WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
