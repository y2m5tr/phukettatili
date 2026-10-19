import type { Booking } from '../data/adminInitialData';

export interface RecommendedTourItem {
  id: string;
  title: string;
  tagline: string;
  regularPriceThb: number;
  discountedPriceThb: number;
}

export interface CrossSellOptions {
  couponCode?: string;
  discountPercent?: number;
  managerPhone?: string;
}

export const DEFAULT_CROSS_SELL_COUPON = 'PHUKETVIP10';
export const DEFAULT_DISCOUNT_PERCENT = 10;

/**
 * Misafirin katıldığı tura göre en ideal 2. veya 3. deneyimleri önerir.
 */
export function recommendNextTours(
  booking: Booking,
  discountPercent = DEFAULT_DISCOUNT_PERCENT
): RecommendedTourItem[] {
  const currentTitle = (booking.tourTitle || '').toLowerCase();
  const mult = (100 - discountPercent) / 100;

  // Eğer ada turuna gittiyse (Phi Phi, Similan, Racha) -> Kara & Fil Deneyimi veya James Bond öner
  if (currentTitle.includes('phi phi') || currentTitle.includes('similan') || currentTitle.includes('racha')) {
    return [
      {
        id: 'elephant-sanctuary',
        title: 'Etik Fil Koruma, Besleme & Çamur Banyosu',
        tagline: 'Doğal ortamında fil bakımı ve nehirde banyo deneyimi',
        regularPriceThb: 2500,
        discountedPriceThb: Math.round(2500 * mult),
      },
      {
        id: 'james-bond-phang-nga',
        title: 'James Bond Adası & Phang Nga Körfezi Kano Safari',
        tagline: 'Zümrüt yeşili sakin koylar ve mağara kano keşfi',
        regularPriceThb: 2900,
        discountedPriceThb: Math.round(2900 * mult),
      },
      {
        id: 'vip-airport-transfer',
        title: 'Otel ➔ Havalimanı VIP Minibüs Dönüş Transferi',
        tagline: 'Gününüzü riske atmadan konforlu ve zamanında havalimanı ulaşımı',
        regularPriceThb: 1400,
        discountedPriceThb: Math.round(1400 * mult),
      },
    ];
  }

  // Eğer James Bond veya Phang Nga'ya gittiyse -> Açık deniz Phi Phi veya Eğlence Şovu öner
  if (currentTitle.includes('james bond') || currentTitle.includes('phang nga')) {
    return [
      {
        id: 'phi-phi-maya',
        title: 'Phi Phi & Maya Bay & Bamboo Adası Sürat Teknesi',
        tagline: 'Phuket\'in en ikonik turkuaz lagünü ve şnorkel cenneti',
        regularPriceThb: 3200,
        discountedPriceThb: Math.round(3200 * mult),
      },
      {
        id: 'carnival-magic',
        title: 'Carnival Magic Işık & Gece Tema Parkı',
        tagline: 'Guinness rekorlu ışık şöleni ve akşam yemeği',
        regularPriceThb: 2600,
        discountedPriceThb: Math.round(2600 * mult),
      },
      {
        id: 'vip-airport-transfer',
        title: 'Otel ➔ Havalimanı VIP Minibüs Dönüş Transferi',
        tagline: 'Stresten uzak, güvenli ve klimalı transfer',
        regularPriceThb: 1400,
        discountedPriceThb: Math.round(1400 * mult),
      },
    ];
  }

  // Genel turlar için popüler paket önerisi
  return [
    {
      id: 'phi-phi-maya',
      title: 'Phi Phi & Maya Bay & Bamboo Adası Sürat Teknesi',
      tagline: 'Andaman Denizi\'nin 1 numaralı ada turu',
      regularPriceThb: 3200,
      discountedPriceThb: Math.round(3200 * mult),
    },
    {
      id: 'elephant-sanctuary',
      title: 'Etik Fil Koruma, Besleme & Bakım',
      tagline: 'Fillerle sevgi dolu bir gün',
      regularPriceThb: 2500,
      discountedPriceThb: Math.round(2500 * mult),
    },
    {
      id: 'vip-airport-transfer',
      title: 'Havalimanı VIP Dönüş Transferi',
      tagline: 'Otelinizden havalimanına konforlu ulaşım',
      regularPriceThb: 1400,
      discountedPriceThb: Math.round(1400 * mult),
    },
  ];
}

/**
 * 2. Tur İndirimi & Çapraz Satış WhatsApp mesajı üretir.
 */
export function generateCrossSellWhatsAppMessage(
  booking: Booking,
  options?: CrossSellOptions
): string {
  const coupon = options?.couponCode || DEFAULT_CROSS_SELL_COUPON;
  const discount = options?.discountPercent || DEFAULT_DISCOUNT_PERCENT;
  const managerPhone = options?.managerPhone || '66828950665';
  const displayPhone = managerPhone.startsWith('+') ? managerPhone : `+${managerPhone}`;

  const recommended = recommendNextTours(booking, discount);

  const toursListStr = recommended
    .map(
      (t, idx) =>
        `${idx + 1}️⃣ *${t.title}*\n   • ${t.tagline}\n   • Fiyat: ~${t.regularPriceThb.toLocaleString('en-US')} THB~ ➔ *${t.discountedPriceThb.toLocaleString('en-US')} THB*`
    )
    .join('\n\n');

  return `🎁 *PHUKET TATİLİ — SİZE ÖZEL %${discount} İKİNCİ TUR İNDİRİMİ* 🎁

Sayın *${booking.customerName}*, merhaba!

Bugünkü *${booking.tourTitle}* turumuzun harika geçtiğini umuyoruz. Bizimle seyahat ettiğiniz için teşekkür ederiz! 🌴✨

Phuket'teki tatilinizin sonraki günlerinde değerlendirebilmeniz için adınıza özel *%${discount} Sadakat İndirimi* tanımladık:
🏷️ *Özel Kupon Kodunuz:* *${coupon}*

🔥 *Sizin İçin Seçtiğimiz En Popüler Deneyimler:*

${toursListStr}

📅 Rezervasyonunuzu erkenden ayırtmak veya havalimanı dönüş transferinizi planlamak için doğrudan bize yazabilirsiniz:
📞 *WhatsApp:* ${displayPhone}

Keyifli ve unutulmaz bir Phuket tatili dileriz! 🇹🇭🌊`;
}

/**
 * Misafirin WhatsApp'ına doğrudan 2. tur çapraz satış bağlantısı üretir.
 */
export function getCrossSellWhatsAppUrl(
  booking: Booking,
  options?: CrossSellOptions
): string {
  const cleanPhone = (booking.phone || '').replace(/[^0-9]/g, '');
  const message = generateCrossSellWhatsAppMessage(booking, options);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
