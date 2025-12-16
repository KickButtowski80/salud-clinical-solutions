import { initNavIntersectionObserver } from './nav-intersection-observer.js';
import { initStaffCardScrollAnimations } from './staff-card-scroll-animations.js';
import { initScrollToTop } from './scroll-to-top.js';
import { initHeroMapReplay } from './hero-map-replay.js';
import { initStaffCardHeights } from './staff-card-height.js';

document.addEventListener('DOMContentLoaded', () => {
  initNavIntersectionObserver();
  initStaffCardScrollAnimations();
  initScrollToTop();
  initHeroMapReplay();
  initStaffCardHeights();
});