# Warm Boutique Redesign — Design Specification

## Intent

Replace the current visually dense homepage and mixed design language with a calm, premium Phuket travel experience for Turkish travelers. The site must guide visitors from inspiration to a WhatsApp inquiry without making the page feel like a generic tour marketplace.

## Visual Direction

### Palette

- **Sand:** `#F5EFE6` — primary page background
- **Warm white:** `#FFFCF7` — elevated content surfaces
- **Deep ink:** `#172A39` — headings and navigation
- **Clay:** `#C96B55` — one primary conversion accent
- **Muted olive:** `#687263` — secondary labels and detail text
- **Soft line:** `#E4DACE` — dividers and borders

Clay is reserved for primary actions, active states, small numeric markers, and editorial emphasis. The page must not use neon cyan, glossy gradients, notification badges, or competing accent colours.

### Typography

- **Display:** Playfair Display for major editorial headlines only.
- **Interface/body:** Plus Jakarta Sans for navigation, descriptions, cards, forms, and metadata.
- Headings use sentence case; no all-caps hero language.
- Large type has generous line-height and limited line width.

### Motion

- Use only opacity/transform entrance transitions, image zoom on hover, and gentle header state transition.
- Honor `prefers-reduced-motion`.
- Remove floating bounce effects, animated notification badges, marquees, and decorative motion that does not clarify an interaction.

## Homepage Information Architecture

1. **Header**
   - Warm-white surface with a thin lower rule; no floating glass pill.
   - Brand left, concise navigation center/right, single clay “Planını oluştur” CTA.
   - Mobile menu is an uncluttered full-height drawer.

2. **Hero: “Phuket, sizin ritminizde.”**
   - Two-column desktop composition.
   - Left: eyebrow, editorial title, one concise supporting paragraph, primary CTA and quiet text link.
   - Right: one dominant rounded/organic framed Phuket image with a small “Türkçe yerel destek” detail plaque.
   - No background image behind all text; hero stays readable without an overlay.

3. **Travel needs**
   - Four equal, image-led options: Turlar, Konaklama, Transfer, Özel plan.
   - They are navigation choices, not nested dense cards. Each has image, short statement, and arrow link.

4. **Selected experiences**
   - A quiet editorial heading plus six tour cards.
   - Cards use consistent image ratio, one category label, title, duration, price/quote label, and detail link.
   - A single dominant feature card may span two columns only on desktop; remaining cards keep a stable grid.

5. **Trust strip**
   - Three concise assurances: Turkish communication, written offer, transparent reservation.
   - Use numerals and short sentences; do not repeat these claims elsewhere.

6. **Local guide/story section**
   - Asymmetrical image/text section with one high-quality destination image.
   - Explains local planning value without unverifiable claims or artificial counters.

7. **FAQ**
   - One-column accordion at readable width; no card grid.

8. **Footer and persistent WhatsApp**
   - Deep ink footer with restrained links and a booking CTA.
   - WhatsApp is a compact, accessible fixed button. It has no “new” badge, no bounce loop, and no intrusive tooltip.

## Reusable Component Boundaries

- `Header.astro`: navigation, desktop/mobile behavior, header scroll state.
- `Hero.astro` (new): homepage hero only; contains no pricing, search, or repeated utility navigation.
- `ServiceGateway.astro` (new): four primary travel-need links.
- `TourCard.astro`: reusable across homepage, categories, and archive; visual variants are explicit props.
- `TrustStrip.astro` (new): three non-interactive assurances.
- `EditorialFeature.astro` (new): image-plus-copy local guide section.
- `Footer.astro` and `FloatingWhatsApp.astro`: restrained contact paths.
- `homepage.css`: homepage layout and responsive rules; global tokens live in `global.css`.

## Responsive Rules

- Desktop: 12-column layout with no more than two simultaneous visual focal points.
- Tablet: two-column cards where content allows; hero image moves below text only when space requires.
- Mobile: one content column, 16–20px horizontal gutter, tap targets at least 44px, no horizontal overflow.
- Hero CTA and WhatsApp remain visible without obstructing content.

## Accessibility and Performance

- WCAG AA contrast for all body text, actions, and labels.
- Semantic headings, labelled mobile menu, keyboard-accessible dropdowns/drawer, visible focus states, and skip link.
- Image `alt` text describes the destination/experience, not generic marketing.
- Preserve WebP and responsive sources where provided. The first hero image may be eager; all non-critical images remain lazy.
- No added client framework or third-party UI dependency.

## Data and Interaction Constraints

- Existing Astro content collections, tour URLs, category URLs, WhatsApp utility, SEO metadata, and sitemap generation remain authoritative.
- Reservation and planning CTAs continue to build safe `wa.me` URLs via the existing utility.
- The existing tour archive’s live search/filter behavior remains intact; its presentation will later be brought into the same visual system.

## Acceptance Criteria

- Homepage uses the Warm Boutique palette consistently and no longer renders the previous dark neon/blur-card styling.
- The primary booking CTA is obvious but not visually dominant over all content.
- Navigation, content collections, 18 tour pages, archive filters, SEO metadata, and WhatsApp URLs continue to work.
- `npm run build` and `npm test` complete successfully.
- Desktop and mobile visual inspection confirms intentional hierarchy, consistent spacing, and no horizontal overflow.
