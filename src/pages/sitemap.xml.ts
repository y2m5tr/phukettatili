import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const tours = await getCollection('tours');
  const categories = await getCollection('categories');
  const services = await getCollection('services');

  const pages = [
    '',
    'turlar/',
    'gizlilik-ve-kosullar/',
    ...services.map((s: any) => `${s.data.slug}/`),
    ...categories.map((c: any) => `tur-kategorisi/${c.data.slug}/`),
    ...categories.flatMap((c: any) => c.data.children.map((child: any) => `tur-kategorisi/${child.slug}/`)),
    ...tours.map((t: any) => `turlar/${t.id.replace(/\.md$/, '')}/`),
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (page) => `  <url>
    <loc>https://phukettatili.netlify.app/${page}</loc>
    <changefreq>weekly</changefreq>
    <priority>${page === '' ? '1.0' : page.startsWith('turlar/') ? '0.8' : '0.7'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
