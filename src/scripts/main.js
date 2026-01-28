import { initNavIntersectionObserver } from './nav-intersection-observer.js';
import { initStaffCardScrollAnimations } from './staff-card-scroll-animations.js';
import { initScrollToTop } from './scroll-to-top.js';
import { initHeroMapReplay } from './hero-map-replay.js';
import { initStaffCardHeights } from './staff-card-height.js';
import { initThemeTogglePersistence } from './theme-toggle-persistence.js';
import { initRoleChips } from './role-chips.js';
import { initApplyFormStepper } from './apply-form-stepper.js';

// ==================== CONTENT REVEAL SYSTEM ====================
// Customer requested content hiding until site meets standards
// Mobile: Touch screen 5 times
// Desktop: Ctrl + Alt + . (period) key combination

function setContentVisibility(isRevealed) {
  localStorage.setItem('contentRevealed', isRevealed.toString());
  document.body.style.display = isRevealed ? 'block' : 'none';
}

function initContentReveal() {
  // Check if this is a page refresh (not first load)
  const navigationEntries = performance.getEntriesByType('navigation');
  const isRefresh = navigationEntries.length > 0 && navigationEntries[0].type === 'reload';
  
  // Reset to false on page refresh
  if (isRefresh) {
    localStorage.setItem('contentRevealed', 'false');
  }

  // Initialize localStorage to false if not set (first visit)
  if (localStorage.getItem('contentRevealed') === null) {
    localStorage.setItem('contentRevealed', 'false');
  }

  // Set initial visibility based on localStorage
  const isRevealed = localStorage.getItem('contentRevealed') === 'true';
  setContentVisibility(isRevealed);

  function revealContent() {
    // Toggle the current state
    const currentState = localStorage.getItem('contentRevealed') === 'true';
    setContentVisibility(!currentState);
  }

  // Mobile: Touch screen 5 times to toggle content
  let touchCount = 0;
  let touchTimeout;

  document.addEventListener('touchstart', (e) => {
    touchCount++;
    
    clearTimeout(touchTimeout);
    touchTimeout = setTimeout(() => {
      touchCount = 0;
    }, 2000); // Reset after 2 seconds of no touches
    
    if (touchCount === 5) {
      revealContent();
      touchCount = 0;
      clearTimeout(touchTimeout);
    }
  });

  // Desktop: Ctrl + Alt + . (period) key combination
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.altKey && e.key === '.') {
      console.log('Content revealed');
      e.preventDefault();
      revealContent();
    }
  });
}

// ==================== MAIN INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', () => {
  initContentReveal(); // Initialize content reveal system first
  initNavIntersectionObserver();
  initStaffCardScrollAnimations();
  initScrollToTop();
  initHeroMapReplay();
  initStaffCardHeights();
  initThemeTogglePersistence();
  initRoleChips();
  initApplyFormStepper();
});