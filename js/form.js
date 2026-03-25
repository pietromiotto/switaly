/**
 * form.js — contact form: prefill, validation, submission.
 *
 * Prefill flow:
 *   Cross-page CTA (inner page → index.html):
 *     click → sessionStorage.setItem → navigation → initForm reads + clears on load
 *
 *   Same-page CTA (index.html #contatti anchor, e.g. "Le altre lingue"):
 *     click → applyPrefill() fills textarea directly — no storage needed
 *
 * Call order in main.js matters:
 *   initForm()     — reads storage, sets up validation + submission
 *   initCourseCTA() — wires click listeners on .js-course-cta links
 *   This order is correct: initForm reads storage at boot (cross-page path),
 *   initCourseCTA handles future same-page clicks (same-page path).
 */

const PREFILL_KEY = 'sw_corso_prefill';

// ── Storage helpers ──────────────────────────────────────────

function writePrefill(corso) {
  try {
    sessionStorage.setItem(PREFILL_KEY, corso);
  } catch {
    // sessionStorage blocked (some private-browsing configs) — fail silently
  }
}

function readPrefill() {
  try {
    return sessionStorage.getItem(PREFILL_KEY);
  } catch {
    return null;
  }
}

// ── Prefill application ──────────────────────────────────────

function applyPrefill(corso) {
  const inputCorso = document.getElementById('field-corso');
  if (!inputCorso) return;

  // Setta il valore solo se non c'è già o per sovrascriverlo con l'ultimo corso cliccato
  inputCorso.value = corso;
}

// ── CTA link wiring ──────────────────────────────────────────

/**
 * initCourseCTA — wires .js-course-cta links on any page.
 *
 * Exported and called by both main.js (index.html) and inner-page.js.
 *
 * Cross-page links (href="index.html"):
 *   Store corso in sessionStorage. Navigation happens normally.
 *   initForm() picks it up on the next page load.
 *
 * Same-page anchor links (href="#contatti", only on index.html):
 *   Fill the textarea immediately AND write to sessionStorage so the
 *   prefill survives if the user navigates to an inner page and returns.
 */
export function initCourseCTA() {
  document.querySelectorAll('.js-course-cta').forEach(link => {
    const corso = link.dataset.course;
    if (!corso) return;

    const href = link.getAttribute('href') ?? '';

    if (href.startsWith('#')) {
      // Write to storage first so it persists across navigation,
      // then fill the visible textarea immediately for instant feedback.
      link.addEventListener('click', () => {
        writePrefill(corso);
        applyPrefill(corso);
      });
    } else {
      // Cross-page link: store prefill and append ?from=cta so that
      // index.html knows this navigation was triggered by a CTA (not
      // the logo or a direct URL). The param is stripped from the URL
      // by initForm() immediately after reading it.
      link.addEventListener('click', (e) => {
        writePrefill(corso);
        // Rewrite the href with ?from=cta only at click time so the
        // static HTML href stays clean for SEO and right-click → copy.
        const url = new URL(link.href, location.href);
        url.searchParams.set('from', 'cta');
        link.href = url.toString();
        // Restore the original href after navigation so the link is
        // clean if the user returns to the same page without navigating.
        setTimeout(() => { link.href = href; }, 0);
      });
    }
  });
}

// ── Main form init (index.html only) ─────────────────────────

export function initForm() {
  const form    = document.getElementById('contact-form');
  const success = document.getElementById('form-success');
  if (!form) return;

  // Read cross-page prefill written by a previous page's CTA click.
  // The prefill is intentionally left in storage until the form is submitted,
  // so navigating freely (logo, back button) keeps the field pre-filled.
  // We only scroll to the contact section when the user explicitly followed a
  // CTA link — detected by the ?from=cta query param that initCourseCTA adds.
  const stored = readPrefill();
  if (stored) {
    applyPrefill(stored);

    const params = new URLSearchParams(window.location.search);
    if (params.get('from') === 'cta') {
      // Clean the param from the URL without adding a history entry
      const cleanUrl = window.location.pathname + window.location.hash;
      history.replaceState(null, '', cleanUrl);

      requestAnimationFrame(() => {
        const section = document.getElementById('contatti');
        if (!section) return;
        const { bottom } = section.getBoundingClientRect();
        if (bottom > window.innerHeight) {
          section.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  }

  // ── Validation ────────────────────────────────────────────
  const fields = [
    { id: 'field-azienda',   msg: "Inserisci il nome dell'azienda." },
    { id: 'field-nome',      msg: 'Inserisci il tuo nome.'          },
    { id: 'field-email',     msg: "Inserisci un'email valida.",      validator: isValidEmail },
    { id: 'field-messaggio', msg: 'Scrivi il tuo messaggio.'        },
  ];
  const privacy = document.getElementById('field-privacy');

  function isValidEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }

  function setError(groupEl, msg) {
    groupEl.classList.add('has-error');
    const errEl = groupEl.querySelector('.form-error');
    if (errEl) errEl.textContent = msg;
    const input = groupEl.querySelector('input, textarea');
    if (input) input.classList.add('is-error');
  }

  function clearError(groupEl) {
    groupEl.classList.remove('has-error');
    const input = groupEl.querySelector('input, textarea');
    if (input) input.classList.remove('is-error');
  }

  form.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('input', () => {
      const group = el.closest('.form-group');
      if (group) clearError(group);
    });
  });

  function validate() {
    let valid = true;

    fields.forEach(({ id, msg, validator }) => {
      const input = document.getElementById(id);
      if (!input) return;
      const group = input.closest('.form-group');
      const val   = input.value.trim();
      if (!val || (validator && !validator(val))) {
        setError(group, msg);
        valid = false;
      } else {
        clearError(group);
      }
    });

    const privacyGroup = privacy?.closest('.form-group');
    if (privacy && !privacy.checked) {
      if (privacyGroup) setError(privacyGroup, 'Devi accettare la Privacy Policy per procedere.');
      valid = false;
    } else if (privacyGroup) {
      clearError(privacyGroup);
    }

    return valid;
  }

  // ── Submission ────────────────────────────────────────────
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validate()) {
      form.querySelector('.is-error')?.focus();
      return;
    }

    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          azienda:   document.getElementById('field-azienda').value.trim(),
          nome:      document.getElementById('field-nome').value.trim(),
          email:     document.getElementById('field-email').value.trim(),
          corso:     document.getElementById('field-corso')?.value.trim() ?? '',
          messaggio: document.getElementById('field-messaggio').value.trim(),
          website:   document.getElementById('field-website')?.value ?? '',
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.ok) {
        form.classList.add('is-hidden');
        success?.classList.add('is-visible');
        form.reset();
        try { sessionStorage.removeItem(PREFILL_KEY); } catch {}
      } else {
        showSubmitError(form, data.error ?? "Errore durante l'invio. Riprova.");
        if (submitBtn) submitBtn.disabled = false;
      }

    } catch {
      showSubmitError(form, 'Errore di rete. Controlla la connessione e riprova.');
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

function showSubmitError(form, msg) {
  let errEl = form.querySelector('.form-submit-error');
  if (!errEl) {
    errEl = document.createElement('p');
    errEl.className = 'form-submit-error';
    errEl.setAttribute('role', 'alert');
    form.appendChild(errEl);
  }
  errEl.textContent = msg;
}
