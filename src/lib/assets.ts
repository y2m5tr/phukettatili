/**
 * Görsel URL Çözümleyici (Asset & Cloud URL Resolver)
 *
 * Yerel dosya adı ("bay.webp"), mutlak yol ("/assets/bay.webp"),
 * bulut depolama URL'si ("https://...supabase.co/...") ve base64 ("data:image/...")
 * görsel formatlarını güvenli ve tutarlı bir şekilde çözer.
 */

export const DEFAULT_HERO_IMAGE = '/assets/phuket_hero.webp';

/**
 * Görsel yolunu <img> src ve lightbox için çözer.
 */
export function resolveAssetUrl(
  img?: string | null,
  fallback = DEFAULT_HERO_IMAGE
): string {
  if (!img) return fallback;
  const trimmed = img.trim();
  if (!trimmed) return fallback;
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('/')
  ) {
    return trimmed;
  }
  return `/assets/${trimmed}`;
}

/**
 * OpenGraph ve Schema.org için mutlak URL üretir.
 * Not: data: URL'leri dış platformlarca çekilemediği için fallback görseline yönlendirilir.
 */
export function resolveOgImageUrl(
  img?: string | null,
  siteUrl: string | URL = 'https://phukettatili.com',
  fallback = DEFAULT_HERO_IMAGE
): string {
  const base = typeof siteUrl === 'string' ? siteUrl : siteUrl.toString();
  if (!img) return new URL(fallback, base).toString();
  const trimmed = img.trim();
  if (!trimmed || trimmed.startsWith('data:')) {
    return new URL(fallback, base).toString();
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  if (trimmed.startsWith('/')) {
    return new URL(trimmed, base).toString();
  }
  return new URL(`/assets/${trimmed}`, base).toString();
}

/**
 * Yerel asset için responsive srcset üretir.
 *
 * `scripts/generate-responsive-images.mjs` her geniş görselin 640px varyantını
 * `ad-640.webp` olarak üretir; bu yardımcı o varyantı tanıyor ise
 * "…, ad-640.webp 640w" biçiminde srcset döndürür, tanımıyorsa undefined
 * verir (çağıran taraf srcset'i hiç basmaz — davranış değişimi sıfır).
 *
 * Bulut/data URL'leri ve panel galerisinden gelen dinamik görseller için
 * hep undefined döner: varyantın varlığından emin olamadığımız kaynaklarda
 * sadece orijinal dosya sunulur.
 */
const RESPONSIVE_VARIANTS = import.meta.glob<{ default: string }>(
  '/public/assets/*-640.webp',
  { eager: true, query: '?url', import: 'default' },
);
const responsiveWidths = new Set<string>();
for (const path of Object.keys(RESPONSIVE_VARIANTS)) {
  responsiveWidths.add(path.replace('/public', '').replace(/-640\.webp$/, '.webp'));
}

export function responsiveSrcset(img?: string | null): string | undefined {
  if (!img) return undefined;
  const resolved = resolveAssetUrl(img);
  if (!resolved.startsWith('/assets/')) return undefined;
  if (!responsiveWidths.has(resolved)) return undefined;
  return `${resolved} 1280w, ${resolved.replace(/\.webp$/, '-640.webp')} 640w`;
}
