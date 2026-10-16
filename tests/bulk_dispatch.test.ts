import { describe, it, expect } from 'vitest';
import {
  generateGuestReminderMessage,
  getGuestReminderWhatsAppUrl,
} from '../src/lib/bulkDispatch';
import type { PickupItem } from '../src/lib/adminFilters';

describe('Bulk WhatsApp Dispatcher', () => {
  const samplePickup: PickupItem = {
    bookingId: 'PT-DISP-001',
    customerName: 'Zeynep Kaya',
    phone: '+90 533 123 4567',
    hotel: 'Katathani Phuket Beach Resort',
    hotelZone: 'Kata & Karon',
    roomNumber: '412',
    tourIndex: 0,
    tourTitle: 'Similan Adaları Erken Çıkışlı Katamaran Turu',
    tourDate: '2026-10-17',
    pickupTime: '06:00',
    adultCount: 2,
    childCount: 1,
    remainingAmountThb: 1500,
    pickupStatus: 'pending',
    assignedVehicle: '1 Nolu Hat (Kuzey-Similan)',
    assignedDriver: 'driver-somchai',
  };

  it('should generate pre_tour_reminder message with pickup details', () => {
    const msg = generateGuestReminderMessage(samplePickup, 'pre_tour_reminder');
    expect(msg).toContain('Sayın *Zeynep Kaya*');
    expect(msg).toContain('06:00');
    expect(msg).toContain('Katathani Phuket Beach Resort (Oda: 412)');
    expect(msg).toContain('1 Nolu Hat (Kuzey-Similan)');
    expect(msg).toContain('1,500 THB');
    expect(msg).toContain('https://phukettatili.com/bilet/PT-DISP-001');
  });

  it('should generate driver_arrived message', () => {
    const msg = generateGuestReminderMessage(samplePickup, 'driver_arrived');
    expect(msg).toContain('ARACINIZ OTEL LOBİSİNDE BEKLİYOR');
    expect(msg).toContain('Katathani Phuket Beach Resort');
    expect(msg).toContain('ana lobisine ulaşmıştır');
  });

  it('should generate balance_reminder message', () => {
    const msg = generateGuestReminderMessage(samplePickup, 'balance_reminder');
    expect(msg).toContain('1,500 THB');
    expect(msg).toContain('nakit Baht (THB)');
  });

  it('should create valid WhatsApp link with phone and encoded message', () => {
    const url = getGuestReminderWhatsAppUrl(samplePickup, 'pre_tour_reminder');
    expect(url).toContain('https://wa.me/905331234567?text=');
    expect(url).toContain(encodeURIComponent('Sayın *Zeynep Kaya*'));
  });
});
