import type { APIRoute } from 'astro';
import { jsonOk } from '../../lib/server/apiGuard';
import { checkRateLimit } from '../../lib/server/rateLimit';
import { getSupabaseAdmin, isSupabaseAdminConfigured } from '../../lib/server/supabaseAdmin';

export const prerender = false;

export const GET: APIRoute = async (context) => {
  const clientIp =
    context.clientAddress ||
    (context.request.headers.get('x-forwarded-for') || '').split(',')[0].trim() ||
    'unknown';

  const limiter = await checkRateLimit('api-health', clientIp, 60, 60);
  if (!limiter.allowed) {
    return new Response(JSON.stringify({ ok: false, error: 'Çok fazla istek yapıldı.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }

  const startTime = Date.now();
  let supabaseStatus: 'connected' | 'not_configured' | 'error' = 'not_configured';
  let supabaseLatencyMs: number | null = null;
  let supabaseError: string | null = null;

  if (isSupabaseAdminConfigured()) {
    const admin = getSupabaseAdmin();
    if (admin) {
      try {
        const pingStart = Date.now();
        const { error } = await admin
          .from('site_settings')
          .select('key', { count: 'exact', head: true });

        supabaseLatencyMs = Date.now() - pingStart;
        if (error) {
          // If table doesn't exist, try bookings or general auth check
          const fallbackCheck = await admin.from('bookings').select('id', { count: 'exact', head: true });
          if (fallbackCheck.error) {
            supabaseStatus = 'error';
            supabaseError = error.message;
          } else {
            supabaseStatus = 'connected';
          }
        } else {
          supabaseStatus = 'connected';
        }
      } catch (err: any) {
        supabaseStatus = 'error';
        supabaseError = err?.message || 'Bağlantı hatası';
      }
    }
  }

  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const formattedDate = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  return jsonOk({
    status: 'healthy',
    timestamp: now.toISOString(),
    formattedDate,
    uptimeSeconds: Math.floor(process.uptime ? process.uptime() : 0),
    services: {
      supabase: {
        configured: isSupabaseAdminConfigured(),
        status: supabaseStatus,
        latencyMs: supabaseLatencyMs,
        ...(supabaseError ? { error: supabaseError } : {}),
      },
      sitemaps: [
        '/sitemap.xml',
        '/sitemap-turlar.xml',
        '/sitemap-blog.xml',
      ],
      features: {
        whatsappCloudApi: !!(process.env.WHATSAPP_CLOUD_API_TOKEN || process.env.WHATSAPP_TOKEN),
        googleSearchConsole: true,
        guestBoardingPassPdf: true,
      },
    },
    version: '1.0.0',
    durationMs: Date.now() - startTime,
  });
};
