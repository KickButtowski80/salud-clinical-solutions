/**
 * Measures each staff card's back-face content and sets a CSS variable
 * so the 3D flip card can expand to fit content without hardcoded heights.
 */
export function initStaffCardHeights() {
  const cards = document.querySelectorAll('.staff-card');

  if (cards.length === 0) return;

  const EXTRA_BOTTOM_PX = 12;
  const EXTRA_FRONT_PX = 8;

  function initCloseButtons() {
    document.querySelectorAll('.staff-card__close').forEach((btn) => {
      if (!(btn instanceof HTMLButtonElement)) return;

      btn.addEventListener('click', (e) => {
        // Prevent the surrounding label click from re-toggling the checkbox.
        e.preventDefault();
        e.stopPropagation();

        const card = btn.closest('.staff-card');
        const toggle = card?.querySelector('.staff-card__toggle');
        if (toggle instanceof HTMLInputElement) {
          toggle.checked = false;
          toggle.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    });
  }

  function measureCard(card) {
    const backContent = card.querySelector('.staff-card__back-content');
    const frontFace = card.querySelector('.staff-card__face--front');
    const backFace = card.querySelector('.staff-card__face--back');

    if (frontFace) {
      const originalFacePosition = frontFace.style.position;
      const originalFaceVisibility = frontFace.style.visibility;
      const originalFaceTransform = frontFace.style.transform;

      frontFace.style.position = 'static';
      frontFace.style.visibility = 'hidden';
      frontFace.style.transform = 'none';

      const frontHeight = frontFace.offsetHeight + EXTRA_FRONT_PX;

      frontFace.style.position = originalFacePosition;
      frontFace.style.visibility = originalFaceVisibility;
      frontFace.style.transform = originalFaceTransform;

      card.style.setProperty('--staff-card-front-height', `${frontHeight}px`);
    }

    if (!backContent || !backFace) return;

    // Temporarily make backContent measurable (position: static, visibility: hidden)
    // Store original styles
    const originalFacePosition = backFace.style.position;
    const originalFaceVisibility = backFace.style.visibility;
    const originalFaceTransform = backFace.style.transform;

    // Make it measurable without showing it
    backFace.style.position = 'static';
    backFace.style.visibility = 'hidden';
    backFace.style.transform = 'none';

    // Measure
    const height = backContent.offsetHeight + EXTRA_BOTTOM_PX;

    // Restore
    backFace.style.position = originalFacePosition;
    backFace.style.visibility = originalFaceVisibility;
    backFace.style.transform = originalFaceTransform;

    // Set CSS variable on the card
    card.style.setProperty('--staff-card-back-height', `${height}px`);
  }

  function measureAndSet() {
    cards.forEach((card) => measureCard(card));
  }

  // Run on load
  measureAndSet();
  initCloseButtons();

  // Re-measure when content/layout changes (more precise than window resize)
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver((entries) => {
      const uniqueCards = new Set();

      entries.forEach((entry) => {
        const el = entry.target;
        const card = el.closest('.staff-card');
        if (card) uniqueCards.add(card);
      });

      uniqueCards.forEach((card) => measureCard(card));
    });

    cards.forEach((card) => {
      const backContent = card.querySelector('.staff-card__back-content');
      if (backContent) ro.observe(backContent);

      const frontFace = card.querySelector('.staff-card__face--front');
      if (frontFace) ro.observe(frontFace);
    });
  } else {
    // Fallback for older browsers
    window.addEventListener('resize', measureAndSet);
  }
}
