import { describe, it, expect } from 'vitest';
import { getSmartPickupRecommendation } from '../src/lib/smartPickupIntelligence';

describe('📍 Akıllı Bölge & Alınış Saati Uyarı Zekası (Smart Pickup Matrix)', () => {
  it('Mai Khao bölgesindeki bir otel için Phi Phi turunda erken alınış (06:30 öncesi) önermeli', () => {
    const rec = getSmartPickupRecommendation('Mai Khao', 'Phi Phi & Bamboo Island Tour', '08:30');
    expect(rec.isDistanceWarning).toBe(true);
    expect(rec.recommendedStart).toBe('06:30');
    expect(rec.warningMessage).toContain('Mai Khao');
    expect(rec.warningMessage).toContain('kaçırma riski');
  });

  it('Patong bölgesindeki bir otel için Similan turunda 05:30 - 06:00 erken sabah alınışı önermeli', () => {
    const rec = getSmartPickupRecommendation('Patong', 'Similan Islands Speedboat', '07:30');
    expect(rec.isDistanceWarning).toBe(true);
    expect(rec.recommendedStart).toBe('05:30');
    expect(rec.pierName).toContain('Thap Lamu');
  });

  it('Chalong bölgesindeki bir otel için Coral & Racha turunda yakın mesafe ve rahat saat önermeli', () => {
    const rec = getSmartPickupRecommendation('Chalong', 'Coral Island & Racha Catamaran', '08:00');
    expect(rec.isDistanceWarning).toBe(false);
    expect(rec.zoneDistanceCategory).toBe('near');
    expect(rec.estimatedDriveMinutes).toBeLessThanOrEqual(20);
  });

  it('Zamanında bir saat seçildiğinde mesafe uyarısı vermemeli', () => {
    const rec = getSmartPickupRecommendation('Patong', 'Phi Phi Maya Bay Tour', '07:30');
    expect(rec.isDistanceWarning).toBe(false);
    expect(rec.recommendedWindow).toBe('07:15 - 07:45');
  });
});
