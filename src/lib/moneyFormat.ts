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
  // SAVUNMA: çağıran taraf sözleşmeyi kaçırırsa (ör. stats alanında undefined)
  // `undefined.toLocaleString()` TypeError fırlatıp tüm sekmeyi ErrorBoundary'ye
  // düşürüyordu ("Genel Bakış Sekmesinde Bir Sorun Oluştu"). Sayı olmayan girdi
  // sessizce 0 render edilir — panel çökmez, veri kaybı da olmaz.
  const n = Number(amount);
  if (!Number.isFinite(n)) return '0';
  return n.toLocaleString('en-US');
}
