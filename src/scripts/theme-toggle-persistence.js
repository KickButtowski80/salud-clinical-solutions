/*
  ELI5: How this theme toggle works
 
  - CSS is the only thing that actually changes colors.
  - This JS file does NOT turn dark mode on/off. It only:
    1) sets the checkbox state on page load
    2) remembers the checkbox state in localStorage
    3) syncs ARIA on the input
    4) dispatches a custom event: 'salud:theme-change' with { theme }
 
  localStorage key:
  - 'salud-theme' stores 'dark' or 'light'.
 */

export function initThemeTogglePersistence() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;
  let userThemePreference = false;

  const root = document.documentElement;

  const storageKey = 'salud-theme';
  let didWarn = false;

  const syncAria = (isDark) => {
    const themeLabel = isDark ? 'Theme: dark' : 'Theme: light';
    toggle.setAttribute('aria-checked', String(isDark));
    toggle.setAttribute('aria-label', themeLabel);
  };

  const warnOnce = (err) => {
    if (didWarn) return;
    const hostname = window.location?.hostname || '';
    const isDevHost =
      ['localhost', '127.0.0.1', ''].includes(hostname) || hostname.endsWith('.local');

    if (isDevHost) {
      console.warn('[theme-toggle] localStorage unavailable.', err);
      didWarn = true;
    }
  };

  // Init
  try {
    const stored = localStorage.getItem(storageKey);

    if (stored === 'dark') {
      toggle.checked = true;
    } else if (stored === 'light') {
      toggle.checked = false;
    } else {
      userThemePreference =
        !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
      toggle.checked = userThemePreference;
    }
  } catch (err) {
    toggle.checked = false;
    warnOnce(err);
  }

  root.setAttribute('data-theme', toggle.checked ? 'dark' : 'light');
  syncAria(toggle.checked);

  // Persist
  toggle.addEventListener('change', () => {
    const theme = toggle.checked ? 'dark' : 'light';

    try {
      localStorage.setItem(storageKey, theme);
    } catch (err) {
      warnOnce(err);
    }

    root.setAttribute('data-theme', theme);
    syncAria(toggle.checked);

    // Notify other scripts (e.g., nav observer) that the theme just changed.
    // They can listen for this to delay reactions during repaint and avoid jumps.
    window.dispatchEvent(
      new CustomEvent('salud:theme-change', {
        detail: { theme },
      })
    );
  });
}