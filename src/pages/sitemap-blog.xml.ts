/**
 * Dinamik blog sitemap'i — blog YAZI detayları SSR'a geçince (panel metadata
 * overlay'i) @astrojs/sitemap'in dışında kaldı: `[id]` rotası build sırasında
 * sayılamaz. Bu endpoint her istekte güncel yazı listesini .md koleksiyonundan
 * üretir ve tarih bazlı lastmod verir.
 *
 * `/blog/` liste sayfası BURAYA DAHİL DEĞİL: parametresiz SSR rotaları
 * @astrojs/sitemap zaten statik sitemap'e yazıyor (`/turlar/` ile aynı
 * davranış). İki sitemap'te aynı URL'in geçmesi Google için gereksiz çift
 * kayıttır.
 *
 * Google, robots.txt'te üç sitemap'i de işaretli görür:
 *   /sitemap-index.xml  → statik sayfalar (+ /blog/ listesi)
 *   /sitemap-turlar.xml → tur detay sayfaları (SSR)
 *   /sitemap-blog.xml   → blog yazı detayları (SSR)
 *
 * Not: cloud-only (panelden eklenmiş ama .md'si olmayan) kayıtlar sitede
 * gösterilmediği için buraya da girmez — sitemap, erişilebilir URL'leri
 * listelemelidir.
 */
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

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
  const posts = await getCollection('blog');
  const site = 'https://phukettatili.com';
  const now = new Date().toISOString();

  const urls = posts
    .map((post) => {
      const lastmod = post.data.date
        ? new Date(post.data.date).toISOString()
        : now;

      let imageTag = '';
      if (post.data.cover_image) {
        const imgUrl = post.data.cover_image.startsWith('http')
          ? post.data.cover_image
          : `${site}/assets/${post.data.cover_image}`;
        imageTag = `\n    <image:image>
      <image:loc>${escapeXml(imgUrl)}</image:loc>
      <image:title>${escapeXml(post.data.title)}</image:title>
    </image:image>`;
      }

      return `  <url>
    <loc>${site}/blog/${post.id}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>${imageTag}
  </url>`;
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
