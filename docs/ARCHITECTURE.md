# Architecture Overview

## Technology Stack

### Core
- **Framework:** Astro v7 (Static Site Generation)
- **Language:** TypeScript
- **Styling:** Pure CSS with Design Tokens
- **Content:** Content Collections with Zod validation

### Build Tools
- **Package Manager:** npm
- **TypeScript Compiler:** tsc
- **Code Formatter:** Prettier
- **Type Checker:** @astrojs/check

## Project Structure

```
PhuketTatili2/
├── public/               # Static assets
│   ├── assets/          # Images (WebP)
│   └── robots.txt       # SEO
├── src/
│   ├── components/      # Reusable UI components
│   ├── content/         # Content Collections
│   │   ├── tours/       # Tour markdown files
│   │   ├── categories/  # Category JSON files
│   │   └── services/    # Service JSON files
│   ├── layouts/         # Page layouts
│   ├── pages/           # File-based routing
│   ├── styles/          # Global CSS
│   ├── utils/           # Helper functions
│   ├── content.config.ts # Zod schemas
│   └── env.ts           # Environment variables
├── tests/               # Test files
└── docs/                # Documentation
```

## Data Flow

### Content Collections

1. **Tours** (`src/content/tours/*.md`)
   - Markdown frontmatter + body
   - Zod validation
   - Type-safe queries

2. **Categories** (`src/content/categories/*.json`)
   - Hierarchical structure (parent/children)
   - Icon, description, hero image

3. **Services** (`src/content/services/*.json`)
   - Service pages (Packages, Hotels, Transfers, VIP)
   - CTA context and details

### Page Generation

```
Content Collections → Astro Pages → Static HTML
     ↓                    ↓              ↓
  Zod Schema       Type Safety    Optimized Build
```

## Key Features

### 1. Type Safety
- Zod schemas for all content
- TypeScript throughout
- Compile-time validation

### 2. SEO Optimization
- Meta tags (title, description)
- OpenGraph & Twitter Cards
- Schema.org JSON-LD (TouristTour)
- Sitemap generation
- robots.txt

### 3. Performance
- Static generation (zero server)
- WebP images with lazy loading
- CSS inlining
- HTML compression
- Asset optimization

### 4. Design System
- CSS custom properties (design tokens)
- Dark luxury theme
- Responsive breakpoints
- Consistent spacing/typography

### 5. WhatsApp Integration
- Pre-filled message URLs
- Context-aware CTAs
- Floating button

## Routing

### Static Routes
- `/` - Homepage
- `/turlar/` - All tours
- `/gizlilik-ve-kosullar/` - Legal page
- `/404/` - Not found

### Dynamic Routes
- `/turlar/[slug]/` - Individual tour pages
- `/tur-kategorisi/[category]/` - Category pages
- `/[service]/` - Service pages (paketler, oteller, transferler, vip-ozel)

## Build Process

```bash
npm run check    # TypeScript validation
     ↓
npm run build    # Astro build
     ↓
dist/            # Static output
```

### Build Output
- Optimized HTML files
- Inlined critical CSS
- Compressed assets
- Generated sitemap

## Content Management

### Adding a New Tour

1. Create `src/content/tours/tour-slug.md`
2. Add frontmatter with required fields
3. Write markdown content
4. Zod validates on build
5. Tour appears automatically

### Updating Categories

1. Edit `src/content/categories/*.json`
2. Maintain hierarchical structure
3. Update icon/images as needed
4. Rebuild site

## Performance Targets

- **Lighthouse Score:** 90+ (all metrics)
- **Core Web Vitals:**
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1
- **Bundle Size:** < 100KB initial JS

## Browser Support

- Modern browsers (last 2 versions)
- ES2020+ support
- CSS Grid & Flexbox
- WebP image format
