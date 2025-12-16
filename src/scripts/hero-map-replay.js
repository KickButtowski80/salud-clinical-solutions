/**
 * Hero Map Replay
 *
 * Replay strategy (why clone/replace?):
 * - The map uses SVG SMIL animations (<animate>, <animateMotion>).
 * - SMIL timelines start when the SVG element is inserted into the DOM.
 * - There is no reliable cross-browser "reset" API for SMIL + CSS animations.
 * - Cloning + replacing the <svg> re-inserts a fresh copy, restarting all timelines.
 * - CSS animations on the map (including the hover-disable timing) also restart.
 */
export const initHeroMapReplay = () => {
  const replayButton = document.querySelector('[data-hero-map-replay]');
  if (!replayButton) return;

  replayButton.addEventListener('click', () => {
    const container = replayButton.closest('.hero-visual');
    if (!container) return;

    const svg = container.querySelector('svg.ca-map');
    if (!svg) return;

    const finalLogo = container.querySelector('.hero-final-logo');

    const clone = svg.cloneNode(true);
    svg.replaceWith(clone);

    if (finalLogo) {
      const finalLogoClone = finalLogo.cloneNode(true);
      finalLogo.replaceWith(finalLogoClone);
    }
  });
};
