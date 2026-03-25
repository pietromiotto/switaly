/**
 * nav.js — scroll state, burger, drawer, keyboard nav
 */

export function initNav() {
  /* Signal to CSS that JS is running — gates the nav-link opacity:0 start state
     so links are never invisible on no-JS or before this module loads. */
  document.documentElement.classList.add('js-ready');

  const nav    = document.getElementById('site-nav');
  const burger = document.getElementById('nav-burger');
  const drawer = document.getElementById('nav-drawer');
  const links  = Array.from(document.querySelectorAll('.nav__links li'));

  if (!nav || !burger || !drawer) return;

  /* Stagger nav links in */
  links.forEach((li, i) => {
    li.style.animation =
      `nav-drop 0.6s ${0.18 + i * 0.07}s cubic-bezier(0.22,1,0.36,1) forwards`;
  });

  /* Scroll state */
  const onScroll = () => {
    nav.classList.toggle('nav--scrolled', window.scrollY > 24);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Open / close helpers */
  function openDrawer() {
    drawer.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Chiudi menu');
    nav.classList.add('nav--drawer-open');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    drawer.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Apri menu');
    nav.classList.remove('nav--drawer-open');
    document.body.style.overflow = '';
  }

  burger.addEventListener('click', () => {
    drawer.classList.contains('is-open') ? closeDrawer() : openDrawer();
  });

  /* Close on drawer link click */
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));

  /* Close on Escape */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
      closeDrawer();
      burger.focus();
    }
  });

  /* Close on resize to desktop */
  window.matchMedia('(min-width: 901px)').addEventListener('change', (e) => {
    if (e.matches) closeDrawer();
  });
}
