/*
  ELI5: How this theme toggle works
 
  - CSS is the only thing that actually changes colors.
  - This JS file does NOT turn dark mode on/off. It only:
    1) sets the checkbox state on page load
    2) remembers the checkbox state in localStorage
 
  localStorage key:
  - 'salud.themeToggleChecked' stores 'true' or 'false'.
 */

export function initThemeTogglePersistence() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  const storageKey = 'salud.themeToggleChecked';
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

  // Init
  try {
    const stored = localStorage.getItem(storageKey);
    toggle.checked = stored === 'true';
  } catch (err) {
    toggle.checked = false;
    warnOnce(err);
  }

  // Persist
  toggle.addEventListener('change', () => {
    try {
      localStorage.setItem(storageKey, String(toggle.checked));
    } catch (err) {
      warnOnce(err);
    }
  });
}