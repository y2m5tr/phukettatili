/**
 * /api/auth/users — kullanıcı yönetimi (YALNIZCA owner).
 *
 *   GET    /api/auth/users                -> kullanıcı listesi (hash'siz!)
 *   POST   /api/auth/users                -> yeni kullanıcı (owner/manager/guide/driver)
 *   PUT    /api/auth/users                -> rol değiştirme / aktiflik / şifre sıfırlama
 *   DELETE /api/auth/users?id=<uuid>      -> kullanıcıyı sil
 *
 * Güvenlik:
 * - guardApi 'owner' seviyesi ister (yalnızca owner geçer; manager YOK).
 * - Liste yanıtlarında password_hash ASLA bulunmaz.
 * - Owner kendi hesabını silemez/pasifleştiremez (kilitlenmeyi önlemek için
 *   her zaman en az bir aktif owner kalmalı — bu kural burada uygulanır).
 */
import type { APIRoute } from 'astro';
import { SESSION_COOKIE, readMembershipSession, roleRank } from '../../../lib/auth';
import { jsonError, jsonOk } from '../../../lib/server/apiGuard';
import { hashPassword, validatePasswordPolicy } from '../../../lib/server/passwords';
import { getSupabaseAdmin, isSupabaseAdminConfigured } from '../../../lib/server/supabaseAdmin';

export const prerender = false;

const ROLES = ['owner', 'manager', 'guide', 'driver'] as const;
type MembershipRole = (typeof ROLES)[number];

function isValidRole(r: unknown): r is MembershipRole {
  return typeof r === 'string' && (ROLES as readonly string[]).includes(r);
}

const LIST_COLUMNS = 'id, username, full_name, role, is_active, created_at, last_login_at';

async function countActiveOwners(db: NonNullable<ReturnType<typeof getSupabaseAdmin>>): Promise<number> {
  const { count } = await db
    .from('users')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'owner')
    .eq('is_active', true);
  return count ?? 0;
}

export const GET: APIRoute = async (context) => {
  const guard = guardOwner(context);
  if (!guard.allowed) return guard.response!;

  if (!isSupabaseAdminConfigured()) return jsonError(503, 'Veritabanı yapılandırılmamış.');
  const db = getSupabaseAdmin();
  if (!db) return jsonError(503, 'Veritabanı istemcisi oluşturulamadı.');

  const { data, error } = await db.from('users').select(LIST_COLUMNS).order('created_at', { ascending: true });
  if (error) return jsonError(502, 'Kullanıcı listesi alınamadı.');

  return jsonOk({ users: data ?? [] });
};

export const POST: APIRoute = async (context) => {
  const guard = guardOwner(context);
  if (!guard.allowed) return guard.response!;

  let body: Record<string, unknown>;
  try {
    body = (await context.request.json()) as Record<string, unknown>;
  } catch {
    return jsonError(400, 'Geçersiz istek.');
  }

  const username = typeof body.username === 'string' ? body.username.trim().toLowerCase() : '';
  const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const role = body.role;

  if (!/^[a-z0-9_.-]{3,32}$/.test(username)) {
    return jsonError(422, 'Kullanıcı adı 3-32 karakter, küçük harf/rakam/._- olmalı.');
  }
  if (!fullName || fullName.length > 80) return jsonError(422, 'Ad soyad gerekli (en fazla 80 karakter).');
  if (!isValidRole(role)) return jsonError(422, 'Rol geçersiz (owner/manager/guide/driver).');
  const policyError = validatePasswordPolicy(password);
  if (policyError) return jsonError(422, policyError);

  if (!isSupabaseAdminConfigured()) return jsonError(503, 'Veritabanı yapılandırılmamış.');
  const db = getSupabaseAdmin();
  if (!db) return jsonError(503, 'Veritabanı istemcisi oluşturulamadı.');

  const passwordHash = await hashPassword(password);
  const { error } = await db
    .from('users')
    .insert({ username, full_name: fullName, role, password_hash: passwordHash });

  if (error) {
    if (error.code === '23505') return jsonError(409, 'Bu kullanıcı adı zaten alınmış.');
    return jsonError(502, 'Kullanıcı oluşturulamadı.');
  }
  return jsonOk({ ok: true });
};

