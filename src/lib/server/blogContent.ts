/**
 * Blog içeriğinin HALKA AÇIK okuma ucu — sunucu tarafı.
 *
 * SORUN BU MODÜLÜN ÇÖZDÜĞÜ: Blog sayfaları (`blog/index.astro`,
 * `blog/[id].astro`) eskiden `prerender = true` idi; yani derleme sırasında
 * `src/content/blog/*.md` dosyalarına sabitleniyordu. Yönetim paneli "Blog"
 * ekranında değiştirilen başlık/özet/kapak/tarih/yazar/öne-çıkan alanları
 * `blogs` koleksiyonuna (Supabase content_store) yazılıyor ama sayfalara
 * yansımıyordu — home/testimonials ile aynı kopukluk.
 *
 * SINIR: Panelin `BlogItem` tipinde GÖVDE alanı yoktur; makale gövdeleri
 * yalnızca `.md` dosyalarında yaşar ve `render(post)` ile üretilir. Bu yüzden
 * bu modül SADECE metadata'yı (frontmatter) ezer. `.md` dosyası olmayan yeni
 * bir panel yazısı burada görünmez: detay sayfası gövdeyi render edemez.
 * Yeni yazı eklemek hâlâ `.md` dosyası + deploy gerektirir.
 *
 * GÜVENLİK: `getSupabaseAdmin()` servis rolü anahtarı taşır ve bu dosya
 * YALNIZCA SSR frontmatter'ından import edilebilir (prerender = false).
 * Client island'ına sızmamalıdır; build sonrası sızıntı taraması doğrular.
 *
 * DAYANIKLILIK: Bulut erişilemezse / anahtar tanımsızsa / kayıt yoksa `null`
 * döner. Çağıran taraf `.md` koleksiyonuyla devam eder — sayfa kırılmaz.
 */
import { getSupabaseAdmin, isSupabaseAdminConfigured } from './supabaseAdmin';

/** Panelin `blogs` koleksiyonuna yazdığı bir blog kaydının şekli. */
export interface BlogOverlayItem {
  id: string;
  slug?: string;
  title?: string;
  excerpt?: string;
  cover_image?: string;
  date?: string;
  author?: string;
  featured?: boolean;
  related_tour?: string;
  [key: string]: unknown;
}

/**
 * Overlay uygulanabilecek minimal blog kaydı. `CollectionEntry<'blog'>` bu
 * şekli kapsar; tipin generic tutulması modülün `astro:content` sanal
 * modülüne bağımlı olmadan test edilebilmesini sağlar.
 */
export interface BlogPostLike {
  id: string;
  data: Record<string, unknown>;
}

/**
 * Kısa ömürlü bellek içi önbellek — `homeSettings` ile aynı gerekçe. Blog
 * listesi ve her detay sayfası isteği Supabase'e gitmesin diye 30 sn bayatlama.
 * Negatif cache: panel henüz blog kaydetmemişse de her istekte DB'ye gidilmez.
 */
const CACHE_TTL_MS = 30_000;
let cachedPosts: BlogOverlayItem[] | null = null;
let hasCache = false;
let cachedAt = 0;

/** Önbelleği testler ve zorunlu tazeleme için sıfırlar. */
export function clearBlogCache(): void {
  cachedPosts = null;
  hasCache = false;
  cachedAt = 0;
}

/**
 * `blogs` koleksiyonunu Supabase'den okur. Başarısızlıkta sessizce
 * önbellektekine (hiç yoksa `null`'a) döner — sayfalar `.md` ile devam eder.
 */
export async function getCloudBlogPosts(
  now: number = Date.now(),
): Promise<BlogOverlayItem[] | null> {
  if (hasCache && now - cachedAt < CACHE_TTL_MS) {
    return cachedPosts;
  }

  if (!isSupabaseAdminConfigured()) return cachedPosts;
  const db = getSupabaseAdmin();
  if (!db) return cachedPosts;

  try {
    const { data, error } = await db
      .from('content_store')
      .select('data')
      .eq('key', 'blogs')
      .maybeSingle();

    if (error) return cachedPosts;

    // Kayıt yoksa da önbelleği doldur (negatif cache).
    const raw = (data?.data as unknown) ?? null;
    cachedPosts = Array.isArray(raw) ? (raw as BlogOverlayItem[]) : null;
    hasCache = true;
    cachedAt = now;
    return cachedPosts;
  } catch {
    // Ağ/DB hatası — blog statik içerikle yayında kalmaya devam eder.
    return cachedPosts;
  }
}

