export function initStaffCardScrollAnimations() {
  const cards = Array.from(document.querySelectorAll('.staff-card'));

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

        if (entry.isIntersecting) {
          const index = Number(card.dataset.scrollIndex || '0');

          // Slower stagger so cards feel more deliberate
          const delay = Math.min(index * 220, 880); // cap at ~0.9s extra

          window.setTimeout(() => {
            card.classList.add('staff-card--visible');
          }, delay);
        } else {
          // When card leaves the viewport, reset so it can animate again next time
          card.classList.remove('staff-card--visible');
        }
      });
    },
    {
      root: null,
      threshold: 0.2,
    }
  );

  cards.forEach((card) => observer.observe(card));
}
