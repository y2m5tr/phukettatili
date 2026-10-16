import { describe, it, expect } from 'vitest';
import {
  analyzeBookingDietaryAndMedical,
  extractManifestAlerts,
  generateBoatKitchenManifest,
  getBoatManifestWhatsAppUrl,
  type GuestDietaryAlert,
} from '../src/lib/dietaryManifest';
import type { Booking } from '../src/data/adminInitialData';

describe('Allergy & Diet Sentinel Protocol', () => {
  const sampleBookings: Booking[] = [
    {
      id: 'BK-101',
      customerName: 'Selin Demir',
      phone: '+905321112233',
      hotel: 'Amari Phuket Patong',
      roomNumber: '402',
      tourId: 'phi-phi',
      tourTitle: 'Phi Phi Islands Early Bird Speedboat',
      tourDate: '2026-10-17',
      adultCount: 2,
      childCount: 0,
      totalPriceThb: 5600,
      paidAmountThb: 5600,
      remainingAmountThb: 0,
      status: 'confirmed',
      paymentStatus: 'paid',
      specialNotes: 'Misafirimiz 6 aylık hamile, tekne pruvasına oturamaz.',
    },
    {
      id: 'BK-102',
      customerName: 'Ahmet Kaya',
      phone: '+905334445566',
      hotel: 'Marina Phuket Resort',
      roomNumber: '110',
      tourId: 'phi-phi',
      tourTitle: 'Phi Phi Islands Early Bird Speedboat',
      tourDate: '2026-10-17',
      adultCount: 4,
      childCount: 0,
      totalPriceThb: 11200,
      paidAmountThb: 11200,
      remainingAmountThb: 0,
      status: 'confirmed',
      paymentStatus: 'paid',
      specialNotes: '4 kişi için de kesinlikle helal yemek rica ediyoruz.',
    },
    {
      id: 'BK-103',
      customerName: 'Canan Ozturk',
      phone: '+905423332211',
      hotel: 'Katathani Resort',
      roomNumber: 'Villa 5',
      tourId: 'phi-phi',
      tourTitle: 'Phi Phi Islands Early Bird Speedboat',
      tourDate: '2026-10-17',
      adultCount: 1,
      childCount: 0,
      totalPriceThb: 2800,
      paidAmountThb: 2800,
      remainingAmountThb: 0,
      status: 'confirmed',
      paymentStatus: 'paid',
      passengers: [
        {
          fullName: 'Canan Ozturk',
          dietaryPreference: 'seafood_allergy',
        },
      ],
      specialNotes: 'Ciddi karides ve deniz ürünü alerjisi var, balık sosu dahi olmasın!',
    },
    {
      id: 'BK-104',
      customerName: 'Standard Guest',
      phone: '+905000000000',
      hotel: 'Patong Hotel',
      tourId: 'city-tour',
      tourTitle: 'Phuket City Tour',
      tourDate: '2026-10-17',
      adultCount: 2,
      childCount: 0,
      totalPriceThb: 2400,
      paidAmountThb: 2400,
      remainingAmountThb: 0,
      status: 'confirmed',
      paymentStatus: 'paid',
      specialNotes: '',
    },
  ];

  it('should detect pregnant guest and generate stern seating safety restriction', () => {
    const alert = analyzeBookingDietaryAndMedical(sampleBookings[0]);
    expect(alert).not.toBeNull();
    expect(alert?.categories).toContain('pregnant');
    expect(alert?.safetyInstructions.some((s) => s.includes('burun (pruva) koltuğuna oturtulamaz'))).toBe(true);
  });

  it('should detect halal dietary preference from notes', () => {
    const alert = analyzeBookingDietaryAndMedical(sampleBookings[1]);
    expect(alert).not.toBeNull();
    expect(alert?.categories).toContain('halal');
  });

  it('should detect seafood allergy from both passengers and notes', () => {
    const alert = analyzeBookingDietaryAndMedical(sampleBookings[2]);
    expect(alert).not.toBeNull();
    expect(alert?.categories).toContain('seafood_allergy');
  });

  it('should ignore regular booking without diet or medical notes', () => {
    const alert = analyzeBookingDietaryAndMedical(sampleBookings[3]);
    expect(alert).toBeNull();
  });

  it('should extract all flagged alerts for a given date', () => {
    const alerts = extractManifestAlerts(sampleBookings, '2026-10-17');
    expect(alerts.length).toBe(3);
  });

  it('should generate bilingual Thai and English boat captain briefing manifest', () => {
    const alerts = extractManifestAlerts(sampleBookings, '2026-10-17');
    const manifest = generateBoatKitchenManifest(alerts, 'Phi Phi Islands Early Bird Speedboat', '2026-10-17');

    expect(manifest).toContain('DAILY BOAT & CATERING SPECIAL MANIFEST');
    expect(manifest).toContain('PREGNANT GUEST: Selin Demir');
    expect(manifest).toContain('MUST SIT AT REAR / STERN');
    expect(manifest).toContain('SEVERE SEAFOOD / FISH SAUCE ALLERGY');
    expect(manifest).toContain('HALAL MEALS (อาหารฮาลาล)');

    const waUrl = getBoatManifestWhatsAppUrl('+66812345678', manifest);
    expect(waUrl).toContain('https://wa.me/66812345678?text=');
  });
});
