// @ts-check
import { defineConfig, envField } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://phukettatili.com',
  // 'server' + varsayılan prerender: tüm pazarlama sayfaları build sırasında
  // statik üretilir (output: 'static' ile aynı davranış). Yalnızca
  // `export const prerender = false` diyen /admin, /ekip ve /ops-login
  // sunucu fonksiyonu olarak çalışır — middleware oturum kontrolü için şart.
  output: 'server',
  adapter: vercel(),
  trailingSlash: 'ignore',
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
    // Statik sitemap ana sayfalar (prerender edilen) için üretilir;
    // dinamik SSR turları src/pages/sitemap-turlar.xml.ts tarafından
    // eklenir (robots.txt her ikisini de işaret eder).
    sitemap({
      // Operasyon yüzeyleri noindex — sitemap'e girmeleri Google için
      // çelişkili sinyal üretir (sitemap "önemli" der, meta "indeksleme" der).
      filter: (page) =>
        !page.includes('/admin') &&
        !page.includes('/ekip') &&
        !page.includes('/ops-login') &&
        !page.includes('/bilet'),
      i18n: {
        defaultLocale: 'tr',
        locales: {
          tr: 'tr-TR',
        },
      },
    }),
  ],
  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
  },
});
