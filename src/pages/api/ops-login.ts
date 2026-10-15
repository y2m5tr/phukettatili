export const prerender = false;

import type { APIRoute } from 'astro';
import {
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  clearFailures,
  createSessionValue,
  isAuthConfigured,
  isRateLimited,
  recordFailure,
  retryAfterMs,
  verifyPasscode,
} from '../../lib/auth';
import { checkRateLimit, clearRateLimit } from '../../lib/server/rateLimit';

/** Giriş yapılabilecek paneller — open-redirect'i engellemek için beyaz liste. */
const ALLOWED_TARGETS: Record<string, 'admin' | 'field'> = {
  '/admin': 'admin',
  '/ekip': 'field',
};

function resolveTarget(next: unknown): string {
  return typeof next === 'string' && next in ALLOWED_TARGETS ? next : '/admin';
}

/**
 * POST /api/ops-login — şifreyi sunucuda doğrular, imzalı oturum çerezi basar.
 *
 * Şifre asla client'a gönderilmez; bu endpoint sunucu tarafında çalışır.
 */
export const POST: APIRoute = async ({ request, url, cookies, clientAddress }) => {
  const target = resolveTarget(url.searchParams.get('next'));

  if (!isAuthConfigured()) {
    return Response.json({ error: 'unconfigured' }, { status: 503 });
  }

  const limiterKey = clientAddress || 'unknown';
  if (isRateLimited(limiterKey)) {
    return Response.json(
      { error: 'rate_limited', retryAfterMs: retryAfterMs(limiterKey) },
      { status: 429 },
    );
  }

  // Kalıcı (cross-instance) limit: Supabase rate_limits tablosu.
  // 15 dakikada 5 deneme — instance'lar arası da sayılır.
  const persistent = await checkRateLimit('login', limiterKey, 5, 15 * 60);
  if (!persistent.allowed) {
    return Response.json(
      {
        error: 'rate_limited',
        retryAfterMs: persistent.retryAfterSeconds * 1000,
      },
      { status: 429, headers: { 'Retry-After': String(persistent.retryAfterSeconds) } },
    );
  }

  let passcode = '';
  try {
    const body = (await request.json()) as { passcode?: unknown };
    passcode = typeof body.passcode === 'string' ? body.passcode : '';
  } catch {
    return Response.json({ error: 'bad_request' }, { status: 400 });
  }

  if (!verifyPasscode(passcode)) {
    recordFailure(limiterKey);
    return Response.json({ error: 'invalid' }, { status: 401 });
  }

  clearFailures(limiterKey);
  await clearRateLimit('login', limiterKey);
  cookies.set(SESSION_COOKIE, createSessionValue(ALLOWED_TARGETS[target]), {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    maxAge: SESSION_TTL_SECONDS,
  });

  return Response.json({ ok: true, redirect: target });
};

/** POST /api/ops-logout benzeri ihtiyaç için basit çıkış. */
export const DELETE: APIRoute = async ({ cookies }) => {
  cookies.delete(SESSION_COOKIE, { path: '/' });
  return Response.json({ ok: true });
};
