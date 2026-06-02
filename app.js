/* =====================================================
   Kgando — Frontend SPA (integrado com API)
   ===================================================== */

// Em produção usa URL relativa (mesmo host); em dev aponta para localhost
const API = location.hostname === 'localhost' ? 'http://localhost:3001/api' : '/api';
const TOKEN_KEY = 'kgando:token';
const USER_KEY  = 'kgando:user';
const LANG_KEY  = 'kgando:lang';

/* ── i18n engine ─────────────────────────────────────
   Locale files (locales/pt.js, locales/en.js) são carregados
   via <script> em index.html antes deste arquivo.
   Eles registram window.LOCALES.pt / window.LOCALES.en.
   ──────────────────────────────────────────────────── */
let _locale = {};
let CURRENT_LANG = 'pt';

function loadLocale() {
  CURRENT_LANG = localStorage.getItem(LANG_KEY) || 'pt';
  _locale = (window.LOCALES && window.LOCALES[CURRENT_LANG]) || (window.LOCALES && window.LOCALES.pt) || {};
  // Atualiza lang do documento
  document.documentElement.lang = CURRENT_LANG === 'pt' ? 'pt-BR' : 'en-US';
}

function t(key, vars) {
  let str = _locale[key] || key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(`{${k}}`, v);
    }
  }
  return str;
}

// Helper para pluralização de "review/reviews" ou "avaliação/avaliações"
function pluralReviews(count) {
  if (CURRENT_LANG === 'en') {
    return count === 1 ? 'review' : 'reviews';
  }
  return count === 1 ? 'avaliação' : 'avaliações';
}

function setLang(lang) {
  localStorage.setItem(LANG_KEY, lang);
  location.reload();
}

window.toggleLang = function() {
  setLang(CURRENT_LANG === 'pt' ? 'en' : 'pt');
};

function applyShellTranslations() {
  const lang = CURRENT_LANG;
  const flag = lang === 'en' ? '🇺🇸' : '🇧🇷';

  const langBtn = document.getElementById('langToggleBtn');
  if (langBtn) langBtn.textContent = flag;

  const landingLangFlag = document.getElementById('landingLangFlag');
  if (landingLangFlag) landingLangFlag.textContent = flag;

  // Tagline da marca
  const brandSmall = document.querySelector('.brand small');
  if (brandSmall) brandSmall.textContent = t('shell.tagline');

  // Search placeholder
  const search = document.getElementById('globalSearch');
  if (search) {
    search.placeholder = t('shell.search');
    search.setAttribute('data-placeholder-lg', t('shell.searchLg'));
  }

  // Status pill
  const pill = document.getElementById('connectionStatus');
  if (pill) pill.textContent = t('shell.online');

  // Install button
  const installBtn = document.getElementById('installButton');
  if (installBtn) installBtn.textContent = t('shell.install');

  // Avatar menu
  const menuMyProfile = document.getElementById('menuMyProfile');
  if (menuMyProfile) menuMyProfile.textContent = t('shell.myProfile');
  const menuSettings = document.getElementById('menuSettings');
  if (menuSettings) menuSettings.textContent = t('shell.settings');
  const menuLogout = document.getElementById('menuLogout');
  if (menuLogout) menuLogout.textContent = t('shell.logout');

  // Left rail CTA
  const cta = document.querySelector('.primary-action');
  if (cta) { cta.innerHTML = `<span aria-hidden="true">💩</span> ${t('shell.newDump')}`; }

  // Notifications panel
  const notifTitle = document.getElementById('notifTitle');
  if (notifTitle) notifTitle.textContent = t('notif.title');
  const notifMarkAll = document.getElementById('notifMarkAll');
  if (notifMarkAll) notifMarkAll.textContent = t('notif.markAll');
  const notifCloseBtn = document.getElementById('notifCloseBtn');
  if (notifCloseBtn) notifCloseBtn.textContent = t('notif.close');

  // Footer
  const footerPrivacy = document.getElementById('footerPrivacy');
  if (footerPrivacy) footerPrivacy.textContent = t('shell.footer.privacy');
  const footerTerms = document.getElementById('footerTerms');
  if (footerTerms) footerTerms.textContent = t('shell.footer.terms');
  const footerDeletion = document.getElementById('footerDeletion');
  if (footerDeletion) footerDeletion.textContent = t('shell.footer.deletion');
  const bugReportBtn = document.getElementById('bugReportBtn');
  if (bugReportBtn) bugReportBtn.textContent = t('shell.footer.bugReport') || '🐛 Achei um Bug! QUE MER**!';
}

// ── Avatares de cocô ─────────────────────────────────────
function getPOOP_AVATARS() { return [
  { id: 'poop_plain',    emoji: '💩',    label: t('avatar.classico')   },
  { id: 'poop_hat',      emoji: '💩🎩',  label: t('avatar.chapeu')     },
  { id: 'poop_crown',    emoji: '💩👑',  label: t('avatar.coroa')      },
  { id: 'poop_bow',      emoji: '💩🎀',  label: t('avatar.lacinho')    },
  { id: 'poop_sungl',    emoji: '💩🕶️', label: t('avatar.oculos')     },
  { id: 'poop_cowboy',   emoji: '💩🤠',  label: t('avatar.cowboy')     },
  { id: 'poop_love',     emoji: '💩❤️', label: t('avatar.apaixonado') },
  { id: 'poop_star',     emoji: '💩⭐',  label: t('avatar.estrela')    },
  { id: 'poop_fire',     emoji: '💩🔥',  label: t('avatar.emChamas')   },
  { id: 'poop_nerd',     emoji: '💩🤓',  label: t('avatar.nerd')       },
  { id: 'poop_ninja',    emoji: '💩🥷',  label: t('avatar.ninja')      },
  { id: 'poop_wizard',   emoji: '💩🧙',  label: t('avatar.mago')       },
  { id: 'poop_rainbow',  emoji: '💩🌈',  label: t('avatar.arcoIris')   },
  { id: 'poop_ghost',    emoji: '💩👻',  label: t('avatar.fantasma')   },
  { id: 'poop_alien',    emoji: '💩👽',  label: t('avatar.alien')      },
  { id: 'poop_santa',    emoji: '💩🎅',  label: t('avatar.papaiNoel')  },
  { id: 'poop_angel',    emoji: '💩😇',  label: t('avatar.anjinho')    },
  { id: 'poop_devil',    emoji: '💩😈',  label: t('avatar.diabinho')   },
]; }
// Alias para compatibilidade — recalculado quando t() já está pronto
const POOP_AVATARS = [
  { id: 'poop_plain',    emoji: '💩',    label: 'Classic' },
  { id: 'poop_hat',      emoji: '💩🎩',  label: 'Top Hat' },
  { id: 'poop_crown',    emoji: '💩👑',  label: 'Crown'   },
  { id: 'poop_bow',      emoji: '💩🎀',  label: 'Bow'     },
  { id: 'poop_sungl',    emoji: '💩🕶️', label: 'Glasses' },
  { id: 'poop_cowboy',   emoji: '💩🤠',  label: 'Cowboy'  },
  { id: 'poop_love',     emoji: '💩❤️', label: 'In Love' },
  { id: 'poop_star',     emoji: '💩⭐',  label: 'Star'    },
  { id: 'poop_fire',     emoji: '💩🔥',  label: 'On Fire' },
  { id: 'poop_nerd',     emoji: '💩🤓',  label: 'Nerd'    },
  { id: 'poop_ninja',    emoji: '💩🥷',  label: 'Ninja'   },
  { id: 'poop_wizard',   emoji: '💩🧙',  label: 'Wizard'  },
  { id: 'poop_rainbow',  emoji: '💩🌈',  label: 'Rainbow' },
  { id: 'poop_ghost',    emoji: '💩👻',  label: 'Ghost'   },
  { id: 'poop_alien',    emoji: '💩👽',  label: 'Alien'   },
  { id: 'poop_santa',    emoji: '💩🎅',  label: 'Santa'   },
  { id: 'poop_angel',    emoji: '💩😇',  label: 'Angel'   },
  { id: 'poop_devil',    emoji: '💩😈',  label: 'Devil'   },
];

function getPoopAvatar(id) {
  return POOP_AVATARS.find(p => p.id === id) || null;
}

// Estilo inline de fundo para o avatar
function avBg(avatarText, avatarColor) {
  return getPoopAvatar(avatarText) ? 'background:#FFF0DC' : `background:${esc(avatarColor)}`;
}
// Conteúdo (emoji ou iniciais) para colocar dentro do avatar
function avTxt(avatarText) {
  const p = getPoopAvatar(avatarText);
  return p ? p.emoji : esc(avatarText);
}
// Classe extra quando é poop (ajusta font-size via CSS)
function avCls(avatarText) {
  return getPoopAvatar(avatarText) ? ' av-poop' : '';
}

function getNavItems() { return [
  { id: 'home',        label: t('nav.home'),        icon: '⌂' },
  { id: 'new',         label: t('nav.new'),         icon: '💩' },
  { id: 'bathrooms',   label: t('nav.bathrooms'),   icon: '🚽' },
  { id: 'communities', label: t('nav.communities'), icon: '☷' },
  { id: 'people',      label: t('nav.people'),      icon: '👥' },
  { id: 'scraps',      label: t('nav.scraps'),      icon: '✉' },
  { id: 'profile',     label: t('nav.profile'),     icon: '◉' },
  { id: 'ranking',     label: t('nav.ranking'),     icon: '★' },
  { id: 'settings',    label: t('nav.settings'),    icon: '⚙' },
]; }
// NAV_ITEMS é recalculado cada vez que renderizado, mas precisa existir como const para MOBILE_ITEMS
const NAV_ITEMS = [
  { id: 'home' }, { id: 'new' }, { id: 'bathrooms' }, { id: 'communities' },
  { id: 'people' }, { id: 'scraps' }, { id: 'profile' }, { id: 'ranking' }, { id: 'settings' },
];
const MOBILE_ITEMS = ['home', 'bathrooms', 'new', 'communities', 'profile'];

function getQualityOptions() { return [
  { value: 1, icon: '💩',          label: t('quality.1') },
  { value: 2, icon: '💩💩',        label: t('quality.2') },
  { value: 3, icon: '💩💩💩',      label: t('quality.3') },
  { value: 4, icon: '💩💩💩💩',    label: t('quality.4') },
  { value: 5, icon: '💩💩💩💩💩',  label: t('quality.5') },
]; }
function getDurationOptions() { return [
  { value: 1, icon: '⚡',  label: t('duration.1') },
  { value: 2, icon: '⏱',  label: t('duration.2') },
  { value: 3, icon: '☕',  label: t('duration.3') },
  { value: 4, icon: '📱',  label: t('duration.4') },
  { value: 5, icon: '📚',  label: t('duration.5') },
]; }
function getReliefOptions() { return [
  { value: 'light',      icon: '😌', label: t('relief.light')      },
  { value: 'satisfied',  icon: '😐', label: t('relief.satisfied')  },
  { value: 'incomplete', icon: '😰', label: t('relief.incomplete') },
]; }
function getSmellOptions() { return [
  { value: 'roses',   icon: '🌹', label: t('smell.roses')   },
  { value: 'neutral', icon: '💨', label: t('smell.neutral') },
  { value: 'toxic',   icon: '☠',  label: t('smell.toxic')   },
]; }
function getStickerOptions() { return [
  { value: 'ninja',  icon: '🥷', label: t('sticker.ninja')  },
  { value: 'crown',  icon: '👑', label: t('sticker.crown')  },
  { value: 'rocket', icon: '🚀', label: t('sticker.rocket') },
  { value: 'flower', icon: '🌼', label: t('sticker.flower') },
  { value: 'scroll', icon: '📱', label: t('sticker.scroll') },
  { value: 'medal',  icon: '🏅', label: t('sticker.medal')  },
]; }
function getBathroomTypes() { return [
  { value: 'office',     label: t('bathroom.office'),     icon: '🏢' },
  { value: 'commercial', label: t('bathroom.commercial'), icon: '🛍' },
  { value: 'restaurant', label: t('bathroom.restaurant'), icon: '🍽' },
  { value: 'gas',        label: t('bathroom.gas'),        icon: '⛽' },
  { value: 'public',     label: t('bathroom.public'),     icon: '🚻' },
  { value: 'home',       label: t('bathroom.home'),       icon: '🏠' },
  { value: 'airport',    label: t('bathroom.airport'),    icon: '✈' },
]; }
function getBadges() { return [
  { id: 'ninja',    icon: '🥷', name: t('badge.ninja.name'),    description: t('badge.ninja.desc')    },
  { id: 'gold',     icon: '🥇', name: t('badge.gold.name'),     description: t('badge.gold.desc')     },
  { id: 'explorer', icon: '🗺', name: t('badge.explorer.name'), description: t('badge.explorer.desc') },
  { id: 'perfumed', icon: '🌹', name: t('badge.perfumed.name'), description: t('badge.perfumed.desc') },
]; }
// Aliases estáticos (usados antes de loadLocale) — serão sobrepostos pelas funções acima nas renders
const QUALITY_OPTIONS  = getQualityOptions ? [] : [];
const DURATION_OPTIONS = [];
const RELIEF_OPTIONS   = [];
const SMELL_OPTIONS    = [];
const STICKERS         = [];
const BATHROOM_TYPES   = [];
const BADGES           = [];

/* ── Constantes temáticas de perfil ─────────────── */
function getMoods() { return [
  { value: 'trono',     icon: '🚽', label: t('mood.trono')     },
  { value: 'acabei',    icon: '💩', label: t('mood.acabei')    },
  { value: 'animado',   icon: '🔥', label: t('mood.animado')   },
  { value: 'feliz',     icon: '😂', label: t('mood.feliz')     },
  { value: 'entediado', icon: '😴', label: t('mood.entediado') },
  { value: 'preso',     icon: '😤', label: t('mood.preso')     },
  { value: 'incrivel',  icon: '🌟', label: t('mood.incrivel')  },
  { value: 'faminto',   icon: '😋', label: t('mood.faminto')   },
]; }
function getRelationships() { return [
  { value: '',           icon: '',   label: t('rel.none')       },
  { value: 'solteiro',   icon: '🚽', label: t('rel.solteiro')   },
  { value: 'namorando',  icon: '💑', label: t('rel.namorando')  },
  { value: 'casado',     icon: '💍', label: t('rel.casado')     },
  { value: 'complicado', icon: '💩', label: t('rel.complicado') },
]; }
const MOODS         = [];
const RELATIONSHIPS = [];

function getZodiac(birthday) {
  if (!birthday) return null;
  const [, mm, dd] = birthday.split('-').map(Number);
  const signs = [
    { key: 'capricornio', icon: '♑', end: [1,19]  },
    { key: 'aquario',     icon: '♒', end: [2,18]  },
    { key: 'peixes',      icon: '♓', end: [3,20]  },
    { key: 'aries',       icon: '♈', end: [4,19]  },
    { key: 'touro',       icon: '♉', end: [5,20]  },
    { key: 'gemeos',      icon: '♊', end: [6,20]  },
    { key: 'cancer',      icon: '♋', end: [7,22]  },
    { key: 'leao',        icon: '♌', end: [8,22]  },
    { key: 'virgem',      icon: '♍', end: [9,22]  },
    { key: 'libra',       icon: '♎', end: [10,22] },
    { key: 'escorpiao',   icon: '♏', end: [11,21] },
    { key: 'sagitario',   icon: '♐', end: [12,21] },
    { key: 'capricornio', icon: '♑', end: [12,31] },
  ];
  const found = signs.find(s => mm < s.end[0] || (mm === s.end[0] && dd <= s.end[1]));
  return found ? { ...found, sign: t(`zodiac.${found.key}`) } : null;
}

function getBirthdayDisplay(birthday) {
  if (!birthday) return null;
  const [y, m, d] = birthday.split('-').map(Number);
  const monthName = t(`month.${m}`);
  const today = new Date();
  const next = new Date(today.getFullYear(), m - 1, d);
  if (next < today) next.setFullYear(today.getFullYear() + 1);
  const diff = Math.round((next - today) / 864e5);
  const age = today.getFullYear() - y - (today < new Date(today.getFullYear(), m - 1, d) ? 1 : 0);
  const daysText = diff === 0 ? t('profile.bdayToday') : diff === 1 ? t('profile.bdayTomorrow') : t('profile.bdayDays', { n: diff });
  const ofWord = t('profile.bdayOf');
  const display = ofWord ? `${d} ${ofWord} ${monthName}` : `${monthName} ${d}`;
  return { display, age, daysText, isToday: diff === 0 };
}

/* ── State ──────────────────────────────────────── */
let currentUser       = null;
let currentPage       = 'home';
let currentCommunityId = null;
let deferredPWA       = null;
let newReviewForm = { quality: null, duration: null, relief: null, smell: null, sticker: null };

/* ── Boot ───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', boot);

async function boot() {
  loadLocale();
  
  // Espera o DOM estar pronto antes de aplicar traduções
  if (document.readyState === 'loading') {
    await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
  }
  
  applyShellTranslations();
  setupPWA();
  bindEvents();
  const urlParams = new URLSearchParams(window.location.search);

  // ── Login via Google OAuth (callback) ──────────────────
  const googleToken = urlParams.get('google_token');
  const googleUser  = urlParams.get('google_user');
  const googleError = urlParams.get('google_error');

  if (googleError) {
    // Limpar URL e mostrar erro
    window.history.replaceState({}, '', '/');
    showLandingPage();
    setTimeout(() => {
      showAuthModal();
      const errEl = document.getElementById('loginError');
      if (errEl) { errEl.textContent = decodeURIComponent(googleError); errEl.hidden = false; }
    }, 300);
    return;
  }

  if (googleToken && googleUser) {
    try {
      const user = JSON.parse(decodeURIComponent(googleUser));
      localStorage.setItem(TOKEN_KEY, googleToken);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      currentUser = user;
      // Limpar parâmetros da URL
      window.history.replaceState({}, '', '/');
      initApp();
      return;
    } catch { /* continuar fluxo normal */ }
  }

  // ── Ler código de convite da URL (?invite=CODIGO) ──────
  const inviteCode = urlParams.get('invite');
  if (inviteCode) {
    // Preencher campo após modal abrir (delay para DOM estar pronto)
    setTimeout(async () => {
      const codeInput = document.getElementById('inviteCodeInput');
      const banner    = document.getElementById('inviteBanner');
      if (codeInput) codeInput.value = inviteCode;
      // Validar convite e mostrar quem convidou
      try {
        const r = await fetch(`/api/invites/validate/${inviteCode}`);
        const inv = await r.json();
        if (inv.valid && banner) {
          banner.style.display = 'block';
          banner.textContent = t('invite.banner').replace('{name}', inv.inviter_name || '?');
        }
      } catch { /* silencioso */ }
      // Mudar tab para register
      const el = document.getElementById('tabRegister');
      if (el) el.click();
    }, 300);
  }

  // ── Link de reset de senha (?reset_token=...) ─────────────────────────────
  const resetToken = urlParams.get('reset_token');
  if (resetToken) {
    window.history.replaceState({}, '', '/');
    showAuthModal();
    setTimeout(() => {
      document.getElementById('loginForm').style.display  = 'none';
      document.getElementById('forgotForm').style.display = 'none';
      document.getElementById('resetForm').style.display  = '';
    }, 100);
    return;
  }

  // ── Link de convite de comunidade (?join=TOKEN) ────────────────────────────
  const joinToken = urlParams.get('join');
  if (joinToken) {
    window.history.replaceState({}, '', '/');
    // Verificar se o token é válido antes de mostrar qualquer coisa
    try {
      const comm = await fetch(`/api/communities/join/${joinToken}`).then(r => r.json());
      if (comm && comm.id) {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) {
          // Usuário não logado — salvar token para usar após login
          sessionStorage.setItem('pendingJoinToken', joinToken);
          showLandingPage();
          setTimeout(() => {
            showAuthModal();
            showToast(`Entre para participar de "${comm.name}"!`);
          }, 400);
          return;
        }
        // Usuário logado — entrar direto
        const raw = localStorage.getItem(USER_KEY);
        if (raw) { try { currentUser = JSON.parse(raw); } catch {} }
        try {
          await apiFetch(`/communities/join/${joinToken}`, { method: 'POST' });
          showToast(`Você entrou em "${comm.name}"! 🎉`);
        } catch(e) { /* já é membro ou outro erro — ignorar silenciosamente */ }
      }
    } catch { /* token inválido */ }
  }

  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) { showLandingPage(); return; }

  const raw = localStorage.getItem(USER_KEY);
  if (raw) {
    try { currentUser = JSON.parse(raw); } catch { /* ignore */ }
  }
  if (!currentUser) { showLandingPage(); return; }

  // Atualiza avatar imediatamente da cache (evita mostrar "FC" enquanto API carrega)
  updateHeaderAvatar();

  // Validate token by hitting /api/users/:id
  try {
    const u = await apiFetch(`/users/${currentUser.id}`);
    currentUser = { ...currentUser, ...u };
    localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
    updateHeaderAvatar(); // atualiza novamente com dados frescos da API
  } catch (e) {
    // Token inválido ou usuário não existe → forçar logout
    if (e.status === 401 || e.status === 404) { logout(); return; }
    // Network offline — continue with cached user
  }

  initApp();
}

function initApp() {
  // Ler hash da URL na inicialização para navegar para página correta
  const hash = location.hash.slice(1);
  const [page] = hash.split('?');
  currentPage = page || 'home';
  
  renderApp();
  updateConnectionStatus();
  // Garante avatar mesmo que DOM ainda esteja sendo montado
  requestAnimationFrame(() => updateHeaderAvatar());
  // Inicia polling de notificações
  startNotifPolling();
}

/* ── Auth helpers ───────────────────────────────── */
function showAuthModal() {
  const overlay = document.getElementById('authOverlay');
  overlay.style.display = 'flex';
  overlay.onclick = (e) => { if (e.target === overlay) hideAuthModal(); };
}
function hideAuthModal() {
  document.getElementById('authOverlay').style.display = 'none';
}

// Exposed to inline handlers
window.switchAuthTab = function(tab) {
  document.getElementById('loginForm').style.display    = tab === 'login'    ? '' : 'none';
  document.getElementById('registerForm').style.display = tab === 'register' ? '' : 'none';
  document.getElementById('tabLogin').classList.toggle('active',    tab === 'login');
  document.getElementById('tabRegister').classList.toggle('active', tab === 'register');
};

/* ── Landing page ───────────────────────────────── */
async function showLandingPage() {
  const root = document.getElementById('landingRoot');
  if (!root) return;
  root.style.cssText = 'display:block; position:fixed; inset:0; z-index:3500; background:#F5E6D3; overflow-y:auto; scroll-behavior:smooth;';
  root.innerHTML = buildLandingHTML();
  
  // Atualizar bandeira de idioma na landing page
  applyShellTranslations();
  scheduleInstallSync();
  
  // Carregar stats reais e atualizar
  try {
    const stats = await fetch(`${API}/users/stats`).then(r => r.json());
    const n = id => root.querySelector(`[data-stat="${id}"]`);
    if (n('reviews'))    n('reviews').textContent    = fmtNum(stats.reviews);
    if (n('users'))      n('users').textContent      = fmtNum(stats.users);
    if (n('bathrooms'))  n('bathrooms').textContent  = fmtNum(stats.bathrooms);
    if (n('communities'))n('communities').textContent= fmtNum(stats.communities);
  } catch { /* mantém placeholder */ }
}

function hideLandingPage() {
  const root = document.getElementById('landingRoot');
  if (!root) return;
  root.style.display = 'none';
  root.innerHTML = '';
}

function buildLandingHTML() {
  const flag = CURRENT_LANG === 'en' ? '🇺🇸' : '🇧🇷';
  return `
  <div class="landing-page">
    <header class="landing-header">
      <div class="landing-header__inner">
        <div class="landing-brand">
          <div class="landing-brand-mark">🚽</div>
          <div>
            <strong>Kgando <span style="font-size:0.6em;color:#FF6B6B;font-weight:900;letter-spacing:1px;">BETA</span></strong>
            <small>${t('landing.brandSub')}</small>
          </div>
        </div>
        <nav class="landing-nav">
          <button id="landingLangFlag" class="landing-lang-btn" type="button" onclick="window.toggleLang()" title="Change language / Mudar idioma">${flag}</button>
          <button class="landing-login-btn" type="button" onclick="window._landingAuth('login')">${t('landing.login')}</button>
          <button class="landing-register-btn" type="button" onclick="window._landingAuth('register')">${t('landing.registerFree')}</button>
        </nav>
      </div>
    </header>

    <section class="landing-hero">
      <div class="landing-hero__inner">
        <div class="landing-hero__text">
          <div class="landing-hero__badge">${t('landing.heroBadge')}</div>
          <h1 class="landing-hero__title">${t('landing.heroTitle')}</h1>
          <p class="landing-hero__sub">${t('landing.heroSub')}</p>
          <div class="landing-hero__actions">
            <button class="landing-cta-primary" type="button" onclick="window._landingAuth('register')">${t('landing.heroCta')}</button>
            <button class="landing-cta-secondary" type="button" onclick="window._landingAuth('login')">${t('landing.cta2')}</button>
            <button id="landingInstallBtn" class="landing-cta-install" type="button" data-action="install-app">${t('landing.installBtn')}</button>
          </div>
        </div>
        <div class="landing-hero__visual">
          <div class="landing-hero__card">
            <div class="lhc-header">
              <div class="lhc-avatar" style="background:#8B4513">JS</div>
              <div>
                <div class="lhc-name">Jaspion da Silva Sauro</div>
                <div class="lhc-time">${t('landing.mockTime')}</div>
              </div>
              <span style="margin-left:auto;font-size:20px">🥷</span>
            </div>
            <div class="lhc-title">${t('landing.mockTitle')}</div>
            <div class="lhc-ratings">
              <span>💩💩💩💩💩</span>
              <span>⚡ ${t('duration.1')}</span>
              <span>😌 ${t('relief.light')}</span>
              <span>🌹 ${t('smell.roses')}</span>
            </div>
            <div class="lhc-actions">
              <span>${t('landing.mockLikes')}</span>
              <span>${t('landing.mockComments')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="landing-stats">
      <div class="landing-stats__inner">
        <div><div class="lsi-num" data-stat="reviews">…</div><div class="lsi-lbl">${t('landing.statReviews')}</div></div>
        <div><div class="lsi-num" data-stat="bathrooms">…</div><div class="lsi-lbl">${t('landing.statBaths')}</div></div>
        <div><div class="lsi-num" data-stat="communities">…</div><div class="lsi-lbl">${t('landing.statComms')}</div></div>
        <div><div class="lsi-num" data-stat="users">…</div><div class="lsi-lbl">${t('landing.statUsers')}</div></div>
      </div>
    </section>

    <section class="landing-features">
      <div class="landing-section-inner">
        <h2 class="landing-section-title">${t('landing.featuresTitle')}</h2>
        <p class="landing-section-sub">${t('landing.featuresSub')}</p>
        <div class="landing-features-grid">
          <div class="landing-feature-card">
            <div class="lfc-icon">💩</div>
            <h3>${t('landing.card1.title')}</h3>
            <p>${t('landing.card1.desc')}</p>
          </div>
          <div class="landing-feature-card">
            <div class="lfc-icon">🚽</div>
            <h3>${t('landing.card2.title')}</h3>
            <p>${t('landing.card2.desc')}</p>
          </div>
          <div class="landing-feature-card">
            <div class="lfc-icon">☷</div>
            <h3>${t('landing.card3.title')}</h3>
            <p>${t('landing.card3.desc')}</p>
          </div>
          <div class="landing-feature-card">
            <div class="lfc-icon">✉</div>
            <h3>${t('landing.card4.title')}</h3>
            <p>${t('landing.card4.desc')}</p>
          </div>
          <div class="landing-feature-card">
            <div class="lfc-icon">🏅</div>
            <h3>${t('landing.card5.title')}</h3>
            <p>${t('landing.card5.desc')}</p>
          </div>
          <div class="landing-feature-card">
            <div class="lfc-icon">★</div>
            <h3>${t('landing.card6.title')}</h3>
            <p>${t('landing.card6.desc')}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="landing-howto">
      <div class="landing-section-inner">
        <h2 class="landing-section-title">${t('landing.howTitle')}</h2>
        <p class="landing-section-sub">${t('landing.howSub')}</p>
        <div class="landing-howto-steps">
          <div class="landing-howto-step">
            <div class="lhs-number">1</div>
            <div class="lhs-icon">💩</div>
            <h3>${t('landing.step1.title')}</h3>
            <p>${t('landing.step1.desc')}</p>
          </div>
          <div class="landing-howto-step">
            <div class="lhs-number">2</div>
            <div class="lhs-icon">🏆</div>
            <h3>${t('landing.step2.title')}</h3>
            <p>${t('landing.step2.desc')}</p>
          </div>
          <div class="landing-howto-step">
            <div class="lhs-number">3</div>
            <div class="lhs-icon">👥</div>
            <h3>${t('landing.step3.title')}</h3>
            <p>${t('landing.step3.desc')}</p>
          </div>
        </div>

        <div class="landing-howto-banner">
          <div class="lhb-emojis">🚽💩🧻🪣🚿</div>
          <p>${t('landing.howBanner')}</p>
          <button class="landing-cta-primary" type="button" onclick="window._landingAuth('register')" style="margin-top:20px">
            ${t('landing.howCta')}
          </button>
        </div>
      </div>
    </section>

    <section class="landing-contact" id="contato">
      <div class="landing-section-inner">
        <div class="landing-contact-box">
          <div class="lcb-icon">✉️</div>
          <h2>${t('landing.contactTitle')}</h2>
          <p>${t('landing.contactSub')}</p>
          <a href="mailto:estou@kgando.com" class="landing-contact-email">
            estou@kgando.com
          </a>
          <p class="landing-contact-sub">${t('landing.contactReply')}</p>
        </div>
      </div>
    </section>

    <footer class="landing-footer">
      <div class="landing-section-inner">
        <div class="lf-brand">
          <span>💩</span>
          <strong>Kgando</strong>
          <span class="lf-tagline">${t('landing.footerTagline')}</span>
        </div>
        <p class="lf-copy">${t('landing.footerCopy')}</p>
        <div class="lf-legal">
          <a href="/privacidade" target="_blank">${t('landing.privacy')}</a>
          <span>·</span>
          <a href="/termos" target="_blank">${t('landing.terms')}</a>
          <span>·</span>
          <a href="/exclusao" target="_blank">${t('landing.dataDeletion')}</a>
          <span>·</span>
          <a href="mailto:estou@kgando.com">${t('landing.contact')}</a>
        </div>
      </div>
    </footer>
  </div>
  `;
}

