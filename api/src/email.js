const nodemailer = require('nodemailer');

let _transporter = null;

function getTransporter() {
  if (_transporter) return _transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error('Configurações de email não definidas no .env');
  }

  _transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT || '587'),
    secure: SMTP_SECURE === 'true', // true = TLS porta 465; false = STARTTLS porta 587
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    tls: { rejectUnauthorized: false },
  });

  return _transporter;
}

const FROM = () => {
  // Resend exige from no domínio verificado; Umbler usa SMTP_USER diretamente
  const host = process.env.SMTP_HOST || '';
  return host.includes('resend')
    ? `"Kgando 🚽" <noreply@kgando.com>`
    : `"Kgando 🚽" <${process.env.SMTP_USER}>`;
};
const APP_URL = () => process.env.APP_URL || 'https://kgando.com';

function buildInviteHtml(inviterName, inviteCode) {
  const link = `${APP_URL()}/?invite=${inviteCode}`;
  const url = APP_URL();
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Convite Kgando</title>
</head>
<body style="margin:0;padding:0;background:#1a0a00;font-family:'Segoe UI',Arial,sans-serif">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a0a00;padding:32px 16px">
  <tr><td align="center">

  <!-- Card -->
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#2d1200;border-radius:24px;overflow:hidden;border:1px solid #5c2d0a">

    <!-- ══ HERO ══ -->
    <tr>
      <td style="background:linear-gradient(160deg,#5c1a00 0%,#8B4513 50%,#a0522d 100%);padding:48px 40px 36px;text-align:center">
        <!-- Toilet + steam -->
        <div style="font-size:72px;line-height:1;margin-bottom:4px">🚽</div>
        <div style="font-size:22px;margin-bottom:16px">💨💨</div>
        <h1 style="margin:0 0 6px;color:#fff;font-size:34px;font-weight:900;letter-spacing:-1px">Kgando</h1>
        <p style="margin:0;color:rgba(255,255,255,.7);font-size:13px;letter-spacing:2px;text-transform:uppercase">A rede social do trono 👑</p>
      </td>
    </tr>

    <!-- ══ CONVITE BADGE ══ -->
    <tr>
      <td style="padding:0 40px">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="background:linear-gradient(135deg,#ff6b00,#cc4400);border-radius:16px;padding:20px 28px;margin-top:-1px;text-align:center;transform:translateY(-20px)" align="center">
              <p style="margin:0 0 4px;color:rgba(255,255,255,.8);font-size:12px;text-transform:uppercase;letter-spacing:2px">Convite exclusivo de</p>
              <p style="margin:0;color:#fff;font-size:22px;font-weight:900">💩 ${escHtml(inviterName)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- ══ MENSAGEM ══ -->
    <tr>
      <td style="padding:0 40px 32px">
        <h2 style="margin:0 0 16px;color:#f5c88a;font-size:20px;font-weight:700">
          Você foi escolhido para entrar! 🎉
        </h2>
        <p style="margin:0 0 16px;font-size:15px;color:#d4a574;line-height:1.7">
          <strong style="color:#f5c88a">${escHtml(inviterName)}</strong> reservou um lugarzinho especial para você 
          na rede social mais honesta (e cheirosa) da internet.
        </p>
        <p style="margin:0 0 24px;font-size:14px;color:#a07040;line-height:1.7">
          No Kgando você pode:
        </p>

        <!-- Features -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px">
          <tr>
            <td style="padding:8px 0">
              <table cellpadding="0" cellspacing="0"><tr>
                <td style="font-size:24px;padding-right:12px;vertical-align:middle">🏆</td>
                <td style="color:#d4a574;font-size:14px;vertical-align:middle">Avaliar e ranquear banheiros públicos e privados</td>
              </tr></table>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0">
              <table cellpadding="0" cellspacing="0"><tr>
                <td style="font-size:24px;padding-right:12px;vertical-align:middle">👥</td>
                <td style="color:#d4a574;font-size:14px;vertical-align:middle">Adicionar amigos, trocar depoimentos e votar nos perfis</td>
              </tr></table>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0">
              <table cellpadding="0" cellspacing="0"><tr>
                <td style="font-size:24px;padding-right:12px;vertical-align:middle">🏘️</td>
                <td style="color:#d4a574;font-size:14px;vertical-align:middle">Criar e participar de comunidades temáticas</td>
              </tr></table>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0">
              <table cellpadding="0" cellspacing="0"><tr>
                <td style="font-size:24px;padding-right:12px;vertical-align:middle">📝</td>
                <td style="color:#d4a574;font-size:14px;vertical-align:middle">Compartilhar scraps e histórias do cotidiano</td>
              </tr></table>
            </td>
          </tr>
        </table>

        <!-- CTA -->
        <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:24px">
          <tr>
            <td align="center" style="background:linear-gradient(135deg,#8B4513,#cc5500);border-radius:16px">
              <a href="${link}"
                 style="display:block;padding:20px 40px;color:#fff;text-decoration:none;font-size:18px;font-weight:900;letter-spacing:-0.3px">
                🚽 Entrar no Kgando agora
              </a>
            </td>
          </tr>
        </table>

        <!-- Divider -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px">
          <tr>
            <td style="border-top:1px solid #4a2000;padding-top:16px;text-align:center">
              <p style="margin:0 0 8px;font-size:12px;color:#6b4020">Ou copie e cole o link abaixo no navegador</p>
              <div style="background:#1a0a00;border:1px solid #5c2d0a;border-radius:10px;padding:12px 16px;word-break:break-all;font-size:12px;color:#cc7733;font-family:monospace">
                ${escHtml(link)}
              </div>
            </td>
          </tr>
        </table>

        <!-- Aviso código -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="background:#2a1000;border:1px solid #4a2000;border-radius:12px;padding:14px 18px">
              <p style="margin:0;font-size:13px;color:#8B5E3C;text-align:center">
                ⚠️ Este convite é <strong style="color:#d4a574">exclusivo e de uso único</strong>. 
                Não compartilhe com ninguém.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- ══ FOOTER ══ -->
    <tr>
      <td style="background:#150800;padding:24px 40px;border-top:1px solid #3a1800">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="text-align:center">
              <p style="margin:0 0 10px;font-size:24px">🚽💩🧻</p>
              <p style="margin:0 0 8px;font-size:12px;color:#6b4020">
                Você recebeu este convite de <strong style="color:#8B5E3C">${escHtml(inviterName)}</strong> via Kgando.
              </p>
              <p style="margin:0;font-size:11px;color:#4a2800">
                <a href="${url}/privacidade" style="color:#6b4020;text-decoration:none">Privacidade</a>
                &nbsp;·&nbsp;
                <a href="${url}/termos" style="color:#6b4020;text-decoration:none">Termos</a>
                &nbsp;·&nbsp;
                <a href="${url}/exclusao" style="color:#6b4020;text-decoration:none">Exclusão de dados</a>
                &nbsp;·&nbsp;
                <a href="${url}" style="color:#6b4020;text-decoration:none">kgando.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

  </table>
  <!-- /Card -->

  </td></tr>
  </table>
  <!-- /Wrapper -->

</body>
</html>`;
}

async function sendInviteEmail({ toEmail, inviterName, inviteCode }) {
  const link = `${APP_URL()}/?invite=${inviteCode}`;
  const html = buildInviteHtml(inviterName, inviteCode);

  const text = `
💩 ${inviterName} te convidou para o Kgando!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A rede social do trono 🚽 te espera.

No Kgando você pode:
🏆 Avaliar banheiros públicos e privados
👥 Adicionar amigos e trocar depoimentos
🏘️ Criar e participar de comunidades
📝 Compartilhar scraps e histórias

Crie sua conta usando o link exclusivo:
${link}

⚠️ Este link é de uso único — não compartilhe.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
kgando.com · Privacidade · Termos · Exclusão de dados
`.trim();

  await getTransporter().sendMail({
    from: FROM(),
    to: toEmail,
    subject: `💩 ${inviterName} te convidou para o Kgando!`,
    text,
    html,
  });
}

function escHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Email de boas-vindas ──────────────────────────────────────────────────────
async function sendWelcomeEmail({ toEmail, displayName, username }) {
  const url = APP_URL();
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Bem-vindo ao Kgando</title></head>
<body style="margin:0;padding:0;background:#1a0a00;font-family:'Segoe UI',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#1a0a00;padding:32px 16px"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#2d1200;border-radius:24px;overflow:hidden;border:1px solid #5c2d0a">
  <tr><td style="background:linear-gradient(160deg,#5c1a00,#8B4513,#a0522d);padding:48px 40px 36px;text-align:center">
    <div style="font-size:72px;line-height:1;margin-bottom:4px">🚽</div>
    <h1 style="margin:0 0 6px;color:#fff;font-size:32px;font-weight:900">Bem-vindo ao Kgando!</h1>
    <p style="margin:0;color:rgba(255,255,255,.7);font-size:13px;letter-spacing:2px;text-transform:uppercase">A rede social do trono 👑</p>
  </td></tr>
  <tr><td style="padding:40px">
    <h2 style="margin:0 0 16px;color:#f5c88a;font-size:22px">Olá, ${escHtml(displayName)}! 💩</h2>
    <p style="margin:0 0 16px;font-size:15px;color:#d4a574;line-height:1.7">
      Sua conta <strong style="color:#f5c88a">@${escHtml(username)}</strong> foi criada com sucesso.<br>
      Você já faz parte da comunidade mais honesta da internet!
    </p>
    <p style="margin:0 0 32px;font-size:14px;color:#a07040;line-height:1.7">Explore a plataforma, avalie banheiros, adicione amigos e participe de comunidades.</p>
    <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:24px">
      <tr><td align="center" style="background:linear-gradient(135deg,#8B4513,#cc5500);border-radius:16px">
        <a href="${url}" style="display:block;padding:20px 40px;color:#fff;text-decoration:none;font-size:18px;font-weight:900">🚽 Acessar o Kgando</a>
      </td></tr>
    </table>
  </td></tr>
  <tr><td style="background:#150800;padding:20px 40px;border-top:1px solid #3a1800;text-align:center;font-size:12px;color:#6b4020">
    <p style="margin:0 0 8px">🚽💩🧻</p>
    <a href="${url}/privacidade" style="color:#6b4020;text-decoration:none">Privacidade</a> ·
    <a href="${url}/termos" style="color:#6b4020;text-decoration:none">Termos</a> ·
    <a href="${url}/exclusao" style="color:#6b4020;text-decoration:none">Exclusão</a>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

  await getTransporter().sendMail({
    from: FROM(),
    to: toEmail,
    subject: `🚽 Bem-vindo ao Kgando, ${displayName}!`,
    text: `Olá ${displayName}! Sua conta @${username} foi criada com sucesso no Kgando. Acesse: ${url}`,
    html,
  });
}

// ── Email de reset de senha ───────────────────────────────────────────────────
async function sendPasswordResetEmail({ toEmail, displayName, resetToken }) {
  const url = APP_URL();
  const link = `${url}/?reset_token=${resetToken}`;
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Redefinir Senha</title></head>
<body style="margin:0;padding:0;background:#1a0a00;font-family:'Segoe UI',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#1a0a00;padding:32px 16px"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#2d1200;border-radius:24px;overflow:hidden;border:1px solid #5c2d0a">
  <tr><td style="background:linear-gradient(160deg,#5c1a00,#8B4513,#a0522d);padding:48px 40px 36px;text-align:center">
    <div style="font-size:64px;line-height:1;margin-bottom:8px">🔑</div>
    <h1 style="margin:0 0 6px;color:#fff;font-size:28px;font-weight:900">Redefinir Senha</h1>
    <p style="margin:0;color:rgba(255,255,255,.7);font-size:13px">Kgando · kgando.com</p>
  </td></tr>
  <tr><td style="padding:40px">
    <h2 style="margin:0 0 16px;color:#f5c88a;font-size:20px">Olá, ${escHtml(displayName)}!</h2>
    <p style="margin:0 0 16px;font-size:15px;color:#d4a574;line-height:1.7">
      Recebemos uma solicitação para redefinir a senha da sua conta no Kgando.
    </p>
    <p style="margin:0 0 32px;font-size:14px;color:#a07040;line-height:1.7">
      Clique no botão abaixo para criar uma nova senha. O link expira em <strong style="color:#f5c88a">1 hora</strong>.
    </p>
    <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:24px">
      <tr><td align="center" style="background:linear-gradient(135deg,#8B4513,#cc5500);border-radius:16px">
        <a href="${link}" style="display:block;padding:20px 40px;color:#fff;text-decoration:none;font-size:18px;font-weight:900">🔑 Criar nova senha</a>
      </td></tr>
    </table>
    <div style="background:#1a0a00;border:1px solid #5c2d0a;border-radius:10px;padding:12px 16px;word-break:break-all;font-size:12px;color:#cc7733;font-family:monospace;margin-bottom:20px">
      ${escHtml(link)}
    </div>
    <div style="background:#2a1000;border:1px solid #4a2000;border-radius:12px;padding:14px 18px">
      <p style="margin:0;font-size:13px;color:#8B5E3C;text-align:center">
        ⚠️ Se você não solicitou isso, ignore este email. Sua senha não será alterada.
      </p>
    </div>
  </td></tr>
  <tr><td style="background:#150800;padding:20px 40px;border-top:1px solid #3a1800;text-align:center;font-size:12px;color:#6b4020">
    <a href="${url}/privacidade" style="color:#6b4020;text-decoration:none">Privacidade</a> ·
    <a href="${url}/termos" style="color:#6b4020;text-decoration:none">Termos</a>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

  await getTransporter().sendMail({
    from: FROM(),
    to: toEmail,
    subject: '🔑 Redefinir sua senha no Kgando',
    text: `Olá ${displayName}! Acesse o link para criar uma nova senha (expira em 1 hora): ${link}\n\nSe não solicitou isso, ignore este email.`,
    html,
  });
}

// ── Email de notificação genérica ─────────────────────────────────────────────
async function sendNotificationEmail({ toEmail, type, fromName, message, link }) {
  const url = APP_URL();
  const notifLink = link || url;

  const icons = {
    friend_request: '💩',
    friend_accepted: '🤝',
    scrap: '✉️',
    testimonial: '💬',
    vote: '⭐',
    review_like: '❤️',
    review_comment: '💬',
    community_topic: '☷',
    community_reply: '↩',
  };
  const icon = icons[type] || '💩';

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Kgando</title></head>
<body style="margin:0;padding:0;background:#1a0a00;font-family:'Segoe UI',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#1a0a00;padding:32px 16px"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#2d1200;border-radius:24px;overflow:hidden;border:1px solid #5c2d0a">
  <tr><td style="background:linear-gradient(160deg,#5c1a00,#8B4513,#a0522d);padding:40px 40px 32px;text-align:center">
    <div style="font-size:64px;line-height:1;margin-bottom:8px">🚽</div>
    <h1 style="margin:0 0 4px;color:#fff;font-size:26px;font-weight:900">Kgando</h1>
    <p style="margin:0;color:rgba(255,255,255,.7);font-size:12px;letter-spacing:2px;text-transform:uppercase">A rede social do trono 👑</p>
  </td></tr>
  <tr><td style="padding:40px">
    <div style="text-align:center;margin-bottom:24px">
      <div style="font-size:56px;line-height:1;margin-bottom:12px">${icon}</div>
      <p style="margin:0;font-size:18px;color:#f5c88a;font-weight:700;line-height:1.5">${escHtml(message)}</p>
      ${fromName ? `<p style="margin:8px 0 0;font-size:14px;color:#a07040">de <strong style="color:#d4a574">${escHtml(fromName)}</strong></p>` : ''}
    </div>
    <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:24px">
      <tr><td align="center" style="background:linear-gradient(135deg,#8B4513,#cc5500);border-radius:16px">
        <a href="${escHtml(notifLink)}" style="display:block;padding:18px 40px;color:#fff;text-decoration:none;font-size:16px;font-weight:900">
          💩 Ver no Kgando
        </a>
      </td></tr>
    </table>
    <p style="margin:0;font-size:12px;color:#6b4020;text-align:center">
      Você pode gerenciar suas notificações em <a href="${url}/#settings" style="color:#cc7733">Configurações</a>.
    </p>
  </td></tr>
  <tr><td style="background:#150800;padding:20px 40px;border-top:1px solid #3a1800;text-align:center;font-size:11px;color:#6b4020">
    <p style="margin:0 0 8px">🚽💩🧻</p>
    <a href="${url}/privacidade" style="color:#6b4020;text-decoration:none">Privacidade</a> ·
    <a href="${url}/termos" style="color:#6b4020;text-decoration:none">Termos</a> ·
    <a href="${url}" style="color:#6b4020;text-decoration:none">kgando.com</a>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

  await getTransporter().sendMail({
    from: FROM(),
    to: toEmail,
    subject: `${icon} Kgando — ${message}`,
    text: `${message}\n\nVer no Kgando: ${notifLink}\n\nkgando.com`,
    html,
  });
}

// ── Email de bug report ───────────────────────────────────────────────────────
async function sendBugReportEmail({ description, screenshotBase64, userAgent, pageUrl, username }) {
  const url = APP_URL();
  const imgTag = screenshotBase64
    ? `<img src="${screenshotBase64}" alt="Screenshot" style="max-width:100%;border-radius:8px;border:2px solid #5c2d0a;margin-top:12px">`
    : '<p style="color:#a07040;font-size:13px">Sem screenshot anexado.</p>';

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>Bug Report - Kgando</title></head>
<body style="margin:0;padding:0;background:#1a0a00;font-family:'Segoe UI',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#1a0a00;padding:32px 16px"><tr><td align="center">
<table width="700" cellpadding="0" cellspacing="0" style="max-width:700px;width:100%;background:#2d1200;border-radius:24px;overflow:hidden;border:2px solid #c0392b">
  <tr><td style="background:linear-gradient(160deg,#7a0000,#c0392b);padding:32px 40px;text-align:center">
    <div style="font-size:48px;line-height:1;margin-bottom:8px">🐛</div>
    <h1 style="margin:0;color:#fff;font-size:24px;font-weight:900">Bug Report — Kgando</h1>
  </td></tr>
  <tr><td style="padding:32px 40px">
    <table width="100%" cellpadding="0" cellspacing="8">
      <tr><td style="font-size:13px;color:#a07040;font-weight:700;padding:4px 0">Usuário:</td>
          <td style="font-size:13px;color:#f5c88a">${escHtml(username || 'Não autenticado')}</td></tr>
      <tr><td style="font-size:13px;color:#a07040;font-weight:700;padding:4px 0">URL:</td>
          <td style="font-size:13px;color:#f5c88a">${escHtml(pageUrl || '—')}</td></tr>
      <tr><td style="font-size:13px;color:#a07040;font-weight:700;padding:4px 0">User-Agent:</td>
          <td style="font-size:13px;color:#d4a574">${escHtml((userAgent || '').slice(0, 200))}</td></tr>
    </table>
    <div style="margin-top:24px;background:#1a0a00;border:1px solid #5c2d0a;border-radius:12px;padding:20px">
      <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#f5c88a">Descrição do bug:</p>
      <p style="margin:0;font-size:15px;color:#d4a574;line-height:1.7;white-space:pre-wrap">${escHtml(description || 'Sem descrição.')}</p>
    </div>
    <div style="margin-top:24px">
      <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#f5c88a">Screenshot:</p>
      ${imgTag}
    </div>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

  await getTransporter().sendMail({
    from: FROM(),
    to: process.env.BUG_REPORT_EMAIL || 'estou@kgando.com',
    subject: `🐛 Bug Report — Kgando ${pageUrl ? '| ' + pageUrl.replace(/^https?:\/\/[^/]+/, '') : ''}`,
    text: `Bug Report\n\nUsuário: ${username || 'N/A'}\nURL: ${pageUrl || 'N/A'}\nUser-Agent: ${userAgent || 'N/A'}\n\nDescrição:\n${description || 'Sem descrição.'}`,
    html,
  });
}

module.exports = { sendInviteEmail, sendWelcomeEmail, sendPasswordResetEmail, sendNotificationEmail, sendBugReportEmail, getTransporter, buildInviteHtml };
