export function initThemeTogglePersistence() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  const storageKey = 'salud.themeToggleChecked';
  let didWarn = false;

  const warnOnce = (err) => {
    if (didWarn) return;
    const hostname = typeof location !== 'undefined' ? location.hostname : '';
    const isDevHost =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.endsWith('.local') ||
      hostname === '';

    if (isDevHost) {
      console.warn('[theme-toggle] localStorage unavailable; theme preference will not persist.', err);
      didWarn = true;
    }
  };

  try {
    const stored = localStorage.getItem(storageKey);
    if (stored === 'true') toggle.checked = true;
    if (stored === 'false') toggle.checked = false;
  } catch (err) {
    warnOnce(err);
  }

  toggle.addEventListener('change', () => {
    try {
      localStorage.setItem(storageKey, String(toggle.checked));
    } catch (err) {
      warnOnce(err);
    }
  });
}
