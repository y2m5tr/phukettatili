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
  '/admin': 3, // manager ve üzeri (owner dahil)
  '/ekip': 1,  // driver ve üzeri (guide, manager, owner dahil)
};

/**
 * Operasyon panellerini sunucu tarafında korur.
 *
 * Oturum yoksa panel içeriği hiç render edilmez — ziyaretçi doğrudan giriş
 * sayfasına yönlendirilir. Böylece rezervasyon verileri ve React bundle'ı
 * yetkisiz tarayıcılara inmez.
 *
 * ÜYELİK SİSTEMİ: rol hiyerarşisi owner(4) > manager(3) > guide(2) >
 * driver(1). /admin için manager+; /ekip için driver+ yeterlidir.
 * Eski şifre-tabanlı çerezler (admin/field) geçiş döneminde kabul edilir.
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = context.url.pathname.replace(/\/+$/, '') || '/';

  const requiredRank = PROTECTED[pathname];
  if (!requiredRank) return next();

  // Üyelik çerezi önce — yeni sistem.
  const membership = readMembershipSession(context.cookies.get(SESSION_COOKIE)?.value);
  if (membership) {
    if (roleRank(membership.role) >= requiredRank) return next();
    // Yetkisi yetmeyen ÜYE: kendi seviyesine uygun panele yönlendirilir.
    const fallback = roleRank(membership.role) >= 3 ? '/admin' : '/ekip';
    const target = fallback === pathname ? '/ops-login' : fallback;
    return context.redirect(target);
  }

  // Geçiş dönemi: şifre tanımlı değilse paneller kilitli kalır (fail-closed).
  if (!isAuthConfigured()) {
    return context.redirect(`/ops-login?next=${encodeURIComponent(pathname)}&error=unconfigured`);
  }

  const session = readSessionValue(context.cookies.get(SESSION_COOKIE)?.value);

  // 'admin' (4) her iki paneli de görebilir, 'field' (2) sadece /ekip'i (1).
  if (session && roleRank(session) >= requiredRank) return next();
  if (session) {
    const fallback = roleRank(session) >= 3 ? '/admin' : '/ekip';
    const target = fallback === pathname ? '/ops-login' : fallback;
    return context.redirect(target);
  }

  return context.redirect(`/ops-login?next=${encodeURIComponent(pathname)}`);
});
