require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const app = express();

app.set('trust proxy', 1);

// Segurança: headers HTTP
app.use(helmet({
  contentSecurityPolicy: false, // desabilitado pois o frontend usa inline scripts
  crossOriginEmbedderPolicy: false,
}));

const ALLOWED_ORIGINS = ['https://kgando.com', 'https://www.kgando.com', 'http://localhost:3001', 'http://localhost:3003'];
app.use(cors({
  origin: (origin, cb) => {
    // Permite sem origin (apps mobile, curl, etc) e origens permitidas
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error('Origem não permitida pelo CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));

// Rate limiting geral para API
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições. Tente novamente em alguns minutos.' },
});
app.use('/api', limiter);

// Rate limiting restrito para auth (proteção brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas de login. Aguarde 15 minutos.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Rate limiting para reset de senha
const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Muitas solicitações de reset. Tente novamente em 1 hora.' },
});
app.use('/api/auth/forgot-password', resetLimiter);
app.use('/api/auth/reset-password', resetLimiter);

app.use('/api/auth',         require('./routes/auth'));
app.use('/api/auth',         require('./routes/oauth'));
app.use('/api/reviews',      require('./routes/reviews'));
app.use('/api/bathrooms',    require('./routes/bathrooms'));
app.use('/api/communities',  require('./routes/communities'));
app.use('/api/users',        require('./routes/users'));
app.use('/api/scraps',       require('./routes/scraps'));
app.use('/api/invites',      require('./routes/invites'));
app.use('/api/friends',       require('./routes/friends'));
app.use('/api/testimonials',  require('./routes/testimonials'));
app.use('/api/votes',         require('./routes/votes'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/admin',         require('./routes/admin'));

app.get('/api/health', (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

// Painel Admin
app.get('/admin', (_req, res) => res.sendFile(path.resolve(__dirname, '../../admin.html')));

// Páginas legais
app.get('/privacidade', (_req, res) => res.sendFile(path.resolve(__dirname, '../../privacidade.html')));
app.get('/termos',      (_req, res) => res.sendFile(path.resolve(__dirname, '../../termos.html')));
app.get('/exclusao',    (_req, res) => res.sendFile(path.resolve(__dirname, '../../exclusao.html')));

// API: bug report
app.post('/api/bug-reports', (req, res) => {
  const { description, screenshot_base64, userAgent, url: pageUrl, username } = req.body;
  if (!description?.trim() && !screenshot_base64) {
    return res.status(400).json({ error: 'Descrição ou screenshot obrigatório.' });
  }
  const { sendBugReportEmail } = require('./email');
  sendBugReportEmail({ description, screenshotBase64: screenshot_base64, userAgent, pageUrl, username })
    .then(() => res.json({ ok: true }))
    .catch(err => {
      console.error('[BUG-REPORT EMAIL]', err.message);
      res.json({ ok: true }); // não falhar por conta de email
    });
});

// API: formulário de exclusão/contato de dados
app.post('/api/data-requests', (req, res) => {
  const { tipo, email, username, mensagem } = req.body;
  if (!tipo || !email) return res.status(400).json({ error: 'Tipo e e-mail são obrigatórios.' });
  // Logar a solicitação no servidor (pode ser expandido para envio de e-mail)
  console.log(`[DATA-REQUEST] ${new Date().toISOString()} | tipo=${tipo} | email=${email} | user=${username||'—'} | msg=${mensagem||'—'}`);
  res.json({ ok: true });
});

// Sitemap e robots (leitura direta para garantir Content-Type correto)
app.get('/sitemap.xml', (_req, res) => {
  const file = path.resolve(__dirname, '../../sitemap.xml');
  try {
    const content = fs.readFileSync(file, 'utf8');
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.send(content);
  } catch (e) {
    res.status(404).send('Not found');
  }
});
app.get('/robots.txt', (_req, res) => {
  const file = path.resolve(__dirname, '../../robots.txt');
  try {
    const content = fs.readFileSync(file, 'utf8');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(content);
  } catch (e) {
    res.status(404).send('Not found');
  }
});

// Serve static frontend from project root (incluindo .well-known para Digital Asset Links)
app.use(express.static(path.resolve(__dirname, '../../'), { dotfiles: 'allow' }));
app.get('*', (_req, res) => {
  res.sendFile(path.resolve(__dirname, '../../index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n💩 Kgando API → http://localhost:${PORT}\n`);
});
