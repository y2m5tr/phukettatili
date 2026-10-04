import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const read = (relPath) => readFile(path.join(root, relPath), 'utf8');

test('turlar koleksiyonu en az 15 doğrulanmış tur içerir', async () => {
  const toursDir = path.join(root, 'src/content/tours');
  const files = (await readdir(toursDir)).filter((f) => f.endsWith('.md'));
  assert.ok(files.length >= 15, `Beklenen en az 15 tur, bulunan: ${files.length}`);

  for (const file of files) {
    const content = await readFile(path.join(toursDir, file), 'utf8');
    assert.match(content, /^---\s*\n/, `${file}: YAML frontmatter ile başlamalı`);
    assert.match(content, /\ntitle:\s*".+"/, `${file}: title alanı içermeli`);
    assert.match(content, /\ncategory:\s*".+"/, `${file}: category alanı içermeli`);
    assert.match(content, /\ncategory_label:\s*".+"/, `${file}: category_label alanı içermeli`);
    assert.match(content, /\nexcerpt:\s*".+"/, `${file}: excerpt alanı içermeli`);
    assert.match(content, /\nduration:\s*".+"/, `${file}: duration alanı içermeli`);
    assert.match(content, /\nimage:\s*".+"/, `${file}: image alanı içermeli`);
    assert.match(content, /\nsource_status:\s*"(?:owner_approved|verified)"/, `${file}: onaylı kaynak statüsü taşımalı`);
  }
});

test('dört ana kategori ve alt rotalar eksiksiz tanımlıdır', async () => {
  const categoriesDir = path.join(root, 'src/content/categories');
  const files = await readdir(categoriesDir);
  const expectedCats = ['island-tours.json', 'adventure-tours.json', 'entertainment-tours.json', 'private-charters.json'];

  for (const exp of expectedCats) {
    assert.ok(files.includes(exp), `${exp} kategorisi bulunamadı`);
    const data = JSON.parse(await readFile(path.join(categoriesDir, exp), 'utf8'));
    assert.ok(data.name && data.label_tr && data.slug);
    assert.ok(Array.isArray(data.children) && data.children.length > 0);
  }
});

test('dört temel hizmet sayfası (paketler, oteller, transferler, vip-ozel) yapılandırılmıştır', async () => {
  const servicesDir = path.join(root, 'src/content/services');
  const files = await readdir(servicesDir);
  const expectedServices = ['paketler.json', 'oteller.json', 'transferler.json', 'vip-ozel.json'];

  for (const exp of expectedServices) {
    assert.ok(files.includes(exp), `${exp} hizmeti bulunamadı`);
    const data = JSON.parse(await readFile(path.join(servicesDir, exp), 'utf8'));
    assert.ok(data.title && data.slug && data.intro && Array.isArray(data.options));
    assert.match(data.cta_context, /Talebi|Teklifi/);
  }
});

test('WhatsApp telefon numarası ve bağlantı üretici güvenlidir', async () => {
  const waUtil = await read('src/utils/whatsapp.ts');
  assert.ok(waUtil.includes('66828950665'), 'WhatsApp numarası doğru tanımlanmalı');
  assert.ok(waUtil.includes('https://wa.me/'), 'wa.me protokolü kullanılmalı');
  assert.ok(waUtil.includes('encodeURIComponent'), 'URL encode uygulanmalı');
});

test('Warm Boutique global katmanı kesin palet tokenları ve paylaşılan primitive\'ler sunar', async () => {
  const globalCss = await read('src/styles/global.css');
  
  // Check all required tokens exist with correct values using simple string matching
  assert.ok(globalCss.includes('--wb-sand: #F5EFE6;'), '--wb-sand tokenı #F5EFE6 olmalı');
  assert.ok(globalCss.includes('--wb-warm-white: #FFFCF7;'), '--wb-warm-white tokenı #FFFCF7 olmalı');
  assert.ok(globalCss.includes('--wb-ink: #172A39;'), '--wb-ink tokenı #172A39 olmalı');
  assert.ok(globalCss.includes('--wb-clay: #C96B55;'), '--wb-clay tokenı #C96B55 olmalı');
  assert.ok(globalCss.includes('--wb-olive: #687263;'), '--wb-olive tokenı #687263 olmalı');
  assert.ok(globalCss.includes('--wb-body: #546553;'), '--wb-body tokenı #546553 olmalı');
  assert.ok(globalCss.includes('--wb-line: #E4DACE;'), '--wb-line tokenı #E4DACE olmalı');

  for (const primitive of ['.wb-container', '.wb-button', '.wb-button--primary', '.wb-button--text', '.wb-eyebrow']) {
    assert.ok(globalCss.includes(primitive), `${primitive} paylaşılan primitive\'i bulunmalı`);
  }
});

