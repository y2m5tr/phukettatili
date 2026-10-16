import { describe, it, expect } from 'vitest';
import {
  convertThbPrice,
  formatDisplayPrice,
  formatDualPrice,
  SITE_CURRENCIES,
} from '../src/lib/siteCurrency';

describe('Web Site Para Birimi Motoru (SiteCurrency)', () => {
  it('should support THB, TRY, USD, EUR', () => {
    expect(SITE_CURRENCIES.THB).toBeDefined();
    expect(SITE_CURRENCIES.TRY).toBeDefined();
    expect(SITE_CURRENCIES.USD).toBeDefined();
    expect(SITE_CURRENCIES.EUR).toBeDefined();
  });

  it('should convert THB to TRY accurately', () => {
    // 3600 THB / 1.2 = 3000 TRY
    const tryAmount = convertThbPrice(3600, 'TRY', { TRY: 1.2 });
    expect(tryAmount).toBe(3000);
  });

  it('should convert THB to USD accurately', () => {
    // 3600 THB / 36 = 100 USD
    const usdAmount = convertThbPrice(3600, 'USD', { USD: 36 });
    expect(usdAmount).toBe(100);
  });

  it('should format dual price with primary and secondary badge', () => {
    const dual = formatDualPrice(3600, 'USD', { USD: 36 });
    expect(dual.primary).toBe('$ 100 USD');
    expect(dual.secondary).toContain('3.600 THB');
    expect(dual.isConverted).toBe(true);

    const thbDual = formatDualPrice(3600, 'THB');
    expect(thbDual.primary).toContain('3.600 THB');
    expect(thbDual.isConverted).toBe(false);
  });
});
