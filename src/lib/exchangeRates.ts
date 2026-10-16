import { DEFAULT_EXCHANGE_RATES } from '../data/adminInitialData';

export type SupportedCurrency = 'TRY' | 'USD' | 'EUR' | 'GBP';

export interface ExchangeRatesData {
  rates: Record<SupportedCurrency, number>;
  source: 'live' | 'fallback';
  lastUpdated: string;
}

// 1 saatlik in-memory önbellek
let cachedRatesData: ExchangeRatesData | null = null;
let cacheExpiry: number = 0;
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 saat

/**
 * Canlı döviz kurlarını getirir (1 Yabancı Para Birimi = X THB).
 * open.er-api.com veya fallback DEFAULT_EXCHANGE_RATES kullanır.
 */
export async function getLiveExchangeRates(forceRefresh = false): Promise<ExchangeRatesData> {
  const now = Date.now();

  if (!forceRefresh && cachedRatesData && now < cacheExpiry) {
    return cachedRatesData;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const res = await fetch('https://open.er-api.com/v6/latest/THB', {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`FX HTTP error: ${res.status}`);
    }

    const data = await res.json();
    if (data && data.rates) {
      // open.er-api THB bazlı verir (1 THB = X TRY => 1 TRY = 1 / X THB)
      const thbToTry = data.rates['TRY'];
      const thbToUsd = data.rates['USD'];
      const thbToEur = data.rates['EUR'];
      const thbToGbp = data.rates['GBP'];

      const calculatedRates: Record<SupportedCurrency, number> = {
        TRY: thbToTry ? Number((1 / thbToTry).toFixed(2)) : DEFAULT_EXCHANGE_RATES.TRY,
        USD: thbToUsd ? Number((1 / thbUsdOrFallback(thbToUsd)).toFixed(2)) : DEFAULT_EXCHANGE_RATES.USD,
        EUR: thbToEur ? Number((1 / thbEurOrFallback(thbToEur)).toFixed(2)) : DEFAULT_EXCHANGE_RATES.EUR,
        GBP: thbToGbp ? Number((1 / thbGbpOrFallback(thbToGbp)).toFixed(2)) : DEFAULT_EXCHANGE_RATES.GBP,
      };

      cachedRatesData = {
        rates: calculatedRates,
        source: 'live',
        lastUpdated: new Date().toISOString(),
      };
      cacheExpiry = now + CACHE_DURATION_MS;
      return cachedRatesData;
    }
  } catch {
    // Arama başarısız veya offline ortam: sessizce varsayılan kurlara dön
  }

  return {
    rates: { ...DEFAULT_EXCHANGE_RATES },
    source: 'fallback',
    lastUpdated: new Date().toISOString(),
  };
}

function thbUsdOrFallback(val: any): number {
  const num = Number(val);
  return num > 0 ? num : 1 / DEFAULT_EXCHANGE_RATES.USD;
}
function thbEurOrFallback(val: any): number {
  const num = Number(val);
  return num > 0 ? num : 1 / DEFAULT_EXCHANGE_RATES.EUR;
}
function thbGbpOrFallback(val: any): number {
  const num = Number(val);
  return num > 0 ? num : 1 / DEFAULT_EXCHANGE_RATES.GBP;
}

/**
 * Yabancı para birimini THB'ye dönüştürür
 */
export function convertForeignToThb(
  amount: number,
  currency: SupportedCurrency,
  rates?: Record<SupportedCurrency, number>
): number {
  const activeRates = rates || DEFAULT_EXCHANGE_RATES;
  const rate = activeRates[currency] || 1;
  return Math.round(amount * rate);
}

/**
 * THB tutarını yabancı para birimine dönüştürür
 */
export function convertThbToForeign(
  thbAmount: number,
  targetCurrency: SupportedCurrency,
  rates?: Record<SupportedCurrency, number>
): number {
  const activeRates = rates || DEFAULT_EXCHANGE_RATES;
  const rate = activeRates[targetCurrency] || 1;
  if (rate <= 0) return 0;
  return Number((thbAmount / rate).toFixed(2));
}
