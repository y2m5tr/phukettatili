import { describe, it, expect } from 'vitest';
import {
  buildWizardRecommendation,
  generateWizardWhatsAppUrl,
  TRAVELER_PROFILES,
  VACATION_VIBES,
  TRIP_DURATIONS,
  type TourCandidate,
} from '../src/lib/tourWizard';

const mockTours: TourCandidate[] = [
  { id: 'phi-phi-maya-ve-bamboo-adasi', title: 'Phi Phi & Maya Bay', priceThb: 3200 },
  { id: 'james-bond-adasi-ve-kano-turu', title: 'James Bond & Kano', priceThb: 2800 },
  { id: 'moonlight-luks-yat-turu', title: 'Moonlight Lüks Katamaran', priceThb: 4500 },
  { id: 'fil-besleme-ve-bakim-deneyimi', title: 'Etik Fil Barınağı', priceThb: 2600 },
  { id: 'atv-quad-safari-ve-orman-macerasi', title: 'ATV Safari & Zipline', priceThb: 2200 },
];

describe('Akıllı Tur & Rota Sihirbazı Engine', () => {
  it('should have all options properly defined', () => {
    expect(TRAVELER_PROFILES.length).toBe(4);
    expect(VACATION_VIBES.length).toBe(4);
    expect(TRIP_DURATIONS.length).toBe(3);
  });

  it('should recommend honeymoon / luxury package with catamaran', () => {
    const rec = buildWizardRecommendation('honeymoon', 'luxury_catamaran', 'short', mockTours);
    expect(rec.packageTitle).toContain('Balayı');
    expect(rec.recommendedTours.length).toBeGreaterThanOrEqual(1);
    expect(rec.totalPriceThb).toBeGreaterThan(0);
    expect(rec.discountedPriceThb).toBeLessThan(rec.totalPriceThb);
  });

  it('should recommend family package with elephant sanctuary', () => {
    const rec = buildWizardRecommendation('family', 'nature_safari', 'medium', mockTours);
    expect(rec.packageTitle).toContain('Aile');
    expect(rec.recommendedTours.some((t) => t.id.includes('fil'))).toBe(true);
  });

  it('should generate valid WhatsApp URL with encoded message', () => {
    const rec = buildWizardRecommendation('honeymoon', 'luxury_catamaran', 'short', mockTours);
    const url = generateWizardWhatsAppUrl(rec, 2, '66828950665');
    expect(url).toContain('https://wa.me/66828950665');
    expect(url).toContain('text=');
    expect(decodeURIComponent(url)).toContain('Kişi');
  });
});
