import { describe, it, expect } from 'vitest';
import {
  generateMediaVaultUrl,
  generateMediaVaultWhatsApp,
  getMediaVaultWhatsAppUrl,
  generateDefaultTourPhotos,
  DEFAULT_INSTAGRAM_HANDLE,
  DEFAULT_GOOGLE_REVIEW_URL,
} from '../src/lib/tourMediaVault';

describe('Misafir Tur Fotoğraf & Video Teslim Kasası (Media Vault)', () => {
  it('generates correct media vault URL path', () => {
    expect(generateMediaVaultUrl('BK-2001')).toBe('/foto/BK-2001');
    expect(generateMediaVaultUrl('TK-ABC')).toBe('/foto/TK-ABC');
  });

  it('generates WhatsApp message with guest name and link', () => {
    const msg = generateMediaVaultWhatsApp(
      'Selim Kaya',
      'Phi Phi Adaları Sürat Teknesi Turu',
      '/foto/BK-2001',
      'https://drive.google.com/album123'
    );
    expect(msg).toContain('Selim Kaya');
    expect(msg).toContain('Phi Phi Adaları');
    expect(msg).toContain('/foto/BK-2001');
    expect(msg).toContain('https://drive.google.com/album123');
    expect(msg).toContain(DEFAULT_INSTAGRAM_HANDLE);
  });

  it('generates valid WhatsApp click url', () => {
    const waUrl = getMediaVaultWhatsAppUrl(
      '+90 532 123 4567',
      'Ayşe Yılmaz',
      'James Bond Adası Turu',
      '/foto/BK-2002'
    );
    expect(waUrl).toContain('https://wa.me/905321234567?text=');
    expect(waUrl).toContain(encodeURIComponent('Ayşe Yılmaz'));
  });

  it('provides default tour photos array with high res download urls', () => {
    const photos = generateDefaultTourPhotos('Phi Phi Turu');
    expect(photos.length).toBeGreaterThanOrEqual(3);
    expect(photos[0].highResDownloadUrl).toBeDefined();
    expect(photos[0].category).toBeDefined();
  });
});
