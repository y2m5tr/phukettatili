import { describe, it, expect } from 'vitest';
import {
  buildGuestItinerary,
  getTourPackingChecklist,
  generateItineraryWhatsAppSummary,
  getItineraryWhatsAppUrl,
} from '../src/lib/guestItinerary';
import type { Booking } from '../src/data/adminInitialData';

describe('Smart Digital Itinerary & Day-by-Day Vacations', () => {
  const multiTourBooking: Booking[] = [
    {
      id: 'BK-501',
      customerName: 'Cemil Demir',
      phone: '+905321112233',
      hotel: 'The Shore at Katathani',
      roomNumber: 'Villa 12',
      tourId: 'combo',
      tourTitle: 'Phuket VIP Tatil Paketi',
      tourDate: '2026-10-20',
      adultCount: 2,
      childCount: 0,
      totalPriceThb: 15000,
      paidAmountThb: 15000,
      remainingAmountThb: 0,
      status: 'confirmed',
      paymentStatus: 'paid',
      tours: [
        {
          tourTitle: 'Phi Phi Islands Early Bird Speedboat',
          tourDate: '2026-10-20',
          pickupTime: '06:45',
        },
        {
          tourTitle: 'Etik Fil Koruma ve Bakım Alanı Deneyimi',
          tourDate: '2026-10-21',
          pickupTime: '08:15',
        },
        {
          tourTitle: 'James Bond Adası & Phang Nga Kano',
          tourDate: '2026-10-23',
          pickupTime: '07:30',
        },
      ],
    },
  ];

  it('should compile chronological itinerary from multi-tour booking', () => {
    const itinerary = buildGuestItinerary(multiTourBooking[0]);
    expect(itinerary.totalDays).toBe(3);
    expect(itinerary.days[0].date).toBe('2026-10-20');
    expect(itinerary.days[0].tourTitle).toContain('Phi Phi');
    expect(itinerary.days[1].date).toBe('2026-10-21');
    expect(itinerary.days[1].tourTitle).toContain('Fil');
    expect(itinerary.days[2].date).toBe('2026-10-23');
  });

  it('should generate customized packing checklist based on tour activity', () => {
    const islandList = getTourPackingChecklist('Phi Phi Speedboat Tour');
    expect(islandList.some((i) => i.includes('Plaj Havlusu'))).toBe(true);
    expect(islandList.some((i) => i.includes('Milli Park'))).toBe(true);

    const elephantList = getTourPackingChecklist('Etik Fil Koruma Parkı');
    expect(elephantList.some((i) => i.includes('Çamur'))).toBe(true);

    const ziplineList = getTourPackingChecklist('Hanuman World Zipline');
    expect(ziplineList.some((i) => i.includes('Bağcıklı Spor Ayakkabı'))).toBe(true);
  });

  it('should format informative WhatsApp trip overview message with links', () => {
    const itinerary = buildGuestItinerary(multiTourBooking[0]);
    const msg = generateItineraryWhatsAppSummary(itinerary);

    expect(msg).toContain('Cemil Demir');
    expect(msg).toContain('The Shore at Katathani');
    expect(msg).toContain('3 Günlük Gezi Rotası');
    expect(msg).toContain('Phi Phi');
    expect(msg).toContain('/gezi/BK-501');

    const url = getItineraryWhatsAppUrl('+905321112233', msg);
    expect(url).toContain('https://wa.me/905321112233?text=');
  });
});
