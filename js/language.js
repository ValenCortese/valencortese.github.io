/* language.js
   Responsable de aplicar traducciones definidas en translations.js
   - Lee y escribe localStorage (key: site-language)
   - Aplica traducciones al contenido y a atributos (placeholder, title, alt, aria-label, value)
   - Expone Language.init() para iniciar desde app.js
*/
(function (global) {
  const STORAGE_KEY = 'site-language';
  let current = 'es';

  function getSaved() {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v) return v;
    } catch (e) {
      // ignore
    }
    return null;
  }

  function save(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      // ignore
    }
  }

  function resolveDefault() {
    const saved = getSaved();
    if (saved) return saved;
    const nav = navigator.language || navigator.userLanguage || 'es';
    return nav.startsWith('en') ? 'en' : 'es';
  }

  function applyTranslations(lang) {
    if (!window.translations) return;
    const dict = window.translations[lang] || {};

    const nodes = document.querySelectorAll('[data-i18n]');
    nodes.forEach((el) => {
      const key = el.dataset.i18n;
      const text = dict[key];
      if (text == null || text === '') {
        return;
      }
      const attrList = (el.dataset.i18nAttr || '').split(',').map((s) => s.trim()).filter(Boolean);

      if (attrList.length > 0) {
        attrList.forEach((attr) => {
          switch (attr) {
            case 'value':
              el.value = text;
              break;
            case 'placeholder':
              el.setAttribute('placeholder', text);
              break;
            case 'title':
              el.setAttribute('title', text);
              break;
            case 'alt':
              el.setAttribute('alt', text);
              break;
            case 'aria-label':
              el.setAttribute('aria-label', text);
              break;
            default:
              el.setAttribute(attr, text);
          }
        });
      } else {
        el.textContent = text;
      }
    });

    // Update any aria-label or title that might be controlled by JS (menu button handled in app.js)
  }

  function setLanguage(lang) {
    if (!window.translations || !window.translations[lang]) return;
    current = lang;
    document.documentElement.lang = lang;
    applyTranslations(lang);
    save(lang);
    const select = document.getElementById('lang-select');
    if (select) select.value = lang;
  }

  function init() {
    current = resolveDefault();
    document.documentElement.lang = current;
    const select = document.getElementById('lang-select');
    if (select) {
      select.value = current;
      select.addEventListener('change', (e) => {
        setLanguage(e.target.value);
      });
    }
    // also support language buttons in the future
    applyTranslations(current);
    return current;
  }

  global.Language = {
    init,
    set: setLanguage,
    get current() { return current; }
  };
})(window);
