Here are your working guidelines — written to be pasted directly into any agent prompt or kept as a project README.

---

# SWITALY Codebase — Working Guidelines

## File structure

```
switaly/
├── index.html              ← One-pager homepage
├── corso-swenglish.html    ← Course detail page (template for all others)
├── css/
│   ├── base.css            ← EDIT THIS FIRST. Tokens, reset, all shared utilities.
│   ├── components.css      ← Reusable UI components: nav, buttons, cards, form, stats.
│   ├── sections.css        ← Homepage section layouts only.
│   ├── animations.css      ← @keyframes and stagger delays only.
│   └── course-page.css     ← Inner page additions: subnav, hero split, pillars, CTA band.
└── js/
    ├── main.js             ← Homepage entry point. Imports and calls init functions only.
    ├── nav.js              ← Nav scroll state, burger, drawer, keyboard handling.
    ├── hero.js             ← Homepage hero bg zoom + above-fold reveals.
    ├── observer.js         ← Scroll-reveal IntersectionObserver engine.
    ├── counter.js          ← Animated number counters.
    ├── form.js             ← Contact form: validation, sessionStorage prefill, submission.
    └── subnav.js           ← Inner page subnav scroll shadow only.
```

---

## The golden rule: where does this belong?

Before writing a single line, ask:

| What you're adding | Where it goes |
|---|---|
| A new color, spacing value, or timing | `base.css` tokens block — nowhere else |
| A new reusable element (button variant, card type) | `components.css` |
| A new homepage section layout | `sections.css` |
| A new inner page section layout | `course-page.css` |
| A new `@keyframes` | `animations.css` only |
| Shared typography (heading, eyebrow, body) | Already in `base.css` — use the utility classes, don't redeclare |
| New page-specific JS behaviour | New `.js` file, imported in the relevant page's `<script>` block |

---

## Design tokens — always use them, never bypass them

All values live in `base.css` under `:root`. If a value you need doesn't exist, **add a token first**, then reference it.

Key tokens to know:

```css
/* Colors */
--c-primary      #0a2e6e   deep blue — headings, nav bg, CTAs, dark sections
--c-secondary    #c8102e   red — eyebrows, accents, hover states, CTA buttons
--c-bg           #f5f6f8   page background (light grey-white)
--c-surface      #ffffff   card and section surface
--c-surface-2    #edf0f5   alternate surface (hero strip, services bg)
--c-text         #0d1b2a   primary text
--c-off          #5a6a7a   secondary / body text

/* Spacing — base 4px */
--sp-1 to --sp-24          4px → 96px

/* Section system */
--curve-section            clamp(16px, 3vw, 40px)  — all section border-radius values
--shadow-section           blue-tinted box-shadow between stacked sections
--nav-h                    68px
--subnav-h                 44px   (inner pages only)

/* App image overlap */
--app-overhang-top         clamp(40px, 7vw, 100px)
--app-overhang-bottom      clamp(60px, 10vw, 140px)
--app-overhang-mobile      clamp(90px, 27vw, 140px)
```

**Never hardcode** hex colours, pixel values, or timing outside of `base.css`. The one exception is `background-position` on individual course cards — that's intentionally per-image data, not a design value.

---

## Shared utility classes — use these, don't rewrite them

These live in `base.css` and work on every page automatically.

**Typography**
```html
<p class="eyebrow">La nostra offerta</p>           <!-- red, uppercase label -->
<h2 class="section-heading">Titolo <em>corsivo</em></h2>  <!-- display font, primary blue -->
<p class="section-body">Testo descrittivo...</p>    <!-- body size, secondary colour -->
```

**Layouts**
```html
<div class="layout-split">   <!-- 120px sidebar | 1fr content. Collapses to 1 col @ 900px -->
<div class="layout-two-col"> <!-- 1fr | 1fr. Collapses to 1 col @ 900px -->
<ul class="layout-grid">     <!-- auto-fill, min 280px per column -->
```

**Section stacking** (the overlapping curved sections system)
```html
<section class="section-layer section-layer--3" style="background: var(--c-surface);">
```
Layers go 5 (top) → 1 (bottom). Each layer automatically gets `border-radius`, `margin-top`, `padding-top`, and `box-shadow` from the token. **Never set these manually on a section** — use the layer class instead.

