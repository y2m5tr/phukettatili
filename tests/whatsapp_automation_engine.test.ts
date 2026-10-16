import { describe, it, expect } from 'vitest';
import {
  formatWhatsAppPhone,
  buildWhatsAppDeepLink,
  generateTriggerMessage,
  getPendingAutomationTriggers,
  markNotificationSent,
} from '../src/lib/whatsappEngine';
import type { Booking } from '../src/data/adminInitialData';

describe('Aşama 5: WhatsApp Smart Automation & Trigger Engine', () => {
  const baseBooking: Booking = {
    id: 'BK-5555',
    customerName: 'Can Demir',
    phone: '+90 533 999 88 77',
    hotel: 'The Shore at Katathani',
    roomNumber: 'Villa 12',
    tourId: 'phi-phi',
    tourTitle: 'Phi Phi & Maya Bay Erken Çıkış',
    tourDate: '2026-10-17',
    pickupTime: '06:45',
    adultCount: 2,
    childCount: 1,
    totalPriceThb: 9500,
    paidAmountThb: 5000,
    remainingAmountThb: 4500,
    status: 'confirmed',
    pickupStatus: 'pending',
    paymentStatus: 'partial',
    ticketCode: 'PT-DEMIR77',
    assignedVehicle: '34 VIP 01 (Toyota Commuter)',
    assignedDriver: 'Somchai (Rehber: Murat)',
    createdAt: '2026-10-15',
  };

  it('telefon numaralarını uluslararası WhatsApp formatına temizlemeli', () => {
    expect(formatWhatsAppPhone('+90 532 123 45 67')).toBe('905321234567');
    expect(formatWhatsAppPhone('05321234567')).toBe('905321234567');
    expect(formatWhatsAppPhone('0066828950665')).toBe('66828950665');
    expect(formatWhatsAppPhone('+66-82-895-0665')).toBe('66828950665');
  });

  it('wa.me deep link bağlantısını metin ile doğru formatlamalı', () => {
    const url = buildWhatsAppDeepLink('+90 533 999 88 77', 'Merhaba Can Bey!');
    expect(url).toContain('https://wa.me/905339998877?text=');
    expect(url).toContain(encodeURIComponent('Merhaba Can Bey!'));
  });

  it('T-24h hatırlatma mesajında tüm operasyon detaylarını eksiksiz üretmeli', () => {
    const msg = generateTriggerMessage('t24_reminder', baseBooking);
    expect(msg).toContain('Sayın *Can Demir*');
    expect(msg).toContain('Phi Phi & Maya Bay Erken Çıkış');
    expect(msg).toContain('06:45');
    expect(msg).toContain('The Shore at Katathani (Oda: Villa 12)');
    expect(msg).toContain('34 VIP 01');
    expect(msg).toMatch(/4[.,]500 THB/);
    expect(msg).toContain('https://phukettatili.com/bilet/PT-DEMIR77');
    expect(msg).toContain('havlu, güneş kremi');
  });

  it('driver_arrived lobi mesajında araç ve bilet bilgisini vermeli', () => {
    const msg = generateTriggerMessage('driver_arrived', baseBooking);
    expect(msg).toContain('ARACINIZ OTEL LOBİSİNDE BEKLİYOR');
    expect(msg).toContain('The Shore at Katathani');
    expect(msg).toContain('34 VIP 01');
    expect(msg).toContain('PT-DEMIR77');
  });

  it('review_booster mesajında Google 5 yıldız bağlantısını bulundurmalı', () => {
    const msg = generateTriggerMessage('review_booster', baseBooking);
    expect(msg).toContain('GÜNÜNÜZ NASIL GEÇTİ?');
    expect(msg).toContain('Google Haritalar profilimizde 5 yıldızla');
    expect(msg).toContain('https://g.page/r/phukettatili/review');
  });

  it('balance_alert mesajında kalan Baht tutarını nakit uyarısıyla belirtmeli', () => {
    const msg = generateTriggerMessage('balance_alert', baseBooking);
    expect(msg).toContain('BAKİYE BİLGİLENDİRMESİ');
    expect(msg).toMatch(/4[.,]500 THB/);
    expect(msg).toContain('nakit Baht (THB)');
  });

  it('otomasyon motoru yarınki turları T-24h kuyruğuna almalı', () => {
    const fakeNow = new Date('2026-10-16T12:00:00Z');
    const tomorrowBooking: Booking = {
      ...baseBooking,
      tourDate: '2026-10-17',
    };

    const triggers = getPendingAutomationTriggers([tomorrowBooking], fakeNow);
    const t24 = triggers.find((t) => t.type === 't24_reminder');
    expect(t24).toBeDefined();
    expect(t24?.customerName).toBe('Can Demir');
    expect(t24?.priority).toBe('high');
  });

  it('iptal edilen rezervasyonları otomasyon kuyruğuna almamalı', () => {
    const fakeNow = new Date('2026-10-16T12:00:00Z');
    const cancelledBooking: Booking = {
      ...baseBooking,
      tourDate: '2026-10-17',
      status: 'cancelled',
    };

    const triggers = getPendingAutomationTriggers([cancelledBooking], fakeNow);
    expect(triggers.length).toBe(0);
  });

  it('markNotificationSent gönderim durumunu rezervasyona işlemeli', () => {
    const updated = markNotificationSent(baseBooking, 't24_reminder');
    expect(updated.whatsAppReminderSent).toBe(true);
    expect(updated.lastWhatsAppNotifiedAt).toBeDefined();

    const reviewUpdated = markNotificationSent(baseBooking, 'review_booster');
    expect(reviewUpdated.whatsAppReviewSent).toBe(true);
  });
});
