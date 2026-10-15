/**
 * POST /api/auth/login — üyelik sistemi girişi (kullanıcı adı + şifre).
 *
 * Doğrulama zinciri:
 *   1. Hız limiti (in-memory + Supabase kalıcı — brute-force koruması)
 *   2. users tablosundan kullanıcı çek (RLS bypass: servis rolü)
 *   3. scrypt hash doğrulaması (sabit zamanlı)
 *   4. Aktiflik kontrolü (pasif kullanıcı giriş yapamaz)
 *   5. Başarılıysa imzalı üyelik çerezi bas + last_login_at güncelle
 *
 * Güvenlik notları:
 * - Hata mesajları kullanıcı adı mı şifre mi yanlış diye AYIRT ETMEZ
 *   (kullanıcı adı taramasını zorlaştırmak için hep aynı mesaj).
 * - Başarısız denemeler iki limiter'a da yazılır.
 * - Şifre asla log'a/client'a gitmez.
 */
import type { APIRoute } from 'astro';
import {
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  clearFailures,
  createMembershipSessionValue,
  isRateLimited,
  recordFailure,
} from '../../../lib/auth';
import { jsonError, jsonOk } from '../../../lib/server/apiGuard';
import { checkRateLimit, clearRateLimit } from '../../../lib/server/rateLimit';
import { verifyPassword } from '../../../lib/server/passwords';
import { getSupabaseAdmin, isSupabaseAdminConfigured } from '../../../lib/server/supabaseAdmin';

export const prerender = false;

interface UserRow {
  id: string;
  username: string;
  full_name: string;
  role: 'owner' | 'manager' | 'guide' | 'driver';
  is_active: boolean;
  password_hash: string;
}

export const POST: APIRoute = async ({ request, cookies, clientAddress }) => {
  const ip = clientAddress || 'unknown';

  // 1. Hız limitleri (önce in-memory — Supabase ayarlı değilse bile korur).
  if (isRateLimited(ip)) {
    return jsonError(429, 'Çok fazla deneme. Lütfen bir süre bekleyin.');
  }
  const persistent = await checkRateLimit('auth', ip, 10, 15 * 60);
  if (!persistent.allowed) {
    return new Response(JSON.stringify({ error: 'rate_limited' }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'Retry-After': String(persistent.retryAfterSeconds),
      },
    });
  }

  if (!isSupabaseAdminConfigured()) {
    return jsonError(503, 'Üyelik veritabanı yapılandırılmamış (SUPABASE_SERVICE_ROLE_KEY yok).');
  }
  const db = getSupabaseAdmin();
  if (!db) return jsonError(503, 'Veritabanı istemcisi oluşturulamadı.');

  // 2. Gövdeyi oku.
  let username = '';
  let password = '';
  try {
    const body = (await request.json()) as { username?: unknown; password?: unknown };
    username = typeof body.username === 'string' ? body.username.trim().toLowerCase() : '';
    password = typeof body.password === 'string' ? body.password : '';
  } catch {
    return jsonError(400, 'Geçersiz istek.');
  }
  if (!username || !password) return jsonError(400, 'Kullanıcı adı ve şifre gerekli.');

  // 3. Kullanıcıyı çek.
  const { data: user, error } = await db
    .from('users')
    .select('id, username, full_name, role, is_active, password_hash')
    .eq('username', username)
    .maybeSingle<UserRow>();

  if (error) return jsonError(502, 'Veritabanı hatası.');

  // 4. Doğrula — kullanıcı yok/hash bozuk/şifre yanlış hepsi AYNI yanıtı verir.
  const valid = user && user.is_active && (await verifyPassword(password, user.password_hash));
  if (!user || !valid) {
    recordFailure(ip);
    return jsonError(401, 'Kullanıcı adı veya şifre hatalı.');
  }

  // 5. Oturum çerezi + last_login_at.
  clearFailures(ip);
  await clearRateLimit('auth', ip);

  await db.from('users').update({ last_login_at: new Date().toISOString() }).eq('id', user.id);

  cookies.set(SESSION_COOKIE, createMembershipSessionValue(user.id, user.role), {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    maxAge: SESSION_TTL_SECONDS,
  });

  // Yönlendirme hedefi: rehber/şoför doğrudan transfer & manifestoya, diğerleri ana panele.
  const target = user.role === 'guide' || user.role === 'driver' ? '/admin?tab=transfers' : '/admin';

  return jsonOk({
    ok: true,
    redirect: target,
    user: { username: user.username, fullName: user.full_name, role: user.role },
  });
};
