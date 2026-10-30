/**
 * Phuket Tatili - UTM Kampanya ve Reklam İzleme Modülü
 *
 * Meta (Facebook/Instagram), Google ve TikTok reklamlarından gelen
 * ziyaretçilerin UTM parametrelerini oturum boyunca korur (sessionStorage).
 * WhatsApp lead tıklamalarına referans etiketi ekler ve analitik dönüşüm
 * ölçümünün (Meta Pixel & GA4) doğru kampanyayla eşleşmesini sağlar.
 */

export interface UtmCampaignData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  ref?: string;
  fbclid?: string;
  gclid?: string;
  landing_page?: string;
  captured_at?: number;
}

export const UTM_STORAGE_KEY = 'ptt_utm_campaign_data';

/**
 * URL query string'inden UTM ve reklam parametrelerini ayıklar.
 */
export function parseUtmParams(search: string, pathname = '/'): UtmCampaignData | null {
  if (!search || search === '?') return null;

  try {
    const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
    const utmSource = params.get('utm_source')?.trim();
    const utmMedium = params.get('utm_medium')?.trim();
    const utmCampaign = params.get('utm_campaign')?.trim();
    const utmContent = params.get('utm_content')?.trim();
    const utmTerm = params.get('utm_term')?.trim();
    const ref = (params.get('ref') || params.get('agent'))?.trim();
    const fbclid = params.get('fbclid')?.trim();
    const gclid = params.get('gclid')?.trim();

    // Reklam, UTM veya referans parametresi yoksa null dön
    if (!utmSource && !utmMedium && !utmCampaign && !utmContent && !fbclid && !gclid && !ref) {
      return null;
    }

    return {
      utm_source: utmSource || (fbclid ? 'meta_ad' : gclid ? 'google_ad' : ref ? 'partner_ref' : undefined),
      utm_medium: utmMedium || (fbclid ? 'cpc' : gclid ? 'cpc' : ref ? 'referral' : undefined),
      utm_campaign: utmCampaign || undefined,
      utm_content: utmContent || undefined,
      utm_term: utmTerm || undefined,
      ref: ref ? ref.toUpperCase() : undefined,
      fbclid: fbclid || undefined,
      gclid: gclid || undefined,
      landing_page: pathname,
      captured_at: Date.now(),
    };
  } catch {
    return null;
  }
}

/**
 * Mevcut oturumda saklanan UTM verisini döner.
 */
export function getStoredUtm(): UtmCampaignData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UtmCampaignData;
  } catch {
    return null;
  }
}

/**
 * UTM parametresini sessionStorage içine kaydeder.
 */
export function storeUtm(data: UtmCampaignData): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage kotası veya engeli durumunda sessiz kal
  }
}

/**
 * Sayfa yüklendiğinde URL'den UTM varsa hafızaya alır; yoksa mevcut olanı korur.
 */
export function syncUtmFromCurrentUrl(): UtmCampaignData | null {
  if (typeof window === 'undefined') return null;
  const currentUrlParams = parseUtmParams(window.location.search, window.location.pathname);
  if (currentUrlParams) {
    storeUtm(currentUrlParams);
    return currentUrlParams;
  }
  return getStoredUtm();
}

/**
 * WhatsApp mesajına veya satış ekibi ekranına eklenecek kısa referans metnini üretir.
 * Örnek: "[Ref: IG / phi-phi-deluxe]"
 */
export function formatCampaignRef(utm: UtmCampaignData | null): string {
  if (!utm) return '';

  if (utm.ref) {
    return `[Acente Ref: ${utm.ref}]`;
  }

  let sourceLabel = utm.utm_source || '';
  if (sourceLabel.toLowerCase().includes('instagram')) sourceLabel = 'IG';
  else if (sourceLabel.toLowerCase().includes('facebook')) sourceLabel = 'FB';
  else if (sourceLabel.toLowerCase().includes('meta')) sourceLabel = 'Meta';
  else if (sourceLabel.toLowerCase().includes('google')) sourceLabel = 'Google';
  else if (sourceLabel.toLowerCase().includes('tiktok')) sourceLabel = 'TikTok';

  const campaign = utm.utm_campaign || utm.utm_content || '';
  if (sourceLabel && campaign) {
    return `[Ref: ${sourceLabel}/${campaign}]`;
  }
  if (sourceLabel) {
    return `[Ref: ${sourceLabel}]`;
  }
  if (campaign) {
    return `[Ref: ${campaign}]`;
  }
  return '';
}

/**
 * WhatsApp linkinin (wa.me) mesaj metnine kampanya referansını ekler.
 */
export function enrichWhatsAppUrl(rawUrl: string, customUtm?: UtmCampaignData | null): string {
  if (!rawUrl) return rawUrl;
  const utm = customUtm !== undefined ? customUtm : getStoredUtm();
  const ref = formatCampaignRef(utm);
  if (!ref) return rawUrl;

  try {
    const url = new URL(rawUrl);
    const existingText = url.searchParams.get('text') || '';

    // Zaten referans eklenmişse tekrar ekleme
    if (existingText.includes('[Ref:') || existingText.includes('[Ref') || existingText.includes('%5BRef')) {
      return rawUrl;
    }

    const newText = existingText ? `${existingText.trim()} ${ref}` : ref;
    url.searchParams.set('text', newText);
    return url.toString();
  } catch {
    // URL parse hatası olursa regex/string fallback
    if (rawUrl.includes('text=')) {
      if (rawUrl.includes('%5BRef%3A') || rawUrl.includes('[Ref:')) return rawUrl;
      return `${rawUrl}%20${encodeURIComponent(ref)}`;
    }
    const sep = rawUrl.includes('?') ? '&' : '?';
    return `${rawUrl}${sep}text=${encodeURIComponent(ref)}`;
  }
}