**Scroll reveals**
```html
data-reveal          <!-- fade + translateY (default) -->
data-reveal="clip"   <!-- curtain reveal for headlines — wrap text in .reveal-inner -->
data-reveal="left"   <!-- fade + translateX for sidebar tags -->
data-reveal="line"   <!-- width expands for decorative rules -->
data-delay="1-5"     <!-- stagger delay in 80ms increments -->
```
Hero above-fold elements are revealed immediately by JS. Everything else is handled automatically by `observer.js` — just add `data-reveal` to the element.

**Breadcrumb**
```html
<ol class="breadcrumb">
  <li><a href="index.html">Home</a></li>
  <li><span class="breadcrumb__sep">›</span></li>
  <li><span class="breadcrumb__current">SW English</span></li>
</ol>
```

---

## The section overlap stack

This is the most important layout system to understand before editing anything structural.

Every section pulls up behind the one above it using a negative `margin-top` equal to `--curve-section`. The `padding-top` compensates so content doesn't compress. Z-index decreases downward.

```
hero            z-index: 5   flat bottom (border-radius: 0 on homepage)
hero-strip      z-index: 4   curve bottom, pulls up under hero
section-about   z-index: 3   curve bottom, pulls up under strip
section-courses z-index: 2   curve bottom
section-services z-index: 2  curve bottom + extra padding-bottom for app image
section-app     z-index: 2   curve bottom, app image bleeds top + bottom
section-contact z-index: 1   extra padding-top for app image bleed
footer          (flat, no stacking)
```

**Rules:**
- If you change `--curve-section`, all sections update automatically — never change individual `border-radius` values
- If you add a section to the stack, give it `class="section-layer section-layer--N"` and set a `background` — nothing else is needed
- The app image overlap is controlled by `--app-overhang-top/bottom/mobile` tokens — change those tokens if the overlap needs adjusting
- The last section on any page should have `border-radius: 0`. On inner pages `.cta-band` handles this. On the homepage the footer is flat

---

## Components — what exists and how to extend them

**Buttons** — always use `.btn` + a modifier. Never create one-off button styles.
```html
<a class="btn btn--primary">   <!-- blue fill -->
<a class="btn btn--secondary"> <!-- red fill — main CTA -->
<a class="btn btn--ghost">     <!-- white border — on dark/image backgrounds -->
<a class="btn btn--login">     <!-- transparent ghost with icon — nav only -->
```
To resize a nav button: add `.btn--nav` (reduces padding, smaller font, fades in on load).

**Course cards** — logo size is controlled per-card via a CSS custom property:
```html
<img class="course-card__logo" style="--card-logo-h: 64px;" src="..." />
```
Default is `56px`. The `background-position` of the card bg image is also set inline — this is intentional, as it's image-specific art direction.

**Service blocks** — the `::before` pseudo-element draws the red top accent line on hover. The `.service-block__link` component adds an arrow link at the bottom. Both are already styled — just add the HTML.

**Stats** — use `data-counter`, `data-target`, `data-duration` attributes. `counter.js` picks them up automatically.

**Form** — the contact form on the homepage is pre-filled via `sessionStorage`, not URL params.
Any inner page CTA (or same-page anchor) that should pre-fill the form must use:
```html
<a href="index.html" class="btn btn--secondary js-course-cta" data-course="Nome Corso">
```
On click, `form.js` stores the corso name to `sessionStorage`. `initForm()` reads and clears it on `index.html` load.
For same-page anchors (href starts with `#`), the textarea is filled directly on click — no storage needed.
`subnav.js` no longer handles CTA logic — it only manages the subnav scroll shadow.

---

## Inner page pattern — how to build a new course or service page

1. Copy `corso-swenglish.html` and rename it
2. Change the following — nothing else:
   - `<title>` and all `<meta>` content
   - `og:image` → course bg image
   - `aria-current="page"` in the subnav siblings list
   - Hero `src` on the `<img class="hero__bg">`
   - `style="object-position: ..."` on the hero bg if needed
   - Both `data-course="..."` attributes on the CTA buttons
   - All content text: eyebrow, h1, subtitle, pillars, method blocks, outcomes
   - `.course-intro` block (mobile duplicate of hero text)
