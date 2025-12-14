export const initHeroMapReplay = () => {
  const replayButton = document.querySelector('[data-hero-map-replay]');
  if (!replayButton) return;

  const TRAVEL_START_MS = 1000;
  const TRAVEL_DURATION_MS = 18000;
  const FINAL_STATE_DELAY_MS = TRAVEL_START_MS + TRAVEL_DURATION_MS;

  const armFinalState = (container) => {
    if (!container) return;

    if (container.dataset.finalStateTimeoutId) {
      window.clearTimeout(Number(container.dataset.finalStateTimeoutId));
    }

    container.classList.remove('is-final');

    const timeoutId = window.setTimeout(() => {
      container.classList.add('is-final');
    }, FINAL_STATE_DELAY_MS);

    container.dataset.finalStateTimeoutId = String(timeoutId);
  };

  /**
   * Replay strategy (why clone/replace?):
   * - The map uses SVG SMIL animations (<animate>, <animateMotion>).
   * - SMIL timelines start when the SVG element is inserted into the DOM.
   * - There is no reliable cross-browser “reset” API for SMIL + CSS animations.
   * - Cloning + replacing the <svg> re-inserts a fresh copy, restarting all timelines.
   */
  replayButton.addEventListener('click', () => {
    const container = replayButton.closest('.hero-visual');
    if (!container) return;

    const svg = container.querySelector('svg.ca-map');
    if (!svg) return;

    const clone = svg.cloneNode(true);
    svg.replaceWith(clone);

    armFinalState(container);
  });

  armFinalState(replayButton.closest('.hero-visual'));
};
