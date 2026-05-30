const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomUUID, randomBytes } = require('crypto');
const { authenticator } = require('otplib');
const QRCode = require('qrcode');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
}

function auditLog(username, ip, success, reason = null) {
  try {
    db.prepare('INSERT INTO login_audit (username, ip, success, reason) VALUES (?,?,?,?)').run(username, ip, success ? 1 : 0, reason);
  } catch { /* silencioso */ }
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { username, display_name, email, password, invite_code } = req.body;
  if (!username || !display_name || !email || !password)
    return res.status(400).json({ error: 'Preencha todos os campos.' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres.' });
  if (!/^[a-zA-Z0-9_]{3,30}$/.test(username))
    return res.status(400).json({ error: 'Usuário deve ter 3-30 caracteres (letras, números e _).' });

  const existing = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username.toLowerCase(), email.toLowerCase());
  if (existing) return res.status(409).json({ error: 'Usuário ou e-mail já cadastrado.' });

  const id = randomUUID();
  const hash = bcrypt.hashSync(password, 10);
  const avatarText = display_name.slice(0, 2).toUpperCase();
  const colors = ['#8B4513', '#D4A574', '#B8956A', '#71411d', '#A0522D'];
  const avatarColor = colors[Math.floor(Math.random() * colors.length)];

  // Validar código de convite se fornecido
  if (invite_code) {
    const inv = db.prepare('SELECT code, used_by FROM invites WHERE code=?').get(invite_code);
    if (!inv) return res.status(400).json({ error: 'Código de convite inválido.' });
    if (inv.used_by) return res.status(400).json({ error: 'Este convite já foi utilizado.' });
  }

  db.prepare(
    'INSERT INTO users (id,username,display_name,email,password_hash,bio,avatar_text,avatar_color) VALUES (?,?,?,?,?,?,?,?)'
  ).run(id, username.toLowerCase(), display_name, email.toLowerCase(), hash, '', avatarText, avatarColor);

  // Marcar convite como usado
  if (invite_code) {
    db.prepare("UPDATE invites SET used_by=?, used_at=datetime('now') WHERE code=?").run(id, invite_code);
  }

  const user = db.prepare(
    'SELECT id,username,display_name,email,bio,avatar_text,avatar_color,created_at FROM users WHERE id=?'
  ).get(id);

  // Email de boas-vindas (não bloqueia resposta se falhar)
  try {
    const { sendWelcomeEmail } = require('../email');
    sendWelcomeEmail({ toEmail: user.email, displayName: user.display_name, username: user.username })
      .catch(e => console.error('[WELCOME-EMAIL]', e.message));
  } catch { /* silencioso se email não configurado */ }

  res.status(201).json({ token: signToken(user), user });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email?.trim()) return res.status(400).json({ error: 'Informe seu e-mail.' });

  const user = db.prepare('SELECT id, display_name, email FROM users WHERE email=?').get(email.trim().toLowerCase());
  // Sempre retorna 200 para não revelar se email existe
  if (!user) return res.json({ ok: true, message: 'Se o e-mail estiver cadastrado, você receberá as instruções.' });

  // Gerar token de reset (expira em 1h)
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  db.prepare(`
    INSERT INTO password_resets (token, user_id, expires_at)
    VALUES (?,?,?)
    ON CONFLICT(user_id) DO UPDATE SET token=excluded.token, expires_at=excluded.expires_at, used=0
  `).run(token, user.id, expiresAt);

  try {
    const { sendPasswordResetEmail } = require('../email');
    await sendPasswordResetEmail({ toEmail: user.email, displayName: user.display_name, resetToken: token });
  } catch (e) {
    console.error('[RESET-EMAIL]', e.message);
    return res.status(500).json({ error: 'Falha ao enviar email. Tente novamente.' });
  }

  res.json({ ok: true, message: 'Email enviado! Verifique sua caixa de entrada.' });
});

