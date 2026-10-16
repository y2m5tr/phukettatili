import { describe, it, expect } from 'vitest';
import {
  generateHolidayPackage,
  generatePackageWhatsAppMessage,
} from '../src/lib/holidayPlanner';

describe('Aşama 2: Kendi Phuket Tatilini Oluştur (Tatil Sihirbazı)', () => {
  it('3, 5 ve 7 günlük paketleri doğru gün sayısında ve indirimli hesaplamalı', () => {
    const plan3 = generateHolidayPackage(3, 'honeymoon', 'Patong & Kalim');
    expect(plan3.itinerary.length).toBe(3);
    expect(plan3.discountPercentage).toBe(10);
    expect(plan3.finalPackagePriceThb).toBeLessThan(plan3.totalIndividualPriceThb);

    const plan5 = generateHolidayPackage(5, 'family', 'Kata & Karon');
    expect(plan5.itinerary.length).toBe(5);
    expect(plan5.discountPercentage).toBe(12);

    const plan7 = generateHolidayPackage(7, 'adventure', 'Bang Tao');
    expect(plan7.itinerary.length).toBe(7);
    expect(plan7.discountPercentage).toBe(15);
  });

  it('farklı seyahat tarzlarına uygun içerik üretmeli', () => {
    const honeymoonPlan = generateHolidayPackage(5, 'honeymoon', 'Patong & Kalim');
    const titles = honeymoonPlan.itinerary.map((i) => i.tourTitle.toLowerCase());
    expect(titles.some((t) => t.includes('phi phi') || t.includes('maya'))).toBe(true);

    const familyPlan = generateHolidayPackage(5, 'family', 'Patong & Kalim');
    const familyTitles = familyPlan.itinerary.map((i) => i.tourTitle.toLowerCase());
    expect(familyTitles.some((t) => t.includes('fil') || t.includes('carnival'))).toBe(true);
  });

  it('WhatsApp mesaj şablonunu eksiksiz ve fiyat detaylı üretmeli', () => {
    const plan = generateHolidayPackage(5, 'honeymoon', 'Patong & Kalim');
    const message = generatePackageWhatsAppMessage(plan);
    expect(message).toContain('AKILLI PAKET REZERVASYON TALEBİ');
    expect(message).toContain(plan.packageName);
    expect(message).toContain('GÜNLÜK TUR PROGRAMI:');
    expect(message).toContain(`${plan.finalPackagePriceThb.toLocaleString()} THB`);
  });
});
