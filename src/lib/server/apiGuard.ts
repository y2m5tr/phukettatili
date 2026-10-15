/**
 * /api/* route'ları için ortak oturum koruması.
 *
 * Middleware sayfaları korur ama API route'ları JSON 401 ile yanıtlamalı
 * (redirect değil). Bu yardımcı, route başına yazılan kontrolü tek
 * kaynağa indirger.
 */
import { SESSION_COOKIE, isAuthConfigured, readSessionValue, readMembershipSession, roleRank, type OpsRole } from '../auth';
import type { APIRoute } from 'astro';

export type ApiRole = OpsRole;

export interface ApiGuardResult {
  allowed: boolean;
  /** 401 dönerken yanıt olarak gönderilecek hazır Response. */
  response?: Response;
  /** Geçerli oturumun rolü (üyelik sisteminden geliyorsa kullanıcı rolü). */
  role?: OpsRole;
}

/**
 * İsteğin oturumunu doğrular — rol hiyerarşisi: owner > manager > guide > driver.
 *
 * `requiredRole` verilmezse: geçerli her oturum geçer.
 * `requiredRole` verilirse: o ROLÜN SEVİYESİNE EŞİT VEYA ÜSTÜ olan herkes geçer
 * (owner her şeyi yapabilir, manager saha uçlarını da kullanabilir vb.).
 *
 * Kural eşlemesi (eski iki-rol çağrıları da çalışır):
 *   'admin' → owner düzeyi (manager DAHİL DEĞİL — admin-only uçlar)
 *   'field' → guide düzeyi (guide ve üzeri)
 */
export function guardApi(context: Parameters<APIRoute>[0], requiredRole?: ApiRole): ApiGuardResult {
  const required =
    requiredRole === 'admin' ? 4 :
    requiredRole === 'field' ? 2 :
    requiredRole ? roleRank(requiredRole) : 1;

  // Üyelik oturumu önce: yeni sistemin çerezi varsa o kullanılır.
  const membership = readMembershipSession(context.cookies.get(SESSION_COOKIE)?.value);
  if (membership) {
    if (roleRank(membership.role) >= required) {
      return { allowed: true, role: membership.role };
    }
    return {
      allowed: false,
      response: jsonError(403, 'Bu işlem için yetkiniz yok.'),
    };
  }

  // Geçiş dönemi: eski imzalı çerezler (şifre tabanlı).
  if (!isAuthConfigured()) {
    return {
      allowed: false,
      response: jsonError(503, 'Sunucu kimlik doğrulaması yapılandırılmamış.'),
    };
  }
  const session = readSessionValue(context.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    return {
      allowed: false,
      response: jsonError(401, 'Yetkisiz istek. Oturum açın.'),
    };
  }
  if (roleRank(session) < required) {
    return {
      allowed: false,
      response: jsonError(403, 'Bu işlem için yetkiniz yok.'),
    };
  }
  return { allowed: true, role: session };
}

/** Tek tip JSON hata yanıtı. */
export function jsonError(status: number, message: string, cacheSeconds = 0): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: jsonHeaders(cacheSeconds),
  });
}

/** Tek tip JSON başarı yanıtı. */
export function jsonOk(data: unknown, cacheSeconds = 0): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: jsonHeaders(cacheSeconds),
  });
}

function jsonHeaders(cacheSeconds: number): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json; charset=utf-8',
  };
  // Hassas operasyon verisi asla CDN/ara katmanda saklanmamalı.
  if (cacheSeconds <= 0) {
    headers['Cache-Control'] = 'no-store';
  }
  return headers;
}
