/**
 * /api/whatsapp/review-reminders — T+24 Otomatik Google & TripAdvisor Yorum Cron Görevi
 *
 * Her gün öğlen 12:00'de (Phuket UTC+7 / 05:00 UTC) çalışarak:
 * 1. Dün veya önceki gün turu tamamlanmış misafirleri tespit eder.
 * 2. Henüz yorum daveti almamış misafirlere WhatsApp Google yorum davetini gönderir.
 * 3. Başarıyla gönderilenleri veritabanında `whatsapp_review_sent = true` yapar.
 *
 * ÇAĞRILMA YÖNTEMLERİ:
 * - Vercel / VPS Cron: Header `Authorization: Bearer ${CRON_SECRET}` veya `x-cron-secret`
 * - Admin Paneli: Aktif oturumla tek tıkla manuel tetikleme (`guardApi`).
 */

import type { APIRoute } from 'astro';
import { guardApi, jsonError, jsonOk } from '../../../lib/server/apiGuard';
import { sendTPlus24ReviewInvite } from '../../../lib/server/whatsappCloudApi';
import {
  isSupabaseAdminConfigured,
  getSupabaseAdmin,
} from '../../../lib/server/supabaseAdmin';
import { rowToBooking } from '../../../lib/supabase';
import type { Booking } from '../../../data/adminInitialData';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  // 1. Yetki Kontrolü: CRON_SECRET veya Yetkili Kullanıcı Oturumu
  const authHeader = context.request.headers.get('authorization') || '';
  const cronSecretHeader = context.request.headers.get('x-cron-secret') || '';
  const expectedCronSecret = process.env.CRON_SECRET || '';

  const isCronAuthorized =
    expectedCronSecret &&
    (authHeader === `Bearer ${expectedCronSecret}` || cronSecretHeader === expectedCronSecret);

  if (!isCronAuthorized) {
    const guard = guardApi(context, 'manager');
    if (!guard.allowed) {
      return jsonError(401, 'Bu görevi çalıştırmak için cron secret veya yönetici yetkisi gereklidir.');
    }
  }

  // 2. Dünün Phuket Tarihini Hesapla (Asia/Bangkok UTC+7)
  let yesterdayStr: string;
  try {
    const nowBangkok = new Date(
      new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok' })
    );
    const yesterday = new Date(nowBangkok.getTime() - 24 * 60 * 60 * 1000);
    yesterdayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(yesterday);
  } catch {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    yesterdayStr = yesterday.toISOString().split('T')[0];
  }

  // 3. Dün Turu Biten ve Yorum İstenmemiş Rezervasyonları Getir
  const candidateBookings: Booking[] = [];

  if (isSupabaseAdminConfigured()) {
    const db = getSupabaseAdmin();
    if (db) {
      const { data, error } = await db
        .from('bookings')
        .select('*')
        .eq('tour_date', yesterdayStr)
        .eq('status', 'confirmed')
        .or('whatsapp_review_sent.is.null,whatsapp_review_sent.eq.false');

      if (error) {
        console.error('[ReviewReminders] DB sorgu hatası:', error.message);
        return jsonError(500, `Veritabanı hatası: ${error.message}`);
      }

      if (Array.isArray(data)) {
        data.forEach((row) => candidateBookings.push(rowToBooking(row)));
      }
    }
  }

  // 4. Gönderim Döngüsü
  const results: Array<{
    bookingId: string;
    customerName: string;
    phone: string;
    result: { success: boolean; messageId?: string; error?: string };
  }> = [];

  let sentCount = 0;
  let failedCount = 0;

  for (const booking of candidateBookings) {
    const res = await sendTPlus24ReviewInvite(booking);

    if (res.success) {
      sentCount++;
      if (isSupabaseAdminConfigured()) {
        try {
          const db = getSupabaseAdmin();
          await db
            ?.from('bookings')
            .update({
              whatsapp_review_sent: true,
              updated_at: new Date().toISOString(),
            })
            .eq('id', booking.id);
        } catch (dbErr) {
          console.warn(`[ReviewReminders] DB güncelleme hatası (${booking.id}):`, dbErr);
        }
      }
    } else {
      failedCount++;
    }

    results.push({
      bookingId: booking.id,
      customerName: booking.customerName,
      phone: booking.phone,
      result: res,
    });
  }

  console.info(
    `[ReviewReminders] T+24 Görevi Tamamlandı (${yesterdayStr}): ${sentCount} başarılı, ${failedCount} başarısız / Toplam: ${candidateBookings.length}`
  );

  return jsonOk({
    ok: true,
    targetDate: yesterdayStr,
    totalEligible: candidateBookings.length,
    sentCount,
    failedCount,
    results,
    dispatchedAt: new Date().toISOString(),
  });
};
