# Warm Boutique Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current mixed/dense visual interface with a cohesive Warm Boutique travel experience while preserving content, URLs, search/filter behavior, SEO, and WhatsApp conversion.

**Architecture:** Create a compact global token layer and dedicated homepage component/style boundaries. Rebuild the homepage around an editorial two-column hero, service gateway, curated tour grid, trust strip, local-guide feature, and single-column FAQ. Bring shared header, footer, WhatsApp button, tour card, and category navigation into the same visual system before adapting archive/detail/service pages.

**Tech Stack:** Astro 7, TypeScript, Astro Content Collections, plain scoped/global CSS, Node test runner.

**Spec:** `docs/superpowers/specs/2026-09-30-warm-boutique-redesign-design.md`

## Global Constraints

- Use Sand `#F5EFE6`, Warm white `#FFFCF7`, Deep ink `#172A39`, Clay `#C96B55`, Muted olive `#687263`, and Soft line `#E4DACE` consistently.
- Use Playfair Display only for editorial display headings and Plus Jakarta Sans for interface/body text.
- Do not add client frameworks, third-party UI dependencies, neon colors, glossy gradients, notification badges, marquees, decorative looping motion, or all-caps hero copy.
- Keep existing Astro content collections, generated URLs, metadata, sitemap behavior, and safe WhatsApp URL utility authoritative.
- Retain existing tour archive live search/filter behavior.
- Support `prefers-reduced-motion`, keyboard navigation, WCAG AA contrast, responsive WebP use, and no horizontal mobile overflow.
- Do not commit, push, publish, or alter external services without explicit authorization.

## Review Focus

- Header navigation remains keyboard reachable after desktop/mobile interaction changes; test `Escape`, focus state, and mobile drawer close behavior.
- A missing `*-480.webp` responsive derivative must not produce broken tour images; only emit a `source` when the file exists.
- All WhatsApp conversion links must use `buildWhatsAppUrl()` and retain encoded, context-specific text.
- Existing category, service, archive, and individual tour routes must render without relying on removed legacy CSS class names.
- At 320px viewport, fixed WhatsApp control and main content must not create horizontal scrolling or hide primary CTA content.

---

## File Structure

| Path | Responsibility |
|---|---|
| `src/styles/global.css` | Warm Boutique tokens, reset, shared primitives, responsive/accessibility utilities. |
| `src/styles/homepage.css` | Homepage-only composition and responsive rules. |
| `src/components/Hero.astro` | Homepage editorial hero with image and WhatsApp planning CTA. |
| `src/components/ServiceGateway.astro` | Four image-led primary navigation choices. |
| `src/components/TrustStrip.astro` | Three concise assurance items. |
| `src/components/EditorialFeature.astro` | Local planning image/copy section. |
| `src/components/Header.astro` | Cohesive desktop header and accessible mobile drawer. |
| `src/components/Footer.astro` | Deep-ink, restrained footer and booking CTA. |
| `src/components/FloatingWhatsApp.astro` | Compact persistent inquiry control. |
| `src/components/TourCard.astro` | Stable, reusable Warm Boutique tour card. |
| `src/components/CategoryNav.astro` | Calm category navigation with clear hierarchy. |
| `src/pages/index.astro` | Home composition using focused components. |
| `src/pages/turlar/index.astro` | Archive visual migration while preserving `tour-search`, `category-filter-buttons`, and `filterTours`. |
| `src/pages/turlar/[slug].astro` | Tour detail visual migration while retaining semantic/SEO/booking behavior. |
| `src/pages/tur-kategorisi/[category].astro` | Category page visual migration. |
| `src/pages/[service].astro` | Service page visual migration. |
| `tests/site-contract.test.mjs` | Contract tests for preserved interactions and Warm Boutique structure. |

### Task 1: Replace global token and primitive layer

**Files:**
- Modify: `src/styles/global.css`
- Modify: `src/layouts/Layout.astro`
- Test: `tests/site-contract.test.mjs`

**Interfaces:**
- Produces: CSS variables `--wb-sand`, `--wb-warm-white`, `--wb-ink`, `--wb-clay`, `--wb-olive`, and `--wb-line`; shared `.wb-container`, `.wb-button`, `.wb-button--primary`, `.wb-button--text`, and `.wb-eyebrow` primitives.
- Consumes: Existing layout props and SEO/schema fields unchanged.

