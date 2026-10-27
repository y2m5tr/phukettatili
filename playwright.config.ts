import { defineConfig } from '@playwright/test';

/**
 * E2E test yapılandırması.
 *
 * Yerelde: PLAYWRIGHT_BROWSERS_PATH farklı olabilir (varsayılan ~/Library/Caches).
 * CI'da: GitHub Actions'un chromium'ı kullanılır (PLAYWRIGHT_BROWSERS_PATH=0
 * ayarlanır ya da browsers step'inde kurulur).
 *
 * Sunucu: her koşuda ayrı port (4400) — paralel test çakışması olmaz.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    // localhost (127.0.0.1 değil): astro dev macOS'ta bazı sürümlerde
    // yalnızca IPv6 dinleyebilir; localhost her ikisini de çözer.
    baseURL: 'http://localhost:4400',
    locale: 'tr-TR',
  },
  webServer: {
    command: 'ASTRO_TELEMETRY_DISABLED=1 npx astro dev --port 4400 --host',
    port: 4400,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    stdout: 'ignore',
    stderr: 'pipe',
    env: {
      ASTRO_TELEMETRY_DISABLED: '1',
    },
  },
});
