// DEBUG: Visual overlay for IntersectionObserver root margin
//
// This helper draws three fixed bands over the viewport so you can see
// exactly where the IntersectionObserver "active" area is, based on the
// current `rootMargin` configuration used below.
//
// With `rootMargin: '-33% 0px -33% 0px'` the browser shrinks the effective
// root rectangle by 33% from the top and 33% from the bottom. That leaves
// roughly the middle third of the viewport as the zone where intersections
// count toward `entry.isIntersecting` and `intersectionRatio`.
//
// The overlay is **for local visual debugging only** and is never created
// automatically in production. Instead, we expose a helper on `window`
// (see `initNavIntersectionObserver`) so you can opt in from DevTools:
//   `window.__showNavIoDebug && window.__showNavIoDebug();`
//
// Red bands = ignored areas (top / bottom).  
// Green band = active zone where sections can become "current".
function createDebugOverlay() {
  // Keep this description in sync with the observer options below.
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
      <span style="position: absolute; bottom: 4px; left: 8px; color: red; font-size: var(--font-size-xs); font-weight: bold;">
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
      <span style="position: absolute; top: 4px; left: 8px; color: red; font-size: var(--font-size-xs); font-weight: bold;">
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
      <span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: green; font-size: var(--font-size-sm); font-weight: bold;">
        ACTIVE ZONE (middle ~34% of viewport)
      </span>
    </div>
  `;
  document.body.appendChild(overlay);
}

export function initNavIntersectionObserver() {
  // DEBUG hook: from the browser console you can call
  //   window.__showNavIoDebug && window.__showNavIoDebug();
  // to draw the red/green overlay that visualizes the current
  // IntersectionObserver root margin (see `createDebugOverlay`).
  // Only expose in development environments to keep production clean.
  // eslint-disable-next-line no-underscore-dangle
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.__showNavIoDebug = createDebugOverlay;
  }

  const sectionIds = ['home', 'services', 'about-us', 'apply', 'contact'];

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
  let isIntersectionObserverPaused = false;
  let pauseAnimationFrameId = 0;

  const waitForAnimationEnd = (element) => {
    // Promise 1: Animation end (fast path)
    const animationPromise = new Promise(resolve => {
      const handleAnimationEnd = () => {
        resolve('animation');
      };
      element.addEventListener('animationend', handleAnimationEnd, { once: true });
    });
    
    // Promise 2: Timeout fallback (safety net)
    const timeoutPromise = new Promise(resolve => {
      setTimeout(resolve, 2000);
    });
    
    // Promise.race() returns the first promise to settle
    // This is exactly the use case shown in MDN examples for request timeouts
    return Promise.race([animationPromise, timeoutPromise]);
  };

  const pauseIntersectionObserver = async (element) => {
    isIntersectionObserverPaused = true;
    // Cancel any previous pause timer to handle rapid clicks
    cancelAnimationFrame(pauseAnimationFrameId);
    
    // Wait for the actual animation on the element to finish
    if (element) {
      await waitForAnimationEnd(element);
    }
    
    isIntersectionObserverPaused = false;  // Resume IntersectionObserver
  };

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

    // Pause IntersectionObserver to prevent animation conflicts during navigation
    // Pass the link element so we can detect when its animation finishes
    pauseIntersectionObserver(link);

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
        // Only update if IntersectionObserver is not paused
        if (isIntersectionObserverPaused) return;

        entries.forEach(entry => {
          if (entry.isIntersecting) {
            updateNavForSection(entry.target.id);
          }
        });
      },
      {
        // Focus on the middle portion of viewport for stable navigation
        // Top 33% and bottom 33% are ignored, middle ~34% is the active zone
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
