/**
 * video-resize.js — fix Vimeo iframe height after orientation change.
 *
 * Problem:
 *   Browsers (especially iOS Safari) calculate the height of absolutely-
 *   positioned iframes once and do not always recompute on orientation
 *   change. Rotating landscape → portrait leaves the iframe frozen at
 *   the landscape height, making it appear cropped or oversized.
 *
 * Fix:
 *   On 'resize' (which fires after orientationchange has settled and the
 *   new viewport dimensions are available), briefly collapse the iframe
 *   height to 0 then restore it. This forces a reflow so the browser
 *   recalculates the absolute positioning against the new parent size.
 *
 *   We use 'resize' rather than 'orientationchange' because orientationchange
 *   fires before the viewport has finished resizing — the dimensions are
 *   still the old ones at that point.
 */

export function initVideoResize() {
  const embeds = document.querySelectorAll('.video-embed');
  if (!embeds.length) return;

  let resizeTimer;

  window.addEventListener('resize', () => {
    // Debounce — only act once the resize has settled
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      embeds.forEach(wrap => {
        const iframe = wrap.querySelector('iframe');
        if (!iframe) return;
        // Force reflow: collapse → restore
        iframe.style.height = '0';
        // One rAF is enough for the browser to register the change
        requestAnimationFrame(() => {
          iframe.style.height = '';
        });
      });
    }, 150);
  });
}
