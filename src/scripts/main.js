import { initNavIntersectionObserver } from './nav-intersection-observer.js';
import { initStaffCardScrollAnimations } from './staff-card-scroll-animations.js';
import { initScrollToTop } from './scroll-to-top.js';

document.addEventListener('DOMContentLoaded', () => {
  initNavIntersectionObserver();
  initStaffCardScrollAnimations();
  initScrollToTop();
});