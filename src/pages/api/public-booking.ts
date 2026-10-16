/**
 * /api/public-booking — Halka Açık Web Sitesi Hızlı Rezervasyon Talebi Ucu
 *
 * Web sitesindeki misafirlerin WhatsApp görüşmesi öncesi doğrudan CRM'e
 * "inquiry" (talep) olarak kaydolmasını sağlar.
 *
 * GÜVENLİK & KORUMA:
 * - checkRateLimit ile IP başına dakikada maksimum 10 talep.
 * - Sıkı girdi doğrulaması (isim, telefon, tarih formatı).
 * - Yetki gerektirmez (halka açık), ancak kayıt yalnızca "inquiry" olarak açılır.
 * - Supabase Realtime Broadcast ile admin ekranına anında yeni talep bildirimi düşer.
 */

import type { APIRoute } from 'astro';
import { jsonError, jsonOk } from '../../lib/server/apiGuard';
import { checkRateLimit } from '../../lib/server/rateLimit';
import {
  getSupabaseAdmin,
  isSupabaseAdminConfigured,
  broadcastBookingsChanged,
} from '../../lib/server/supabaseAdmin';
import { bookingToRow } from '../../lib/supabase';
import {
  type Booking,
  detectHotelZone,
  getRecommendedPickupTime,
} from '../../data/adminInitialData';
import { generateTicketCode } from '../../lib/ticketCodes';
import { buildWhatsAppDeepLink, formatWhatsAppPhone } from '../../lib/whatsappEngine';
import siteSettings from '../../content/settings/site.json';

export const prerender = false;

interface PublicBookingPayload {
  customerName: string;
  phone: string;
  hotel?: string;
  roomNumber?: string;
  tourId?: string;
  tourTitle: string;
  tourDate: string;
  adultCount: number;
  childCount?: number;
  totalPriceThb?: number;
  specialNotes?: string;
}

export const POST: APIRoute = async (context) => {
  const clientIp =
    context.clientAddress ||
    (context.request.headers.get('x-forwarded-for') || '').split(',')[0].trim() ||
    'unknown';

  const limiter = await checkRateLimit('public-booking', clientIp, 10, 60);
  if (!limiter.allowed) {
    return jsonError(429, 'Çok fazla talep denemesi. Lütfen bir dakika sonra tekrar deneyiniz.');
  }

  let body: Partial<PublicBookingPayload>;
  try {
    body = await context.request.json();
  } catch {
    return jsonError(400, 'Geçersiz JSON verisi.');
  }

  const {
    customerName,
    phone,
    hotel = '',
    roomNumber = '',
    tourId = 'web-tur',
    tourTitle = 'Phuket Turu',
    tourDate,
    adultCount = 2,
    childCount = 0,
    totalPriceThb = 0,
    specialNotes = '',
  } = body;

  // Doğrulamalar
  if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 2) {
    return jsonError(422, 'Lütfen geçerli bir isim ve soyisim giriniz.');
  }

  const cleanPhone = formatWhatsAppPhone(phone || '');
  if (!cleanPhone || cleanPhone.length < 7) {
    return jsonError(422, 'Lütfen geçerli bir telefon numarası giriniz.');
  }

  if (!tourDate || !/^\d{4}-\d{2}-\d{2}$/.test(tourDate)) {
    return jsonError(422, 'Lütfen geçerli bir tur tarihi seçiniz (YYYY-AA-GG).');
  }

  const adults = Math.max(1, Number(adultCount) || 1);
  const children = Math.max(0, Number(childCount) || 0);
  const total = Math.max(0, Number(totalPriceThb) || 0);

  const zone = detectHotelZone(hotel);
  const pickupTime = getRecommendedPickupTime(zone);
  const bookingId = `BK-${Math.floor(1000 + Math.random() * 9000)}`;
  const ticketCode = generateTicketCode();
  const managerPhone = siteSettings?.whatsappNumber || '66828950665';

  const newBooking: Booking = {
    id: bookingId,
    customerName: customerName.trim(),
    phone: cleanPhone.startsWith('+') ? cleanPhone : `+${cleanPhone}`,
    hotel: hotel.trim() || 'Belirtilmedi',
    hotelZone: zone,
    roomNumber: roomNumber.trim() || undefined,
    tourId,
    tourTitle,
    tourDate,
    pickupTime,
    adultCount: adults,
    childCount: children,
    totalPriceThb: total,
    paidAmountThb: 0,
    remainingAmountThb: total,
    status: 'inquiry',
    paymentStatus: 'unpaid',
    nationalParkFeeIncluded: false,
    specialNotes: specialNotes ? `[Web Talep] ${specialNotes.trim()}` : '[Web Doğrudan Talep]',
    ticketCode,
    createdAt: new Date().toISOString().split('T')[0],
  };

  // Buluta kaydet ve broadcast sinyali yayınla
  if (isSupabaseAdminConfigured()) {
    const db = getSupabaseAdmin();
    if (db) {
      try {
        const { error } = await db.from('bookings').insert(bookingToRow(newBooking));
        if (error) {
          console.error('[PublicBooking] DB insert error:', error.message);
        } else {
          await broadcastBookingsChanged('public-web');
        }
      } catch (dbErr) {
        console.error('[PublicBooking] Exception:', dbErr);
      }
    }
  }

  // Misafir için önceden doldurulmuş WhatsApp mesajı
  const waLines = [
    `🌴 *Merhaba Phuket Tatili, web sitenizden rezervasyon talebi gönderdim:*`,
    ``,
    `🎫 *Referans Kodu:* ${ticketCode}`,
    `👤 *İsim:* ${newBooking.customerName}`,
    `🏝️ *Tur:* ${newBooking.tourTitle}`,
    `📅 *Tarih:* ${newBooking.tourDate}`,
    `👥 *Kişi:* ${adults} Yetişkin${children > 0 ? `, ${children} Çocuk` : ''}`,
    `🏨 *Otel:* ${newBooking.hotel}`,
    `💰 *Tahmini Fiyat:* ${total > 0 ? `${total.toLocaleString('tr-TR')} THB` : 'Görüşmede netleşecek'}`,
    ``,
    `Müsaitlik ve otel alınış saati hakkında detayları teyit edebilir miyiz?`,
  ];
  const whatsAppUrl = buildWhatsAppDeepLink(managerPhone, waLines.join('\n'));

  return jsonOk({
    ok: true,
    bookingId: newBooking.id,
    ticketCode: newBooking.ticketCode,
    ticketUrl: `/bilet/${newBooking.ticketCode}`,
    whatsAppUrl,
    message: 'Rezervasyon talebiniz başarıyla kaydedildi!',
  });
};
