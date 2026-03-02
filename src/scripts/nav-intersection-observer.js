// ==========================================================================
// Navigation Intersection Observer
//
// Purpose: Automatically highlight the active navigation item based on scroll position.
// Prevents "nav dancing" during smooth scrolling by using a simple boolean flag.
//
// Key Concepts:
// - IntersectionObserver API: Detects when sections enter the viewport
// - rootMargin: Creates an "active zone" in the middle of the viewport
// - Boolean flag gating: Prevents conflicts during user-initiated navigation
// - CSS scroll-behavior: Handles smooth scrolling animations
//
// Architecture:
// 1. Observer watches sections for intersection events
// 2. Updates nav state when sections enter the "active zone"
// 3. User clicks set a flag to temporarily ignore observer events
// 4. Flag resets after 800ms (covers all transition durations)
//
// Why This Approach Works:
// - Simple and reliable (no complex Promise.race() with animation events)
// - No memory leaks (no event listener management)
// - Browser-agnostic (works across all modern browsers)
// - Easy to debug and maintain
//
// ==========================================================================

// DEBUG: Visual overlay for IntersectionObserver root margin
//
// This helper draws colored bands over the viewport to visualize exactly
// where the IntersectionObserver "active zone" is based on the current
// `rootMargin` configuration.
//
// Current Configuration:
// - rootMargin: '-30% 0px -30% 0px' (top, right, bottom, left)
// - Active zone: Middle ~40% of viewport
// - Ignored zones: Top 30% and bottom 30%
//
// Usage (dev only):
//   window.__showNavIoDebug && window.__showNavIoDebug();
//
// Visual Guide:
// - Red bands = Ignored areas (top/bottom 30%)
// - Green band = Active zone where sections become "current"
function createDebugOverlay() {
  // NOTE: Keep these percentages in sync with the observer options below!
  const topIgnored = 30; // Must match rootMargin top value
  const bottomIgnored = 30; // Must match rootMargin bottom value
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
        ↑ IGNORED (top 30%)
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
        ↓ IGNORED (bottom 30%)
      </span>
    </div>
    <div style="
      position: fixed;
      top: 30vh;
      bottom: 30vh;
      left: 0;
      right: 0;
      background: rgba(0, 255, 0, 0.1);
      pointer-events: none;
      z-index: 9998;
      border: 2px solid green;
    ">
      <span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: green; font-size: var(--font-size-sm); font-weight: bold;">
        ACTIVE ZONE (middle ~40% of viewport)
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

  // Sections to observe for navigation updates
  const sectionIds = ['home', 'services', 'about-us', 'apply', 'contact'];

  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter((el) => el !== null);

  if (sections.length === 0) {
    return;
  }

  // Navigation link collections for desktop and mobile
  const desktopLinks = Array.from(
    document.querySelectorAll('.nav-menu .nav-link')
  );
  const mobileLinks = Array.from(
    document.querySelectorAll('.mobile-nav__link')
  );

  if (desktopLinks.length === 0 && mobileLinks.length === 0) {
    return;
  }

  // Utility: Extract section ID from href attribute
  // Example: href="#home" → "home"
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

  // Navigation state management
  let currentSectionId = null;

  // Core function: Update navigation active states
  // Updates both desktop (CSS classes) and mobile (ARIA attributes)
  const updateNavForSection = (sectionId) => {
    if (!sectionId || sectionId === currentSectionId) return;

    // Debug logging (remove in production)
    console.log(`🧭 Nav update: ${currentSectionId} → ${sectionId}`);
    currentSectionId = sectionId;

    // Desktop navigation: Use CSS classes
    desktopById.forEach((link, id) => {
      if (id === sectionId) {
        link.classList.add('nav-link--active');
      } else {
        link.classList.remove('nav-link--active');
      }
    });

    // Mobile navigation: Use ARIA attributes
    mobileById.forEach((link, id) => {
      if (id === sectionId) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };
  // Anti-dancing mechanism: Simple boolean flag approach
  // 
  // PROBLEM: During smooth scrolling, IntersectionObserver fires rapidly as sections
  // enter/exit the viewport. Without protection, the nav highlights "dance" between
  // old and new sections during the scroll animation, creating a jarring user experience.
  //
  // SOLUTION: Use a simple boolean flag to temporarily ignore IntersectionObserver
  // events during user-initiated navigation. This is more reliable than complex
  // Promise.race() with animation events, which have browser compatibility issues.
  let userClickedNavItem = false;

  // Handle navigation clicks with anti-dancing protection
  const handleNavClick = (event) => {
    const link = event.currentTarget;
    const id = idFromHref(link.getAttribute('href'));
    if (!id || !sectionIds.includes(id)) return;

    // Set flag to temporarily ignore IntersectionObserver events
    // This prevents the nav highlights from dancing during smooth scroll effects
    userClickedNavItem = true;

    // Reset flag after 800ms - carefully chosen timing:
    // - Smooth scroll animation: ~500-600ms (depends on scroll distance)
    // - CSS transitions: 200ms (nav-link transitions)
    // - Total with buffer: 800ms ensures observer stays quiet until scroll completes
    setTimeout(() => {
      userClickedNavItem = false;
    }, 800);

    // Update navigation state immediately for instant visual feedback
    // User sees the correct highlight right away, then scroll animates smoothly
    updateNavForSection(id);
  };

  [...desktopById.values(), ...mobileById.values()].forEach((link) => {
    link.addEventListener('click', handleNavClick);
  });

  // Choose thresholds based on viewport height to better support small mobiles
  const getThresholdsForViewport = () => {
    const h = window.innerHeight || document.documentElement.clientHeight || 0;
    // Very small heights (e.g., landscape phones)
    if (h <= 400) return [0.05, 0.15, 0.25];
    // Small mobiles (e.g., iPhone SE portrait and similar)
    if (h <= 667) return [0.1, 0.3, 0.5, 0.7, 0.9];
    // Default for larger mobile/tablet/desktop
    return [0.2, 0.4, 0.6, 0.8];
  };

  // IntersectionObserver configuration
  // Creates an "active zone" in the middle 40% of the viewport
  // Ignores top 30% and bottom 30% to prevent rapid switching
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        // Skip updates during user-initiated navigation (anti-dancing)
        if (userClickedNavItem) return;

        entries.forEach(entry => {
          if (entry.isIntersecting) {
            updateNavForSection(entry.target.id);
          }
        });
      },
      {
        // Focus on middle portion of viewport for stable navigation
        // Top 30% and bottom 30% are ignored, middle ~40% is the active zone
        rootMargin: '-30% 0px -30% 0px',

        // Multiple thresholds tuned per viewport height for robust detection
        // Helps small mobile viewports correctly detect the top section
        threshold: getThresholdsForViewport(),
      }
    );

    // Start observing all sections
    sections.forEach((section) => observer.observe(section));

  } else {
    // Fallback for very old browsers without IntersectionObserver support
    // Default to the first available section or 'home'
    const fallbackId = sectionIds.find((id) => document.getElementById(id)) || 'home';
    updateNavForSection(fallbackId);
  }
}
