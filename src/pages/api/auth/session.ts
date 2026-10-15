/**
 * /api/auth/session — üyelik oturumu uçları.
 *
 *   GET    /api/auth/session      -> { user: { username, fullName, role } } | 401
 *   DELETE /api/auth/session      -> çıkış (çerezi siler)
 *   POST   /api/auth/session      -> şifre değiştirme (gövde: { currentPassword, newPassword })
 *
 * Şifre değiştirme: herkes KENDİ şifresini değiştirebilir. Mevcut şifre
 * doğrulanmadan yeni şifre yazılmaz; yeni şifre güç politikasından geçer.
 */
import type { APIRoute } from 'astro';
import { SESSION_COOKIE, readMembershipSession } from '../../../lib/auth';
import { jsonError, jsonOk } from '../../../lib/server/apiGuard';
import { verifyPassword, hashPassword, validatePasswordPolicy } from '../../../lib/server/passwords';
import { getSupabaseAdmin, isSupabaseAdminConfigured } from '../../../lib/server/supabaseAdmin';

export const prerender = false;

export const GET: APIRoute = async ({ cookies }) => {
  const session = readMembershipSession(cookies.get(SESSION_COOKIE)?.value);
  if (!session) return jsonError(401, 'Üyelik oturumu yok.');

  if (!isSupabaseAdminConfigured()) return jsonError(503, 'Veritabanı yapılandırılmamış.');
  const db = getSupabaseAdmin();
  if (!db) return jsonError(503, 'Veritabanı istemcisi oluşturulamadı.');

  const { data: user, error } = await db
    .from('users')
    .select('username, full_name, role, is_active')
    .eq('id', session.userId)
    .maybeSingle();

  if (error || !user || !user.is_active) {
    // Kullanıcı silinmiş/pasifleştirilmiş: çerez anlamsız — 401 ile istemciyi
    // login'e yönlendirir. (12 sa TTL zaten sınırlıyor; burası ekstra.)
    return jsonError(401, 'Oturum geçersiz.');
  }

  return jsonOk({
    user: {
      username: user.username,
      fullName: user.full_name,
      role: user.role,
    },
  });
};

export const DELETE: APIRoute = async ({ cookies }) => {
  cookies.delete(SESSION_COOKIE, { path: '/' });
  return jsonOk({ ok: true });
};

export const POST: APIRoute = async ({ request, cookies }) => {
  const session = readMembershipSession(cookies.get(SESSION_COOKIE)?.value);
  if (!session) return jsonError(401, 'Üyelik oturumu yok.');

  if (!isSupabaseAdminConfigured()) return jsonError(503, 'Veritabanı yapılandırılmamış.');
  const db = getSupabaseAdmin();
  if (!db) return jsonError(503, 'Veritabanı istemcisi oluşturulamadı.');

  let currentPassword = '';
  let newPassword = '';
  try {
    const body = (await request.json()) as { currentPassword?: unknown; newPassword?: unknown };
    currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : '';
    newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';
  } catch {
    return jsonError(400, 'Geçersiz istek.');
  }
  if (!currentPassword || !newPassword) return jsonError(400, 'Mevcut ve yeni şifre gerekli.');

  const policyError = validatePasswordPolicy(newPassword);
  if (policyError) return jsonError(422, policyError);

  const { data: user, error: fetchErr } = await db
    .from('users')
    .select('password_hash')
    .eq('id', session.userId)
    .maybeSingle();
  if (fetchErr || !user) return jsonError(401, 'Kullanıcı bulunamadı.');

  if (!(await verifyPassword(currentPassword, user.password_hash))) {
    return jsonError(401, 'Mevcut şifre hatalı.');
  }

  const newHash = await hashPassword(newPassword);
  const { error: updateErr } = await db
    .from('users')
    .update({ password_hash: newHash })
    .eq('id', session.userId);
  if (updateErr) return jsonError(502, 'Şifre güncellenemedi.');

  return jsonOk({ ok: true });
};
