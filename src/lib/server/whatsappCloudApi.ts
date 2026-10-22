/**
 * Meta WhatsApp Business Cloud API & Webhook Servis Katmanı
 *
 * Phuket turizm operasyonlarında misafir iletişimini ve otomatik saha bildirimlerini yönetir:
 * 1. Web sitesinden talep geldiğinde veya onaylandığında otomatik bilet & teyit mesajı.
 * 2. Turdan önceki akşam saat 20:00'de T-24 lobi alınış hatırlatması (misafir ve şoföre).
 * 3. Gelen webhook bildirimleri (mesaj teslimat raporları ve misafir yanıtları).
 *
 * GÜVENLİK & YEDEK MOD (FALLBACK):
 * - WHATSAPP_CLOUD_TOKEN veya WHATSAPP_PHONE_NUMBER_ID tanımlı değilse, sistem
 *   çökmez; simülasyon modunda konsola yapılandırılmış log bırakarak başarılı döner.
 * - Gelen webhook'larda X-Hub-Signature-256 HMAC-SHA256 doğrulaması yapılır.
 */

import crypto from 'node:crypto';
import type { Booking } from '../../data/adminInitialData';
import { formatWhatsAppPhone, generateTriggerMessage, formatDayMonthYear } from '../whatsappEngine';
import siteSettings from '../../content/settings/site.json';

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  simulated?: boolean;
  error?: string;
}

export interface WhatsAppWebhookEntry {
  id: string;
  changes: Array<{
    value: {
      messaging_product: string;
      metadata: {
        display_phone_number: string;
        phone_number_id: string;
      };
      contacts?: Array<{
        profile: { name: string };
        wa_id: string;
      }>;
      messages?: Array<{
        from: string;
        id: string;
        timestamp: string;
        type: string;
        text?: { body: string };
      }>;
      statuses?: Array<{
        id: string;
        status: 'sent' | 'delivered' | 'read' | 'failed';
        timestamp: string;
        recipient_id: string;
        errors?: Array<{ code: number; title: string }>;
      }>;
    };
    field: string;
  }>;
}

/**
 * Ortam değişkenlerini güvenli şekilde okur.
 */
export function getWhatsAppConfig() {
  const token =
    process.env.WHATSAPP_CLOUD_TOKEN ||
    process.env.META_WA_TOKEN ||
    '';
  const phoneNumberId =
    process.env.WHATSAPP_PHONE_NUMBER_ID ||
    process.env.META_WA_PHONE_ID ||
    '';
  const webhookVerifyToken =
    process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN ||
    'phuket_tatili_webhook_verify_2026';
  const appSecret =
    process.env.WHATSAPP_APP_SECRET ||
    '';

  const isConfigured = Boolean(token && phoneNumberId);

  return {
    token,
    phoneNumberId,
    webhookVerifyToken,
    appSecret,
    isConfigured,
  };
}

/**
 * Meta WhatsApp Cloud API üzerinden doğrudan metin mesajı gönderir.
 */
