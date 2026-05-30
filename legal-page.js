(function () {
  const LANG_KEY = 'kgando:lang';

  function getLang() {
    return localStorage.getItem(LANG_KEY) || 'pt';
  }

  function getLocale(lang) {
    return (window.LOCALES && window.LOCALES[lang]) || (window.LOCALES && window.LOCALES.pt) || {};
  }

  function t(key, locale) {
    return locale[key] || key;
  }

  function applyI18n() {
    const lang = getLang();
    const locale = getLocale(lang);
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en-US';

    const pageTitle = document.body.dataset.pageTitle;
    if (pageTitle) document.title = t(pageTitle, locale);

    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = t(el.dataset.i18n, locale);
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      el.innerHTML = t(el.dataset.i18nHtml, locale);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      el.placeholder = t(el.dataset.i18nPlaceholder, locale);
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      el.title = t(el.dataset.i18nTitle, locale);
    });
    document.querySelectorAll('select option[data-i18n]').forEach(opt => {
      opt.textContent = t(opt.dataset.i18n, locale);
    });

    const flagBtn = document.getElementById('legalLangFlag');
    if (flagBtn) flagBtn.textContent = lang === 'en' ? '🇺🇸' : '🇧🇷';
  }

  window.toggleLegalLang = function () {
    const lang = getLang();
    localStorage.setItem(LANG_KEY, lang === 'pt' ? 'en' : 'pt');
    location.reload();
  };

  window.legalT = function (key) {
    return t(key, getLocale(getLang()));
  };

  window.submitDeletionForm = async function (e) {
    e.preventDefault();
    const btn = document.getElementById('btnSubmit');
    const msg = document.getElementById('formMsg');
    btn.disabled = true;
    btn.textContent = window.legalT('legal.deletion.form.sending');

    const data = Object.fromEntries(new FormData(e.target));

    try {
      const res = await fetch('/api/data-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        msg.className = 'msg-ok';
        msg.style.display = 'block';
        msg.textContent = window.legalT('legal.deletion.form.success');
        e.target.reset();
      } else {
        throw new Error();
      }
    } catch {
      msg.className = 'msg-err';
      msg.style.display = 'block';
      msg.textContent = window.legalT('legal.deletion.form.error');
    } finally {
      btn.disabled = false;
      btn.textContent = window.legalT('legal.deletion.form.submit');
    }
  };

  document.addEventListener('DOMContentLoaded', applyI18n);
})();
