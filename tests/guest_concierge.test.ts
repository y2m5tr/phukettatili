import { describe, it, expect } from 'vitest';
import {
  parsePickupWindow,
  generateEveningBreakfastReminder,
  generateVehicleInZoneAlert,
  generateLobbyArrivalAlert,
  getConciergeWhatsAppUrl,
} from '../src/lib/guestConcierge';
import type { Booking } from '../src/data/adminInitialData';

const mockBooking: Booking = {
  id: 'BK-CONCIERGE-1',
  ticketCode: 'PT-9988',
  customerName: 'Selin & Burak Demir',
  phone: '+905321112233',
  hotel: 'Amari Phuket',
  roomNumber: '1402',
  hotelZone: 'Patong & Kalim',
  tourTitle: 'Phi Phi, Maya Bay ve Bamboo Adası',
  tourDate: '2026-11-20',
  pickupTime: '07:30 - 07:45',
  adultCount: 2,
  childCount: 0,
  totalPriceThb: 5600,
  paidAmountThb: 1600,
  remainingAmountThb: 4000,
  status: 'confirmed',
  paymentStatus: 'partial',
  nationalParkFeeIncluded: false,
  assignedVehicle: 'Minivan #02 (Patong Hattı)',
  createdAt: '2026-10-16',
};

describe('⏰ Akıllı Lobi Alınış Hatırlatma Sistemi (Automated Guest Concierge)', () => {
  it('aralık veya tek saat formatlarını doğru 2 parçalı zaman penceresine ayırmalı', () => {
    const range = parsePickupWindow('08:30 - 09:00');
    expect(range.start).toBe('08:30');
    expect(range.end).toBe('09:00');
    expect(range.display).toBe('08:30 - 09:00');

    // Tek saat girildiğinde +15 dk aralık türetmeli
    const single = parsePickupWindow('07:15');
    expect(single.start).toBe('07:15');
    expect(single.end).toBe('07:30');
    expect(single.display).toBe('07:15 - 07:30');

    // Boş değer için güvenli varsayılan üretmeli
    const empty = parsePickupWindow('');
    expect(empty.start).toBe('07:30');
    expect(empty.end).toBe('07:45');
  });

  it('akşam 20:00 hatırlatmasında 2 ayrı saat satırı ve kahvaltı kutusu uyarısı bulunmalı', () => {
    const msg = generateEveningBreakfastReminder(mockBooking);

    // 2 ayrı saat satırı kontrolü
    expect(msg).toContain('1. OTEL LOBİ ALINIŞ ARALIĞI:');
    expect(msg).toContain('07:30 - 07:45');
    expect(msg).toContain('2. EN GEÇ LOBİDE BULUŞMA SAATİ:');
    expect(msg).toContain('07:30');

    // Kahvaltı kutusu (Breakfast Box) kontrolü
    expect(msg).toContain('KAHVALTI KUTUSU (BREAKFAST BOX)');
    expect(msg).toContain('resepsiyon');

    // Bakiye ve bilet kontrolü
    expect(msg).toContain('4,000 THB');
    expect(msg).toContain('PT-9988');
    expect(msg).toContain('Amari Phuket');
    expect(msg).toContain('Oda: 1402');
  });

  it('minivan bölgeye girdiğinde 2 zaman satırlı acil bildirim mesajı üretmeli', () => {
    const msg = generateVehicleInZoneAlert(mockBooking, 'Patong', 8);

    expect(msg).toContain('MİNİVAN BÖLGENİZE GİRDİ');
    expect(msg).toContain('Patong');
    expect(msg).toContain('*1. Planlanan Alınış Aralığınız:* *07:30 - 07:45*');
    expect(msg).toContain('*2. Tahmini Lobiye Varış Süresi:* *Yaklaşık 8 - 10 Dakika İçinde*');
    expect(msg).toContain('Kahvaltı kutunuzu');
  });

  it('araç lobide beklerken acil hareket uyarısı üretmeli', () => {
    const msg = generateLobbyArrivalAlert(mockBooking);

    expect(msg).toContain('ARACINIZ ŞU AN OTEL LOBİSİNDE');
    expect(msg).toContain('07:30 - 07:45');
    expect(msg).toContain('Araç Lobide Hazır Bekliyor');
    expect(msg).toContain(mockBooking.hotel);
  });

  it('WhatsApp derin bağlantılarını hatasız oluşturmalı', () => {
    const eveningUrl = getConciergeWhatsAppUrl('evening_breakfast', mockBooking);
    expect(eveningUrl).toContain('https://wa.me/905321112233?text=');
    expect(eveningUrl).toContain(encodeURIComponent('KAHVALTI KUTUSU'));

    const zoneUrl = getConciergeWhatsAppUrl('vehicle_in_zone', mockBooking, 'Kata');
    expect(zoneUrl).toContain('https://wa.me/905321112233?text=');
    expect(zoneUrl).toContain(encodeURIComponent('MİNİVAN BÖLGENİZE GİRDİ'));
  });
});
