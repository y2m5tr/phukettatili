/**
 * Anasayfa ayarlarının HALKA AÇIK okuma ucu — sunucu tarafı.
 *
 * SORUN BU MODÜLÜN ÇÖZDÜĞÜ: Yönetim paneli "Anasayfa Modül & Metin Yönetimi"
 * ekranındaki bölüm görünürlüğünü (sections) ve metinleri `home-settings`
 * koleksiyonuna (Supabase content_store) yazar. Ancak `src/pages/index.astro`
 * eskiden yalnızca derleme zamanında gömülen `src/content/pages/home.json`'u
 * okuyordu. Sonuç: panelde "Gizli" yapılan bölümler sayfada görünmeye devam
 * ediyordu. Bu modül panelin yazdığı kaydı istek anında getirir.
 *
 * GÜVENLİK: `getSupabaseAdmin()` servis rolü anahtarı taşır ve bu dosya
 * YALNIZCA SSR frontmatter'ından import edilebilir (index.astro, prerender =
 * false). Bir client island'ına sızmamalıdır — Astro frontmatter kodu istemci
 * bundle'ına girmez; build sonrası sızıntı taraması bunu doğrular.
 * Okunan veri zaten halka açık içeriktir (anasayfada gösterilen metinler),
 * yani sızması riskli bir alan içermez; yine de servis anahtarı tarayıcıya
 * inmemelidir.
 *
 * DAYANIKLILIK: Bulut erişilemezse / anahtar tanımsızsa / kayıt yoksa `null`
 * döner. Çağıran taraf `home.json` ile devam eder — anasayfa hiçbir durumda
 * kırılmaz veya boş kalmaz.
 */
import { getSupabaseAdmin, isSupabaseAdminConfigured } from './supabaseAdmin';

/** Bölüm görünürlük haritası — `false` gizli, `true`/yok görünür. */
export type HomeSections = Record<string, boolean>;

/** Panelden yazılan anasayfa ayarları (kısmi; alanlar home.json'u ezer). */
export interface HomeSettingsOverlay {
  sections?: HomeSections;
  [key: string]: unknown;
}

/**
 * Anasayfanın panelden yönetilen TÜM içerik anahtarları. Dördü de aynı
 * `content_store` tablosunda yaşar ve tek sorguda birlikte çekilir: anasayfa
 * sitenin en çok istenen sayfası, dört ayrı veritabanı gidiş-dönüşü
 * gereksiz gecikme üretirdi.
 *
 * - `home-settings`  → bölüm görünürlüğü + bölüm metinleri (nesne)
 * - `site-settings`  → Ayarlar sekmesi: WhatsApp, e-posta, hero, üst bar (nesne)
 * - `testimonials`   → Misafir Yorumları listesi (dizi)
 * - `faqs`           → Sıkça Sorulan Sorular listesi (dizi)
 */
export const HOME_CONTENT_KEYS = [
  'home-settings',
  'site-settings',
  'testimonials',
  'faqs',
] as const;

/** Panelden okunan anasayfa içeriği. `null` = bulutta o anahtar için kayıt yok. */
export interface PublicHomeContent {
  homeSettings: HomeSettingsOverlay | null;
  siteSettings: Record<string, unknown> | null;
  testimonials: unknown[] | null;
  faqs: unknown[] | null;
}

