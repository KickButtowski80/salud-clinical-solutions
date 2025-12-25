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
  const userThemePreference = !!(
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  const root = document.documentElement;

  const storageKey = 'salud-theme';
  let didWarn = false;

  const syncAria = (isDark) => {
    const themeLabel = isDark ? 'Theme: dark' : 'Theme: light';
    toggle.setAttribute('aria-checked', String(isDark));
    toggle.setAttribute('aria-pressed', String(isDark));
    toggle.setAttribute('aria-label', themeLabel);
    const labelEl = document.querySelector('label[for="theme-toggle"].theme-toggle');
    if (labelEl) {
      labelEl.setAttribute('aria-pressed', String(isDark));
      labelEl.setAttribute('aria-label', themeLabel);
    }
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
    const scrollX = window.scrollX || window.pageXOffset || 0;
    const scrollY = window.scrollY || window.pageYOffset || 0;

    // Scroll prevention on theme toggle (commented out per request):
    // Large style recalculations can cause the browser to scroll in order to keep
    // the currently-focused element in view. Keeping focus on the toggle with
    // preventScroll can avoid jumps, but it is disabled for now.
    // try {
    //   toggle.focus({ preventScroll: true });
    // } catch {
    //   // Older browsers may not support preventScroll.
    //   toggle.focus();
    // }

    try {
      localStorage.setItem(storageKey, toggle.checked ? 'dark' : 'light');
    } catch (err) {
      warnOnce(err);
    }

    root.setAttribute('data-theme', toggle.checked ? 'dark' : 'light');
    syncAria(toggle.checked);

    // Theme changes can cause layout recalculation that results in scroll jumps.
    // Restore the user's scroll position after styles have applied.
    // Use two rAF passes to anchor after the next two paint frames.
    requestAnimationFrame(() => {
      window.scrollTo(scrollX, scrollY);
      requestAnimationFrame(() => {
        window.scrollTo(scrollX, scrollY);
      });
    });

    // Notify other scripts (e.g., nav observer) that the theme just changed.
    // They can listen for this to delay reactions during repaint and avoid jumps.
    window.dispatchEvent(
      new CustomEvent('salud:theme-change', {
        detail: { theme: toggle.checked ? 'dark' : 'light' },
      })
    );
  });
}