export function initStaffCardScrollAnimations() {
  const cards = Array.from(document.querySelectorAll('.staff-card, .services-grid .card--services'));

  if (cards.length === 0) return;

  // Respect reduced motion preferences
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (!('IntersectionObserver' in window) || prefersReducedMotion) {
    return;
  }

  // Add base animation class so CSS can target them
  cards.forEach((card, index) => {
    card.classList.add('staff-card--scroll');
    card.dataset.scrollIndex = String(index);
  });

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        const card = entry.target;
        const index = Number(card.dataset.scrollIndex || '0');
        // Calculate staggered animation delay for smooth card appearance
        // Formula: index * 220ms = 0ms, 220ms, 440ms, 660ms, 880ms (capped)
        // This creates a deliberate, elegant stagger effect without being too fast or slow
        const delay = Math.min(index * 220, 880);

        if (entry.isIntersecting) {
          window.setTimeout(() => {
            card.classList.add('staff-card--visible');
          }, delay);
        } else {
          // When card leaves the viewport, reset so it can animate again next time
          // Use the same staggered delay for removal
          window.setTimeout(() => {
            card.classList.remove('staff-card--visible');
          }, delay);
        }
      });
    },
    {
      root: null,
      threshold: [0.05, 0.15, 0.3, 0.5],
    }
  );

  cards.forEach((card) => observer.observe(card));
}
