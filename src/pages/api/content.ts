/**
 * /api/content — yönetim paneli CMS koleksiyonlarının bulut ucu.
 *
 * MİMARİ: /api/bookings ile aynı desen — oturum cookie (guardApi) +
 * servis rolü anahtarı sunucuda + RLS default deny. localStorage'daki
 * ptt_cms_* anahtarları bu uç üzerinden kalıcı hale gelir.
 *
 * GÜVENLİK NOTLARI:
 * - Kayıt yalnızca admin oturumuna açıktır (field/ekip CMS'e yazamaz).
 * - Koleksiyon beyaz listesi dışındaki anahtarlar reddedilir.
 * - data alanı JSONB'dir; boyut limiti dev webp/base64 yüklemelerini
 *   ve kötü niyetli dev gövdeleri veritabanına yazılmasını engeller.
 * - Yanıt `Cache-Control: no-store`.
 * - Yazma sonrası payload'sız broadcast sinyali: açık paneller
 *   değişikliği görüp GET ile yeniden çeker.
 *
 * UÇLAR:
 *   GET    /api/content                -> { items: Record<string, unknown> } (tümü)
 *   GET    /api/content?key=tours      -> { data: unknown }
 *   PUT    /api/content                -> koleksiyonu yaz (gövde: { key, data })
 *   DELETE /api/content?key=tours      -> koleksiyonu sil (initial'e döner)
 */
import type { APIRoute } from 'astro';
import { guardApi, jsonError, jsonOk } from '../../lib/server/apiGuard';
import {
  getSupabaseAdmin,
  isSupabaseAdminConfigured,
  broadcastBookingsChanged,
} from '../../lib/server/supabaseAdmin';


/** Site yeniden insa tetikleyici — panel CMS degisikligi canli sayfaya
 *  yansimasi icin Vercel Deploy Hook'u cagirir. Tanimsizsa sessiz gecer. */
async function triggerSiteRebuild(): Promise<void> {
  const hook = process.env.VERCEL_DEPLOY_HOOK;
  if (!hook) return;
  try {
    await fetch(hook, { method: 'POST' });
  } catch {
    // Deploy hook'un erisilememesi kaydi engellememeli.
  }
}

export const prerender = false;

/** CMS koleksiyon beyaz listesi — localStorage anahtar uzayıyla hizalı. */
const CONTENT_KEYS: ReadonlySet<string> = new Set([
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
  'tour-views',
  // Ortak iş ve saha operasyon kayıtları (Madde 5)
  'expenses',
  'virmans',
  'driver-expenses',
  'guide-expenses',
  'proposals',
  'lost-found',
  'luggage',
  // Tur düzenleyicide yeniden kullanılabilen dahil/hariç seçenek havuzu
  'inclusion-library',
]);

/** Saha personeli (şoför/rehber) tarafından doğrudan yazılabilen uçlar */
const FIELD_WRITABLE_KEYS: ReadonlySet<string> = new Set([
  'driver-expenses',
  'guide-expenses',
  'lost-found',
  'luggage',
]);

/** Tek bir koleksiyonun JSONB boyutu için üst sınır (bayt, yaklaşık). */
const MAX_CONTENT_BYTES = 2 * 1024 * 1024; // 2 MiB

function validKey(key: unknown): key is string {
  return typeof key === 'string' && CONTENT_KEYS.has(key);
}

