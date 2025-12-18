function getSystemPrefersDark() {
  return !!(
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
}


export function initThemeTogglePersistence() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  const storageKey = 'salud-theme';
  let didWarn = false;

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

  const getSystemTheme = () => (getSystemPrefersDark() ? 'dark' : 'light');
  const invertTheme = (theme) => (theme === 'dark' ? 'light' : 'dark');

  const setCheckboxForTheme = (theme) => {
    const systemTheme = getSystemTheme();
    toggle.checked = theme !== systemTheme;
  };

  const getThemeFromCheckbox = () => {
    const systemTheme = getSystemTheme();
    return toggle.checked ? invertTheme(systemTheme) : systemTheme;
  };

  // Init: if no saved preference, keep unchecked => follow system
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored === 'light' || stored === 'dark') {
      setCheckboxForTheme(stored);
    } else {
      toggle.checked = false;
    }
  } catch (err) {
    toggle.checked = false;
    warnOnce(err);
  }

  // Persist: store explicit theme when user overrides system; clear when back to system
  toggle.addEventListener('change', () => {
    try {
      const systemTheme = getSystemTheme();
      const chosenTheme = getThemeFromCheckbox();

      if (chosenTheme === systemTheme) {
        localStorage.removeItem(storageKey);
      } else {
        localStorage.setItem(storageKey, chosenTheme);
      }
    } catch (err) {
      warnOnce(err);
    }
  });
}