/**
 * Tur içeriğinin HALKA AÇIK okuma ucu — sunucu tarafı.
 *
 * SORUN BU MODÜLÜN ÇÖZDÜĞÜ: Yönetim paneli Turlar ekranı `tours`
 * koleksiyonunu (Supabase content_store) yazar. Tur DETAY sayfası
 * (`turlar/[id].astro`) bu kaydı okuyordu ama LİSTE sayfaları
 * (`turlar/index.astro`, `tur-kategorisi/[category].astro`) ve anasayfadaki
 * öne çıkan turlar `prerender = true` + statik `.md` koleksiyonuna
 * sabitlenmişti. Sonuç: panelde fiyat/başlık değişince detayda görünüyor,
 * listede görünmüyordu — aynı tur için iki farklı fiyat.
 *
 * Bu modül overlay'i TEK yerde tanımlar; detay ve liste sayfaları aynı
 * alan kümesini uygular, böylece tutarlılık yapısal olarak garanti edilir.
 *
 * SINIR: Panelin `TourItem` tipinde GÖVDE alanı (`body`) vardır ama tur
 * gövdeleri `.md` dosyalarında yaşar ve `render(entry)` ile üretilir. Bu
 * yüzden `.md` dosyası olmayan cloud kayıtları YOK SAYILIR: detay sayfası
 * gövdeyi render edemez, listede göstermek kırık linke yol açar.
 *
 * GÜVENLİK: `getSupabaseAdmin()` servis rolü anahtarı taşır; bu dosya
 * YALNIZCA SSR frontmatter'ından import edilebilir (prerender = false).
 *
 * DAYANIKLILIK: Bulut erişilemezse / kayıt yoksa `null` döner. Çağıran
 * taraf `.md` koleksiyonuyla devam eder — sayfa kırılmaz.
 */
import { getSupabaseAdmin, isSupabaseAdminConfigured } from './supabaseAdmin';

/** Panelin `tours` koleksiyonuna yazdığı bir tur kaydının şekli. */
export interface TourOverlayItem {
  id: string;
  slug?: string;
  title?: string;
  category?: string;
  categoryLabel?: string;
  excerpt?: string;
  image?: string;
  gallery?: string[];
  priceThb?: number;
  duration?: string;
  featured?: boolean;
  included?: string[];
  excluded?: string[];
  program?: string[];
  programImages?: (string | string[])[];
  faq?: { q: string; a: string }[];
  restrictions?: string[];
  [key: string]: unknown;
}

/**
 * Overlay uygulanabilecek minimal tur kaydı. `CollectionEntry<'tours'>` bu
 * şekli kapsar; generic tutulması modülün `astro:content` sanal modülüne
 * bağımlı olmadan test edilebilmesini sağlar.
 */
export interface TourEntryLike {
  id: string;
  data: Record<string, unknown>;
}

/**
 * Kısa ömürlü bellek içi önbellek — `homeSettings`/`blogContent` ile aynı
 * gerekçe: liste sayfaları ve her detay isteği Supabase'e gitmesin.
 * Negatif cache: panel tur kaydetmemişse de her istekte DB'ye gidilmez.
 */
const CACHE_TTL_MS = 30_000;
let cachedTours: TourOverlayItem[] | null = null;
let hasCache = false;
let cachedAt = 0;

/** Önbelleği testler ve zorunlu tazeleme için sıfırlar. */
export function clearTourCache(): void {
  cachedTours = null;
  hasCache = false;
  cachedAt = 0;
}

/**
 * `tours` koleksiyonunu Supabase'den okur. Başarısızlıkta sessizce
 * önbellektekine (hiç yoksa `null`'a) döner — sayfalar `.md` ile devam eder.
 */
export async function getCloudTours(
  now: number = Date.now(),
): Promise<TourOverlayItem[] | null> {
  if (hasCache && now - cachedAt < CACHE_TTL_MS) {
    return cachedTours;
  }

  if (!isSupabaseAdminConfigured()) return cachedTours;
  const db = getSupabaseAdmin();
  if (!db) return cachedTours;

  try {
    const { data, error } = await db
      .from('content_store')
      .select('data')
      .eq('key', 'tours')
      .maybeSingle();

    if (error) return cachedTours;

    const raw = (data?.data as unknown) ?? null;
    cachedTours = Array.isArray(raw) ? (raw as TourOverlayItem[]) : null;
    hasCache = true;
    cachedAt = now;
    return cachedTours;
  } catch {
    return cachedTours;
  }
}

/** Overlay listesini id/slug anahtarlı indeks haritasına çevirir. */
function buildOverlayIndex(overlay: TourOverlayItem[]): Map<string, TourOverlayItem> {
  const byKey = new Map<string, TourOverlayItem>();
  for (const item of overlay) {
    if (!item || typeof item !== 'object') continue;
    if (typeof item.id === 'string' && item.id) byKey.set(item.id, item);
    if (typeof item.slug === 'string' && item.slug) byKey.set(item.slug, item);
  }
  return byKey;
}

/** Boş olmayan string dizi ise kabul et (panel boş liste gönderirse taban kalır). */
function nonEmptyStringArray(value: unknown): string[] | null {
  if (Array.isArray(value) && value.length > 0 && value.every((v) => typeof v === 'string')) {
    return value as string[];
  }
  return null;
}

