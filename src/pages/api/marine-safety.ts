import type { APIRoute } from 'astro';
import { jsonOk, jsonError } from '../../lib/server/apiGuard';
import { checkRateLimit } from '../../lib/server/rateLimit';
import { getMarineSafetyStatus } from '../../lib/marineWeather';

export const prerender = false;

export const GET: APIRoute = async (context) => {
  const clientIp =
    context.clientAddress ||
    (context.request.headers.get('x-forwarded-for') || '').split(',')[0].trim() ||
    'unknown';

  const limiter = await checkRateLimit('marine-safety', clientIp, 30, 60);
  if (!limiter.allowed) {
    return jsonError(429, 'Çok fazla sorgu yapıldı.');
  }

  const url = new URL(context.request.url);
  const forceRefresh = url.searchParams.get('refresh') === 'true';

  const report = await getMarineSafetyStatus(forceRefresh);

  return jsonOk({
    ok: true,
    ...report,
  });
};