window._landingAuth = function(tab) {
  switchAuthTab(tab);
  showAuthModal();
};

window.handleAuthSubmit = async function(e, type) {
  e.preventDefault();
  const form = e.target;
  const errEl = document.getElementById(type === 'login' ? 'loginError' : 'registerError');
  errEl.hidden = true;
  const btn = form.querySelector('button[type=submit]');
  btn.disabled = true; btn.textContent = 'Aguarde…';

  const body = Object.fromEntries(new FormData(form));
  // Remover invite_code vazio para não enviar string vazia
  if (!body.invite_code) delete body.invite_code;
  // Limpar totp_code de espaços
  if (body.totp_code) body.totp_code = body.totp_code.replace(/\s/g, '');
  try {
    const res = await fetch(`${API}/auth/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    // 2FA necessário — mostrar campo de código
    if (res.ok && data.requires_2fa) {
      const totpField = document.getElementById('totpField');
      const totpInput = document.getElementById('totpCodeInput');
      if (totpField) { totpField.style.display = ''; totpInput?.focus(); }
      btn.disabled = false;
      btn.textContent = 'Verificar código 🔐';
      errEl.textContent = t('auth.totpNeeded');
      errEl.style.color = '#8B4513';
      errEl.hidden = false;
      return;
    }

    if (!res.ok) throw new Error(data.error || 'Erro desconhecido');

    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY,  JSON.stringify(data.user));
    currentUser = data.user;
    // Reset 2FA field
    const totpField = document.getElementById('totpField');
    if (totpField) totpField.style.display = 'none';
    hideAuthModal();
    hideLandingPage();
    // Verificar se havia um join pendente (via link de convite de comunidade)
    const pendingJoin = sessionStorage.getItem('pendingJoinToken');
    if (pendingJoin) {
      sessionStorage.removeItem('pendingJoinToken');
      try {
        const r = await apiFetch(`/communities/join/${pendingJoin}`, { method: 'POST' });
        if (r.community) showToast(`Você entrou em "${r.community.name}"! 🎉`);
      } catch { /* ignorar — já é membro ou link expirou */ }
    }
    initApp();
  } catch (err) {
    errEl.textContent = err.message;
    errEl.style.color = '';
    errEl.hidden = false;
    btn.disabled = false;
    btn.textContent = type === 'login' ? 'Entrar 🚽' : 'Criar conta 💩';
  }
};

function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  currentUser = null;
  ['pageRoot', 'desktopNav', 'rightRail', 'mobileNav'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '';
  });
  showLandingPage();
}

/* ── API fetch ──────────────────────────────────── */
async function apiFetch(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    // Sessão inválida (token de outro banco) → logout automático
    if (res.status === 500 && j.error?.includes('FOREIGN KEY')) {
      showToast(t('error.session'));
      setTimeout(() => logout(), 1500);
    }
    // 401 = token inválido/expirado → logout. 403 = sem permissão → apenas erro, sem logout
    if (res.status === 401) {
      showToast(t('error.sessionOut'));
      setTimeout(() => logout(), 1500);
    }
    const e = new Error(j.error || res.statusText);
    e.status = res.status;
    throw e;
  }
  return res.json();
}

/* ── Event binding ──────────────────────────────── */
function bindEvents() {
  if (window.__eventsBound) return;
  window.__eventsBound = true;

  document.addEventListener('click', (e) => {
    const menu = document.getElementById('avatarMenu');
    if (menu && !menu.hidden && !e.target.closest('#avatarMenu') && !e.target.closest('[data-action="toggle-avatar-menu"]')) {
      menu.hidden = true;
    }
    handleClick(e);
  });
  document.addEventListener('submit', handleSubmit);
  document.addEventListener('input',  handleInput);
  
  // Helper para extrair página do hash (sem query params)
  const handleHashChange = () => {
    const hash = location.hash.slice(1);
    const [page] = hash.split('?'); // separa página de query params
    currentPage = page || 'home';
    renderApp();
  };
  
  window.addEventListener('popstate', handleHashChange);
  window.addEventListener('hashchange', handleHashChange);
  window.addEventListener('online',  updateConnectionStatus);
  window.addEventListener('offline', updateConnectionStatus);
}

function setupPWA() {
  if (window.__pwaSetup) return;
  window.__pwaSetup = true;

  if (window.__deferredPWAEvent) deferredPWA = window.__deferredPWAEvent;

  registerServiceWorker();

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPWA = e;
    window.__deferredPWAEvent = e;
    try { sessionStorage.setItem('kgando:pwaInstall', '1'); } catch (_) {}
    syncInstallButtons();
  });

  document.addEventListener('kgando:pwa-ready', syncInstallButtons);
  window.addEventListener('pageshow', syncInstallButtons);

  window.addEventListener('appinstalled', () => {
    deferredPWA = null;
    window.__deferredPWAEvent = null;
    try { sessionStorage.removeItem('kgando:pwaInstall'); } catch (_) {}
    hideInstallButtons();
  });

  syncInstallButtons();
}

function isPWAInstallAvailable() {
  if (deferredPWA || window.__deferredPWAEvent) return true;
  try { return sessionStorage.getItem('kgando:pwaInstall') === '1'; } catch (_) { return false; }
}

function syncInstallButtons() {
  if (window.__deferredPWAEvent && !deferredPWA) deferredPWA = window.__deferredPWAEvent;
  if (!isPWAInstallAvailable()) return;
  document.querySelectorAll('[data-action="install-app"]').forEach(btn => {
    btn.hidden = false;
    btn.classList.add('pwa-install-ready');
  });
}

function hideInstallButtons() {
  document.querySelectorAll('[data-action="install-app"]').forEach(btn => {
    btn.classList.remove('pwa-install-ready');
    btn.hidden = true;
  });
}

function scheduleInstallSync() {
  syncInstallButtons();
  [50, 200, 800, 2000].forEach(ms => setTimeout(syncInstallButtons, ms));
}

function handleClick(e) {
  const el = e.target.closest('[data-page],[data-action]');
  if (!el) return;

  const page   = el.dataset.page;
  const action = el.dataset.action;

  if (page) {
    const menu = document.getElementById('avatarMenu');
    if (menu) menu.hidden = true;
    navigateTo(page);
    return;
  }

  if (action === 'install-app') {
    const promptEvent = deferredPWA || window.__deferredPWAEvent;
    if (promptEvent) {
      promptEvent.prompt();
      promptEvent.userChoice.then(({ outcome }) => {
        deferredPWA = null;
        window.__deferredPWAEvent = null;
        if (outcome === 'accepted') {
          try { sessionStorage.removeItem('kgando:pwaInstall'); } catch (_) {}
          hideInstallButtons();
        } else {
          // Mantém botões visíveis — o navegador pode reenviar o evento depois
          syncInstallButtons();
        }
      }).catch(() => syncInstallButtons());
    } else if (isPWAInstallAvailable()) {
      showToast(t('landing.installHint'));
    }
    return;
  }
  if (action === 'logout') { logout(); return; }
  if (action === 'open-notifications') { toggleNotifPanel(); return; }
  if (action === 'toggle-avatar-menu') {
    const menu = document.getElementById('avatarMenu');
    if (menu) menu.hidden = !menu.hidden;
    return;
  }
  if (action === 'toggle-lang') {
    setLang(CURRENT_LANG === 'pt' ? 'en' : 'pt');
    return;
  }
  if (action === 'toggle-like') {
    const reviewId = el.dataset.id;
    const liked    = el.dataset.liked === '1';
    toggleLike(reviewId, liked, el);
    return;
  }
  if (action === 'toggle-comments') {
    const reviewId = el.dataset.id;
    const section = document.getElementById(`comments-${reviewId}`);
    if (!section) return;
    const wasHidden = section.hidden;
    section.hidden = false;
    if (wasHidden) loadComments(reviewId);
    else section.hidden = true;
    return;
  }
  if (action === 'edit-review') {
    openEditReviewModal(el.dataset.id);
    return;
  }
  if (action === 'delete-review') {
    if (!confirm(t('review.deleteConfirm'))) return;
    apiFetch(`/reviews/${el.dataset.id}`, { method: 'DELETE' })
      .then(() => { el.closest('.review-card')?.remove(); showToast(t('review.delete')); })
      .catch(err => showToast(err.message));
    return;
  }
  if (action === 'delete-comment') {
    if (!confirm(t('review.commentDeleteConfirm'))) return;
    const { id, reviewId: rid } = el.dataset;
    apiFetch(`/reviews/${rid}/comments/${id}`, { method: 'DELETE' })
      .then(() => {
        el.closest('.comment-item')?.remove();
        const counter = document.querySelector(`[data-action="toggle-comments"][data-id="${rid}"]`);
        if (counter) { const m = counter.textContent.match(/\d+/); if (m) counter.textContent = `💬 ${Math.max(0, parseInt(m[0])-1)}`; }
        showToast(t('misc.commentDeleted'));
      })
      .catch(err => showToast(err.message));
    return;
  }
  if (action === 'toggle-react-picker') {
    const picker = document.getElementById(`react-picker-${el.dataset.cid}`);
    if (picker) picker.hidden = !picker.hidden;
    return;
  }
  if (action === 'do-comment-react') {
    const { cid, rid, emoji } = el.dataset;
    if (!currentUser) { showToast('Entre para reagir.'); return; }
    if (el.disabled) return;
    el.disabled = true;
    apiFetch(`/reviews/${rid}/comments/${cid}/react`, { method: 'POST', body: JSON.stringify({ emoji }) })
      .then(res => {
        // Atualiza pills
        const pillsEl = document.getElementById(`react-pills-${cid}`);
        if (pillsEl) {
          pillsEl.innerHTML = res.reactions.map(r => `
            <button type="button" class="react-pill${res.my_reaction === r.emoji ? ' mine' : ''}"
                    data-action="do-comment-react" data-cid="${cid}" data-rid="${rid}" data-emoji="${r.emoji}">
              ${r.emoji} <span>${r.count}</span>
            </button>`).join('');
        }
        // Atualiza picker
        const picker = document.getElementById(`react-picker-${cid}`);
        if (picker) {
          picker.querySelectorAll('.react-pick-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.emoji === res.my_reaction);
          });
          picker.hidden = true;
        }
        // Atualiza botão toggle
        const toggleBtn = document.querySelector(`[data-action="toggle-react-picker"][data-cid="${cid}"]`);
        if (toggleBtn) toggleBtn.classList.toggle('has-react', !!res.my_reaction);
      })
      .catch(err => showToast(err.message))
      .finally(() => { el.disabled = false; });
    return;
  }
  if (action === 'delete-scrap') {
    if (!confirm(t('scraps.deleteConfirm'))) return;
    apiFetch(`/scraps/${el.dataset.id}`, { method: 'DELETE' })
      .then(() => { el.closest('.scrap-card')?.remove(); showToast(t('scraps.deleted')); })
      .catch(err => showToast(err.message));
    return;
  }
  if (action === 'add-friend') {
    apiFetch(`/friends/${el.dataset.userId}`, { method: 'POST' })
      .then(() => { el.textContent = t('profile.friendPending'); el.disabled = true; showToast(t('profile.friendSent')); })
      .catch(err => showToast(err.message));
    return;
  }
  if (action === 'accept-friend') {
    const btn = el;
    btn.disabled = true;
    apiFetch(`/friends/${el.dataset.id}/accept`, { method: 'PUT' })
      .then(() => { 
        el.closest('.friend-request-row')?.remove(); 
        showToast(t('profile.friendAccepted')); 
        setTimeout(() => renderApp(), 300);
      })
      .catch(err => {
        showToast(err.message);
        btn.disabled = false;
      });
    return;
  }
  if (action === 'remove-friend') {
    if (!confirm(t('profile.removeFriendConfirm'))) return;
    apiFetch(`/friends/${el.dataset.userId}`, { method: 'DELETE' })
      .then(() => { showToast(t('profile.friendRemoved')); renderApp(); })
      .catch(err => showToast(err.message));
    return;
  }
  if (action === 'vote-profile') {
    const { userId, voteType } = el.dataset;
    const isVoted = el.classList.contains('voted');
    const method = isVoted ? 'DELETE' : 'POST';
    apiFetch(`/votes/${userId}`, { method, body: JSON.stringify({ vote_type: voteType }) })
      .then(() => {
        el.classList.toggle('voted');
        const cnt = el.querySelector('.vote-cnt');
        if (cnt) cnt.textContent = parseInt(cnt.textContent || 0) + (isVoted ? -1 : 1);
        showToast(isVoted ? t('profile.voteRemoved') : t('profile.voteAdded'));
      })
      .catch(err => showToast(err.message));
    return;
  }
  if (action === 'write-testimonial') {
    openTestimonialModal(el.dataset.userId, el.dataset.userName);
    return;
  }
  if (action === 'delete-testimonial') {
    if (!confirm(t('testimonial.deleteConfirm'))) return;
    apiFetch(`/testimonials/${el.dataset.id}`, { method: 'DELETE' })
      .then(() => { el.closest('.testimonial-card')?.remove(); showToast(t('testimonial.delete')); })
      .catch(err => showToast(err.message));
    return;
  }
  if (action === 'open-community-forum') {
    openCommunityForumModal(el.dataset.id, el.dataset.name);
    return;
  }
  if (action === 'open-community-page') {
    currentCommunityId = el.dataset.id;
    currentPage = 'community';
    history.pushState(null, '', '#community');
    renderApp();
    document.getElementById('pageRoot').scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  if (action === 'open-topic') {
    openTopicModal(el.dataset.communityId, el.dataset.topicId);
    return;
  }
  if (action === 'join-community') {
    const id     = el.dataset.id;
    const joined = el.dataset.joined === '1';
    toggleCommunity(id, joined, el);
    return;
  }
  if (action === 'view-profile') {
    const uid = el.dataset.userId;
    currentPage = 'profile';
    history.pushState(null, '', '#profile');
    renderDesktopNav();
    renderMobileNav();
    const root = document.getElementById('pageRoot');
    root.innerHTML = '<div class="spinner"></div>';
    renderProfilePage(root, uid);
    root.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  if (action === 'show-user-reviews') {
    openUserReviewsModal(el.dataset.userId, el.dataset.userName);
    return;
  }
  if (action === 'show-user-likes') {
    openUserLikesModal(el.dataset.userId, el.dataset.userName);
    return;
  }
  if (action === 'show-user-parcas') {
    openUserParcasModal(el.dataset.userId, el.dataset.userName);
    return;
  }
  if (action === 'share-profile') {
    shareProfile(el.dataset.userId, el.dataset.userName);
    return;
  }
  if (action === 'instagram-review') {
    openInstagramModal(el.dataset.id);
    return;
  }
  if (action === 'open-review-modal') {
    openReviewModal();
    return;
  }
  if (action === 'send-scrap-to') {
    openSendScrapModal(el.dataset.userId, el.dataset.userName);
    return;
  }
  if (action === 'close-modal') {
    document.getElementById('modalHost').innerHTML = '';
    return;
  }
  if (action === 'open-gif-picker') {
    const targetId = el.dataset.targetId;
    const targetEl = targetId
      ? document.getElementById(targetId)
      : el.closest('form')?.querySelector('input[type="text"], textarea');
    if (targetEl) openGifPicker(targetEl);
    return;
  }
  if (action === 'invite-friend') {
    openInviteModal();
    return;
  }
  if (action === 'open-community') {
    openCommunityModal(el.dataset.id);
    return;
  }
  if (action === 'create-community') {
    openCreateCommunityModal();
    return;
  }
}

function handleSubmit(e) {
  const id = e.target.id;
  if (id === 'reviewForm') { e.preventDefault(); submitReview(e.target); return; }
  if (id === 'bathroomForm') { e.preventDefault(); submitBathroom(e.target); return; }
  if (id === 'scrapForm') { e.preventDefault(); submitScrap(e.target); return; }
  if (id === 'profileForm') { e.preventDefault(); submitProfile(e.target); return; }
  if (id === 'createCommForm') { e.preventDefault(); submitCreateCommunity(e.target); return; }
  // Comment forms have dynamic ids
  if (e.target.classList.contains('comment-form')) {
    e.preventDefault(); submitComment(e.target);
  }
}

function handleInput(e) {
  const q = document.getElementById('globalSearch');
  if (e.target === q) {
    const v = q.value.trim();
    const panel = document.getElementById('searchPanel');
    panel.hidden = v.length < 2;
    if (v.length >= 2) renderSearchResults(v);
  }
}

/* ── Navigation ─────────────────────────────────── */
function navigateTo(page) {
  currentPage = page;
  history.pushState(null, '', `#${page}`);
  renderApp();
  document.getElementById('pageRoot').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ── Render app shell ───────────────────────────── */
function renderApp() {
  if (!currentUser) return;
  renderMiniProfile();
  renderDesktopNav();
  renderMobileNav();
  renderRightRail();
  renderPage();
  updateHeaderAvatar();
}

function updateHeaderAvatar() {
  const el = document.getElementById('headerAvatar');
  if (!el || !currentUser) return;
  const poop = getPoopAvatar(currentUser.avatar_text);
  el.textContent = poop ? poop.emoji : (currentUser.avatar_text || '??');
  el.style.background = poop ? '#FFF0DC' : (currentUser.avatar_color || '#8B4513');
  el.classList.toggle('av-poop', !!poop);
}

async function renderMiniProfile() {
  const el = document.getElementById('miniProfile');
  if (!el || !currentUser) return;
  let parcasCount = currentUser.parcas_count ?? '—';
  try {
    const friends = await apiFetch('/friends').catch(() => []);
    parcasCount = friends.length;
    currentUser.parcas_count = parcasCount;
  } catch { /* usa o cache */ }
  const moodObj = MOODS.find(m => m.value === currentUser.mood);
  el.innerHTML = `
    <div class="avatar avatar--large${avCls(currentUser.avatar_text)}" style="${avBg(currentUser.avatar_text,currentUser.avatar_color)}">${avTxt(currentUser.avatar_text)}</div>
    <div class="panel-name">${esc(currentUser.display_name)}</div>
    <div class="panel-title">@${esc(currentUser.username)}</div>
    ${moodObj ? `<div class="panel-mood">${moodObj.icon} ${moodObj.label}</div>` : ''}
    <div class="panel-stats">
      <button class="panel-stat-btn" data-action="show-user-reviews" data-user-id="${currentUser.id}" data-user-name="${esc(currentUser.display_name)}" type="button">
        <div class="stat-num">${currentUser.reviews_count || 0}</div>
        <div class="stat-lbl">cagadas</div>
      </button>
      <button class="panel-stat-btn" data-action="show-user-parcas" data-user-id="${currentUser.id}" data-user-name="${esc(currentUser.display_name)}" type="button">
        <div class="stat-num">${parcasCount}</div>
        <div class="stat-lbl">parças</div>
      </button>
      <button class="panel-stat-btn" data-action="show-user-likes" data-user-id="${currentUser.id}" data-user-name="${esc(currentUser.display_name)}" type="button">
        <div class="stat-num">${currentUser.likes_total  || 0}</div>
        <div class="stat-lbl">curtidas</div>
      </button>
    </div>
  `;
}

function renderDesktopNav() {
  const nav = document.getElementById('desktopNav');
  if (!nav) return;
  nav.innerHTML = getNavItems().map(n => `
    <button class="nav-item${currentPage === n.id ? ' active' : ''}" data-page="${n.id}" type="button">
      <span class="nav-item__icon">${n.icon}</span>
      ${esc(n.label)}
    </button>
  `).join('') + `
    <button class="nav-item" data-action="logout" type="button">
      <span class="nav-item__icon">↩</span>
      ${t('nav.logout')}
    </button>
  `;
}

function renderMobileNav() {
  const nav = document.getElementById('mobileNav');
  if (!nav) return;
  const allNavItems = getNavItems();
  const items = MOBILE_ITEMS.map(id => allNavItems.find(n => n.id === id)).filter(Boolean);
  nav.innerHTML = `<div class="bottom-nav-items">${items.map(n => `
    <button class="bottom-nav-item${n.id === 'new' ? ' center-btn' : (currentPage === n.id ? ' active' : '')}"
            data-page="${n.id}" type="button">
      <span class="icon">${n.icon}</span>
      <span>${n.id === 'new' ? '' : esc(n.label)}</span>
    </button>
  `).join('')}</div>`;
}

/* ── Right rail ─────────────────────────────────── */
async function renderRightRail() {
  const rail = document.getElementById('rightRail');
  if (!rail) return;
  rail.innerHTML = `<div class="spinner"></div>`;

  if (currentPage === 'home') {
    renderHomeRightRail(rail);
  } else {
    renderDefaultRightRail(rail);
  }
}

async function renderHomeRightRail(rail) {
  const [baths, reviewsData, userReviews] = await Promise.all([
    apiFetch('/bathrooms?limit=3').catch(() => []),
    apiFetch('/reviews?limit=50').catch(() => ({ reviews: [] })),
    apiFetch(`/users/${currentUser.id}/reviews`).catch(() => []),
  ]);

  const reviews = reviewsData.reviews || [];
  const badges  = computeBadges(userReviews);

  // Build ranking from reviews
  const userMap = {};
  for (const r of reviews) {
    if (!userMap[r.user_id]) userMap[r.user_id] = { id: r.user_id, name: r.display_name, username: r.username, avatar_text: r.avatar_text, avatar_color: r.avatar_color, likes: 0, count: 0 };
    userMap[r.user_id].likes += r.likes_count;
    userMap[r.user_id].count++;
  }
  const ranked = Object.values(userMap).sort((a, b) => b.likes - a.likes).slice(0, 5);
  const medals = ['🥇','🥈','🥉'];

  const rankHTML = ranked.length ? ranked.map((u, i) => `
    <div class="ranking-widget-item">
      <div class="rwi-pos">${medals[i] || `#${i+1}`}</div>
      <button class="avatar avatar--small user-link${avCls(u.avatar_text)}" style="${avBg(u.avatar_text,u.avatar_color)};border:none;width:32px;height:32px;flex-shrink:0"
              data-action="view-profile" data-user-id="${u.id}">${avTxt(u.avatar_text)}</button>
      <div class="rwi-info">
        <div class="rwi-name">${esc(u.name)}</div>
        <div class="rwi-sub">${u.count} ${pluralReviews(u.count)}</div>
      </div>
      <div class="rwi-score">${u.likes} ❤️</div>
    </div>
  `).join('') : '<p style="font-size:13px;color:var(--muted)">Sem dados ainda</p>';

  // Badges widget
  const badgesHTML = badges.length
    ? `<div class="badges-widget-grid">${badges.map(b => `
        <div class="bwg-item">
          <div class="bwg-icon">${b.icon}</div>
          <div class="bwg-name">${b.name}</div>
        </div>`).join('')}</div>`
    : '<p style="font-size:13px;color:var(--muted)">Continue avaliando para ganhar badges!</p>';

  // Bathrooms
  const bathList = (Array.isArray(baths) ? baths : []).slice(0, 3).map(b => {
    const t = BATHROOM_TYPES.find(x => x.value === b.type);
    return `<div class="bathroom-item">
      <div class="bathroom-icon">${t ? t.icon : '🚽'}</div>
      <div class="bathroom-info"><h5>${esc(b.name)}</h5><p>${esc(b.neighborhood)}</p></div>
      <div class="bathroom-rating">⭐ ${Number(b.rating).toFixed(1)}</div>
    </div>`;
  }).join('') || '<p style="font-size:13px;color:var(--muted)">Sem banheiros cadastrados</p>';

  rail.innerHTML = `
    <div class="widget">
      <div class="widget-title">${t('home.weeklyRanking')}</div>
      ${rankHTML}
    </div>
    <div class="widget">
      <div class="widget-title">${t('home.yourBadges')}</div>
      ${badgesHTML}
    </div>
    <div class="widget">
      <div class="widget-title">${t('home.featuredBathrooms')}</div>
      ${bathList}
    </div>
  `;
}

async function renderDefaultRightRail(rail) {
  const [baths, comms] = await Promise.all([
    apiFetch('/bathrooms?limit=4').catch(() => []),
    apiFetch('/communities').catch(() => []),
  ]).catch(() => [[], []]);

  const bathList = (Array.isArray(baths) ? baths : []).slice(0,4).map(b => {
    const t = BATHROOM_TYPES.find(x => x.value === b.type);
    return `<div class="bathroom-item">
      <div class="bathroom-icon">${t ? t.icon : '🚽'}</div>
      <div class="bathroom-info"><h5>${esc(b.name)}</h5><p>${esc(b.neighborhood)}</p></div>
      <div class="bathroom-rating">⭐ ${Number(b.rating).toFixed(1)}</div>
    </div>`;
  }).join('') || '<p style="font-size:13px;color:var(--muted)">Sem banheiros cadastrados</p>';

  const commList = (Array.isArray(comms) ? comms : []).slice(0,4).map(c => `
    <div class="community-item" style="cursor:pointer" onclick="currentPage='community';currentCommunityId=${c.id};renderPage()">
      <div class="community-icon">${c.icon}</div>
      <div class="community-info"><h5>${esc(c.name)}</h5><p>${fmtNum(c.members_count)} membros</p></div>
      <button class="join-btn${c.is_member ? ' joined' : ''}"
              data-action="join-community" data-id="${c.id}" data-joined="${c.is_member ? 1 : 0}"
              onclick="event.stopPropagation()">
        ${c.is_member ? 'Entrou' : 'Entrar'}
      </button>
    </div>
  `).join('') || '<p style="font-size:13px;color:var(--muted)">Sem comunidades</p>';

  rail.innerHTML = `
    <div class="widget">
      <div class="widget-title">${t('home.featuredBathrooms')}</div>
      ${bathList}
    </div>
    <div class="widget">
      <div class="widget-title">☷ Comunidades em alta</div>
      ${commList}
    </div>
  `;
}

/* ── Page router ────────────────────────────────── */
function renderPage() {
  const root = document.getElementById('pageRoot');
  root.innerHTML = `<div class="spinner"></div>`;
  
  // Parse query params para perfil compartilhado
  const hash = location.hash.slice(1);
  const [page, query] = hash.split('?');
  const params = new URLSearchParams(query);
  
  switch (currentPage) {
    case 'home':        renderHomePage(root);        break;
    case 'new':         renderNewPage(root);          break;
    case 'bathrooms':   renderBathroomsPage(root);    break;
    case 'communities': renderCommunitiesPage(root);  break;
    case 'community':   renderCommunityPage(root);    break;
    case 'scraps':      renderScrapsPage(root);       break;
    case 'people':      renderPeoplePage(root);       break;
    case 'profile':     
      const userId = params.get('id');
      renderProfilePage(root, userId);
      break;
    case 'ranking':     renderRankingPage(root);      break;
    case 'settings':    renderSettingsPage(root);     break;
    default:            renderHomePage(root);
  }
}

/* ── Home page (Orkut style) ────────────────────── */
async function renderHomePage(root) {
  root.innerHTML = '<div class="spinner"></div>';

  let scraps, userReviews, userComms, friends;
  try {
    [scraps, userReviews, userComms, friends] = await Promise.all([
      apiFetch('/scraps').catch(() => []),
      apiFetch(`/users/${currentUser.id}/reviews`).catch(() => []),
      apiFetch('/communities').catch(() => []),
      apiFetch('/friends').catch(() => []),
    ]);
  } catch {
    root.innerHTML = errorState(t('error.loadPage'));
    return;
  }

  const reviews = [];
  const feedData = { reviews: [], total: 0 };
  const badges  = computeBadges(userReviews);
  const parcasCount = Array.isArray(friends) ? friends.length : 0;
  currentUser.parcas_count = parcasCount;

  // "Quem sou eu" box
  const badgesHTML = badges.length
    ? badges.map(b => `<div class="owai-badge">${b.icon} ${b.name}</div>`).join('')
    : `<span style="font-size:12px;color:var(--muted)">${t('home.noBadges')}</span>`;

  const whoAmI = `
    <div class="orkut-box">
      <div class="orkut-box-header">
        <h3>${t('home.whoAmI')}</h3>
        <button class="orkut-box-link" type="button" data-action="edit-profile">${t('home.editBtn')}</button>
      </div>
      <div class="orkut-box-body">
        <div class="owai-body">
          <div class="avatar avatar--large${avCls(currentUser.avatar_text)}" style="${avBg(currentUser.avatar_text,currentUser.avatar_color)};flex-shrink:0">${avTxt(currentUser.avatar_text)}</div>
          <div class="owai-right">
            <div class="owai-name">${esc(currentUser.display_name)}</div>
            <div class="owai-username">@${esc(currentUser.username)}</div>
            ${currentUser.bio
              ? `<div class="owai-bio">${esc(currentUser.bio)}</div>`
              : `<div class="owai-bio owai-bio-empty">${t('home.noBio')}</div>`
            }
            <div class="owai-badges">${badgesHTML}</div>
            <div class="owai-stats-bar">
              <button class="owai-stat" data-action="show-user-reviews" data-user-id="${currentUser.id}" data-user-name="${esc(currentUser.display_name)}" type="button">
                <div class="owai-stat-num">${currentUser.reviews_count || userReviews.length || 0}</div>
                <div class="owai-stat-lbl">${t('home.reviews')}</div>
              </button>
              <button class="owai-stat" data-action="show-user-parcas" data-user-id="${currentUser.id}" data-user-name="${esc(currentUser.display_name)}" type="button">
                <div class="owai-stat-num">${parcasCount}</div>
                <div class="owai-stat-lbl">${t('mini.parcas')}</div>
              </button>
              <button class="owai-stat" data-action="show-user-likes" data-user-id="${currentUser.id}" data-user-name="${esc(currentUser.display_name)}" type="button">
                <div class="owai-stat-num">${currentUser.likes_total || 0}</div>
                <div class="owai-stat-lbl">${t('home.likes')}</div>
              </button>
              <button class="owai-stat" type="button" style="cursor:default">
                <div class="owai-stat-num">${badges.length}</div>
                <div class="owai-stat-lbl">${t('home.badges')}</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Scraps box
  const scrapsHTML = (Array.isArray(scraps) && scraps.length)
    ? `<div class="home-scrap-list">
        ${scraps.slice(0, 3).map(s => `
          <div class="home-scrap-item">
            <div class="avatar avatar--small${avCls(s.avatar_text)}" style="${avBg(s.avatar_text,s.avatar_color)};flex-shrink:0">${avTxt(s.avatar_text)}</div>
            <div class="home-scrap-content">
              <div class="home-scrap-author">${esc(s.display_name)}</div>
              <div class="home-scrap-msg">${esc(s.message)}</div>
              <div class="home-scrap-time">${timeAgo(s.created_at)}</div>
            </div>
          </div>`).join('')}
      </div>`
    : `<p class="home-scraps-empty">${t('home.noScraps')}</p>`;

  const scrapsBox = `
    <div class="orkut-box">
      <div class="orkut-box-header">
        <h3>${t('home.scrapsTitle')}</h3>
        <button class="orkut-box-link" type="button" data-page="scraps">${t('home.seeAll')}</button>
      </div>
      <div class="orkut-box-body">${scrapsHTML}</div>
    </div>
  `;

  // Activity feed (abas Parcas / Descobrir)
  const activityBox = `
    <div class="orkut-box">
      <div class="orkut-box-header">
        <h3>${t('home.activity')}</h3>
        <button class="orkut-box-link" type="button" data-page="new">${t('home.newReview')}</button>
      </div>
      <div class="feed-tabs">
        <button class="feed-tab active" id="tabFriends" data-feed="friends">${t('home.tabPals')}</button>
        <button class="feed-tab" id="tabGlobal" data-feed="global">${t('home.tabDiscover')}</button>
      </div>
      <div class="orkut-box-body" id="feedBody">
        <div class="spinner"></div>
      </div>
    </div>
  `;

  // Widget de aniversariantes
  let birthdayBox = '';
  try {
    const bdays = await apiFetch('/users/birthdays/today').catch(() => []);
    if (bdays.length) {
      birthdayBox = `
        <div class="orkut-box birthday-box">
          <div class="orkut-box-header">
            <h3>${t('home.birthdays')}</h3>
          </div>
          <div class="orkut-box-body">
            <div class="friends-grid">
              ${bdays.map(u => `
                <button class="friend-chip birthday-chip" data-action="view-profile" data-user-id="${u.id}" type="button">
                  <div class="avatar avatar--small${avCls(u.avatar_text)}" style="${avBg(u.avatar_text,u.avatar_color)};pointer-events:none">${avTxt(u.avatar_text)}</div>
                  <span>${esc(u.display_name)}</span>
                  <span class="birthday-cake">🎂</span>
                </button>`).join('')}
            </div>
          </div>
        </div>`;
    }
  } catch { /* silencioso */ }

  // Box de comunidades do usuário
  const myComms = Array.isArray(userComms) ? userComms.filter(c => c.is_member || c.created_by === currentUser?.id) : [];
  const commBox = `
    <div class="orkut-box">
      <div class="orkut-box-header">
        <h3>${t('home.myComms')}</h3>
        <button class="orkut-box-link" type="button" data-page="communities">${t('home.myCommsSeeAll')}</button>
      </div>
      <div class="orkut-box-body">
        ${myComms.length ? `
          <div class="home-comms-grid">
            ${myComms.slice(0, 6).map(c => `
              <button class="home-comm-chip" type="button" data-action="open-community-page" data-id="${c.id}">
                <span class="home-comm-icon">${c.icon || '🏘'}</span>
                <span class="home-comm-name">${esc(c.name)}</span>
              </button>`).join('')}
          </div>`
        : `<p class="home-scraps-empty">${t('home.myCommsEmpty')}</p>`}
      </div>
    </div>
  `;

  root.innerHTML = `<div class="orkut-home">${birthdayBox}${whoAmI}${commBox}${scrapsBox}${activityBox}</div>`;

  root.querySelector('[data-action="edit-profile"]')?.addEventListener('click', () => openEditProfileModal(currentUser));

  // ── Lógica de abas do feed ────────────────────────────
  let activeFeedTab = 'friends';

  async function loadFeed(feedType, page = 1) {
    const feedBody = document.getElementById('feedBody');
    if (!feedBody) return;
    if (page === 1) feedBody.innerHTML = '<div class="spinner"></div>';

    const url = feedType === 'friends'
      ? `/reviews?feed=friends&limit=15&page=${page}`
      : `/reviews?limit=15&page=${page}`;

    const data = await apiFetch(url).catch(() => ({ reviews: [], total: 0 }));
    const revs = data.reviews || [];

    if (page === 1) {
      if (data.no_friends) {
        feedBody.innerHTML = `
          <div style="padding:24px 16px;text-align:center">
            <div style="font-size:36px;margin-bottom:10px">💩</div>
            <div style="font-weight:800;font-size:16px;color:var(--primary-dark);margin-bottom:6px">${t('home.noPalsYet')}</div>
            <div style="font-size:13px;color:var(--muted);margin-bottom:16px">${t('home.noPalsSub')}</div>
            <button class="feed-tab" id="switchToGlobal" style="margin:0 auto">${t('home.switchDiscover')}</button>
          </div>`;
        document.getElementById('switchToGlobal')?.addEventListener('click', () => {
          document.getElementById('tabFriends')?.classList.remove('active');
          document.getElementById('tabGlobal')?.classList.add('active');
          activeFeedTab = 'global';
          loadFeed('global');
        });
        return;
      }
      if (revs.length === 0) {
        feedBody.innerHTML = emptyState('💩', t('home.feedEmpty'), t('home.feedEmptySub'));
        return;
      }
      feedBody.innerHTML = `<div class="feed" id="mainFeed">${revs.map(r => reviewCard(r)).join('')}</div>`;
      if ((data.total || 0) > revs.length) {
        feedBody.insertAdjacentHTML('beforeend',
          `<button class="load-more-btn" id="loadMoreBtn" data-page-num="2">Carregar mais 💩</button>`);
        wireLoadMore(feedType);
      }
    } else {
      const feed = document.getElementById('mainFeed');
      if (feed) feed.insertAdjacentHTML('beforeend', revs.map(r => reviewCard(r)).join(''));
      const btn = document.getElementById('loadMoreBtn');
      if (btn) {
        btn.dataset.pageNum = page + 1;
        btn.disabled = false; btn.textContent = t('home.loadMore');
        if (revs.length < 15) btn.hidden = true;
      }
    }
  }

  function wireLoadMore(feedType) {
    document.getElementById('loadMoreBtn')?.addEventListener('click', async function() {
      const pageNum = parseInt(this.dataset.pageNum || 2);
      this.disabled = true; this.textContent = t('btn.loading');
      await loadFeed(feedType, pageNum);
    });
  }

  document.getElementById('tabFriends')?.addEventListener('click', function() {
    if (activeFeedTab === 'friends') return;
    activeFeedTab = 'friends';
    document.getElementById('tabGlobal')?.classList.remove('active');
    this.classList.add('active');
    loadFeed('friends');
  });
  document.getElementById('tabGlobal')?.addEventListener('click', function() {
    if (activeFeedTab === 'global') return;
    activeFeedTab = 'global';
    document.getElementById('tabFriends')?.classList.remove('active');
    this.classList.add('active');
    loadFeed('global');
  });

  // Carrega feed de parcas por padrão
  loadFeed('friends');
}

/* ── Review card ────────────────────────────────── */
function reviewCard(r) {
  const durationOpts = getDurationOptions();
  const reliefOpts   = getReliefOptions();
  const smellOpts    = getSmellOptions();
  const stickerOpts  = getStickerOptions();
  const dur  = durationOpts.find(x => x.value === r.duration) || {};
  const rel  = reliefOpts.find(x => x.value === r.relief)     || {};
  const sml  = smellOpts.find(x => x.value === r.smell)       || {};
  const stk  = stickerOpts.find(x => x.value === r.sticker);

  const cd = (() => { try { return r.custom_display ? JSON.parse(r.custom_display) : {}; } catch { return {}; } })();
  const qualVal = cd.quality  ? `${cd.quality.emoji} ${esc(cd.quality.label)}`   : qualityIcon(r.quality);
  const durVal  = cd.duration ? `${cd.duration.emoji} ${esc(cd.duration.label)}` : `${dur.icon || ''} ${esc(dur.label || '')}`;
  const relVal  = cd.relief   ? `${cd.relief.emoji} ${esc(cd.relief.label)}`     : `${rel.icon || ''} ${esc(rel.label || '')}`;
  const smlVal  = cd.smell    ? `${cd.smell.emoji} ${esc(cd.smell.label)}`       : `${sml.icon || ''} ${esc(sml.label || '')}`;

  return `
  <div class="review-card">
    <div class="review-header">
      <button class="avatar avatar--medium user-link${avCls(r.avatar_text)}" style="${avBg(r.avatar_text,r.avatar_color)};border:none"
              data-action="view-profile" data-user-id="${r.user_id}">${avTxt(r.avatar_text)}</button>
      <div class="review-user-info">
        <h4><button class="user-link" data-action="view-profile" data-user-id="${r.user_id}">${esc(r.display_name)}</button></h4>
        <div class="review-meta">
          <span>@${esc(r.username)}</span>
          <span>·</span>
          <span>${timeAgo(r.created_at)}</span>
        </div>
      </div>
      ${stk ? `<span style="margin-left:auto;font-size:22px" title="${stk.label}">${stk.icon}</span>` : ''}
    </div>

    ${r.title ? `<div class="review-title">${esc(r.title)}</div>` : ''}

    <div class="review-ratings">
      <div class="rating-item">
        <div class="lbl">${t('review.quality')}</div>
        <div class="val">${qualVal}</div>
      </div>
      <div class="rating-item">
        <div class="lbl">${t('review.duration')}</div>
        <div class="val">${durVal}</div>
      </div>
      <div class="rating-item">
        <div class="lbl">${t('review.relief')}</div>
        <div class="val">${relVal}</div>
      </div>
      <div class="rating-item">
        <div class="lbl">${t('review.smell')}</div>
        <div class="val">${smlVal}</div>
      </div>
    </div>

    ${r.comment ? `<div class="review-comment">"${esc(r.comment)}"</div>` : ''}

    ${r.bathroom_name ? `
      <div class="review-location">
        🚽 ${esc(r.bathroom_name)}
        ${r.bathroom_neighborhood ? ` — ${esc(r.bathroom_neighborhood)}` : ''}
        ${r.bathroom_rating ? ` · ⭐ ${Number(r.bathroom_rating).toFixed(1)}` : ''}
      </div>
    ` : ''}

    <div class="review-actions">
      <button class="action-btn-sm${r.liked_by_me ? ' liked' : ''}"
              data-action="toggle-like" data-id="${r.id}" data-liked="${r.liked_by_me ? 1 : 0}">
        ❤️ <span id="likes-${r.id}">${r.likes_count}</span>
      </button>
      <button class="action-btn-sm" data-action="toggle-comments" data-id="${r.id}">
        💬 <span id="comm-count-${r.id}">${r.comments_count}</span>
      </button>
      ${currentUser && r.user_id === currentUser.id
        ? `<button class="action-btn-sm" data-action="instagram-review" data-id="${r.id}" title="${t('review.instagram')}">📸</button>
           <button class="action-btn-sm" data-action="edit-review" data-id="${r.id}" title="${t('misc.editTooltip')}">✏️</button>
           <button class="action-btn-sm action-btn-danger" data-action="delete-review" data-id="${r.id}" title="${t('misc.deleteTooltip')}">🗑</button>`
        : ''}
    </div>

    <div id="comments-${r.id}" hidden>
      <div class="comments-section">
        <div id="comment-list-${r.id}" class="comment-list-container"></div>
        <form class="comment-form" data-review-id="${r.id}">
          <input type="text" placeholder="${t('misc.commentPh')}" maxlength="2000" required>
          <button class="gif-btn" type="button" data-action="open-gif-picker" title="GIF">GIF</button>
          <button type="submit">${t('btn.send')}</button>
        </form>
      </div>
    </div>
  </div>`;
}

/* ── Custom Review Options ──────────────────────── */
async function initCustomOptions(container, initialCD) {
  const pt = CURRENT_LANG === 'pt';
  let myOpts;
  try { myOpts = await apiFetch('/review-options'); } catch { myOpts = []; }

  const optsMap = {};
  myOpts.forEach(o => { optsMap[o.category] = o; });

  // cd = seleções customizadas para a sessão atual do formulário
  const cd = {};
  if (initialCD) {
    try {
      const parsed = typeof initialCD === 'string' ? JSON.parse(initialCD) : initialCD;
      Object.assign(cd, parsed);
    } catch { /* ignore */ }
  }

  // Adiciona input hidden para custom_display no form
  const form = container.querySelector('form');
  if (form && !form.querySelector('[name="custom_display"]')) {
    const h = document.createElement('input');
    h.type = 'hidden'; h.name = 'custom_display'; h.id = 'fCustomDisplay';
    form.appendChild(h);
  }

  function syncHidden() {
    const h = container.querySelector('[name="custom_display"]');
    if (h) h.value = Object.keys(cd).length ? JSON.stringify(cd) : '';
  }

  for (const cat of ['quality', 'duration', 'relief', 'smell']) {
    const firstBtn = container.querySelector(`.emoji-btn[data-field="${cat}"]`);
    if (!firstBtn) continue;
    const ratingDiv = firstBtn.closest('.emoji-rating');
    if (!ratingDiv) continue;

    // Quando botão regular é clicado, limpa seleção custom desta categoria
    ratingDiv.querySelectorAll(`.emoji-btn:not(.custom-opt-btn)`).forEach(btn => {
      btn.addEventListener('click', () => { delete cd[cat]; syncHidden(); });
    });

    // Cria seção custom abaixo do form-group
    const formGroup = ratingDiv.closest('.form-group');
    if (!formGroup) continue;
    let section = formGroup.querySelector(`.custom-opt-section[data-cat="${cat}"]`);
    if (!section) {
      section = document.createElement('div');
      section.className = 'custom-opt-section';
      section.dataset.cat = cat;
      formGroup.appendChild(section);
    }

    _renderCustomSection({ cat, section, ratingDiv, optsMap, cd, myOpts, syncHidden, pt });
  }

  syncHidden();
}

function _renderCustomSection({ cat, section, ratingDiv, optsMap, cd, myOpts, syncHidden, pt }) {
  section.innerHTML = '';
  const opt = optsMap[cat];

  if (opt) {
    const isSelected = !!cd[cat];

    // Adiciona/atualiza botão custom no ratingDiv
    let customBtn = ratingDiv.querySelector(`.custom-opt-btn[data-custom-cat="${cat}"]`);
    if (!customBtn) {
      customBtn = document.createElement('button');
      customBtn.type = 'button';
      customBtn.dataset.customCat = cat;
      ratingDiv.appendChild(customBtn);
    }
    customBtn.dataset.field = cat;
    customBtn.dataset.value = opt.mapped_value;
    customBtn.innerHTML = `${esc(opt.emoji)}<small>${esc(opt.label)}</small>`;
    customBtn.className = `emoji-btn custom-opt-btn${isSelected ? ' active' : ''}`;

    // Se já está selecionado (form de edição), ativa o botão e o campo hidden
    if (isSelected) {
      ratingDiv.querySelectorAll(`.emoji-btn[data-field="${cat}"]:not(.custom-opt-btn)`).forEach(b => b.classList.remove('active'));
      const hf = document.getElementById(`f${cat.charAt(0).toUpperCase() + cat.slice(1)}`);
      if (hf) hf.value = opt.mapped_value;
    }

    customBtn.onclick = () => {
      ratingDiv.querySelectorAll(`.emoji-btn[data-field="${cat}"]`).forEach(b => b.classList.remove('active'));
      customBtn.classList.add('active');
      const hf = document.getElementById(`f${cat.charAt(0).toUpperCase() + cat.slice(1)}`);
      if (hf) hf.value = opt.mapped_value;
      cd[cat] = { emoji: opt.emoji, label: opt.label };
      syncHidden();
    };

    section.innerHTML = `
      <div class="custom-opt-controls-row">
        <span class="custom-opt-tag">${esc(opt.emoji)} <em>${esc(opt.label)}</em></span>
        <button type="button" class="custom-opt-edit-btn" title="${pt ? 'Editar' : 'Edit'}">✏️</button>
        <button type="button" class="custom-opt-del-btn" title="${pt ? 'Excluir' : 'Delete'}">🗑️</button>
      </div>
      <div class="custom-form-host"></div>`;

    section.querySelector('.custom-opt-edit-btn').addEventListener('click', () => {
      _showCustomForm({ cat, existing: opt, formHost: section.querySelector('.custom-form-host'), optsMap, myOpts, cd, syncHidden, ratingDiv, section, pt });
    });
    section.querySelector('.custom-opt-del-btn').addEventListener('click', async () => {
      if (!confirm(t('misc.deleteCustomOpt'))) return;
      try {
        await apiFetch(`/review-options/${cat}`, { method: 'DELETE' });
        const idx = myOpts.findIndex(o => o.category === cat);
        if (idx >= 0) myOpts.splice(idx, 1);
        delete optsMap[cat];
        delete cd[cat];
        syncHidden();
        ratingDiv.querySelector(`.custom-opt-btn[data-custom-cat="${cat}"]`)?.remove();
        _renderCustomSection({ cat, section, ratingDiv, optsMap, cd, myOpts, syncHidden, pt });
        showToast(t('misc.customOptDeleted'));
      } catch (err) { showToast(err.message); }
    });
  } else {
    section.innerHTML = `
      <button type="button" class="custom-opt-create-btn">${t('misc.createOpt')}</button>
      <div class="custom-form-host"></div>`;
    section.querySelector('.custom-opt-create-btn').addEventListener('click', () => {
      _showCustomForm({ cat, existing: null, formHost: section.querySelector('.custom-form-host'), optsMap, myOpts, cd, syncHidden, ratingDiv, section, pt });
    });
  }
}

function _showCustomForm({ cat, existing, formHost, optsMap, myOpts, cd, syncHidden, ratingDiv, section, pt }) {
  if (formHost.innerHTML) { formHost.innerHTML = ''; return; } // toggle

  const catOptions = {
    quality:  getQualityOptions(),
    duration: getDurationOptions(),
    relief:   getReliefOptions(),
    smell:    getSmellOptions(),
  };

  const mappedOpts = catOptions[cat].map(o =>
    `<option value="${o.value}" ${existing?.mapped_value == o.value ? 'selected' : ''}>${o.icon} ${esc(o.label)}</option>`
  ).join('');

  formHost.innerHTML = `
    <div class="custom-opt-form">
      <div class="custom-form-row">
        <input class="co-emoji" type="text" placeholder="🎯" maxlength="8" value="${existing ? esc(existing.emoji) : ''}">
        <input class="co-label" type="text" placeholder="${pt ? 'Meu texto…' : 'My text…'}" maxlength="30" value="${existing ? esc(existing.label) : ''}">
        <select class="co-mapped">${mappedOpts}</select>
        <button type="button" class="co-save submit-btn" style="padding:6px 14px;font-size:13px">${pt ? 'Salvar' : 'Save'}</button>
        <button type="button" class="co-cancel" style="padding:6px 10px;font-size:13px;background:none;border:1px solid var(--border);border-radius:8px;cursor:pointer">✕</button>
      </div>
      <p class="co-hint">📌 ${pt ? 'A imagem deve ser um emoji (ex: 🎯 🌟 💎)' : 'Image must be an emoji (e.g. 🎯 🌟 💎)'}</p>
    </div>`;

  formHost.querySelector('.co-cancel').addEventListener('click', () => { formHost.innerHTML = ''; });
  formHost.querySelector('.co-save').addEventListener('click', async () => {
    const emoji = formHost.querySelector('.co-emoji').value.trim();
    const label = formHost.querySelector('.co-label').value.trim();
    const mapped_value = formHost.querySelector('.co-mapped').value;

    if (!emoji) { showToast(pt ? 'Digite um emoji.' : 'Enter an emoji.'); return; }
    if (!label) { showToast(pt ? 'Digite um texto.' : 'Enter text.'); return; }

    const saveBtn = formHost.querySelector('.co-save');
    saveBtn.disabled = true; saveBtn.textContent = '…';

    try {
      const saved = await apiFetch('/review-options', {
        method: 'POST',
        body: JSON.stringify({ category: cat, emoji, label, mapped_value }),
      });
      formHost.innerHTML = '';
      const idx = myOpts.findIndex(o => o.category === cat);
      if (idx >= 0) myOpts[idx] = saved;
      else myOpts.push(saved);
      optsMap[cat] = saved;
      _renderCustomSection({ cat, section, ratingDiv, optsMap, cd, myOpts, syncHidden, pt });
      showToast(t('misc.optSaved'));
    } catch (err) {
      saveBtn.disabled = false;
      saveBtn.textContent = pt ? 'Salvar' : 'Save';
      showToast(err.message);
    }
  });
}

/* ── New review page ────────────────────────────── */
async function renderNewPage(root) {
  let bathrooms = [];
  try { bathrooms = await apiFetch('/bathrooms'); } catch { /* ignore */ }

  const bathOptions = bathrooms.map(b =>
    `<option value="${b.id}">${esc(b.name)} — ${esc(b.neighborhood)}</option>`
  ).join('');

  root.innerHTML = `
  <div class="new-review-page">
    <h2>${t('new.title')}</h2>
    <form id="reviewForm">

      <div class="form-group">
        <label class="form-label">${t('new.quality')} <span class="form-sublabel">(1 a 5 💩)</span></label>
        <div class="emoji-rating">
          ${getQualityOptions().map(o => `
            <button type="button" class="emoji-btn" data-field="quality" data-value="${o.value}">
              ${o.icon}<small>${o.label}</small>
            </button>`).join('')}
        </div>
        <input type="hidden" name="quality" id="fQuality" required>
      </div>

      <div class="form-group">
        <label class="form-label">${t('new.duration')}</label>
        <div class="emoji-rating">
          ${getDurationOptions().map(o => `
            <button type="button" class="emoji-btn" data-field="duration" data-value="${o.value}">
              ${o.icon}<small>${o.label}</small>
            </button>`).join('')}
        </div>
        <input type="hidden" name="duration" id="fDuration" required>
      </div>

      <div class="form-group">
        <label class="form-label">${t('new.relief')}</label>
        <div class="emoji-rating">
          ${getReliefOptions().map(o => `
            <button type="button" class="emoji-btn" data-field="relief" data-value="${o.value}">
              ${o.icon}<small>${o.label}</small>
            </button>`).join('')}
        </div>
        <input type="hidden" name="relief" id="fRelief" required>
      </div>

      <div class="form-group">
        <label class="form-label">${t('new.smell')}</label>
        <div class="emoji-rating">
          ${getSmellOptions().map(o => `
            <button type="button" class="emoji-btn" data-field="smell" data-value="${o.value}">
              ${o.icon}<small>${o.label}</small>
            </button>`).join('')}
        </div>
        <input type="hidden" name="smell" id="fSmell" required>
      </div>

      <div class="form-group">
        <label class="form-label">${t('new.sticker')} <span class="form-sublabel">(${CURRENT_LANG === 'pt' ? 'opcional' : 'optional'})</span></label>
        <div class="emoji-rating">
          ${getStickerOptions().map(o => `
            <button type="button" class="emoji-btn" data-field="sticker" data-value="${o.value}">
              ${o.icon}<small>${o.label}</small>
            </button>`).join('')}
        </div>
        <input type="hidden" name="sticker" id="fSticker">
      </div>

      <div class="form-group">
        <label class="form-label">${t('misc.titleLabel')} <span class="form-sublabel">(${t('misc.optional')})</span></label>
        <input class="form-text-input" type="text" name="title" placeholder="${t('misc.titlePt')}" maxlength="120">
      </div>

      <div class="form-group">
        <label class="form-label">${t('new.comment')}</label>
        <textarea class="form-textarea" name="comment" placeholder="${t('new.commentPh')}" maxlength="600"></textarea>
      </div>

      <div class="form-group">
        <label class="form-label">${t('new.bathroom')} <span class="form-sublabel">(${CURRENT_LANG === 'pt' ? 'opcional' : 'optional'})</span></label>
        <select class="form-select" name="bathroom_id">
          <option value="">${t('new.selectBath')}</option>
          ${bathOptions}
        </select>
      </div>

      <button class="submit-btn" type="submit">${t('new.publish')}</button>
    </form>
  </div>`;

  // Wire up emoji buttons
  root.querySelectorAll('.emoji-btn[data-field]').forEach(btn => {
    btn.addEventListener('click', () => {
      const field = btn.dataset.field;
      const val   = btn.dataset.value;
      root.querySelectorAll(`.emoji-btn[data-field="${field}"]`).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const hidden = document.getElementById(`f${field.charAt(0).toUpperCase() + field.slice(1)}`);
      if (hidden) hidden.value = val;
    });
  });

  // Carrega opções personalizadas por categoria
  if (currentUser) initCustomOptions(root, null);
}

async function submitReview(form, reviewId = null) {
  console.log('submitReview chamado com reviewId:', reviewId);
  const btn = form.querySelector('button[type=submit]');
  if (!btn) {
    console.error('Botão de submit não encontrado!');
    return;
  }
  
  const isEdit = !!reviewId;
  console.log('É edição?', isEdit);
  btn.disabled = true; 
  btn.textContent = isEdit ? (CURRENT_LANG === 'pt' ? 'Salvando…' : 'Saving…') : 'Publicando…';
  const body = Object.fromEntries(new FormData(form));
  console.log('Form data coletado:', body);

  if (!body.quality || !body.duration || !body.relief || !body.smell) {
    console.error('Campos obrigatórios faltando:', { quality: body.quality, duration: body.duration, relief: body.relief, smell: body.smell });
    showToast(t('new.error'));
    btn.disabled = false; 
    btn.textContent = isEdit ? t('misc.saveBtn') : t('misc.publishBtn');
    return;
  }
  body.quality  = Number(body.quality);
  body.duration = Number(body.duration);
  if (!body.bathroom_id)   delete body.bathroom_id;
  if (!body.sticker)       delete body.sticker;
  if (!body.custom_display) delete body.custom_display;

  try {
    console.log('Submitting review:', { isEdit, reviewId, body });
    if (isEdit) {
      console.log('Chamando API PUT para /reviews/' + reviewId);
      const result = await apiFetch(`/reviews/${reviewId}`, { method: 'PUT', body: JSON.stringify(body) });
      console.log('Edit result:', result);
      showToast(t('misc.reviewUpdated'));
      console.log('Toast exibido, fechando modal...');
      document.getElementById('modalHost').innerHTML = '';
      console.log('Renderizando app...');
      await renderApp();
      console.log('Edição concluída com sucesso!');
    } else {
      const review = await apiFetch('/reviews', { method: 'POST', body: JSON.stringify(body) });
      showToast(t('new.success'));
      if (currentUser) {
        currentUser.reviews_count = (currentUser.reviews_count || 0) + 1;
      }
      currentPage = 'home';
      history.pushState(null, '', '#home');
      await renderApp();
      document.getElementById('pageRoot').scrollIntoView({ behavior: 'smooth', block: 'start' });
      openPublishedReviewModal(review);
    }
  } catch (err) {
    console.error('Erro ao salvar review:', err);
    const errorMsg = err.message || 'Erro desconhecido';
    showToast('❌ ' + errorMsg);
    btn.disabled = false; 
    btn.textContent = isEdit ? t('misc.saveBtn') : t('misc.publishBtn');
  }
}

async function openEditReviewModal(reviewId) {
  const host = document.getElementById('modalHost');
  host.innerHTML = `
    <div class="modal-overlay">
      <div class="modal modal--wide">
        <div class="modal-header">
          <h2>✏️ ${t('misc.editReview')}</h2>
          <button class="modal-close" data-action="close-modal">✕</button>
        </div>
        <div class="modal-body"><div class="spinner"></div></div>
      </div>
    </div>`;
  
  try {
    const review = await apiFetch(`/reviews/${reviewId}`);
    const bathrooms = await apiFetch('/bathrooms').catch(() => []);
    const bathOptions = bathrooms.map(b =>
      `<option value="${b.id}" ${review.bathroom_id === b.id ? 'selected' : ''}>${esc(b.name)} — ${esc(b.neighborhood)}</option>`
    ).join('');

    const body = host.querySelector('.modal-body');
    body.innerHTML = `
      <form id="editReviewForm">
        <div class="form-group">
          <label class="form-label">${t('new.quality')} <span class="form-sublabel">(1 a 5 💩)</span></label>
          <div class="emoji-rating">
            ${getQualityOptions().map(o => `
              <button type="button" class="emoji-btn${Number(review.quality) === o.value ? ' active' : ''}" data-field="quality" data-value="${o.value}">
                ${o.icon}<small>${o.label}</small>
              </button>`).join('')}
          </div>
          <input type="hidden" name="quality" id="fQuality" value="${review.quality || ''}" required>
        </div>

        <div class="form-group">
          <label class="form-label">${t('new.duration')}</label>
          <div class="emoji-rating">
            ${getDurationOptions().map(o => `
              <button type="button" class="emoji-btn${Number(review.duration) === o.value ? ' active' : ''}" data-field="duration" data-value="${o.value}">
                ${o.icon}<small>${o.label}</small>
              </button>`).join('')}
          </div>
          <input type="hidden" name="duration" id="fDuration" value="${review.duration || ''}" required>
        </div>

        <div class="form-group">
          <label class="form-label">${t('new.relief')}</label>
          <div class="emoji-rating">
            ${getReliefOptions().map(o => `
              <button type="button" class="emoji-btn${review.relief === o.value ? ' active' : ''}" data-field="relief" data-value="${o.value}">
                ${o.icon}<small>${o.label}</small>
              </button>`).join('')}
          </div>
          <input type="hidden" name="relief" id="fRelief" value="${review.relief}" required>
        </div>

        <div class="form-group">
          <label class="form-label">${t('new.smell')}</label>
          <div class="emoji-rating">
            ${getSmellOptions().map(o => `
              <button type="button" class="emoji-btn${review.smell === o.value ? ' active' : ''}" data-field="smell" data-value="${o.value}">
                ${o.icon}<small>${o.label}</small>
              </button>`).join('')}
          </div>
          <input type="hidden" name="smell" id="fSmell" value="${review.smell}" required>
        </div>

        <div class="form-group">
          <label class="form-label">${t('new.sticker')} <span class="form-sublabel">(${CURRENT_LANG === 'pt' ? 'opcional' : 'optional'})</span></label>
          <div class="emoji-rating">
            ${getStickerOptions().map(o => `
              <button type="button" class="emoji-btn${review.sticker === o.value ? ' active' : ''}" data-field="sticker" data-value="${o.value}">
                ${o.icon}<small>${o.label}</small>
              </button>`).join('')}
          </div>
          <input type="hidden" name="sticker" id="fSticker" value="${review.sticker || ''}">
        </div>

        <div class="form-group">
          <label class="form-label">${t('misc.titleLabel')} <span class="form-sublabel">(${t('misc.optional')})</span></label>
          <input class="form-text-input" type="text" name="title" value="${esc(review.title || '')}" placeholder="${t('misc.titlePt')}" maxlength="120">
        </div>

        <div class="form-group">
          <label class="form-label">${t('new.comment')}</label>
          <textarea class="form-textarea" name="comment" placeholder="${t('new.commentPh')}" maxlength="600">${esc(review.comment || '')}</textarea>
        </div>

        <div class="form-group">
          <label class="form-label">${t('new.bathroom')} <span class="form-sublabel">(${CURRENT_LANG === 'pt' ? 'opcional' : 'optional'})</span></label>
          <select class="form-select" name="bathroom_id">
            <option value="">${t('new.selectBath')}</option>
            ${bathOptions}
          </select>
        </div>

        <button class="submit-btn" type="submit">${CURRENT_LANG === 'pt' ? '💾 Salvar' : '💾 Save'}</button>
      </form>
    `;

    // Wire up emoji buttons
    body.querySelectorAll('.emoji-btn[data-field]').forEach(btn => {
      btn.addEventListener('click', () => {
        const field = btn.dataset.field;
        const val   = btn.dataset.value;
        body.querySelectorAll(`.emoji-btn[data-field="${field}"]`).forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const hidden = document.getElementById(`f${field.charAt(0).toUpperCase() + field.slice(1)}`);
        if (hidden) hidden.value = val;
      });
    });

    // Carrega opções personalizadas por categoria (pré-seleciona se houver custom_display)
    if (currentUser) initCustomOptions(body, review.custom_display || null);

    // Submit handler
    const form = document.getElementById('editReviewForm');
    console.log('Form de edição criado, reviewId:', reviewId);
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('Submit do form de edição disparado!');
      try {
        await submitReview(form, reviewId);
      } catch(err) {
        console.error('Erro ao submeter edição:', err);
        showToast('Erro ao salvar: ' + err.message);
      }
    });

  } catch(e) {
    console.error('Erro ao abrir modal de edição:', e);
    host.querySelector('.modal-body').innerHTML = `<p style="color:var(--danger);text-align:center">${e.message}</p>`;
  }
}

/* ── Bathrooms page ─────────────────────────────── */
async function renderBathroomsPage(root, filterType = '') {
  let baths;
  try { baths = await apiFetch(`/bathrooms${filterType ? '?type=' + filterType : ''}`); }
  catch { root.innerHTML = errorState(t('error.loadBaths')); return; }

  const bathTypes = getBathroomTypes();
  root.innerHTML = `
    <div class="page-header" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
      <div><h2>${t('bath.title')}</h2><p>${CURRENT_LANG === 'pt' ? 'Avalie e descubra os melhores banheiros' : 'Rate and discover the best bathrooms'}</p></div>
      <button class="primary-action" style="width:auto;padding:10px 20px;font-size:14px" data-action="open-bathroom-modal" type="button">${t('bath.add')}</button>
    </div>
    <div class="bath-filter-bar">
      <button class="bath-filter-btn${!filterType?' active':''}" data-type="">${CURRENT_LANG === 'pt' ? 'Todos' : 'All'}</button>
      ${bathTypes.map(bt => `
        <button class="bath-filter-btn${filterType===bt.value?' active':''}" data-type="${bt.value}">${bt.icon} ${bt.label}</button>`).join('')}
    </div>
    <div class="bathrooms-grid">
      ${baths.map(b => {
        const bt = bathTypes.find(x => x.value === b.type) || { icon: '🚽', label: b.type };
        return `
          <div class="bathroom-card" style="cursor:pointer" data-bath-id="${b.id}">
            <div class="bath-icon">${bt.icon}</div>
            <div class="bath-name">${esc(b.name)}</div>
            <div class="bath-neighborhood">📍 ${esc(b.neighborhood)}</div>
            <div class="bath-rating">⭐ ${Number(b.rating||0).toFixed(1)} <span>(${b.reviews_count} ${t('misc.reviews')})</span></div>
            <span class="bath-type-badge">${esc(bt.label)}</span>
          </div>`;
      }).join('') || emptyState('🚽', t('bath.empty'), t('bath.emptySub'))}
    </div>
  `;

  root.querySelector('[data-action="open-bathroom-modal"]')?.addEventListener('click', openBathroomModal);

  // Filtro
  root.querySelectorAll('.bath-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => renderBathroomsPage(root, btn.dataset.type));
  });

  // Detalhe do banheiro
  root.querySelectorAll('.bathroom-card[data-bath-id]').forEach(card => {
    card.addEventListener('click', () => openBathroomDetail(card.dataset.bathId));
  });
}

async function openBathroomDetail(bathroomId) {
  const host = document.getElementById('modalHost');
  host.innerHTML = `
    <div class="modal-overlay">
      <div class="modal modal--wide">
        <div class="modal-header"><h2>🚽 ${CURRENT_LANG === 'pt' ? 'Detalhes do Banheiro' : 'Bathroom Details'}</h2><button class="modal-close" data-action="close-modal">✕</button></div>
        <div class="modal-body"><div class="spinner"></div></div>
      </div>
    </div>`;
  try {
    const [bath, allReviews] = await Promise.all([
      apiFetch(`/bathrooms/${bathroomId}`),
      apiFetch(`/reviews?limit=50`).then(d => (d.reviews||[]).filter(r => r.bathroom_id === bathroomId)),
    ]);
    const bathTypesLocal = getBathroomTypes();
    const bt = bathTypesLocal.find(x => x.value === bath.type) || { icon: '🚽', label: bath.type };
    host.querySelector('.modal-body').innerHTML = `
      <div style="text-align:center;margin-bottom:20px">
        <div style="font-size:48px">${bt.icon}</div>
        <h2 style="margin:8px 0 4px">${esc(bath.name)}</h2>
        <div style="color:var(--muted);font-size:13px">📍 ${esc(bath.neighborhood)} · ${esc(bt.label)}</div>
        <div style="margin-top:8px;font-size:20px;font-weight:700">⭐ ${Number(bath.rating||0).toFixed(1)}</div>
        <div style="font-size:12px;color:var(--muted)">${bath.reviews_count} ${t('misc.reviews')}</div>
      </div>
      <div class="feed">
        ${allReviews.map(r => reviewCard(r)).join('') || emptyState('💩', t('bath.noReviews'), '')}
      </div>`;
  } catch(e) { showToast(e.message); host.innerHTML = ''; }
}

function openBathroomModal() {
  const host = document.getElementById('modalHost');
  host.innerHTML = `
    <div class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h2>🚽 ${CURRENT_LANG === 'pt' ? 'Novo Banheiro' : 'New Bathroom'}</h2>
          <button class="modal-close" data-action="close-modal">✕</button>
        </div>
        <div class="modal-body">
          <form id="bathroomForm">
            <div class="form-group">
              <label class="form-label">${t('bath.name')}</label>
              <input class="form-text-input" type="text" name="name" placeholder="${t('bath.namePh')}" required maxlength="200">
            </div>
            <div class="form-group">
              <label class="form-label">${t('bath.neighborhood')}</label>
              <input class="form-text-input" type="text" name="neighborhood" placeholder="${CURRENT_LANG === 'pt' ? 'Ex: Jardins' : 'e.g. Downtown'}" maxlength="100">
            </div>
            <div class="form-group">
              <label class="form-label">${t('bath.type')}</label>
              <select class="form-select" name="type">
                ${getBathroomTypes().map(bt => `<option value="${bt.value}">${bt.icon} ${bt.label}</option>`).join('')}
              </select>
            </div>
            <button class="submit-btn" type="submit">${t('bath.register')}</button>
          </form>
        </div>
      </div>
    </div>`;
}

async function submitBathroom(form) {
  const btn = form.querySelector('button[type=submit]');
  btn.disabled = true; btn.textContent = t('bath.registering');
  const body = Object.fromEntries(new FormData(form));
  try {
    await apiFetch('/bathrooms', { method: 'POST', body: JSON.stringify(body) });
    document.getElementById('modalHost').innerHTML = '';
    showToast(t('bath.success'));
    renderBathroomsPage(document.getElementById('pageRoot'));
  } catch (err) {
    showToast(err.message);
    btn.disabled = false; btn.textContent = t('bath.register');
  }
}

/* ── Community page (Orkut style) ───────────────── */
async function renderCommunityPage(root) {
  if (!currentCommunityId) { navigateTo('communities'); return; }
  root.innerHTML = '<div class="spinner"></div>';

  try {
    const [allComms, members, topics] = await Promise.all([
      apiFetch('/communities'),
      apiFetch(`/communities/${currentCommunityId}/members`),
      apiFetch(`/communities/${currentCommunityId}/topics`),
    ]);
    const comm = allComms.find(c => c.id === currentCommunityId);
    if (!comm) { showToast(t('misc.commNotFound')); navigateTo('communities'); return; }

    const isOwner   = comm.created_by === currentUser?.id;
    const isMember  = !!comm.is_member;
    const allowAnon = !!comm.allow_anonymous;

    root.innerHTML = `
      <!-- Back -->
      <button class="comm-page-back" data-action="back-to-communities">← ${t('comm.page.back')}</button>

      <!-- Header -->
      <div class="comm-page-header">
        <div class="comm-page-icon">${comm.icon}</div>
        <div class="comm-page-info">
          <h1 class="comm-page-title">
            ${esc(comm.name)}
            ${comm.is_private ? `<span class="comm-private-badge">${t('comm.page.privateInvite')}</span>` : `<span class="comm-private-badge comm-private-badge--pub">${t('comm.page.pub')}</span>`}
            ${comm.allow_anonymous ? '<span class="comm-private-badge" style="background:rgba(155,89,182,.15);color:#8e44ad">🎭</span>' : ''}
          </h1>
          <p class="comm-page-desc">${comm.description ? esc(comm.description) : `<em style="color:var(--muted)">${t('comm.page.noDesc')}</em>`}</p>
          <div class="comm-page-stats">
            <span>👥 <strong>${fmtNum(comm.members_count || members.length)}</strong> ${t('comm.members')}</span>
            <span>📋 <strong>${fmtNum(topics.length)}</strong> ${t('comm.topics')}</span>
          </div>
          <div class="comm-page-actions">
            ${isOwner
              ? `<button class="comm-page-btn comm-page-btn--primary" data-action="open-community" data-id="${comm.id}">${t('comm.manage')}</button>`
              : isMember
                ? `<button class="comm-page-btn comm-page-btn--leave" data-action="join-community" data-id="${comm.id}" data-joined="1">${t('comm.page.member')}</button>`
                : `<button class="comm-page-btn comm-page-btn--join" data-action="join-community" data-id="${comm.id}" data-joined="0">${t('comm.join')}</button>`
            }
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="comm-page-tabs">
        <button class="comm-page-tab active" data-tab="topics">📋 ${t('comm.page.tabTopics')}</button>
        <button class="comm-page-tab" data-tab="members">👥 ${t('comm.page.tabMembers')} <span class="comm-tab-count">${members.length}</span></button>
        <button class="comm-page-tab" data-tab="about">ℹ ${t('comm.page.tabAbout')}</button>
      </div>

      <!-- Tab content -->
      <div class="comm-page-body">

        <!-- TÓPICOS -->
        <div class="comm-tab-pane active" id="tab-topics">
          ${isMember || isOwner ? `
          <button class="submit-btn" style="width:100%;margin-bottom:14px" id="newTopicBtn">+ ${t('comm.newTopic')}</button>
          <div id="newTopicForm" hidden style="background:var(--bg);border-radius:12px;padding:16px;margin-bottom:16px">
            <input id="topicTitle" class="form-text-input" placeholder="${t('comm.topicTitle')}" maxlength="100" style="margin-bottom:10px">
            <textarea id="topicContent" class="form-textarea" rows="3" placeholder="${t('comm.topicContent')}…" maxlength="2000"></textarea>
            ${allowAnon ? `<label class="comm-anon-check"><input type="checkbox" id="topicAnon"> 🎭 ${t('comm.page.postAnon')}</label>` : ''}
            <div style="display:flex;gap:8px;margin-top:10px">
              <button class="gif-btn" type="button" data-action="open-gif-picker" data-target-id="topicContent">GIF</button>
              <button class="submit-btn" style="flex:1" id="topicSubmitBtn">${t('comm.page.publish')}</button>
            </div>
          </div>` : ''}
          <div id="topics-list">
            ${topics.length ? topics.map(tp => `
              <div class="topic-row" data-action="open-topic" data-community-id="${comm.id}" data-topic-id="${tp.id}" style="cursor:pointer">
                <div class="avatar avatar--small${avCls(tp.avatar_text)}" style="${avBg(tp.avatar_text,tp.avatar_color)};pointer-events:none">${avTxt(tp.avatar_text)}</div>
                <div style="flex:1;pointer-events:none">
                  <div style="font-weight:700">${esc(tp.title)}</div>
                  <div style="font-size:12px;color:var(--muted)">${tp.username ? `por @${esc(tp.username)}` : `🎭 ${esc(tp.display_name)}`} · ${timeAgo(tp.created_at)} · 💬 ${tp.replies_count}</div>
                </div>
              </div>`).join('')
            : `<div class="comm-page-empty">💬 ${t('comm.noTopics')}</div>`}
          </div>
        </div>

        <!-- MEMBROS -->
        <div class="comm-tab-pane" id="tab-members">
          <div class="comm-members-grid">
            ${members.map(m => `
              <div class="comm-member-card">
                <button class="avatar avatar--large${avCls(m.avatar_text)}" style="${avBg(m.avatar_text,m.avatar_color)};border:none;cursor:pointer"
                        data-action="view-profile" data-user-id="${m.id}">${avTxt(m.avatar_text)}</button>
                <div class="comm-member-name">
                  <button class="user-link" data-action="view-profile" data-user-id="${m.id}">${esc(m.display_name)}</button>
                  ${m.id === comm.created_by ? `<span class="comm-owner-badge">${CURRENT_LANG === 'pt' ? 'dono' : 'owner'}</span>` : ''}
                </div>
                <div class="comm-member-username">@${esc(m.username)}</div>
                ${isOwner && m.id !== currentUser?.id ? `
                  <button class="comm-member-remove" onclick="removeMemberAndRefresh('${comm.id}','${m.id}')">✕</button>` : ''}
              </div>`).join('')
            || `<div class="comm-page-empty">👥 ${t('comm.page.noMembers')}</div>`}
          </div>
        </div>

        <!-- SOBRE -->
        <div class="comm-tab-pane" id="tab-about">
          <div class="comm-about-box">
            <div class="comm-about-row">
              <span class="comm-about-label">${t('comm.name')}</span>
              <span>${esc(comm.name)}</span>
            </div>
            <div class="comm-about-row">
              <span class="comm-about-label">${t('comm.desc')}</span>
              <span>${comm.description ? esc(comm.description) : `<em style="color:var(--muted)">${t('comm.page.noDesc')}</em>`}</span>
            </div>
            <div class="comm-about-row">
              <span class="comm-about-label">${t('comm.page.privacy')}</span>
              <span>${comm.is_private ? t('comm.page.privateInvite') : t('comm.page.pub')}</span>
            </div>
            <div class="comm-about-row">
              <span class="comm-about-label">${t('comm.page.anonPosts')}</span>
              <span>${comm.allow_anonymous ? t('comm.page.anonAllowed') : t('comm.page.no')}</span>
            </div>
            <div class="comm-about-row">
              <span class="comm-about-label">${t('comm.page.tabMembers')}</span>
              <span>${fmtNum(comm.members_count || members.length)}</span>
            </div>
            <div class="comm-about-row">
              <span class="comm-about-label">${t('comm.page.createdBy')}</span>
              <span>${(() => { const owner = members.find(m => m.id === comm.created_by); return owner ? `<button class="user-link" data-action="view-profile" data-user-id="${owner.id}">${esc(owner.display_name)}</button>` : '—'; })()}</span>
            </div>
          </div>
          ${isOwner ? `
          <div style="margin-top:16px">
            <div class="invite-link-box" id="inviteLinkBox">
              <div style="font-size:13px;font-weight:700;color:var(--secondary);margin-bottom:8px">🔗 ${t('comm.page.inviteLink')}</div>
              <div style="display:flex;gap:8px">
                <input id="inviteLinkInput" class="form-text-input" style="flex:1;font-size:12px" readonly placeholder="${t('comm.page.invitePh')}">
                <button class="submit-btn" style="width:auto;padding:10px 14px;font-size:13px" id="genInviteLinkBtn">${t('comm.page.generate')}</button>
                <button class="btn-secondary" style="padding:10px 14px;font-size:13px;display:none" id="copyInviteLinkBtn">📋 ${t('comm.page.copy')}</button>
              </div>
              <button class="btn-secondary" style="font-size:11px;margin-top:6px;padding:4px 10px;display:none;color:#c0392b;background:rgba(231,76,60,.1)" id="revokeInviteLinkBtn">✕ ${t('comm.page.revoke')}</button>
            </div>
          </div>` : ''}
        </div>

      </div>`;

    // ── Tab switching
    root.querySelectorAll('.comm-page-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        root.querySelectorAll('.comm-page-tab').forEach(b => b.classList.remove('active'));
        root.querySelectorAll('.comm-tab-pane').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        root.querySelector(`#tab-${btn.dataset.tab}`).classList.add('active');
      });
    });

    // ── Novo tópico
    root.querySelector('#newTopicBtn')?.addEventListener('click', () => {
      const f = root.querySelector('#newTopicForm');
      f.hidden = !f.hidden;
    });
    root.querySelector('#topicSubmitBtn')?.addEventListener('click', async () => {
      const title     = root.querySelector('#topicTitle').value.trim();
      const content   = root.querySelector('#topicContent').value.trim();
      const anonymous = root.querySelector('#topicAnon')?.checked || false;
      if (!title || !content) return showToast(t('comm.topicErr'));
      const btn = root.querySelector('#topicSubmitBtn');
      btn.disabled = true; btn.textContent = '…';
      try {
        await apiFetch(`/communities/${comm.id}/topics`, { method: 'POST', body: JSON.stringify({ title, content, anonymous }) });
        showToast(t('comm.topicCreated'));
        renderCommunityPage(root);
      } catch(err) { showToast(err.message); btn.disabled = false; btn.textContent = t('comm.page.publish'); }
    });

    // ── Invite link (aba Sobre)
    if (isOwner) {
      if (comm.invite_token) {
        const url = `${window.location.origin}/?join=${comm.invite_token}`;
        const li = root.querySelector('#inviteLinkInput');
        if (li) {
          li.value = url;
          root.querySelector('#copyInviteLinkBtn').style.display = '';
          root.querySelector('#revokeInviteLinkBtn').style.display = '';
        }
      }
      root.querySelector('#genInviteLinkBtn')?.addEventListener('click', async () => {
        const btn = root.querySelector('#genInviteLinkBtn');
        btn.disabled = true; btn.textContent = '…';
        try {
          const r = await apiFetch(`/communities/${comm.id}/invite-link`, { method: 'POST' });
          root.querySelector('#inviteLinkInput').value = r.url;
          root.querySelector('#copyInviteLinkBtn').style.display = '';
          root.querySelector('#revokeInviteLinkBtn').style.display = '';
          showToast(t('comm.page.linkGenerated'));
        } catch(err) { showToast(err.message); }
        btn.disabled = false; btn.textContent = t('comm.page.generate');
      });
      root.querySelector('#copyInviteLinkBtn')?.addEventListener('click', () => {
        const url = root.querySelector('#inviteLinkInput').value;
        navigator.clipboard.writeText(url).then(() => showToast(t('comm.page.linkCopied'))).catch(() => {
          root.querySelector('#inviteLinkInput').select(); document.execCommand('copy');
          showToast(t('comm.page.linkCopied'));
        });
      });
      root.querySelector('#revokeInviteLinkBtn')?.addEventListener('click', async () => {
        if (!confirm(t('comm.page.revokeQ'))) return;
        try {
          await apiFetch(`/communities/${comm.id}/invite-link`, { method: 'DELETE' });
          root.querySelector('#inviteLinkInput').value = '';
          root.querySelector('#copyInviteLinkBtn').style.display = 'none';
          root.querySelector('#revokeInviteLinkBtn').style.display = 'none';
          showToast(t('comm.page.linkRevoked'));
        } catch(err) { showToast(err.message); }
      });
    }

    // ── Back button
    root.querySelector('.comm-page-back')?.addEventListener('click', () => {
      currentCommunityId = null;
      navigateTo('communities');
    });

  } catch(e) {
    root.innerHTML = errorState(e.message);
  }
}

