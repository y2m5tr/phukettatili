/**
 * /api/bookings — rezervasyon CRUD'unun sunucu tarafı ucu.
 *
 * VERİ GÜVENLİĞİ MODELİ:
 * - Okuma/yazma yalnızca oturum açmış admin veya field oturumuna açık.
 *   RLS anon'a kapatıldığı için client Supabase anahtarıyla tabloya
 *   erişemez; tek veri yolu budur.
 * - Oturum cookie'si httpOnly'dir; istemci kodu onu okuyamaz, yalnızca
 *   tarayıcı isteğe otomatik ekler.
 * - Yanıtlar `Cache-Control: no-store` ile CDN'lerin müşteri verisi
 *   saklamasını engeller.
 * - Yazma işleminden sonra payload'sız Broadcast sinyali yollanır;
 *   diğer paneller veriyi YENİDEN BU ENDPOINT'TEN çeker.
 *
 * UÇLAR:
 *   GET    /api/bookings              -> { bookings: Booking[] }
 *   PUT    /api/bookings              -> tek satırı upsert et (gövde: Booking)
 *   POST   /api/bookings              -> yeni satır (gövde: Booking)
 *   DELETE /api/bookings?id=BK-1234   -> satırı sil
 */
import type { APIRoute } from 'astro';
import { guardApi, jsonError, jsonOk } from '../../lib/server/apiGuard';
import {
  getSupabaseAdmin,
  isSupabaseAdminConfigured,
  broadcastBookingsChanged,
} from '../../lib/server/supabaseAdmin';
import { bookingToRow, rowToBooking } from '../../lib/supabase';
import type { Booking } from '../../data/adminInitialData';

export const prerender = false;

/** Basit şema doğrulaması — bozuk gövde veritabanına yazılmasın. */
function validateBookingBody(b: unknown): b is Booking {
  if (!b || typeof b !== 'object') return false;
  const o = b as Record<string, unknown>;
  if (typeof o.id !== 'string' || o.id.length === 0 || o.id.length > 64) return false;
  if (typeof o.customerName !== 'string' || o.customerName.length === 0) return false;
  if (typeof o.phone !== 'string') return false;
  if (typeof o.tourDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(o.tourDate)) return false;
  if (typeof o.adultCount !== 'number' || o.adultCount < 1 || o.adultCount > 200) return false;
  if (typeof o.totalPriceThb !== 'number' || o.totalPriceThb < 0) return false;
  return true;
}

export const GET: APIRoute = async (context) => {
  const guard = guardApi(context);
  if (!guard.allowed) return guard.response!;

  if (!isSupabaseAdminConfigured()) {
    return jsonError(503, 'Bulut veritabanı yapılandırılmamış (SUPABASE_SERVICE_ROLE_KEY yok).');
  }
  const db = getSupabaseAdmin();
  if (!db) return jsonError(503, 'Bulut veritabanı istemcisi oluşturulamadı.');

  const { data, error } = await db
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return jsonError(502, 'Veritabanı okuma hatası: ' + error.message);
  return jsonOk({ bookings: (data ?? []).map(rowToBooking) });
};

export const PUT: APIRoute = async (context) => {
  const guard = guardApi(context);
  if (!guard.allowed) return guard.response!;

  let body: unknown;
  try {
    body = await context.request.json();
  } catch {
    return jsonError(400, 'Geçersiz JSON gövdesi.');
  }
  if (!validateBookingBody(body)) return jsonError(422, 'Rezervasyon alanları doğrulanamadı.');

  const db = getSupabaseAdmin();
  if (!db) return jsonError(503, 'Bulut veritabanı yapılandırılmamış.');

  const { error } = await db.from('bookings').upsert(bookingToRow(body));
  if (error) return jsonError(502, 'Veritabanı yazma hatası: ' + error.message);

  await broadcastBookingsChanged('admin');
  return jsonOk({ ok: true });
};

export const POST: APIRoute = async (context) => {
  const guard = guardApi(context);
  if (!guard.allowed) return guard.response!;

  let body: unknown;
  try {
    body = await context.request.json();
  } catch {
    return jsonError(400, 'Geçersiz JSON gövdesi.');
  }
  if (!validateBookingBody(body)) return jsonError(422, 'Rezervasyon alanları doğrulanamadı.');

  const db = getSupabaseAdmin();
  if (!db) return jsonError(503, 'Bulut veritabanı yapılandırılmamış.');

  // Aynı id zaten varsa hata dönmektense upsert etmek operasyonel olarak
  // daha güvenli: sahadan offline sırasında biriken kayıtların tekrar
  // gönderilmesi normal akış.
  const { error } = await db.from('bookings').upsert(bookingToRow(body));
  if (error) return jsonError(502, 'Veritabanı yazma hatası: ' + error.message);

  await broadcastBookingsChanged('field');
  return jsonOk({ ok: true });
};

export const DELETE: APIRoute = async (context) => {
  // Silme yalnızca admin oturumuna açık — saha ekibi kayıt silemez.
  const guard = guardApi(context, 'admin');
  if (!guard.allowed) return guard.response!;

  const id = context.url.searchParams.get('id');
  if (!id || id.length > 64) return jsonError(400, 'Geçerli bir ?id= parametresi gerekli.');

  const db = getSupabaseAdmin();
  if (!db) return jsonError(503, 'Bulut veritabanı yapılandırılmamış.');

  const { error } = await db.from('bookings').delete().eq('id', id);
  if (error) return jsonError(502, 'Veritabanı silme hatası: ' + error.message);

  await broadcastBookingsChanged('admin');
  return jsonOk({ ok: true });
};
