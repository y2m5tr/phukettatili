import { describe, it, expect } from 'vitest';
import { fmtMoney } from '../src/lib/moneyFormat';

/**
 * Para biçimlendirici kilit testi.
 *
 * HATA BUYDU: bileşenlerde çıplak `toLocaleString()` kullanılıyordu. CI ve
 * Vercel `LANG=en_US.UTF-8` ile koştuğu için orada `3,200` görünüyordu, ama
 * geliştiricinin `tr_TR` makinesinde `3.200` üretip testleri kırıyordu.
 * Aynı tutar iki farklı biçimde görününce panel/WhatsApp metinleri tutarsız
 * hale geliyordu.
 *
 * `fmtMoney` locale'i `en-US` olarak SABİTLER; bu testler ortam locale'inden
 * bağımsız olarak binlik ayracının virgül kaldığını garanti eder.
 */

describe('fmtMoney — locale bağımsız para biçimi', () => {
  it('binlik ayracı olarak virgül kullanır', () => {
    expect(fmtMoney(3200)).toBe('3,200');
    expect(fmtMoney(15000)).toBe('15,000');
    expect(fmtMoney(1234567)).toBe('1,234,567');
  });

  it('binin altındaki tutarlara ayraç koymaz', () => {
    expect(fmtMoney(0)).toBe('0');
    expect(fmtMoney(450)).toBe('450');
    expect(fmtMoney(999)).toBe('999');
  });

  it('noktalı ondalığı nokta ile korur (tr-TR virgül üretmez)', () => {
    expect(fmtMoney(3200.5)).toBe('3,200.5');
    expect(fmtMoney(10.25)).toBe('10.25');
  });

  it('negatif tutarında eksi işaretini korur', () => {
    expect(fmtMoney(-4500)).toBe('-4,500');
  });

  it('ortam locale değişse de aynı çıktıyı verir', () => {
    const original = process.env.LC_ALL;
    try {
      process.env.LC_ALL = 'tr_TR.UTF-8';
      expect(fmtMoney(3200)).toBe('3,200');
      process.env.LC_ALL = 'de_DE.UTF-8';
      expect(fmtMoney(3200)).toBe('3,200');
    } finally {
      if (original === undefined) delete process.env.LC_ALL;
      else process.env.LC_ALL = original;
    }
  });
});
