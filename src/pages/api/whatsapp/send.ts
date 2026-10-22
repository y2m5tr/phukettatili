/**
 * /api/whatsapp/send — Ekip & Operasyon Paneli WhatsApp Gönderim Ucu
 *
 * Yetkili ekip üyelerinin (rehber, şoför, yönetici) tek tıkla misafire
 * veya şoföre Meta Cloud API üzerinden WhatsApp bildirimleri iletmesini sağlar.
 *
 * GÜVENLİK:
 * - guardApi ile korunur (en az 'guide' rolü gerekir).
 */

import type { APIRoute } from 'astro';
import { guardApi, jsonError, jsonOk } from '../../../lib/server/apiGuard';
import {
  sendWhatsAppTextMessage,
  sendT24PickupReminder,
  sendLobbyArrivalNotice,
  sendBookingInquiryConfirmation,
  sendDriverDispatchNotice,
} from '../../../lib/server/whatsappCloudApi';
import {
  isSupabaseAdminConfigured,
  getSupabaseAdmin,
} from '../../../lib/server/supabaseAdmin';
import { rowToBooking } from '../../../lib/supabase';
import type { Booking } from '../../../data/adminInitialData';

export const prerender = false;

interface SendRequestBody {
  bookingId?: string;
  booking?: Booking;
  type: 't24_reminder' | 'driver_arrived' | 'booking_confirmation' | 'driver_job' | 'custom';
  phone?: string;
  customMessage?: string;
  driverPhone?: string;
}

export const POST: APIRoute = async (context) => {
  const guard = guardApi(context, 'guide');
  if (!guard.allowed) return guard.response!;

  let body: SendRequestBody;
  try {
    body = await context.request.json();
  } catch {
    return jsonError(400, 'Geçersiz JSON gövdesi.');
  }

  const { type, bookingId, phone, customMessage, driverPhone } = body;
  let targetBooking = body.booking;

  // Booking nesnesi doğrudan verilmemişse veritabanından çek
  if (!targetBooking && bookingId && isSupabaseAdminConfigured()) {
    const db = getSupabaseAdmin();
    if (db) {
      const { data, error } = await db
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();
      if (!error && data) {
        targetBooking = rowToBooking(data);
      }
    }
  }

  // Özel metin gönderimi
  if (type === 'custom') {
    if (!phone || !customMessage) {
      return jsonError(422, 'Özel mesaj için telefon ve mesaj metni zorunludur.');
    }
    const result = await sendWhatsAppTextMessage(phone, customMessage);
    return jsonOk(result);
  }

  if (!targetBooking) {
    return jsonError(404, 'İşlem yapılacak rezervasyon bulunamadı.');
  }

  let result;
  switch (type) {
    case 't24_reminder':
      result = await sendT24PickupReminder(targetBooking);
      // Başarılıysa veritabanında whatsAppReminderSent işaretle
      if (result.success && isSupabaseAdminConfigured()) {
        try {
          const db = getSupabaseAdmin();
          await db
            ?.from('bookings')
            .update({
              whatsapp_reminder_sent: true,
              updated_at: new Date().toISOString(),
            })
            .eq('id', targetBooking.id);
        } catch (dbErr) {
          console.warn('[WhatsApp Send] DB update uyarısı:', dbErr);
        }
      }
      break;

    case 'driver_arrived':
      result = await sendLobbyArrivalNotice(targetBooking);
      break;

    case 'booking_confirmation':
      result = await sendBookingInquiryConfirmation(targetBooking);
      break;

    case 'driver_job':
      if (!driverPhone) {
        return jsonError(422, 'Şoför iş emri için şoför telefon numarası gereklidir.');
      }
      result = await sendDriverDispatchNotice(targetBooking, driverPhone);
      break;

    default:
      return jsonError(400, 'Geçersiz mesaj türü.');
  }

  return jsonOk(result);
};
