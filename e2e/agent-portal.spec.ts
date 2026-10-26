import { expect, test } from '@playwright/test';

/**
 * E2E 3: B2B acente portalı — dinamik SSR rotası.
 *
 * /acente/[code]: acente kodu URL'den çözülür, portala özel fiyatlarla
 * açılır. Portal Astro bileşenidir; ana yapı body içinde render edilir.
 */
test.describe('Acente portalı', () => {
  test('geçerli acente kodu portali açar', async ({ page }) => {
    const response = await page.goto('/acente/IST-TRV');
    expect(response?.status()).toBeLessThan(400);

    const body = await page.textContent('body');
    expect(body).not.toContain('404');
    // Portal gerçek içerik üretti — sayfa boş değil
    expect(body?.trim().length ?? 0).toBeGreaterThan(1000);
  });

  test('geçersiz acente kodu sistemi çökertmez', async ({ page }) => {
    // Bilinmeyen kod — 5xx değil, render tamamlanır
    const response = await page.goto('/acente/XXXXXXX');
    expect(response?.status()).toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
  });
});
