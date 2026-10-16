import { describe, it, expect } from 'vitest';
import {
  detectTourPier,
  buildPierManifest,
  generatePierManifestWhatsApp,
  PHUKET_PIERS,
} from '../src/lib/pierManifest';
import type { Booking } from '../src/data/adminInitialData';

describe('Pier & Marina Manifest Engine', () => {
  it('correctly maps tours to their respective Phuket departure piers', () => {
    // Similan -> Thap Lamu
    expect(detectTourPier('Similan Adaları Erken Çıkışlı Sürat Teknesi').id).toBe('thap-lamu');
    // James Bond -> Ao Po
    expect(detectTourPier('James Bond Adası ve Phang Nga Bay Kano').id).toBe('ao-po');
    // Coral / Banana Beach -> Chalong
    expect(detectTourPier('Coral Adası ve Banana Beach Katamaran').id).toBe('chalong');
    // Phi Phi -> Rassada
    expect(detectTourPier('Phi Phi, Maya Bay ve Bamboo Adası').id).toBe('rassada');
    // Moonlight Yat -> Royal Phuket Marina
    expect(detectTourPier('Moonlight Lüks Katamaran Yat Turu').id).toBe('royal-phuket-marina');
  });

  it('builds aggregated pier manifest report for specific date and pier', () => {
    const mockBookings: Booking[] = [
      {
        id: 'BK-101',
        ticketCode: 'PT-101',
        customerName: 'Ayşe Demir',
        phone: '+905331234567',
        hotel: 'Amari Phuket',
        roomNumber: '302',
        tourTitle: 'Phi Phi, Maya Bay ve Bamboo Adası',
        tourDate: '2026-11-15',
        pickupTime: '07:20',
        adultCount: 2,
        childCount: 1,
        totalPriceThb: 9600,
        paidAmountThb: 9600,
        remainingAmountThb: 0,
        status: 'confirmed',
        paymentStatus: 'paid',
        nationalParkFeeIncluded: true,
        passengers: [
          { fullName: 'Ayşe Demir', dietaryPreference: 'vegetarian' },
          { fullName: 'Mehmet Demir', dietaryPreference: 'standard' },
          { fullName: 'Can Demir', dietaryPreference: 'standard' },
        ],
      },
      {
        id: 'BK-102',
        ticketCode: 'PT-102',
        customerName: 'Cem Kaya',
        phone: '+905449876543',
        hotel: 'The Shore at Katathani',
        tourTitle: 'Phi Phi ve Maya Bay',
        tourDate: '2026-11-15',
        pickupTime: '07:05',
        adultCount: 2,
        childCount: 0,
        totalPriceThb: 6400,
        paidAmountThb: 2000,
        remainingAmountThb: 4400,
        status: 'confirmed',
        paymentStatus: 'partial',
        nationalParkFeeIncluded: false,
      },
      {
        id: 'BK-103',
        ticketCode: 'PT-103',
        customerName: 'James Bond Misafiri',
        phone: '+905550001122',
        hotel: 'Dusit Thani',
        tourTitle: 'James Bond Adası Turu', // Bu Ao Po iskelesine aittir, Rassada'ya girmemeli
        tourDate: '2026-11-15',
        adultCount: 2,
        childCount: 0,
        totalPriceThb: 5600,
        paidAmountThb: 5600,
        remainingAmountThb: 0,
        status: 'confirmed',
        paymentStatus: 'paid',
      },
    ];

    const report = buildPierManifest(mockBookings, '2026-11-15', 'rassada');

    expect(report.pier.id).toBe('rassada');
    expect(report.totalBookings).toBe(2); // Sadece 2 Phi Phi turu Rassada'da olmalı
    expect(report.totalPax).toBe(5); // 3 + 2 = 5 kişi
    expect(report.totalAdults).toBe(4);
    expect(report.totalChildren).toBe(1);
    expect(report.totalRemainingThb).toBe(4400);
    expect(report.dietaryCounts['vegetarian']).toBe(1);
  });

  it('generates captain WhatsApp manifest broadcast message', () => {
    const mockBookings: Booking[] = [
      {
        id: 'BK-201',
        ticketCode: 'PT-201',
        customerName: 'Selin Yıldız',
        phone: '+905332223344',
        hotel: 'Le Meridien Phuket',
        roomNumber: '512',
        tourTitle: 'Similan Adaları Turu',
        tourDate: '2026-11-16',
        pickupTime: '06:00',
        adultCount: 2,
        childCount: 0,
        totalPriceThb: 7000,
        paidAmountThb: 7000,
        remainingAmountThb: 0,
        status: 'confirmed',
        paymentStatus: 'paid',
        assignedVehicle: '1 Nolu Hat (Kuzey-Similan)',
        nationalParkFeeIncluded: true,
      },
    ];

    const report = buildPierManifest(mockBookings, '2026-11-16', 'thap-lamu');
    const msg = generatePierManifestWhatsApp(report);

    expect(msg).toContain('Thap Lamu Pier');
    expect(msg).toContain('2026-11-16');
    expect(msg).toContain('2 Kişi');
    expect(msg).toContain('Selin Yıldız');
    expect(msg).toContain('Le Meridien Phuket (Oda: 512)');
    expect(msg).toContain('1 Nolu Hat (Kuzey-Similan)');
  });
});
