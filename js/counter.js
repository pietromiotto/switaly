/**
 * counter.js — animated number counters on scroll
 * Usage: <span data-counter data-target="20000" data-duration="2000">0</span>
 */

function easeOutExpo(t) {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function runCounter(el) {
  const target   = parseInt(el.dataset.target,   10);
  const duration = parseInt(el.dataset.duration ?? 1500, 10);
  const start    = performance.now();

  function tick(now) {
    const elapsed = Math.min((now - start) / duration, 1);
    el.textContent = Math.round(easeOutExpo(elapsed) * target).toLocaleString('it-IT');
    if (elapsed < 1) requestAnimationFrame(tick);
    else el.textContent = target.toLocaleString('it-IT');
  }
  requestAnimationFrame(tick);
}

export function initCounters() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('[data-counter]').forEach(el => {
      el.textContent = parseInt(el.dataset.target, 10).toLocaleString('it-IT');
    });
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach(({ isIntersecting, target }) => {
        if (!isIntersecting) return;
        runCounter(target);
        io.unobserve(target);
      });
    },
    { threshold: 0.5 }
  );

  document.querySelectorAll('[data-counter]').forEach(el => io.observe(el));
}
