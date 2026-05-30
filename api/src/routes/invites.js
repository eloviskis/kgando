const router = require('express').Router();
const { randomBytes } = require('crypto');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

function genCode() {
  return randomBytes(6).toString('hex'); // 12 chars ex: a3f9c2d1b4e7
}

// GET /api/invites/validate/:code — checar se código é válido (público)
router.get('/validate/:code', (req, res) => {
  const inv = db.prepare(`
    SELECT i.code, i.used_by, i.created_at,
           u.display_name AS inviter_name, u.avatar_text, u.avatar_color
    FROM invites i
    LEFT JOIN users u ON u.id = i.created_by
    WHERE i.code = ?
  `).get(req.params.code);

  if (!inv) return res.status(404).json({ valid: false, error: 'Convite inválido.' });
  if (inv.used_by) return res.status(410).json({ valid: false, error: 'Este convite já foi usado.' });
  res.json({ valid: true, inviter_name: inv.inviter_name, avatar_text: inv.avatar_text, avatar_color: inv.avatar_color });
});

// POST /api/invites — gerar convite para si mesmo (usuário logado)
router.post('/', requireAuth, (req, res) => {
  // Verificar se o usuário ainda existe no banco
  const user = db.prepare('SELECT id FROM users WHERE id=?').get(req.user.id);
  if (!user) return res.status(401).json({ error: 'FOREIGN KEY: Sessão inválida. Faça login novamente.' });

  // Reusar código existente não usado se já tiver
  const existing = db.prepare('SELECT code FROM invites WHERE created_by=? AND used_by IS NULL ORDER BY created_at DESC LIMIT 1').get(req.user.id);
  if (existing) return res.json({ code: existing.code });

  const code = genCode();
  db.prepare('INSERT INTO invites (code, created_by) VALUES (?,?)').run(code, req.user.id);
  res.status(201).json({ code });
});

// GET /api/invites/mine — convites que eu criei
router.get('/mine', requireAuth, (req, res) => {
  const invites = db.prepare(`
    SELECT i.*, u.display_name AS used_by_name
    FROM invites i
    LEFT JOIN users u ON u.id = i.used_by
    WHERE i.created_by = ?
    ORDER BY i.created_at DESC
  `).all(req.user.id);
  res.json(invites);
});

// POST /api/invites/email — gerar convite e enviar por email
router.post('/email', requireAuth, async (req, res) => {
  const { to_email } = req.body;
  if (!to_email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to_email.trim())) {
    return res.status(400).json({ error: 'Email inválido.' });
  }

  // Verificar se o usuário ainda existe no banco
  const user = db.prepare('SELECT id, display_name FROM users WHERE id=?').get(req.user.id);
  if (!user) return res.status(401).json({ error: 'FOREIGN KEY: Sessão inválida. Faça login novamente.' });

  // Gerar código único para este email
  const code = genCode();
  db.prepare('INSERT INTO invites (code, created_by) VALUES (?,?)').run(code, req.user.id);

  const inviter = user;

  try {
    const { sendInviteEmail } = require('../email');
    await sendInviteEmail({
      toEmail: to_email.trim(),
      inviterName: inviter?.display_name || 'Alguém',
      inviteCode: code,
    });
    res.json({ ok: true, code, message: `Convite enviado para ${to_email.trim()}` });
  } catch (err) {
    // Remover o código se o email falhou
    db.prepare('DELETE FROM invites WHERE code=?').run(code);
    console.error('[INVITE-EMAIL]', err.message);
    res.status(500).json({ error: 'Falha ao enviar email. Verifique as configurações SMTP.' });
  }
});

module.exports = router;