export const PUT: APIRoute = async (context) => {
  const guard = guardOwner(context);
  if (!guard.allowed) return guard.response!;

  let body: Record<string, unknown>;
  try {
    body = (await context.request.json()) as Record<string, unknown>;
  } catch {
    return jsonError(400, 'Geçersiz istek.');
  }

  const userId = typeof body.id === 'string' ? body.id : '';
  if (!/^[0-9a-f-]{36}$/i.test(userId)) return jsonError(422, 'Geçersiz kullanıcı kimliği.');
  if (!isSupabaseAdminConfigured()) return jsonError(503, 'Veritabanı yapılandırılmamış.');
  const db = getSupabaseAdmin();
  if (!db) return jsonError(503, 'Veritabanı istemcisi oluşturulamadı.');

  const { data: current, error: fetchErr } = await db
    .from('users')
    .select('id, role, is_active')
    .eq('id', userId)
    .maybeSingle();
  if (fetchErr || !current) return jsonError(404, 'Kullanıcı bulunamadı.');

  const updates: Record<string, unknown> = {};

  if (body.role !== undefined) {
    if (!isValidRole(body.role)) return jsonError(422, 'Rol geçersiz.');
    if (userId === guard.userId && body.role !== 'owner') {
      return jsonError(409, 'Kendi yönetici hesabınızın rolünü düşüremezsiniz.');
    }
    if (current.role === 'owner' && current.is_active && body.role !== 'owner' && (await countActiveOwners(db)) <= 1) {
      return jsonError(409, 'Son aktif yöneticinin rolü düşürülemez.');
    }
    updates.role = body.role;
  }
  if (body.isActive !== undefined) {
    if (userId === guard.userId && body.isActive === false) {
      return jsonError(409, 'Kendi hesabınızı pasifleştiremezsiniz.');
    }
    if (current.role === 'owner' && current.is_active && body.isActive === false && (await countActiveOwners(db)) <= 1) {
      return jsonError(409, 'Son aktif yönetici pasifleştirilemez.');
    }
    updates.is_active = Boolean(body.isActive);
  }
  if (body.newPassword !== undefined) {
    const policyError = validatePasswordPolicy(String(body.newPassword));
    if (policyError) return jsonError(422, policyError);
    updates.password_hash = await hashPassword(String(body.newPassword));
  }

  if (Object.keys(updates).length === 0) return jsonError(400, 'Güncellenecek alan yok.');

  const { error } = await db.from('users').update(updates).eq('id', userId);
  if (error) return jsonError(502, 'Güncelleme başarısız.');
  return jsonOk({ ok: true });
};

export const DELETE: APIRoute = async (context) => {
  const guard = guardOwner(context);
  if (!guard.allowed) return guard.response!;

  const userId = context.url.searchParams.get('id') || '';
  if (!/^[0-9a-f-]{36}$/i.test(userId)) return jsonError(422, 'Geçersiz kullanıcı kimliği.');
  if (userId === guard.userId) {
    return jsonError(409, 'Kendi hesabınızı silemezsiniz.');
  }
  if (!isSupabaseAdminConfigured()) return jsonError(503, 'Veritabanı yapılandırılmamış.');
  const db = getSupabaseAdmin();
  if (!db) return jsonError(503, 'Veritabanı istemcisi oluşturulamadı.');

  const { data: current, error: fetchErr } = await db
    .from('users')
    .select('role, is_active')
    .eq('id', userId)
    .maybeSingle();
  if (fetchErr || !current) return jsonError(404, 'Kullanıcı bulunamadı.');

  if (current.role === 'owner' && current.is_active && (await countActiveOwners(db)) <= 1) {
    return jsonError(409, 'Son aktif yönetici silinemez.');
  }

  const { error } = await db.from('users').delete().eq('id', userId);
  if (error) return jsonError(502, 'Silme başarısız.');
  return jsonOk({ ok: true });
};

/** Owner-only guard — üyelik çerezi zorunlu (eski şifre çerezi KABUL EDİLMEZ). */
function guardOwner(context: Parameters<APIRoute>[0]): { allowed: boolean; userId?: string; response?: Response } {
  const session = readMembershipSession(context.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    return { allowed: false, response: jsonError(401, 'Üyelik oturumu gerekli.') };
  }
  if (roleRank(session.role) < 4) {
    return { allowed: false, response: jsonError(403, 'Kullanıcı yönetimi yalnızca yöneticiye açıktır.') };
  }
  return { allowed: true, userId: session.userId };
}
