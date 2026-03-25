/**
 * inner-page.js — Entry point for all course and service pages.
 */

import { initNav }        from './nav.js';
import { initHeroReveal } from './hero.js';
import { initReveal }     from './observer.js';
import { initSubnav }     from './subnav.js';
import { initCourseCTA }  from './form.js';  // writePrefill lives in form.js

function boot() {
  initNav();
  initHeroReveal();
  initReveal();
  initSubnav();
  initCourseCTA(); // stores corso to sessionStorage on CTA click
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
