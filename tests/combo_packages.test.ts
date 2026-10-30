import { describe, it, expect } from 'vitest';
import {
  POPULAR_COMBOS,
  calculateComboPrice,
  generateComboWhatsAppUrl,
} from '../src/lib/comboPackages';

describe('Combo Packages Engine', () => {
  it('defines 3 popular combo packages with minimum 2300 THB tour prices', () => {
    expect(POPULAR_COMBOS.length).toBe(3);
    for (const combo of POPULAR_COMBOS) {
      expect(combo.items.length).toBeGreaterThanOrEqual(2);
      expect(combo.discountPercent).toBe(15);
      for (const item of combo.items) {
        if (item.category !== 'transfer') {
          expect(item.regularPriceThb).toBeGreaterThanOrEqual(2300);
        }
      }
    }
  });

  it('calculates correct 15% discount and savings', () => {
    const items = [
      { regularPriceThb: 3200 },
      { regularPriceThb: 2800 },
      { regularPriceThb: 1800 },
    ];
    // Total = 7800. 15% discount = 1170. Final = 6630.
    const res = calculateComboPrice(items, 15);
    expect(res.totalRegularThb).toBe(7800);
    expect(res.discountPercent).toBe(15);
    expect(res.discountAmountThb).toBe(1170);
    expect(res.finalPriceThb).toBe(6630);
    expect(res.savingsThb).toBe(1170);
  });

  it('generates valid WhatsApp URL with formatted money and package details', () => {
    const combo = POPULAR_COMBOS[0];
    const url = generateComboWhatsAppUrl(combo, 2, '66828950665');
    expect(url).toContain('https://wa.me/66828950665');
    expect(url).toContain(encodeURIComponent(combo.title));
    expect(url).toContain(encodeURIComponent('15'));
  });
});