- [ ] **Step 1: Write failing contract assertions for Warm Boutique tokens and loaded fonts**

Add an assertion that `global.css` includes all six `--wb-*` variables, and `Layout.astro` loads `Playfair+Display` and `Plus+Jakarta+Sans`.

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `node --test tests/site-contract.test.mjs`

Expected: FAIL until the token names and font references match the new contract.

- [ ] **Step 3: Implement the global Warm Boutique token layer and primitives**

Replace the legacy visual tokens and incompatible selector styles with plain CSS. Use exactly the palette values from Global Constraints. Preserve skip link, focus styles, reduced-motion behavior, and base responsive utilities.

- [ ] **Step 4: Update `Layout.astro` typography loading and theme color without changing canonical/meta/schema logic**

Load Playfair Display and Plus Jakarta Sans. Set browser theme color to Sand `#F5EFE6`.

- [ ] **Step 5: Run focused test and Astro check**

Run: `npm run check && node --test tests/site-contract.test.mjs`

Expected: PASS with no diagnostics.

- [ ] **Step 6: Commit**

```bash
git add src/styles/global.css src/layouts/Layout.astro tests/site-contract.test.mjs
git commit -m "feat: establish warm boutique design tokens"
```

### Task 2: Build the homepage-specific component set

**Files:**
- Create: `src/components/Hero.astro`
- Create: `src/components/ServiceGateway.astro`
- Create: `src/components/TrustStrip.astro`
- Create: `src/components/EditorialFeature.astro`
- Create: `src/styles/homepage.css`
- Test: `tests/site-contract.test.mjs`

**Interfaces:**
- Consumes: `buildWhatsAppUrl(context: string): string`; public `/assets/*.webp` files.
- Produces: Static, semantic Astro components with no client hydration requirement.

- [ ] **Step 1: Write failing homepage component contract assertions**

Assert source presence for `Hero`, `ServiceGateway`, `TrustStrip`, `EditorialFeature`, and `homepage.css`; assert `Hero.astro` imports `buildWhatsAppUrl`.

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `node --test tests/site-contract.test.mjs`

Expected: FAIL because the new components do not exist.

- [ ] **Step 3: Implement `Hero.astro`**

Render an eyebrow, sentence-case headline “Phuket, sizin ritminizde.”, concise Turkish copy, primary planning CTA built with `buildWhatsAppUrl`, quiet tours text link, one hero image, and a small “Türkçe yerel destek” plaque. Use accessible image alt text and eager loading only for the hero image.

- [ ] **Step 4: Implement `ServiceGateway.astro`, `TrustStrip.astro`, and `EditorialFeature.astro`**

`ServiceGateway` renders exactly four links: Tours, Accommodation, Transfers, Private planning. `TrustStrip` renders exactly three concise assurances. `EditorialFeature` renders one destination image and local planning copy without counters or unverifiable claims.

- [ ] **Step 5: Implement homepage composition CSS**

Use editorial two-column hero, four-column desktop gateway, selected-tour grid, asymmetrical feature layout, and one-column FAQ. Add breakpoints for one-column mobile layouts and no decorative looping animation.

- [ ] **Step 6: Run component contracts and build**

Run: `npm test && npm run build`

Expected: all tests PASS; static build succeeds.

- [ ] **Step 7: Commit**

```bash
git add src/components/Hero.astro src/components/ServiceGateway.astro src/components/TrustStrip.astro src/components/EditorialFeature.astro src/styles/homepage.css tests/site-contract.test.mjs
git commit -m "feat: add warm boutique homepage sections"
```

### Task 3: Rebuild shared navigation, conversion, and card components

**Files:**
- Modify: `src/components/Header.astro`
- Modify: `src/components/Footer.astro`
- Modify: `src/components/FloatingWhatsApp.astro`
- Modify: `src/components/TourCard.astro`
- Modify: `src/components/CategoryNav.astro`
- Test: `tests/site-contract.test.mjs`

**Interfaces:**
- Consumes: `buildWhatsAppUrl`, category collection shape, tour collection shape, `formatPrice`.
- Produces: Shared components that do not reference removed `pt-*` design classes except required route/test identifiers elsewhere.

- [ ] **Step 1: Write failing tests for restrained conversion and shared card constraints**

