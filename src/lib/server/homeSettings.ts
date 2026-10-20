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
 * Kısa ömürlü bellek içi önbellek. Anasayfa sitenin en çok istenen sayfası;
 * her istekte Supabase'e gitmek gereksiz gecikme ve yük üretir. 30 saniyelik
 * bayatlama, paneldeki değişikliğin canlıya yansımasını neredeyse anlık
 * tutarken veritabanı yükünü sabitler.
 *
 * Not: serverless ortamda her instance kendi önbelleğini tutar; bu kabul
 * edilir (içerik verisi için 30 sn bayatlama zararsızdır).
 */
const CACHE_TTL_MS = 30_000;
let cachedOverlay: HomeSettingsOverlay | null = null;
let hasCache = false;
let cachedAt = 0;

/** Önbelleği testler ve zorunlu tazeleme için sıfırlar. */
export function clearHomeSettingsCache(): void {
  cachedOverlay = null;
  hasCache = false;
  cachedAt = 0;
}

/**
 * `home-settings` koleksiyonunu Supabase'den okur.
 * Herhangi bir başarısızlıkta sessizce önbellektekine (veya `null`'a) döner —
 * çağıran taraf home.json ile devam eder, anasayfa kırılmaz.
 */
export async function getPublicHomeSettings(
  now: number = Date.now(),
): Promise<HomeSettingsOverlay | null> {
  if (hasCache && now - cachedAt < CACHE_TTL_MS) {
    return cachedOverlay;
  }

  if (!isSupabaseAdminConfigured()) return cachedOverlay;
  const db = getSupabaseAdmin();
  if (!db) return cachedOverlay;

  try {
    const { data, error } = await db
      .from('content_store')
      .select('data')
      .eq('key', 'home-settings')
      .maybeSingle();

    if (error) return cachedOverlay;

    // Kayıt yoksa da önbelleği doldur (negatif cache): panel henüz hiç
    // kaydetmemişse her istekte veritabanına gitmeyiz.
    cachedOverlay = (data?.data as HomeSettingsOverlay | null) ?? null;
    hasCache = true;
    cachedAt = now;
    return cachedOverlay;
  } catch {
    // Ağ/DB hatası — anasayfa statik içerikle yayında kalmaya devam eder.
    return cachedOverlay;
  }
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
