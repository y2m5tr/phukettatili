import { describe, it, expect } from 'vitest';
import {
  recommendNextTours,
  generateCrossSellWhatsAppMessage,
  getCrossSellWhatsAppUrl,
  DEFAULT_CROSS_SELL_COUPON,
} from '../src/lib/crossSell';
import type { Booking } from '../src/data/adminInitialData';

describe('Cross-Sell & Guest Loyalty Engine', () => {
  const phiPhiBooking: Booking = {
    id: 'PT-CS-01',
    customerName: 'Deniz Arslan',
    phone: '+90 533 444 55 66',
    hotel: 'Amari Phuket',
    tourTitle: 'Phi Phi & Maya Bay Sürat Teknesi',
    tourDate: '2026-10-15',
    adultCount: 2,
    childCount: 0,
    totalPriceThb: 6400,
    paidAmountThb: 6400,
    remainingAmountThb: 0,
    status: 'confirmed',
    paymentStatus: 'paid',
    createdAt: '2026-10-15T08:00:00Z',
  };

  it('should recommend elephant sanctuary and James Bond for Phi Phi guests', () => {
    const recs = recommendNextTours(phiPhiBooking, 10);
    expect(recs.length).toBeGreaterThanOrEqual(2);

    const hasElephant = recs.some((r) => r.id === 'elephant-sanctuary');
    const hasJamesBond = recs.some((r) => r.id === 'james-bond-phang-nga');
    expect(hasElephant).toBe(true);
    expect(hasJamesBond).toBe(true);

    // %10 indirim kontrolü: 2500 -> 2250 THB
    const elephant = recs.find((r) => r.id === 'elephant-sanctuary');
    expect(elephant?.discountedPriceThb).toBe(2250);
  });

  it('should generate personalized cross-sell message with coupon code', () => {
    const msg = generateCrossSellWhatsAppMessage(phiPhiBooking, {
      couponCode: 'DENIZ15',
      discountPercent: 15,
    });
    expect(msg).toContain('Sayın *Deniz Arslan*');
    expect(msg).toContain('DENIZ15');
    expect(msg).toContain('%15');
    expect(msg).toContain('Phi Phi & Maya Bay Sürat Teknesi');
    expect(msg).toContain('Etik Fil Koruma');
  });

  it('should create valid WhatsApp direct url with encoded message', () => {
    const url = getCrossSellWhatsAppUrl(phiPhiBooking);
    expect(url).toContain('https://wa.me/905334445566?text=');
    expect(url).toContain(encodeURIComponent('Sayın *Deniz Arslan*'));
    expect(url).toContain(DEFAULT_CROSS_SELL_COUPON);
  });
});
