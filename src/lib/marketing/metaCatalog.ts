/**
 * Meta (Facebook / Instagram) & Google Merchant Center Ürün / Tur Kataloğu Üreticisi
 *
 * Meta Commerce Manager ve Dinamik Yeniden Pazarlama (Dynamic Retargeting)
 * reklamlarının turları otomatik çekebilmesi için standart RSS 2.0 / Google Merchant
 * formatında XML ve CSV katalog verisi üretir.
 */

import { resolveOgImageUrl } from '../assets';

export interface CatalogTourItem {
  id: string;
  title: string;
  excerpt?: string;
  category?: string;
  category_label?: string;
  image?: string | null;
  price_thb?: number | null;
  featured?: boolean;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function escapeCsvField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

/**
 * Meta / Google Merchant Center uyumlu RSS 2.0 XML çıktısı üretir.
 */
export function generateMetaCatalogXml(
  tours: CatalogTourItem[],
  baseUrl = 'https://phukettatili.com'
): string {
  const itemsXml = tours
    .map((tour) => {
      const tourUrl = `${baseUrl.replace(/\/$/, '')}/turlar/${tour.id}`;
      const imageUrl = resolveOgImageUrl(tour.image, baseUrl);
      const title = escapeXml(tour.title);
      const description = escapeXml(tour.excerpt || tour.title);
      const category = escapeXml(tour.category_label || tour.category || 'Ada Turları');
      const validPrice = Math.max(tour.price_thb || 0, 2300);
      const price = `${validPrice} THB`;
      const featuredLabel = tour.featured ? 'Featured' : 'Standard';

      return `    <item>
      <g:id>${escapeXml(tour.id)}</g:id>
      <g:title>${title}</g:title>
      <g:description>${description}</g:description>
      <g:link>${tourUrl}</g:link>
      <g:image_link>${imageUrl}</g:image_link>
      <g:brand>Phuket Tatili</g:brand>
      <g:condition>new</g:condition>
      <g:availability>in stock</g:availability>
      <g:price>${price}</g:price>
      <g:google_product_category>543598</g:google_product_category>
      <g:product_type>${category}</g:product_type>
      <g:custom_label_0>${category}</g:custom_label_0>
      <g:custom_label_1>${featuredLabel}</g:custom_label_1>
    </item>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Phuket Tatili - Turlar ve Deneyimler</title>
    <link>${baseUrl}</link>
    <description>Phuket'in en popüler ada turları, sürat teknesi turları ve havalimanı VIP transferleri</description>
${itemsXml}
  </channel>
</rss>`;
}

/**
 * Meta Commerce Manager CSV veri kaynağı çıktısı üretir.
 */
export function generateMetaCatalogCsv(
  tours: CatalogTourItem[],
  baseUrl = 'https://phukettatili.com'
): string {
  const headers = [
    'id',
    'title',
    'description',
    'availability',
    'condition',
    'price',
    'link',
    'image_link',
    'brand',
    'google_product_category',
    'custom_label_0',
    'custom_label_1',
  ];

  const rows = tours.map((tour) => {
    const tourUrl = `${baseUrl.replace(/\/$/, '')}/turlar/${tour.id}`;
    const imageUrl = resolveOgImageUrl(tour.image, baseUrl);
    const category = tour.category_label || tour.category || 'Ada Turları';
    const validPrice = Math.max(tour.price_thb || 0, 2300);
    const price = `${validPrice} THB`;
    const featured = tour.featured ? 'Featured' : 'Standard';

    return [
      escapeCsvField(tour.id),
      escapeCsvField(tour.title),
      escapeCsvField(tour.excerpt || tour.title),
      'in stock',
      'new',
      price,
      escapeCsvField(tourUrl),
      escapeCsvField(imageUrl),
      'Phuket Tatili',
      '543598',
      escapeCsvField(category),
      featured,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}
