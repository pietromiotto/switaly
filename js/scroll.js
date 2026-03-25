/**
 * scroll.js — smooth in-page anchor scrolling for index.html.
 *
 * Why this exists:
 *   scroll-behavior: smooth on <html> was removed from base.css because it
 *   also applied when arriving on index.html from an external page with a
 *   hash anchor (e.g. index.html#contatti from a corso page). The browser
 *   would load the page at the top then visibly scroll down — jarring UX.
 *
 *   By handling smooth scroll in JS we can restrict it to clicks that
 *   originate *within* the already-loaded page, leaving cross-page
 *   anchor navigation instant (browser's native behaviour with no
 *   scroll-behavior on <html>).
 */

export function initSmoothScroll() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const hash = link.getAttribute('href');
    if (!hash || hash === '#') return;

    const target = document.querySelector(hash);
    if (!target) return;

    // Let the browser update the URL (and history) as normal
    // but take over the scroll so we can use smooth behaviour.
    e.preventDefault();
    history.pushState(null, '', hash);

    target.scrollIntoView({ behavior: 'smooth' });
  });
}
