import { describe, it, expect } from 'vitest';
import {
  isTourEligibleForReview,
  generatePostTourReviewMessage,
  getGoogleReviewWhatsAppUrl,
  DEFAULT_GOOGLE_REVIEW_URL,
} from '../src/lib/reviewBooster';
import type { Booking } from '../src/data/adminInitialData';

describe('Review Booster Engine', () => {
  const sampleBooking: Booking = {
    id: 'PT-TEST-001',
    customerName: 'Ahmet Yılmaz',
    phone: '+90 532 111 22 33',
    hotel: 'Amari Phuket',
    tourId: 'phi-phi',
    tourTitle: 'Phi Phi & Maya Bay Sürat Teknesi',
    tourDate: '2026-10-15',
    adultCount: 2,
    childCount: 0,
    totalPriceThb: 6400,
    paidAmountThb: 6400,
    remainingAmountThb: 0,
    status: 'confirmed',
    pickupStatus: 'completed',
    paymentStatus: 'paid',
    createdAt: '2026-10-15T08:00:00Z',
  };

  it('should detect eligible bookings for review', () => {
    expect(isTourEligibleForReview(sampleBooking)).toBe(true);

    const cancelledBooking: Booking = {
      ...sampleBooking,
      status: 'cancelled',
    };
    expect(isTourEligibleForReview(cancelledBooking)).toBe(false);
  });

  it('should generate personalized 5-star review message', () => {
    const msg = generatePostTourReviewMessage(sampleBooking);
    expect(msg).toContain('Sayın *Ahmet Yılmaz*');
    expect(msg).toContain('Phi Phi & Maya Bay Sürat Teknesi');
    expect(msg).toContain(DEFAULT_GOOGLE_REVIEW_URL);
    expect(msg).toContain('Google Haritalar');
  });

  it('should generate valid WhatsApp direct url', () => {
    const url = getGoogleReviewWhatsAppUrl(sampleBooking);
    expect(url).toContain('https://wa.me/905321112233?text=');
    expect(url).toContain(encodeURIComponent('Sayın *Ahmet Yılmaz*'));
  });
});
