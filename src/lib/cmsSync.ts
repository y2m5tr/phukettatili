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

import { safeGet, safeSet } from './safeStorage';

const API = '/api/content';

/** Beyaz listedeki koleksiyon anahtarları — API ile hizalı. */
export const CMS_COLLECTIONS = [
  'tours',
  'categories',
  'blogs',
  'services',
  'faqs',
  'testimonials',
  'media',
  'site-settings',
  'home-settings',
  'vehicles',
  'drivers',
  'payments',
  'agents',
  'suppliers',
  'tour-costs',
  // Ortak iş ve saha operasyon kayıtları (Madde 5)
  'expenses',
  'virmans',
  'driver-expenses',
  'guide-expenses',
  'proposals',
  'lost-found',
  'luggage',
] as const;

export type CmsCollectionKey = (typeof CMS_COLLECTIONS)[number];

/** Eski yerel depolama anahtarları ile geriye dönük uyumluluk eşlemesi */
const LEGACY_STORAGE_KEYS: Partial<Record<CmsCollectionKey, string>> = {
  expenses: 'phuket_tatili_crm_expenses_v1',
  virmans: 'phuket_tatili_crm_virmans_v1',
  'driver-expenses': 'phuket_driver_expenses_v1',
  'guide-expenses': 'phuket_guide_expenses_v1',
  proposals: 'phuket_tatili_proposals_v1',
  'lost-found': 'phuket_tatili_lost_found_v1',
  luggage: 'phuket_tatili_luggage_v1',
};

/** localStorage anahtarı — mevcut ptt_cms_* düzenini korur. */
export function cmsStorageKey(key: CmsCollectionKey): string {
  return `ptt_cms_${key}`;
}

export function readLocalCollection<T = unknown>(key: CmsCollectionKey, fallback: T | null = null): T | null {
  const primary = safeGet<T | null>(cmsStorageKey(key), null);
  if (primary !== null) return primary;

  const legacyKey = LEGACY_STORAGE_KEYS[key];
  if (legacyKey) {
    const legacyVal = safeGet<T | null>(legacyKey, null);
    if (legacyVal !== null) return legacyVal;
  }
  return fallback;
}

export function writeLocalCollection(key: CmsCollectionKey, data: unknown): void {
  safeSet(cmsStorageKey(key), data);
  const legacyKey = LEGACY_STORAGE_KEYS[key];
  if (legacyKey) {
    safeSet(legacyKey, data);
  }
}

/**
 * Koleksiyonu hem yerele (hata korumalı safeSet ile) hem buluta yazar.
 * Eşzamanlı değişiklik kontrolü için expectedUpdatedAt destekler.
 */
export async function saveCmsCollection(
  key: CmsCollectionKey,
  data: unknown,
  onCloudError?: (message: string) => void,
  options?: { expectedUpdatedAt?: string; force?: boolean }
): Promise<{ ok: boolean; status?: number; error?: string }> {
  writeLocalCollection(key, data);

  try {
    const res = await fetch(API, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key,
        data,
        expectedUpdatedAt: options?.expectedUpdatedAt,
        force: options?.force,
      }),
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      const errMsg =
        body?.error ||
        (res.status === 413
          ? 'CMS: koleksiyon bulut limitini (2 MiB) aşıyor — yerel kaydedildi.'
          : res.status === 409
          ? `⚠️ Çakışma: "${key}" başka bir kullanıcı tarafından daha yeni güncellenmiş.`
          : 'CMS: buluta kaydedilemedi (yerel kopya geçerli).');

      onCloudError?.(errMsg);
      return { ok: false, status: res.status, error: errMsg };
    }
    return { ok: true, status: 200 };
  } catch {
    const netErr = 'CMS: buluta kaydedilemedi (ağ hatası) — yerel kopya geçerli.';
    onCloudError?.(netErr);
    return { ok: false, error: netErr };
  }
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