// POST /api/auth/reset-password
router.post('/reset-password', (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'Token e nova senha são obrigatórios.' });
  if (password.length < 6) return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres.' });

  const reset = db.prepare(`
    SELECT pr.token, pr.user_id, pr.expires_at, pr.used
    FROM password_resets pr
    WHERE pr.token=?
  `).get(token);

  if (!reset) return res.status(400).json({ error: 'Link inválido ou expirado.' });
  if (reset.used) return res.status(400).json({ error: 'Este link já foi utilizado.' });
  if (new Date(reset.expires_at) < new Date()) return res.status(400).json({ error: 'Link expirado. Solicite um novo.' });

  const hash = bcrypt.hashSync(password, 10);
  db.prepare('UPDATE users SET password_hash=? WHERE id=?').run(hash, reset.user_id);
  db.prepare('UPDATE password_resets SET used=1 WHERE token=?').run(token);

  res.json({ ok: true, message: 'Senha alterada com sucesso! Faça login com sua nova senha.' });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password, totp_code } = req.body;
  const ip = getClientIP(req);
  if (!username || !password)
    return res.status(400).json({ error: 'Informe usuário e senha.' });

  const user = db.prepare('SELECT * FROM users WHERE username=? OR email=?').get(username.toLowerCase(), username.toLowerCase());
  if (!user) {
    auditLog(username, ip, false, 'user_not_found');
    return res.status(401).json({ error: 'Usuário não encontrado.' });
  }

  if (!bcrypt.compareSync(password, user.password_hash)) {
    auditLog(username, ip, false, 'wrong_password');
    return res.status(401).json({ error: 'Senha incorreta.' });
  }

  if (user.banned_at) {
    auditLog(username, ip, false, 'banned');
    return res.status(403).json({ error: 'Esta conta foi suspensa. Entre em contato com o suporte.' });
  }

  // Verificar 2FA se habilitado
  if (user.totp_enabled && user.totp_secret) {
    if (!totp_code) {
      // Sinaliza que precisa do código 2FA (sem revelar token ainda)
      return res.status(200).json({ requires_2fa: true });
    }
    const valid = authenticator.verify({ token: totp_code.replace(/\s/g,''), secret: user.totp_secret });
    if (!valid) {
      auditLog(username, ip, false, '2fa_invalid');
      return res.status(401).json({ error: 'Código 2FA inválido. Tente novamente.' });
    }
  }

  auditLog(username, ip, true);
  const { password_hash, totp_secret, ...safe } = user;
  res.json({ token: signToken(safe), user: safe });
});

// ── Rotas 2FA ────────────────────────────────────────────────────────────────

// POST /api/auth/2fa/setup — gera secret e QR code para o usuário configurar
router.post('/2fa/setup', requireAuth, async (req, res) => {
  const user = db.prepare('SELECT id, username, totp_enabled FROM users WHERE id=?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
  if (user.totp_enabled) return res.status(400).json({ error: '2FA já está ativado. Desative primeiro.' });

  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(user.username, 'Kgando', secret);
  const qrDataUrl = await QRCode.toDataURL(otpauth);

  // Salva secret temporariamente (ainda não habilitado)
  db.prepare('UPDATE users SET totp_secret=? WHERE id=?').run(secret, req.user.id);

  res.json({ secret, qr_code: qrDataUrl, otpauth });
});

// POST /api/auth/2fa/confirm — confirma com o código do app e habilita 2FA
router.post('/2fa/confirm', requireAuth, (req, res) => {
  const { code } = req.body;
  const user = db.prepare('SELECT totp_secret, totp_enabled FROM users WHERE id=?').get(req.user.id);
  if (!user?.totp_secret) return res.status(400).json({ error: 'Configure o 2FA primeiro.' });
  if (user.totp_enabled) return res.status(400).json({ error: '2FA já está ativado.' });

  const valid = authenticator.verify({ token: (code||'').replace(/\s/g,''), secret: user.totp_secret });
  if (!valid) return res.status(400).json({ error: 'Código inválido. Verifique o app autenticador.' });

  db.prepare('UPDATE users SET totp_enabled=1 WHERE id=?').run(req.user.id);
  res.json({ ok: true, message: '2FA ativado com sucesso! 🔐' });
});

// POST /api/auth/2fa/disable — desativa 2FA (exige senha + código)
router.post('/2fa/disable', requireAuth, (req, res) => {
  const { password, code } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE id=?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
  if (!user.totp_enabled) return res.status(400).json({ error: '2FA não está ativo.' });

  if (!bcrypt.compareSync(password || '', user.password_hash))
    return res.status(401).json({ error: 'Senha incorreta.' });

  const valid = authenticator.verify({ token: (code||'').replace(/\s/g,''), secret: user.totp_secret });
  if (!valid) return res.status(400).json({ error: 'Código 2FA inválido.' });

  db.prepare('UPDATE users SET totp_enabled=0, totp_secret=NULL WHERE id=?').run(req.user.id);
  res.json({ ok: true, message: '2FA desativado.' });
});

// GET /api/auth/2fa/status — status do 2FA do usuário logado
router.get('/2fa/status', requireAuth, (req, res) => {
  const user = db.prepare('SELECT totp_enabled FROM users WHERE id=?').get(req.user.id);
  res.json({ totp_enabled: !!user?.totp_enabled });
});

module.exports = router;
