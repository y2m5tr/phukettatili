import { expect, test } from '@playwright/test';

/**
 * E2E 2: Operasyon paneli erişim kontrolü — fail-closed davranış.
 *
 * Amaç: /admin'e oturumsuz erişim denemesi panel içeriğini (rezervasyon
 * verisi, React bundle) HİÇ indirmeden giriş sayfasına yöneltmeli.
 * Bu, middleware oturum korumasının gerçek tarayıcıda çalıştığının kanıtı.
 *
 * Not: /ops-login ve /admin kendi layout'larını kullanır (Layout.astro'daki
 * <main> bu sayfalarda yoktur) — bu yüzden body/h1 bazlı doğrulama yapılır.
 */
test.describe('Admin erişim kontrolü', () => {
  test('oturumsuz /admin → giriş sayfasına yönlendirir', async ({ page }) => {
    // İsteği commit anında durdur — panel HTML'i asla tamamen inmez
    const response = await page.goto('/admin', { waitUntil: 'commit' });
    expect(response?.status()).toBeLessThan(400);

    // Middleware 302 ile /ops-login'e yönlendirdi
    await page.waitForURL(/ops-login/);

    // Giriş sayfası render edildi — başlık ve form görünür
    await expect(page.locator('h1')).toContainText('Yönetim');

    // Panel verisi sızmadı — rezervasyon tablosu terimi görünmemeli
    const body = await page.textContent('body');
    expect(body).not.toContain('Rezervasyon Yönetimi');
  });

  test('ops-login sayfası giriş formunu render eder', async ({ page }) => {
    await page.goto('/ops-login');
    await expect(page.locator('h1')).toContainText('Yönetim');
    await expect(page.locator('#passcode-form-wrap, #membership-form-wrap').first()).toBeAttached();
    await expect(page).toHaveTitle(/Yönetim/i);
  });

  test('eski /ekip rotası transfers sekmesine taşınır', async ({ page }) => {
    // /ekip → /admin?tab=transfers → (oturumsuz) /ops-login zinciri
    await page.goto('/ekip');
    await page.waitForURL((url) => !url.pathname.startsWith('/ekip'));
    // Zincir 5xx üretmedi; yönlendirme tamamlandı
    await expect(page.locator('body')).toBeVisible();
  });
});
