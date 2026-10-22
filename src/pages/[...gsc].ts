import type { APIRoute } from 'astro';

export const prerender = false;

/**
 * Google Search Console ve Bing Webmaster Tools HTML dosya doğrulama rotası:
 * Örn: /google1234567890abcdef.html
 * Google crawler bu dosyayı kontrol ettiğinde 200 OK ve dosya içeriğini döner.
 */
export const GET: APIRoute = async ({ params }) => {
  const file = params.gsc || '';

  // Google HTML dosya doğrulaması: google[hex].html
  if (file.startsWith('google') && file.endsWith('.html')) {
    return new Response(`google-site-verification: ${file}`, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  }

  // Bing Webmaster dosya doğrulaması: BingSiteAuth.xml
  if (file === 'BingSiteAuth.xml') {
    return new Response(`<?xml version="1.0"?><users><user>PhuketTatiliBingAuth</user></users>`, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    });
  }

  return new Response('Not Found', { status: 404 });
};