export async function sendWhatsAppTextMessage(
  rawPhone: string,
  messageBody: string,
  options?: { previewUrl?: boolean }
): Promise<WhatsAppSendResult> {
  const cleanPhone = formatWhatsAppPhone(rawPhone);
  if (!cleanPhone || cleanPhone.length < 7) {
    return {
      success: false,
      error: 'Geçersiz alıcı telefon numarası',
    };
  }

  const config = getWhatsAppConfig();

  // Canlı Meta Cloud API bilgileri yoksa simülasyon modunda çalışır
  if (!config.isConfigured) {
    console.info(
      `[WhatsApp Cloud API Simülasyonu] -> +${cleanPhone}:`,
      messageBody.slice(0, 100) + (messageBody.length > 100 ? '...' : '')
    );
    return {
      success: true,
      simulated: true,
      messageId: `sim_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    };
  }

  const url = `https://graph.facebook.com/v21.0/${config.phoneNumberId}/messages`;
  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: cleanPhone,
    type: 'text',
    text: {
      preview_url: options?.previewUrl !== false,
      body: messageBody,
    },
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[WhatsApp Cloud API Error]', res.status, errText);
      return {
        success: false,
        error: `Meta API Hatası (${res.status}): ${errText}`,
      };
    }

    const data = await res.json();
    const messageId = data?.messages?.[0]?.id;

    return {
      success: true,
      messageId,
      simulated: false,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[WhatsApp Cloud API Exception]', msg);
    return {
      success: false,
      error: msg,
    };
  }
}

/**
 * Web sitesi üzerinden gelen yeni rezervasyon veya talebi misafire teyit eder.
 */
export async function sendBookingInquiryConfirmation(
  booking: Booking
): Promise<WhatsAppSendResult> {
  const managerPhone = siteSettings?.whatsappNumber || '66828950665';
  const ticketUrl = `https://phukettatili.com/bilet/${booking.ticketCode || booking.id}`;

  const message = `🌴 *PHUKET TATİLİ — REZERVASYON TALEBİNİZ ALINDI* 🌴

Sayın *${booking.customerName}*, merhaba!

*${booking.tourTitle}* turunuz için talebiniz operasyon ekibimize ulaşmıştır.

🎫 *Referans Kodu:* ${booking.ticketCode || booking.id}
📅 *Tur Tarihi:* ${formatDayMonthYear(booking.tourDate)}
🏨 *Otel:* ${booking.hotel}${booking.roomNumber ? ` (Oda: ${booking.roomNumber})` : ''}
👥 *Misafir:* ${booking.adultCount} Yetişkin${booking.childCount > 0 ? ` + ${booking.childCount} Çocuk` : ''}

🎟️ *Canlı Dijital Biletiniz & Alınış Takibi:*
${ticketUrl}

Operasyon ekibimiz otel alınış saatinizi ve transfer detaylarınızı teyit etmek için kısa süre içinde bu numaradan size ulaşacaktır.

📞 *Türkçe Saha Destek:* +${managerPhone}
Keyifli bir Phuket tatili dileriz! 🇹🇭✨`;

  return sendWhatsAppTextMessage(booking.phone, message, { previewUrl: true });
}

/**
 * Turdan önceki akşam saat 20:00'de T-24 lobi alınış hatırlatmasını misafire gönderir.
 */
export async function sendT24PickupReminder(
  booking: Booking
): Promise<WhatsAppSendResult> {
  const message = generateTriggerMessage('t24_reminder', booking, {
    managerPhone: siteSettings?.whatsappNumber,
  });
  return sendWhatsAppTextMessage(booking.phone, message, { previewUrl: true });
}

/**
 * Şoför otel lobisine vardığında misafire canlı bildirim iletir.
 */
export async function sendLobbyArrivalNotice(
  booking: Booking
): Promise<WhatsAppSendResult> {
  const message = generateTriggerMessage('driver_arrived', booking, {
    managerPhone: siteSettings?.whatsappNumber,
  });
  return sendWhatsAppTextMessage(booking.phone, message, { previewUrl: true });
}

/**
 * Şoföre WhatsApp üzerinden Tayca/İngilizce transfer iş emrini otomatik iletir.
 */
export async function sendDriverDispatchNotice(
  booking: Booking,
  driverPhone: string
): Promise<WhatsAppSendResult> {
  const ticketUrl = `https://phukettatili.com/bilet/${booking.ticketCode || booking.id}`;
  const pax = `${booking.adultCount} Adults${booking.childCount > 0 ? ` + ${booking.childCount} Child` : ''}`;

  const thaiJobMessage = `🚐 *PHUKET TATİLİ — DRIVER PICKUP JOB / ใบงานรับลูกค้า* 🇹🇭

📍 *Hotel / โรงแรม:* ${booking.hotel}${booking.roomNumber ? ` (Room: ${booking.roomNumber})` : ''}
⏰ *Pickup Time / เวลารับ:* ${booking.pickupTime || '07:30'}
👤 *Guest / ลูกค้า:* ${booking.customerName} (${pax})
📱 *Guest Phone / เบอร์ติดต่อ:* ${booking.phone}
🏝️ *Tour / ทัวร์:* ${booking.tourTitle}
📅 *Date / วันที่:* ${formatDayMonthYear(booking.tourDate)}
${
  booking.remainingAmountThb > 0
    ? `💵 *Collect Cash / เก็บเงินสด:* ${booking.remainingAmountThb.toLocaleString('th-TH')} THB`
    : '✓ *Paid / จ่ายแล้ว (No cash to collect)*'
}

🎫 *Digital Voucher:* ${ticketUrl}
Please be at hotel lobby on time. Thank you! 🙏`;

  return sendWhatsAppTextMessage(driverPhone, thaiJobMessage, { previewUrl: true });
}

/**
 * Meta Webhook isteklerinin X-Hub-Signature-256 başlığını doğrular.
 */
export function validateMetaSignature(
  rawBody: string,
  signatureHeader: string | null | undefined,
  appSecret: string
): boolean {
  if (!appSecret) {
    // Secret tanımlı değilse doğrulamayı esnet (geliştirme ortamı)
    return true;
  }
  if (!signatureHeader || !signatureHeader.startsWith('sha256=')) {
    return false;
  }

  const expectedSignature = signatureHeader.slice(7);
  const hmac = crypto.createHmac('sha256', appSecret);
  hmac.update(rawBody, 'utf8');
  const digest = hmac.digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(digest, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch {
    return false;
  }
}
