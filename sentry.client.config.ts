// Sentry tarayıcı tarafı yapılandırması.
//
// SENTRY_DSN (public) TANIMLI DEĞİLSE SDK hiç yüklenmez — ziyaretçiler
// için sıfır ek JS maliyeti. DSN public bir değerdir; gizli tutulması
// gerekmez (Sentry'nin tasarımı böyledir), ama istenmeyen gürültüyü
// önlemek için tarayıcı tarafında yalnızca hata izleme açılır.
import * as Sentry from '@sentry/astro';

const dsn = import.meta.env.PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: import.meta.env.PROD ? 'production' : 'development',
    // Tarayıcıda performans izleme kapalı — paket boyutu ve gürültü azalır,
    // hatalar (React error boundary'leri dahil) %100 yakalanır.
    tracesSampleRate: 0,
  });
}
