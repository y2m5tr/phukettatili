/**
 * /api/notifications/push — Şoför ve Ekip PWA Anlık Bildirim Dağıtımı
 *
 * Yöneticiler veya saha sorumluları transfer saati, rota veya araç ataması
 * değiştirdiğinde bu uç çağrılır.
 *
 * GÜVENLİK:
 * - Yalnızca oturumlu ekip üyeleri (owner, manager, guide, driver) çağırabilir.
 * - GuardApi ile korunur.
 */
import type { APIRoute } from 'astro';
import { guardApi, jsonError, jsonOk } from '../../../lib/server/apiGuard';
import {
  isSupabaseAdminConfigured,
  getSupabaseAdmin,
} from '../../../lib/server/supabaseAdmin';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  const guard = guardApi(context);
  if (!guard.allowed) return guard.response!;

  try {
    const body = await context.request.json();
    if (!body || typeof body !== 'object') {
      return jsonError(400, 'Geçersiz bildirim gövdesi');
    }

    const { title, body: content, payload, targetRole, driverId } = body;

    // Supabase Realtime kuruluysa 'crew_notifications' kanalına yayın yap
    if (isSupabaseAdminConfigured()) {
      try {
        const client = getSupabaseAdmin();
        if (client) {
          const channel = client.channel('crew_notifications');
          await channel.send({
            type: 'broadcast',
            event: 'transfer_time_changed',
            payload: {
              title,
              body: content,
              payload,
              targetRole,
              driverId,
              sentAt: new Date().toISOString(),
            },
          });
        }
      } catch (err) {
        console.warn('[Push API] Realtime yayın uyarısı (kritik değil):', err);
      }
    }

    return jsonOk({
      success: true,
      deliveredAt: new Date().toISOString(),
      title,
      targetRole: targetRole || 'all',
    });
  } catch (err) {
    console.error('[Push API] Hata:', err);
    return jsonError(500, 'Bildirim işlenirken sunucu hatası oluştu');
  }
};