window.removeMemberAndRefresh = async function(communityId, userId) {
  if (!confirm(t('comm.removeMember', { name: '' }))) return;
  try {
    await apiFetch(`/communities/${communityId}/members/${userId}`, { method: 'DELETE' });
    showToast(t('comm.memberRemoved', { name: '' }));
    renderCommunityPage(document.getElementById('pageRoot'));
  } catch(e) { showToast(e.message); }
};

/* ── Communities page ───────────────────────────── */
async function renderCommunitiesPage(root) {
  let comms;
  try { comms = await apiFetch('/communities'); }
  catch { root.innerHTML = errorState(t('error.loadComms')); return; }

  const myComms = comms.filter(c => c.created_by === currentUser?.id);

  root.innerHTML = `
    <div class="page-header" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
      <div><h2>${t('comm.title')}</h2><p>${t('misc.findPeople')}</p></div>
      <button class="primary-action" style="width:auto;padding:10px 20px;font-size:14px" data-action="create-community" type="button">
        ${t('comm.create')}
      </button>
    </div>

    ${myComms.length ? `
    <div class="comm-section-title">⭐ ${t('comm.myComms')}</div>
    <div class="communities-grid" style="margin-bottom:24px">
      ${myComms.map(c => communityCard(c, true)).join('')}
    </div>` : ''}

    <div class="comm-section-title">${t('comm.title')}</div>
    <div class="communities-grid">
      ${comms.length ? comms.map(c => communityCard(c, false)).join('') : emptyState('☷', t('comm.empty'), t('comm.emptySub'))}
    </div>`;
}

