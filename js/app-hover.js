/**
 * app-hover.js — subtle cursor-follow parallax on the app phone image.
 *
 * When the cursor enters .section-app__image-wrap the image gently
 * shifts toward the cursor (max ±14px / ±10px). On leave it snaps
 * back and the ambient float animation resumes.
 *
 * Technique: sets CSS custom properties --tx / --ty on the element so
 * the transform lives entirely in CSS (no el.style.transform = … in JS,
 * which the guidelines forbid for most cases). The exception for nav.js
 * overflow is already established; this pattern uses custom props instead
 * to stay within the spirit of the rule.
 */

export function initAppHover() {
  const wrap  = document.querySelector('.section-app__image-wrap');
  const img   = document.querySelector('.section-app__image');
  if (!wrap || !img) return;

  // Respect reduced-motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Max displacement in px
  const MAX_X = 14;
  const MAX_Y = 10;

  function onMove(e) {
    const rect   = wrap.getBoundingClientRect();
    // Normalise cursor to [-1, 1] relative to wrap centre
    const nx = ((e.clientX - rect.left)  / rect.width  - 0.5) * 2;
    const ny = ((e.clientY - rect.top)   / rect.height - 0.5) * 2;

    img.style.setProperty('--tx', `${(nx * MAX_X).toFixed(1)}px`);
    img.style.setProperty('--ty', `${(ny * MAX_Y).toFixed(1)}px`);
  }

  wrap.addEventListener('mouseenter', () => {
    img.classList.add('is-tracking');
  });

  wrap.addEventListener('mousemove', onMove);

  wrap.addEventListener('mouseleave', () => {
    img.classList.remove('is-tracking');
    // Reset props so the float animation restarts cleanly
    img.style.removeProperty('--tx');
    img.style.removeProperty('--ty');
  });
}
