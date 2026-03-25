/**
 * hero.js — above-fold reveals + video autoplay safety net.
 * Video background handles its own loading — no is-loaded zoom needed.
 */

/**
 * initHeroReveal — shared by homepage (via initHero) AND inner pages.
 * Fires the double-rAF reveal for all [data-reveal] elements inside .hero
 * so CSS transitions actually run (not blocked by initial paint).
 */
export function initHeroReveal() {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.querySelectorAll('.hero [data-reveal]').forEach(el => {
        el.classList.add('is-visible');
      });
    });
  });
}

/**
 * initVideoAutoplay — Safari / WebKit autoplay safety net.
 *
 * Problem: Safari on macOS/iOS can ignore the `autoplay` HTML attribute
 * even when the video is muted + playsinline. When it refuses, it renders
 * native video controls (a play button) directly on the element. Because
 * .hero__overlay and .hero__content sit above the video in the stacking
 * order, those native controls are completely hidden and unclickable.
 *
 * Fix:
 *   1. Set video.muted = true imperatively (belt-and-suspenders — Safari
 *      sometimes ignores the attribute but respects the property).
 *   2. Call video.play() explicitly. For muted videos this is allowed by
 *      Safari's autoplay policy without any user gesture.
 *   3. Catch the rejection promise. If Safari still refuses (e.g. Low Power
 *      Mode, aggressive content blockers), hide the video element entirely —
 *      the CSS `background-color: var(--c-primary)` fallback on .hero__bg
 *      provides a clean dark-blue background instead of broken controls.
 */
function initVideoAutoplay() {
  const video = document.querySelector('.hero__bg');
  if (!video || video.tagName !== 'VIDEO') return;

  // Imperative muted — required for Safari autoplay policy compliance
  video.muted = true;

  const promise = video.play();
  if (promise !== undefined) {
    promise.catch(() => {
      // Autoplay was blocked — remove the element so native controls
      // (which are unclickable under our overlay) never appear.
      video.remove();
    });
  }
}

/**
 * initHero — homepage only.
 * Calls initHeroReveal, drives video autoplay, then reveals the scroll
 * hint and hero-strip text (neither exists on inner pages).
 */
export function initHero() {
  initHeroReveal();
  initVideoAutoplay();

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.querySelector('.hero__scroll')?.classList.add('is-visible');
      /* Also reveal the text strip — it's above the fold on most screens */
      document.querySelector('.hero-strip [data-reveal]')?.classList.add('is-visible');
    });
  });
}
