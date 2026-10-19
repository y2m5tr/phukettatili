/**
 * WhatsApp mesaj metinleri için deterministik para/tutar formatlayıcı.
 *
 * Locale bilinçli olarak `en-US` olarak SABİTLENMİŞTİR: mesajları alan
 * şoför/rehber/misafir hangi sunucuda çalışırsak çalışalım aynı binlik
 * ayracı görmeli (`3,500`), ortam locale'i ne olursa olsun. Locale'siz
 * `toLocaleString()` kullanımı tr-TR ortamda `3.500` üretip testleri ve
 * mesaj tutarlılığını kırmıştı — bu helper o sınıf hatayı kökten önler.
 *
 * NOT: Site arayüzündeki TL gösterimi (`siteCurrency.ts`, `tourWizard.ts`)
 * kasıtlı olarak `tr-TR` kullanır ve bu helper'ın kapsamı DIŞINDADIR.
 */
export function fmtMoney(amount: number): string {
  return amount.toLocaleString('en-US');
}
