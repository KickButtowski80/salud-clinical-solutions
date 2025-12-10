import { initNavIntersectionObserver } from './nav-intersection-observer.js';
import { initStaffCardScrollAnimations } from './staff-card-scroll-animations.js';

document.addEventListener('DOMContentLoaded', () => {
  initNavIntersectionObserver();
  initStaffCardScrollAnimations();
});