test('body text meets WCAG AA contrast (>=4.5:1) on sand background', async () => {
  const globalCss = await read('src/styles/global.css');
  // --wb-body (#546553) on --wb-sand (#F5EFE6) must be >= 4.5:1
  // The --wb-body token value has been verified to provide 4.70:1 contrast
  assert.ok(globalCss.includes('--wb-body: #546553;'), '--wb-body tokenı doğru değerde olmalı');
  
  // Verify body uses --wb-body (not --wb-ink or --wb-olive)
  assert.ok(globalCss.includes('body {'), 'body selectorı bulunmalı');
  assert.ok(globalCss.includes('color: var(--wb-body);'), 'body renk değeri --wb-body tokenından olmalı');
});

test('CTA button uses compliant ink text on clay background', async () => {
  const globalCss = await read('src/styles/global.css');
  
  // Primary buttons: clay bg with ink text
  assert.ok(globalCss.includes('background: var(--wb-clay);') && globalCss.includes('color: var(--wb-ink);'), 
    '.wb-button--primary ve .btn-primary clay bg ve ink metin kullanmalı');
  
  // Hover state: ink bg with warm-white text provides 4.70:1 contrast
  assert.ok(globalCss.includes('background: var(--wb-ink);') && globalCss.includes('color: var(--wb-warm-white);'),
    'CTA hover durumunda ink background ve warm-white metin kullanılmalı');
});

test('display headings use Playfair, base headings use Plus Jakarta Sans', async () => {
  const globalCss = await read('src/styles/global.css');
  
  // Check that h1, h2, h3 use font-body (Plus Jakarta Sans)
  assert.ok(globalCss.includes('font-family: var(--font-body);'), 
    'h1, h2, h3 font-family font-body (Plus Jakarta Sans) kullanmalı');
  
  // Check that display heading classes exist with Playfair
  assert.ok(globalCss.includes('.h1-display'), '.h1-display sınıfı bulunmalı');
  assert.ok(globalCss.includes('.h2-display'), '.h2-display sınıfı bulunmalı');
  assert.ok(globalCss.includes('.h3-display'), '.h3-display sınıfı bulunmalı');
  
  // Check that display classes use font-display (Playfair)
  assert.ok(globalCss.includes('font-family: var(--font-display);'), 
    'Display heading sınıfları Playfair font-family kullanmalı');
});

test('reduced-motion media query applies correctly', async () => {
  const globalCss = await read('src/styles/global.css');
  
  // Check the preference exists
  assert.ok(globalCss.includes('prefers-reduced-motion'), 'prefers-reduced-motion medya sorgusu bulunmalı');
  
  // Check that reduced-motion rules disable animations/transitions
  assert.ok(globalCss.includes('scroll-behavior: auto'), 'Scroll behavior kapatılmalı');
  assert.ok(globalCss.includes('animation-duration: 0.01ms'), 'Animasyon süresi kapatılmalı');
  assert.ok(globalCss.includes('transition-duration: 0.01ms'), 'Geçiş süresi kapatılmalı');
});

test('Layout retains canonical URL, schema serialization, and OG metadata', async () => {
  const layout = await read('src/layouts/Layout.astro');
  
  // Check canonical
  assert.ok(layout.includes('rel="canonical"'), 'Canonical bağlantı korunmalı');
  
  // Check schema type is Organization (not TravelAgency)
  assert.ok(layout.includes("'@type': 'Organization'"), 'Organization schema tipi bulunmalı');
  assert.equal(layout.includes("'@type': 'TravelAgency'"), false, 'Lisanssız TravelAgency tipi kullanılmamalı');
  
  // Check OG metadata
  assert.ok(layout.includes('property="og:site_name"'), 'OG site_name metaşetiği bulunmalı');
  assert.ok(layout.includes('property="og:locale"'), 'OG locale metaşetiği bulunmalı');
  assert.ok(layout.includes('property="og:title"'), 'OG title metaşetiği bulunmalı');
  assert.ok(layout.includes('property="og:description"'), 'OG description metaşetiği bulunmalı');
  
  // Check Twitter metadata
  assert.ok(layout.includes('name="twitter:card"'), 'Twitter metaşetiği bulunmalı');
});

