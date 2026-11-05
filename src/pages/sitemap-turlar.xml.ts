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
import { getCloudTours, applyTourOverlay } from '../lib/server/tourContent';

export const prerender = false;

function escapeXml(str: string): string {
  return str.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
}

export const GET: APIRoute = async () => {
  const mdTours = await getCollection('tours');
  const cloudTours = await getCloudTours();
  const tours = applyTourOverlay(mdTours, cloudTours);
  const site = 'https://phukettatili.com';
  const today = new Date().toISOString().split('T')[0];

  const urls = tours
    .map((tour) => {
      const images: string[] = [];
      if (tour.data.image) {
        images.push(tour.data.image);
      }
      if (Array.isArray(tour.data.gallery)) {
        for (const img of tour.data.gallery) {
          if (typeof img === 'string' && img && !images.includes(img)) {
            images.push(img);
          }
        }
      }

      const imageTags = images
        .slice(0, 5)
        .map((img) => {
          const imgUrl = img.startsWith('http') ? img : `${site}/assets/${img}`;
          return `    <image:image>
      <image:loc>${escapeXml(imgUrl)}</image:loc>
      <image:title>${escapeXml(tour.data.title)}</image:title>
    </image:image>`;
        })
        .join('\n');

      return `  <url>
    <loc>${site}/turlar/${tour.id}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
${imageTags ? `${imageTags}\n` : ''}  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
