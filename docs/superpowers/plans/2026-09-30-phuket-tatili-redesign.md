# Phuket Tatili 2 — Complete Redesign Plan

## Project Overview

Completely redesign the Phuket Tatili website with a fresh premium/boutique tourism aesthetic. Target audience: Turkish travelers planning trips to Phuket. The redesign will transform the existing dark/neon aesthetic to a lighter, premium feel.

## User Profile & Preferences (from context)

- **Premium/Boutique Tourism Aesthetic**: Clean, premium, premium butik turizm
- **Color Palette**: Açık krem zemin (cream background) + lacivert (navy) + terracotta
- **Media Content**: Rich photographic hero/hero areas, practical menu/navigation
- **WhatsApp CTA**: Visible WhatsApp contact
- **Rejection Criteria**: No plain/empty/broken or eye-catching designs
- **Turkish Language Support**: Full Turkish UI

## Global Constraints

- Framework: Astro v7 + React/Preact islands
- Deployment: Static site (Vercel/Netlify compatible)
- Content: 36 published tours, 6 tour categories
- Mobile-first responsive design
- WebP images with lazy loading
- WhatsApp integration: +66 82 895 0665

## Design Direction

### Color System (New)
- **Primary**: Navy (#0a1728 - lacivert)
- **Accent**: Terracotta (#e07a5f - kahverengi)
- **Background**: Cream (#f8f4e9 - açık krem)
- **Text**: Charcoal (#2b2b2b)
- **Accent Colors**: Gold (#f4a261), Sage Green (#8ac9a6)

### Typography
- **Display Headings**: Playfair Display (serif, elegant)
- **Body Text**: Manrope (clean sans-serif)
- **Accent**: Inter (for forms and UI)

### New Visual Style
- Clean, minimalist layout with ample whitespace
- Hero sections with full-width cinemagraph-style backgrounds
- Card-based layout with subtle shadows
- Micro-interactions on hover
- Scandinavian-inspired minimalism with Turkish hospitality feel

## Implementation Tasks

### Phase 1: Design System (Task 1-2)

**Task 1: CSS Variables & Global Styles**
- Create new design token system in `global.css`
- Define new color palette (cream/navy/terracotta)
- Update typography (Playfair Display + Manrope)
- Create CSS utilities for new components
- Maintain responsive breakpoints

**Task 2: Layout Component**
- Update `Layout.astro` with new semantic structure
- Add proper accessibility attributes
- Implement dark mode toggle capability
- Add smooth scroll behavior
- Update favicon references

### Phase 2: Header & Navigation (Task 3)

**Task 3: Header Component**
- Redesign `Header.astro` with new aesthetic
- Implement transparent-to-solid header on scroll
- Create modern dropdown menus with smooth animations
- Add mobile burger menu with slide-in animation
- Include prominent WhatsApp CTA button

### Phase 3: Homepage Components (Task 4-6)

**Task 4: Hero Section**
- Implement cinematic full-screen hero
- Add video background option with muted autoplay
- Create multilingual language toggle
- Add search/intent planner integration

**Task 5: Tour Catalog Section**
- Build featured tours carousel/grid
- Implement card animations on hover
- Add filter/sort functionality
- Create "view all" CTA with animation

**Task 6: Category Navigation**
- Redesign category tree navigation
- Implement hover-trigger dropdowns
- Add category hero images
- Create smooth scroll-to-section behavior

### Phase 4: Service Sections (Task 7-9)

**Task 7: Services Overview**
- Create 4-service grid (Pakeler, Oteller, Transferler, VIP)
- Implement hover-elevation effect
- Add category-specific animations
- Include "Book Now" primary CTAs

**Task 8: Experience Proofs Section**
- Redesign "Why Us" section
- Create split layout with images/text
- Add counter animations for metrics
- Implement fade-in on scroll

**Task 9: FAQ Section**
- Create collapsible FAQ with smooth animation
- Add search functionality
- Implement dark/light mode cards

### Phase 5: Booking & Inquiry (Task 10)

**Task 10: Intent Planner Widget**
- Redesign booking inquiry form
- Add date pickers with Turkish locale
- Implement price calculator
- Add WhatsApp integration with pre-filled message
- Create multi-step wizard UI

### Phase 6: Footer & Utilities (Task 11-12)

**Task 11: Footer Component**
- Create premium footer layout
- Add social media links
- Include quick links grid
- Implement newsletter subscription
- Add language selection

**Task 12: Floating WhatsApp Button**
- Create animated floating button
- Add hover tooltip
- Implement dark/light mode aware
- Add click-to-message with context

### Phase 7: Pages & Responsive (Task 13-14)

**Task 13: Category Pages**
- Redesign category landing pages
- Create hero banner with category image
- Implement sub-category filtering
- Add breadcrumb navigation

**Task 14: Tour Detail Pages**
- Redesign individual tour pages
- Implement image gallery carousel
- Create pricing table with calculator
- Add FAQ accordion
- Implement "Book Now" sticky button

### Phase 8: Animations & Micro-interactions (Task 15)

**Task 15: Animation System**
- Implement CSS animations for scroll reveals
- Add hover micro-interactions
- Create parallax effects
- Implement progress indicators
- Add smooth page transitions

### Phase 9: Testing & Optimization (Task 16-17)

**Task 16: Performance Testing**
- Audit page speed
- Optimize image loading
- Implement lazy loading for all images
- Add WebP optimization
- Test mobile performance

**Task 17: Accessibility Testing**
- Run accessibility audit
- Fix contrast issues
- Add missing alt text
- Implement keyboard navigation
- Add ARIA labels

## Files to Modify/Create

### CSS Files
- `src/styles/global.css` - Complete redesign
- `src/styles/animations.css` - New animation utilities

### Component Files (All will be rewritten)
- `src/layouts/Layout.astro`
- `src/components/Header.astro`
- `src/components/Footer.astro`
- `src/components/TourCard.astro`
- `src/components/CategoryNav.astro`
- `src/components/IntentPlanner.astro`
- `src/components/SceneExplorer.astro`
- `src/components/Marquee.astro`
- `src/components/PhotoStrip.astro`
- `src/components/FloatingWhatsApp.astro`

### Page Files
- `src/pages/index.astro`
- `src/pages/turlar/[slug].astro`
- `src/pages/tur-kategorisi/[category].astro`
- `src/pages/[service].astro`

### Utility Files
- `src/utils/animations.ts` - Animation helpers
- `src/utils/whatsapp.ts` - Updated WhatsApp integration

## Success Criteria

1. **Visual**: Clean premium aesthetic with cream/navy/terracotta palette
2. **Performance**: Lighthouse score >90 on mobile/desktop
3. **Accessibility**: WCAG 2.1 AA compliant
4. **Usability**: Clear navigation, prominent WhatsApp CTA
5. **Content**: All 36 tours and 6 categories properly displayed
6. **Mobile**: Fully responsive with touch-friendly interactions

## Implementation Notes

- All images should use WebP format with responsive breakpoints
- WhatsApp button must be visible on all screen sizes
- Color contrast must meet accessibility standards
- Loading states for all interactive elements
- Error handling for API/data fetching
- No JavaScript errors in console

## Execution Order

The tasks are designed to be executed in parallel where possible, with dependencies clearly marked:

1. Tasks 1-2: Independent (design system foundation)
2. Task 3: Depends on Task 2 (Layout)
3. Tasks 4-6: Independent after Task 3
4. Tasks 7-9: Independent after Task 5
5. Task 10: Depends on Task 5 (needs catalog integration)
6. Task 11-12: Independent
7. Tasks 13-14: Depends on Task 5 (catalog data)
8. Task 15: Can run in parallel, integrate after completion
9. Tasks 16-17: Final testing phase

## Rollback Plan

If any component causes issues, the rollback is:
1. Revert to previous working branch
2. Restore from git history
3. Re-implement with corrections

## Timeline Estimate

- Phase 1-3 (Design System + Header): 1-2 days
- Phase 4-6 (Homepage Components): 2-3 days
- Phase 7-9 (Service Sections): 1-2 days
- Phase 10-12 (Booking + Footer): 1 day
- Phase 13-14 (Pages): 1-2 days
- Phase 15 (Animations): 0.5 day
- Phase 16-17 (Testing): 0.5 day

**Total Estimated Time**: 7-12 days with multi-agent parallelism