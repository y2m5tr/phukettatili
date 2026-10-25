import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    {
      name: 'astro-env-stub',
      resolveId(id) {
        if (id === 'astro:env/server') return '\0astro:env/server';
      },
      load(id) {
        if (id === '\0astro:env/server') {
          return 'export function getSecret(key) { return process.env[key]; }';
        }
      },
    },
  ],
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    // Hız: worker başına yeni ortam kurma maliyetini düşürür (458 test, ~40sn
    // kazanç). Not: 5 test dosyası process.env değiştirdiği için env'i import
    // anında OKUYAN modüller dosyalar arası bayat değer görebilir — tam suite
    // bu ayarla doğrulandı; yeni env-bağımlı modül eklerken suite'i tekrar koştur.
    isolate: false,
  },
});
