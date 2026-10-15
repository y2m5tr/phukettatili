import { describe, it, expect } from 'vitest';
import { toGuestBookingView, ALLOWED_GUEST_VIEW_KEYS } from '../src/lib/server/guestView';
import type { Booking } from '../src/data/adminInitialData';

/** Hassas veriyle dolu örnek kayıt — sızıntı olsaydı hepsi görünür olurdu. */
const SENSITIVE_BOOKING: Booking = {
  id: 'BK-1001',
  customerName: 'Ahmet & Zeynep Yılmaz',
  phone: '+90 532 456 78 90',
  email: 'ahmet.yilmaz@gmail.com',
  hotel: 'Amari Phuket (Patong)',
  roomNumber: '304',
  tourId: 'phi-phi',
  tourTitle: 'Phi Phi, Maya Bay ve Bamboo Adası',
  tourDate: '2026-11-15',
  pickupTime: '07:30',
  tours: [{ tourTitle: 'Phi Phi', tourDate: '2026-11-15', priceThb: 3200, costThb: 1900, supplier: 'Andaman Wave Master' }],
  adultCount: 2,
  childCount: 0,
  totalPriceThb: 6400,
  costThb: 3800,
  supplier: 'Andaman Wave Master',
  paidAmountThb: 2400,
  remainingAmountThb: 4000,
  nationalParkFeeIncluded: false,
  status: 'confirmed',
  paymentStatus: 'partial',
  specialNotes: 'Balayı çifti. Vejetaryen öğle yemeği.',
  passengers: [
    {
      fullName: 'Ahmet Yılmaz',
      passportNo: 'U12345678',
      nationality: 'TR',
      birthDate: '1988-04-12',
      gender: 'M',
    },
    {
      fullName: 'Zeynep Yılmaz',
      passportNo: 'U87654321',
      nationality: 'TR',
      birthDate: '1990-09-30',
      gender: 'F',
    },
  ],
  ticketCode: 'PT-7K2M9XQ',
  createdAt: '2026-10-10',
};

describe('toGuestBookingView — sızıntı koruması', () => {
  const view = toGuestBookingView(SENSITIVE_BOOKING)!;

  it('null kayıt için null döndürür', () => {
    expect(toGuestBookingView(null)).toBeNull();
  });

  it('serileştirilmiş görünümdede İZİNSİZ hiçbir alan yoktur', () => {
    // Astro island prop'larını HTML'e JSON olarak gömer; görünümü
    // serileştirip izinli anahtarlarla karşılaştırmak, sayfa kaynağına
    // neyin indiğinin birebir simülasyonudur.
    const serialized = JSON.stringify(view);
    const forbidden = [
      'passportNo',
      'nationality',
      'birthDate',
      'gender',
      'phone',
      'email',
      'costThb',
      'supplier',
      'paidAmountThb',
      'totalPriceThb',
      'specialNotes',
      'paymentStatus',
      'passengers',
      'tours',
      'U12345678',
      'U87654321',
      '+90 532 456 78 90',
      'ahmet.yilmaz@gmail.com',
      'Balayı çifti',
      'Andaman Wave Master',
    ];
    for (const needle of forbidden) {
      expect(serialized.includes(needle), `SIZINTI: "${needle}" görünümde bulundu`).toBe(false);
    }
  });

  it('görünümün anahtarları izinli listeyle birebir eşleşir', () => {
    const keys = Object.keys(view).sort();
    const allowed = [...ALLOWED_GUEST_VIEW_KEYS].sort();
    expect(keys).toEqual(allowed);
  });

  it('yolcu isimleri geçer, pasaport verisi geçmez', () => {
    expect(view.passengerNames).toEqual(['Ahmet Yılmaz', 'Zeynep Yılmaz']);
    expect(JSON.stringify(view).includes('U12345678')).toBe(false);
  });

  it('opsiyonel alanlar tanımsız kalınca bile anahtar kümesi değişmez', () => {
    const minimal = { ...SENSITIVE_BOOKING, roomNumber: undefined, assignedVehicle: undefined, passengers: undefined };
    const v = toGuestBookingView(minimal)!;
    expect(Object.keys(v).sort()).toEqual([...ALLOWED_GUEST_VIEW_KEYS].sort());
    expect(v.passengerNames).toEqual([]);
    expect(v.roomNumber).toBeUndefined();
  });

  it('izinsiz alan adı listeye eklenirse test bilinçli olarak patlar (bekçi)', () => {
    // ALLOWED_GUEST_VIEW_KEYS'e yeni alan eklemek bilinçli bir karardır.
    // Bu test, kararın hangi alanlarda verildiğini belgeler; bir alan
    // çıkarılırsa burası güncellenmelidir.
    expect(ALLOWED_GUEST_VIEW_KEYS).toHaveLength(13);
  });
});
