// Sentry sunucu tarafı yapılandırması.
//
// SENTRY_DSN ortam değişkeni TANIMLI DEĞİLSE hiçbir şey gönderilmez ve
// SDK etkinleşmez — yerel geliştirmede sıfır ek maliyet. Vercel'de
// SENTRY_DSN eklendiği anda otomatik çalışmaya başlar.
//
// Kurulum: Vercel > Settings > Environment Variables > SENTRY_DSN
// (Sentry projenin Client Keys sayfasındaki DSN değeri)
import * as Sentry from '@sentry/astro';

const dsn = import.meta.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: import.meta.env.PROD ? 'production' : 'development',
    // Örnekleme: tam izleme maliyetli — hata izlemede her zaman %100,
    // performans izlerinde üretimde %10 yeterli.
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    // Admin/operasyon rotalarındaki beklenmedik API hataları en kritik
    // sinyaller — otomatik yakalanır, ek yapılandırma gerekmez.
  });
}
