import { describe, expect, it } from 'vitest';
import {
  generateMetaCatalogXml,
  generateMetaCatalogCsv,
  type CatalogTourItem,
} from '../src/lib/marketing/metaCatalog';

describe('Meta Commerce & Google Merchant Catalog Generator', () => {
  const sampleTours: CatalogTourItem[] = [
    {
      id: 'phi-phi-maya-ve-bamboo-adasi',
      title: 'Phi Phi & Maya Bay Deluxe Turu',
      excerpt: 'Sürat teknesi ile Maya Bay, Pileh Lagoon ve Bamboo Adası keşfi.',
      category: 'island-tours',
      category_label: 'Ada Turları',
      image: 'couple.webp',
      price_thb: 2800,
      featured: true,
    },
    {
      id: 'james-bond-adasi',
      title: 'James Bond & Phang Nga Kano Turu',
      excerpt: 'Kireçtaşı adalar & gizli lagünler.',
      category: 'island-tours',
      category_label: 'Ada Turları',
      image: 'bay.webp',
      price_thb: 2400,
      featured: false,
    },
  ];

  it('standart XML RSS 2.0 formatında g: etiketleriyle katalog üretmeli', () => {
    const xml = generateMetaCatalogXml(sampleTours, 'https://phukettatili.com');

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">');
    expect(xml).toContain('<g:id>phi-phi-maya-ve-bamboo-adasi</g:id>');
    expect(xml).toContain('<g:title>Phi Phi &amp; Maya Bay Deluxe Turu</g:title>');
    expect(xml).toContain('<g:price>2800 THB</g:price>');
    expect(xml).toContain('<g:link>https://phukettatili.com/turlar/phi-phi-maya-ve-bamboo-adasi</g:link>');
    expect(xml).toContain('<g:image_link>https://phukettatili.com/assets/couple.webp</g:image_link>');
    expect(xml).toContain('<g:brand>Phuket Tatili</g:brand>');
    expect(xml).toContain('<g:availability>in stock</g:availability>');
    expect(xml).toContain('<g:custom_label_1>Featured</g:custom_label_1>');
    expect(xml).toContain('<g:custom_label_1>Standard</g:custom_label_1>');
  });

  it('Meta Commerce Manager için uyumlu CSV katalog üretmeli', () => {
    const csv = generateMetaCatalogCsv(sampleTours, 'https://phukettatili.com');
    const lines = csv.split('\n');

    expect(lines[0]).toBe('id,title,description,availability,condition,price,link,image_link,brand,google_product_category,custom_label_0,custom_label_1');
    expect(lines.length).toBe(3); // 1 header + 2 items
    expect(lines[1]).toContain('phi-phi-maya-ve-bamboo-adasi');
    expect(lines[1]).toContain('2800 THB');
    expect(lines[1]).toContain('Phuket Tatili');
  });
});
