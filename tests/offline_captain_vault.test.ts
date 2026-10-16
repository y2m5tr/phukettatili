import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  CAPTAIN_EMERGENCY_CONTACTS,
  CAPTAIN_VHF_CHANNELS,
  cacheDailyManifestForOffline,
  getCachedOfflineManifest,
} from '../src/lib/offlineCaptainVault';
import type { PickupItem } from '../src/lib/adminFilters';

describe('📱 PWA Çevrimdışı Modu: Kaptan Kasası & Acil Durum Rehberi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('Phuket acil durum rehberinde resmi numaralar ve acil hatlar eksiksiz bulunmalı', () => {
    expect(CAPTAIN_EMERGENCY_CONTACTS.length).toBeGreaterThanOrEqual(8);

    const touristPolice = CAPTAIN_EMERGENCY_CONTACTS.find((c) => c.id === 'tourist_police');
    expect(touristPolice).toBeDefined();
    expect(touristPolice?.number).toBe('1155');
    expect(touristPolice?.telUri).toBe('tel:1155');

    const marinePolice = CAPTAIN_EMERGENCY_CONTACTS.find((c) => c.id === 'marine_police');
    expect(marinePolice).toBeDefined();
    expect(marinePolice?.number).toContain('076-211-883');

    const chalongHarbor = CAPTAIN_EMERGENCY_CONTACTS.find((c) => c.id === 'chalong_pier');
    expect(chalongHarbor).toBeDefined();
    expect(chalongHarbor?.number).toContain('076-381-835');

    const office = CAPTAIN_EMERGENCY_CONTACTS.find((c) => c.id === 'office_support');
    expect(office).toBeDefined();
    expect(office?.telUri).toBe('tel:+66828950665');
  });

  it('VHF deniz telsiz kanallarında uluslararası acil (CH 16) ve liman kanalları tanımlı olmalı', () => {
    expect(CAPTAIN_VHF_CHANNELS.length).toBeGreaterThanOrEqual(3);

    const ch16 = CAPTAIN_VHF_CHANNELS.find((r) => r.channel.includes('16'));
    expect(ch16).toBeDefined();
    expect(ch16?.frequency).toBe('156.800 MHz');

    const ch74 = CAPTAIN_VHF_CHANNELS.find((r) => r.channel.includes('74'));
    expect(ch74).toBeDefined();
    expect(ch74?.usage).toContain('Chalong');
  });

  it('günlük manifestoyu çevrimdışı kullanım için güvenle paketlemeli', () => {
    const mockPickups: PickupItem[] = [
      {
        bookingId: 'BK-OFFLINE-1',
        tourIndex: 0,
        customerName: 'Canan Güneş',
        phone: '+905321112233',
        hotel: 'Katathani Phuket Beach Resort',
        roomNumber: '502',
        hotelZone: 'Kata Noi',
        tourTitle: 'Similan Adaları Sürat Teknesi',
        pickupTime: '06:00 - 06:15',
        adultCount: 2,
        childCount: 0,
        remainingAmountThb: 0,
        pickupStatus: 'pending',
        assignedVehicle: 'Minivan #01',
      },
    ];

    const snapshot = cacheDailyManifestForOffline('2026-11-20', mockPickups);
    expect(snapshot.date).toBe('2026-11-20');
    expect(snapshot.pickups.length).toBe(1);
    expect(snapshot.pickups[0].customerName).toBe('Canan Güneş');
    expect(snapshot.pickups[0].roomNumber).toBe('502');
    expect(typeof snapshot.cachedAt).toBe('number');
  });
});