3. Add `css/course-page.css` to the stylesheet links — it's already there in the template
4. The subnav, nav, footer, scroll reveals, and form pre-fill all work automatically

---

## Responsiveness contract

Every element must hold at these widths: `320px / 390px / 768px / 1024px / 1440px / 1920px`.

Key breakpoints already in the codebase:
- `900px` — nav collapses to burger, most grids go single-column
- `768px` — `.container` padding reduces
- `700px` — course hero switches from split to mobile layout (bottom-fade + `.course-intro` block)
- `560px` — stats go vertical, some section padding reduces
- `400px` — container padding at minimum
- `(max-height: 500px) and (orientation: landscape)` — hero goes `height: auto`

**Never** use `vh` — always `dvh` for viewport-height elements (iOS Safari compatibility).
**Never** use fixed `px` font sizes — always `clamp(min, fluid, max)`.
**Always** set `min-height: 44px` on interactive elements (WCAG tap target).

---

## Accessibility non-negotiables

- Every `<section>` needs `aria-labelledby` pointing to its heading `id`
- Decorative images and SVGs get `aria-hidden="true"`
- Interactive elements without visible text labels get `aria-label`
- The `[id]` global rule in `base.css` adds `scroll-margin-top` to all anchor targets automatically — no need to add it manually
- `prefers-reduced-motion` is handled globally in `base.css` by setting all transition/animation tokens to `0ms` — never hardcode animation durations outside the token system
- `noscript` fallback in every HTML file reveals all `data-reveal` elements

---

## What not to do

- **Never** put `font-family`, `font-weight`, `letter-spacing`, or `color` on an element that should use `.eyebrow`, `.section-heading`, or `.section-body` — extend those classes instead
- **Never** add a `@keyframes` outside `animations.css`
- **Never** set `background-color`, `border-radius`, `margin-top`, or `padding-top` manually on a section that participates in the overlap stack — use `section-layer`
- **Never** use `el.style.x = y` in JS except for the cases already established in `nav.js` (overflow on drawer open)
- **Never** reference images outside `img/` — no external URLs, no CDN image links
- **Never** add a third font family — the system is Cormorant Garamond + Barlow + Barlow Condensed
- **Never** add `drop-shadow` to a masked image — it bleeds through the transparent pixels and creates a black rectangle

---

## v6 changes — what was fixed and why

### Tokens relocated to `base.css`
`--subnav-h`, `--app-overhang-top/bottom/mobile` were declared in `:root` blocks inside
`course-page.css` and `sections.css` respectively. They now live in `base.css` under
`:root` alongside all other layout tokens. **Rule: every token goes in `base.css`, full stop.**

### `.eyebrow--light` modifier added
CTA band eyebrows on dark backgrounds need white text and centred alignment.
Previously done with inline styles on every page. Now use:
```html
<p class="eyebrow eyebrow--light" data-reveal>Inizia oggi</p>
```

### `.skip-link` added to every page
A visually-hidden skip-to-content link is now the first focusable element in every HTML
file. It satisfies WCAG 2.1 AA criterion 2.4.1 (Bypass Blocks). The style lives in `base.css`.

### `<link rel="canonical">` on every page
Prevents duplicate-content indexing when Vercel/Netlify serve both
`/page.html` and `/page` (clean URLs). Update the domain if it changes.

### Nav links no longer invisible without JS
`.nav__links li` used to start `opacity: 0` unconditionally in CSS, animated back by JS.
Now the opacity-0 rule is scoped to `.js-ready .nav__links li`. `nav.js` adds `.js-ready`
to `<html>` on init, so links are always visible without JS.

### Hero video fixed
- Removed `codecs=hvc1` — the file is H.264, not HEVC. The codec hint was wrong and
  caused some browsers to reject the source unnecessarily.
- Added `poster="img/compressed/jpg/og-bg.jpg"` so slow connections see a still frame
  instead of a blank/black rectangle while the video buffers.

