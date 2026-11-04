/**
 * /api/newsletter-subscribe — Bülten (izin) aboneliği ucu
 *
 * Tatil Asistanı quiz sonucu ve site formlarından e-posta adresi
 * toplar. İzin pazarlama varlığının (Handley'nin "mektup" kanalı)
 * ilk temas noktasıdır.
 *
 * GÜVENLİK & KORUMA:
 * - checkRateLimit ile IP başına dakikada maksimum 5 abonelik.
 * - E-posta formatı doğrulaması + normalizasyon (küçük harf, trim).
 * - Yetki gerektirmez (halka açık); RLS default deny tabloya yalnızca
 *   servis rolü üzerinden yazılmasını sağlar.
 * - Çift kayıt: unique email — mevcut kayıtta ilgi alanı ve kaynak
 *   etiketi güncellenir, hata dönmez (idempotent).
 * - Her abonelik bir GA4 'generate_lead' sinyalidir (istemcide
 *   Tracking.astro event'i ile).
 */

import type { APIRoute } from 'astro';
import { jsonError, jsonOk } from '../../lib/server/apiGuard';
import { checkRateLimit } from '../../lib/server/rateLimit';
import { getSupabaseAdmin, isSupabaseAdminConfigured } from '../../lib/server/supabaseAdmin';

export const prerender = false;

const VALID_SOURCES = new Set(['quiz', 'blog', 'home', 'site']);
const VALID_INTERESTS = new Set(['honeymoon', 'family', 'adventure', 'vip_luxury']);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

interface SubscribePayload {
  email?: string;
  name?: string;
  source?: string;
  interest?: string;
  planSummary?: Record<string, unknown>;
}

export const POST: APIRoute = async (context) => {
  const clientIp =
    context.clientAddress ||
    (context.request.headers.get('x-forwarded-for') || '').split(',')[0].trim() ||
    'unknown';

  const limiter = await checkRateLimit('newsletter-subscribe', clientIp, 5, 60);
  if (!limiter.allowed) {
    return jsonError(429, 'Çok fazla deneme. Lütfen bir dakika sonra tekrar deneyin.');
  }

  let payload: SubscribePayload;
  try {
    payload = (await context.request.json()) as SubscribePayload;
  } catch {
    return jsonError(400, 'Geçersiz istek gövdesi.');
  }

  const email = (payload.email || '').trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return jsonError(400, 'Lütfen geçerli bir e-posta adresi girin.');
  }

  const name = (payload.name || '').trim().slice(0, 120) || null;
  const source = VALID_SOURCES.has(payload.source || '') ? payload.source : 'site';
  const interest = VALID_INTERESTS.has(payload.interest || '') ? payload.interest : null;
  const planSummary =
    payload.planSummary && typeof payload.planSummary === 'object'
      ? payload.planSummary
      : null;

  // Bulut yapılandırılmamışsa site statik olarak çalışmaya devam eder;
  // abonelik yerelde saklanamaz, bu yüzden dürüst hata döner.
  if (!isSupabaseAdminConfigured()) {
    return jsonError(503, 'Abonelik servisi şu anda yapılandırılmamış.');
  }

  const db = getSupabaseAdmin();
  if (!db) {
    return jsonError(503, 'Abonelik servisine ulaşılamadı.');
  }

  // Idempotent upsert: aynı e-posta hata vermez, ilgi/kaynak güncellenir.
  const { error } = await db.from('newsletter_subscribers').upsert(
    {
      email,
      name,
      source,
      interest,
      plan_summary: planSummary,
    },
    { onConflict: 'email' },
  );

  if (error) {
    console.error('newsletter-subscribe: kayıt hatası', error.message);
    return jsonError(500, 'Kayıt sırasında bir sorun oluştu, lütfen tekrar deneyin.');
  }

  return jsonOk({ email, subscribed: true });
};
