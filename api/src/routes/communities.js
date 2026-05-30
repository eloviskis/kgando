const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { createNotification } = require('./notifications');

function currentUserId(req) {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Bearer ')) return null;
  try { return jwt.verify(h.slice(7), process.env.JWT_SECRET).id; } catch { return null; }
}

// POST /api/communities — criar comunidade
router.post('/', requireAuth, (req, res) => {
  const { name, description, icon } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Nome obrigatório.' });
  const id = randomUUID();
  db.prepare('INSERT INTO communities (id,name,description,icon,created_by) VALUES (?,?,?,?,?)').run(
    id, name.trim(), description || '', icon || '💩', req.user.id
  );
  res.status(201).json(db.prepare('SELECT * FROM communities WHERE id=?').get(id));
});

// GET /api/communities
router.get('/', (req, res) => {
  const uid = currentUserId(req);
  const rows = db.prepare(`
    SELECT c.*,
           CASE WHEN cm.user_id IS NOT NULL THEN 1 ELSE 0 END AS is_member
    FROM communities c
    LEFT JOIN community_members cm ON cm.community_id=c.id AND cm.user_id=?
    ORDER BY c.members_count DESC
  `).all(uid);
  res.json(rows);
});

// POST /api/communities/:id/join
router.post('/:id/join', requireAuth, (req, res) => {
  if (!db.prepare('SELECT id FROM communities WHERE id=?').get(req.params.id))
    return res.status(404).json({ error: 'Comunidade não encontrada.' });

  try {
    db.prepare('INSERT INTO community_members (user_id,community_id) VALUES (?,?)').run(req.user.id, req.params.id);
    db.prepare('UPDATE communities SET members_count=members_count+1 WHERE id=?').run(req.params.id);
  } catch { /* already member */ }

  const { members_count } = db.prepare('SELECT members_count FROM communities WHERE id=?').get(req.params.id);
  res.json({ members_count, is_member: true });
});

// DELETE /api/communities/:id/leave
router.delete('/:id/leave', requireAuth, (req, res) => {
  const r = db.prepare('DELETE FROM community_members WHERE user_id=? AND community_id=?').run(req.user.id, req.params.id);
  if (r.changes === 0) return res.status(404).json({ error: 'Não é membro.' });
  db.prepare('UPDATE communities SET members_count=MAX(0,members_count-1) WHERE id=?').run(req.params.id);
  const { members_count } = db.prepare('SELECT members_count FROM communities WHERE id=?').get(req.params.id);
  res.json({ members_count, is_member: false });
});

// PUT /api/communities/:id — editar (somente dono)
router.put('/:id', requireAuth, (req, res) => {
  const c = db.prepare('SELECT * FROM communities WHERE id=?').get(req.params.id);
  if (!c) return res.status(404).json({ error: 'Comunidade não encontrada.' });
  if (c.created_by !== req.user.id) return res.status(403).json({ error: 'Só o dono pode editar.' });
  const { name, description, icon } = req.body;
  db.prepare(`UPDATE communities SET name=COALESCE(?,name), description=COALESCE(?,description), icon=COALESCE(?,icon) WHERE id=?`)
    .run(name||null, description||null, icon||null, req.params.id);
  res.json(db.prepare('SELECT * FROM communities WHERE id=?').get(req.params.id));
});

