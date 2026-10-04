import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://phukettatili.com',
  trailingSlash: 'always',
  integrations: [
    sitemap({
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
  vite: {
    css: {
      postcss: {},
    },
  },
  compressHTML: true,
});