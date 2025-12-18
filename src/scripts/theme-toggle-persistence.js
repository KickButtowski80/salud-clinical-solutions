function getSystemPrefersDark() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// Helper to actually apply the theme to the HTML element
function applyTheme(isDark) {
  document.documentElement.classList.toggle('dark-mode', isDark);
  // Or: document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
}

export function initThemeTogglePersistence() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  const storageKey = 'salud.themeToggleChecked';
  let didWarn = false;

  const warnOnce = (err) => {
    if (didWarn) return;
    const hostname = window.location?.hostname || '';
    const isDevHost = ['localhost', '127.0.0.1', ''].includes(hostname) || hostname.endsWith('.local');

    if (isDevHost) {
      console.warn('[theme-toggle] localStorage unavailable.', err);
      didWarn = true;
    }
  };

  // 1. Determine Initial State
  let shouldBeDark = getSystemPrefersDark(); // Start with system preference

  try {
    const stored = localStorage.getItem(storageKey);
    if (stored !== null) {
      shouldBeDark = stored === 'true'; // Override with saved user choice
    }
  } catch (err) {
    warnOnce(err);
  }

  // 2. Sync UI and Toggle
  toggle.checked = shouldBeDark;
  applyTheme(shouldBeDark);

  // 3. Listen for changes
  toggle.addEventListener('change', () => {
    const isChecked = toggle.checked;
    applyTheme(isChecked);
    
    try {
      localStorage.setItem(storageKey, String(isChecked));
    } catch (err) {
      warnOnce(err);
    }
  });
}