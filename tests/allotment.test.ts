import { describe, it, expect } from 'vitest';
import {
  getTourCapacity,
  calculateTourOccupancy,
  checkBookingOverbookingWarning,
} from '../src/lib/allotment';
import type { Booking } from '../src/data/adminInitialData';

describe('getTourCapacity', () => {
  it('özel maxCapacity tanımlıysa onu öncelikli döndürür', () => {
    expect(getTourCapacity('Phi Phi Speedboat', { maxCapacity: 28 } as any)).toBe(28);
  });

  it('Yat turları için 25 kapasite atar', () => {
    expect(getTourCapacity('Phuket VIP Yat Kiralama')).toBe(25);
  });

  it('Katamaran turları için 45 kapasite atar', () => {
    expect(getTourCapacity('Coral & Racha Katamaran')).toBe(45);
  });

  it('Speedboat ve ada turları için 35 kapasite atar', () => {
    expect(getTourCapacity('James Bond Adası Speedboat')).toBe(35);
  });

  it('Safari / ATV turları için 20 kapasite atar', () => {
    expect(getTourCapacity('Phuket ATV ve Fil Koruma')).toBe(20);
  });
});

describe('calculateTourOccupancy', () => {
  const sampleBookings: Booking[] = [
    {
      id: 'PT-1001',
      customerName: 'Ahmet Yılmaz',
      tourId: 'phi-phi',
      tourTitle: 'Phi Phi & Maya Bay',
      tourDate: '2026-10-20',
      adultCount: 2,
      childCount: 1,
      hotel: 'Amari Phuket',
      totalPriceThb: 8000,
      paidAmountThb: 8000,
      remainingAmountThb: 0,
      paymentStatus: 'paid',
      phone: '905551112233',
      status: 'confirmed',
      createdAt: '2026-10-01',
    },
    {
      id: 'PT-1002',
      customerName: 'Mehmet Demir',
      tourId: 'phi-phi',
      tourTitle: 'Phi Phi & Maya Bay',
      tourDate: '2026-10-20',
      adultCount: 4,
      childCount: 0,
      hotel: 'Hilton Phuket',
      totalPriceThb: 11000,
      paidAmountThb: 11000,
      remainingAmountThb: 0,
      paymentStatus: 'paid',
      phone: '905552223344',
      status: 'confirmed',
      createdAt: '2026-10-01',
    },
    {
      id: 'PT-1003',
      customerName: 'Ayşe Kaya (İptal)',
      tourId: 'phi-phi',
      tourTitle: 'Phi Phi & Maya Bay',
      tourDate: '2026-10-20',
      adultCount: 2,
      childCount: 0,
      hotel: 'Novotel',
      totalPriceThb: 5000,
      paidAmountThb: 0,
      remainingAmountThb: 0,
      paymentStatus: 'unpaid',
      phone: '905553334455',
      status: 'cancelled', // iptal edilmiş, sayılmamalı
      createdAt: '2026-10-01',
    },
  ];

  it('belirtilen tur ve tarihteki toplam yolcu sayısını doğru hesaplar (iptaller hariç)', () => {
    // 2+1 (PT-1001) + 4 (PT-1002) = 7 yolcu. PT-1003 iptal olduğu için sayılmaz.
    const res = calculateTourOccupancy('Phi Phi & Maya Bay', '2026-10-20', sampleBookings, 35);
    expect(res.bookedPax).toBe(7);
    expect(res.capacity).toBe(35);
    expect(res.remainingSeats).toBe(28);
    expect(res.occupancyPercent).toBe(20);
    expect(res.status).toBe('available');
    expect(res.isFull).toBe(false);
    expect(res.isOverbooked).toBe(false);
  });

  it('kapasite aşımında overbooked durumunu tespit eder', () => {
    const res = calculateTourOccupancy('Phi Phi & Maya Bay', '2026-10-20', sampleBookings, 6);
    expect(res.bookedPax).toBe(7);
    expect(res.capacity).toBe(6);
    expect(res.remainingSeats).toBe(-1);
    expect(res.isOverbooked).toBe(true);
    expect(res.status).toBe('overbooked');
  });
});

describe('checkBookingOverbookingWarning', () => {
  const sampleBookings: Booking[] = [
    {
      id: 'PT-2001',
      customerName: 'Test Müşteri',
      tourId: 'similan',
      tourTitle: 'Similan Speedboat',
      tourDate: '2026-11-05',
      adultCount: 30,
      childCount: 0,
      hotel: 'JW Marriott',
      totalPriceThb: 90000,
      paidAmountThb: 90000,
      remainingAmountThb: 0,
      paymentStatus: 'paid',
      phone: '905559998877',
      status: 'confirmed',
      createdAt: '2026-10-01',
    },
  ];

  it('kontenjan yeterli olduğunda uyarı vermez', () => {
    // 30 kişi var, kapasite 35, 4 kişi ekliyoruz -> toplam 34 <= 35 -> OK
    const check = checkBookingOverbookingWarning('Similan Speedboat', '2026-11-05', 4, sampleBookings, 35);
    expect(check.hasWarning).toBe(false);
    expect(check.remainingSeats).toBe(1);
  });

  it('kontenjan aşıldığında uyarı mesajı üretir', () => {
    // 30 kişi var, kapasite 35, 8 kişi ekliyoruz -> toplam 38 > 35 -> uyarı!
    const check = checkBookingOverbookingWarning('Similan Speedboat', '2026-11-05', 8, sampleBookings, 35);
    expect(check.hasWarning).toBe(true);
    expect(check.message).toContain('Overbooking riski');
    expect(check.remainingSeats).toBe(5);
  });

  it('aynı rezervasyon güncelleniyorsa kendini mükerrer saymaz', () => {
    // PT-2001'i güncelliyoruz, excludeBookingId = 'PT-2001'
    const check = checkBookingOverbookingWarning('Similan Speedboat', '2026-11-05', 32, sampleBookings, 35, 'PT-2001');
    expect(check.hasWarning).toBe(false);
    expect(check.remainingSeats).toBe(3);
  });
});
