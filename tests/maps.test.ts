import { describe, it, expect } from 'vitest';
import {
  formatHotelLocation,
  getSingleHotelMapUrl,
  generateMultiStopMapUrl,
  detectDeparturePier,
} from '../src/lib/maps';

describe('formatHotelLocation', () => {
  it('boş otelde Phuket genel konumunu döndürür', () => {
    expect(formatHotelLocation('')).toBe('Phuket, Thailand');
    expect(formatHotelLocation('   ')).toBe('Phuket, Thailand');
  });

  it('Phuket içermeyen otele Phuket ekler', () => {
    expect(formatHotelLocation('Amari Resort')).toBe('Amari Resort, Phuket, Thailand');
  });

  it('Phuket içeren otele tekrar eklemez', () => {
    expect(formatHotelLocation('Amari Phuket')).toBe('Amari Phuket, Thailand');
  });
});

describe('getSingleHotelMapUrl', () => {
  it('doğru URL şablonu üretir', () => {
    const url = getSingleHotelMapUrl('Amari Phuket');
    expect(url).toBe(
      'https://www.google.com/maps/search/?api=1&query=Amari%20Phuket%2C%20Thailand'
    );
  });
});

describe('generateMultiStopMapUrl', () => {
  it('otelsiz çağrıda liman için tekil arama linki döndürür', () => {
    const url = generateMultiStopMapUrl([]);
    expect(url).toContain('google.com/maps/search');
    expect(url).toContain(encodeURIComponent('Royal Phuket Marina'));
  });

  it('tek otelde origin-destination rotası üretir', () => {
    const url = generateMultiStopMapUrl(['Katathani']);
    expect(url).toContain('maps/dir');
    expect(url).toContain(`origin=${encodeURIComponent('Katathani, Phuket, Thailand')}`);
    expect(url).toContain(`destination=${encodeURIComponent('Royal Phuket Marina, Phuket, Thailand')}`);
    expect(url).not.toContain('waypoints');
  });

  it('çoklu otelde waypoint zinciri üretir', () => {
    const url = generateMultiStopMapUrl(['Hilton', 'Novotel', 'Banyan Tree']);
    expect(url).toContain('waypoints=');
    // İlk otel origin'dir, kalanı waypoint: 3 otel → 2 waypoint
    expect(url).toContain(encodeURIComponent('Novotel, Phuket, Thailand'));
    expect(url).toContain(encodeURIComponent('Banyan Tree, Phuket, Thailand'));
    expect(url).toContain('travelmode=driving');
  });

  it('boş string otelleri filtreler', () => {
    const url = generateMultiStopMapUrl(['Hilton', '', '   ', 'Novotel']);
    // '' ve '   ' düşer → Hilton + Novotel → 1 waypoint
    expect(url).toContain(`origin=${encodeURIComponent('Hilton, Phuket, Thailand')}`);
    expect(url).toContain(encodeURIComponent('Novotel, Phuket, Thailand'));
  });
});

describe('detectDeparturePier', () => {
  it('Similan turları Thap Lamu iskelesine gider', () => {
    expect(detectDeparturePier('Similan Adaları Speedboat')).toContain('Thap Lamu');
  });

  it('James Bond turu Ao Por Grand Marina kullanır', () => {
    expect(detectDeparturePier('James Bond Adası ve Kano')).toContain('Ao Por');
  });

  it('Racha/Coral/Banana turları Chalong iskelesi', () => {
    expect(detectDeparturePier('Coral Adası Turu')).toContain('Chalong');
    expect(detectDeparturePier('Racha Adaları')).toContain('Chalong');
    expect(detectDeparturePier('Banana Beach')).toContain('Chalong');
  });

  it('Phi Phi ve tanınmayan turlar Royal Phuket Marina varsayılanı', () => {
    expect(detectDeparturePier('Phi Phi, Maya ve Bamboo Adası')).toContain('Royal Phuket Marina');
    expect(detectDeparturePier('')).toContain('Royal Phuket Marina');
  });
});
