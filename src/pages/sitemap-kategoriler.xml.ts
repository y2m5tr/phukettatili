/**
 * Dinamik kategori sitemap'i — `tur-kategorisi/[category].astro` SSR'a
 * geçince (panel tur overlay'i) @astrojs/sitemap bu rotaları sayamaz oldu:
 * `[category]` parametrik ve `prerender = false`, yani build sırasında
 * route listesi yok. Eskiden statik sitemap'te 27 kategori URL'i vardı.
 *
 * Bu endpoint her istekte üst + alt kategorileri .md/.json koleksiyonundan
 * üretir. Google robots.txt'te dört sitemap'i de işaretli görür:
 *   /sitemap-index.xml       → statik sayfalar (+ /turlar/ listesi)
 *   /sitemap-turlar.xml      → tur detay sayfaları (SSR)
 *   /sitemap-blog.xml        → blog yazı detayları (SSR)
 *   /sitemap-kategoriler.xml → tur kategori sayfaları (SSR)
 *
 * Not: kategoriler `src/content/categories/*.json` dosyalarından gelir ve
 * panelden yönetilmez; bu yüzden lastmod sabit `now` değil, build anındaki
 * değerdir (içerik değişmediği sürece aynı kalır).
 */
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { getCloudCategories, applyCategoryOverlay } from '../lib/server/categoryContent';

export const prerender = false;

export const GET: APIRoute = async () => {
  const mdCategories = await getCollection('categories');
  const cloudCategories = await getCloudCategories();
  const categories = applyCategoryOverlay(mdCategories, cloudCategories);
  const site = 'https://phukettatili.com';

  const slugs: string[] = [];
  for (const cat of categories) {
    slugs.push(cat.data.slug);
    for (const child of cat.data.children || []) {
      slugs.push(child.slug);
    }
  }

  const urls = slugs
    .map(
      (slug) => `  <url>
    <loc>${site}/tur-kategorisi/${slug}/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`,
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