Assert `FloatingWhatsApp.astro` does not contain `YENİ` or `waFloat`; assert its link uses `buildWhatsAppUrl`. Assert `TourCard.astro` has `loading="lazy"`, an image alt from the tour title, and one detail link.

- [ ] **Step 2: Run focused test to verify it fails**

Run: `node --test tests/site-contract.test.mjs`

Expected: FAIL against the old notification/bounce implementation.

- [ ] **Step 3: Implement cohesive header and mobile drawer**

Use warm-white header, deep-ink navigation, one clay CTA, visible focus state, keyboard-safe menu toggle, `aria-expanded`, Escape close, and body-scroll restoration. Do not retain floating glass/header pill visuals.

- [ ] **Step 4: Implement footer and compact floating WhatsApp control**

Footer uses Deep ink with restrained text and one WhatsApp CTA. Fixed WhatsApp control must be compact, non-bouncing, no badge, and stay inside narrow screens.

- [ ] **Step 5: Implement TourCard and CategoryNav visual simplification**

Tour cards use one stable image aspect ratio, category label, title, duration, price/quote, and detail cue. Do not construct responsive derivative URLs unless a matching source file is available. Category navigation becomes a readable hierarchy with stable grid collapse.

- [ ] **Step 6: Run tests and build**

Run: `npm test && npm run build`

Expected: PASS; no broken asset request references in generated output.

- [ ] **Step 7: Commit**

```bash
git add src/components/Header.astro src/components/Footer.astro src/components/FloatingWhatsApp.astro src/components/TourCard.astro src/components/CategoryNav.astro tests/site-contract.test.mjs
git commit -m "feat: unify warm boutique navigation and cards"
```