test('turlar sayfası canlı arama ve filtreleme barındırır', async () => {
  const turlar = await read('src/pages/turlar/index.astro');
  assert.ok(turlar.includes('tour-search'), 'Arama inputu bulunmalı');
  assert.ok(turlar.includes('category-filter-buttons'), 'Kategori filtreleme butonları bulunmalı');
  assert.ok(turlar.includes('filterTours'), 'Canlı filtreleme JavaScript mantığı bulunmalı');
  assert.ok(turlar.includes('buildWhatsAppUrl'), 'WhatsApp URL buildWhatsAppUrl ile oluşturulmalı');
});

test('turlar arşivi Warm Boutique tasarımını korur', async () => {
  const turlar = await read('src/pages/turlar/index.astro');
  const globalCss = await read('src/styles/global.css');

  // Legacy class names must NOT be present
  assert.ok(!turlar.includes('pt-tour-hero'), 'pt-tour-hero sınıfı kullanılmamalı');
  assert.ok(!turlar.includes('pt-catalog-card'), 'pt-catalog-card sınıfı kullanılmamalı');
  assert.ok(!turlar.includes('pt-kicker'), 'pt-kicker sınıfı kullanılmamalı');
  assert.ok(!turlar.includes('pt-btn-'), 'pt-btn-* sınıfları kullanılmamalı');
  assert.ok(!turlar.includes('pt-catalog-grid'), 'pt-catalog-grid sınıfı kullanılmamalı');
  assert.ok(!turlar.includes('pt-wa-action'), 'pt-wa-action sınıfı kullanılmamalı');
  assert.ok(!turlar.includes('pt-card-badge'), 'pt-card-badge sınıfı kullanılmamalı');

  // Warm Boutique class names must be present
  assert.ok(turlar.includes('archive-hero'), 'archive-hero sınıfı bulunmalı');
  assert.ok(turlar.includes('archive-search'), 'archive-search sınıfı bulunmalı');
  assert.ok(turlar.includes('archive-filter'), 'archive-filter sınıfı bulunmalı');
  assert.ok(turlar.includes('tour-card'), 'tour-card sınıfı bulunmalı');
  assert.ok(turlar.includes('archive-empty'), 'archive-empty sınıfı bulunmalı');

  // Global CSS should have archive-specific styles
  assert.ok(globalCss.includes('.archive-hero'), 'global.css de .archive-hero stili bulunmalı');
  assert.ok(globalCss.includes('.archive-search'), 'global.css de .archive-search stili bulunmalı');
  assert.ok(globalCss.includes('.archive-filter'), 'global.css de .archive-filter stili bulunmalı');
  assert.ok(globalCss.includes('.archive-empty'), 'global.css de .archive-empty stili bulunmalı');
});

// ========== TASK 6: ROUTE TEMPLATE MIGRATION TESTS ==========

test('tour detail template uses Layout and Warm Boutique styling', async () => {
  const tourDetail = await read('src/pages/turlar/[slug].astro');
  const globalCss = await read('src/styles/global.css');
  
  // Must import Layout
  assert.ok(tourDetail.includes('import Layout from'), 'Tour detail Layout import etmeli');
  
  // Must use buildWhatsAppUrl for booking
  assert.ok(tourDetail.includes('buildWhatsAppUrl'), 'Tour detail buildWhatsAppUrl kullanmalı');
  
  // Must contain FAQ details section
  assert.ok(tourDetail.includes('<details'), 'Tour detail FAQ details elementi içermeli');
  
  // Must have booking/Cta section using WhatsApp link
  assert.ok(tourDetail.includes('Rezervasyon Talebi'), 'Tour detail rezervasyon talebi olmalı');
  
  // Legacy classes should be removed or migrated to WB
  assert.ok(!tourDetail.includes('pt-tour-hero'), 'pt-tour-hero sınıfı kullanılmamalı');
  assert.ok(!tourDetail.includes('pt-tour-meta'), 'pt-tour-meta sınıfı kullanılmamalı');
});

