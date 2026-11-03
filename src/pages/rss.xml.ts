import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = false;

/**
 * Google ve arama motorları için anlık RSS 2.0 beslemesi.
 * Google Webmaster yönergeleri: "Sitemap tüm sayfaları listelerken,
 * RSS beslemesi en son eklenen güncellemelerin dakikalar içinde indekslenmesini sağlar."
 */
export const GET: APIRoute = async () => {
  const site = 'https://phukettatili.com';
  const posts = await getCollection('blog');
  const tours = await getCollection('tours');

  // Blog yazılarını tarihe göre sırala (en yeni en başta)
  const sortedPosts = posts.sort((a, b) => {
    const dateA = a.data.date ? new Date(a.data.date).getTime() : 0;
    const dateB = b.data.date ? new Date(b.data.date).getTime() : 0;
    return dateB - dateA;
  });

  const now = new Date().toUTCString();

  const blogItems = sortedPosts.slice(0, 20).map((post) => {
    const pubDate = post.data.date ? new Date(post.data.date).toUTCString() : now;
    return `    <item>
      <title><![CDATA[${post.data.title}]]></title>
      <link>${site}/blog/${post.id}/</link>
      <guid isPermaLink="true">${site}/blog/${post.id}/</guid>
      <description><![CDATA[${post.data.excerpt || post.data.title}]]></description>
      <pubDate>${pubDate}</pubDate>
      <category>Phuket Gezi Rehberi</category>
    </item>`;
  }).join('\n');

  const tourItems = tours.slice(0, 15).map((tour) => {
    return `    <item>
      <title><![CDATA[${tour.data.title}]]></title>
      <link>${site}/turlar/${tour.id}/</link>
      <guid isPermaLink="true">${site}/turlar/${tour.id}/</guid>
      <description><![CDATA[${tour.data.excerpt || tour.data.title}]]></description>
      <pubDate>${now}</pubDate>
      <category>Phuket Turları</category>
    </item>`;
  }).join('\n');

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Phuket Tatili — Güncel Gezi Rehberi ve Turlar</title>
    <link>${site}/</link>
    <description>Phuket ada turları, balayı planlama, transfer ve yerel Türkçe gezi rehberleri.</description>
    <language>tr</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${site}/rss.xml" rel="self" type="application/rss+xml"/>
${blogItems}
${tourItems}
  </channel>
</rss>`;

  return new Response(rssXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=1800',
    },
  });
};