function communityCard(c, isOwnerSection) {
  const isOwner = c.created_by === currentUser?.id;
  return `
    <div class="community-card">
      <div class="comm-banner" style="cursor:pointer" data-action="open-community-page" data-id="${c.id}">${c.icon}</div>
      <div class="comm-name">
        <button class="comm-name-link" data-action="open-community-page" data-id="${c.id}">${esc(c.name)}</button>
        ${c.is_private ? '<span class="comm-private-badge">🔒</span>' : ''}
        ${c.allow_anonymous ? '<span class="comm-private-badge" style="background:rgba(155,89,182,.15);color:#8e44ad">🎭</span>' : ''}
      </div>
      <div class="comm-desc">${esc(c.description)}</div>
      <div class="comm-footer">
        <span class="comm-members">👥 ${fmtNum(c.members_count)}</span>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <button class="comm-join-btn" style="background:rgba(139,69,19,.1);color:var(--secondary)"
                  data-action="open-community-page" data-id="${c.id}">📋 Fórum</button>
          ${isOwner ? `<button class="comm-join-btn" style="background:var(--secondary);color:#fff" data-action="open-community" data-id="${c.id}">⚙</button>` : ''}
          <button class="comm-join-btn${c.is_member ? ' joined' : ''}"
                  data-action="join-community" data-id="${c.id}" data-joined="${c.is_member ? 1 : 0}">
            ${c.is_member ? `✓ ${t('comm.participants')}` : t('comm.join')}
          </button>
        </div>
      </div>
    </div>`;
}

