import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  getMarineSafetyStatus,
  generateWeatherPostponeMessage,
  getWeatherPostponeWhatsAppUrl,
} from '../src/lib/marineWeather';
import type { Booking } from '../src/data/adminInitialData';

describe('Marine Safety & Weather Sentinel', () => {
  // Bu testler canlı Open-Meteo API'sine bağlanmaz. `fetch` mock'lanır ki
  // rüzgar/dalga verisi her koşuda deterministik olsun — aksi halde düşük
  // rüzgarlı bir günde windSpeedKnots 0'a yuvarlanıp test kendiliğinden kırılır.
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  /** Open-Meteo yanıtını taklit eden fetch stub'ı. */
  function stubMarineFetch(windSpeedKn: number, windDirDeg = 240) {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        current: { wind_speed_10m: windSpeedKn, wind_direction_10m: windDirDeg },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);
  }
  const sampleBooking: Booking = {
    id: 'PT-SEA-01',
    customerName: 'Burak Özdemir',
    phone: '+90 532 999 88 77',
    hotel: 'The Slate Phuket',
    tourTitle: 'Phi Phi & Maya Bay Sürat Teknesi',
    tourDate: '2026-10-18',
    adultCount: 2,
    childCount: 0,
    totalPriceThb: 6400,
    paidAmountThb: 6400,
    remainingAmountThb: 0,
    status: 'confirmed',
    paymentStatus: 'paid',
    createdAt: '2026-10-16T10:00:00Z',
  };

  it('should fetch marine safety report with valid level and wave metrics', async () => {
    // 12 knot → waveHeight = 12 * 0.08 + 0.4 = 1.4 → 'moderate' eşiği (>= 1.2)
    stubMarineFetch(12);

    const report = await getMarineSafetyStatus(true);
    expect(report).toBeDefined();
    expect(report.source).toBe('live');
    expect(['calm', 'moderate', 'severe']).toContain(report.level);
    expect(report.windSpeedKnots).toBe(12);
    expect(report.waveHeightMeters).toBe(1.4);
    expect(report.level).toBe('moderate');
    expect(report.regionStatus.phi_phi).toBeDefined();
    expect(report.regionStatus.phang_nga).toBeDefined();
    expect(report.regionStatus.similan).toBeDefined();
  });

  it('should classify high wind as severe and restrict open-sea tours', async () => {
    // 26 knot → waveHeight = 2.5 → 'severe' (windKnots >= 24)
    stubMarineFetch(26);

    const report = await getMarineSafetyStatus(true);
    expect(report.level).toBe('severe');
    expect(report.waveHeightMeters).toBe(2.5);
    expect(report.regionStatus.phi_phi.status).toBe('closed');
    expect(report.regionStatus.similan.status).toBe('closed');
  });

  it('should stay calm and keep a positive wave height on a dead-calm day', async () => {
    // Kenar durum: API 0.4 knot döndürürse Math.round(0.4) = 0 olur.
    // `|| 10` fallback'i yalnızca 0/undefined için devreye girer, 0.4 truthy'dir.
    // Rüzgar 0'a yuvarlansa da dalga tabanı (0.4 m) sayesinde seviye 'calm' kalır.
    stubMarineFetch(0.4);

    const report = await getMarineSafetyStatus(true);
    expect(report.source).toBe('live');
    expect(report.windSpeedKnots).toBe(0);
    expect(report.waveHeightMeters).toBe(0.4);
    expect(report.waveHeightMeters).toBeGreaterThan(0);
    expect(report.level).toBe('calm');
    expect(report.regionStatus.phi_phi.status).toBe('safe');
  });

  it('should fall back to a safe default report when the weather API is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error (No internet)')));

    const report = await getMarineSafetyStatus(true);
    expect(report.source).toBe('fallback');
    expect(report.level).toBe('calm');
    expect(report.windSpeedKnots).toBeGreaterThan(0);
    expect(report.waveHeightMeters).toBeGreaterThan(0);
    expect(report.regionStatus.similan.status).toBe('safe');
  });

  it('should serve the cached report without a second network call', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ current: { wind_speed_10m: 8, wind_direction_10m: 180 } }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const first = await getMarineSafetyStatus(true);
    const second = await getMarineSafetyStatus(); // forceRefresh yok → cache
    expect(second).toBe(first);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('should generate personalized weather postpone message', () => {
    const msg = generateWeatherPostponeMessage(sampleBooking, 'James Bond Adası Kano Turu');
    expect(msg).toContain('Sayın *Burak Özdemir*');
    expect(msg).toContain('Phi Phi & Maya Bay Sürat Teknesi');
    expect(msg).toContain('James Bond Adası Kano Turu');
    expect(msg).toContain('https://phukettatili.com/bilet/PT-SEA-01');
    expect(msg).toContain('Liman Başkanlığı');
  });

  it('should create valid WhatsApp direct url with encoded message', () => {
    const url = getWeatherPostponeWhatsAppUrl(sampleBooking);
    expect(url).toContain('https://wa.me/905329998877?text=');
    expect(url).toContain(encodeURIComponent('Sayın *Burak Özdemir*'));
  });
});
