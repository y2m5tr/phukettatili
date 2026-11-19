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

  // 1. SEO Normalizasyonu: Parametreli eski kategori URL'lerini temiz SEO Hub URL'lerine 301 ile yönlendir
  // Google'ın /turlar/?kategori=... URL'lerini "Doğru standart etikete sahip alternatif sayfa" olarak
  // işaretlemesini önler, tarama bütçesini doğrudan ana SEO kategori hub'ına aktarır.
  if (pathname === '/turlar') {
    const kat = context.url.searchParams.get('kategori') || context.url.searchParams.get('category');
    if (kat) {
      const CATEGORY_MAP: Record<string, string> = {
        'island-tours': '/turlar/kategori/ada-turlari/',
        'ada-turlari': '/turlar/kategori/ada-turlari/',
        'adventure-tours': '/turlar/kategori/macera-ve-doga/',
        'macera-ve-doga': '/turlar/kategori/macera-ve-doga/',
        'entertainment-tours': '/turlar/kategori/kultur-ve-gosteri/',
        'kultur-ve-gosteri': '/turlar/kategori/kultur-ve-gosteri/',
        'private-charters': '/turlar/kategori/ozel-yat-kiralama/',
        'ozel-yat-kiralama': '/turlar/kategori/ozel-yat-kiralama/',
      };
      const targetHub = CATEGORY_MAP[kat.toLowerCase()];
      if (targetHub) {
        return context.redirect(targetHub, 301);
      }
    }
  }

  // 2. Trailing slash normalizasyonu:
  // /turlar, /blog, /iletisim gibi rotaların sonuna slash eklemeden 200 dönüp kopya URL üretmesini
  // engeller. Google botuna 301 kalıcı yönlendirme dönerek tek ve kesin canonical URL'ye yönlendirir.
  const rawPath = context.url.pathname;
  if (
    context.request.method === 'GET' &&
    rawPath.length > 1 &&
    !rawPath.endsWith('/') &&
    !rawPath.includes('.') &&
    !rawPath.startsWith('/api') &&
    !rawPath.startsWith('/_') &&
    !rawPath.startsWith('/admin') &&
    !rawPath.startsWith('/ops-login') &&
    !rawPath.startsWith('/bilet')
  ) {
    const search = context.url.search || '';
    return context.redirect(`${rawPath}/${search}`, 301);
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