// DELETE /api/communities/:id — deletar (somente dono)
router.delete('/:id', requireAuth, (req, res) => {
  const c = db.prepare('SELECT created_by FROM communities WHERE id=?').get(req.params.id);
  if (!c) return res.status(404).json({ error: 'Comunidade não encontrada.' });
  if (c.created_by !== req.user.id) return res.status(403).json({ error: 'Só o dono pode deletar.' });
  db.prepare('DELETE FROM communities WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// GET /api/communities/:id/members — listar membros
router.get('/:id/members', (req, res) => {
  const members = db.prepare(`
    SELECT u.id, u.username, u.display_name, u.avatar_text, u.avatar_color, cm.joined_at
    FROM community_members cm
    JOIN users u ON u.id = cm.user_id
    WHERE cm.community_id = ?
    ORDER BY cm.joined_at DESC
  `).all(req.params.id);
  res.json(members);
});

// DELETE /api/communities/:id/members/:uid — remover membro (dono)
router.delete('/:id/members/:uid', requireAuth, (req, res) => {
  const c = db.prepare('SELECT created_by FROM communities WHERE id=?').get(req.params.id);
  if (!c) return res.status(404).json({ error: 'Comunidade não encontrada.' });
  if (c.created_by !== req.user.id) return res.status(403).json({ error: 'Só o dono pode remover membros.' });
  db.prepare('DELETE FROM community_members WHERE community_id=? AND user_id=?').run(req.params.id, req.params.uid);
  db.prepare('UPDATE communities SET members_count=MAX(0,members_count-1) WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// ── Fóruns / Tópicos ──────────────────────────────

// GET /api/communities/:id/topics
router.get('/:id/topics', (req, res) => {
  const rows = db.prepare(`
    SELECT t.*, u.display_name, u.username, u.avatar_text, u.avatar_color
    FROM community_topics t JOIN users u ON u.id = t.user_id
    WHERE t.community_id = ?
    ORDER BY t.created_at DESC
  `).all(req.params.id);
  res.json(rows);
});

// POST /api/communities/:id/topics
router.post('/:id/topics', requireAuth, (req, res) => {
  const { title, content } = req.body;
  if (!title?.trim() || !content?.trim()) return res.status(400).json({ error: 'Título e conteúdo obrigatórios.' });
  const community = db.prepare('SELECT id, name FROM communities WHERE id=?').get(req.params.id);
  if (!community) return res.status(404).json({ error: 'Comunidade não encontrada.' });
  const id = randomUUID();
  db.prepare('INSERT INTO community_topics (id,community_id,user_id,title,content) VALUES (?,?,?,?,?)')
    .run(id, req.params.id, req.user.id, title.trim(), content.trim());

  const result = db.prepare(`
    SELECT t.*, u.display_name, u.username, u.avatar_text, u.avatar_color
    FROM community_topics t JOIN users u ON u.id=t.user_id WHERE t.id=?
  `).get(id);

  // Notificar membros da comunidade (exceto quem criou o tópico)
  const APP_URL = process.env.APP_URL || 'https://kgando.com';
  const members = db.prepare(
    'SELECT user_id FROM community_members WHERE community_id=? AND user_id!=?'
  ).all(req.params.id, req.user.id);
  for (const { user_id } of members) {
    createNotification({
      userId: user_id,
      type: 'community_topic',
      fromUserId: req.user.id,
      entityId: id,
      message: `Novo tópico em ${community.name}: "${title.trim()}"`,
      link: `${APP_URL}/#communities`,
    });
  }

  res.status(201).json(result);
});

// DELETE /api/communities/:cid/topics/:tid
router.delete('/:cid/topics/:tid', requireAuth, (req, res) => {
  const t = db.prepare('SELECT * FROM community_topics WHERE id=? AND community_id=?').get(req.params.tid, req.params.cid);
  if (!t) return res.status(404).json({ error: 'Tópico não encontrado.' });
  const c = db.prepare('SELECT created_by FROM communities WHERE id=?').get(req.params.cid);
  if (t.user_id !== req.user.id && c?.created_by !== req.user.id)
    return res.status(403).json({ error: 'Sem permissão.' });
  db.prepare('DELETE FROM community_topics WHERE id=?').run(req.params.tid);
  res.json({ ok: true });
});

// GET /api/communities/:cid/topics/:tid/replies
router.get('/:cid/topics/:tid/replies', (req, res) => {
  const rows = db.prepare(`
    SELECT r.*, u.display_name, u.username, u.avatar_text, u.avatar_color
    FROM community_topic_replies r JOIN users u ON u.id = r.user_id
    WHERE r.topic_id = ?
    ORDER BY r.created_at ASC
  `).all(req.params.tid);
  res.json(rows);
});

// POST /api/communities/:cid/topics/:tid/replies
router.post('/:cid/topics/:tid/replies', requireAuth, (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: 'Resposta vazia.' });
  const topic = db.prepare('SELECT id, user_id, title FROM community_topics WHERE id=?').get(req.params.tid);
  if (!topic) return res.status(404).json({ error: 'Tópico não encontrado.' });
  const id = randomUUID();
  db.prepare('INSERT INTO community_topic_replies (id,topic_id,user_id,content) VALUES (?,?,?,?)')
    .run(id, req.params.tid, req.user.id, content.trim());
  db.prepare('UPDATE community_topics SET replies_count=replies_count+1 WHERE id=?').run(req.params.tid);

  const result = db.prepare(`
    SELECT r.*, u.display_name, u.username, u.avatar_text, u.avatar_color
    FROM community_topic_replies r JOIN users u ON u.id=r.user_id WHERE r.id=?
  `).get(id);

  // Notificar criador do tópico
  if (topic.user_id !== req.user.id) {
    const APP_URL = process.env.APP_URL || 'https://kgando.com';
    createNotification({
      userId: topic.user_id,
      type: 'community_reply',
      fromUserId: req.user.id,
      entityId: req.params.tid,
      message: `${result.display_name} respondeu no tópico "${topic.title}"!`,
      link: `${APP_URL}/#communities`,
    });
  }

  res.status(201).json(result);
});

// DELETE /api/communities/:cid/topics/:tid/replies/:rid
router.delete('/:cid/topics/:tid/replies/:rid', requireAuth, (req, res) => {
  const r = db.prepare('SELECT * FROM community_topic_replies WHERE id=?').get(req.params.rid);
  if (!r) return res.status(404).json({ error: 'Resposta não encontrada.' });
  const c = db.prepare('SELECT created_by FROM communities WHERE id=?').get(req.params.cid);
  if (r.user_id !== req.user.id && c?.created_by !== req.user.id)
    return res.status(403).json({ error: 'Sem permissão.' });
  db.prepare('DELETE FROM community_topic_replies WHERE id=?').run(req.params.rid);
  db.prepare('UPDATE community_topics SET replies_count=MAX(0,replies_count-1) WHERE id=?').run(req.params.tid);
  res.json({ ok: true });
});

module.exports = router;
