/*
  ELI5: How this theme toggle works
 
  - CSS is the only thing that actually changes colors.
  - This JS file does NOT turn dark mode on/off. It only:
    1) sets the checkbox state on page load
    2) remembers the checkbox state in localStorage
 
  localStorage key:
  - 'salud-theme' stores 'dark' or 'light'.
 */

export function initThemeTogglePersistence() {

  const themeToggleWrapper = document.getElementById('theme-toggle');
  const themeToggleLabel = themeToggleWrapper?.querySelector('label');
  const themeToggleCheckbox = themeToggleWrapper?.querySelector('input[type="checkbox"]');

  if (!themeToggleWrapper || !themeToggleLabel || !themeToggleCheckbox) return;

  const root = document.documentElement;


  const userThemePreference = !!(
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  const storageKey = 'salud-theme';
  let didWarn = false;

  const syncAria = (isDark) => {
    const ariaLabel = isDark ? 'Theme: dark' : 'Theme: light';
    themeToggleLabel.setAttribute('aria-pressed', String(isDark));
    themeToggleLabel.setAttribute('aria-label', ariaLabel);
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

  try {
    const stored = localStorage.getItem(storageKey);

    if (stored === 'dark') {
      themeToggleCheckbox.checked = true;
    } else if (stored === 'light') {
      themeToggleCheckbox.checked = false;
    } else {
      themeToggleCheckbox.checked = userThemePreference;
    }
  } catch (err) {
    themeToggleCheckbox.checked = false;
    warnOnce(err);
  }

  root.setAttribute('data-theme', themeToggleCheckbox.checked ? 'dark' : 'light');
  syncAria(themeToggleCheckbox.checked);

  // Persist
  themeToggleCheckbox.addEventListener('change', () => {
    try {
      localStorage.setItem(storageKey, themeToggleCheckbox.checked ? 'dark' : 'light');
    } catch (err) {
      warnOnce(err);
    }

    root.setAttribute('data-theme', themeToggleCheckbox.checked ? 'dark' : 'light');
    syncAria(themeToggleCheckbox.checked);
  });
}