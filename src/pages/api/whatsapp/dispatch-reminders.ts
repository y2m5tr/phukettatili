/**
 * /api/whatsapp/dispatch-reminders — 20:00 T-24 Otomatik Hatırlatma & Dağıtım Cron Görevi
 *
 * Her akşam saat 20:00'de (Phuket saati UTC+7 / 13:00 UTC) çalışarak:
 * 1. Yarınki onaylı tüm turları tespit eder.
 * 2. Henüz hatırlatma almamış misafirlere lobi alınış saati ve bilet linkini gönderir.
 * 3. Şoför atanmışsa şoföre de Tayca/İngilizce iş emrini otomatik iletir.
 * 4. Başarıyla gönderilenleri veritabanında `whatsapp_reminder_sent = true` yapar.
 *
 * ÇAĞRILMA YÖNTEMLERİ:
 * - Vercel Cron: Header `Authorization: Bearer ${CRON_SECRET}` veya `x-vercel-cron`
 * - Admin Paneli: Aktif oturumla tek tıkla manuel tetikleme (`guardApi`).
 */

import type { APIRoute } from 'astro';
import { guardApi, jsonError, jsonOk } from '../../../lib/server/apiGuard';
import {
  sendT24PickupReminder,
  sendDriverDispatchNotice,
} from '../../../lib/server/whatsappCloudApi';
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

  // 2. Yarının Phuket Tarihini Hesapla (Asia/Bangkok UTC+7)
  let tomorrowStr: string;
  try {
    const nowBangkok = new Date(
      new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok' })
    );
    const tomorrow = new Date(nowBangkok.getTime() + 24 * 60 * 60 * 1000);
    tomorrowStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(tomorrow);
  } catch {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    tomorrowStr = tomorrow.toISOString().split('T')[0];
  }

  // 3. Yarınki Hatırlatılmamış Rezervasyonları Getir
  const candidateBookings: Booking[] = [];

  if (isSupabaseAdminConfigured()) {
    const db = getSupabaseAdmin();
    if (db) {
      const { data, error } = await db
        .from('bookings')
        .select('*')
        .eq('tour_date', tomorrowStr)
        .eq('status', 'confirmed')
        .or('whatsapp_reminder_sent.is.null,whatsapp_reminder_sent.eq.false');

      if (error) {
        console.error('[DispatchReminders] DB sorgu hatası:', error.message);
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
    guestResult: { success: boolean; messageId?: string; error?: string };
    driverResult?: { success: boolean; messageId?: string; error?: string };
  }> = [];

  let sentCount = 0;
  let failedCount = 0;

  for (const booking of candidateBookings) {
    const guestRes = await sendT24PickupReminder(booking);

    let driverRes;
    if (booking.assignedDriver) {
      // Şoför telefonu atanmışsa şoföre de iş emri gönder
      const driverPhone = booking.driverPhone;
      if (driverPhone) {
        driverRes = await sendDriverDispatchNotice(booking, driverPhone);
      }
    }

    if (guestRes.success) {
      sentCount++;
      // DB'de gönderildi olarak işaretle
      if (isSupabaseAdminConfigured()) {
        try {
          const db = getSupabaseAdmin();
          await db
            ?.from('bookings')
            .update({
              whatsapp_reminder_sent: true,
              updated_at: new Date().toISOString(),
            })
            .eq('id', booking.id);
        } catch (dbErr) {
          console.warn(`[DispatchReminders] DB güncelleme hatası (${booking.id}):`, dbErr);
        }
      }
    } else {
      failedCount++;
    }

    results.push({
      bookingId: booking.id,
      customerName: booking.customerName,
      phone: booking.phone,
      guestResult: guestRes,
      driverResult: driverRes,
    });
  }

  console.info(
    `[DispatchReminders] T-24 Görevi Tamamlandı (${tomorrowStr}): ${sentCount} başarılı, ${failedCount} başarısız / Toplam: ${candidateBookings.length}`
  );

  return jsonOk({
    ok: true,
    tomorrowDate: tomorrowStr,
    totalEligible: candidateBookings.length,
    sentCount,
    failedCount,
    results,
    dispatchedAt: new Date().toISOString(),
  });
};
