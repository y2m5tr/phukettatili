// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';

import keystatic from '@keystatic/astro';
import markdoc from '@astrojs/markdoc';

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
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [
    react(),
    keystatic(),
    markdoc(),
    sitemap({
      filter: (page) => !page.includes('/admin') && !page.includes('/ekip'),
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
