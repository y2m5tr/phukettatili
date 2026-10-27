import { describe, it, expect } from 'vitest';
import {
  getTourCapacity,
  calculateTourOccupancy,
} from '../src/lib/allotment';
import { availabilityStatusLabel, AVAILABILITY_STATUS_LABELS } from '../src/lib/availabilityLabels';
import type { Booking, BookingTourSchedule } from '../src/data/adminInitialData';

/**
 * /api/tour-availability ucu doluluk hesabını calculateTourOccupancy'ya
 * delege eder ve AVAILABILITY_STATUS_LABELS ile etiketler. Bu test o iki
 * parçanın API'nin sözleşmesini (toplan sayı + durum etiketi) yerine
 * getirdiğini kilitler; API katmanı Astro context gerektirdiğinden E2E
 * tarafında (Playwright) yol testi yapılır.
 */

const mkBooking = (over: Partial<BookingTourSchedule> & { tourTitle: string; tourDate: string }): Booking =>
  ({
    id: 'BK-T',
    customerName: 'x',
    phone: 'x',
    tourDate: over.tourDate,
    adultCount: 2,
    childCount: 0,
    totalPriceThb: 1000,
    paidAmountThb: 1000,
    status: 'confirmed',
    tours: [over as BookingTourSchedule],
  }) as any as Booking;

describe('tour-availability sözleşmesi', () => {
  it('boş tarih için available + etiket üretir', () => {
    const occ = calculateTourOccupancy('Phi Phi Turu', '2026-11-20', [], 35);
    expect(occ.status).toBe('available');
    expect(availabilityStatusLabel(occ.status)).toBe('Yer var');
    expect(occ.remainingSeats).toBe(35);
  });

  it('kapasiteye yaklaşınca filling/critical etiketleri çıkar', () => {
    // 2 pax / 4 kapasite = %50 → filling (eşik: >=50)
    const bookings = [mkBooking({ tourTitle: 'Phi Phi Turu', tourDate: '2026-11-20' })];
    const occ = calculateTourOccupancy('Phi Phi Turu', '2026-11-20', bookings, 4);
    expect(occ.status).toBe('filling');
    expect(availabilityStatusLabel(occ.status)).toBe('Hızla doluyor');

    // 4 pax / 5 kapasite = %80 → critical (eşik: >=80)
    const critical = calculateTourOccupancy(
      'Phi Phi Turu',
      '2026-11-20',
      [mkBooking({ tourTitle: 'Phi Phi Turu', tourDate: '2026-11-20' }), mkBooking({ tourTitle: 'Phi Phi Turu', tourDate: '2026-11-20' })],
      5,
    );
    expect(critical.status).toBe('critical');
    expect(availabilityStatusLabel(critical.status)).toBe('Son birkaç yer');
  });

  it('dolulukta full + overbooked aynı etiketi alır (müşteriye tek mesaj)', () => {
    expect(AVAILABILITY_STATUS_LABELS.full).toBe('Bu tarih doldu');
    expect(AVAILABILITY_STATUS_LABELS.overbooked).toBe('Bu tarih doldu');

    const full = calculateTourOccupancy(
      'Phi Phi Turu',
      '2026-11-20',
      [mkBooking({ tourTitle: 'Phi Phi Turu', tourDate: '2026-11-20' }), mkBooking({ tourTitle: 'Phi Phi Turu', tourDate: '2026-11-20' }), mkBooking({ tourTitle: 'Phi Phi Turu', tourDate: '2026-11-20' })],
      6,
    );
    expect(full.isFull || full.isOverbooked).toBe(true);
    expect(availabilityStatusLabel(full.status)).toBe('Bu tarih doldu');
  });

  it('iptal edilen rezervasyon doluluğa girmez', () => {
    const b = mkBooking({ tourTitle: 'Phi Phi Turu', tourDate: '2026-11-20' });
    b.status = 'cancelled';
    const occ = calculateTourOccupancy('Phi Phi Turu', '2026-11-20', [b], 35);
    expect(occ.bookedPax).toBe(0);
    expect(occ.status).toBe('available');
  });

  it('farklı tur başlığı aynı tarihte doluluğu etkilemez', () => {
    const other = mkBooking({ tourTitle: 'Similan Adaları', tourDate: '2026-11-20' });
    const occ = calculateTourOccupancy('Phi Phi Turu', '2026-11-20', [other], 35);
    expect(occ.bookedPax).toBe(0);
  });

  it('kapasite kaydı yoksa başlıktan sezgisel kapasite kullanılır', () => {
    // API, tur kaydı çözemezse getTourCapacity ile aynı düşer
    expect(getTourCapacity('Phuket VIP Yat Kiralama')).toBe(25);
  });
});
