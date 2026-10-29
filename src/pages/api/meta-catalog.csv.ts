import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { getCloudTours, applyTourOverlay } from '../../lib/server/tourContent';
import { generateMetaCatalogCsv } from '../../lib/marketing/metaCatalog';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  try {
    const mdTours = await getCollection('tours');
    const tours = applyTourOverlay(mdTours, await getCloudTours());
    const sortedTours = [...tours].sort((a, b) => a.data.order - b.data.order);

    const baseUrl = url.origin && !url.origin.includes('localhost') && !url.origin.includes('127.0.0.1')
      ? url.origin
      : 'https://phukettatili.com';
    const catalogItems = sortedTours.map((t) => ({
      id: t.id,
      title: t.data.title,
      excerpt: t.data.excerpt,
      category: t.data.category,
      category_label: t.data.category_label,
      image: t.data.image,
      price_thb: t.data.price_thb,
      featured: t.data.featured,
    }));

    const csv = generateMetaCatalogCsv(catalogItems, baseUrl);

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Bilinmeyen hata';
    return new Response(`error\n${message}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
};
