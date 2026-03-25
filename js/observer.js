/**
 * observer.js — scroll-triggered reveal engine
 */

export function initReveal() {
  /* Reduced motion: show everything immediately */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('[data-reveal]').forEach(el => {
      el.classList.add('is-visible');
      el.querySelectorAll('.reveal-inner').forEach(inner => {
        inner.style.transform = 'none';
        inner.style.opacity   = '1';
      });
    });
    /* Also immediately show app image */
    document.querySelector('.section-app__image')?.classList.add('is-visible');
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach(({ isIntersecting, target }) => {
        if (!isIntersecting) return;
        target.classList.add('is-visible');
        io.unobserve(target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -32px 0px' }
  );

  document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));

  /* App image has its own CSS entrance — observe it separately */
  const appImg = document.querySelector('.section-app__image');
  if (appImg) {
    const imgObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        appImg.classList.add('is-visible');
        imgObserver.disconnect();
      },
      { threshold: 0.15 }
    );
    imgObserver.observe(appImg);
  }
}
