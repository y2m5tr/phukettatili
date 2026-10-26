import { expect, test } from '@playwright/test';

/**
 * E2E 1: Kritik dönüşüm yolu — ana sayfa → turlar listesi → tur detayı.
 *
 * Amaç: statik render zinciri (hero, kartlar, linkler) kırılmadığını ve
 * ziyaretçi tur detayına kadar sorunsuz gidebildiğini gerçek tarayıcıda
 * kanıtlamak. Tur detayı SSR'dır — bu zincir kırılırsa gelir üreten
 * akış kırılır.
 */
test.describe('Kritik dönüşüm: ana sayfa → tur detayı', () => {
  test('ana sayfa yüklenir ve tur listesine gider', async ({ page }) => {
    await page.goto('/');

    // Ana sayfa render oldu
    await expect(page).toHaveTitle(/Phuket Tatili/i);
    await expect(page.locator('header').first()).toBeVisible();

    // Header'daki turlar linkine tıkla (href trailing slash'sız: /turlar)
    await page.click('header a[href="/turlar"]');
    await expect(page).toHaveURL(/\/turlar/);

    // Tur listesi render edildi — en az bir tur kartı var
    const tourLinks = page.locator('main a[href^="/turlar/"]:not([href="/turlar/"])');
    expect(await tourLinks.count()).toBeGreaterThan(0);

    // İlk tura tıkla → detay sayfası SSR olarak açılır
    await tourLinks.first().click();
    await expect(page).toHaveURL(/\/turlar\/[^/?]+/);

    // Detay sayfası gerçek içerik üretti (404/redirect-değişken değil)
    await expect(page.locator('main')).toBeVisible();
    const body = await page.textContent('body');
    expect(body).not.toContain('404');
  });

  test('iletişim sayfası render eder', async ({ page }) => {
    await page.goto('/iletisim/');
    await expect(page.locator('main')).toBeVisible();
    await expect(page).toHaveTitle(/İletişim/i);
  });
});
