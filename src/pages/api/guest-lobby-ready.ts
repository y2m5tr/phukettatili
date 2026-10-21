/**
 * /api/guest-lobby-ready — Misafir Lobi Hazırlık Bildirimi Uç Noktası
 *
 * /bilet/[code] sayfasındaki misafir "Lobideyim, Hazırım!" butonuna bastığında
 * operasyon ve saha ekibine anlık bilgi aktarır.
 */
import type { APIRoute } from 'astro';
import { jsonError, jsonOk } from '../../lib/server/apiGuard';
import { checkRateLimit } from '../../lib/server/rateLimit';
import {
  getSupabaseAdmin,
  isSupabaseAdminConfigured,
  broadcastBookingsChanged,
} from '../../lib/server/supabaseAdmin';

export const prerender = false;

interface LobbyReadyPayload {
  code: string;
  isReady?: boolean;
  customerName?: string;
  hotel?: string;
  roomNumber?: string;
  tourTitle?: string;
  time?: string;
}

export const POST: APIRoute = async (context) => {
  const clientIp =
    context.clientAddress ||
    (context.request.headers.get('x-forwarded-for') || '').split(',')[0].trim() ||
    'unknown';

  const limiter = await checkRateLimit('guest-lobby-ready', clientIp, 20, 60);
  if (!limiter.allowed) {
    return jsonError(429, 'Çok fazla istek gönderildi. Lütfen bir süre sonra tekrar deneyiniz.');
  }

  let body: unknown;
  try {
    body = await context.request.json();
  } catch {
    return jsonError(400, 'Geçersiz JSON.');
  }

  if (!body || typeof body !== 'object') {
    return jsonError(400, 'Eksik veri.');
  }

  const {
    code,
    isReady = true,
    customerName,
    hotel,
    roomNumber,
    tourTitle,
    time,
  } = body as Partial<LobbyReadyPayload>;

  const cleanCode = (code || '').trim().toUpperCase();
  if (!cleanCode || cleanCode.length > 64) {
    return jsonError(422, 'Geçersiz rezervasyon kodu.');
  }

  if (!isSupabaseAdminConfigured()) {
    return jsonOk({
      ok: true,
      code: cleanCode,
      isReady,
      time: time || new Date().toISOString(),
      offline: true,
    });
  }

  const db = getSupabaseAdmin();
  if (!db) return jsonError(503, 'Veritabanı bağlantısı kurulamadı.');

  // Rezervasyonu bul
  let { data: booking } = await db
    .from('bookings')
    .select('id, customer_name, special_notes')
    .eq('ticket_code', cleanCode)
    .maybeSingle();

  if (!booking && !cleanCode.startsWith('PT-')) {
    const { data: byId } = await db
      .from('bookings')
      .select('id, customer_name, special_notes')
      .eq('id', cleanCode)
      .maybeSingle();
    booking = byId;
  }

  if (booking) {
    let notes = booking.special_notes || '';
    const tag = `[LOBİDE HAZIR: ${time || 'Şimdi'}]`;
    if (isReady) {
      if (!notes.includes('LOBİDE HAZIR')) {
        notes = notes ? `${notes} ${tag}` : tag;
      }
    } else {
      notes = notes.replace(/\[LOBİDE HAZIR:[^\]]*\]/g, '').trim();
    }

    await db
      .from('bookings')
      .update({
        special_notes: notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', booking.id);

    await broadcastBookingsChanged('field');
  }

  return jsonOk({
    ok: true,
    code: cleanCode,
    isReady,
    customerName: customerName || booking?.customer_name,
    hotel,
    roomNumber,
    tourTitle,
    time: time || new Date().toISOString(),
  });
};