### Course card backgrounds converted from CSS `background-image` to `<picture>` + `<img>`
`div.course-card__bg` with inline `background-image` URLs has been replaced with a
`<picture>` element containing AVIF → WebP → JPG sources and `loading="lazy"` on the `<img>`.
Benefits:
- Native browser lazy loading (no JS required, works without JS)
- AVIF support added (previously only WebP + JPG fallback via JS)
- Correct `object-position` art direction via inline `style` on the `<img>` (same as before)
The `data-bg-fallback` attribute and `images.js` module have been removed — they are no
longer needed.

### Team card images now lazy-loaded
All 8 `<img class="team-card__image">` elements now have `loading="lazy"` and explicit
`width`/`height` attributes to prevent layout shift (CLS).

### `section-app__image` exposed in no-JS noscript
The app phone image uses its own CSS entrance (`opacity: 0` + transition) outside the
`[data-reveal]` system. The noscript block in `index.html` now explicitly resets it.

### Counter noscript fixed
The old `[data-counter]::after { content: attr(data-target); }` appended the target *after*
the existing `0`, producing e.g. `020000`. The new approach sets `color: transparent` on
the element and renders the target via `::before` with `position: absolute`.

### `contact-info__map` style corrected
The class was written for `<img>` (`object-fit: cover`), but the element is an `<iframe>`.
`object-fit` is now removed; `aspect-ratio: 4/3` and `display: block` remain.

### `<address>` style moved to CSS
`font-style: normal` was inline on the `<address>` element. Now in `sections.css` as
`.contact-info__address { font-style: normal; }`.

### Privacy link and tel link styles moved to CSS
`.form-privacy-link` and `.contact-info__tel` component classes replace the inline
`style="color: var(--c-primary); text-decoration: underline"` attributes.

### Logo href fixed
`<a href="#">` on the homepage logo now points to `index.html` for consistency with
inner pages (avoids adding `#` to the URL on click).

### `team-grid` now uses `auto-fill`
The fixed `repeat(4, 1fr)` grid had a jump from 4 columns straight to 2 at 900px with
no intermediate state. Replaced with `repeat(auto-fill, minmax(min(220px, 100%), 1fr))`
which reflows naturally at every viewport width.

### Dead files removed
- `js/data.js` — exported site content as JS constants but was never imported anywhere.
- `js/images.js` — WebP fallback detection via JS, superseded by native `<picture>`.

### Homepage sections migrated to `.section-layer` system

`section-about`, `section-courses`, `section-services`, `section-app`, `section-team`,
and `section-contact` previously each declared `margin-top`, `padding-top`,
`border-radius`, and `box-shadow` manually — duplicating what `.section-layer` already
centralises. They now carry `section-layer section-layer--N` in the HTML and `sections.css`
only declares what is unique to each section (background, padding-bottom, overrides).

**The z-index assignment for the homepage overlap stack is now:**
```
hero            z-index: 5   (no section-layer — flat bottom, not in stack)
hero-strip      z-index: 4   (manual — no negative margin-top, cannot use section-layer)
section-about   section-layer--3
section-courses section-layer--2
section-services section-layer--2
section-app     section-layer--2   padding-top overridden to sp-12 (tighter than standard)
section-team    section-layer--1   padding-top overridden for app-overhang-bottom
section-contact section-layer--1   border-radius and box-shadow suppressed (last section)
```

**Responsive fix included:** the `@media (max-width: 560px)` block previously used
`padding-block` on the section group, which wiped the `padding-top` that `.section-layer`
sets (the curve compensation). Changed to `padding-bottom` only.

**Rule for adding future sections to the stack:**
1. Add `class="section-layer section-layer--N"` and a `background` — nothing else needed
2. If the section needs non-standard top padding, add one line to `sections.css` overriding it
3. If the section is the last before the footer, add `border-radius: 0; box-shadow: none;`
4. `hero-strip` remains manual because its `margin-top` is `0` (hero is flat-bottomed) —
   do not attempt to use `.section-layer` on it

### v6.1 — remaining audit items resolved

**Font preload hint added to every page**
`<link rel="preload" href="[Google Fonts URL]" as="style" crossorigin />` is now inserted
immediately before `<link rel="stylesheet">` for the same URL. This tells the browser to
start fetching the font CSS before the render-blocking stylesheet tag is parsed, reducing
FOUT on first load. The `preconnect` hints (already present) handle the DNS/TLS warmup;
the `preload` handles the actual file fetch.