export const GET: APIRoute = async (context) => {
  // Tüm yetkili personel (şoför ve rehber dahil) araç/şoför/tur listelerini okuyabilir.
  // Yazma (PUT) işlemi aşağıda 'manager' seviyesine kilitlidir.
  const guard = guardApi(context);
  if (!guard.allowed) return guard.response!;

  if (!isSupabaseAdminConfigured()) {
    return jsonError(503, 'Bulut veritabanı yapılandırılmamış (SUPABASE_SERVICE_ROLE_KEY yok).');
  }
  const db = getSupabaseAdmin();
  if (!db) return jsonError(503, 'Bulut veritabanı istemcisi oluşturulamadı.');

  const key = context.url.searchParams.get('key');
  if (key !== null) {
    if (!validKey(key)) return jsonError(400, 'Geçersiz koleksiyon anahtarı.');
    const { data, error } = await db.from('content_store').select('data').eq('key', key).maybeSingle();
    if (error) return jsonError(502, 'Veritabanı okuma hatası: ' + error.message);
    return jsonOk({ data: data?.data ?? null });
  }

  const { data, error } = await db.from('content_store').select('key, data');
  if (error) return jsonError(502, 'Veritabanı okuma hatası: ' + error.message);
  const items: Record<string, unknown> = {};
  for (const row of data ?? []) {
    items[row.key] = row.data;
  }
  return jsonOk({ items });
};

export const PUT: APIRoute = async (context) => {
  let body: Record<string, unknown>;
  try {
    body = (await context.request.json()) as Record<string, unknown>;
  } catch {
    return jsonError(400, 'Geçersiz JSON gövdesi.');
  }

  const key = body.key;
  if (!validKey(key)) return jsonError(400, 'Geçersiz koleksiyon anahtarı.');

  // Saha operasyon masrafları ve kayıtları tüm personele açıktır;
  // CMS ve genel şirket ayarları ise 'manager' seviyesi gerektirir.
  const requiredRole = FIELD_WRITABLE_KEYS.has(key) ? undefined : 'manager';
  const guard = guardApi(context, requiredRole);
  if (!guard.allowed) return guard.response!;

  const payload = JSON.stringify(body.data ?? null);
  if (payload.length > MAX_CONTENT_BYTES) {
    return jsonError(413, 'Koleksiyon verisi çok büyük (2 MiB üst sınırı).');
  }

  if (!isSupabaseAdminConfigured()) {
    return jsonError(503, 'Bulut veritabanı yapılandırılmamış.');
  }
  const db = getSupabaseAdmin();
  if (!db) return jsonError(503, 'Bulut veritabanı istemcisi oluşturulamadı.');

  // Eşzamanlı değişiklik denetimi (Optimistic Concurrency Control):
  if (body.expectedUpdatedAt && !body.force) {
    const { data: existing } = await db
      .from('content_store')
      .select('updated_at')
      .eq('key', key)
      .maybeSingle();

    if (
      existing?.updated_at &&
      new Date(existing.updated_at).getTime() > new Date(body.expectedUpdatedAt as string).getTime() + 1000
    ) {
      return jsonError(
        409,
        `"${key}" koleksiyonu başka bir kullanıcı tarafından daha yeni bir tarihte güncellendi. Lütfen en güncel veriyi kontrol ediniz.`
      );
    }
  }

  const now = new Date().toISOString();
  const { error } = await db
    .from('content_store')
    .upsert({ key, data: body.data ?? null, updated_at: now }, { onConflict: 'key' });

  if (error) return jsonError(502, 'Veritabanı yazma hatası: ' + error.message);

  // Payload'sız sinyal — açık paneller GET ile tazeler.
  broadcastBookingsChanged('admin-cms');
  // Site statik sayfalari build'den geldigi icin yeniden insa tetikle
  // (VERCEL_DEPLOY_HOOK tanimliysa ~1-2 dk icinde canliya yansir).
  void triggerSiteRebuild();
  return jsonOk({ ok: true, key, updatedAt: now });
};

export const DELETE: APIRoute = async (context) => {
  const guard = guardApi(context, 'admin');
  if (!guard.allowed) return guard.response!;

  const key = context.url.searchParams.get('key');
  if (!validKey(key)) return jsonError(400, 'Geçersiz koleksiyon anahtarı.');

  const db = getSupabaseAdmin();
  if (!db) return jsonError(503, 'Bulut veritabanı yapılandırılmamış.');

  const { error } = await db.from('content_store').delete().eq('key', key);
  if (error) return jsonError(502, 'Veritabanı silme hatası: ' + error.message);

  broadcastBookingsChanged('admin-cms');
  return jsonOk({ ok: true, key });
};