/* ── Scraps page ────────────────────────────────── */
async function renderScrapsPage(root) {
  let scraps;
  try { scraps = await apiFetch('/scraps'); }
  catch { root.innerHTML = errorState(t('error.loadScraps')); return; }

  const list = scraps.map(s => `
    <div class="scrap-card">
      <div class="avatar avatar--medium${avCls(s.avatar_text)}" style="${avBg(s.avatar_text,s.avatar_color)}">${avTxt(s.avatar_text)}</div>
      <div class="scrap-body" style="flex:1">
        <div class="scrap-author">${esc(s.display_name)} <span style="font-weight:400;color:var(--muted)">@${esc(s.username)}</span></div>
        <div class="scrap-msg">${renderGifInText(s.message)}</div>
        <div class="scrap-time">${timeAgo(s.created_at)}</div>
      </div>
      <button class="action-btn-sm action-btn-danger" style="align-self:flex-start;padding:4px 8px"
              data-action="delete-scrap" data-id="${s.id}" title="${t('btn.delete')}">✕</button>
    </div>`).join('');

  root.innerHTML = `
    <div class="scraps-page">
      <div class="page-header"><h2>${t('scraps.title')}</h2><p>${CURRENT_LANG === 'pt' ? 'Mensagens da sua galera' : 'Messages from your crew'}</p></div>
      <div class="scrap-form-card">
        <h3>${CURRENT_LANG === 'pt' ? 'Enviar recado' : 'Send message'}</h3>
        <form id="scrapForm" class="auth-form">
          <input class="auth-input" type="text" name="to_username" placeholder="${t('misc.recipientPh')}" required>
          <textarea class="auth-input" id="scrapPageMsg" name="message" placeholder="${CURRENT_LANG === 'pt' ? 'Mensagem…' : 'Message…'}" rows="3" required maxlength="2000" style="resize:vertical"></textarea>
          <div style="display:flex;gap:8px">
            <button class="gif-btn" type="button" data-action="open-gif-picker" data-target-id="scrapPageMsg" title="GIF">GIF</button>
            <button class="auth-submit" type="submit" style="flex:1">${t('scraps.btn')}</button>
          </div>
        </form>
      </div>
      <div class="page-header"><h2>${CURRENT_LANG === 'pt' ? 'Recados recebidos' : 'Received messages'}</h2></div>
      ${list || emptyState('✉', t('scraps.empty'), t('scraps.emptySub'))}
    </div>`;
}

async function submitScrap(form) {
  const btn = form.querySelector('button[type=submit]');
  btn.disabled = true; btn.textContent = t('scraps.sending');
  const { to_username, message, to_user_id } = Object.fromEntries(new FormData(form));
  try {
    let targetId = to_user_id;
    if (!targetId) {
      const results = await apiFetch(`/users/search?username=${encodeURIComponent(to_username.trim())}`);
      const match = Array.isArray(results)
        ? results.find(u => u.username.toLowerCase() === to_username.trim().toLowerCase())
        : null;
      if (!match) throw new Error(t('misc.userNotFound'));
      targetId = match.id;
    }
    await apiFetch('/scraps', { method: 'POST', body: JSON.stringify({ to_user_id: targetId, message }) });
    showToast(t('scraps.success'));
    form.reset();
    document.getElementById('modalHost').innerHTML = '';
  } catch (err) {
    showToast(err.message);
    btn.disabled = false; btn.textContent = t('scraps.btn');
  }
}

function openSendScrapModal(userId, userName) {
  const host = document.getElementById('modalHost');
  host.innerHTML = `
    <div class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h2>✉ Enviar recado para ${esc(userName)}</h2>
          <button class="modal-close" data-action="close-modal">✕</button>
        </div>
        <div class="modal-body">
          <form id="scrapForm">
            <input type="hidden" name="to_user_id" value="${esc(userId)}">
            <div class="form-group">
              <label class="form-label">Mensagem</label>
              <textarea class="form-textarea" id="scrapModalMsg" name="message" placeholder="Escreva seu recado…" rows="4" required maxlength="2000"></textarea>
            </div>
            <div style="display:flex;gap:8px;margin-top:12px">
              <button class="gif-btn" type="button" data-action="open-gif-picker" data-target-id="scrapModalMsg" title="GIF">GIF</button>
              <button class="submit-btn" type="submit" style="flex:1">Enviar ✉</button>
            </div>
          </form>
        </div>
      </div>
    </div>`;
}

/* ── Profile page ───────────────────────────────── */
/* ── People page ─────────────────────────────────── */
async function renderPeoplePage(root) {
  root.innerHTML = '<div class="spinner"></div>';
  try {
    const { users, total } = await apiFetch('/users/public?limit=24');
    root.innerHTML = `
      <div class="page-header">
        <h1 class="page-title">👥 ${t('people.title').replace('👥 ', '')}</h1>
        <p class="page-subtitle">${t('people.sub')}</p>
      </div>
      <div class="people-search-bar">
        <input id="peopleSearchInput" class="form-text-input" type="search"
               placeholder="🔍 ${t('people.search')}" autocomplete="off">
      </div>
      <div id="peopleGrid" class="people-grid">
        ${users.map(u => personCard(u)).join('') || emptyState('👥', t('people.empty'), t('people.emptySub'))}
      </div>
      ${total > 24 ? `<div style="text-align:center;margin-top:24px"><button class="load-more-btn" data-action="load-more-people" data-offset="24">${t('btn.loadMore')}</button></div>` : ''}
    `;

    // Busca em tempo real
    const input = root.querySelector('#peopleSearchInput');
    let searchTimer;
    input.addEventListener('input', () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(async () => {
        const q = input.value.trim();
        const grid = root.querySelector('#peopleGrid');
        if (!q) {
          const { users: fresh } = await apiFetch('/users/public?limit=24');
          grid.innerHTML = fresh.map(u => personCard(u)).join('') || emptyState('👥', t('people.empty'), '');
          return;
        }
        const results = await apiFetch(`/users/search?q=${encodeURIComponent(q)}`);
        grid.innerHTML = results.length
          ? results.map(u => personCard(u)).join('')
          : emptyState('🔍', t('people.noResult'), t('people.noResultSub', { q }));
      }, 350);
    });
  } catch (e) {
    root.innerHTML = errorState(e.message);
  }
}

function personCard(u) {
  return `
    <button class="person-card" data-action="view-profile" data-user-id="${u.id}" type="button">
      <div class="person-card__avatar avatar avatar--large${avCls(u.avatar_text)}" style="${avBg(u.avatar_text, u.avatar_color)}">${avTxt(u.avatar_text)}</div>
      <div class="person-card__name">${esc(u.display_name)}</div>
      <div class="person-card__username">@${esc(u.username)}</div>
      ${u.bio ? `<div class="person-card__bio">${esc(u.bio.slice(0, 60))}${u.bio.length > 60 ? '…' : ''}</div>` : ''}
      ${u.reviews_count ? `<div class="person-card__stat">💩 ${u.reviews_count} ${t('misc.reviews')}</div>` : ''}
    </button>`;
}

async function renderProfilePage(root, userId) {
  const uid = userId || currentUser.id;
  const isSelf = uid === currentUser.id;

  let user, reviews, testimonials, votes, friends, friendStatus, views;
  try {
    const promises = [
      apiFetch(`/users/${uid}`),
      apiFetch(`/users/${uid}/reviews`),
      apiFetch(`/testimonials/${uid}`).catch(() => []),
      apiFetch(`/votes/${uid}`).catch(() => ({})),
      apiFetch(`/friends/of/${uid}`).catch(() => []),
    ];
    if (!isSelf) promises.push(apiFetch(`/friends/status/${uid}`).catch(() => ({ status: 'none' })));
    if (isSelf)  promises.push(apiFetch(`/users/${uid}/views`).catch(() => []));

    const results = await Promise.all(promises);
    [user, reviews, testimonials, votes, friends] = results;
    if (!isSelf) friendStatus = results[5];
    if (isSelf)  views = results[5];

    // Registrar visita
    if (!isSelf) apiFetch(`/users/${uid}/view`, { method: 'POST' }).catch(() => {});
  } catch { root.innerHTML = errorState(t('error.loadProfile')); return; }

  const badges = computeBadges(reviews);

  // Botões de ação para quem não é dono
  let actionBtns = '';
  if (!isSelf) {
    const fs = friendStatus || { status: 'none' };
    let friendBtn = '';
    if (fs.status === 'none') {
      friendBtn = `<button class="btn-secondary" data-action="add-friend" data-user-id="${uid}" type="button">${t('profile.addFriend')}</button>`;
    } else if (fs.status === 'pending' && fs.i_requested) {
      friendBtn = `<button class="btn-secondary" disabled>${t('profile.friendPending')}</button>`;
    } else if (fs.status === 'pending' && !fs.i_requested) {
      friendBtn = `<button class="btn-secondary" data-action="accept-friend" data-id="${fs.friendship_id}" type="button">${t('profile.accept')}</button>`;
    } else if (fs.status === 'accepted') {
      friendBtn = `<button class="btn-secondary" style="color:#c0392b" data-action="remove-friend" data-user-id="${uid}" type="button">${t('profile.removeFriend')}</button>`;
    }
    actionBtns = `
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px">
        <button class="primary-action" style="width:auto;padding:10px 22px" data-action="send-scrap-to" data-user-id="${uid}" data-user-name="${esc(user.display_name)}" type="button">✉ ${CURRENT_LANG === 'pt' ? 'Recado' : 'Message'}</button>
        ${friendBtn}
        <button class="btn-secondary" data-action="write-testimonial" data-user-id="${uid}" data-user-name="${esc(user.display_name)}" type="button">💬 ${CURRENT_LANG === 'pt' ? 'Depoimento' : 'Testimonial'}</button>
      </div>`;
  }

  // Votos Confiável / Legal / Sexy
  const voteLabels = { confiavel: { label: t('profile.votes.confiavel'), icon: '⭐' }, legal: { label: t('profile.votes.legal'), icon: '😎' }, sexy: { label: t('profile.votes.sexy'), icon: '🔥' } };
  const votesHTML = Object.entries(voteLabels).map(([type, meta]) => {
    const v = votes[type] || { count: 0, voted: false };
    const disabled = isSelf ? 'disabled' : '';
    return `<button class="vote-btn${v.voted ? ' voted' : ''}" ${disabled}
      data-action="vote-profile" data-user-id="${uid}" data-vote-type="${type}">
      ${meta.icon} ${meta.label} <span class="vote-cnt">${v.count}</span>
    </button>`;
  }).join('');

  root.innerHTML = `
    <div class="profile-page">
      <div class="profile-hero">
        <div class="avatar avatar--large${avCls(user.avatar_text)}" style="${avBg(user.avatar_text,user.avatar_color)}">${avTxt(user.avatar_text)}</div>
        <div class="profile-hero-info">
          <div class="profile-display-name">${esc(user.display_name)}</div>
          <div class="profile-username">@${esc(user.username)}</div>
          ${user.bio ? `<div class="profile-bio">${esc(user.bio)}</div>` : ''}
          <div class="profile-hero-stats">
            <button class="profile-stat" data-action="show-user-reviews" data-user-id="${uid}" data-user-name="${esc(user.display_name)}" type="button">
              <div class="num">${user.reviews_count || 0}</div>
              <div class="lbl">${t('profile.reviews')}</div>
            </button>
            <button class="profile-stat" data-action="show-user-likes" data-user-id="${uid}" data-user-name="${esc(user.display_name)}" type="button">
              <div class="num">${user.likes_total || 0}</div>
              <div class="lbl">${t('profile.likes')}</div>
            </button>
            <button class="profile-stat" data-action="show-user-parcas" data-user-id="${uid}" data-user-name="${esc(user.display_name)}" type="button">
              <div class="num">${friends.length}</div>
              <div class="lbl">${t('profile.parcas')}</div>
            </button>
          </div>
          ${isSelf
            ? `<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px">
                <button class="btn-secondary" data-action="edit-profile" type="button">${t('profile.edit')}</button>
                <button class="btn-secondary" data-action="invite-friend" type="button">${t('profile.invite')}</button>
                <button class="btn-secondary" data-action="share-profile" data-user-id="${uid}" data-user-name="${esc(user.display_name)}" type="button">🔗 ${CURRENT_LANG === 'pt' ? 'Compartilhar' : 'Share'}</button>
               </div>
               <div style="margin-top:10px;font-size:12px;color:var(--muted)">
                 ${user.is_public !== 0 ? t('profile.public') : t('profile.private')}
               </div>`
            : `${actionBtns}
               <div style="margin-top:14px">
                 <button class="btn-secondary" data-action="share-profile" data-user-id="${uid}" data-user-name="${esc(user.display_name)}" type="button" style="width:100%">🔗 ${CURRENT_LANG === 'pt' ? 'Compartilhar perfil' : 'Share profile'}</button>
               </div>`}
        </div>
      </div>

      <div class="profile-votes-bar">${votesHTML}</div>

      ${(() => {
        const parts = [];
        // Item destaque: Cagão!
        parts.push(`<div class="about-row about-row--highlight"><span class="about-icon">💩</span><span><strong>Cagão!</strong></span></div>`);
        
        const moodObj = getMoods().find(m => m.value === user.mood);
        const relObj  = getRelationships().find(r => r.value === user.relationship);
        const zodiac  = getZodiac(user.birthday);
        const bday    = getBirthdayDisplay(user.birthday);
        if (moodObj)  parts.push(`<div class="about-row"><span class="about-icon">${moodObj.icon}</span><span><strong>${t('profile.mood')}:</strong> ${moodObj.label}</span></div>`);
        if (relObj?.value) parts.push(`<div class="about-row"><span class="about-icon">${relObj.icon}</span><span><strong>${t('profile.rel')}:</strong> ${relObj.label}</span></div>`);
        if (bday)     parts.push(`<div class="about-row"><span class="about-icon">🎂</span><span><strong>${t('profile.birthday')}:</strong> ${bday.display} · ${bday.age} ${t('profile.years')} · <em>${bday.daysText}</em></span></div>`);
        if (zodiac)   parts.push(`<div class="about-row"><span class="about-icon">${zodiac.icon}</span><span><strong>${t('profile.zodiac')}:</strong> ${zodiac.sign}</span></div>`);
        if (user.city || user.country) {
          const loc = [user.city, user.country].filter(Boolean).join(', ');
          parts.push(`<div class="about-row"><span class="about-icon">📍</span><span><strong>${t('profile.location')}:</strong> ${esc(loc)}</span></div>`);
        }
        return `<div class="profile-section profile-about-section">
          <h3>${t('profile.about')}</h3>
          <div class="about-grid">${parts.join('')}</div>
        </div>`;
      })()}

      ${badges.length ? `
        <div class="badges-section">
          <h3>${t('profile.badges')}</h3>
          <div class="badges-grid">
            ${badges.map(b => `<div class="badge-item"><div class="badge-icon">${b.icon}</div><div class="badge-name">${b.name}</div></div>`).join('')}
          </div>
        </div>` : ''}

      ${friends.length ? `
        <div class="profile-section">
          <h3>${t('profile.parcasTitle')} (${friends.length})</h3>
          <div class="friends-grid">
            ${friends.map(f => `
              <button class="friend-chip" data-action="view-profile" data-user-id="${f.id}" type="button">
                <div class="avatar avatar--small${avCls(f.avatar_text)}" style="${avBg(f.avatar_text,f.avatar_color)};pointer-events:none">${avTxt(f.avatar_text)}</div>
                <span>${esc(f.display_name)}</span>
              </button>`).join('')}
          </div>
        </div>` : ''}

      ${isSelf ? `
        <div class="profile-section" id="friendRequests">
          <div class="spinner" style="transform:scale(.7)"></div>
        </div>` : ''}

      <div class="profile-section">
        <h3>💬 Depoimentos (${testimonials.length})</h3>
        <div id="testimonials-list">
          ${testimonials.map(ts => testimonialCard(ts, isSelf)).join('') || `<p style="font-size:13px;color:var(--muted)">${t('profile.noTestimonials')}</p>`}
        </div>
      </div>

      ${isSelf && views?.length ? `
        <div class="profile-section">
          <h3>${t('profile.visitors')}</h3>
          <div class="friends-grid">
            ${views.map(v => `
              <button class="friend-chip" data-action="view-profile" data-user-id="${v.id}" type="button">
                <div class="avatar avatar--small${avCls(v.avatar_text)}" style="${avBg(v.avatar_text,v.avatar_color)};pointer-events:none">${avTxt(v.avatar_text)}</div>
                <span>${esc(v.display_name)}</span>
              </button>`).join('')}
          </div>
        </div>` : ''}

      <div class="profile-section">
        <h3>${t('profile.scraps')}</h3>
        ${await renderScrapsWidget(uid)}
      </div>

      <div class="profile-section">
        <h3>${t('profile.topReviews')}</h3>
        <div class="feed">
          ${reviews.slice(0,3).map(r => reviewCard(r)).join('') || emptyState('💩', t('profile.noReviews'), '')}
        </div>
      </div>
    </div>`;

  root.querySelector('[data-action="edit-profile"]')?.addEventListener('click', () => openEditProfileModal(user));

  // Carregar pedidos de amizade
  if (isSelf) {
    const reqEl = document.getElementById('friendRequests');
    apiFetch('/friends/requests').then(reqs => {
      if (!reqs.length) { reqEl.innerHTML = ''; return; }
      reqEl.innerHTML = `<h3>${t('profile.friendReqs')} (${reqs.length})</h3>` +
        reqs.map(r => `
          <div class="friend-request-row">
            <div class="avatar avatar--small${avCls(r.avatar_text)}" style="${avBg(r.avatar_text,r.avatar_color)}">${avTxt(r.avatar_text)}</div>
            <div style="flex:1"><strong>${esc(r.display_name)}</strong> <span style="color:var(--muted)">@${esc(r.username)}</span></div>
            <button class="submit-btn" style="width:auto;padding:8px 16px;font-size:13px" data-action="accept-friend" data-id="${r.friendship_id}" type="button">${t('profile.accept')}</button>
            <button class="btn-secondary" style="padding:8px 16px;font-size:13px" data-action="remove-friend" data-user-id="${r.id}" type="button">✕</button>
          </div>`).join('');
    }).catch(() => reqEl.innerHTML = '');
  }
}

function testimonialCard(t, canDelete) {
  return `
    <div class="testimonial-card">
      <div class="avatar avatar--small${avCls(t.avatar_text)}" style="${avBg(t.avatar_text,t.avatar_color)}">${avTxt(t.avatar_text)}</div>
      <div style="flex:1">
        <div style="font-weight:700;font-size:13px">${esc(t.display_name)} <span style="color:var(--muted);font-weight:400">@${esc(t.username)}</span></div>
        <div style="font-size:13px;margin-top:4px;line-height:1.5;color:var(--text)">"${renderGifInText(t.content)}"</div>
        <div style="font-size:11px;color:var(--muted);margin-top:4px">${timeAgo(t.created_at)}</div>
      </div>
      ${canDelete || (currentUser && t.from_user_id === currentUser.id)
        ? `<button class="action-btn-sm action-btn-danger" style="padding:4px 8px;align-self:flex-start"
             data-action="delete-testimonial" data-id="${t.id}" title="Deletar">✕</button>`
        : ''}
    </div>`;
}

function openTestimonialModal(userId, userName) {
  const host = document.getElementById('modalHost');
  host.innerHTML = `
    <div class="modal-overlay">
      <div class="modal">
        <div class="modal-header"><h2>${t('testimonial.title', { name: esc(userName) })}</h2><button class="modal-close" data-action="close-modal">✕</button></div>
        <div class="modal-body">
          <p style="font-size:13px;color:var(--muted);margin-bottom:16px">${t('misc.testimonialPh')}</p>
          <textarea id="testimonialText" class="form-textarea" rows="4" placeholder="${t('testimonial.ph')}" maxlength="2000"></textarea>
          <div style="display:flex;gap:8px;margin-top:12px">
            <button class="gif-btn" type="button" data-action="open-gif-picker" data-target-id="testimonialText" title="GIF">GIF</button>
            <button class="submit-btn" style="flex:1" id="testimonialSubmitBtn">${t('testimonial.btn')}</button>
          </div>
        </div>
      </div>
    </div>`;
  document.getElementById('testimonialSubmitBtn').addEventListener('click', async () => {
    const content = document.getElementById('testimonialText').value.trim();
    if (!content) return showToast(t('testimonial.write'));
    const btn = document.getElementById('testimonialSubmitBtn');
    btn.disabled = true; btn.textContent = t('testimonial.sending');
    try {
      await apiFetch(`/testimonials/${userId}`, { method: 'POST', body: JSON.stringify({ content }) });
      showToast(t('testimonial.success'));
      host.innerHTML = '';
    } catch(err) { showToast(err.message); btn.disabled = false; btn.textContent = t('testimonial.btn'); }
  });
}

async function openUserReviewsModal(userId, userName) {
  const host = document.getElementById('modalHost');
  host.innerHTML = `
    <div class="modal-overlay">
      <div class="modal modal--wide">
        <div class="modal-header">
          <h2>💩 ${t('misc.reviewsOf')} ${esc(userName)}</h2>
          <button class="modal-close" data-action="close-modal">✕</button>
        </div>
        <div class="modal-body"><div class="spinner"></div></div>
      </div>
    </div>`;
  try {
    const reviews = await apiFetch(`/users/${userId}/reviews`);
    const body = host.querySelector('.modal-body');
    if (!reviews || reviews.length === 0) {
      body.innerHTML = `<p style="text-align:center;color:var(--muted);padding:40px 20px">${t('misc.noReviews')}</p>`;
    } else {
      body.innerHTML = `<div class="feed">${reviews.map(r => reviewCard(r)).join('')}</div>`;
    }
  } catch(e) {
    host.querySelector('.modal-body').innerHTML = `<p style="color:var(--danger);text-align:center">${e.message}</p>`;
  }
}

async function openUserLikesModal(userId, userName) {
  const host = document.getElementById('modalHost');
  host.innerHTML = `
    <div class="modal-overlay">
      <div class="modal modal--wide">
        <div class="modal-header">
          <h2>❤️ ${CURRENT_LANG === 'pt' ? 'Curtidas de' : 'Likes by'} ${esc(userName)}</h2>
          <button class="modal-close" data-action="close-modal">✕</button>
        </div>
        <div class="modal-body"><div class="spinner"></div></div>
      </div>
    </div>`;
  try {
    const reviews = await apiFetch(`/users/${userId}/reviews`);
    const sorted = [...reviews].sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
    const body = host.querySelector('.modal-body');
    if (!sorted || sorted.length === 0) {
      body.innerHTML = `<p style="text-align:center;color:var(--muted);padding:40px 20px">${t('misc.noLikedRevs')}</p>`;
    } else {
      body.innerHTML = `<div class="feed">${sorted.map(r => reviewCard(r)).join('')}</div>`;
    }
  } catch(e) {
    host.querySelector('.modal-body').innerHTML = `<p style="color:var(--danger);text-align:center">${e.message}</p>`;
  }
}

async function openUserParcasModal(userId, userName) {
  const host = document.getElementById('modalHost');
  host.innerHTML = `
    <div class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h2>👥 ${t('misc.friendsOf')} ${esc(userName)}</h2>
          <button class="modal-close" data-action="close-modal">✕</button>
        </div>
        <div class="modal-body"><div class="spinner"></div></div>
      </div>
    </div>`;
  try {
    const friends = await apiFetch(`/friends/of/${userId}`);
    const body = host.querySelector('.modal-body');
    if (!friends || friends.length === 0) {
      body.innerHTML = `<p style="text-align:center;color:var(--muted);padding:40px 20px">${t('misc.noFriends')}</p>`;
    } else {
      body.innerHTML = `
        <div class="friends-grid">
          ${friends.map(f => `
            <button class="friend-chip" data-action="view-profile" data-user-id="${f.id}" type="button">
              <div class="avatar avatar--small${avCls(f.avatar_text)}" style="${avBg(f.avatar_text,f.avatar_color)};pointer-events:none">${avTxt(f.avatar_text)}</div>
              <span>${esc(f.display_name)}</span>
            </button>`).join('')}
        </div>`;
    }
  } catch(e) {
    host.querySelector('.modal-body').innerHTML = `<p style="color:var(--danger);text-align:center">${e.message}</p>`;
  }
}

const SHARE_FORMATS = {
  story:  { w: 1080, h: 1920, labelKey: 'review.formatStory',  cls: 'share-image-card--story',  previewCls: 'instagram-format-preview--story' },
  feed:   { w: 1080, h: 1350, labelKey: 'review.formatFeed',   cls: 'share-image-card--feed',   previewCls: 'instagram-format-preview--feed' },
  square: { w: 1080, h: 1080, labelKey: 'review.formatSquare', cls: 'share-image-card--square', previewCls: 'instagram-format-preview--square' },
};

