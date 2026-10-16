import { describe, it, expect } from 'vitest';
import {
  getMarineSafetyStatus,
  generateWeatherPostponeMessage,
  getWeatherPostponeWhatsAppUrl,
} from '../src/lib/marineWeather';
import type { Booking } from '../src/data/adminInitialData';

describe('Marine Safety & Weather Sentinel', () => {
  const sampleBooking: Booking = {
    id: 'PT-SEA-01',
    customerName: 'Burak Özdemir',
    phone: '+90 532 999 88 77',
    hotel: 'The Slate Phuket',
    tourTitle: 'Phi Phi & Maya Bay Sürat Teknesi',
    tourDate: '2026-10-18',
    adultCount: 2,
    childCount: 0,
    totalPriceThb: 6400,
    paidAmountThb: 6400,
    remainingAmountThb: 0,
    status: 'confirmed',
    paymentStatus: 'paid',
    createdAt: '2026-10-16T10:00:00Z',
  };

  it('should fetch marine safety report with valid level and wave metrics', async () => {
    const report = await getMarineSafetyStatus();
    expect(report).toBeDefined();
    expect(['calm', 'moderate', 'severe']).toContain(report.level);
    expect(report.waveHeightMeters).toBeGreaterThan(0);
    expect(report.windSpeedKnots).toBeGreaterThan(0);
    expect(report.regionStatus.phi_phi).toBeDefined();
    expect(report.regionStatus.phang_nga).toBeDefined();
    expect(report.regionStatus.similan).toBeDefined();
  });

  it('should generate personalized weather postpone message', () => {
    const msg = generateWeatherPostponeMessage(sampleBooking, 'James Bond Adası Kano Turu');
    expect(msg).toContain('Sayın *Burak Özdemir*');
    expect(msg).toContain('Phi Phi & Maya Bay Sürat Teknesi');
    expect(msg).toContain('James Bond Adası Kano Turu');
    expect(msg).toContain('https://phukettatili.com/bilet/PT-SEA-01');
    expect(msg).toContain('Liman Başkanlığı');
  });

  it('should create valid WhatsApp direct url with encoded message', () => {
    const url = getWeatherPostponeWhatsAppUrl(sampleBooking);
    expect(url).toContain('https://wa.me/905329998877?text=');
    expect(url).toContain(encodeURIComponent('Sayın *Burak Özdemir*'));
  });
});
