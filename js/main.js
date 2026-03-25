/**
 * main.js — Entry point for index.html. Boots all modules.
 */

import { initNav }                    from './nav.js';
import { initHero }                   from './hero.js';
import { initReveal }                 from './observer.js';
import { initCounters }               from './counter.js';
import { initForm, initCourseCTA }    from './form.js';
import { initSmoothScroll }           from './scroll.js';
import { initAppHover }               from './app-hover.js';

function boot() {
  initNav();
  initHero();
  initReveal();
  initCounters();
  initForm();
  initCourseCTA();
  initSmoothScroll();
  initAppHover();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