function buildShareImageHTML(review, format) {
  const fmt = SHARE_FORMATS[format] || SHARE_FORMATS.feed;
  const durationOpts = getDurationOptions();
  const reliefOpts   = getReliefOptions();
  const smellOpts    = getSmellOptions();
  const stickerOpts  = getStickerOptions();
  const dur = durationOpts.find(x => x.value === review.duration) || {};
  const rel = reliefOpts.find(x => x.value === review.relief) || {};
  const sml = smellOpts.find(x => x.value === review.smell) || {};
  const stk = stickerOpts.find(x => x.value === review.sticker);
  const qualOpt = getQualityOptions().find(x => x.value === Number(review.quality)) || {};
  const poop = getPoopAvatar(review.avatar_text);
  const avatarBg = poop ? '#FFF0DC' : (review.avatar_color || '#8B4513');
  const avatarTxt = poop ? poop.emoji : (review.avatar_text || '??');
  const dateStr = review.created_at
    ? new Date(review.created_at.replace(' ','T') + (review.created_at.includes('T') ? '' : 'Z')).toLocaleDateString('pt-BR')
    : '';

  return `
    <div class="share-image-card ${fmt.cls}">
      <div class="share-image-accent-bar"></div>
      ${stk ? `<div class="share-image-stamp">${stk.icon}</div>` : ''}

      <div class="share-image-brand">
        <div class="share-image-brand-mark">🚽</div>
        <div class="share-image-brand-text">
          <strong>Kgando <span class="share-image-brand-beta">BETA</span></strong>
          <small>${t('landing.brandSub')}</small>
        </div>
      </div>

      <div class="share-image-header">
        <div class="share-image-avatar" style="background:${avatarBg}">${avatarTxt}</div>
        <div class="share-image-user">
          <strong>${esc(review.display_name)}</strong>
          <span>@${esc(review.username)}</span>
          <div class="share-image-meta">
            ${(review.likes_count > 0) ? `<span class="share-image-badge-pill">❤️ ${fmtNum(review.likes_count)}</span>` : ''}
            ${dateStr ? `<span class="share-image-badge-pill">📅 ${dateStr}</span>` : ''}
          </div>
        </div>
      </div>

      <div class="share-image-quality-hero">
        <div class="share-image-quality-icons">${qualityIcon(review.quality)}</div>
        ${qualOpt.label ? `<div class="share-image-quality-label">${esc(qualOpt.label)}</div>` : ''}
      </div>

      ${review.title ? `<div class="share-image-title">${esc(review.title)}</div>` : ''}

      <div class="share-image-ratings share-image-ratings--3">
        <div class="share-image-rating">
          <div class="lbl">${t('review.duration')}</div>
          <div class="val">${dur.icon || ''} ${esc(dur.label || '')}</div>
        </div>
        <div class="share-image-rating">
          <div class="lbl">${t('review.relief')}</div>
          <div class="val">${rel.icon || ''} ${esc(rel.label || '')}</div>
        </div>
        <div class="share-image-rating">
          <div class="lbl">${t('review.smell')}</div>
          <div class="val">${sml.icon || ''} ${esc(sml.label || '')}</div>
        </div>
      </div>

      ${review.comment ? `<div class="share-image-comment">"${esc(review.comment)}"</div>` : ''}
      ${review.bathroom_name ? `
        <div class="share-image-location">
          🚽 ${esc(review.bathroom_name)}${review.bathroom_neighborhood ? ` — ${esc(review.bathroom_neighborhood)}` : ''}
        </div>` : ''}
      <div class="share-image-watermark">💩 ${t('review.shareWatermark')}</div>
    </div>`;
}

async function captureShareImage(review, format) {
  if (typeof html2canvas !== 'function') throw new Error('html2canvas unavailable');

  const stage = document.createElement('div');
  stage.className = 'share-image-stage';
  stage.innerHTML = buildShareImageHTML(review, format);
  document.body.appendChild(stage);

  try {
    if (document.fonts?.ready) await document.fonts.ready;
    await new Promise(r => setTimeout(r, 150));

    const el = stage.querySelector('.share-image-card');
    const canvas = await html2canvas(el, {
      useCORS: true,
      logging: false,
      scale: 1,
      backgroundColor: '#F5E6D3',
      width: el.offsetWidth,
      height: el.offsetHeight,
    });
    return canvas.toDataURL('image/png');
  } finally {
    stage.remove();
  }
}

async function shareOrDownloadImage(dataUrl) {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const file = new File([blob], 'kgando-avaliacao.png', { type: 'image/png' });

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Kgando' });
      showToast(t('review.instagramSuccess'));
      return;
    } catch (err) {
      if (err.name === 'AbortError') return;
    }
  }

  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = 'kgando-avaliacao.png';
  a.click();
  showToast(t('review.instagramSuccess'));
}

function renderInstagramFormatPicker(review, selectedFormat = 'feed') {
  const formatBtns = Object.entries(SHARE_FORMATS).map(([key, fmt]) => `
    <button type="button" class="instagram-format-btn${selectedFormat === key ? ' active' : ''}"
            data-action="pick-instagram-format" data-format="${key}">
      <div class="instagram-format-preview ${fmt.previewCls}"></div>
      <span>${t(fmt.labelKey)}</span>
    </button>`).join('');

  return `
    <div class="instagram-format-picker">${formatBtns}</div>
    <button class="submit-btn" type="button" id="instagramGenerateBtn" data-action="generate-instagram-image" data-review-id="${review.id}">
      📸 ${t('review.instagramGenerate')}
    </button>`;
}

async function openInstagramModal(reviewId, cachedReview = null) {
  const host = document.getElementById('modalHost');
  let selectedFormat = 'feed';

  host.innerHTML = `
    <div class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h2>📸 ${t('review.instagramTitle')}</h2>
          <button class="modal-close" data-action="close-modal" type="button">✕</button>
        </div>
        <div class="modal-body"><div class="spinner"></div></div>
      </div>
    </div>`;

  let review = cachedReview;
  try {
    if (!review) review = await apiFetch(`/reviews/${reviewId}`);
  } catch (e) {
    host.querySelector('.modal-body').innerHTML = `<p style="color:var(--danger);text-align:center">${esc(e.message)}</p>`;
    return;
  }

  const body = host.querySelector('.modal-body');
  body.innerHTML = renderInstagramFormatPicker(review, selectedFormat);

  body.querySelectorAll('[data-action="pick-instagram-format"]').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedFormat = btn.dataset.format;
      body.querySelectorAll('[data-action="pick-instagram-format"]').forEach(b => b.classList.toggle('active', b.dataset.format === selectedFormat));
    });
  });

  body.querySelector('[data-action="generate-instagram-image"]').addEventListener('click', async () => {
    const genBtn = document.getElementById('instagramGenerateBtn');
    if (!genBtn || genBtn.disabled) return;
    genBtn.disabled = true;
    genBtn.textContent = t('review.instagramGenerating');
    try {
      const dataUrl = await captureShareImage(review, selectedFormat);
      await shareOrDownloadImage(dataUrl);
      host.innerHTML = '';
    } catch (e) {
      console.error('[instagram]', e);
      showToast(t('review.instagramError'));
      genBtn.disabled = false;
      genBtn.textContent = `📸 ${t('review.instagramGenerate')}`;
    }
  });
}

function openPublishedReviewModal(review) {
  const host = document.getElementById('modalHost');
  host.innerHTML = `
    <div class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h2>${t('review.publishedTitle')}</h2>
          <button class="modal-close" data-action="close-modal" type="button">✕</button>
        </div>
        <div class="modal-body" style="text-align:center">
          <div class="published-success-icon">💩</div>
          <p style="margin-bottom:24px;font-size:15px;color:var(--muted)">${t('new.success')}</p>
          <button class="submit-btn" type="button" data-action="instagram-review" data-id="${review.id}" style="margin-bottom:12px">
            📸 ${t('review.instagram')}
          </button>
          <button class="btn-secondary" type="button" data-action="close-modal" style="width:100%">
            ${t('review.viewFeed')}
          </button>
        </div>
      </div>
    </div>`;
}

async function shareProfile(userId, userName) {
  const profileUrl = `https://kgando.com/#profile?id=${userId}`;
  const shareData = {
    title: `Perfil de ${userName} - Kgando`,
    text: `Veja o perfil de ${userName} no Kgando 💩`,
    url: profileUrl
  };

  try {
    // Tenta usar Web Share API (mobile)
    if (navigator.share) {
      await navigator.share(shareData);
      showToast(CURRENT_LANG === 'pt' ? 'Compartilhado!' : 'Shared!');
    } else {
      // Fallback: copia para clipboard
      await navigator.clipboard.writeText(profileUrl);
      showToast(CURRENT_LANG === 'pt' ? 'Link copiado! 📋' : 'Link copied! 📋');
    }
  } catch (err) {
    // Se der erro, mostra o link em um modal
    if (err.name !== 'AbortError') {
      const host = document.getElementById('modalHost');
      host.innerHTML = `
        <div class="modal-overlay">
          <div class="modal">
            <div class="modal-header">
              <h2>🔗 ${CURRENT_LANG === 'pt' ? 'Compartilhar Perfil' : 'Share Profile'}</h2>
              <button class="modal-close" data-action="close-modal">✕</button>
            </div>
            <div class="modal-body">
              <p style="margin-bottom:12px;font-size:14px">${CURRENT_LANG === 'pt' ? 'Link do perfil:' : 'Profile link:'}</p>
              <input type="text" value="${profileUrl}" readonly style="width:100%;padding:12px;border:2px solid var(--primary);border-radius:8px;font-size:13px;font-family:monospace" onclick="this.select()">
              <button class="submit-btn" style="margin-top:12px" onclick="navigator.clipboard.writeText('${profileUrl}').then(() => { showToast('${CURRENT_LANG === 'pt' ? 'Link copiado!' : 'Link copied!'}'); document.getElementById('modalHost').innerHTML = ''; })">
                ${CURRENT_LANG === 'pt' ? '📋 Copiar Link' : '📋 Copy Link'}
              </button>
            </div>
          </div>
        </div>`;
    }
  }
}

async function renderScrapsWidget(userId) {
  if (userId !== currentUser.id) return '<p style="font-size:13px;color:var(--muted)">Somente o dono pode ver seus recados.</p>';
  try {
    const scraps = await apiFetch('/scraps');
    if (!scraps.length) return '<p style="font-size:13px;color:var(--muted)">Nenhum recado recebido ainda.</p>';
    return scraps.slice(0,3).map(s => `
      <div class="scrap-card">
        <div class="avatar avatar--medium${avCls(s.avatar_text)}" style="${avBg(s.avatar_text,s.avatar_color)}">${avTxt(s.avatar_text)}</div>
        <div class="scrap-body">
          <div class="scrap-author">${esc(s.display_name)}</div>
          <div class="scrap-msg">${renderGifInText(s.message)}</div>
          <div class="scrap-time">${timeAgo(s.created_at)}</div>
        </div>
      </div>`).join('');
  } catch { return ''; }
}

function computeBadges(reviews) {
  const allBadges = getBadges();
  const earned = [];
  if (reviews.length >= 1) earned.push(allBadges.find(b => b.id === 'ninja'));
  const totalLikes = reviews.reduce((s,r) => s + r.likes_count, 0);
  if (totalLikes >= 30) earned.push(allBadges.find(b => b.id === 'gold'));
  const bathSet = new Set(reviews.filter(r => r.bathroom_id).map(r => r.bathroom_id));
  if (bathSet.size >= 4) earned.push(allBadges.find(b => b.id === 'explorer'));
  const roses = reviews.filter(r => r.smell === 'roses').length;
  if (roses >= 3) earned.push(allBadges.find(b => b.id === 'perfumed'));
  return earned.filter(Boolean);
}

function openEditProfileModal(user) {
  const currentPoop = getPoopAvatar(user.avatar_text);
  const selected = currentPoop ? user.avatar_text : 'poop_plain';
  const isPublic = user.is_public !== 0; // default público

  const pickerHTML = getPOOP_AVATARS().map(p => `
    <button type="button" class="poop-picker-btn${p.id === selected ? ' poop-picker-btn--selected' : ''}"
            data-poop-id="${p.id}" title="${p.label}">
      <span class="poop-picker-emoji">${p.emoji}</span>
      <span class="poop-picker-label">${p.label}</span>
    </button>`).join('');

  const host = document.getElementById('modalHost');
  host.innerHTML = `
    <div class="modal-overlay">
      <div class="modal">
        <div class="modal-header"><h2>${t('editProfile.title')}</h2><button class="modal-close" data-action="close-modal">✕</button></div>
        <div class="modal-body">
          <form id="profileForm">
            <div class="form-group">
              <label class="form-label">${t('editProfile.name')}</label>
              <input class="form-text-input" type="text" name="display_name" value="${esc(user.display_name)}" required maxlength="100">
            </div>
            <div class="form-group">
              <label class="form-label">${t('editProfile.bio')}</label>
              <textarea class="form-textarea" name="bio" maxlength="300">${esc(user.bio || '')}</textarea>
            </div>
            <div class="form-group">
              <label class="form-label">${t('editProfile.avatar')}</label>
              <input type="hidden" name="avatar_text" id="selectedPoopId" value="${selected}">
              <input type="hidden" name="avatar_color" value="#FFF0DC">
              <div class="poop-picker-grid">${pickerHTML}</div>
            </div>
            <div class="form-group">
              <label class="form-label">${t('editProfile.mood')}</label>
              <select class="form-text-input" name="mood">
                <option value="">${t('editProfile.noMood')}</option>
                ${getMoods().map(m => `<option value="${m.value}" ${user.mood === m.value ? 'selected' : ''}>${m.icon} ${m.label}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">${t('editProfile.rel')}</label>
              <select class="form-text-input" name="relationship">
                ${getRelationships().map(r => `<option value="${r.value}" ${user.relationship === r.value ? 'selected' : ''}>${r.icon ? r.icon + ' ' : ''}${r.label}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">${t('editProfile.birthday')}</label>
              <input class="form-text-input" type="date" name="birthday" value="${esc(user.birthday || '')}">
            </div>
            <div class="form-group">
              <label class="form-label">${t('editProfile.city')}</label>
              <input class="form-text-input" type="text" name="city" value="${esc(user.city || '')}" maxlength="80" placeholder="${t('editProfile.cityPh')}">
            </div>
            <div class="form-group">
              <label class="form-label">${t('editProfile.country')}</label>
              <input class="form-text-input" type="text" name="country" value="${esc(user.country || '')}" maxlength="80" placeholder="${t('editProfile.countryPh')}">
            </div>
            <div class="form-group">
              <label class="form-label">${t('editProfile.visibility')}</label>
              <label class="toggle-row">
                <input type="checkbox" name="is_public_check" id="isPublicCheck" ${isPublic ? 'checked' : ''}>
                <span class="toggle-slider"></span>
                <span class="toggle-label" id="toggleLabel">${isPublic ? t('editProfile.publicLabel') : t('editProfile.privateLabel')}</span>
              </label>
            </div>
            <button class="submit-btn" type="submit">${t('editProfile.save')}</button>
          </form>
        </div>
      </div>
    </div>`;

  // Lógica de seleção do picker
  host.querySelectorAll('.poop-picker-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      host.querySelectorAll('.poop-picker-btn').forEach(b => b.classList.remove('poop-picker-btn--selected'));
      btn.classList.add('poop-picker-btn--selected');
      document.getElementById('selectedPoopId').value = btn.dataset.poopId;
    });
  });

  // Toggle público/privado
  const chk = host.querySelector('#isPublicCheck');
  const lbl = host.querySelector('#toggleLabel');
  if (chk && lbl) {
    chk.addEventListener('change', () => {
      lbl.textContent = chk.checked ? t('editProfile.publicLabel') : t('editProfile.privateLabel');
    });
  }
}

async function submitProfile(form) {
  const btn = form.querySelector('button[type=submit]');
  btn.disabled = true; btn.textContent = t('btn.saving');

  // Lê os valores explicitamente para garantir que avatar_text seja capturado
  const avatarInput = form.querySelector('#selectedPoopId') || form.querySelector('[name="avatar_text"]');
  const isPublicCheck = form.querySelector('#isPublicCheck');
  const body = {
    display_name: (form.querySelector('[name="display_name"]')?.value || '').trim(),
    bio: form.querySelector('[name="bio"]')?.value ?? '',
    avatar_text: avatarInput?.value || currentUser.avatar_text || 'poop_plain',
    avatar_color: '#FFF0DC',
    is_public: isPublicCheck ? (isPublicCheck.checked ? 1 : 0) : 1,
    mood: form.querySelector('[name="mood"]')?.value ?? null,
    relationship: form.querySelector('[name="relationship"]')?.value ?? null,
    birthday: form.querySelector('[name="birthday"]')?.value || null,
    city: (form.querySelector('[name="city"]')?.value || '').trim() || null,
    country: (form.querySelector('[name="country"]')?.value || '').trim() || null,
  };

  try {
    const updated = await apiFetch(`/users/${currentUser.id}`, { method: 'PUT', body: JSON.stringify(body) });
    currentUser = { ...currentUser, ...updated };
    localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
    document.getElementById('modalHost').innerHTML = '';
    showToast(t('editProfile.success'));
    updateHeaderAvatar();
    renderApp();
  } catch (err) {
    showToast(err.message);
    btn.disabled = false; btn.textContent = 'Salvar';
  }
}

async function submitCreateCommunity(form) {
  const btn = form.querySelector('button[type=submit]');
  btn.disabled = true; btn.textContent = 'Criando…';
  const body = Object.fromEntries(new FormData(form));
  body.icon = document.getElementById('selectedIcon')?.value || '💩';
  body.is_private = form.querySelector('[name=is_private]')?.checked ? 1 : 0;
  body.allow_anonymous = form.querySelector('[name=allow_anonymous]')?.checked ? 1 : 0;
  try {
    await apiFetch('/communities', { method: 'POST', body: JSON.stringify(body) });
    document.getElementById('modalHost').innerHTML = '';
        showToast(t('comm.success'));
    currentPage = 'communities';
    history.pushState(null, '', '#communities');
    renderApp();
  } catch(err) {
    showToast(err.message);
    btn.disabled = false; btn.textContent = 'Criar comunidade ☷';
  }
}

/* ── Convite de amigo ───────────────────────────── */
async function openInviteModal() {
  const host = document.getElementById('modalHost');
  host.innerHTML = `
    <div class="modal-overlay">
      <div class="modal">
        <div class="modal-header"><h2>${t('invite.modalTitle')}</h2><button class="modal-close" data-action="close-modal">✕</button></div>
        <div class="modal-body">
          <div class="spinner" id="inviteSpinner"></div>
          <div id="inviteContent" hidden></div>
        </div>
      </div>
    </div>`;

  try {
    const { code } = await apiFetch('/invites', { method: 'POST', body: '{}' });
    const link = `${location.origin}/?invite=${code}`;
    const el = document.getElementById('inviteContent');
    el.innerHTML = `
      <p style="font-size:14px;color:var(--muted);margin-bottom:20px">
        ${t('invite.modalDesc')}
      </p>

      <!-- Aba Email -->
      <div class="invite-tabs">
        <button class="invite-tab active" id="tabEmail">${t('invite.tabEmail')}</button>
        <button class="invite-tab" id="tabLink">${t('invite.tabLink')}</button>
      </div>

      <div id="panelEmail" class="invite-panel">
        <div class="form-group">
          <label class="form-label">${t('invite.guestEmail')}</label>
          <input id="inviteEmailInput" class="form-text-input" type="email" placeholder="${t('invite.emailPh')}">
        </div>
        <button class="submit-btn" id="sendEmailBtn">${t('invite.emailBtn')}</button>
        <div id="emailFeedback" style="margin-top:12px;font-size:13px;display:none"></div>
      </div>

      <div id="panelLink" class="invite-panel" hidden>
        <p style="font-size:13px;color:var(--muted);margin-bottom:12px">
          ${t('invite.onceNote')}
        </p>
        <div style="display:flex;gap:8px">
          <input id="inviteLinkInput" class="form-text-input" style="flex:1;font-size:13px" value="${esc(link)}" readonly>
          <button class="submit-btn" style="width:auto;padding:12px 16px" id="copyLinkBtn">${t('invite.copyBtn')}</button>
        </div>
        <div style="margin-top:16px;background:var(--bg);border-radius:12px;padding:14px;font-size:13px;color:var(--muted)">
          <strong>${t('invite.waTitle')}</strong><br><br>
          ${t('invite.waMsg')} <em>${esc(link)}</em>
        </div>
      </div>`;

    document.getElementById('inviteSpinner').hidden = true;
    el.hidden = false;

    // Tabs
    document.getElementById('tabEmail').addEventListener('click', () => {
      document.getElementById('tabEmail').classList.add('active');
      document.getElementById('tabLink').classList.remove('active');
      document.getElementById('panelEmail').hidden = false;
      document.getElementById('panelLink').hidden = true;
    });
    document.getElementById('tabLink').addEventListener('click', () => {
      document.getElementById('tabLink').classList.add('active');
      document.getElementById('tabEmail').classList.remove('active');
      document.getElementById('panelLink').hidden = false;
      document.getElementById('panelEmail').hidden = true;
    });

    // Copiar link
    document.getElementById('copyLinkBtn')?.addEventListener('click', () => {
      navigator.clipboard.writeText(link)
        .then(() => showToast(t('invite.copied')))
        .catch(() => { document.getElementById('inviteLinkInput').select(); document.execCommand('copy'); showToast(t('invite.copied')); });
    });

    // Enviar email
    document.getElementById('sendEmailBtn')?.addEventListener('click', async () => {
      const email = document.getElementById('inviteEmailInput').value.trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return showToast(t('invite.emailError'));
      }
      const btn = document.getElementById('sendEmailBtn');
      const feedback = document.getElementById('emailFeedback');
      btn.disabled = true; btn.textContent = t('invite.sending');
      feedback.style.display = 'none';
      try {
        const r = await apiFetch('/invites/email', { method: 'POST', body: JSON.stringify({ to_email: email }) });
        btn.textContent = t('invite.sentBtn');
        feedback.style.display = 'block';
        feedback.style.color = 'var(--secondary)';
        feedback.innerHTML = t('invite.emailSent').replace('{email}', esc(email));
        document.getElementById('inviteEmailInput').value = '';
        setTimeout(() => { btn.disabled = false; btn.textContent = t('invite.sendBtn'); }, 3000);
      } catch (err) {
        btn.disabled = false; btn.textContent = t('invite.sendBtn');
        feedback.style.display = 'block';
        feedback.style.color = '#c0392b';
        feedback.textContent = '❌ ' + (err.message || t('invite.errSend'));
      }
    });

  } catch (e) {
    showToast(e.message || t('invite.error'));
    host.innerHTML = '';
  }
}

/* ── Criar comunidade ───────────────────────────── */
function openCreateCommunityModal() {
  const host = document.getElementById('modalHost');
  const ICONS = ['💩','🚽','🧻','💦','🪠','🧴','🚿','🛁','🪣','🎭','🤣','🏆','⭐','🔥','💎','🌈'];
  host.innerHTML = `
    <div class="modal-overlay">
      <div class="modal">
        <div class="modal-header"><h2>☷ ${CURRENT_LANG === 'pt' ? 'Criar comunidade' : 'Create community'}</h2><button class="modal-close" data-action="close-modal">✕</button></div>
        <div class="modal-body">
          <form id="createCommForm">
            <div class="form-group">
              <label class="form-label">${t('comm.icon')}</label>
              <div class="icon-picker-grid">${ICONS.map((ic,i) =>
                `<button type="button" class="icon-picker-btn${i===0?' icon-picker-btn--sel':''}" data-icon="${ic}">${ic}</button>`
              ).join('')}</div>
              <input type="hidden" id="selectedIcon" value="${ICONS[0]}">
            </div>
            <div class="form-group">
              <label class="form-label">${t('comm.name')}</label>
              <input class="form-text-input" type="text" name="name" placeholder="${t('comm.namePh')}" required maxlength="60">
            </div>
            <div class="form-group">
              <label class="form-label">${t('comm.desc')}</label>
              <textarea class="form-textarea" name="description" placeholder="${t('comm.descPh')}" maxlength="300"></textarea>
            </div>
            <div class="comm-toggle-row">
              <label class="comm-toggle-label">
                <span>🔒 ${CURRENT_LANG === 'pt' ? 'Comunidade privada' : 'Private community'}</span>
                <span style="font-size:12px;color:var(--muted);display:block;margin-top:2px">${CURRENT_LANG === 'pt' ? 'Só entram quem você convidar' : 'Only invited members can join'}</span>
              </label>
              <label class="toggle-switch"><input type="checkbox" name="is_private" value="1"><span class="comm-slider"></span></label>
            </div>
            <div class="comm-toggle-row">
              <label class="comm-toggle-label">
                <span>🎭 ${CURRENT_LANG === 'pt' ? 'Permitir posts anônimos' : 'Allow anonymous posts'}</span>
                <span style="font-size:12px;color:var(--muted);display:block;margin-top:2px">${CURRENT_LANG === 'pt' ? 'Membros podem postar como "Anônimo"' : 'Members can post as "Anonymous"'}</span>
              </label>
              <label class="toggle-switch"><input type="checkbox" name="allow_anonymous" value="1"><span class="comm-slider"></span></label>
            </div>
            <button class="submit-btn" type="submit">${t('comm.createBtn')}</button>
          </form>
        </div>
      </div>
    </div>`;

  host.querySelectorAll('.icon-picker-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      host.querySelectorAll('.icon-picker-btn').forEach(b => b.classList.remove('icon-picker-btn--sel'));
      btn.classList.add('icon-picker-btn--sel');
      document.getElementById('selectedIcon').value = btn.dataset.icon;
    });
  });
}

