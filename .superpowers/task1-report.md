# Task 1 — Warm Boutique global system

## Summary
- Replaced the legacy global visual layer with the Warm Boutique token system and shared primitives.
- Added the exact required `--wb-*` palette tokens, editorial/body font stacks, responsive container/button/eyebrow primitives, skip link/focus treatment, and reduced-motion support.
- Updated `Layout.astro` to load only Playfair Display and Plus Jakarta Sans, set theme color to `#F5EFE6`, and retain canonical, metadata, Open Graph/Twitter, and Organization schema behavior.
- Replaced legacy homepage visual assertions with Task 1 contracts for the new token/primitives/font system while retaining existing content, WhatsApp, and archive filter contracts.

## Files changed
- `src/styles/global.css`
- `src/layouts/Layout.astro`
- `tests/site-contract.test.mjs`

## Tests
- `node --test tests/site-contract.test.mjs` — PASS (7/7)
- `npm test` — PASS (7/7)
- `npm run check` — PASS (0 errors, 0 warnings, 0 hints)
- `npm run build` — PASS (0 Astro diagnostics; 53 static pages built)

## Concerns
- Compatibility aliases remain temporarily for route/component templates scheduled for later migration. They map exclusively to Warm Boutique values and can be removed after downstream templates stop using legacy token names.
- No commits created, per task constraint.
