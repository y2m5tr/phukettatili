/**
 * CMS bulut senkronu — localStorage ile /api/content arasındaki köprü.
 *
 * YAZMA (saveCmsCollection):
 *   1. localStorage'a anında yazar (mevcut davranış — çevrimdışı/işlem
 *      hızında hiçbir gerileme yok, kaydet her zaman "hissedilir").
 *   2. /api/content'e PUT atar; hata olsa bile yerel kopya sağlamdır.
 *
 * OKUMA (loadCmsCollections):
 *   Panel açılışında buluttan çeker; bulut yoksa/boşsa localStorage'a
 *   düşer; o da yoksa initial verilere. Öncelik: bulut > yerel > initial.
 *
 * GÜVENLİK: bu modül yalnızca oturumlu yönetim panelinde kullanılır;
 * /api/content guardApi(context, 'admin') ile korunur.
 */

const API = '/api/content';

/** Beyaz listedeki koleksiyon anahtarları — API ile hizalı. */
export const CMS_COLLECTIONS = [
  'tours',
  'blogs',
  'services',
  'faqs',
  'testimonials',
  'media',
  'site-settings',
  'vehicles',
  'drivers',
  'payments',
  'agents',
  'suppliers',
  'tour-costs',
] as const;

export type CmsCollectionKey = (typeof CMS_COLLECTIONS)[number];

/** localStorage anahtarı — mevcut ptt_cms_* düzenini korur. */
export function cmsStorageKey(key: CmsCollectionKey): string {
  return `ptt_cms_${key}`;
}

export function readLocalCollection(key: CmsCollectionKey): unknown | null {
  try {
    const raw = window.localStorage.getItem(cmsStorageKey(key));
    return raw ? (JSON.parse(raw) as unknown) : null;
  } catch {
    return null;
  }
}

export function writeLocalCollection(key: CmsCollectionKey, data: unknown): void {
  try {
    window.localStorage.setItem(cmsStorageKey(key), JSON.stringify(data));
  } catch {
    // localStorage dolu/kapalı — bulut yazma yine denenir.
  }
}

/**
 * Koleksiyonu hem yerele hem buluta yazar.
 * Bulut yazımı yangın-and-forget'tir; sonucu döndürmez (UI beklemez).
 * Hata toast'u AdminDashboard'un showToast'una bırakılmak üzere
 * callback olarak verilir.
 */
export function saveCmsCollection(
  key: CmsCollectionKey,
  data: unknown,
  onCloudError?: (message: string) => void
): void {
  writeLocalCollection(key, data);

  void fetch(API, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, data }),
  })
    .then(async (res) => {
      if (!res.ok) {
        // 401/403: oturum düşmüş; 413: koleksiyon limitin üstünde;
        // 502: DB hatası. Kullanıcı yerel kopyanın buluta taşınamadığını bilsin.
        onCloudError?.(res.status === 413
          ? 'CMS: koleksiyon bulut limitini (2 MiB) aşıyor — yerel kaydedildi.'
          : 'CMS: buluta kaydedilemedi (yerel kopya geçerli).');
      }
    })
    .catch(() => {
      onCloudError?.('CMS: buluta kaydedilemedi (ağ hatası) — yerel kopya geçerli.');
    });
}

export interface CmsCloudResult {
  /** Buluttan gelen koleksiyonlar (olmayan anahtarlar dahil değildir). */
  items: Partial<Record<CmsCollectionKey, unknown>>;
  /** Bulut okunamadıysa true (DB yok, ağ hatası vb.). */
  offline: boolean;
}

/** Tüm koleksiyonları buluttan çeker. Admin GET sınırsızdır. */
export async function loadCmsCollections(): Promise<CmsCloudResult> {
  try {
    const res = await fetch(API, { headers: { 'Cache-Control': 'no-cache' } });
    if (!res.ok) return { items: {}, offline: true };
    const body = (await res.json()) as { items?: Record<string, unknown> };
    const items: Partial<Record<CmsCollectionKey, unknown>> = {};
    for (const [k, v] of Object.entries(body.items ?? {})) {
      if ((CMS_COLLECTIONS as readonly string[]).includes(k)) {
        items[k as CmsCollectionKey] = v;
      }
    }
    return { items, offline: false };
  } catch {
    return { items: {}, offline: true };
  }
}