/* ── Gerenciar comunidade (dono) ────────────────── */
async function openCommunityModal(communityId) {
  const host = document.getElementById('modalHost');
  host.innerHTML = `
    <div class="modal-overlay">
      <div class="modal">
        <div class="modal-header"><h2>${t('comm.editTitle')}</h2><button class="modal-close" data-action="close-modal">✕</button></div>
        <div class="modal-body"><div class="spinner"></div></div>
      </div>
    </div>`;

  try {
    const [comm, members] = await Promise.all([
      apiFetch(`/communities`).then(list => list.find(c => c.id === communityId)),
      apiFetch(`/communities/${communityId}/members`)
    ]);
    if (!comm) throw new Error(t('misc.commNotFound'));
    const isOwner = comm.created_by === currentUser?.id;
    const ICONS = ['💩','🚽','🧻','💦','🪠','🧴','🚿','🛁','🪣','🎭','🤣','🏆','⭐','🔥','💎','🌈'];

    host.querySelector('.modal-body').innerHTML = `
      ${isOwner ? `
      <form id="editCommForm" style="margin-bottom:20px">
        <div style="font-size:14px;font-weight:800;color:var(--secondary);margin-bottom:12px">✏ Editar</div>
        <div class="icon-picker-grid" style="margin-bottom:12px">${ICONS.map(ic =>
          `<button type="button" class="icon-picker-btn${ic===comm.icon?' icon-picker-btn--sel':''}" data-icon="${ic}">${ic}</button>`
        ).join('')}</div>
        <input type="hidden" id="editIcon" value="${esc(comm.icon)}">
        <input class="form-text-input" type="text" name="name" value="${esc(comm.name)}" required maxlength="60" style="margin-bottom:10px">
        <textarea class="form-textarea" name="description" maxlength="300">${esc(comm.description)}</textarea>
        <div class="comm-toggle-row" style="margin-top:12px">
          <label class="comm-toggle-label">
            <span>🔒 ${CURRENT_LANG === 'pt' ? 'Comunidade privada' : 'Private community'}</span>
          </label>
          <label class="toggle-switch"><input type="checkbox" name="is_private" ${comm.is_private ? 'checked' : ''}><span class="comm-slider"></span></label>
        </div>
        <div class="comm-toggle-row">
          <label class="comm-toggle-label">
            <span>🎭 ${CURRENT_LANG === 'pt' ? 'Permitir posts anônimos' : 'Allow anonymous posts'}</span>
          </label>
          <label class="toggle-switch"><input type="checkbox" name="allow_anonymous" ${comm.allow_anonymous ? 'checked' : ''}><span class="comm-slider"></span></label>
        </div>
        <div style="display:flex;gap:10px;margin-top:14px">
          <button class="submit-btn" type="submit" style="flex:1">Salvar</button>
          <button type="button" class="btn-secondary" style="background:rgba(231,76,60,.1);color:#c0392b" id="deleteCommBtn">🗑 Deletar</button>
        </div>
      </form>` : ''}

      <div style="font-size:14px;font-weight:800;color:var(--secondary);margin-bottom:12px">
        👥 Membros (${members.length}) ${comm.is_private ? '<span class="comm-private-badge">🔒 Privada</span>' : '<span class="comm-private-badge comm-private-badge--pub">🌍 Pública</span>'}
      </div>
      ${isOwner ? `
      <div class="invite-link-box" id="inviteLinkBox">
        <div style="font-size:13px;font-weight:700;color:var(--secondary);margin-bottom:8px">🔗 Link de convite</div>
        <div style="display:flex;gap:8px">
          <input id="inviteLinkInput" class="form-text-input" style="flex:1;font-size:12px" readonly placeholder="Clique em Gerar para criar um link">
          <button class="submit-btn" style="width:auto;padding:10px 14px;font-size:13px" id="genInviteLinkBtn">Gerar</button>
          <button class="btn-secondary" style="padding:10px 14px;font-size:13px;display:none" id="copyInviteLinkBtn">📋 Copiar</button>
        </div>
        <button class="btn-secondary" style="font-size:11px;margin-top:6px;padding:4px 10px;display:none;color:#c0392b;background:rgba(231,76,60,.1)" id="revokeInviteLinkBtn">✕ Revogar link</button>
      </div>` : ''}
      <div class="members-list">
        ${members.map(m => `
          <div class="member-row">
            <div class="avatar avatar--small${avCls(m.avatar_text)}" style="${avBg(m.avatar_text,m.avatar_color)}">${avTxt(m.avatar_text)}</div>
            <div style="flex:1">
              <strong>${esc(m.display_name)}</strong>
              <span style="color:var(--muted);font-size:12px"> @${esc(m.username)}</span>
              ${m.id === comm.created_by ? '<span class="comm-owner-badge">dono</span>' : ''}
            </div>
            ${isOwner && m.id !== currentUser.id ? `
              <button class="btn-secondary" style="padding:4px 10px;font-size:12px"
                      onclick="removeMember('${communityId}','${m.id}','${esc(m.display_name)}')">
                Remover
              </button>` : ''}
          </div>`).join('') || '<p style="color:var(--muted);font-size:13px">Nenhum membro ainda.</p>'}
      </div>`;

    // Icon picker do edit
    host.querySelectorAll('.icon-picker-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        host.querySelectorAll('.icon-picker-btn').forEach(b => b.classList.remove('icon-picker-btn--sel'));
        btn.classList.add('icon-picker-btn--sel');
        document.getElementById('editIcon').value = btn.dataset.icon;
      });
    });

    // Submit edição
    document.getElementById('editCommForm')?.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = e.target.querySelector('[type=submit]');
      btn.disabled = true; btn.textContent = 'Salvando…';
      const fd = new FormData(e.target);
      try {
        await apiFetch(`/communities/${communityId}`, { method: 'PUT', body: JSON.stringify({
          name: fd.get('name'), description: fd.get('description'), icon: document.getElementById('editIcon').value,
          is_private: e.target.querySelector('[name=is_private]')?.checked ? 1 : 0,
          allow_anonymous: e.target.querySelector('[name=allow_anonymous]')?.checked ? 1 : 0,
        })});
        showToast(t('comm.updated'));
        host.innerHTML = '';
        renderApp();
      } catch(err) { showToast(err.message); btn.disabled=false; btn.textContent='Salvar'; }
    });

    // Gerar / copiar / revogar link de convite
    if (isOwner) {
      // Se já tem token na comunidade, preencher o campo
      if (comm.invite_token) {
        const APP_URL = window.location.origin;
        const existingUrl = `${APP_URL}/?join=${comm.invite_token}`;
        const li = document.getElementById('inviteLinkInput');
        if (li) {
          li.value = existingUrl;
          document.getElementById('copyInviteLinkBtn').style.display = '';
          document.getElementById('revokeInviteLinkBtn').style.display = '';
        }
      }

      document.getElementById('genInviteLinkBtn')?.addEventListener('click', async () => {
        const btn = document.getElementById('genInviteLinkBtn');
        btn.disabled = true; btn.textContent = 'Gerando…';
        try {
          const r = await apiFetch(`/communities/${communityId}/invite-link`, { method: 'POST' });
          const input = document.getElementById('inviteLinkInput');
          input.value = r.url;
          document.getElementById('copyInviteLinkBtn').style.display = '';
          document.getElementById('revokeInviteLinkBtn').style.display = '';
          showToast('Link gerado!');
        } catch(err) { showToast(err.message); }
        btn.disabled = false; btn.textContent = 'Gerar';
      });

      document.getElementById('copyInviteLinkBtn')?.addEventListener('click', () => {
        const url = document.getElementById('inviteLinkInput').value;
        navigator.clipboard.writeText(url).then(() => showToast('Link copiado!')).catch(() => {
          document.getElementById('inviteLinkInput').select();
          document.execCommand('copy');
          showToast('Link copiado!');
        });
      });

      document.getElementById('revokeInviteLinkBtn')?.addEventListener('click', async () => {
        if (!confirm('Revogar o link? Quem tiver o link antigo não poderá mais entrar.')) return;
        try {
          await apiFetch(`/communities/${communityId}/invite-link`, { method: 'DELETE' });
          document.getElementById('inviteLinkInput').value = '';
          document.getElementById('copyInviteLinkBtn').style.display = 'none';
          document.getElementById('revokeInviteLinkBtn').style.display = 'none';
          showToast('Link revogado.');
        } catch(err) { showToast(err.message); }
      });
    }

    // Deletar
    document.getElementById('deleteCommBtn')?.addEventListener('click', async () => {
      if (!confirm(t('misc.deleteComm').replace('{name}', comm.name))) return;
      try {
        await apiFetch(`/communities/${communityId}`, { method: 'DELETE' });
        showToast(t('comm.deleted'));
        host.innerHTML = '';
        renderApp();
      } catch(err) { showToast(err.message); }
    });

  } catch(e) {
    showToast(e.message); host.innerHTML = '';
  }
}

/* ── Fórum de Comunidade ────────────────────────── */
async function openCommunityForumModal(communityId, communityName) {
  const host = document.getElementById('modalHost');
  host.innerHTML = `
    <div class="modal-overlay">
      <div class="modal modal--wide">
        <div class="modal-header"><h2>☷ ${esc(communityName || t('misc.commForum'))}</h2><button class="modal-close" data-action="close-modal">✕</button></div>
        <div class="modal-body"><div class="spinner"></div></div>
      </div>
    </div>`;
  try {
    const [topics, allComms] = await Promise.all([
      apiFetch(`/communities/${communityId}/topics`),
      apiFetch('/communities'),
    ]);
    const comm = allComms.find(c => c.id === communityId) || {};
    const allowAnon = !!comm.allow_anonymous;

    host.querySelector('.modal-body').innerHTML = `
      <div style="margin-bottom:16px">
        <button class="submit-btn" style="width:100%" id="newTopicBtn">+ Novo tópico</button>
      </div>
      <div id="newTopicForm" hidden style="background:var(--bg);border-radius:12px;padding:16px;margin-bottom:16px">
        <input id="topicTitle" class="form-text-input" placeholder="Título do tópico" maxlength="100" style="margin-bottom:10px">
        <textarea id="topicContent" class="form-textarea" rows="3" placeholder="Conteúdo…" maxlength="2000"></textarea>
        ${allowAnon ? `<label class="comm-anon-check"><input type="checkbox" id="topicAnon"> 🎭 ${CURRENT_LANG === 'pt' ? 'Postar anonimamente' : 'Post anonymously'}</label>` : ''}
        <div style="display:flex;gap:8px;margin-top:10px">
          <button class="gif-btn" type="button" data-action="open-gif-picker" data-target-id="topicContent" title="GIF">GIF</button>
          <button class="submit-btn" style="flex:1" id="topicSubmitBtn">Publicar tópico</button>
        </div>
      </div>
      <div id="topics-list">
        ${topics.map(tp => `
          <div class="topic-row" data-action="open-topic" data-community-id="${communityId}" data-topic-id="${tp.id}" style="cursor:pointer">
            <div class="avatar avatar--small${avCls(tp.avatar_text)}" style="${avBg(tp.avatar_text,tp.avatar_color)};pointer-events:none">${avTxt(tp.avatar_text)}</div>
            <div style="flex:1;pointer-events:none">
              <div style="font-weight:700">${esc(tp.title)}</div>
              <div style="font-size:12px;color:var(--muted)">${tp.username ? `por @${esc(tp.username)}` : `🎭 ${esc(tp.display_name)}`} · ${timeAgo(tp.created_at)} · 💬 ${tp.replies_count}</div>
            </div>
          </div>`).join('') || `<p style="color:var(--muted);font-size:13px">${t('forum.noTopics')}</p>`}
      </div>`;

    document.getElementById('newTopicBtn').addEventListener('click', () => {
      document.getElementById('newTopicForm').hidden = !document.getElementById('newTopicForm').hidden;
    });
    document.getElementById('topicSubmitBtn').addEventListener('click', async () => {
      const title     = document.getElementById('topicTitle').value.trim();
      const content   = document.getElementById('topicContent').value.trim();
      const anonymous = document.getElementById('topicAnon')?.checked || false;
      if (!title || !content) return showToast(t('comm.topicErr'));
      const btn = document.getElementById('topicSubmitBtn');
      btn.disabled = true; btn.textContent = 'Publicando…';
      try {
        await apiFetch(`/communities/${communityId}/topics`, { method: 'POST', body: JSON.stringify({ title, content, anonymous }) });
        showToast(t('comm.topicCreated'));
        openCommunityForumModal(communityId, communityName);
      } catch(err) { showToast(err.message); btn.disabled=false; btn.textContent=t('forum.publishTopic'); }
    });
  } catch(e) { showToast(e.message); host.innerHTML = ''; }
}

async function openTopicModal(communityId, topicId) {
  const host = document.getElementById('modalHost');
  host.innerHTML = `
    <div class="modal-overlay">
      <div class="modal modal--wide">
        <div class="modal-header"><h2>📝 Tópico</h2><button class="modal-close" data-action="close-modal">✕</button></div>
        <div class="modal-body"><div class="spinner"></div></div>
      </div>
    </div>`;
  try {
    const [topics, replies, allComms] = await Promise.all([
      apiFetch(`/communities/${communityId}/topics`),
      apiFetch(`/communities/${communityId}/topics/${topicId}/replies`),
      apiFetch('/communities'),
    ]);
    const topic = topics.find(t => t.id === topicId);
    if (!topic) throw new Error(t('forum.notFound'));
    const comm = allComms.find(c => c.id === communityId) || {};
    const allowAnon = !!comm.allow_anonymous;

    const authorLine = topic.username
      ? `por @${esc(topic.username)}`
      : `🎭 ${esc(topic.display_name)}`;

    host.querySelector('.modal-body').innerHTML = `
      <div class="topic-header-card">
        <div class="avatar avatar--small${avCls(topic.avatar_text)}" style="${avBg(topic.avatar_text,topic.avatar_color)}">${avTxt(topic.avatar_text)}</div>
        <div style="flex:1">
          <div style="font-weight:800;font-size:16px">${esc(topic.title)}</div>
          <div style="font-size:12px;color:var(--muted)">${authorLine} · ${timeAgo(topic.created_at)}</div>
          <div style="margin-top:8px;font-size:13px;line-height:1.6">${renderGifInText(topic.content)}</div>
        </div>
      </div>
      <div style="font-size:13px;font-weight:700;color:var(--secondary);margin:14px 0 10px">Respostas (${replies.length})</div>
      <div id="replies-list">
        ${replies.map(r => `
          <div class="reply-row">
            <div class="avatar avatar--small${avCls(r.avatar_text)}" style="${avBg(r.avatar_text,r.avatar_color)}">${avTxt(r.avatar_text)}</div>
            <div style="flex:1">
              <div style="font-weight:700;font-size:13px">${r.username ? `@${esc(r.username)}` : `🎭 ${esc(r.display_name)}`}</div>
              <div style="font-size:13px;margin-top:2px">${renderGifInText(r.content)}</div>
              <div style="font-size:11px;color:var(--muted)">${timeAgo(r.created_at)}</div>
            </div>
          </div>`).join('') || '<p style="color:var(--muted);font-size:13px">Sem respostas ainda.</p>'}
      </div>
      ${allowAnon ? `<label class="comm-anon-check" style="margin-top:12px"><input type="checkbox" id="replyAnon"> 🎭 ${CURRENT_LANG === 'pt' ? 'Responder anonimamente' : 'Reply anonymously'}</label>` : ''}
      <div style="margin-top:8px;display:flex;gap:8px;align-items:center">
        <input id="replyInput" class="form-text-input" style="flex:1" placeholder="Sua resposta…" maxlength="2000">
        <button class="gif-btn" type="button" data-action="open-gif-picker" data-target-id="replyInput" title="GIF">GIF</button>
        <button class="submit-btn" style="width:auto;padding:12px 18px" id="replyBtn">Responder</button>
      </div>`;

    const submitReply = async () => {
      const content = document.getElementById('replyInput').value.trim();
      const anonymous = document.getElementById('replyAnon')?.checked || false;
      if (!content) return;
      const btn = document.getElementById('replyBtn');
      btn.disabled = true;
      try {
        const reply = await apiFetch(`/communities/${communityId}/topics/${topicId}/replies`, { method: 'POST', body: JSON.stringify({ content, anonymous }) });
        document.getElementById('replyInput').value = '';
        if (document.getElementById('replyAnon')) document.getElementById('replyAnon').checked = false;
        const list = document.getElementById('replies-list');
        const empty = list.querySelector('p');
        if (empty) empty.remove();
        list.insertAdjacentHTML('beforeend', `
          <div class="reply-row">
            <div class="avatar avatar--small${avCls(reply.avatar_text)}" style="${avBg(reply.avatar_text,reply.avatar_color)}">${avTxt(reply.avatar_text)}</div>
            <div style="flex:1">
              <div style="font-weight:700;font-size:13px">${reply.username ? `@${esc(reply.username)}` : `🎭 ${esc(reply.display_name)}`}</div>
              <div style="font-size:13px;margin-top:2px">${renderGifInText(reply.content)}</div>
              <div style="font-size:11px;color:var(--muted)">agora</div>
            </div>
          </div>`);
        showToast(t('comm.replied'));
        btn.disabled = false;
      } catch(err) { showToast(err.message); btn.disabled = false; }
    };

    document.getElementById('replyBtn').addEventListener('click', submitReply);
    document.getElementById('replyInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submitReply();
      }
    });
  } catch(e) { showToast(e.message); host.innerHTML = ''; }
}

async function removeMember(communityId, userId, name) {
  if (!confirm(t('comm.removeMember', { name }))) return;
  try {
    await apiFetch(`/communities/${communityId}/members/${userId}`, { method: 'DELETE' });
    showToast(t('comm.memberRemoved', { name }));
    openCommunityModal(communityId);
  } catch(e) { showToast(e.message); }
}

/* ── Ranking page ───────────────────────────────── */
async function renderRankingPage(root) {
  let data;
  try { data = await apiFetch('/reviews?limit=50'); }
  catch { root.innerHTML = errorState(t('error.loadRanking')); return; }

  const reviews = data.reviews || [];
  // Aggregate by user
  const map = {};
  for (const r of reviews) {
    if (!map[r.user_id]) map[r.user_id] = { id: r.user_id, name: r.display_name, username: r.username, avatar_text: r.avatar_text, avatar_color: r.avatar_color, likes: 0, count: 0 };
    map[r.user_id].likes += r.likes_count;
    map[r.user_id].count++;
  }
  const ranked = Object.values(map).sort((a,b) => b.likes - a.likes);
  const medals = ['🥇','🥈','🥉'];
  const posClass = i => i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';

  root.innerHTML = `
    <div class="page-header"><h2>${t('ranking.title')}</h2><p>${t('ranking.sub')}</p></div>
    <div class="ranking-page">
      ${ranked.map((u,i) => `
        <div class="rank-card">
          <div class="rank-pos ${posClass(i)}">${medals[i] || `#${i+1}`}</div>
          <button class="avatar avatar--medium user-link${avCls(u.avatar_text)}" style="${avBg(u.avatar_text,u.avatar_color)};border:none"
                  data-action="view-profile" data-user-id="${u.id}">${avTxt(u.avatar_text)}</button>
          <div class="rank-user-info">
            <h4><button class="user-link" data-action="view-profile" data-user-id="${u.id}">${esc(u.name)}</button></h4>
            <p>@${esc(u.username)} · ${u.count} ${t('ranking.reviews')}</p>
          </div>
          <div class="rank-score-big">
            <div class="score">${u.likes}</div>
            <div class="label">${t('ranking.likes')}</div>
          </div>
        </div>`).join('') || emptyState('★', t('ranking.empty'), t('ranking.emptySub'))}
    </div>`;
}

/* ── Settings page ──────────────────────────────── */
async function renderSettingsPage(root) {
  root.innerHTML = '<div class="spinner"></div>';

  // Carrega status do 2FA e prefs de notificação em paralelo
  let totpEnabled = false;
  let notifPrefs = null;
  try {
    const [s, p] = await Promise.all([
      apiFetch('/auth/2fa/status').catch(() => ({})),
      apiFetch('/notifications/prefs').catch(() => null),
    ]);
    totpEnabled = !!s.totp_enabled;
    notifPrefs = p;
  } catch { /* silencioso */ }

  const NOTIF_TYPES = [
    { key: 'friend_request',   label: t('notifPref.friend_request')   || 'Pedido de amizade' },
    { key: 'friend_accepted',  label: t('notifPref.friend_accepted')   || 'Amizade aceita' },
    { key: 'scrap',            label: t('notifPref.scrap')             || 'Recado recebido' },
    { key: 'testimonial',      label: t('notifPref.testimonial')       || 'Depoimento recebido' },
    { key: 'vote',             label: t('notifPref.vote')              || 'Voto no perfil' },
    { key: 'review_like',      label: t('notifPref.review_like')       || 'Curtida na avaliação' },
    { key: 'review_comment',   label: t('notifPref.review_comment')    || 'Comentário na avaliação' },
    { key: 'community_topic',  label: t('notifPref.community_topic')   || 'Novo tópico em comunidade' },
    { key: 'community_reply',  label: t('notifPref.community_reply')   || 'Resposta em tópico' },
  ];

  const prefsRows = NOTIF_TYPES.map(({ key, label }) => {
    const appOn   = notifPrefs?.[key]?.app   !== false;
    const emailOn = notifPrefs?.[key]?.email === true;
    return `<tr class="notif-pref-row" data-key="${key}">
      <td class="notif-pref-label">${esc(label)}</td>
      <td style="text-align:center">
        <label class="notif-pref-toggle-wrap">
          <input type="checkbox" data-pref="${key}" data-channel="app" ${appOn ? 'checked' : ''}>
          <span class="notif-pref-toggle-slider"></span>
        </label>
      </td>
      <td style="text-align:center">
        <label class="notif-pref-toggle-wrap">
          <input type="checkbox" data-pref="${key}" data-channel="email" ${emailOn ? 'checked' : ''}>
          <span class="notif-pref-toggle-slider"></span>
        </label>
      </td>
    </tr>`;
  }).join('');

  root.innerHTML = `
    <div class="settings-page">
      <div class="page-header"><h2>${t('settings.title')}</h2></div>

      <div class="settings-card">
        <h3>${t('settings.account')}</h3>
        <p style="font-size:14px;color:var(--muted);margin-bottom:16px">
          ${t('settings.loggedAs')} <strong>${esc(currentUser.display_name)}</strong> (@${esc(currentUser.username)})
        </p>
        <button class="btn-secondary" data-action="logout" type="button">${t('settings.logoutBtn')}</button>
      </div>

      <div class="settings-card">
        <h3>${t('settings.langTitle')}</h3>
        <div class="lang-options">
          <button class="lang-option-btn${CURRENT_LANG === 'pt' ? ' active' : ''}" type="button" onclick="setLang('pt')">
            🇧🇷 Português (Brasil)
          </button>
          <button class="lang-option-btn${CURRENT_LANG === 'en' ? ' active' : ''}" type="button" onclick="setLang('en')">
            🇺🇸 English (US)
          </button>
        </div>
      </div>

      <div class="settings-card" id="notif-prefs-card">
        <h3>${t('notifPref.title')}</h3>
        <p style="font-size:13px;color:var(--muted);margin-bottom:16px;line-height:1.5">
          ${t('notifPref.desc')}
        </p>
        ${notifPrefs !== null ? `
        <table class="notif-prefs-table">
          <thead>
            <tr>
              <th style="text-align:left">${t('notifPref.event')}</th>
              <th style="text-align:center">${t('notifPref.app')}</th>
              <th style="text-align:center">${t('notifPref.email')}</th>
            </tr>
          </thead>
          <tbody id="notifPrefsBody">
            ${prefsRows}
          </tbody>
        </table>
        <p id="notifPrefsSaved" class="notif-prefs-saved" style="display:none">✅ ${t('notifPref.saved')}</p>
        ` : `<p style="font-size:13px;color:var(--muted)">${t('notifPref.loginRequired')}</p>`}
      </div>

      <div class="settings-card" id="twofa-card">
        <h3>${t('settings.2fa')}</h3>
        <p style="font-size:14px;color:var(--muted);margin-bottom:16px;line-height:1.6">
          ${t('settings.2faDesc')}
        </p>
        <div id="twofa-status">
          ${totpEnabled
            ? `<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
                 <span style="background:#1a6b1a;color:#fff;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700">${t('settings.2faActive')}</span>
                 <span style="font-size:13px;color:var(--muted)">${t('settings.2faProtected')}</span>
               </div>
               <button class="btn-secondary" style="color:#c0392b" id="disable2faBtn" type="button">${t('settings.2faDisable')}</button>`
            : `<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
                 <span style="background:var(--border);color:var(--muted);padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700">${t('settings.2faInactive')}</span>
                 <span style="font-size:13px;color:var(--muted)">${t('settings.2faNotActive')}</span>
               </div>
               <button class="primary-action" style="width:auto;padding:10px 24px" id="setup2faBtn" type="button">${t('settings.2faEnable')}</button>`
          }
        </div>
        <div id="twofa-setup" style="display:none;margin-top:20px"></div>
        <div id="twofa-disable" style="display:none;margin-top:20px"></div>
      </div>

      <div class="settings-card">
        <h3>${t('settings.about')}</h3>
        <p style="font-size:14px;color:var(--muted)">${t('settings.aboutText')}</p>
      </div>

      <div class="settings-card settings-card--danger">
        <h3>${t('settings.danger')}</h3>
        <p style="font-size:14px;color:var(--muted);margin-bottom:20px;line-height:1.6">
          ${t('settings.dangerDesc')}
        </p>
        <button class="btn-danger" id="deleteAccountBtn" type="button">${t('settings.deleteBtn')}</button>
        <div id="delete-account-form" style="display:none;margin-top:20px">
          <div class="twofa-setup-box">
            <p style="font-size:14px;color:var(--text);font-weight:600;margin:0 0 12px">${t('settings.deleteConfirm')}</p>
            <input id="deleteAccountPass" class="form-text-input" type="password" placeholder="${t('settings.passwordPh')}" style="margin-bottom:12px">
            <p id="delete-account-error" style="color:#c0392b;font-size:13px;margin:0 0 12px" hidden></p>
            <div style="display:flex;gap:10px">
              <button class="btn-secondary" id="cancelDeleteBtn" type="button" style="flex:1">${t('settings.deleteCancel')}</button>
              <button class="btn-danger" id="confirmDeleteBtn" type="button" style="flex:1">${t('settings.deleteOk')}</button>
            </div>
          </div>
        </div>
      </div>
    </div>`;

  // Botão ativar 2FA
  root.querySelector('#setup2faBtn')?.addEventListener('click', () => setup2FA(root));

  // Botão desativar 2FA
  root.querySelector('#disable2faBtn')?.addEventListener('click', () => showDisable2FA(root));

  // Preferências de notificação — salva automaticamente ao mudar toggle
  let notifSaveTimer = null;
  root.querySelector('#notifPrefsBody')?.addEventListener('change', () => {
    clearTimeout(notifSaveTimer);
    notifSaveTimer = setTimeout(async () => {
      const rows = root.querySelectorAll('#notifPrefsBody .notif-pref-row');
      const prefs = {};
      rows.forEach(row => {
        const key = row.dataset.key;
        const appInput   = row.querySelector('[data-channel="app"]');
        const emailInput = row.querySelector('[data-channel="email"]');
        prefs[key] = { app: appInput?.checked ?? true, email: emailInput?.checked ?? false };
      });
      try {
        await apiFetch('/notifications/prefs', { method: 'PUT', body: JSON.stringify(prefs) });
        const savedMsg = root.querySelector('#notifPrefsSaved');
        if (savedMsg) { savedMsg.style.display = ''; setTimeout(() => { savedMsg.style.display = 'none'; }, 2500); }
      } catch (e) {
        showToast(e.message, 'error');
      }
    }, 600);
  });

  // Exclusão de conta
  root.querySelector('#deleteAccountBtn')?.addEventListener('click', () => {
    root.querySelector('#delete-account-form').style.display = '';
    root.querySelector('#deleteAccountBtn').style.display = 'none';
    root.querySelector('#deleteAccountPass').focus();
  });
  root.querySelector('#cancelDeleteBtn')?.addEventListener('click', () => {
    root.querySelector('#delete-account-form').style.display = 'none';
    root.querySelector('#deleteAccountBtn').style.display = '';
    root.querySelector('#deleteAccountPass').value = '';
    root.querySelector('#delete-account-error').hidden = true;
  });
  root.querySelector('#confirmDeleteBtn')?.addEventListener('click', async () => {
    const password = root.querySelector('#deleteAccountPass').value;
    const errEl = root.querySelector('#delete-account-error');
    const btn = root.querySelector('#confirmDeleteBtn');
    if (!password) { errEl.textContent = t('settings.passRequired'); errEl.hidden = false; return; }
    btn.disabled = true; btn.textContent = t('settings.deleting');
    try {
      await apiFetch(`/users/${currentUser.id}`, {
        method: 'DELETE',
        body: JSON.stringify({ password }),
      });
      localStorage.clear();
      currentUser = null;
      showToast(t('settings.deleted'));
      setTimeout(() => { location.href = '/'; }, 1500);
    } catch (e) {
      errEl.textContent = e.message; errEl.hidden = false;
      btn.disabled = false; btn.textContent = t('settings.deleteOk');
    }
  });
}

