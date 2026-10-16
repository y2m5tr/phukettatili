import { describe, it, expect } from 'vitest';
import { generateTicketCode } from '../src/lib/ticketCodes';
import { detectHotelZone, getRecommendedPickupTime, type Booking } from '../src/data/adminInitialData';
import { buildWhatsAppDeepLink, formatWhatsAppPhone } from '../src/lib/whatsappEngine';

describe('Public Web Booking & Instant Ticket Flow', () => {
  it('misafir telefon numarasını ve WhatsApp linkini doğru üretmeli', () => {
    const rawPhone = '0544 123 45 67';
    const cleanPhone = formatWhatsAppPhone(rawPhone);
    expect(cleanPhone).toBe('905441234567');

    const ticketCode = generateTicketCode();
    expect(ticketCode).toMatch(/^PT-[A-Z0-9]+$/);

    const waMsg = `Referans: ${ticketCode} için rezervasyon talebi`;
    const waUrl = buildWhatsAppDeepLink('66828950665', waMsg);
    expect(waUrl).toContain('https://wa.me/66828950665?text=');
    expect(waUrl).toContain(encodeURIComponent(waMsg));
  });

  it('otel bölgesine göre doğru zon ve alış saati tespit etmeli', () => {
    const zonePatong = detectHotelZone('Four Points by Sheraton Patong');
    expect(zonePatong).toBe('Patong & Kalim');
    expect(getRecommendedPickupTime(zonePatong)).toBe('07:15');

    const zoneBangtao = detectHotelZone('Banyan Tree Bang Tao Beach');
    expect(zoneBangtao).toBe('Bang Tao & Surin');
    expect(getRecommendedPickupTime(zoneBangtao)).toBe('07:00');
  });

  it('web inquiry kaydını doğru başlangıç durumlarıyla modellemeli', () => {
    const ticketCode = generateTicketCode();
    const mockInquiry: Booking = {
      id: 'BK-7788',
      customerName: 'Melis Vural',
      phone: '+90 532 999 11 22',
      hotel: 'Amari Phuket Patong',
      hotelZone: detectHotelZone('Amari Phuket Patong'),
      tourId: 'phi-phi',
      tourTitle: 'Phi Phi & Maya Bay Erken Çıkış',
      tourDate: '2026-10-20',
      pickupTime: '07:15',
      adultCount: 2,
      childCount: 1,
      totalPriceThb: 8500,
      paidAmountThb: 0,
      remainingAmountThb: 8500,
      status: 'inquiry',
      paymentStatus: 'unpaid',
      nationalParkFeeIncluded: false,
      ticketCode,
      createdAt: '2026-10-16',
    };

    expect(mockInquiry.status).toBe('inquiry');
    expect(mockInquiry.paymentStatus).toBe('unpaid');
    expect(mockInquiry.remainingAmountThb).toBe(8500);
    expect(mockInquiry.ticketCode).toBe(ticketCode);
    expect(mockInquiry.hotelZone).toBe('Patong & Kalim');
  });
});
