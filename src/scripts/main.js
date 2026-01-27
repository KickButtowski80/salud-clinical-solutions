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
// Mobile: Touch bottom-left corner, then bottom-right corner
// Desktop: Ctrl + > key combination

function initContentReveal() {
  console.log('🔧 initContentReveal function called!');
  
  // Check if content is already revealed
  if (localStorage.getItem('contentRevealed') === 'true') {
    console.log('Content already revealed');
    return;
  }

  // Find the main content area to hide
  const mainContent = document.getElementById('main-content') || document.querySelector('main') || document.body;
  console.log('Hiding content in:', mainContent.tagName || mainContent.id);
  
  // Initially hide content
  mainContent.style.opacity = '0';
  mainContent.style.transition = 'opacity 0.5s ease-in-out';
  console.log('Content hidden with opacity 0');

  function revealContent() {
    console.log('Reveal function called');
    // Toggle the localStorage value
    const currentState = localStorage.getItem('contentRevealed') === 'true';
    const newState = !currentState;
    
    localStorage.setItem('contentRevealed', newState.toString());
    console.log('Toggled state to:', newState);
    
    if (newState) {
      mainContent.style.opacity = '1';
      console.log('Content revealed with opacity 1');
    } else {
      mainContent.style.opacity = '0';
      console.log('Content hidden with opacity 0');
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



  // Desktop: Ctrl + . (period) key combination
  document.addEventListener('keydown', (e) => {
    console.log('Key pressed:', e.key, 'Ctrl:', e.ctrlKey);
    if (e.ctrlKey && e.key === '.') {
      console.log('🎯 Ctrl+. detected!');
      e.preventDefault();
      revealContent();
    }
  });
  
  console.log('✅ Keyboard event listener attached');
}

// ==================== MAIN INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Main initialization starting...');
  initContentReveal(); // Initialize content reveal system first
  console.log('✅ Content reveal initialized');
  initNavIntersectionObserver();
  initStaffCardScrollAnimations();
  initScrollToTop();
  initHeroMapReplay();
  initStaffCardHeights();
  initThemeTogglePersistence();
  initRoleChips();
  initApplyFormStepper();
  console.log('🎉 All systems initialized');
});