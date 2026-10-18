/**
 * CMS Apply Script - Panel verisini gercek icerik dosyalarina yazar.
 *
 * Kullanim:
 *   1. Yonetim panelinde (/admin) Turlar sekmesi > "Site Verisi Indir (JSON)"
 *      butonuna basin -> phuket-cms-data.json iner.
 *   2. Dosyayi proje kokune kopyalayin ve calistirin:
 *      npx tsx scripts/apply-cms.ts phuket-cms-data.json
 *   3. Script tour/faq/testimonial dosyalarini gunceller.
 *   4. git add + commit + push -> Vercel rebuild -> site guncellenir.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

interface CmsTour {
  id: string;
  title: string;
  category: string;
  categoryLabel: string;
  priceThb: number;
  duration: string;
  featured: boolean;
  image: string;
  excerpt?: string;
  gallery?: string[];
}

interface CmsData {
  tours: CmsTour[];
  faqs?: { question: string; answer: string }[];
  testimonials?: { name: string; type: string; tour: string; stars: number; text: string }[];
}

const root = process.cwd();
const dataPath = process.argv[2] || 'phuket-cms-data.json';

if (!existsSync(dataPath)) {
  console.error('X Veri dosyasi bulunamadi: ' + dataPath);
  process.exit(1);
}

const data: CmsData = JSON.parse(readFileSync(dataPath, 'utf-8'));
let updated = 0;
let created = 0;

for (const tour of data.tours || []) {
  const filePath = join(root, 'src/content/tours', tour.id + '.md');

  if (existsSync(filePath)) {
    let content = readFileSync(filePath, 'utf-8');

    const galleryBlock =
      tour.gallery && tour.gallery.length > 0
        ? 'gallery:\n' + tour.gallery.map((g) => '  - "' + g + '"').join('\n')
        : null;

    if (galleryBlock) {
      if (/^gallery:.*$/m.test(content)) {
        content = content.replace(/^gallery:\n((?:  - "[^"]*"\n?)*)/m, galleryBlock + '\n');
      } else {
        content = content.replace(/^(image:\s*"[^"]*")$/m, '$1\n' + galleryBlock);
      }
    }

    const fields: [string, unknown][] = [
      ['title', tour.title],
      ['category', tour.category],
      ['category_label', tour.categoryLabel],
      ['price_thb', tour.priceThb],
      ['duration', tour.duration],
      ['image', tour.image],
    ];
    if (tour.excerpt) fields.push(['excerpt', tour.excerpt]);

    for (const [field, value] of fields) {
      if (value === undefined || value === null) continue;
      const raw = typeof value === 'number' ? String(value) : '"' + String(value).replace(/"/g, '\\"') + '"';
      const regex = new RegExp('^' + field + ':.*$', 'm');
      if (regex.test(content)) {
        content = content.replace(regex, field + ': ' + raw);
      }
    }

    content = content.replace(/^featured:.*$/m, 'featured: ' + tour.featured);

    writeFileSync(filePath, content);
    updated++;
  } else {
    const fm = [
      '---',
      'title: "' + tour.title.replace(/"/g, '\\"') + '"',
      'category: "' + tour.category + '"',
      'category_label: "' + tour.categoryLabel + '"',
      'excerpt: ' + (tour.excerpt ? '"' + tour.excerpt.replace(/"/g, '\\"') + '"' : '""'),
      'image: "' + tour.image + '"',
    ];
    if (tour.gallery && tour.gallery.length > 0) {
      fm.push('gallery:');
      for (const g of tour.gallery) fm.push('  - "' + g + '"');
    }
    fm.push(
      'price_type: ' + (tour.priceThb > 0 ? 'fixed' : 'quote'),
      'price_thb: ' + tour.priceThb,
      'duration: "' + tour.duration + '"',
      'included: []',
      'excluded: []',
      'program: []',
      'featured: ' + tour.featured,
      'order: 100',
      '---',
      '',
      '> Bu tur yonetim panelinden olusturuldu. Detayli aciklama metnini buraya ekleyin.',
      ''
    );
    writeFileSync(filePath, fm.join('\n'));
    created++;
  }
}

if (data.faqs && data.faqs.length > 0) {
  writeFileSync(join(root, 'src/content/settings/faq.json'), JSON.stringify({ faq: data.faqs }, null, 2) + '\n');
  updated++;
  console.log('- faq.json guncellendi');
}

if (data.testimonials && data.testimonials.length > 0) {
  writeFileSync(join(root, 'src/content/settings/testimonials.json'), JSON.stringify({ testimonials: data.testimonials }, null, 2) + '\n');
  updated++;
  console.log('- testimonials.json guncellendi');
}

console.log('\n- Tamamlandi: ' + updated + ' dosya guncellendi, ' + created + ' yeni tur olusturuldu.');
console.log('  Simdi: git add -A && git commit -m "cms: panel verisi uygulandi" && git push');
