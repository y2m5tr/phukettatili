import { describe, it, expect } from 'vitest';
import { formatPriceText } from '../src/lib/livePriceConverter';

/**
 * React adalarının fiyat metni sözleşmesi.
 *
 * HATA BUYDU: TourShowcase fiyatı sunucuda `fmtMoney` (en-US → `3,200`) ile
 * basıyordu, ama `livePriceConverter` hydration bitmeden aynı DOM düğümünü
 * tr-TR biçimine (`3.200 THB · kişi başı`) çeviriyordu. React sunucu HTML'i
 * ile istemci çıktısını uyuşturamayıp tüm ağacı yeniden kuruyordu:
 * "Hydration failed because the server rendered text didn't match".
 *
 * ÇÖZÜM: React fiyatı kendi state'inden çizer (formatPriceText), DOM yazıcısı
 * `data-price-react` işaretli düğümlere hiç dokunmaz.
 *
 * Bu testler iki şeyi kilitler:
 * 1. THB metni, renderPrice'ın (tr-TR) ürettiğiyle AYNI olmalı — yoksa
 *    sayfada iki farklı binlik ayraç görünür.
 * 2. Etiket her zaman tutarlı biçimde eklenmeli.
 */

describe('formatPriceText — React ada fiyat metni', () => {
  it('THB tutarını tr-TR binlik ayraçla basar', () => {
    expect(formatPriceText(3200, 'THB')).toBe('3.200 THB');
    expect(formatPriceText(15000, 'THB')).toBe('15.000 THB');
  });

  it('etiket verilirse " · etiket" olarak eklenir', () => {
    expect(formatPriceText(3200, 'THB', 'kişi başı')).toBe('3.200 THB · kişi başı');
  });

  it('etiket boşsa ayraç basmaz (yetim " · " kalmaz)', () => {
    expect(formatPriceText(3200, 'THB', '')).toBe('3.200 THB');
  });

  it('geçersiz veya sıfır tutarda boş metin döner', () => {
    expect(formatPriceText(0, 'THB')).toBe('');
    expect(formatPriceText(Number.NaN, 'THB')).toBe('');
    expect(formatPriceText(-100, 'THB')).toBe('');
  });

  it('dönüştürülmüş birimlerde simge öne, birim sona gelir', () => {
    // Kur servisi çağrılmadan varsayılan kurlar kullanılır (TRY 0.68).
    const tryText = formatPriceText(3200, 'TRY');
    expect(tryText).toMatch(/^₺[\d.]+ TRY$/);
    const usdText = formatPriceText(3200, 'USD');
    expect(usdText).toMatch(/^\$[\d.]+ USD$/);
  });
});