const EMPTY_CONTENT: PublicHomeContent = {
  homeSettings: null,
  siteSettings: null,
  testimonials: null,
  faqs: null,
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Kısa ömürlü bellek içi önbellek. Anasayfa sitenin en çok istenen sayfası;
 * her istekte Supabase'e gitmek gereksiz gecikme ve yük üretir. 30 saniyelik
 * bayatlama, paneldeki değişikliğin canlıya yansımasını neredeyse anlık
 * tutarken veritabanı yükünü sabitler.
 *
 * Not: serverless ortamda her instance kendi önbelleğini tutar; bu kabul
 * edilir (içerik verisi için 30 sn bayatlama zararsızdır).
 */
const CACHE_TTL_MS = 30_000;
let cachedContent: PublicHomeContent = EMPTY_CONTENT;
let hasCache = false;
let cachedAt = 0;

/** Önbelleği testler ve zorunlu tazeleme için sıfırlar. */
export function clearHomeSettingsCache(): void {
  cachedContent = EMPTY_CONTENT;
  hasCache = false;
  cachedAt = 0;
}

/**
 * Anasayfanın panelden yönetilen içeriğini Supabase'den okur (tek sorgu).
 * Herhangi bir başarısızlıkta sessizce önbellektekine (hiç yoksa boş kayda)
 * döner — çağıran taraf statik JSON'larla devam eder, anasayfa kırılmaz.
 *
 * Beklenmeyen tipteki satırlar yok sayılır: panel bozuk bir kayıt yazarsa
 * sayfanın çökmesi yerine o bölümün derleme zamanı içeriği kullanılır.
 */
export async function getPublicHomeContent(
  now: number = Date.now(),
): Promise<PublicHomeContent> {
  if (hasCache && now - cachedAt < CACHE_TTL_MS) {
    return cachedContent;
  }

  if (!isSupabaseAdminConfigured()) return cachedContent;
  const db = getSupabaseAdmin();
  if (!db) return cachedContent;

  try {
    const { data, error } = await db
      .from('content_store')
      .select('key, data')
      .in('key', [...HOME_CONTENT_KEYS]);

    if (error) return cachedContent;

    const next: PublicHomeContent = { ...EMPTY_CONTENT };
    for (const row of data ?? []) {
      switch (row.key) {
        case 'home-settings':
          next.homeSettings = isPlainObject(row.data)
            ? (row.data as HomeSettingsOverlay)
            : null;
          break;
        case 'site-settings':
          next.siteSettings = isPlainObject(row.data) ? row.data : null;
          break;
        case 'testimonials':
          next.testimonials = Array.isArray(row.data) ? row.data : null;
          break;
        case 'faqs':
          next.faqs = Array.isArray(row.data) ? row.data : null;
          break;
      }
    }

    // Kayıt yoksa da önbelleği doldur (negatif cache): panel henüz hiç
    // kaydetmemişse her istekte veritabanına gitmeyiz.
    cachedContent = next;
    hasCache = true;
    cachedAt = now;
    return cachedContent;
  } catch {
    // Ağ/DB hatası — anasayfa statik içerikle yayında kalmaya devam eder.
    return cachedContent;
  }
}

/**
 * Yalnızca `home-settings` kaydını döner — bölüm görünürlüğü ve bölüm
 * metinleri. `getPublicHomeContent` ile aynı önbelleği paylaşır.
 */
export async function getPublicHomeSettings(
  now: number = Date.now(),
): Promise<HomeSettingsOverlay | null> {
  return (await getPublicHomeContent(now)).homeSettings;
}

/**
 * home.json tabanını panelin yazdığı kayıtla birleştirir.
 *
 * Kurallar:
 * - `sections` anahtar anahtar birleştirilir (panel yalnızca bazı bölümleri
 *   kaydetmiş olsa bile diğerleri tabandaki değerini korur).
 * - Diğer tüm alanlarda (metinler, görseller, listeler) panel kaydı kazanır;
 *   panel o alanı hiç yazmamışsa taban değeri kalır.
 * - Overlay `null` ise taban olduğu gibi döner.
 *
 * Saf fonksiyon: Supabase'e dokunmaz, test edilebilir.
 */
export function mergeHomeSettings<T extends object>(
  base: T,
  overlay: HomeSettingsOverlay | null,
): T {
  if (!overlay || typeof overlay !== 'object') return base;

  const baseSections = (base as { sections?: HomeSections }).sections;
  const overlaySections = overlay.sections;
  const sections: HomeSections = { ...(baseSections ?? {}), ...(overlaySections ?? {}) };

  return { ...base, ...overlay, sections } as T;
}

/**
 * Ayarlar sekmesinin (site-settings) site.json tabanını panel kaydıyla ezer.
 * `home-settings`'ten farklıdır: burada `sections` gibi iç içe birleştirilecek
 * bir yapı yoktur, alanlar düz ezmeyle geçer. Overlay `null` veya bozuksa taban
 * olduğu gibi döner — Ayarlar hiç kaydedilmemişse site.json geçerlidir.
 *
 * Saf fonksiyon: Supabase'e dokunmaz, test edilebilir.
 */
export function mergeSiteSettings<T extends object>(
  base: T,
  overlay: Record<string, unknown> | null,
): T {
  if (!overlay || typeof overlay !== 'object' || Array.isArray(overlay)) return base;
  return { ...base, ...overlay } as T;
}

/**
 * Panelin kaydettiği listeyi (testimonials / faqs) statik JSON tabanıyla
 * birleştirir. Liste koleksiyonları "tümünü değiştir" semantiğiyle çalışır:
 * panel bir öğe ekler/siler/düzenlerse kaydın tamamını gönderir, yani panel
 * kaydı varsa tabanın yerine geçer.
 *
 * Kurallar:
 * - Overlay `null` ise (bulut erişilemez veya kayıt yok) taban döner.
 * - Overlay dizi değilse bozuk kayıttır — taban korunur, sayfa çökmez.
 * - Overlay boş dizi ise panel listeyi bilerek boşaltmıştır; bu geçerli bir
 *   durumdur ve boş dizi döner (`null`'dan farklı).
 *
 * Saf fonksiyon: Supabase'e dokunmaz, test edilebilir.
 */
export function mergeListContent<T>(base: T[], overlay: unknown[] | null): T[] {
  if (overlay === null) return base;
  if (!Array.isArray(overlay)) return base;
  return overlay as T[];
}
