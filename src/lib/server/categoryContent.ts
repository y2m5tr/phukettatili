/**
 * Kategori içeriklerinin HALKA AÇIK okuma ucu — sunucu tarafı.
 *
 * Yönetim panelinden yeni kategori eklendiğinde veya kategoriler
 * düzenlendiğinde Supabase content_store ('categories' anahtarı) okunur.
 * Statik .json kategorileri üzerine bulut kaydı overlay edilir.
 *
 * Güvenlik: getSupabaseAdmin() yalnızca SSR ortamında çalışır.
 */
import { getSupabaseAdmin, isSupabaseAdminConfigured } from './supabaseAdmin';
import type { CategoryItem } from '../../data/adminTypes';

const CACHE_TTL_MS = 30_000;
let cachedCategories: CategoryItem[] | null = null;
let hasCache = false;
let cachedAt = 0;

export function clearCategoryCache(): void {
  cachedCategories = null;
  hasCache = false;
  cachedAt = 0;
}

export async function getCloudCategories(
  now: number = Date.now(),
): Promise<CategoryItem[] | null> {
  if (hasCache && now - cachedAt < CACHE_TTL_MS) {
    return cachedCategories;
  }

  if (!isSupabaseAdminConfigured()) return cachedCategories;
  const db = getSupabaseAdmin();
  if (!db) return cachedCategories;

  try {
    const { data, error } = await db
      .from('content_store')
      .select('data')
      .eq('key', 'categories')
      .maybeSingle();

    if (error) return cachedCategories;

    const raw = (data?.data as unknown) ?? null;
    cachedCategories = Array.isArray(raw) ? (raw as CategoryItem[]) : null;
    hasCache = true;
    cachedAt = now;
    return cachedCategories;
  } catch {
    return cachedCategories;
  }
}

/**
 * Statik koleksiyon kategorilerini bulut CMS kategorileriyle birleştirir.
 * Bulutta yeni eklenen kategoriler (ör. luks-katamaran) listeye eklenir,
 * mevcut kategorilerin ise başlık/sıra/açıklaması güncellenir.
 */
export function applyCategoryOverlay(
  mdCategories: any[],
  cloudCategories: CategoryItem[] | null,
): any[] {
  if (!cloudCategories || !Array.isArray(cloudCategories) || cloudCategories.length === 0) {
    return mdCategories;
  }

  const cloudMap = new Map<string, CategoryItem>();
  for (const c of cloudCategories) {
    if (c.slug) cloudMap.set(c.slug, c);
  }

  // 1. Mevcut statik kategorileri güncelle
  const merged = mdCategories.map((entry) => {
    const slug = entry.data?.slug || entry.slug;
    const cloud = cloudMap.get(slug);
    if (!cloud) return entry;

    return {
      ...entry,
      data: {
        ...entry.data,
        name: cloud.name || entry.data.name,
        label_tr: cloud.label_tr || entry.data.label_tr,
        icon: cloud.icon || entry.data.icon,
        description: cloud.description || entry.data.description,
        hero_image: cloud.hero_image || entry.data.hero_image,
        order: typeof cloud.order === 'number' ? cloud.order : entry.data.order,
        children: cloud.children || entry.data.children || [],
      },
    };
  });

  // 2. Yalnızca bulutta olan yeni eklenmiş kategorileri dahil et
  const existingSlugs = new Set(mdCategories.map((c) => c.data?.slug || c.slug));
  for (const c of cloudCategories) {
    if (c.slug && !existingSlugs.has(c.slug)) {
      merged.push({
        id: c.slug,
        slug: c.slug,
        data: {
          name: c.name || c.label_tr,
          label_tr: c.label_tr,
          slug: c.slug,
          icon: c.icon || '🏝️',
          short_desc: c.short_desc || '',
          description: c.description || '',
          hero_image: c.hero_image || 'phuket_hero.webp',
          order: typeof c.order === 'number' ? c.order : 100,
          children: c.children || [],
        },
      });
    }
  }

  return merged.sort(
    (a, b) => (Number(a.data?.order) || 999) - (Number(b.data?.order) || 999),
  );
}