**Google Maps GDPR click-to-load pattern**
The raw `<iframe src="https://www.google.com/maps/...">` in `index.html` has been replaced
with a `.map-consent` component that:
- Shows a blurred preview image with a "Mostra mappa" button
- Stores the real Maps URL in `data-src` on the `<iframe>` (browser never requests it)
- On button click, moves `data-src` to `src` and shows the iframe, adding `.is-loaded`
- Requires zero JS frameworks — a 10-line IIFE in a `<script>` tag
Styles live in `sections.css` under `/* ── MAP CLICK-TO-LOAD */`.
**Action required:** replace the `map-consent__preview` placeholder image
(`img/compressed/jpg/og-bg.jpg`) with an actual static screenshot of the map area.

**Inline `margin-top` on `.section-body` elements removed across all pages**
All instances replaced with `.section-body--spaced` modifier class (defined in `base.css`).
The rule `.section-body + .section-body` also auto-applies spacing between consecutive
body paragraphs without needing a class at all.

**Course card logos now have `width`/`height` attributes**
Prevents layout shift (CLS) during logo loading. Values are `width="180"` matching the
CSS `max-width`, and `height` matching the `--card-logo-h` token per card.

**New component classes added — use these, don't re-invent inline:**

In `course-page.css`:
- `.course-modules-col` — flex column wrapper for the two-column module listing layout
- `.course-module` — individual module card (badge + title + body)
- `.course-module__badge`, `.course-module__badge--base`, `.course-module__badge--advanced` — level label
- `.course-module__title` — module heading (body font, 600 weight)
- `.course-module__body` — module description
- `.audience-block`, `.audience-block__title` — h4 + body target audience pairs
- `.section-body--callout` — bold primary-colour emphasis paragraph
- `.outcomes--tight` — tighter gap variant of `.outcomes` list

In `components.css`:
- `.service-block__heading` — display-font h3 inside a service-block card
- `.service-block__rule` — `<hr>` divider inside a service-block

**Inline `font-family: var(--f-cormorant)` was a bug** — that token doesn't exist.
The correct token is `var(--font-display)`. All occurrences replaced via `.service-block__heading`.

### v6.2 — landscape phone nav + form cleanup

**Landscape phone nav restored**
Phones held sideways (600–900px wide, orientation: landscape) now show the full desktop
nav bar instead of the hamburger. The breakpoint is:
```css
@media (min-width: 600px) and (max-width: 900px) and (orientation: landscape)
```
600px is the safe lower bound — below that you're on an unusually small device.
iPads in portrait (768px+) are unaffected because they are not `orientation: landscape`.
The existing `(max-height: 500px) and (orientation: landscape)` rules for the hero and
section padding remain — they target the same physical state from the height axis.

**Hero video poster removed**
The `poster` attribute was added as a "slow connection" fallback, but the hero already
has `background-color: var(--c-primary)` as a CSS fallback, and the poster adds an
extra image request before the video loads. Removed — the blue background is sufficient.

**Form: `.is-hidden` class replaces `form.style.display = 'none'`**
The guidelines prohibit `el.style.x = y` in JS except for the established nav.js case.
The form now adds `.is-hidden` (defined in `base.css`) on successful submission instead.

**Form: `writePrefill` is no longer exported**
It was exported but never called directly from outside `form.js`. It is now a private
module-level function. Only `initForm` and `initCourseCTA` are exported from form.js.

**Form: scroll-to-contact on cross-page prefill**
Replaced `setTimeout(300ms)` + unconditional `scrollIntoView` with a `requestAnimationFrame`
that checks if the contact section is actually below the viewport before scrolling.
This avoids unnecessary scroll jank on wide screens where the contact section may
already be visible.

**Backend: honeypot checked before validation**
`contact.js` now checks `body.website` (the honeypot) as the first operation after
parsing, before running any field validation. Bots are short-circuited immediately.

**Backend: no hardcoded email fallback**
`CONTACT_EMAIL_FROM` is now required alongside `CONTACT_EMAIL_TO`. If either is missing,
the function returns a 500 with a clear error rather than silently using a hardcoded
fallback address. Set both in Cloudflare Pages → Settings → Environment Variables.