/** Cloud `date` alanını `.md` tabanındaki `Date` tipiyle hizalar. */
function coerceDate(value: unknown): Date | null {
  if (value instanceof Date) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return null;
}

/** Overlay alanlarını `.md` frontmatter verisinin üzerine yazar. */
function overlayOnto(
  data: Record<string, unknown>,
  cloud: BlogOverlayItem,
): Record<string, unknown> {
  const next: Record<string, unknown> = { ...data };
  if (typeof cloud.title === 'string' && cloud.title) next.title = cloud.title;
  if (typeof cloud.excerpt === 'string') next.excerpt = cloud.excerpt;
  if (typeof cloud.cover_image === 'string' && cloud.cover_image) {
    next.cover_image = cloud.cover_image;
  }
  if (typeof cloud.author === 'string' && cloud.author) next.author = cloud.author;
  if (typeof cloud.featured === 'boolean') next.featured = cloud.featured;
  if (typeof cloud.related_tour === 'string') next.related_tour = cloud.related_tour;
  const date = coerceDate(cloud.date);
  if (date) next.date = date;
  return next;
}

/**
 * `.md` koleksiyonunu (taban) panelin bulut kaydıyla (overlay) birleştirir.
 *
 * Kurallar:
 * - Her post için cloud'da `id` (veya `slug`) eşleşen kayıt bulunur; bulunan
 *   alanlar post'un frontmatter'ının üzerine yazılır. Gövde (`body`) korunur.
 * - Cloud'da olmayan postlar taban haliyle kalır.
 * - `.md` dosyası olmayan cloud kayıtları YOK SAYILIR (turlar/[id] emsalindeki
 *   gibi): gövdesi olmayan bir yazının detay sayfası render edilemez, listede
 *   göstermek kırık sayfaya link vermek olur.
 * - `overlay` null/bozuksa taban olduğu gibi döner (sayfa çökmez).
 *
 * Saf fonksiyon: Supabase'e dokunmaz, test edilebilir. Girdi mutasyon yerine
 * yeni obje döndürür.
 */
export function applyBlogOverlay<T extends BlogPostLike>(
  posts: T[],
  overlay: BlogOverlayItem[] | null,
): T[] {
  if (!Array.isArray(posts)) return posts;
  if (!overlay || !Array.isArray(overlay) || overlay.length === 0) return posts;

  const byKey = buildOverlayIndex(overlay);

  return posts.map((post) => {
    const cloud = byKey.get(post.id);
    if (!cloud) return post;
    return { ...post, data: overlayOnto(post.data, cloud) } as T;
  });
}

/** Overlay listesini id/slug anahtarlı indeks haritasına çevirir. */
function buildOverlayIndex(overlay: BlogOverlayItem[]): Map<string, BlogOverlayItem> {
  const byKey = new Map<string, BlogOverlayItem>();
  for (const item of overlay) {
    if (!item || typeof item !== 'object') continue;
    if (typeof item.id === 'string' && item.id) byKey.set(item.id, item);
    if (typeof item.slug === 'string' && item.slug) byKey.set(item.slug, item);
  }
  return byKey;
}

/**
 * TEK bir entry'nin frontmatter'ını yerinde (in-place) ezer.
 *
 * Neden `applyBlogOverlay` yerine bu: detay sayfası gövdeyi
 * `render(entry)` ile üretir; render, entry'nin iç `body`/loader
 * alanlarını ister. Yeni obje üretmek bu alanları düşürür, o yüzden
 * detay sayfasında `turlar/[id].astro` emsalindeki gibi entry
 * mutasyonla güncellenir. Liste sayfaları (gövde render etmez) saf
 * `applyBlogOverlay`'i kullanır.
 */
export function applyBlogOverlayToEntry(
  post: BlogPostLike,
  overlay: BlogOverlayItem[] | null,
): void {
  if (!post || typeof post !== 'object' || !post.data) return;
  if (!overlay || !Array.isArray(overlay) || overlay.length === 0) return;

  const cloud = buildOverlayIndex(overlay).get(post.id);
  if (!cloud) return;

  Object.assign(post.data, overlayOnto(post.data, cloud));
}
