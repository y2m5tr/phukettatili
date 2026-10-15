import { defineMiddleware } from 'astro:middleware';
import {
  SESSION_COOKIE,
  isAuthConfigured,
  readSessionValue,
  readMembershipSession,
  roleRank,
} from './lib/auth';

/** Oturum gerektiren paneller ve erişim için gereken minimum rol seviyesi. */
const PROTECTED: Record<string, number> = {
  '/admin': 1, // driver ve üzeri (tüm acenta ekibi tek yönetim panelini kullanır)
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

  // /ekip rotası artık /admin?tab=transfers içine taşındı
  if (pathname === '/ekip') {
    return context.redirect('/admin?tab=transfers');
  }

  const requiredRank = PROTECTED[pathname];
  if (!requiredRank) return next();

  // Üyelik çerezi önce — yeni sistem.
  const membership = readMembershipSession(context.cookies.get(SESSION_COOKIE)?.value);
  if (membership) {
    if (roleRank(membership.role) >= requiredRank) return next();
    return context.redirect('/ops-login');
  }

  // Geçiş dönemi: şifre tanımlı değilse paneller kilitli kalır (fail-closed).
  if (!isAuthConfigured()) {
    return context.redirect(`/ops-login?next=${encodeURIComponent(pathname)}&error=unconfigured`);
  }

  const session = readSessionValue(context.cookies.get(SESSION_COOKIE)?.value);

  if (session && roleRank(session) >= requiredRank) return next();

  return context.redirect(`/ops-login?next=${encodeURIComponent(pathname)}`);
});
