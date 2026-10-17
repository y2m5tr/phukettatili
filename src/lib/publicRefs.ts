/**
 * publicRefs — HEM public (pazarlama) sayfaların HEM admin panelin
 * paylaştığı, hassas İÇERMEYEN referans verisi.
 *
 * NEDEN AYRI MODÜL:
 * `src/data/adminInitialData.ts` tohum verisi taşır: gerçek görünümlü
 * müşteri adları, telefon, pasaport no, otel/oda bilgisi, tedarikçi
 * maliyetleri (`costThb`) ve acente komisyon oranları. Ana sayfa gibi
 * public bir component oradan tek bir sabit (`HOTEL_ZONES`) import ettiğinde
 * Vite tüm modülü client bundle'a taşır ve dosya
 * `.vercel/output/static/_astro/…` altında AUTH'SUZ, herkese açık servis
 * edilir. Yani pazarlama sayfasını açan herkes maliyet ve komisyon verisini
 * indirebilir.
 *
 * ÇÖZÜM: public yüzeyin gerçekten ihtiyaç duyduğu zararsız sabitler burada
 * tanımlanır. `adminInitialData.ts` bunları geri export eder, dolayısıyla
 * mevcut ~68 import sitesi değişmeden çalışmaya devam eder; ama public
 * component'ler artık DOĞRUDAN burayı import eder ve tohum verisi chunk'ına
 * hiç dokunmaz.
 *
 * KURAL: Bu dosyaya asla müşteri, tedarikçi maliyeti, komisyon, telefon
 * veya pasaport verisi EKLEME. Yalnızca herkese açık olmasında sakınca
 * olmayan katalog/referans bilgisi girebilir.
 */

/**
 * Phuket otel bölgeleri — araç hat planlamasında ve manifesto gruplamasında
 * kullanılır. detectHotelZone() bu değerleri döndürür.
 */
export const HOTEL_ZONES = [
  'Patong & Kalim',
  'Kata & Karon',
  'Kamala',
  'Bang Tao & Surin',
  'Rawai & Chalong',
  'Cape Panwa',
  'Phuket Town',
  'Kuzey / Havalimanı',
  'Genel Phuket',
] as const;

export function detectHotelZone(hotel: string): string {
  const h = (hotel || '').toLowerCase();
  if (h.includes('patong') || h.includes('kalim') || h.includes('tri trang')) return 'Patong & Kalim';
  if (h.includes('karon') || h.includes('kata')) return 'Kata & Karon';
  if (h.includes('kamala')) return 'Kamala';
  if (h.includes('bang tao') || h.includes('laguna') || h.includes('surin')) return 'Bang Tao & Surin';
  if (h.includes('rawai') || h.includes('nai harn') || h.includes('chalong')) return 'Rawai & Chalong';
  if (h.includes('panwa') || h.includes('cape panwa')) return 'Cape Panwa';
  if (h.includes('phuket town') || h.includes('old town') || h.includes('şehir')) return 'Phuket Town';
  if (h.includes('maikhao') || h.includes('nai yang') || h.includes('havalimanı')) return 'Kuzey / Havalimanı';
  return 'Genel Phuket';
}

export function getRecommendedPickupTime(zone: string): string {
  switch (zone) {
    case 'Kuzey / Havalimanı':
      return '06:45';
    case 'Bang Tao & Surin':
      return '07:00';
    case 'Kamala':
      return '07:10';
    case 'Patong & Kalim':
      return '07:15';
    case 'Kata & Karon':
      return '07:30';
    case 'Rawai & Chalong':
      return '07:45';
    case 'Cape Panwa':
      return '07:45';
    case 'Phuket Town':
      return '08:00';
    default:
      return '07:30';
  }
}

/**
 * Standart döviz kurları (1 yabancı birim = X THB).
 * Canlı kur `/api/exchange-rates` üzerinden gelir; bu değer yalnızca
 * ağ yokken kullanılan güvenli varsayılandır ve public sitede gösterilir.
 */
export const DEFAULT_EXCHANGE_RATES: Record<'TRY' | 'USD' | 'EUR' | 'GBP', number> = {
  TRY: 1.05,
  USD: 36.5,
  EUR: 39.5,
  GBP: 46.0,
};

export function convertToThb(
  amount: number,
  currency: 'TRY' | 'USD' | 'EUR' | 'GBP',
  customRates?: Partial<Record<'TRY' | 'USD' | 'EUR' | 'GBP', number>>
): number {
  const rate = customRates?.[currency] ?? DEFAULT_EXCHANGE_RATES[currency] ?? 1;
  return Math.round(amount * rate);
}

/** Phuket Turizm Sezonları */
export type PhuketSeason = 'low' | 'high' | 'peak';

export interface SeasonInfo {
  season: PhuketSeason;
  name: string;
  badgeColor: string;
  note: string;
  multiplier: number;
}

export function getPhuketSeason(dateStr?: string): SeasonInfo {
  const d = dateStr ? new Date(dateStr) : new Date();
  const month = d.getMonth() + 1; // 1-12
  const day = d.getDate();

  // Peak: 15 Dec - 15 Jan
  if ((month === 12 && day >= 15) || (month === 1 && day <= 15)) {
    return {
      season: 'peak',
      name: 'Peak Season (Zirve)',
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
      note: 'Yılbaşı yoğun dönemi · Yoğun talep & tedarikçi ek ücretleri geçerlidir',
      multiplier: 1.25,
    };
  }

  // Low Season: 1 May - 31 Oct
  if (month >= 5 && month <= 10) {
    return {
      season: 'low',
      name: 'Low Season (Muson / İndirimli)',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      note: 'Yaz musonu dönemi · İndirimli fiyatlar & sakin deniz turları',
      multiplier: 0.85,
    };
  }

  // High Season: 1 Nov - 14 Dec & 16 Jan - 30 Apr
  return {
    season: 'high',
    name: 'High Season (Yüksek Sezon)',
    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    note: 'Güneşli & sakin deniz dönemi · Standart katalog fiyatları',
    multiplier: 1.0,
  };
}
