/**
 * Web Sitesi Para Birimi ve Fiyat Çevirici Motoru
 *
 * Phuket Tatili web sitesinde fiyatları anlık olarak THB, TRY, USD ve EUR
 * para birimlerinde dönüştürmek ve formatlamak için kullanılır.
 */

import { DEFAULT_EXCHANGE_RATES } from '../data/adminInitialData';

export type DisplayCurrency = 'THB' | 'TRY' | 'USD' | 'EUR';

export interface CurrencyConfig {
  code: DisplayCurrency;
  symbol: string;
  label: string;
  flag: string;
  rateAgainstThb: number; // 1 Yabancı Para = X THB
}

export const SITE_CURRENCIES: Record<DisplayCurrency, { symbol: string; label: string; flag: string }> = {
  THB: { symbol: '฿', label: 'THB (Baht)', flag: '🇹🇭' },
  TRY: { symbol: '₺', label: 'TRY (Türk Lirası)', flag: '🇹🇷' },
  USD: { symbol: '$', label: 'USD (Dolar)', flag: '🇺🇸' },
  EUR: { symbol: '€', label: 'EUR (Euro)', flag: '🇪🇺' },
};

/**
 * THB cinsinden fiyatı seçilen para birimine çevirir.
 */
export function convertThbPrice(
  amountThb: number,
  targetCurrency: DisplayCurrency,
  customRates?: { TRY?: number; USD?: number; EUR?: number }
): number {
  if (targetCurrency === 'THB' || !amountThb) {
    return Math.round(amountThb || 0);
  }

  const rateTry = customRates?.TRY || DEFAULT_EXCHANGE_RATES.TRY || 1.2;
  const rateUsd = customRates?.USD || DEFAULT_EXCHANGE_RATES.USD || 36.0;
  const rateEur = customRates?.EUR || DEFAULT_EXCHANGE_RATES.EUR || 39.0;

  switch (targetCurrency) {
    case 'TRY':
      // 1 TRY = rateTry THB => THB / rateTry = TRY
      return Math.round(amountThb / rateTry);
    case 'USD':
      return Math.round(amountThb / rateUsd);
    case 'EUR':
      return Math.round(amountThb / rateEur);
    default:
      return Math.round(amountThb);
  }
}

/**
 * Fiyatı para birimi simgesiyle birlikte lüks formatta basar.
 * Örn: "₺ 4,150", "฿ 3,200", "$ 89"
 */
export function formatDisplayPrice(
  amountThb: number,
  currency: DisplayCurrency = 'THB',
  customRates?: { TRY?: number; USD?: number; EUR?: number }
): string {
  const converted = convertThbPrice(amountThb, currency, customRates);
  const info = SITE_CURRENCIES[currency] || SITE_CURRENCIES.THB;
  return `${info.symbol} ${converted.toLocaleString('tr-TR')}`;
}

/**
 * Çift fiyat etiketi (Örn: "₺ 3,950 TRY" ve altında "≈ 3,200 THB")
 */
export function formatDualPrice(
  amountThb: number,
  currency: DisplayCurrency = 'THB',
  customRates?: { TRY?: number; USD?: number; EUR?: number }
): { primary: string; secondary: string; isConverted: boolean } {
  if (currency === 'THB') {
    return {
      primary: `฿ ${amountThb.toLocaleString('tr-TR')} THB`,
      secondary: '',
      isConverted: false,
    };
  }

  const primary = formatDisplayPrice(amountThb, currency, customRates);
  const secondary = `≈ ฿ ${amountThb.toLocaleString('tr-TR')} THB`;

  return {
    primary: `${primary} ${currency}`,
    secondary,
    isConverted: true,
  };
}
