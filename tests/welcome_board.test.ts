import { describe, it, expect } from 'vitest';
import {
  formatNameboardGuestName,
  generateWelcomeBoardUrl,
  generateDriverNameboardWhatsApp,
  getDriverNameboardWhatsAppUrl,
  WELCOME_BOARD_THEMES,
  GREETINGS,
} from '../src/lib/welcomeBoard';

describe('VIP Karşılama Tabela Stüdyosu (Welcome Board)', () => {
  it('formats guest name uppercase correctly', () => {
    expect(formatNameboardGuestName('ahmet kaya')).toBe('AHMET KAYA');
    expect(formatNameboardGuestName('')).toBe('DEĞERLİ MİSAFİRİMİZ');
  });

  it('generates welcome board url with theme parameter', () => {
    const url = generateWelcomeBoardUrl('BK-1001', 'bright_airport');
    expect(url).toBe('/tabela/BK-1001?theme=bright_airport');
  });

  it('generates driver WhatsApp notification with link and details', () => {
    const msg = generateDriverNameboardWhatsApp('Somchai', 'Murat Yılmaz', 'TK 172', '/tabela/BK-1001');
    expect(msg).toContain('MURAT YILMAZ');
    expect(msg).toContain('TK 172');
    expect(msg).toContain('/tabela/BK-1001');
    expect(msg).toContain('Somchai');
  });

  it('generates valid WhatsApp URL for driver phone', () => {
    const waUrl = getDriverNameboardWhatsAppUrl(
      '+66 81 234 5678',
      'Somchai',
      'Zeynep Demir',
      'QR 840',
      '/tabela/BK-1002'
    );
    expect(waUrl).toContain('https://wa.me/66812345678?text=');
    expect(waUrl).toContain(encodeURIComponent('ZEYNEP DEMİR'));
  });

  it('contains all 4 theme definitions with valid CSS classes', () => {
    expect(WELCOME_BOARD_THEMES.luxury_dark).toBeDefined();
    expect(WELCOME_BOARD_THEMES.bright_airport).toBeDefined();
    expect(WELCOME_BOARD_THEMES.gold_vip).toBeDefined();
    expect(WELCOME_BOARD_THEMES.tropical_cyan).toBeDefined();
    expect(GREETINGS.tr.title).toBe("Phuket'e Hoş Geldiniz");
  });
});
