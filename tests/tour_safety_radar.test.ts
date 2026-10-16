import { describe, it, expect } from 'vitest';
import {
  categorizeTourForSafety,
  evaluateTourSafety,
  getLiveTourSafetyRadar,
} from '../src/lib/tourSafetyRadar';
import type { MarineSafetyReport } from '../src/lib/marineWeather';

describe('Aşama 1: Canlı Phuket Tur Güvenlik Radarı', () => {
  it('turları doğru güvenlik kategorilerine ayırmalı', () => {
    expect(categorizeTourForSafety('Phi Phi, Maya Bay ve Bamboo')).toBe('island_speedboat');
    expect(categorizeTourForSafety('James Bond Adası ve Phang Nga Kano')).toBe('protected_bay');
    expect(categorizeTourForSafety('Fil Besleme ve Bakım Deneyimi')).toBe('inland_adventure');
    expect(categorizeTourForSafety('Simon Cabaret Phuket Gösterisi')).toBe('evening_entertainment');
    expect(categorizeTourForSafety('Carnival Magic Işık Parkı')).toBe('evening_entertainment');
    expect(categorizeTourForSafety('Hanuman World Zipline')).toBe('inland_adventure');
  });

  it('şiddetli dalgada açık deniz turunu uyarırken korunaklı körfez ve kara turlarını önermeli', () => {
    const severeReport: MarineSafetyReport = {
      level: 'severe',
      waveHeightMeters: 2.2,
      windSpeedKnots: 26,
      windDirectionText: 'Batı (W)',
      summary: 'Fırtına uyarısı',
      warningNote: 'Açık deniz dalgalı',
      lastUpdated: new Date().toISOString(),
      source: 'live',
      regionStatus: {
        phang_nga: { status: 'caution', note: 'Körfez içi güvenli' },
        phi_phi: { status: 'closed', note: 'Açık deniz dalgalı' },
        similan: { status: 'closed', note: 'Milli park kapalı' },
        racha: { status: 'caution', note: 'Büyük tekneler' },
      },
    };

    const phiPhiEval = evaluateTourSafety('Phi Phi Adaları', severeReport);
    expect(phiPhiEval.status).toBe('not_recommended');
    expect(phiPhiEval.suitabilityScore).toBeLessThan(50);

    const jamesBondEval = evaluateTourSafety('James Bond Körfez Kano', severeReport);
    expect(jamesBondEval.status).toBe('suitable');
    expect(jamesBondEval.suitabilityScore).toBeGreaterThan(70);

    const elephantEval = evaluateTourSafety('Fil Besleme Barınağı', severeReport);
    expect(elephantEval.status).toBe('recommended');
    expect(elephantEval.suitabilityScore).toBeGreaterThanOrEqual(85);
  });

  it('canlı radar raporunu başarıyla üretmeli ve tavsiye listesini oluşturmalı', async () => {
    const report = await getLiveTourSafetyRadar();
    expect(report).toBeDefined();
    expect(report.marineReport.waveHeightMeters).toBeGreaterThan(0);
    expect(report.evaluations.length).toBeGreaterThan(0);
    expect(report.topRecommendedTours.length).toBeGreaterThan(0);
  });
});
