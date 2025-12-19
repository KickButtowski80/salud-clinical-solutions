import { initNavIntersectionObserver } from './nav-intersection-observer.js';
import { initStaffCardScrollAnimations } from './staff-card-scroll-animations.js';
import { initScrollToTop } from './scroll-to-top.js';
import { initHeroMapReplay } from './hero-map-replay.js';
import { initStaffCardHeights } from './staff-card-height.js';
import { initThemeTogglePersistence } from './theme-toggle-persistence.js';
import { initRoleChips } from './role-chips.js';
import { initApplyFormStepper } from './apply-form-stepper.js';

document.addEventListener('DOMContentLoaded', () => {
  initNavIntersectionObserver();
  initStaffCardScrollAnimations();
  initScrollToTop();
  initHeroMapReplay();
  initStaffCardHeights();
  initThemeTogglePersistence();
  initRoleChips();
  initApplyFormStepper();
});