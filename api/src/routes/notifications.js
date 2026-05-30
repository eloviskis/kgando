const router = require('express').Router();
const { randomUUID } = require('crypto');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { sendNotificationEmail } = require('../email');

const DEFAULT_PREFS = {
  friend_request:   { app: true,  email: true  },
  friend_accepted:  { app: true,  email: true  },
  scrap:            { app: true,  email: true  },
  testimonial:      { app: true,  email: true  },
  vote:             { app: true,  email: false },
  review_like:      { app: true,  email: false },
  review_comment:   { app: true,  email: false },
  community_topic:  { app: true,  email: false },
  community_reply:  { app: true,  email: false },
};

// Helper para criar notificação (usado por outras rotas)
function createNotification({ userId, type, fromUserId, entityId, message, link }) {
  if (userId === fromUserId) return; // não notifica o próprio usuário
  try {
    // Ler prefs do destinatário
    const target = db.prepare('SELECT email, notification_prefs FROM users WHERE id=?').get(userId);
    if (!target) return;

    const prefs = target.notification_prefs
      ? { ...DEFAULT_PREFS, ...JSON.parse(target.notification_prefs) }
      : DEFAULT_PREFS;
    const pref = prefs[type] || { app: true, email: false };

    // Inserir notificação in-app
    if (pref.app !== false) {
      db.prepare(`
        INSERT INTO notifications (id, user_id, type, from_user_id, entity_id, message)
        VALUES (?,?,?,?,?,?)
      `).run(randomUUID(), userId, type, fromUserId || null, entityId || null, message);
    }

    // Enviar email
    if (pref.email === true && target.email) {
      const fromUser = fromUserId
        ? db.prepare('SELECT display_name FROM users WHERE id=?').get(fromUserId)
        : null;
      sendNotificationEmail({
        toEmail: target.email,
        type,
        fromName: fromUser?.display_name || null,
        message,
        link: link || (process.env.APP_URL || 'https://kgando.com'),
      }).catch(e => console.error('[NOTIF EMAIL]', e.message));
    }
  } catch (e) {
    console.error('[NOTIF]', e.message);
  }
}

// GET /api/notifications — lista notificações do usuário logado
router.get('/', requireAuth, (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 30, 50);
  const notifications = db.prepare(`
    SELECT n.*, u.display_name AS from_name, u.avatar_text, u.avatar_color
    FROM notifications n
    LEFT JOIN users u ON u.id = n.from_user_id
    WHERE n.user_id = ?
    ORDER BY n.created_at DESC
    LIMIT ?
  `).all(req.user.id, limit);

  const unread = db.prepare('SELECT COUNT(*) as c FROM notifications WHERE user_id=? AND read=0').get(req.user.id).c;

  res.json({ notifications, unread });
});

// PUT /api/notifications/read-all — marcar todas como lidas
router.put('/read-all', requireAuth, (req, res) => {
  db.prepare('UPDATE notifications SET read=1 WHERE user_id=?').run(req.user.id);
  res.json({ ok: true });
});

// PUT /api/notifications/:id/read — marcar uma como lida
router.put('/:id/read', requireAuth, (req, res) => {
  db.prepare('UPDATE notifications SET read=1 WHERE id=? AND user_id=?').run(req.params.id, req.user.id);
  res.json({ ok: true });
});

// DELETE /api/notifications/:id — apagar notificação
router.delete('/:id', requireAuth, (req, res) => {
  db.prepare('DELETE FROM notifications WHERE id=? AND user_id=?').run(req.params.id, req.user.id);
  res.json({ ok: true });
});

// GET /api/notifications/prefs — ler preferências do usuário logado
router.get('/prefs', requireAuth, (req, res) => {
  const row = db.prepare('SELECT notification_prefs FROM users WHERE id=?').get(req.user.id);
  const prefs = row?.notification_prefs
    ? { ...DEFAULT_PREFS, ...JSON.parse(row.notification_prefs) }
    : { ...DEFAULT_PREFS };
  res.json(prefs);
});

// PUT /api/notifications/prefs — salvar preferências do usuário logado
router.put('/prefs', requireAuth, (req, res) => {
  const incoming = req.body;
  // Merge com defaults para garantir integridade
  const merged = { ...DEFAULT_PREFS };
  for (const key of Object.keys(DEFAULT_PREFS)) {
    if (incoming[key] && typeof incoming[key] === 'object') {
      merged[key] = {
        app:   incoming[key].app   !== undefined ? !!incoming[key].app   : DEFAULT_PREFS[key].app,
        email: incoming[key].email !== undefined ? !!incoming[key].email : DEFAULT_PREFS[key].email,
      };
    }
  }
  db.prepare('UPDATE users SET notification_prefs=? WHERE id=?')
    .run(JSON.stringify(merged), req.user.id);
  res.json({ ok: true, prefs: merged });
});

module.exports = router;
module.exports.createNotification = createNotification;
module.exports.DEFAULT_PREFS = DEFAULT_PREFS;
