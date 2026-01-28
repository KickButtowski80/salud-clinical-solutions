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

function initContentReveal() {
  // Always start with content hidden
  document.body.style.display = 'none';
  
  // Initialize localStorage to false if not set
  if (localStorage.getItem('contentRevealed') === null) {
    localStorage.setItem('contentRevealed', 'false');
  }

  function revealContent() {
    // Toggle the localStorage value
    const currentState = localStorage.getItem('contentRevealed') === 'true';
    const newState = !currentState;
    
    localStorage.setItem('contentRevealed', newState.toString());
    
    if (newState) {
      document.body.style.display = 'block';
    } else {
      document.body.style.display = 'none';
    }
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