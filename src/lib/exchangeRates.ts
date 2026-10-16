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

export interface CashChangeResult {
  dueThb: number;
  paidCurrency: SupportedCurrency | 'THB';
  paidAmount: number;
  effectiveRate: number;
  paidInThb: number;
  changeDueThb: number;
  remainingDebtThb: number;
  isExact: boolean;
  isUnderpaid: boolean;
  changeBreakdown: {
    bill1000: number;
    bill500: number;
    bill100: number;
    bill50: number;
    bill20: number;
    coins: number;
  };
}

/**
 * Saha Nakit Para Üstü ve Banknot Dağılımı Hesaplayıcı
 */
export function calculateCashChange(params: {
  dueThb: number;
  paidCurrency: SupportedCurrency | 'THB';
  paidAmount: number;
  customRate?: number;
  rates?: Record<SupportedCurrency, number>;
}): CashChangeResult {
  const { dueThb, paidCurrency, paidAmount, customRate, rates } = params;
  const activeRates = rates || DEFAULT_EXCHANGE_RATES;

  let effectiveRate = 1;
  if (paidCurrency !== 'THB') {
    effectiveRate =
      customRate && customRate > 0
        ? customRate
        : activeRates[paidCurrency as SupportedCurrency] || 1;
  }

  const paidInThb = Math.round(paidAmount * effectiveRate);
  const diff = paidInThb - dueThb;

  const changeDueThb = diff > 0 ? diff : 0;
  const remainingDebtThb = diff < 0 ? Math.abs(diff) : 0;
  const isExact = diff === 0;
  const isUnderpaid = diff < 0;

  // Tayland Bahtı Banknot Kırılımı (1000฿, 500฿, 100฿, 50฿, 20฿ ve Madeni Para)
  let remainder = changeDueThb;
  const bill1000 = Math.floor(remainder / 1000);
  remainder %= 1000;
  const bill500 = Math.floor(remainder / 500);
  remainder %= 500;
  const bill100 = Math.floor(remainder / 100);
  remainder %= 100;
  const bill50 = Math.floor(remainder / 50);
  remainder %= 50;
  const bill20 = Math.floor(remainder / 20);
  remainder %= 20;
  const coins = remainder;

  return {
    dueThb,
    paidCurrency,
    paidAmount,
    effectiveRate,
    paidInThb,
    changeDueThb,
    remainingDebtThb,
    isExact,
    isUnderpaid,
    changeBreakdown: {
      bill1000,
      bill500,
      bill100,
      bill50,
      bill20,
      coins,
    },
  };
}

/**
 * Saha Tahsilat & Para Üstü WhatsApp Makbuzu Oluşturur
 */
export function generateCashPaymentSlipWhatsApp(params: {
  guestName: string;
  serviceTitle: string;
  dueThb: number;
  paidCurrency: SupportedCurrency | 'THB';
  paidAmount: number;
  effectiveRate: number;
  changeDueThb: number;
  remainingDebtThb: number;
  collectorName?: string;
  hotelOrLocation?: string;
}): string {
  const guest = params.guestName || 'Değerli Misafirimiz';
  const collector = params.collectorName || 'Phuket Tatili Saha Ekibi';
  const location = params.hotelOrLocation ? `📍 Konum: ${params.hotelOrLocation}\n` : '';
  const isForeign = params.paidCurrency !== 'THB';

  let paymentDetails = `💵 Alınan Ödeme: ${params.paidAmount.toLocaleString()} ${params.paidCurrency}\n`;
  if (isForeign) {
    paymentDetails += `📈 Uygulanan Kur: 1 ${params.paidCurrency} = ${params.effectiveRate} THB\n`;
    paymentDetails += `🇹🇭 Tahsil Edilen Karşılık: ${Math.round(params.paidAmount * params.effectiveRate).toLocaleString()} THB\n`;
  }

  let balanceLine = '';
  if (params.changeDueThb > 0) {
    balanceLine = `🪙 Verilen Para Üstü: ${params.changeDueThb.toLocaleString()} THB\n`;
  } else if (params.remainingDebtThb > 0) {
    balanceLine = `⚠️ Kalan Bakiye: ${params.remainingDebtThb.toLocaleString()} THB\n`;
  } else {
    balanceLine = `✅ Tam Ödeme Alındı (Para Üstü Yok)\n`;
  }

  return `🧾 PHUKET TATİLİ - SAHA NAKİT TAHSİLAT MAKBUZU
══════════════════════════════════════
👤 Misafir: ${guest}
🚗 Hizmet: ${params.serviceTitle}
${location}💰 Hizmet Bedeli: ${params.dueThb.toLocaleString()} THB
${paymentDetails}══════════════════════════════════════
${balanceLine}══════════════════════════════════════
👨‍✈️ Tahsil Eden: ${collector}
📅 Tarih: ${new Date().toLocaleDateString('tr-TR')} ${new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
✨ İşleminiz sisteme işlenmiştir. İyi tatiller dileriz!`;
}

/**
 * Makbuz için WhatsApp URL
 */
export function getCashPaymentSlipWhatsAppUrl(phone?: string, text?: string): string {
  if (!text) return '#';
  const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
  const encodedText = encodeURIComponent(text);
  return cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodedText}` : `https://wa.me/?text=${encodedText}`;
}

