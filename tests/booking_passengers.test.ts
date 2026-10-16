import { describe, it, expect } from 'vitest';
import type { Booking, PassengerItem } from '../src/data/adminInitialData';

describe('👥 Çoklu Müşteri / Aile Yolcu Ekleme & Çocuk / Pasaport Motoru', () => {
  it('rezervasyona birden fazla yolcu eklenebilmeli ve çocuk/yetişkin ayrımı yapılabilmeli', () => {
    const passengers: PassengerItem[] = [
      {
        id: 'pax-1',
        fullName: 'Ahmet Yılmaz',
        passportNo: 'U12345678',
        isChild: false,
      },
      {
        id: 'pax-2',
        fullName: 'Zeynep Yılmaz',
        passportNo: 'U87654321',
        isChild: false,
      },
      {
        id: 'pax-3',
        fullName: 'Efe Yılmaz',
        // Pasaport no zorunlu değil (opsiyonel)
        passportNo: '',
        isChild: true,
      },
    ];

    const booking: Booking = {
      id: 'BK-FAMILY-101',
      customerName: 'Ahmet Yılmaz',
      phone: '+905321112233',
      hotel: 'Amari Phuket',
      tourTitle: 'Phi Phi & Maya Bay Sürat Teknesi',
      tourDate: '2026-11-20',
      adultCount: 2,
      childCount: 1,
      totalPriceThb: 7600,
      paidAmountThb: 2000,
      remainingAmountThb: 5600,
      status: 'confirmed',
      paymentStatus: 'partial',
      passengers,
      createdAt: '2026-10-16',
    };

    expect(booking.passengers).toBeDefined();
    expect(booking.passengers?.length).toBe(3);

    // Çocuk ve yetişkin filtreleme
    const children = booking.passengers?.filter((p) => p.isChild);
    const adults = booking.passengers?.filter((p) => !p.isChild);

    expect(children?.length).toBe(1);
    expect(children?.[0].fullName).toBe('Efe Yılmaz');
    expect(children?.[0].passportNo).toBe('');

    expect(adults?.length).toBe(2);
    expect(adults?.[0].passportNo).toBe('U12345678');
    expect(adults?.[1].passportNo).toBe('U87654321');
  });

  it('çocuk ve yetişkin yolcu sayıları pax toplamına doğru yansıtılabilmeli', () => {
    const familyMembers: PassengerItem[] = [
      { fullName: 'Murat Can', isChild: false },
      { fullName: 'Selin Can', isChild: false },
      { fullName: 'Mert Can', isChild: true },
      { fullName: 'Defne Can', isChild: true },
    ];

    const childCount = familyMembers.filter((p) => p.isChild).length;
    const adultCount = familyMembers.filter((p) => !p.isChild).length;

    expect(adultCount).toBe(2);
    expect(childCount).toBe(2);
    expect(adultCount + childCount).toBe(4);
  });

  it('pasaport numarası boş bırakıldığında (opsiyonel) hata vermemeli', () => {
    const paxWithoutPassport: PassengerItem = {
      fullName: 'Canberk Özkan',
      isChild: false,
    };

    expect(paxWithoutPassport.fullName).toBe('Canberk Özkan');
    expect(paxWithoutPassport.passportNo).toBeUndefined();
  });
});
