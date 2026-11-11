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

/**
 * React adaları için fiyat metni üretir.
 *
 * NEDEN VAR: React bir düğümün metnini kendisi çiziyorsa, bu modülün DOM
 * yazıcısı o düğüme hydration'dan ÖNCE yazdığında sunucu HTML'i ile istemci
 * çıktısı uyuşmuyor ve React tüm ağacı çöpe atıp yeniden kuruyordu
 * (TourShowcase'te "Hydration failed" hatası). Çözüm: React fiyatı kendi
 * state'inden çizer, işaretli düğümlere DOM yazıcısı hiç dokunmaz.
 *
 * `currency === 'THB'` iken renderPrice ile BİREBİR aynı metni üretmek
 * zorunda: sunucu bu metni basıyor, istemci aynısını çizmeli ki hydration
 * uyuşsun; ayrıca sayfadaki diğer fiyat düğümleri (tr-TR binlik ayraç) ile
 * görsel tutarlılık korunsun.
 */
export function formatPriceText(amountThb: number, currency: string, label = ''): string {
  if (!Number.isFinite(amountThb) || amountThb <= 0) return '';
  if (currency === 'THB') {
    return `${amountThb.toLocaleString('tr-TR')} THB${label ? ` · ${label}` : ''}`;
  }
  const converted = convert(amountThb, currency);
  const symbol = SYMBOLS[currency] || '';
  return `${symbol}${converted.toLocaleString('tr-TR')} ${currency}`;
}

/** React adaları için: kaydedilmiş para birimini okur (SSR'da daima THB). */
export function readStoredCurrency(): string {
  try {
    return localStorage.getItem('ptt_currency') || 'THB';
  } catch {
    return 'THB';
  }
}

/** React adaları için: THB dışı bir birim seçiliyse kurları yükler. */
export function ensureRates(currency: string): Promise<void> {
  if (currency === 'THB') return Promise.resolve();
  return fetchRates().then(() => undefined);
}

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
  document.querySelectorAll<HTMLElement>('[data-thb-price]').forEach((el) => {
    // React adaları fiyatını kendi state'inden çizer (bkz. formatPriceText).
    // Buradan yazılırsa hydration uyuşmazlığı doğar — dokunma.
    if (el.hasAttribute('data-price-react')) return;
    renderPrice(el, currency);
  });
}

let currentCurrency = 'THB';
let bound = false;

/** Sayfa yüklendiğinde ve kur hazır olduğunda bir kez çalıştır. */
export function initLivePriceConverter(): void {
  // Listener'ları yalnızca ilk çağrıda bağla (view transition'da script
  // module olarak bir kez yüklenir ama astro:page-load her navigasyonda
  // tekrar init çağırır — çift dinleyici birikmesini önle).
  if (!bound) {
    bound = true;
    window.addEventListener('ptt:currency-changed', (e) => {
      const detail = (e as CustomEvent).detail as { currency?: string } | null;
      if (detail?.currency) {
        currentCurrency = detail.currency;
        renderAll(currentCurrency);
      }
    });
  }

  currentCurrency = (() => {
    try {
      return localStorage.getItem('ptt_currency') || 'THB';
    } catch {
      return 'THB';
    }
  })();

  // Kur gelince mevcut seçimle bir kez render et (THB ise kur gerekmez).
  if (currentCurrency === 'THB') {
    renderAll('THB');
  } else {
    fetchRates().then(() => renderAll(currentCurrency));
  }
}
