import { describe, it, expect } from 'vitest';
import {
  normalizeFlightNumber,
  getFlightStatusInfo,
  generateDriverFlightDelayWhatsApp,
  generateGuestLandingWelcomeWhatsApp,
  getFlightWhatsAppUrl,
} from '../src/lib/flightRadar';

describe('Airport Live Flight Radar & Driver Delay Shield', () => {
  it('should normalize lowercase and spaced flight numbers', () => {
    expect(normalizeFlightNumber('tk172')).toBe('TK 172');
    expect(normalizeFlightNumber('EK396')).toBe('EK 396');
    expect(normalizeFlightNumber('qr 840')).toBe('QR 840');
  });

  it('should retrieve flight status and calculate delay accurately', () => {
    const flight = getFlightStatusInfo('TK172', 45); // 45 minutes delay
    expect(flight.flightNumber).toBe('TK 172');
    expect(flight.airline).toContain('Türk Hava Yolları');
    expect(flight.status).toBe('delayed');
    expect(flight.delayMinutes).toBe(45);
    expect(flight.scheduledArrival).toBe('14:30');
    expect(flight.estimatedArrival).toBe('15:15');
  });

  it('should generate bilingual Thai and English driver delay WhatsApp message', () => {
    const flight = getFlightStatusInfo('TK172', 30);
    const msg = generateDriverFlightDelayWhatsApp({
      flight,
      driverName: 'Somchai',
      guestName: 'Ahmet Bey',
      vehicleCode: 'VIP Van 35-1249',
    });

    expect(msg).toContain('Sawadee khrup Khun Somchai');
    expect(msg).toContain('TK 172');
    expect(msg).toContain('DELAYED');
    expect(msg).toContain('+30 mins');
    expect(msg).toContain(flight.estimatedArrival);
    expect(msg).toContain('Gate 3 / 4');
  });

  it('should generate reassuring guest landing welcome message', () => {
    const flight = getFlightStatusInfo('EK396', 0);
    const msg = generateGuestLandingWelcomeWhatsApp({
      flight,
      guestName: 'Murat Yılmaz',
      driverName: 'Noi',
      driverPhone: '+66812345678',
      vehiclePlate: 'Van 30-9912',
      hotelName: 'Amari Phuket',
    });

    expect(msg).toContain('Murat Yılmaz');
    expect(msg).toContain('EK 396');
    expect(msg).toContain('Noi');
    expect(msg).toContain('Amari Phuket');
    expect(msg).toContain('Phuket Tatili - Murat Yılmaz');

    const url = getFlightWhatsAppUrl('+905321112233', msg);
    expect(url).toContain('https://wa.me/905321112233?text=');
  });
});
