/**
 * Staff Card Height + Accessibility Helpers
 *
 * What this file does
 * - Measures the content heights of each staff card's front and back faces.
 * - Writes those measurements to CSS custom properties on the card element.
 * - Adds a close button behavior that closes the card without accidentally
 *   re-toggling via the surrounding <label>.
 * - Improves keyboard navigation by removing the back-face close button from
 *   the tab order when the card is closed.
 *
 * Why we need JS for heights
 * - The card uses a 3D flip and the faces are absolutely positioned.
 * - With absolutely positioned faces, pure CSS cannot naturally size the outer
 *   card to the content on the back face.
 * - So we measure real DOM heights and feed them into CSS via variables.
 *
 * Expected markup (per card)
 * - .staff-card (wrapper)
 * - .staff-card__toggle (a checkbox)
 * - .staff-card__inner (a <label> that toggles the checkbox)
 * - .staff-card__face--front (front face)
 * - .staff-card__face--back (back face)
 * - .staff-card__back-content (content wrapper inside back face)
 * - .staff-card__close (button inside back face)
 *
 * CSS variables written by this script (on .staff-card)
 * - --staff-card-front-height: used as the collapsed min-height (front face).
 * - --staff-card-back-height: used as the expanded min-height (back face).
 */
export function initStaffCardHeights() {
  const cards = document.querySelectorAll('.staff-card');

  if (cards.length === 0) return;

  /**
   * Small padding allowances added to measured heights so that the content
   * doesn't feel cramped and we avoid 1px clipping due to rounding.
   */
  const EXTRA_BOTTOM_PX = 12;
  const EXTRA_FRONT_PX = 8;

  /**
   * Ensure the close button is only reachable by Tab when it is actually usable.
   *
   * Problem:
   * - The close button is inside the (hidden) back face.
   * - Even when the card is closed, that button still exists in the DOM and is
   *   focusable, so keyboard users would hit TWO tab stops per card.
   *
   * Solution:
   * - When the checkbox is unchecked: close button gets tabIndex = -1.
   * - When the checkbox is checked: close button gets tabIndex = 0.
   */
  function syncCloseTabIndex(card) {
    const toggle = card.querySelector('.staff-card__toggle');
    const closeBtn = card.querySelector('.staff-card__close');

    if (!(toggle instanceof HTMLInputElement)) return;
    if (!(closeBtn instanceof HTMLButtonElement)) return;

    closeBtn.tabIndex = toggle.checked ? 0 : -1;
  }

  /**
   * Initialize the close button tabIndex sync for all cards.
   *
   * - Runs once on load to set the correct initial tabIndex.
   * - Attaches a change listener to keep it updated as cards open/close.
   */
  function initCloseTabIndex() {
    cards.forEach((card) => {
      const toggle = card.querySelector('.staff-card__toggle');
      if (!(toggle instanceof HTMLInputElement)) return;

      syncCloseTabIndex(card);
      toggle.addEventListener('change', () => syncCloseTabIndex(card));
    });
  }

  /**
   * Close button behavior.
   *
   * Why this needs JS:
   * - The entire card is a <label> that toggles the checkbox.
   * - A click on the close button would normally bubble to the label and
   *   re-toggle the checkbox, causing inconsistent behavior.
   *
   * Accessibility reasons:
   * - The close affordance should be a real <button>, not a decorative span,
   *   so keyboard and screen reader users can discover and activate a clear
   *   "Close details" control.
   * - Without this behavior, the only way to close is an implicit pattern
   *   ("toggle the card again"), which is harder to discover when focus is
   *   deep inside the back-face content.
   * - Preventing the label toggle makes the close button's intent predictable:
   *   it closes (unchecked) rather than behaving like a generic toggle.
   *
   * What we do:
   * - preventDefault + stopPropagation so the label does not toggle.
   * - explicitly uncheck the checkbox.
   * - dispatch a 'change' event so any listeners update.
   */
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

  /**
   * Measure a single card and update its CSS variables.
   *
   * Key trick:
   * - The faces are absolutely positioned and transformed.
   * - For reliable measurements we temporarily set:
   *   - position: static
   *   - visibility: hidden
   *   - transform: none
   *   Then we read offsetHeight, and finally restore the original styles.
   *
   * This keeps layout stable (no visible jump), but lets us get the true
   * content height.
   */
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

  /**
   * Convenience wrapper to measure all cards.
   */
  function measureAndSet() {
    cards.forEach((card) => measureCard(card));
  }

  // Run on load
  measureAndSet();
  initCloseButtons();
  initCloseTabIndex();

  // Re-measure when content/layout changes (more precise than window resize)
  if ('ResizeObserver' in window) {
    /**
     * ResizeObserver lets us re-measure when the content actually changes size
     * (e.g., responsive wrapping, font loading, image load, etc.).
     */
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
