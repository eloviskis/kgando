const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');
const db = require('../db');

const GOOGLE_AUTH_URL  = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_INFO_URL  = 'https://www.googleapis.com/oauth2/v2/userinfo';

function getRedirectUri() {
  const base = (process.env.APP_URL || 'https://kgando.com').replace(/\/$/, '');
  return `${base}/api/auth/google/callback`;
}

function signToken(user) {
  return jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function safeUsername(name) {
  return name.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_').slice(0, 28);
}

// GET /api/auth/google — redireciona para Google
router.get('/google', (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(503).send('Login com Google não configurado. Adicione GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET no .env');
  }

  const params = new URLSearchParams({
    client_id:     process.env.GOOGLE_CLIENT_ID,
    redirect_uri:  getRedirectUri(),
    response_type: 'code',
    scope:         'openid email profile',
    access_type:   'online',
    prompt:        'select_account',
  });

  res.redirect(`${GOOGLE_AUTH_URL}?${params}`);
});

// GET /api/auth/google/callback — Google redireciona aqui
router.get('/google/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error || !code) {
    return res.redirect('/?google_error=' + encodeURIComponent(error || 'Acesso negado'));
  }

  try {
    // 1. Trocar code por access_token
    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id:     process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri:  getRedirectUri(),
        grant_type:    'authorization_code',
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      const detail = tokenData.error_description || tokenData.error || 'unknown';
      console.error('[Google OAuth] token exchange failed:', detail, { redirect_uri: getRedirectUri() });
      const userMsg = tokenData.error === 'redirect_uri_mismatch'
        ? 'Redirect URI não autorizado no Google Cloud. Adicione https://kgando.com/api/auth/google/callback'
        : tokenData.error === 'invalid_client'
        ? 'Credenciais Google inválidas no servidor (CLIENT_ID/SECRET).'
        : tokenData.error === 'invalid_grant'
        ? 'Código de autorização expirado ou já usado. Tente login com Google novamente.'
        : 'Erro ao fazer login com Google. Tente novamente.';
      throw new Error(userMsg);
    }

    // 2. Buscar dados do usuário no Google
    const infoRes = await fetch(GOOGLE_INFO_URL, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const gUser = await infoRes.json();
    if (!gUser.id || !gUser.email) throw new Error('Dados incompletos');

    // 3. Verificar se usuário está banido
    const banned = db.prepare('SELECT banned_at FROM users WHERE google_id=? OR email=?').get(gUser.id, gUser.email.toLowerCase());
    if (banned?.banned_at) {
      return res.redirect('/?google_error=' + encodeURIComponent('Esta conta foi suspensa.'));
    }

    // 4. Buscar usuário existente (por google_id ou email)
    let user = db.prepare('SELECT * FROM users WHERE google_id=?').get(gUser.id)
            || db.prepare('SELECT * FROM users WHERE email=?').get(gUser.email.toLowerCase());

    if (user) {
      // Vincular google_id se ainda não estiver vinculado
      if (!user.google_id) {
        db.prepare('UPDATE users SET google_id=? WHERE id=?').run(gUser.id, user.id);
      }
    } else {
      // 5. Criar novo usuário via Google
      const id          = randomUUID();
      const displayName = gUser.name || gUser.email.split('@')[0];
      const avatarText  = displayName.slice(0, 2).toUpperCase();
      const colors      = ['#8B4513', '#D4A574', '#B8956A', '#71411d', '#A0522D'];
      const avatarColor = colors[Math.floor(Math.random() * colors.length)];

      // Gerar username único a partir do nome
      let base     = safeUsername(gUser.given_name || displayName);
      let username = base;
      let attempt  = 0;
      while (db.prepare('SELECT id FROM users WHERE username=?').get(username)) {
        attempt++;
        username = `${base}${attempt}`;
      }

      db.prepare(`
        INSERT INTO users (id, username, display_name, email, password_hash, bio, avatar_text, avatar_color, google_id)
        VALUES (?, ?, ?, ?, '', '', ?, ?, ?)
      `).run(id, username, displayName, gUser.email.toLowerCase(), avatarText, avatarColor, gUser.id);

      user = db.prepare('SELECT * FROM users WHERE id=?').get(id);
    }

    // 6. Gerar JWT e redirecionar para o app
    const token    = signToken(user);
    const userData = JSON.stringify({
      id:           user.id,
      username:     user.username,
      display_name: user.display_name,
      email:        user.email,
      bio:          user.bio,
      avatar_text:  user.avatar_text,
      avatar_color: user.avatar_color,
      created_at:   user.created_at,
    });

    // Redirecionar com token via URL (SPA vai pegar e armazenar)
    res.redirect(`/?google_token=${encodeURIComponent(token)}&google_user=${encodeURIComponent(userData)}`);

  } catch (err) {
    console.error('[Google OAuth]', err.message);
    res.redirect('/?google_error=' + encodeURIComponent(err.message || 'Erro ao fazer login com Google. Tente novamente.'));
  }
});

module.exports = router;
