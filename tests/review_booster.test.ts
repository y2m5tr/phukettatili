import { describe, it, expect } from 'vitest';
import {
  isTourEligibleForReview,
  generatePostTourReviewMessage,
  generate1830ReviewInviteMessage,
  getGoogleReviewWhatsAppUrl,
  evaluateReviewSentiment,
  generateManagerEscalationWhatsAppUrl,
  DEFAULT_GOOGLE_REVIEW_URL,
} from '../src/lib/reviewBooster';
import type { Booking } from '../src/data/adminInitialData';

describe('⭐ Tur Sonu Otomatik Google Yorum Toplayıcı & Akıllı Filtre (Review Booster)', () => {
  const sampleBooking: Booking = {
    id: 'PT-TEST-001',
    ticketCode: 'PT-9900',
    customerName: 'Ahmet Yılmaz',
    phone: '+90 532 111 22 33',
    hotel: 'Amari Phuket',
    roomNumber: '402',
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

  it('tamamlanmış veya geçmiş turları yoruma uygun bulmalı, iptalleri reddetmeli', () => {
    expect(isTourEligibleForReview(sampleBooking)).toBe(true);

    const cancelledBooking: Booking = {
      ...sampleBooking,
      status: 'cancelled',
    };
    expect(isTourEligibleForReview(cancelledBooking)).toBe(false);
  });

  it('18:30 davet mesajını ve bilet değerlendirme bağlantısını üretmeli', () => {
    const msg = generate1830ReviewInviteMessage(sampleBooking);
    expect(msg).toContain('Sayın *Ahmet Yılmaz*');
    expect(msg).toContain('Phi Phi & Maya Bay Sürat Teknesi');
    expect(msg).toContain(DEFAULT_GOOGLE_REVIEW_URL);
    expect(msg).toContain('/bilet/PT-9900#degerlendir');
    expect(msg).toContain('Google Haritalar');
  });

  it('Akıllı Filtre (Smart Sentiment Gate): 4 veya 5 yıldız doğrudan Google Haritalara gitmeli', () => {
    const eval5 = evaluateReviewSentiment(5, sampleBooking);
    expect(eval5.sentiment).toBe('positive');
    expect(eval5.intercepted).toBe(false);
    expect(eval5.action).toBe('direct_google_review');
    expect(eval5.targetUrl).toBe(DEFAULT_GOOGLE_REVIEW_URL);

    const eval4 = evaluateReviewSentiment(4, sampleBooking);
    expect(eval4.sentiment).toBe('positive');
    expect(eval4.intercepted).toBe(false);
  });

  it('Akıllı Filtre (Smart Sentiment Gate): 1, 2 veya 3 yıldız Google yerine Ofis Yöneticisine gitmeli', () => {
    const complaintText = 'Rehber geç geldi ve teknede öğle yemeği soğuktu.';
    const eval2 = evaluateReviewSentiment(2, sampleBooking, complaintText);

    expect(eval2.sentiment).toBe('negative_or_neutral');
    expect(eval2.intercepted).toBe(true);
    expect(eval2.action).toBe('intercept_manager_private');
    expect(eval2.targetUrl).toContain('https://wa.me/66828950665?text=');
    expect(eval2.targetUrl).toContain(encodeURIComponent('ACİL MİSAFİR GERİ BİLDİRİMİ'));
    expect(eval2.targetUrl).toContain(encodeURIComponent(complaintText));
    expect(eval2.targetUrl).not.toBe(DEFAULT_GOOGLE_REVIEW_URL);
  });

  it('Ofis Yöneticisi eskalasyon WhatsApp metnini eksiksiz üretmeli', () => {
    const url = generateManagerEscalationWhatsAppUrl(
      sampleBooking,
      1,
      'Sürat teknesinde dalga çok fazlaydı, haber verilmedi.'
    );
    expect(url).toContain('https://wa.me/66828950665');
    expect(url).toContain(encodeURIComponent('1 / 5 Yıldız (Kritik Düzeyde Olumsuz)'));
    expect(url).toContain(encodeURIComponent('Ahmet Yılmaz'));
    expect(url).toContain(encodeURIComponent('Amari Phuket (Oda: 402)'));
  });

  it('misafire doğrudan WhatsApp yorum bağlantısı üretmeli', () => {
    const url = getGoogleReviewWhatsAppUrl(sampleBooking);
    expect(url).toContain('https://wa.me/905321112233?text=');
    expect(url).toContain(encodeURIComponent('Sayın *Ahmet Yılmaz*'));
  });
});