async function setup2FA(root) {
  const setupDiv = root.querySelector('#twofa-setup');
  setupDiv.innerHTML = '<div class="spinner"></div>';
  setupDiv.style.display = '';
  try {
    const data = await apiFetch('/auth/2fa/setup', { method: 'POST' });
    setupDiv.innerHTML = `
      <div class="twofa-setup-box">
        <p style="font-size:14px;color:var(--text);margin:0 0 12px;font-weight:600">${t('settings.2faSetup1')}</p>
        <img src="${data.qr_code}" alt="QR Code 2FA" style="width:200px;height:200px;border-radius:12px;border:3px solid var(--border);display:block;margin:0 auto 16px">
        <p style="font-size:12px;color:var(--muted);margin:0 0 4px;text-align:center">${t('settings.2faSetup2')}</p>
        <div style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:10px;font-family:monospace;font-size:13px;text-align:center;word-break:break-all;margin-bottom:20px;color:var(--accent)">${data.secret}</div>
        <p style="font-size:14px;color:var(--text);margin:0 0 8px;font-weight:600">${t('settings.2faSetup3')}</p>
        <input id="confirmTotpInput" class="form-text-input" type="text" placeholder="000 000"
               maxlength="7" style="text-align:center;font-size:22px;letter-spacing:6px;font-weight:700;margin-bottom:12px">
        <p id="twofa-confirm-error" style="color:#c0392b;font-size:13px;margin:0 0 12px" hidden></p>
        <button class="primary-action" style="width:100%;padding:12px" id="confirmTotpBtn" type="button">${t('settings.2faConfirm')}</button>
      </div>`;

    root.querySelector('#confirmTotpBtn').addEventListener('click', async () => {
      const code = root.querySelector('#confirmTotpInput').value.replace(/\s/g,'');
      const errEl = root.querySelector('#twofa-confirm-error');
      const btn = root.querySelector('#confirmTotpBtn');
      btn.disabled = true; btn.textContent = t('settings.2faConfirming');
      try {
        const res = await apiFetch('/auth/2fa/confirm', { method: 'POST', body: JSON.stringify({ code }) });
        showToast(t('settings.2faEnabled'));
        renderSettingsPage(root);
      } catch (e) {
        errEl.textContent = e.message; errEl.hidden = false;
        btn.disabled = false; btn.textContent = t('settings.2faConfirm');
      }
    });
  } catch (e) {
    setupDiv.innerHTML = `<p style="color:#c0392b;font-size:13px">${esc(e.message)}</p>`;
  }
}

function showDisable2FA(root) {
  const disableDiv = root.querySelector('#twofa-disable');
  disableDiv.style.display = '';
  disableDiv.innerHTML = `
    <div class="twofa-setup-box">
      <p style="font-size:14px;color:var(--text);margin:0 0 12px">${t('settings.2faDisableForm')}</p>
      <input id="disablePassInput" class="form-text-input" type="password" placeholder="${t('settings.passwordPh')}" style="margin-bottom:10px">
      <input id="disableCodeInput" class="form-text-input" type="text" placeholder="${t('settings.codePh')}"
             maxlength="7" style="text-align:center;font-size:18px;letter-spacing:4px;margin-bottom:12px">
      <p id="twofa-disable-error" style="color:#c0392b;font-size:13px;margin:0 0 12px" hidden></p>
      <button class="btn-secondary" style="color:#c0392b;width:100%" id="confirmDisableBtn" type="button">${t('settings.2faDisableBtn')}</button>
    </div>`;

  root.querySelector('#confirmDisableBtn').addEventListener('click', async () => {
    const password = root.querySelector('#disablePassInput').value;
    const code = root.querySelector('#disableCodeInput').value.replace(/\s/g,'');
    const errEl = root.querySelector('#twofa-disable-error');
    const btn = root.querySelector('#confirmDisableBtn');
    btn.disabled = true; btn.textContent = t('settings.2faConfirming');
    try {
      await apiFetch('/auth/2fa/disable', { method: 'POST', body: JSON.stringify({ password, code }) });
      showToast(t('settings.2faDisabled'));
      renderSettingsPage(root);
    } catch (e) {
      errEl.textContent = e.message; errEl.hidden = false;
      btn.disabled = false; btn.textContent = t('settings.2faDisableBtn');
    }
  });
}

/* ── Likes / communities ────────────────────────── */
async function toggleLike(reviewId, liked, btn) {
  if (btn.disabled) return;
  btn.disabled = true;
  try {
    const res = liked
      ? await apiFetch(`/reviews/${reviewId}/like`, { method: 'DELETE' })
      : await apiFetch(`/reviews/${reviewId}/like`, { method: 'POST' });
    btn.dataset.liked = res.liked ? '1' : '0';
    btn.classList.toggle('liked', res.liked);
    const countEl = document.getElementById(`likes-${reviewId}`);
    if (countEl) countEl.textContent = res.likes_count;

    // Atualiza o contador "CURTIDAS" no painel de perfil se for review do próprio usuário
    if (currentUser) {
      const card = btn.closest('.review-card');
      const reviewUserId = card?.querySelector('[data-action="view-profile"]')?.dataset?.userId;
      if (reviewUserId === currentUser.id) {
        const delta = res.liked ? 1 : -1;
        currentUser.likes_total = Math.max(0, (currentUser.likes_total || 0) + delta);
        const statEl = document.querySelector('.panel-stat-btn[data-action="show-user-likes"] .stat-num');
        if (statEl) statEl.textContent = currentUser.likes_total;
      }
    }

    showToast(res.liked ? t('review.liked') : t('review.unliked'));
  } catch (err) { showToast(err.message); }
  finally { btn.disabled = false; }
}

async function toggleCommunity(id, joined, btn) {
  try {
    const res = joined
      ? await apiFetch(`/communities/${id}/leave`, { method: 'DELETE' })
      : await apiFetch(`/communities/${id}/join`,  { method: 'POST' });
    btn.dataset.joined = res.is_member ? '1' : '0';
    btn.classList.toggle('joined', res.is_member);
    btn.textContent = res.is_member ? (btn.classList.contains('comm-join-btn') ? '✓ Participando' : 'Entrou') : (btn.classList.contains('comm-join-btn') ? 'Participar' : 'Entrar');
    showToast(res.is_member ? t('comm.joined') : t('comm.left'));
  } catch (err) { showToast(err.message); }
}

/* ── Comments ───────────────────────────────────── */
const COMMENT_REACTIONS = ['👍','❤️','😂','😮','😢','😡'];

function commentItemHTML(comment) {
  const isMine = currentUser && comment.user_id === currentUser.id;
  const reactions = comment.reactions || [];
  const myReact   = comment.my_reaction || null;

  const reactPills = reactions.length
    ? reactions.map(r => `
        <button type="button" class="react-pill${myReact === r.emoji ? ' mine' : ''}"
                data-action="do-comment-react" data-cid="${comment.id}" data-rid="${comment.review_id}" data-emoji="${r.emoji}">
          ${r.emoji} <span>${r.count}</span>
        </button>`).join('')
    : '';

  const pickerBtns = currentUser ? COMMENT_REACTIONS.map(e =>
    `<button type="button" class="react-pick-btn${myReact === e ? ' active' : ''}"
             data-action="do-comment-react" data-cid="${comment.id}" data-rid="${comment.review_id}" data-emoji="${e}">${e}</button>`
  ).join('') : '';

  return `
    <div class="comment-item" data-cid="${comment.id}">
      <div class="avatar avatar--small${avCls(comment.avatar_text)}" style="${avBg(comment.avatar_text,comment.avatar_color)}">${avTxt(comment.avatar_text)}</div>
      <div class="comment-body" style="flex:1">
        <div class="comment-author">${esc(comment.display_name)}</div>
        <div class="comment-text">${renderGifInText(comment.text)}</div>
        <div class="comment-footer">
          <div class="react-pills" id="react-pills-${comment.id}">${reactPills}</div>
          ${currentUser ? `<button type="button" class="comment-react-toggle${myReact ? ' has-react' : ''}" data-action="toggle-react-picker" data-cid="${comment.id}" title="Reagir">😊</button>` : ''}
        </div>
        ${currentUser ? `<div class="react-picker" id="react-picker-${comment.id}" hidden>${pickerBtns}</div>` : ''}
      </div>
      ${isMine ? `<button class="action-btn-sm action-btn-danger" style="padding:2px 8px;font-size:11px"
        data-action="delete-comment" data-id="${comment.id}" data-review-id="${comment.review_id}">✕</button>` : ''}
    </div>`;
}

async function loadComments(reviewId) {
  const list = document.getElementById(`comment-list-${reviewId}`);
  if (!list) return;
  if (list.dataset.loaded) return;
  list.innerHTML = '<div class="spinner" style="transform:scale(.6)"></div>';
  try {
    const comments = await apiFetch(`/reviews/${reviewId}/comments`);
    list.dataset.loaded = '1';
    list.innerHTML = comments.length
      ? comments.map(commentItemHTML).join('')
      : `<p style="font-size:12px;color:var(--muted);padding:8px 0">${t('misc.noComments')}</p>`;
    const cnt = document.getElementById(`comm-count-${reviewId}`);
    if (cnt) cnt.textContent = comments.length;
  } catch { list.innerHTML = ''; }
}

async function submitComment(form) {
  const reviewId = form.dataset.reviewId;
  const input = form.querySelector('input');
  const text = input.value.trim();
  if (!text) return;
  try {
    const comment = await apiFetch(`/reviews/${reviewId}/comments`, { method: 'POST', body: JSON.stringify({ text }) });
    input.value = '';
    const list = document.getElementById(`comment-list-${reviewId}`);
    if (list) {
      const empty = list.querySelector('p');
      if (empty) empty.remove();
      list.insertAdjacentHTML('beforeend', commentItemHTML(comment));
    }
    const cnt = document.getElementById(`comm-count-${reviewId}`);
    if (cnt) cnt.textContent = parseInt(cnt.textContent || 0) + 1;
    showToast(t('review.commented'));
  } catch (err) { showToast(err.message); }
}

/* ── Search ─────────────────────────────────────── */
async function renderSearchResults(query) {
  const panel = document.getElementById('searchPanel');
  panel.innerHTML = '<div style="padding:10px;font-size:13px;color:var(--muted)">Buscando…</div>';
  try {
    const users = await apiFetch(`/users/search?q=${encodeURIComponent(query)}`);
    if (!users.length) { panel.innerHTML = `<div style="padding:10px;font-size:13px;color:var(--muted)">Nenhum resultado.</div>`; return; }
    panel.innerHTML = users.map(u => `
      <div class="search-result-item" data-action="view-profile" data-user-id="${u.id}" style="cursor:pointer">
        <div class="avatar avatar--small${avCls(u.avatar_text)}" style="${avBg(u.avatar_text,u.avatar_color)};pointer-events:none">${avTxt(u.avatar_text)}</div>
        <div style="pointer-events:none">
          <div style="font-weight:700;font-size:13px">${esc(u.display_name)}</div>
          <div style="color:var(--muted);font-size:12px">@${esc(u.username)}</div>
        </div>
      </div>`).join('');
  } catch { panel.innerHTML = `<div style="padding:10px;font-size:13px;color:var(--muted)">Erro na busca.</div>`; }
}

/* ── PWA / SW ───────────────────────────────────── */
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
}

function updateConnectionStatus() {
  const el = document.getElementById('connectionStatus');
  if (!el) return;
  el.textContent = navigator.onLine ? 'Online' : 'Offline';
  el.style.background = navigator.onLine ? 'rgba(107,191,89,.5)' : 'rgba(231,76,60,.5)';
}

/* ── Toast ──────────────────────────────────────── */
function showToast(msg, ms = 3000) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), ms);
}

function showOrkutNotif(msg, ms = 4000) {
  let notif = document.getElementById('orkutNotif');
  if (!notif) {
    notif = document.createElement('div');
    notif.id = 'orkutNotif';
    notif.className = 'orkut-notif';
    document.body.appendChild(notif);
  }
  notif.innerHTML = `<div class="orkut-notif-content">${esc(msg)}</div>`;
  notif.classList.add('show');
  clearTimeout(notif._timer);
  notif._timer = setTimeout(() => notif.classList.remove('show'), ms);
}

/* ── Helpers ────────────────────────────────────── */
function esc(str) {
  if (str == null) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

/* ── GIF helpers ─────────────────────────────────── */
// Converte tokens [gif:URL] no texto em <img> seguras (somente domínio giphy)
function renderGifInText(rawText) {
  if (!rawText) return '';
  const GIF_RE = /\[gif:(https:\/\/media[0-9]*\.giphy\.com\/[^\]]{0,300})\]/g;
  const parts = [];
  let last = 0, m;
  while ((m = GIF_RE.exec(rawText)) !== null) {
    if (m.index > last) parts.push(esc(rawText.slice(last, m.index)));
    parts.push(`<img class="chat-gif" src="${esc(m[1])}" alt="GIF" loading="lazy">`);
    last = m.index + m[0].length;
  }
  if (last < rawText.length) parts.push(esc(rawText.slice(last)));
  return parts.join('');
}

let _gifPickerEl = null;

function openGifPicker(inputEl) {
  // Toggle: se o picker já existe, fechar
  if (_gifPickerEl) { _gifPickerEl.remove(); _gifPickerEl = null; return; }

  const picker = document.createElement('div');
  picker.className = 'gif-picker';
  picker.innerHTML = `
    <input class="gif-search" type="text" placeholder="🔍 Buscar GIF…" autocomplete="off">
    <div class="gif-grid"></div>
  `;
  document.body.appendChild(picker);
  _gifPickerEl = picker;

  // Posicionar acima ou abaixo do input
  const rect = inputEl.getBoundingClientRect();
  const PICKER_H = 290;
  const spaceBelow = window.innerHeight - rect.bottom;
  if (spaceBelow >= PICKER_H || spaceBelow >= rect.top) {
    picker.style.top = (rect.bottom + 6) + 'px';
  } else {
    picker.style.top = (rect.top - PICKER_H - 6) + 'px';
  }
  picker.style.left = Math.max(8, Math.min(rect.left, window.innerWidth - 320)) + 'px';

  const searchInput = picker.querySelector('.gif-search');
  const grid = picker.querySelector('.gif-grid');

  const loadGifs = async (q = '') => {
    grid.innerHTML = '<div class="gif-loading">Carregando…</div>';
    try {
      const ep = q
        ? `/giphy/search?q=${encodeURIComponent(q)}&limit=18`
        : '/giphy/trending?limit=18';
      const res = await apiFetch(ep);
      if (!res.data?.length) { grid.innerHTML = '<div class="gif-loading">Nenhum resultado.</div>'; return; }
      grid.innerHTML = res.data.map(g =>
        `<img class="gif-item" src="${esc(g.preview || g.url)}" data-url="${esc(g.url)}" alt="${esc(g.title)}" loading="lazy">`
      ).join('');
      grid.querySelectorAll('.gif-item').forEach(img => {
        img.addEventListener('click', () => {
          const gifTag = `[gif:${img.dataset.url}]`;
          inputEl.value = inputEl.value ? inputEl.value + ' ' + gifTag : gifTag;
          inputEl.dispatchEvent(new Event('input'));
          picker.remove();
          _gifPickerEl = null;
        });
      });
    } catch { grid.innerHTML = '<div class="gif-loading">Erro ao carregar.</div>'; }
  };

  let debounce;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => loadGifs(searchInput.value.trim()), 450);
  });

  loadGifs();

  setTimeout(() => {
    document.addEventListener('click', function onOut(e) {
      if (!picker.contains(e.target)) {
        picker.remove();
        _gifPickerEl = null;
        document.removeEventListener('click', onOut);
      }
    });
  }, 0);

  searchInput.focus();
}

function qualityIcon(q) {
  const opts = getQualityOptions();
  const o = opts.find(x => x.value === Number(q));
  return o ? o.icon : '?';
}

function timeAgo(iso) {
  if (!iso) return '';
  const d = new Date(iso.replace(' ','T') + (iso.includes('T') ? '' : 'Z'));
  const s = (Date.now() - d.getTime()) / 1000;
  if (s < 60) return t('time.now');
  if (s < 3600)   return t('time.minAgo').replace('{n}', Math.floor(s/60));
  if (s < 86400)  return t('time.hAgo').replace('{n}', Math.floor(s/3600));
  if (s < 604800) return t('time.dAgo').replace('{n}', Math.floor(s/86400));
  return d.toLocaleDateString('pt-BR');
}

function fmtNum(n) {
  if (n >= 1000) return (n/1000).toFixed(1).replace('.0','') + 'k';
  return String(n || 0);
}

function emptyState(emoji, title, desc) {
  return `<div class="empty-state"><div class="emoji">${emoji}</div><h3>${esc(title)}</h3><p>${esc(desc)}</p></div>`;
}

function errorState(msg) {
  return `<div class="empty-state"><div class="emoji">⚠️</div><h3>Erro</h3><p>${esc(msg)}</p></div>`;
}

/* ── Notifications ──────────────────────────────────────────────────────── */
const NOTIF_ICONS = {
  friend_request: '👥',
  friend_accepted: '🤝',
  scrap: '✉️',
  testimonial: '💬',
  vote: '⭐',
  review_like: '❤️',
  review_comment: '💬',
  comment_reaction: '😊',
  community_topic: '🏘️',
  community_reply: '↩️',
  community_invite: '📨',
  default: '🔔',
};

let notifPollInterval = null;

let lastNotifCount = 0;

async function loadNotifCount() {
  if (!currentUser) return;
  try {
    const data = await apiFetch('/notifications?limit=1');
    const badge = document.getElementById('notifBadge');
    if (!badge) return;
    
    const newCount = data.unread;
    
    if (newCount > 0) {
      badge.textContent = newCount > 99 ? '99+' : newCount;
      badge.hidden = false;
      
      // Animação e notificação estilo Orkut quando há novas notificações
      if (newCount > lastNotifCount && lastNotifCount > 0) {
        badge.classList.add('badge-pulse');
        setTimeout(() => badge.classList.remove('badge-pulse'), 1000);
        
        // Notificação discreta no canto direito (estilo Orkut)
        const diff = newCount - lastNotifCount;
        showOrkutNotif(t('notif.newCount').replace('{n}', diff).replace('{s}', diff > 1 ? 's' : '').replace('{oes}', diff > 1 ? 'ões' : ''));
      }
    } else {
      badge.hidden = true;
    }
    
    lastNotifCount = newCount;
  } catch { /* silencioso */ }
}

function startNotifPolling() {
  loadNotifCount();
  if (notifPollInterval) clearInterval(notifPollInterval);
  notifPollInterval = setInterval(loadNotifCount, 10000); // a cada 10s
}

function toggleNotifPanel() {
  const panel = document.getElementById('notifPanel');
  const overlay = document.getElementById('notifOverlay');
  if (!panel) return;
  const isOpen = !panel.hidden;
  if (isOpen) {
    closeNotifPanel();
  } else {
    panel.hidden = false;
    overlay.hidden = false;
    renderNotifList();
  }
}

function closeNotifPanel() {
  const panel = document.getElementById('notifPanel');
  const overlay = document.getElementById('notifOverlay');
  if (panel) panel.hidden = true;
  if (overlay) overlay.hidden = true;
}

async function renderNotifList() {
  const list = document.getElementById('notifList');
  if (!list) return;
  list.innerHTML = '<div class="spinner"></div>';
  try {
    const data = await apiFetch('/notifications?limit=30');
    const badge = document.getElementById('notifBadge');
    if (badge) {
      if (data.unread > 0) { badge.textContent = data.unread > 99 ? '99+' : data.unread; badge.hidden = false; }
      else badge.hidden = true;
    }
    if (!data.notifications.length) {
      list.innerHTML = `<p class="notif-empty">${t('notif.emptyFull')}</p>`;
      return;
    }
    list.innerHTML = data.notifications.map(n => `
      <div class="notif-item${n.read ? '' : ' unread'}" data-notif-id="${n.id}" onclick="handleNotifClick('${n.id}','${n.type}','${n.entity_id||''}','${n.link||''}')">
        <div class="notif-icon">${NOTIF_ICONS[n.type] || NOTIF_ICONS.default}</div>
        <div class="notif-content">
          <p class="notif-message">${esc(n.message)}</p>
          <p class="notif-time">${timeAgo(n.created_at)}</p>
        </div>
      </div>
    `).join('');
  } catch (e) {
    list.innerHTML = `<p class="notif-empty">${t('notif.loadError')}</p>`;
  }
}

async function openReviewFromNotif(reviewId, expandComments) {
  const host = document.getElementById('modalHost');
  const label = t('misc.reviewLabel');
  host.innerHTML = `
    <div class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h2>💩 ${label}</h2>
          <button class="modal-close" data-action="close-modal">✕</button>
        </div>
        <div class="modal-body" id="reviewNotifBody">
          <div class="spinner"></div>
        </div>
      </div>
    </div>`;
  try {
    const review = await apiFetch(`/reviews/${reviewId}`);
    const body = document.getElementById('reviewNotifBody');
    if (!body) return;
    body.innerHTML = `<div class="feed" style="padding:0">${reviewCard(review)}</div>`;
    if (expandComments) {
      const section = document.getElementById(`comments-${reviewId}`);
      if (section) {
        section.hidden = false;
        loadComments(reviewId);
      }
    }
  } catch (err) {
    const body = document.getElementById('reviewNotifBody');
    if (body) body.innerHTML = `<p style="color:var(--muted);text-align:center;padding:24px">${t('misc.reviewNotFound')}</p>`;
  }
}

async function handleNotifClick(id, type, entityId, link) {
  // Marcar como lida
  apiFetch(`/notifications/${id}/read`, { method: 'PUT' }).catch(() => {});
  const el = document.querySelector(`[data-notif-id="${id}"]`);
  if (el) el.classList.remove('unread');
  loadNotifCount();
  closeNotifPanel();

  // Se tem link específico, usar ele; senão usar lógica baseada no tipo
  if (link && link !== 'null' && link !== 'undefined') {
    window.location.href = link;
    return;
  }

  // Navegar para o conteúdo relevante (fallback para notificações antigas sem link)
  if (type === 'scrap') navigateTo('scraps');
  else if (type === 'friend_request') navigateTo('profile');
  else if (type === 'friend_accepted') navigateTo('profile');
  else if (type === 'testimonial') navigateTo('profile');
  else if (type === 'vote') navigateTo('profile');
  else if (type === 'review_like') openReviewFromNotif(entityId, false);
  else if (type === 'review_comment') openReviewFromNotif(entityId, true);
  else if (type === 'comment_reaction') openReviewFromNotif(entityId, true);
  else if (type === 'community_topic') navigateTo('communities');
  else if (type === 'community_reply') navigateTo('communities');
  else if (type === 'community_invite') navigateTo('communities');
}

window.markAllNotifsRead = async function() {
  await apiFetch('/notifications/read-all', { method: 'PUT' });
  const badge = document.getElementById('notifBadge');
  if (badge) badge.hidden = true;
  document.querySelectorAll('.notif-item.unread').forEach(el => el.classList.remove('unread'));
  showToast(t('notif.allRead'));
};

window.clearAllNotifications = async function() {
  if (!confirm(t('notif.clearConfirm'))) return;
  
  try {
    await apiFetch('/notifications', { method: 'DELETE' });
    const badge = document.getElementById('notifBadge');
    if (badge) badge.hidden = true;
    const list = document.getElementById('notifList');
    if (list) list.innerHTML = `<p class="notif-empty">${t('notif.emptyFull')}</p>`;
    showToast(t('notif.cleared'));
  } catch(err) {
    showToast(err.message);
  }
};

/* ── Forgot / Reset password ──────────────────────────────────────────── */
window.showForgotPassword = function(show = true) {
  document.getElementById('loginForm').style.display   = show ? 'none' : '';
  document.getElementById('forgotForm').style.display  = show ? '' : 'none';
  if (show) {
    document.getElementById('forgotMsg').hidden = true;
  }
};

window.handleForgotPassword = async function(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type=submit]');
  const msg = document.getElementById('forgotMsg');
  const email = form.email.value.trim();
  btn.disabled = true; btn.textContent = 'Enviando…';
  try {
    const data = await fetch(`${API}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }).then(r => r.json());
    msg.textContent = data.message || data.error;
    msg.style.color = data.error ? '' : '#3a6e2a';
    msg.hidden = false;
    if (data.ok) btn.textContent = 'Email enviado! ✓';
    else { btn.disabled = false; btn.textContent = 'Enviar link 🔑'; }
  } catch {
    msg.textContent = 'Erro ao enviar. Tente novamente.';
    msg.hidden = false;
    btn.disabled = false; btn.textContent = 'Enviar link 🔑';
  }
};

window.handleResetPassword = async function(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type=submit]');
  const msg = document.getElementById('resetMsg');
  const password = form.password.value;
  const password2 = form.password2.value;
  if (password !== password2) {
    msg.textContent = t('misc.passNoMatch'); msg.hidden = false; return;
  }
  const token = new URLSearchParams(window.location.search).get('reset_token');
  btn.disabled = true; btn.textContent = 'Salvando…';
  try {
    const data = await fetch(`${API}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    }).then(r => r.json());
    msg.textContent = data.message || data.error;
    msg.style.color = data.error ? '' : '#3a6e2a';
    msg.hidden = false;
    if (data.ok) {
      btn.textContent = 'Senha salva! ✓';
      setTimeout(() => { window.history.replaceState({}, '', '/'); showAuthModal(); switchAuthTab('login'); }, 2000);
    } else { btn.disabled = false; btn.textContent = 'Salvar nova senha 🔑'; }
  } catch {
    msg.textContent = 'Erro ao salvar. Tente novamente.';
    msg.hidden = false;
    btn.disabled = false; btn.textContent = 'Salvar nova senha 🔑';
  }
};

/* ── Bug Report ─────────────────────────────────── */
(function initBugReport() {
  const btn = document.getElementById('bugReportBtn');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    btn.disabled = true;
    btn.textContent = t('bug.capturing') || '🐛 Capturando tela…';

    let screenshotDataUrl = null;
    try {
      if (typeof html2canvas === 'function') {
        const canvas = await html2canvas(document.body, { useCORS: true, logging: false, scale: 0.7 });
        screenshotDataUrl = canvas.toDataURL('image/jpeg', 0.7);
      }
    } catch (e) {
      console.warn('[BUG-REPORT] html2canvas error:', e.message);
    } finally {
      btn.disabled = false;
      btn.textContent = t('shell.footer.bugReport') || '🐛 Achei um Bug! QUE MER**!';
    }

    // Criar overlay + modal
    const overlay = document.createElement('div');
    overlay.className = 'bug-modal-overlay';
    overlay.innerHTML = `
      <div class="bug-modal">
        <h3>${t('bug.title') || '🐛 Reportar Bug'}</h3>
        <p>${t('bug.desc') || 'Descreva o bug abaixo. O screenshot já foi capturado automaticamente.'}</p>
        ${screenshotDataUrl ? `<img src="${screenshotDataUrl}" class="bug-screenshot-preview" alt="Screenshot">` : `<p style="color:var(--muted);font-size:12px">${t('bug.noScreenshot') || 'Screenshot não disponível.'}</p>`}
        <textarea id="bugDescInput" placeholder="${t('bug.placeholder') || 'Descreva o que aconteceu, o que esperava que acontecesse...'}"></textarea>
        <p id="bugReportError" style="color:#c0392b;font-size:13px;margin:0 0 12px;display:none"></p>
        <div class="bug-modal-actions">
          <button class="btn-secondary" id="bugCancelBtn" type="button">${t('bug.cancel') || 'Cancelar'}</button>
          <button class="primary-action" id="bugSubmitBtn" type="button" style="padding:12px">${t('bug.submit') || '🚀 Enviar Bug'}</button>
        </div>
      </div>`;

    document.body.appendChild(overlay);

    overlay.querySelector('#bugCancelBtn').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    overlay.querySelector('#bugSubmitBtn').addEventListener('click', async () => {
      const description = overlay.querySelector('#bugDescInput').value.trim();
      const errEl = overlay.querySelector('#bugReportError');
      const submitBtn = overlay.querySelector('#bugSubmitBtn');
      if (!description && !screenshotDataUrl) {
        errEl.textContent = t('bug.required') || 'Por favor, descreva o bug.';
        errEl.style.display = '';
        return;
      }
      submitBtn.disabled = true;
      submitBtn.textContent = t('bug.sending') || 'Enviando…';
      try {
        await apiFetch('/bug-reports', {
          method: 'POST',
          body: JSON.stringify({
            description,
            screenshot_base64: screenshotDataUrl,
            userAgent: navigator.userAgent,
            url: window.location.href,
            username: currentUser?.username || null,
          }),
        });
        overlay.remove();
        showToast(t('bug.success') || 'Bug reportado! Obrigado! 💩');
      } catch (e) {
        errEl.textContent = e.message || (t('bug.error') || 'Erro ao enviar.');
        errEl.style.display = '';
        submitBtn.disabled = false;
        submitBtn.textContent = t('bug.submit') || '🚀 Enviar Bug';
      }
    });
  });
})();
