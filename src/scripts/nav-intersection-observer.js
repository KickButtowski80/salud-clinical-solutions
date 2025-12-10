// DEBUG: Visual overlay for IntersectionObserver root margin
function createDebugOverlay() {
  // Root margin is: -33% 0px -33% 0px (top, right, bottom, left)
  // This means the "active zone" is roughly the middle third of the viewport
  const overlay = document.createElement('div');
  overlay.id = 'io-debug-overlay';
  overlay.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 33vh;
      background: rgba(255, 0, 0, 0.15);
      pointer-events: none;
      z-index: 9999;
      border-bottom: 2px dashed red;
    ">
      <span style="position: absolute; bottom: 4px; left: 8px; color: red; font-size: 12px; font-weight: bold;">
        ↑ IGNORED (top 33%)
      </span>
    </div>
    <div style="
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 33vh;
      background: rgba(255, 0, 0, 0.15);
      pointer-events: none;
      z-index: 9999;
      border-top: 2px dashed red;
    ">
      <span style="position: absolute; top: 4px; left: 8px; color: red; font-size: 12px; font-weight: bold;">
        ↓ IGNORED (bottom 33%)
      </span>
    </div>
    <div style="
      position: fixed;
      top: 33vh;
      bottom: 33vh;
      left: 0;
      right: 0;
      background: rgba(0, 255, 0, 0.1);
      pointer-events: none;
      z-index: 9998;
      border: 2px solid green;
    ">
      <span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: green; font-size: 14px; font-weight: bold;">
        ACTIVE ZONE (middle ~34% of viewport)
      </span>
    </div>
  `;
  document.body.appendChild(overlay);
  console.log('[IO Debug] Overlay created. Active zone is roughly the middle third of the viewport (rootMargin -33% 0px -33% 0px).');
}

export function initNavIntersectionObserver() {
  // DEBUG: call this manually in the console if you want to see the zones:
  //   window.__showNavIoDebug && window.__showNavIoDebug();
  // To keep bundle clean, we expose a helper instead of auto-running it.
  // eslint-disable-next-line no-underscore-dangle
  window.__showNavIoDebug = createDebugOverlay;

  const sectionIds = ['home', 'services', 'about-us', 'contact'];

  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter((el) => el !== null);

  if (sections.length === 0) {
    return;
  }

  const desktopLinks = Array.from(
    document.querySelectorAll('.nav-menu .nav-link')
  );
  const mobileLinks = Array.from(
    document.querySelectorAll('.mobile-nav__link')
  );

  if (desktopLinks.length === 0 && mobileLinks.length === 0) {
    return;
  }

  const idFromHref = (href) => {
    if (!href) return null;
    try {
      const hashIndex = href.indexOf('#');
      if (hashIndex === -1) return null;
      return href.slice(hashIndex + 1);
    } catch {
      return null;
    }
  };

  const desktopById = new Map();
  const mobileById = new Map();

  desktopLinks.forEach((link) => {
    const id = idFromHref(link.getAttribute('href'));
    if (id && sectionIds.includes(id)) {
      desktopById.set(id, link);
    }
  });

  mobileLinks.forEach((link) => {
    const id = idFromHref(link.getAttribute('href'));
    if (id && sectionIds.includes(id)) {
      mobileById.set(id, link);
    }
  });

  let currentSectionId = null;

  const updateNavForSection = (sectionId) => {
    if (!sectionId || sectionId === currentSectionId) return;
    currentSectionId = sectionId;

    // Desktop: nav-link--active
    desktopById.forEach((link, id) => {
      if (id === sectionId) {
        link.classList.add('nav-link--active');
      } else {
        link.classList.remove('nav-link--active');
      }
    });

    // Move the active badge/logo image under the currently active <li>
    const activeBadge = document.querySelector('.nav-link-icon');
    if (activeBadge) {
      const activeDesktopLink = desktopById.get(sectionId);
      if (activeDesktopLink && activeDesktopLink.parentElement) {
        const targetLi = activeDesktopLink.parentElement;
        if (activeBadge.parentElement !== targetLi) {
          targetLi.appendChild(activeBadge);
        }
      }
    }

    // Mobile: aria-current="page"
    mobileById.forEach((link, id) => {
      if (id === sectionId) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  // Click handling: update active state immediately on nav clicks
  const handleNavClick = (event) => {
    const link = event.currentTarget;
    const id = idFromHref(link.getAttribute('href'));
    if (!id || !sectionIds.includes(id)) return;

    // Let the browser handle the actual anchor scrolling,
    // but update nav state right away.
    updateNavForSection(id);
  };

  [...desktopById.values(), ...mobileById.values()].forEach((link) => {
    link.addEventListener('click', handleNavClick);
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the entry that is most visible / closest to center
        let bestEntry = null;

        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          if (!bestEntry || entry.intersectionRatio > bestEntry.intersectionRatio) {
            bestEntry = entry;
          }
        });

        if (!bestEntry) return;

        const id = bestEntry.target.id;
        if (id && sectionIds.includes(id)) {
          updateNavForSection(id);
        }
      },
      {
        // Treat a section as "current" when it's roughly in the middle third
        // of the viewport. This is less aggressive than the previous
        // configuration and makes it easier for shorter sections to register.
        root: null,
        rootMargin: '-33% 0px -33% 0px',
        threshold: [0.1, 0.25, 0.5, 0.75],
      }
    );

    sections.forEach((section) => observer.observe(section));
  } else {
    // Fallback: on load, pick the first section in view or default to #home
    const fallbackId = sectionIds.find((id) => document.getElementById(id)) || 'home';
    updateNavForSection(fallbackId);
  }
}
