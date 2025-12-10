export function initScrollToTop() {
  const button = document.querySelector('[data-scroll-top]');
  if (!button) return;

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  );
  const main = document.getElementById('main-content');

  const showClass = 'scroll-top--visible';

  // Show after user scrolls ~300px (18.75rem based on root font size)
  const rootFontSize = parseFloat(
    getComputedStyle(document.documentElement).fontSize || '16'
  );
  const thresholdPx = 18.75 * rootFontSize;

  const updateVisibility = () => {
    const y = window.scrollY || window.pageYOffset;
    if (y > thresholdPx) {
      button.classList.add(showClass);
    } else {
      button.classList.remove(showClass);
    }
  };

  // Click / keyboard activation
  button.addEventListener('click', (event) => {
    event.preventDefault();

    if (main) {
      if (!main.hasAttribute('tabindex')) {
        main.setAttribute('tabindex', '-1');
      }
      main.focus({ preventScroll: true });
    }

    const reduceMotion = prefersReducedMotion.matches;
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  });

  // Toggle button on scroll
  window.addEventListener('scroll', updateVisibility, { passive: true });
  updateVisibility();
}
