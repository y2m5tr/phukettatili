import { describe, it, expect } from 'vitest';
import { filterBookings, filterTours, buildDailyPickups } from '../src/lib/adminFilters';
import type { Booking, TourItem } from '../src/data/adminInitialData';

// ---------------------------------------------------------------------------
// Fixture'lar
// ---------------------------------------------------------------------------
const baseBooking: Booking = {
  id: 'BK-100001',
  customerName: 'Ahmet Yılmaz',
  phone: '+90 532 111 22 33',
  email: 'ahmet@example.com',
  hotel: 'Patong Resort',
  roomNumber: '304',
  tourId: 'james-bond',
  tourTitle: 'James Bond Adası',
  tourDate: '2026-02-14',
  pickupTime: '07:45',
  tours: [],
  adultCount: 2,
  childCount: 1,
  totalPriceThb: 4500,
  costThb: 3000,
  supplier: 'Andaman Wave',
  paidAmountThb: 2000,
  remainingAmountThb: 2500,
  nationalParkFeeIncluded: false,
  status: 'confirmed',
  paymentStatus: 'partial',
  specialNotes: 'Bebek koltuğu gerekli',
  createdAt: '2026-01-01',
};

const multiTourBooking: Booking = {
  ...baseBooking,
  id: 'BK-100002',
  customerName: 'Elif Kaya',
  hotel: 'Kata Palm Resort',
  tourDate: '2026-02-15',
  tours: [
    {
      tourId: 'similan',
      tourTitle: 'Similan Adaları',
      tourDate: '2026-02-15',
      pickupTime: '06:30',
      priceThb: 5500,
      costThb: 4000,
      supplier: 'Blue Ocean',
      assignedVehicle: 'Minibüs 1',
      assignedDriver: 'drv-1',
    },
    {
      tourId: 'phi-phi',
      tourTitle: 'Phi Phi Adaları',
      tourDate: '2026-02-17',
      pickupTime: '08:15',
      priceThb: 4800,
      costThb: 3600,
    },
  ],
  status: 'inquiry',
};

const cancelledBooking: Booking = {
  ...baseBooking,
  id: 'BK-100003',
  customerName: 'Vedat İptal',
  tourDate: '2026-02-14',
  status: 'cancelled',
};

const sampleTours: TourItem[] = [
  {
    id: 'james-bond',
    title: 'James Bond Adası Turu',
    category: 'ada',
    categoryLabel: 'Ada Turları',
    priceThb: 1800,
    duration: 'Tam Gün',
    image: 'jamesbond.webp',
    featured: true,
  } as TourItem,
  {
    id: 'similan',
    title: 'Similan Adaları Dalış',
    category: 'dalıs',
    categoryLabel: 'Dalış',
    priceThb: 5500,
    duration: 'Tam Gün',
    image: 'similan.webp',
    featured: false,
  } as TourItem,
];

