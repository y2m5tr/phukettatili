/**
 * Operasyon & Yönetim Paneli Veri Modülü (Facade / Re-export)
 *
 * Mimari Ayrıştırma:
 * - Tipler & Modeller: `src/data/adminTypes.ts`
 * - İş Mantığı & Etiketler: `src/data/businessLogic.ts`
 * - Tohum / Mock Veriler: `src/data/seedData.ts`
 * - Paylaşılan Genel Referanslar: `src/lib/publicRefs.ts`
 *
 * Geriye dönük %100 tam uyumluluk için bu dosya tüm tanımları tek çatı altında
 * dışa aktarmaya devam eder.
 */

export * from './adminTypes';
export * from './businessLogic';
export * from './seedData';

export {
  HOTEL_ZONES,
  detectHotelZone,
  getRecommendedPickupTime,
  DEFAULT_EXCHANGE_RATES,
  convertToThb,
  getPhuketSeason,
} from '../lib/publicRefs';

export type { PhuketSeason, SeasonInfo } from '../lib/publicRefs';
