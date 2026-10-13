import { defineMiddleware } from 'astro:middleware';
import {
  SESSION_COOKIE,
  isAuthConfigured,
  readSessionValue,
} from './lib/auth';

/** Oturum gerektiren paneller ve izin verilen roller. */
const PROTECTED: Record<string, 'admin' | 'field'> = {
  '/admin': 'admin',
  '/ekip': 'field',
};

/**
 * Operasyon panellerini sunucu tarafında korur.
 *
 * Oturum yoksa panel içeriği hiç render edilmez — ziyaretçi doğrudan giriş
 * sayfasına yönlendirilir. Böylece rezervasyon verileri ve React bundle'ı
 * yetkisiz tarayıcılara inmez.
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = context.url.pathname.replace(/\/+$/, '') || '/';

  const requiredRole = PROTECTED[pathname];
  if (!requiredRole) return next();

  // Şifre tanımlı değilse paneller kilitli kalır (fail-closed).
  if (!isAuthConfigured()) {
    return context.redirect(`/ops-login?next=${encodeURIComponent(pathname)}&error=unconfigured`);
  }

  const session = readSessionValue(context.cookies.get(SESSION_COOKIE)?.value);

  // 'admin' rolü her iki paneli de görebilir, 'field' sadece /ekip'i.
  const allowed = session === 'admin' || session === requiredRole;
  if (allowed) return next();

  return context.redirect(`/ops-login?next=${encodeURIComponent(pathname)}`);
});
