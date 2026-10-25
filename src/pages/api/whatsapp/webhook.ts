/**
 * /api/whatsapp/webhook — Meta WhatsApp Cloud API Webhook Ucu
 *
 * 1. GET Doğrulama: Meta Developers paneline webhook URL'i eklerken
 *    yapılan handshake (hub.mode, hub.verify_token, hub.challenge).
 * 2. POST Olay Bildirimleri:
 *    - İletim Raporları: sent, delivered, read, failed durumları.
 *    - Gelen Misafir Mesajları: Misafirin WhatsApp üzerinden yazdığı yanıtlar.
 *    - Gelen mesajlar admin paneline Supabase Realtime ile anında bildirilir.
 */

import type { APIRoute } from 'astro';
import {
  getWhatsAppConfig,
  validateMetaSignature,
  type WhatsAppWebhookEntry,
} from '../../../lib/server/whatsappCloudApi';
import {
  isSupabaseAdminConfigured,
  getSupabaseAdmin,
} from '../../../lib/server/supabaseAdmin';

export const prerender = false;

/**
 * Meta Webhook URL Doğrulama (GET)
 */
export const GET: APIRoute = async ({ url }) => {
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  const config = getWhatsAppConfig();

  if (mode === 'subscribe' && token === config.webhookVerifyToken) {
    console.info('[WhatsApp Webhook] Meta handshake başarıyla doğrulandı.');
    return new Response(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  console.warn('[WhatsApp Webhook] Yetkisiz doğrulama denemesi (Token uyuşmuyor).');
  return new Response('Verification token mismatch', { status: 403 });
};

/**
 * Meta Webhook Olay Bildirimi (POST)
 */
export const POST: APIRoute = async ({ request }) => {
  const config = getWhatsAppConfig();
  const rawBody = await request.text();
  const signature = request.headers.get('x-hub-signature-256');

  // 1. İmza Doğrulama — FAIL-CLOSED
  // appSecret tanımsızken doğrulamayı atlamak, herkesin panele sahte "gelen
  // misafir mesajı" enjekte edebilmesi demek. Auth'taki fail-closed ilkesiyle
  // aynı: secret yoksa olay kabul edilmez (Meta retry yapar, veri kaybı olmaz).
  if (!config.appSecret) {
    console.error('[WhatsApp Webhook] WHATSAPP_APP_SECRET tanımlı değil — olaylar reddediliyor (fail-closed).');
    return new Response('Webhook signature verification not configured', { status: 503 });
  }
  if (!validateMetaSignature(rawBody, signature, config.appSecret)) {
    console.warn('[WhatsApp Webhook] Geçersiz HMAC-SHA256 imzası!');
    return new Response('Invalid signature', { status: 401 });
  }

  let data: { object?: string; entry?: WhatsAppWebhookEntry[] };
  try {
    data = JSON.parse(rawBody);
  } catch {
    return new Response('Invalid JSON payload', { status: 400 });
  }

  if (data.object !== 'whatsapp_business_account' || !Array.isArray(data.entry)) {
    // Meta standart dışı ping
    return new Response('EVENT_RECEIVED', { status: 200 });
  }

  // 2. Gelen Mesajlar ve Durumları Çözümle
  for (const entry of data.entry) {
    for (const change of entry.changes || []) {
      const value = change.value;
      if (!value) continue;

      // Misafirden gelen mesajlar
      if (Array.isArray(value.messages) && value.messages.length > 0) {
        for (const msg of value.messages) {
          const fromPhone = msg.from;
          const text = msg.text?.body || '';
          const msgId = msg.id;
          const timestamp = msg.timestamp;

          console.info(`[WhatsApp Inbound] +${fromPhone}: "${text}" (ID: ${msgId})`);

          // Supabase Realtime ile operasyon paneline anlık bildir
          if (isSupabaseAdminConfigured()) {
            try {
              const supabase = getSupabaseAdmin();
              if (supabase) {
                const channel = supabase.channel('whatsapp_incoming');
                await channel.send({
                  type: 'broadcast',
                  event: 'inbound_message',
                  payload: {
                    from: fromPhone,
                    text,
                    messageId: msgId,
                    timestamp,
                    receivedAt: new Date().toISOString(),
                  },
                });
              }
            } catch (broadcastErr) {
              console.warn('[WhatsApp Webhook] Realtime yayın uyarısı:', broadcastErr);
            }
          }
        }
      }

      // Teslimat durum raporları (sent, delivered, read, failed)
      if (Array.isArray(value.statuses) && value.statuses.length > 0) {
        for (const status of value.statuses) {
          if (status.status === 'failed') {
            console.warn(
              `[WhatsApp Status] Mesaj iletilemedi! Alıcı: ${status.recipient_id}, Hata:`,
              status.errors
            );
          } else {
            console.info(
              `[WhatsApp Status] Mesaj ${status.status}: ${status.id} (Alıcı: ${status.recipient_id})`
            );
          }
        }
      }
    }
  }

  return new Response('EVENT_RECEIVED', {
    status: 200,
    headers: { 'Content-Type': 'text/plain' },
  });
};
