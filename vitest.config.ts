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
  },
});
