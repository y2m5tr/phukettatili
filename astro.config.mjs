// @ts-check
import { defineConfig, envField } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import sentryAstro from '@sentry/astro';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';

// Çift Dağıtım Desteği: Linux VPS (Node.js Standalone) & Vercel Serverless
let adapter = vercel();
if (process.env.DEPLOY_TARGET === 'node' || process.env.ASTRO_ADAPTER === 'node') {
  try {
    const nodeAdapter = (await import('@astrojs/node')).default;
    adapter = nodeAdapter({ mode: 'standalone' });
  } catch {
    // @astrojs/node yüklü değilse varsayılan adapter kullanılır
  }
}

// https://astro.build/config
export default defineConfig({
  site: 'https://phukettatili.com',
  // 'server' + varsayılan prerender: tüm pazarlama sayfaları build sırasında
  // statik üretilir (output: 'static' ile aynı davranış). Yalnızca
  // `export const prerender = false` diyen /admin, /ekip ve /ops-login
  // sunucu fonksiyonu olarak çalışır — middleware oturum kontrolü için şart.
  output: 'server',
  adapter,
  trailingSlash: 'ignore',
  redirects: {
    '/admin-login': '/ops-login',
  },
  env: {
    schema: {
      // `secret: true` => değer build çıktısına INLINE EDİLMEZ, runtime'da
      // okunur. Local'de .env'den, Vercel'de ortam değişkeninden gelir.
      // Böylece şifre bundle'a sızmaz ve sunucuda değiştirilebilir kalır.
      ADMIN_PASSCODE: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),

      // Servis rolü anahtarı RLS'i BYPASS EDER. Asla client'a inmemeli:
      // `context: 'server'` + `access: 'secret'` ikilisi bunu derleme
      // zamanında garanti eder. Yalnızca /api/* route'ları kullanır.
      SUPABASE_SERVICE_ROLE_KEY: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      SUPABASE_SERVICE_KEY: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      SUPABASE_SECRET_KEY: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),

      // Supabase proje URL'si — public bilgi ama sunucu tarafında tutarlı
      // okunsun diye şemada tanımlı (secret: build çıktısına gömülmez).
      // Hem SUPABASE_URL hem PUBLIC_SUPABASE_URL desteklenir.
      PUBLIC_SUPABASE_URL: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      SUPABASE_URL: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),

      // Sentry — sunucu tarafı DSN'u (sentry.server.config.ts okur).
      // Tanımsızsa SDK hiç etkinleşmez; Vercel'de eklenince açılır.
      SENTRY_DSN: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      // Sentry — tarayıcı tarafı DSN'u (public değer; gizli tutulması
      // gerekmez, Sentry tasarımı gereği herkese görünür).
      PUBLIC_SENTRY_DSN: envField.string({
        context: 'client',
        access: 'public',
        optional: true,
      }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      chunkSizeWarningLimit: 1200,
    },
  },
  integrations: [
    react(),
    // Sentry hata izleme — DSN yoksa init dosyaları boş kalır ve SDK
    // etkinleşmez; Vercel'de SENTRY_DSN/PUBLIC_SENTRY_DSN eklendiğinde
    // otomatik çalışır. Yerel geliştirmede maliyeti sıfır.
    // requestHandler: SSR rotalarındaki (/api/*, /admin) sunucu hatalarını
    // otomatik yakalar; prerender sayfalarına dokunmaz.
    // telemetry + sourcemap upload kapalı: auth token eklenmeden
    // sessiz çalışır, CI log'ları temiz kalır. Release takibi istenirse
    // SENTRY_AUTH_TOKEN Vercel'e eklenip burada açılabilir.
    sentryAstro({
      autoInstrumentation: { requestHandler: true },
      telemetry: false,
      sourcemaps: { disable: true },
    }),
    // Statik sitemap ana sayfalar (prerender edilen) için üretilir;
    // dinamik SSR turları src/pages/sitemap-turlar.xml.ts tarafından
    // eklenir (robots.txt her ikisini de işaret eder).
    sitemap({
      // Operasyon yüzeyleri noindex — sitemap'e girmeleri Google için
      // çelişkili sinyal üretir (sitemap "önemli" der, meta "indeksleme" der).
      // 301 yönlendirmesi olan /tur-kategorisi/ ve /hakkimizda/ da hariç tutulur.
      filter: (page) =>
        !page.includes('/admin') &&
        !page.includes('/ekip') &&
        !page.includes('/ops-login') &&
        !page.includes('/bilet') &&
        !page.endsWith('/tur-kategorisi') &&
        !page.endsWith('/tur-kategorisi/') &&
        !page.endsWith('/hakkimizda') &&
        !page.endsWith('/hakkimizda/'),
      i18n: {
        defaultLocale: 'tr',
        locales: {
          tr: 'tr-TR',
        },
      },
    }),
  ],
  outDir: process.env.ASTRO_OUTPUT_DIR || 'dist',
  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
  },
});
