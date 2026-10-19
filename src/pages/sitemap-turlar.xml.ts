/**
 * Dinamik tur sitemap'i — SSR turları @astrojs/sitemap'in dışında kalıyor
 * (build sırasında statik rota listesinde değiller). Bu endpoint her istekte
 * güncel tur listesini .md koleksiyonundan + bulut CMS kaydından üretir.
 *
 * Google, robots.txt'te iki sitemap'i de işaretli görür:
 *   /sitemap-index.xml  → statik sayfalar
 *   /sitemap-turlar.xml → tur detay sayfaları (SSR)
 */
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = false;

export const GET: APIRoute = async () => {
  const tours = await getCollection('tours');
  const site = 'https://phukettatili.com';
  const now = new Date().toISOString();

  const urls = tours
    .map((tour) => {
      return `  <url>
    <loc>${site}/turlar/${tour.id}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    })
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