function normalizeProgramImages(value: unknown): (string | string[])[] | null {
  if (!Array.isArray(value)) return null;
  return value.map((item) => {
    if (typeof item === 'string') return item;
    if (Array.isArray(item) && item.every((image) => typeof image === 'string')) return item;
    return '';
  });
}

/**
 * Cloud kaydının alanlarını `.md` frontmatter isimlerine çevirir.
 * Panel `priceThb`/`categoryLabel`/`programImages` kullanır; koleksiyon
 * şeması `price_thb`/`category_label`/`program_images` bekler.
 *
 * Yalnızca DOĞRULANMIŞ değerler yazılır: bozuk tip (ör. string fiyat) veya
 * boş liste tabanı ezmez. `price_type` fiyatla birlikte türetilir ki detay
 * sayfası "fiyat sor" / sabit fiyat ayrımını tutarlı göstersin.
 */
function overlayOnto(
  data: Record<string, unknown>,
  cloud: TourOverlayItem,
): Record<string, unknown> {
  const next: Record<string, unknown> = { ...data };

  if (typeof cloud.title === 'string' && cloud.title) next.title = cloud.title;
  if (typeof cloud.category === 'string' && cloud.category) next.category = cloud.category;
  if (typeof cloud.categoryLabel === 'string' && cloud.categoryLabel) {
    next.category_label = cloud.categoryLabel;
  }
  if (typeof cloud.excerpt === 'string') next.excerpt = cloud.excerpt;
  if (typeof cloud.image === 'string' && cloud.image) next.image = cloud.image;
  if (typeof cloud.duration === 'string' && cloud.duration) next.duration = cloud.duration;
  if (typeof cloud.featured === 'boolean') next.featured = cloud.featured;

  if (typeof cloud.priceThb === 'number' && Number.isFinite(cloud.priceThb)) {
    next.price_thb = cloud.priceThb;
    next.price_type = cloud.priceThb > 0 ? 'fixed' : 'quote';
  }

  const gallery = nonEmptyStringArray(cloud.gallery);
  if (gallery) next.gallery = gallery;

  const included = nonEmptyStringArray(cloud.included);
  if (included) next.included = included;

  const excluded = nonEmptyStringArray(cloud.excluded);
  if (excluded) next.excluded = excluded;

  const program = nonEmptyStringArray(cloud.program);
  if (program) next.program = program;

  const programImages = normalizeProgramImages(cloud.programImages ?? cloud.program_images);
  if (programImages) next.program_images = programImages;

  const restrictions = nonEmptyStringArray(cloud.restrictions);
  if (restrictions) next.restrictions = restrictions;

  if (Array.isArray(cloud.faq) && cloud.faq.length > 0) {
    const faq = cloud.faq.filter(
      (f): f is { q: string; a: string } =>
        !!f && typeof f === 'object' && typeof f.q === 'string' && typeof f.a === 'string',
    );
    if (faq.length > 0) next.faq = faq;
  }

  return next;
}

/**
 * `.md` koleksiyonunu (taban) panelin bulut kaydıyla (overlay) birleştirir.
 *
 * Kurallar:
 * - Her tur için cloud'da `id` (veya `slug`) eşleşen kayıt bulunur; bulunan
 *   alanlar frontmatter'ın üzerine yazılır. Gövde (`body`) korunur.
 * - Cloud'da olmayan turlar taban haliyle kalır.
 * - `.md` dosyası olmayan cloud kayıtları yok sayılır (bkz. dosya başı SINIR).
 * - `overlay` null/boş/bozuksa taban olduğu gibi döner (sayfa çökmez).
 *
 * Saf fonksiyon: Supabase'e dokunmaz, girdiyi mutasyona uğratmaz.
 */
export function applyTourOverlay<T extends TourEntryLike>(
  tours: T[],
  overlay: TourOverlayItem[] | null,
): T[] {
  if (!Array.isArray(tours)) return tours;
  if (!overlay || !Array.isArray(overlay) || overlay.length === 0) return tours;

  const byKey = buildOverlayIndex(overlay);

  return tours.map((tour) => {
    const cloud = byKey.get(tour.id);
    if (!cloud) return tour;
    return { ...tour, data: overlayOnto(tour.data, cloud) } as T;
  });
}

/**
 * TEK bir entry'nin frontmatter'ını yerinde (in-place) ezer.
 *
 * Neden `applyTourOverlay` yerine bu: detay sayfası gövdeyi `render(entry)`
 * ile üretir; render, entry'nin iç `body`/loader alanlarını ister. Yeni obje
 * üretmek bu alanları düşürür, o yüzden detay sayfasında entry mutasyonla
 * güncellenir. Liste sayfaları (gövde render etmez) saf `applyTourOverlay`'i
 * kullanır.
 */
export function applyTourOverlayToEntry(
  tour: TourEntryLike,
  overlay: TourOverlayItem[] | null,
): void {
  if (!tour || typeof tour !== 'object' || !tour.data) return;
  if (!overlay || !Array.isArray(overlay) || overlay.length === 0) return;

  const cloud = buildOverlayIndex(overlay).get(tour.id);
  if (!cloud) return;

  Object.assign(tour.data, overlayOnto(tour.data, cloud));
}
