/**
 * /api/guest-checkin — Misafir online check-in ve pasaport kayıt ucu.
 *
 * GÜVENLİK MODELİ:
 * - /bilet/[code] sayfasından bilet sahibi misafirler erişir.
 * - Sadece geçerli bilet kodu / id eşleşen rezervasyonun `passengers`
 *   listesini günceller. Başka hiçbir alana (fiyat, borç, tedarikçi vb.)
 *   müdahale edilemez.
 * - IP bazlı hız limiti (dakikada max 15 check-in isteği).
 * - Güncelleme başarılı olduğunda broadcast sinyali fırlatılır;
 *   operasyon ekranı (manifesto & kokpit) anında haberdar olur.
 */
import type { APIRoute } from 'astro';
import { jsonError, jsonOk } from '../../lib/server/apiGuard';
import { checkRateLimit } from '../../lib/server/rateLimit';
import {
  getSupabaseAdmin,
  isSupabaseAdminConfigured,
  broadcastBookingsChanged,
} from '../../lib/server/supabaseAdmin';
import type { PassengerItem } from '../../data/adminInitialData';

export const prerender = false;

interface CheckInPayload {
  code: string;
  passengers: PassengerItem[];
}

function validatePassengers(list: unknown): list is PassengerItem[] {
  if (!Array.isArray(list)) return false;
  if (list.length === 0 || list.length > 50) return false;

  for (const p of list) {
    if (!p || typeof p !== 'object') return false;
    const item = p as Record<string, unknown>;
    if (typeof item.fullName !== 'string' || item.fullName.trim().length === 0) return false;
    if (item.passportNo !== undefined && typeof item.passportNo !== 'string') return false;
    if (item.nationality !== undefined && typeof item.nationality !== 'string') return false;
    if (item.birthDate !== undefined && typeof item.birthDate !== 'string') return false;
    if (item.gender !== undefined && item.gender !== 'M' && item.gender !== 'F') return false;
  }
  return true;
}

export const POST: APIRoute = async (context) => {
  const clientIp =
    context.clientAddress ||
    (context.request.headers.get('x-forwarded-for') || '').split(',')[0].trim() ||
    'unknown';

  const limiter = await checkRateLimit('guest-checkin', clientIp, 15, 60);
  if (!limiter.allowed) {
    return jsonError(429, 'Çok fazla check-in denemesi. Lütfen bir dakika sonra tekrar deneyiniz.');
  }

  let body: unknown;
  try {
    body = await context.request.json();
  } catch {
    return jsonError(400, 'Geçersiz JSON formatı.');
  }

  if (!body || typeof body !== 'object') {
    return jsonError(400, 'Eksik veri.');
  }

  const { code, passengers } = body as Partial<CheckInPayload>;
  const cleanCode = (code || '').trim().toUpperCase();

  if (!cleanCode || cleanCode.length > 64) {
    return jsonError(422, 'Geçersiz bilet kodu.');
  }

  if (!validatePassengers(passengers)) {
    return jsonError(422, 'Yolcu bilgileri eksik veya geçersiz.');
  }

  // Temizleme ve normalizasyon
  const sanitizedPassengers: PassengerItem[] = passengers.map((p) => ({
    fullName: p.fullName.trim(),
    passportNo: p.passportNo ? p.passportNo.trim().toUpperCase() : undefined,
    nationality: p.nationality ? p.nationality.trim().toUpperCase() : 'TR',
    birthDate: p.birthDate ? p.birthDate.trim() : undefined,
    gender: p.gender === 'F' ? 'F' : 'M',
    dietaryPreference: p.dietaryPreference || 'standard',
  }));

  if (!isSupabaseAdminConfigured()) {
    // Bulut kapalıysa yerel yanıt
    return jsonOk({
      ok: true,
      count: sanitizedPassengers.length,
      offline: true,
    });
  }

  const db = getSupabaseAdmin();
  if (!db) return jsonError(503, 'Veritabanı bağlantısı kurulamadı.');

  // Rezervasyonu ticket_code veya id ile bul
  let { data: booking } = await db
    .from('bookings')
    .select('id, customer_name, passengers')
    .eq('ticket_code', cleanCode)
    .maybeSingle();

  if (!booking && !cleanCode.startsWith('PT-')) {
    const { data: byId } = await db
      .from('bookings')
      .select('id, customer_name, passengers')
      .eq('id', cleanCode)
      .maybeSingle();
    booking = byId;
  }

  if (!booking) {
    return jsonError(404, 'Rezervasyon kaydı bulunamadı.');
  }

  // Yalnızca passengers alanını güncelle
  const { error: updateError } = await db
    .from('bookings')
    .update({
      passengers: sanitizedPassengers,
      updated_at: new Date().toISOString(),
    })
    .eq('id', booking.id);

  if (updateError) {
    return jsonError(502, 'Pasaport bilgileri kaydedilemedi: ' + updateError.message);
  }

  // Operasyon kokpitine anında broadcast bildirimi
  await broadcastBookingsChanged('field');

  return jsonOk({
    ok: true,
    count: sanitizedPassengers.length,
    customerName: booking.customer_name,
  });
};
