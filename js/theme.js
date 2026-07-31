/* theme.js
   Maneja selección de tema (light/dark) usando html[data-theme] y localStorage
   - key: site-theme
   - expone Theme.init() y Theme.toggle()
*/
(function (global) {
  const STORAGE_KEY = 'site-theme';
  const VALID = new Set(['light', 'dark']);

  function getSaved() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function save(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      // ignore
    }
  }

  function prefersDark() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function apply(theme) {
    const html = document.documentElement;
    if (!VALID.has(theme)) return;
    html.setAttribute('data-theme', theme);

    // Update toggle button accessible state
    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.setAttribute('aria-pressed', String(theme === 'dark'));
      btn.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
  }

  function toggle() {
    const current = document.documentElement.getAttribute('data-theme') || (prefersDark() ? 'dark' : 'light');
    const next = current === 'dark' ? 'light' : 'dark';
    apply(next);
    save(next);
    return next;
  }

  function init() {
    const saved = getSaved();
    const initial = saved || (prefersDark() ? 'dark' : 'light');
    apply(initial);

    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.addEventListener('click', (e) => {
        const newTheme = toggle();
        // update title visually (language module may override titles later)
        btn.setAttribute('aria-pressed', String(newTheme === 'dark'));
      });
    }

    // respond to system changes if user hasn't explicitly saved a theme
    try {
      if (!getSaved() && window.matchMedia) {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        mq.addEventListener && mq.addEventListener('change', (e) => {
          const computed = e.matches ? 'dark' : 'light';
          apply(computed);
        });
      }
    } catch (e) {
      // ignore
    }
  }

  global.Theme = { init, toggle };
})(window);
