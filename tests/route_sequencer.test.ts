import { describe, it, expect } from 'vitest';
import {
  sequenceRouteStops,
  buildSequencedRoute,
  formatDriverWhatsAppRouteMessage,
  type RouteStop,
} from '../src/lib/routeSequencer';

describe('Aşama 3: Akıllı Minivan Rota Sıralayıcısı & Transfer Yol Haritası', () => {
  const mockStops: RouteStop[] = [
    {
      id: '1',
      bookingId: 'BK-1',
      customerName: 'Ahmet Yılmaz',
      phone: '+905321112233',
      hotel: 'Kata Palm Resort',
      hotelZone: 'Kata & Karon',
      pickupTime: '07:45',
      adultCount: 2,
      childCount: 0,
      remainingAmountThb: 1500,
      tourTitle: 'Phi Phi Adaları',
    },
    {
      id: '2',
      bookingId: 'BK-2',
      customerName: 'Zeynep Kaya',
      phone: '+905324445566',
      hotel: 'Millennium Resort Patong',
      hotelZone: 'Patong & Kalim',
      pickupTime: '07:15',
      adultCount: 2,
      childCount: 1,
      remainingAmountThb: 0,
      tourTitle: 'Phi Phi Adaları',
    },
    {
      id: '3',
      bookingId: 'BK-3',
      customerName: 'Burak Demir',
      phone: '+905327778899',
      hotel: 'Banyan Tree Phuket',
      hotelZone: 'Bang Tao & Laguna',
      pickupTime: '08:00',
      adultCount: 1,
      childCount: 0,
      remainingAmountThb: 2000,
      tourTitle: 'Phi Phi Adaları',
    },
  ];

  it('pier_bound modunda durakları Kuzeyden Güneye (Bang Tao -> Patong -> Kata) coğrafi olarak dizmeli', () => {
    const sorted = sequenceRouteStops(mockStops, 'pier_bound');
    expect(sorted[0].hotelZone).toContain('Bang Tao');
    expect(sorted[1].hotelZone).toContain('Patong');
    expect(sorted[2].hotelZone).toContain('Kata');
  });

  it('time modunda durakları alınış saatine göre (07:15 -> 07:45 -> 08:00) dizmeli', () => {
    const sorted = sequenceRouteStops(mockStops, 'time');
    expect(sorted[0].pickupTime).toBe('07:15');
    expect(sorted[1].pickupTime).toBe('07:45');
    expect(sorted[2].pickupTime).toBe('08:00');
  });

  it('buildSequencedRoute toplam yolcu, nakit ve harita URL lerini doğru üretmeli', () => {
    const route = buildSequencedRoute(
      'Van 01 (34 ABC 777)',
      mockStops,
      'pier_bound',
      'Somchai Prasert',
      '+66812345678'
    );

    expect(route.totalPassengers).toBe(6); // 2 + 3 + 1 = 6
    expect(route.totalCashToCollectThb).toBe(3500); // 1500 + 0 + 2000
    expect(route.googleMapsUrl).toContain('google.com/maps/dir');
    expect(route.wazeUrl).toContain('waze.com/ul');
  });

  it('formatDriverWhatsAppRouteMessage şoför için eksiksiz görev emri metni üretmeli', () => {
    const route = buildSequencedRoute('Van 01', mockStops, 'pier_bound', 'Somchai');
    const msg = formatDriverWhatsAppRouteMessage(route, '17 Ekim 2026');

    expect(msg).toContain('TRANSFER GÖREV EMRİ & ROTA PLANI');
    expect(msg).toContain('Somchai');
    expect(msg).toContain('CANLI GOOGLE MAPS ROTA LİNKİ:');
    expect(msg).toContain('*TOPLAM TAHSİL EDİLECEK NAKİT:* 3,500 THB');
  });
});