// ---------------------------------------------------------------------------
// filterBookings
// ---------------------------------------------------------------------------
describe('filterBookings', () => {
  const bookings = [baseBooking, multiTourBooking, cancelledBooking];

  it('filtresiz hepsini döndürür (iptaller dahil — durum filtresi ayrı)', () => {
    expect(filterBookings(bookings, '', 'all', '')).toHaveLength(3);
  });

  it('müşteri adıyla arar (büyük/küçük harf duyarsız)', () => {
    const result = filterBookings(bookings, 'ahmet', 'all', '');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('BK-100001');
  });

  it('telefon, otel ve tur başlığında arar', () => {
    // "patong" — BK-100001 ve ondan türeyen (aynı oteli miras alan)
    // iptal kaydı BK-100003 eşleşir: durum filtresi seçilmedikçe iptaller
    // listede kalır (tasarım böyle — durum filtresi ayrı bir boyut).
    expect(filterBookings(bookings, 'patong', 'all', '')).toHaveLength(2);
    expect(filterBookings(bookings, 'kata palm', 'all', '')).toHaveLength(1);
    expect(filterBookings(bookings, '532', 'all', '')).toHaveLength(3);
    expect(filterBookings(bookings, 'james bond', 'all', '')).toHaveLength(3);
  });

  it('çoklu turlu kayıtta tur başlığı üzerinden eşleşir', () => {
    // "similan" sadece BK-100002'nin tours dizisinde geçer.
    expect(filterBookings(bookings, 'similan', 'all', '')).toHaveLength(1);
    expect(filterBookings(bookings, 'similan', 'all', '')[0].id).toBe('BK-100002');
  });

  it('durum filtresi: sadece onaylılar', () => {
    const result = filterBookings(bookings, '', 'confirmed', '');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('BK-100001');
  });

  it('durum filtresi: teklifler', () => {
    expect(filterBookings(bookings, '', 'inquiry', '')[0].id).toBe('BK-100002');
  });

  it('tarih filtresi: tek turlu kayıtta tourDate eşleşir', () => {
    const result = filterBookings(bookings, '', 'all', '2026-02-14');
    // İptal edilen de 14'ünde ama iptal kaydı da listelenir (durum filtresi ayrı).
    expect(result).toHaveLength(2);
    expect(result.map((b) => b.id).sort()).toEqual(['BK-100001', 'BK-100003']);
  });

  it('tarih filtresi: çoklu turlu kayıtta herhangi bir tur tarihi eşleşir', () => {
    const result = filterBookings(bookings, '', 'all', '2026-02-17');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('BK-100002');
  });

  it('tarih + arama birlikte AND işlemi yapar', () => {
    expect(filterBookings(bookings, 'elif', 'all', '2026-02-15')).toHaveLength(1);
    expect(filterBookings(bookings, 'ahmet', 'all', '2026-02-15')).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// filterTours
// ---------------------------------------------------------------------------
describe('filterTours', () => {
  it('filtresiz hepsi', () => {
    expect(filterTours(sampleTours, '', 'all')).toHaveLength(2);
  });

  it('başlıkta arama', () => {
    expect(filterTours(sampleTours, 'james', 'all')).toHaveLength(1);
    expect(filterTours(sampleTours, 'JAMES', 'all')[0].id).toBe('james-bond');
  });

  it('kategori filtresi', () => {
    expect(filterTours(sampleTours, '', 'ada')).toHaveLength(1);
    expect(filterTours(sampleTours, '', 'ada')[0].id).toBe('james-bond');
  });

  it('arama + kategori AND', () => {
    expect(filterTours(sampleTours, 'similan', 'ada')).toHaveLength(0);
    expect(filterTours(sampleTours, 'similan', 'dalıs')).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// buildDailyPickups
// ---------------------------------------------------------------------------
describe('buildDailyPickups', () => {
  const bookings = [baseBooking, multiTourBooking, cancelledBooking];

  it('iptal edilmiş kayıtlar hiç girmez', () => {
    const pickups = buildDailyPickups(bookings, '2026-02-14');
    expect(pickups.some((p) => p.bookingId === 'BK-100003')).toBe(false);
  });

  it('seçilen tarihteki kayıtları düzleştirir', () => {
    const pickups = buildDailyPickups(bookings, '2026-02-14');
    expect(pickups).toHaveLength(1);
    expect(pickups[0].bookingId).toBe('BK-100001');
    expect(pickups[0].tourTitle).toBe('James Bond Adası');
    expect(pickups[0].tourIndex).toBe(-1); // tek turlu kayıt
  });

  it('çoklu turlu kayıtta yalnızca eşleşen tarihler satır olur', () => {
    // BK-100002: 15'inde Similan, 17'sinde Phi Phi. 15'i seçilirse 1 satır.
    const pickups = buildDailyPickups(bookings, '2026-02-15');
    expect(pickups).toHaveLength(1);
    expect(pickups[0].tourTitle).toBe('Similan Adaları');
    expect(pickups[0].tourIndex).toBe(0);
    expect(pickups[0].pickupTime).toBe('06:30');
  });

  it('pickupTime yoksa varsayılan 07:30 kullanılır', () => {
    const noTime = { ...baseBooking, pickupTime: '' };
    const pickups = buildDailyPickups([noTime], '2026-02-14');
    expect(pickups[0].pickupTime).toBe('07:30');
  });

  it('kronolojik sıralı döner', () => {
    const early = { ...baseBooking, pickupTime: '09:30' };
    const late = { ...baseBooking, id: 'BK-LATE', pickupTime: '14:00' };
    const pickups = buildDailyPickups([late, early], '2026-02-14');
    expect(pickups.map((p) => p.pickupTime)).toEqual(['09:30', '14:00']);
  });

  it('tur seviyesindeki atama kayıt seviyesinden önceliklidir', () => {
    const pickups = buildDailyPickups(bookings, '2026-02-15');
    // Similan satırında tur bazlı atama: Minibüs 1 / drv-1
    expect(pickups[0].assignedVehicle).toBe('Minibüs 1');
    expect(pickups[0].assignedDriver).toBe('drv-1');
  });

  it('tur bazlı atama yoksa kayıt seviyesinden miras alır', () => {
    const bookingWithVehicle = {
      ...baseBooking,
      tours: [{ tourId: 'phi-phi', tourTitle: 'Phi Phi', tourDate: '2026-02-14', priceThb: 4800 }],
      assignedVehicle: 'Minibüs 3',
    };
    const pickups = buildDailyPickups([bookingWithVehicle], '2026-02-14');
    expect(pickups[0].assignedVehicle).toBe('Minibüs 3');
  });

  it('atanmamış araç için "Atanmadı" varsayılanı', () => {
    const pickups = buildDailyPickups([baseBooking], '2026-02-14');
    expect(pickups[0].assignedVehicle).toBe('Atanmadı');
  });

  it('hotelZone boşsa otel adından türetilir (detectHotelZone)', () => {
    const pickups = buildDailyPickups([baseBooking], '2026-02-14');
    // Patong Resort → Patong bölgesi türetmeli (detectHotelZone testi ayrıca
    // tests/maps.test.ts'te kapsanır; burada null gelmediğini doğrularız).
    expect(pickups[0].hotelZone).toBeTruthy();
  });

  it('tarih eşleşmesi olmayan gün boş liste döner', () => {
    expect(buildDailyPickups(bookings, '2030-01-01')).toEqual([]);
  });
});
