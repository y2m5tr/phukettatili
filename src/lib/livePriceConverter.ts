/**
 * Canlı Fiyat Dönüştürücü (istemci tarafı)
 *
 * Üst bardaki para birimi seçici ptt_currency / ptt:currency-changed
 * üzerinden haber verir; data-thb-price işaretli tüm fiyat elementleri
 * seçilen para birimine canlı kur ile dönüştürülür.
 *
 * Kullanım (Astro bileşenlerinde):
 *   <span data-thb-price="3400" data-price-label="kişi başı">3,400 THB</span>
 *
 * - THB seçiliyken element orijinal metnine döner.
 * - Diğer para birimlerinde "₺ 5.000" + küçük "≈ ฿3.400" alt satırı basılır
 *   (element <span> içinde sarılıysa ikincil satır otomatik eklenir).
 * - Kur /api/exchange-rates'ten alınır ve 10 dakika önbelleklenir.
 * - Kaynak: TopAnnouncementBar (ptt:currency-changed) ve sayfa yüklemesi.
 */

type Rates = { TRY?: number; USD?: number; EUR?: number };

const RATES_CACHE_KEY = 'ptt_fx_rates_v1';
const RATES_TTL_MS = 10 * 60 * 1000;

let rates: Rates = {};
let ratesPromise: Promise<Rates> | null = null;

function loadCachedRates(): Rates | null {
  try {
    const raw = localStorage.getItem(RATES_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { rates: Rates; ts: number };
    if (Date.now() - parsed.ts > RATES_TTL_MS) return null;
    return parsed.rates;
  } catch {
    return null;
  }
}

function fetchRates(): Promise<Rates> {
  const cached = loadCachedRates();
  if (cached) return Promise.resolve(cached);
  if (ratesPromise) return ratesPromise;

  ratesPromise = fetch('/api/exchange-rates')
    .then((r) => (r.ok ? r.json() : null))
    .then((data: { rates?: Rates } | null) => {
      const fresh = data?.rates || {};
      rates = fresh;
      try {
        localStorage.setItem(RATES_CACHE_KEY, JSON.stringify({ rates: fresh, ts: Date.now() }));
      } catch {}
      return fresh;
    })
    .catch(() => {
      ratesPromise = null;
      return {};
    });
  return ratesPromise;
}

function fmt(n: number): string {
  return n.toLocaleString('tr-TR');
}

/** THB tutarını seçili para birimine çevirir (kur yoksa default). */
function convert(amountThb: number, currency: string): number {
  const defaults: Rates = { TRY: 0.68, USD: 33.7, EUR: 37.8 };
  const r = (k: keyof Rates) => rates[k] || defaults[k] || 0;
  switch (currency) {
    case 'TRY':
      return Math.round(amountThb / r('TRY'));
    case 'USD':
      return Math.round(amountThb / r('USD'));
    case 'EUR':
      return Math.round(amountThb / r('EUR'));
    default:
      return amountThb;
  }
}

const SYMBOLS: Record<string, string> = { THB: '฿', TRY: '₺', USD: '$', EUR: '€' };

function renderPrice(el: HTMLElement, currency: string) {
  const base = Number(el.dataset.thbPrice || '0');
  if (!base) return;

  const label = el.dataset.priceLabel || '';
  const secondaryEl = el.parentElement?.querySelector<HTMLElement>('[data-price-secondary]');

  if (currency === 'THB') {
    el.textContent = `${fmt(base)} THB${label ? ` · ${label}` : ''}`;
    if (secondaryEl) secondaryEl.textContent = '';
    return;
  }

  const converted = convert(base, currency);
  const symbol = SYMBOLS[currency] || '';
  el.textContent = `${symbol}${fmt(converted)} ${currency}`;
  if (secondaryEl) {
    secondaryEl.textContent = `≈ ฿${fmt(base)} THB${label ? ` · ${label}` : ''}`;
  }
}

function renderAll(currency: string) {
  document.querySelectorAll<HTMLElement>('[data-thb-price]').forEach((el) => renderPrice(el, currency));
}

let currentCurrency = 'THB';

/** Sayfa yüklendiğinde ve kur hazır olduğunda bir kez çalıştır. */
export function initLivePriceConverter(): void {
  currentCurrency = (() => {
    try {
      return localStorage.getItem('ptt_currency') || 'THB';
    } catch {
      return 'THB';
    }
  })();

  window.addEventListener('ptt:currency-changed', (e) => {
    const detail = (e as CustomEvent).detail as { currency?: string } | null;
    if (detail?.currency) {
      currentCurrency = detail.currency;
      renderAll(currentCurrency);
    }
  });

  // Kur gelince mevcut seçimle bir kez render et (THB ise kur gerekmez).
  if (currentCurrency === 'THB') {
    renderAll('THB');
  } else {
    fetchRates().then(() => renderAll(currentCurrency));
  }
}

if (typeof window !== 'undefined') {
  document.addEventListener('astro:page-load', () => initLivePriceConverter());
}
