import { describe, it, expect } from 'vitest';
import {
  getLiveExchangeRates,
  convertForeignToThb,
  convertThbToForeign,
} from '../src/lib/exchangeRates';
import { DEFAULT_EXCHANGE_RATES } from '../src/data/adminInitialData';

describe('Live Exchange Rates & Currency Engine', () => {
  it('should return valid rates structure with fallback or live', async () => {
    const data = await getLiveExchangeRates();
    expect(data).toBeDefined();
    expect(data.rates).toBeDefined();
    expect(data.rates.TRY).toBeGreaterThan(0);
    expect(data.rates.USD).toBeGreaterThan(0);
    expect(data.rates.EUR).toBeGreaterThan(0);
    expect(data.rates.GBP).toBeGreaterThan(0);
    expect(['live', 'fallback']).toContain(data.source);
  });

  it('should convert foreign currencies to THB accurately', () => {
    const customRates = {
      TRY: 1.1,
      USD: 36.0,
      EUR: 39.0,
      GBP: 45.0,
    };

    // 100 USD = 3600 THB
    expect(convertForeignToThb(100, 'USD', customRates)).toBe(3600);
    // 1000 TRY = 1100 THB
    expect(convertForeignToThb(1000, 'TRY', customRates)).toBe(1100);
  });

  it('should convert THB to foreign currencies accurately', () => {
    const customRates = {
      TRY: 1.0,
      USD: 35.0,
      EUR: 40.0,
      GBP: 45.0,
    };

    // 3500 THB / 35 = 100 USD
    expect(convertThbToForeign(3500, 'USD', customRates)).toBe(100);
    // 4000 THB / 40 = 100 EUR
    expect(convertThbToForeign(4000, 'EUR', customRates)).toBe(100);
  });

  it('should fallback to DEFAULT_EXCHANGE_RATES if rates not provided', () => {
    const thb = convertForeignToThb(100, 'USD');
    expect(thb).toBe(Math.round(100 * DEFAULT_EXCHANGE_RATES.USD));
  });
});