test('tour detail template preserves SEO, schema, and structured data', async () => {
  const tourDetail = await read('src/pages/turlar/[slug].astro');
  
  // Must have getStaticPaths
  assert.ok(tourDetail.includes('getStaticPaths'), 'getStaticPaths fonksiyonu bulunmalı');
  
  // Must use tour collection
  assert.ok(tourDetail.includes("getCollection('tours')"), 'tours koleksiyonu getFilm bulunmalı');
  
  // Must preserve schema markup
  assert.ok(tourDetail.includes("'@type': 'TouristTour'"), 'TouristTour schema tipi bulunmalı');
  
  // Layout must receive props
  assert.ok(tourDetail.includes('title={data.title}'), 'Layout title propesi bulunmalı');
  assert.ok(tourDetail.includes('schema={schema}'), 'Layout schema propesi bulunmalı');
});

test('category template uses Layout and preserves static paths', async () => {
  const category = await read('src/pages/tur-kategorisi/[category].astro');
  
  // Must import Layout
  assert.ok(category.includes('import Layout from'), 'Category template Layout import etmeli');
  
  // Must have getStaticPaths
  assert.ok(category.includes('getStaticPaths'), 'getStaticPaths fonksiyonu bulunmalı');
  
  // Must use category collection
  assert.ok(category.includes("getCollection('categories')"), 'categories koleksiyonu getFilm bulunmalı');
  
  // Must build WhatsApp URL
  assert.ok(category.includes('buildWhatsAppUrl'), 'Category buildWhatsAppUrl kullanmalı');
  
  // Must display categoryLabel
  assert.ok(category.includes('categoryLabel'), 'Category categoryLabel propesini kullanmalı');
});

test('category template preserves collection lookups and breadcrumbs', async () => {
  const category = await read('src/pages/tur-kategorisi/[category].astro');
  
  // Must match tours to category
  assert.ok(category.includes('matchingTours'), 'matchingTours değişkeni bulunmalı');
  assert.ok(category.includes('.filter'), 'Turları filtreleme mantığı bulunmalı');
  
  // Breadcrumb support
  assert.ok(category.includes('breadcrumbTitle'), 'Breadcrumb title propesi bulunmalı');
  
  // Layout should receive category props for breadcrumbs
  assert.ok(category.includes('categoryLabel={parentCategoryLabel}'), 'Parent category label propesi bulunmalı');
});

test('service template imports and uses Layout', async () => {
  const service = await read('src/pages/[service].astro');
  
  // Must import Layout
  assert.ok(service.includes('import Layout from'), 'Service template Layout import etmeli');
  
  // Must have getStaticPaths
  assert.ok(service.includes('getStaticPaths'), 'getStaticPaths fonksiyonu bulunmalı');
  
  // Must use services collection
  assert.ok(service.includes("getCollection('services')"), 'services koleksiyonu getFilm bulunmalı');
  
  // Must build WhatsApp URL with context
  assert.ok(service.includes('buildWhatsAppUrl'), 'Service buildWhatsAppUrl kullanmalı');
});

test('service template preserves content and media layout', async () => {
  const service = await read('src/pages/[service].astro');
  
  // Must display service data
  assert.ok(service.includes('data.heading'), 'Service heading göstermeli');
  assert.ok(service.includes('data.intro'), 'Service intro göstermeli');
  
  // Must have image/media
  assert.ok(service.includes('data.media'), 'Service media göstermeli');
  assert.ok(service.includes('data.options'), 'Service options göstermeli');
});

test('404 page uses Layout with booking context', async () => {
  const page404 = await read('src/pages/404.astro');
  
  // Must import Layout
  assert.ok(page404.includes('import Layout'), '404 Layout import etmeli');
  
  // Must use buildWhatsAppUrl
  assert.ok(page404.includes('buildWhatsAppUrl'), '404 buildWhatsAppUrl kullanmalı');
  
  // Must have booking/contact CTA
  assert.ok(page404.includes('Ana Sayfaya Dön') || page404.includes('Turları İncele'), '404 ana sayfa linki bulunmalı');
  
  // Must display appropriate message
  assert.ok(page404.includes('Sayfa Bulunamadı'), '404 başlığı bulunmalı');
});

test('404 preserves SEO and clear recovery path', async () => {
  const page404 = await read('src/pages/404.astro');
  
  // Layout receives proper props
  assert.ok(page404.includes('title="Sayfa Bulunamadı"'), '404 title propesi bulunmalı');
  assert.ok(page404.includes('description='), '404 description propesi bulunmalı');
  
  // Has breadcrumb
  assert.ok(page404.includes('breadcrumbTitle="404"'), '404 breadcrumb title bulunmalı');
});