### Task 4: Compose and verify the new homepage

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/styles/homepage.css`
- Test: `tests/site-contract.test.mjs`

**Interfaces:**
- Consumes: `Hero`, `ServiceGateway`, `TourCard`, `TrustStrip`, `EditorialFeature`, `CategoryNav`, and tours collection.
- Produces: Homepage sections in this order: hero, travel needs, selected experiences, category navigation, trust strip, editorial feature, FAQ.

- [ ] **Step 1: Write a failing ordering contract**

Read `src/pages/index.astro` and assert imports/markers appear in the required section order: `Hero`, `ServiceGateway`, selected tours, `TrustStrip`, `EditorialFeature`, FAQ.

- [ ] **Step 2: Run focused test to verify it fails**

Run: `node --test tests/site-contract.test.mjs`

Expected: FAIL while legacy homepage composition remains.

- [ ] **Step 3: Recompose `index.astro` with the specified sections and no legacy dense modules**

Use the existing collection sorting for six featured tours. Remove legacy scene explorer, marquee, dense planner, decorative orbs, filter placeholder buttons, and repeated service/proof content. Keep FAQ semantic `details` elements.

- [ ] **Step 4: Add homepage-only responsive and reduced-motion checks in CSS**

Ensure hero and all grids become one column on mobile; no element has fixed width wider than viewport; avoid extra motion.

- [ ] **Step 5: Run full verification**

Run: `npm test && npm run build`

Expected: 0 test failures; 53 static pages build successfully.

- [ ] **Step 6: Commit**

```bash
git add src/pages/index.astro src/styles/homepage.css tests/site-contract.test.mjs
git commit -m "feat: rebuild homepage as warm boutique journey"
```

### Task 5: Migrate the tour archive without changing its filter contract

**Files:**
- Modify: `src/pages/turlar/index.astro`
- Modify: `src/styles/global.css`
- Test: `tests/site-contract.test.mjs`

**Interfaces:**
- Consumes: existing `tour-search`, `category-filter-buttons`, `filterTours`, collection data, and `buildWhatsAppUrl`.
- Produces: Warm Boutique archive hero, controls, responsive tour card grid, and empty result state.

- [ ] **Step 1: Write failing archive preservation assertions**

Assert `src/pages/turlar/index.astro` still includes `tour-search`, `category-filter-buttons`, `filterTours`, and `buildWhatsAppUrl`; assert it no longer includes `pt-tour-hero` or `pt-catalog-card`.

- [ ] **Step 2: Run focused test to verify it fails**

Run: `node --test tests/site-contract.test.mjs`

Expected: FAIL on remaining legacy class names.

- [ ] **Step 3: Replace archive markup and visual class names only**

Use a compact editorial archive hero, accessible search label/input, clay active filter state, `TourCard` or its matching data markup, and a quiet empty state. Preserve all IDs/data attributes/function logic relied on by filtering.

- [ ] **Step 4: Run full tests and manual filter smoke test**

Run: `npm test && npm run build`

Then serve locally and verify a text query hides nonmatching cards, a category button updates visibility, and clear query returns matching cards.

- [ ] **Step 5: Commit**

```bash
git add src/pages/turlar/index.astro src/styles/global.css tests/site-contract.test.mjs
git commit -m "feat: restyle tour archive without changing filters"
```

### Task 6: Migrate route templates to the shared design system

**Files:**
- Modify: `src/pages/turlar/[slug].astro`
- Modify: `src/pages/tur-kategorisi/[category].astro`
- Modify: `src/pages/[service].astro`
- Modify: `src/pages/404.astro`
- Test: `tests/site-contract.test.mjs`

**Interfaces:**
- Consumes: existing Content Collection schemas, `Layout` SEO props, `buildWhatsAppUrl`, `formatPrice`, route params/static paths.
- Produces: Warm Boutique route templates that preserve title, breadcrumbs, JSON-LD, FAQs, booking conversion, and content body.

- [ ] **Step 1: Write failing route-template constraints**

Assert each template imports `Layout`; assert tour detail contains `buildWhatsAppUrl`, FAQ `details`, and a booking link. Assert category and service templates preserve `getStaticPaths`/collection lookups already required for static generation.

- [ ] **Step 2: Run focused test to verify it fails where legacy styles dominate**

Run: `node --test tests/site-contract.test.mjs`

Expected: FAIL until template markers/classes meet the new contract.

- [ ] **Step 3: Migrate tour-detail hero, content, facts, and booking layout**

Use a calm image-led hero, readable single content column, Clay booking CTA, and sticky booking panel only when viewport width permits. Keep existing structured data and WhatsApp booking context.

- [ ] **Step 4: Migrate category, service, and 404 pages**

Use shared eyebrow, headings, cards, and content spacing. Do not change routes/content collection frontmatter or static path behavior.

- [ ] **Step 5: Verify representative static outputs**

Run: `npm run build`

Verify generated files exist for `/turlar/phi-phi-maya-bamboo-adasi/`, `/tur-kategorisi/island-tours/`, `/paketler/`, and `/404.html`.

- [ ] **Step 6: Run full tests and commit**

Run: `npm test && npm run build`

```bash
git add src/pages/turlar/[slug].astro src/pages/tur-kategorisi/[category].astro src/pages/[service].astro src/pages/404.astro tests/site-contract.test.mjs
git commit -m "feat: extend warm boutique design to route templates"
```

### Task 7: Browser QA, accessibility, and final cleanup

**Files:**
- Modify: `tests/site-contract.test.mjs` only if verification identifies an untested design contract.
- Verify: `dist/index.html`, desktop/mobile browser rendering, console output.

**Interfaces:**
- Consumes: completed static build and local Astro dev server.
- Produces: Evidence that the shipped static artifact works with no browser console errors.

- [ ] **Step 1: Add or adjust only evidence-backed regression tests**

If browser QA exposes a reproducible defect not covered by existing contracts—such as a missing accessible label or legacy class leak—add the smallest relevant assertion first.

- [ ] **Step 2: Run all automated checks**

Run: `npm test && npm run check && npm run build`

Expected: all pass; Astro reports 0 errors/warnings/hints.

- [ ] **Step 3: Run browser QA on desktop and mobile widths**

Serve: `npm run dev -- --host 0.0.0.0`

Check `/`, `/turlar/`, one tour detail, one category, and one service at desktop and 320px mobile width. Confirm no horizontal overflow, WhatsApp works/does not obstruct content, menu works, archive filtering works, FAQ operates with keyboard, and browser console has no errors.

- [ ] **Step 4: Inspect generated static artifact**

Verify `dist/index.html` includes Warm Boutique styles, a safe WhatsApp URL, and no removed marquee/badge text.

- [ ] **Step 5: Commit any evidence-backed test or cleanup change**

```bash
git add tests/site-contract.test.mjs src
# Include only files actually changed by QA remediation.
git commit -m "test: verify warm boutique responsive experience"
```
