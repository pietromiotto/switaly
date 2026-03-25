/**
 * subnav.js — sticky subnav scroll shadow for inner pages.
 *
 * initCourseCTA has moved to form.js (which now owns all
 * form-related behaviour including cross-page prefill).
 */

export function initSubnav() {
  const subnav = document.getElementById('site-subnav');
  if (!subnav) return;

  window.addEventListener('scroll', () => {
    subnav.classList.toggle('subnav--shadow', window.scrollY > 60);
  }, { passive: true });
}
