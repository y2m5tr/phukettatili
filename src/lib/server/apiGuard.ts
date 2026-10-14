/**
 * /api/* route'ları için ortak oturum koruması.
 *
 * Middleware sayfaları korur ama API route'ları JSON 401 ile yanıtlamalı
 * (redirect değil). Bu yardımcı, route başına yazılan kontrolü tek
 * kaynağa indirger.
 */
import { SESSION_COOKIE, isAuthConfigured, readSessionValue } from '../auth';
import type { APIRoute } from 'astro';

export type ApiRole = 'admin' | 'field';

export interface ApiGuardResult {
  allowed: boolean;
  /** 401 dönerken yanıt olarak gönderilecek hazır Response. */
  response?: Response;
}

/**
 * İsteğin oturumunu doğrular.
 *
 * `requiredRole` verilmezse: geçerli her oturum (admin VEYA field) geçer.
 * `requiredRole = 'field'` ise: field VEYA admin geçer (admin her şeyi görebilir).
 * `requiredRole = 'admin'` ise: YALNIZCA admin geçer.
 */
export function guardApi(context: Parameters<APIRoute>[0], requiredRole?: ApiRole): ApiGuardResult {
  if (!isAuthConfigured()) {
    return {
      allowed: false,
      response: jsonError(503, 'Sunucu kimlik doğrulaması yapılandırılmamış (ADMIN_PASSCODE yok).'),
    };
  }

  const session = readSessionValue(context.cookies.get(SESSION_COOKIE)?.value);

  const allowed =
    session === 'admin' ||
    (requiredRole !== 'admin' && session === 'field');

  if (!allowed) {
    return {
      allowed: false,
      response: jsonError(401, 'Yetkisiz istek. Oturum açın.'),
    };
  }
  return { allowed: true };
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
