/**
 * functions/api/contact.js
 * Cloudflare Pages Function — POST /api/contact
 *
 * Environment variables (Cloudflare Pages → Settings → Environment Variables):
 *   CONTACT_EMAIL_TO   — recipient address, e.g. info@switaly.it
 *   CONTACT_EMAIL_FROM — sender address,    e.g. noreply@switaly.it
 *
 * Both vars are required. The function fails fast if either is missing
 * rather than silently using a hardcoded fallback.
 *
 * Email transport: Mailchannels (free on Cloudflare Pages when the sending
 * domain is proxied through Cloudflare — no API key needed).
 * To switch to Resend: replace the Mailchannels fetch() with:
 *   fetch('https://api.resend.com/emails', {
 *     headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, ... }
 *   })
 */

const ALLOWED_ORIGIN = 'https://switaly.it'; // update if domain changes

export async function onRequestPost(context) {
  const { request, env } = context;

  // ── CORS ─────────────────────────────────────────────────
  const origin = request.headers.get('Origin') ?? '';
  if (origin !== ALLOWED_ORIGIN && !origin.endsWith('.pages.dev')) {
    return json({ ok: false, error: 'Forbidden' }, 403);
  }

  // ── Parse body ───────────────────────────────────────────
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'Invalid JSON' }, 400);
  }

  // ── Honeypot — checked first, before any real processing ─
  // Bots that fill the hidden "website" field are silently succeeded
  // so they don't know they were blocked and don't retry aggressively.
  if (body.website) {
    return json({ ok: true });
  }

  // ── Validate ─────────────────────────────────────────────
  const { azienda, nome, email, corso, messaggio } = body;

  if (!azienda?.trim() || !nome?.trim() || !messaggio?.trim()) {
    return json({ ok: false, error: 'Campi obbligatori mancanti' }, 422);
  }
  if (!isValidEmail(email)) {
    return json({ ok: false, error: 'Email non valida' }, 422);
  }

  // ── Environment check ────────────────────────────────────
  const toEmail   = env.CONTACT_EMAIL_TO;
  const fromEmail = env.CONTACT_EMAIL_FROM;

  if (!toEmail || !fromEmail) {
    console.error('Missing env vars: CONTACT_EMAIL_TO and/or CONTACT_EMAIL_FROM');
    return json({ ok: false, error: 'Configurazione server incompleta' }, 500);
  }

  // ── Build plain-text email body ──────────────────────────
  const emailBody = [
    'Nuovo contatto dal sito SW Italy',
    '',
    `Azienda:   ${azienda.trim()}`,
    `Nome:      ${nome.trim()}`,
    `Email:     ${email.trim()}`,
    corso?.trim() ? `Corso:     ${corso.trim()}` : null,
    '',
    'Messaggio:',
    messaggio.trim(),
  ].filter(line => line !== null).join('\n');

  // ── Send via Mailchannels ────────────────────────────────
  try {
    const res = await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: toEmail }] }],
        from:     { email: fromEmail, name: 'SW Italy Website' },
        reply_to: { email: email.trim(), name: nome.trim() },
        subject:  `[SW Italy] Richiesta da ${azienda.trim()}`,
        content:  [{ type: 'text/plain', value: emailBody }],
      }),
    });

    if (!res.ok) {
      console.error('Mailchannels error:', res.status, await res.text());
      return json({ ok: false, error: 'Errore invio email' }, 502);
    }

    return json({ ok: true });

  } catch (err) {
    console.error('Fetch error:', err);
    return json({ ok: false, error: 'Errore di rete' }, 500);
  }
}

// ── Helpers ──────────────────────────────────────────────────

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

function isValidEmail(val) {
  return typeof val === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
}
