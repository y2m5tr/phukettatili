import { generateHolidayPackage, type PackageDuration, type TravelStyle } from './holidayPlanner';

export interface CuratedProposalDay {
  dayNumber: number;
  dayTitle: string;
  tourTitle: string;
  pickupWindow: string; // Örn: "07:30 - 07:45"
  tourDuration: string; // Örn: "08:30 - 16:30"
  category: 'island' | 'bay' | 'show' | 'nature' | 'transfer' | 'leisure';
  highlight: string;
  included: string[];
  image: string;
  priceThb: number;
}

export interface CuratedProposalData {
  proposalNumber: string;
  createdAtDate: string;
  validUntilDate: string;
  customerName: string;
  hotelName: string;
  hotelZone: string;
  adultCount: number;
  childCount: number;
  packageTitle: string;
  packageSubtitle: string;
  travelStyle: TravelStyle;
  days: CuratedProposalDay[];
  discountPercent: number;
  depositPercent: number;
  customNotes: string;
}

export interface CuratedProposalFinancials {
  subtotalThb: number;
  discountThb: number;
  totalThb: number;
  depositThb: number;
  remainingThb: number;
  totalTry: number;
  totalUsd: number;
  totalEur: number;
}

const CATEGORY_ICONS: Record<string, string> = {
  island: '🏝️',
  bay: '🛶',
  show: '🎭',
  nature: '🐘',
  transfer: '🚐',
  leisure: '🍹',
};

export function getCategoryIcon(cat: string): string {
  return CATEGORY_ICONS[cat] || '🌴';
}

/**
 * Kişiye özel teklif için otomatik başlangıç taslağı üretir.
 */
export function buildCuratedProposal(
  customerName: string = 'Sayın Misafirimiz',
  style: TravelStyle = 'honeymoon',
  duration: PackageDuration = 5,
  hotelName: string = 'Amari Phuket',
  hotelZone: string = 'Patong & Kalim',
  adultCount: number = 2,
  childCount: number = 0
): CuratedProposalData {
  const packagePlan = generateHolidayPackage(duration, style, hotelZone);

  const today = new Date();
  const validUntil = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const formatIsoDate = (d: Date) => d.toISOString().split('T')[0];

  const days: CuratedProposalDay[] = packagePlan.itinerary.map((item, idx) => {
    let pickupWindow = '07:30 - 07:45';
    let tourDuration = '08:30 - 16:30';
    let included = ['Klimalı VIP Transfer', 'Öğle Yemeği & İçecekler', 'Şnorkel & Can Yeleği', 'Kapsamlı Turizm Sigortası'];
    let image = '/assets/phi_phi_island.webp';

    if (item.category === 'show') {
      pickupWindow = '18:15 - 18:30';
      tourDuration = '19:30 - 21:00';
      included = ['VIP Ön Sıra Koltuk', 'Gidiş-Dönüş Otel Transferi', 'Şov Bileti'];
      image = '/assets/simon_cabaret.webp';
    } else if (item.category === 'bay') {
      pickupWindow = '08:00 - 08:30';
      tourDuration = '09:00 - 17:00';
      included = ['Klimalı Minivan', 'Kano Ekipmanı & Profesyonel Kürekçi', 'Öğle Yemeği', 'Milli Park Girişleri'];
      image = '/assets/james_bond.webp';
    } else if (item.category === 'nature') {
      pickupWindow = '08:45 - 09:00';
      tourDuration = '09:30 - 13:00';
      included = ['Etik Fil Bakımı & Besleme', 'Çamur Banyosu', 'Geleneksel Tay Yemeği', 'Otel Transferi'];
      image = '/assets/elephant_sanctuary.webp';
    } else if (item.category === 'transfer') {
      pickupWindow = 'Uçuş Saatinde';
      tourDuration = 'Havalimanı - Otel VIP';
      included = ['VIP Lüks Minibüs', 'İsimli Karşılama Panosu', 'Soğuk Su & Havlu İkramı'];
      image = '/assets/vip_transfer.webp';
    }

    return {
      dayNumber: item.dayNumber || idx + 1,
      dayTitle: item.dayTitle,
      tourTitle: item.tourTitle,
      pickupWindow,
      tourDuration,
      category: item.category,
      highlight: item.highlight,
      included,
      image,
      priceThb: item.individualPriceThb * adultCount + Math.round(item.individualPriceThb * 0.7 * childCount),
    };
  });

  const proposalNumber = `PT-PROP-${today.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  return {
    proposalNumber,
    createdAtDate: formatIsoDate(today),
    validUntilDate: formatIsoDate(validUntil),
    customerName,
    hotelName,
    hotelZone,
    adultCount,
    childCount,
    packageTitle: packagePlan.packageName,
    packageSubtitle: packagePlan.packageDescription,
    travelStyle: style,
    days,
    discountPercent: packagePlan.discountPercentage || 12,
    depositPercent: 30,
    customNotes:
      'Teklifimiz rezervasyon talebinden itibaren 7 gün boyunca fiyat garantilidir. Hava muhalefetinde liman başkanlığı kararıyla %100 tarih değişimi veya tam ücret iadesi uygulanır.',
  };
}

/**
 * Teklifin finansal özetini hesaplar.
 */
export function calculateProposalFinancials(
  proposal: CuratedProposalData,
  rates: { tryRate?: number; usdRate?: number; eurRate?: number } = {}
): CuratedProposalFinancials {
  const tryRate = rates.tryRate || 0.95; // 1 THB = ~0.95 TRY
  const usdRate = rates.usdRate || 36; // 1 USD = ~36 THB
  const eurRate = rates.eurRate || 39; // 1 EUR = ~39 THB

  const subtotalThb = proposal.days.reduce((acc, d) => acc + (d.priceThb || 0), 0);
  const discountThb = Math.round((subtotalThb * (proposal.discountPercent || 0)) / 100);
  const totalThb = Math.max(0, subtotalThb - discountThb);

  const depositThb = Math.round((totalThb * (proposal.depositPercent || 30)) / 100);
  const remainingThb = totalThb - depositThb;

  const totalTry = Math.round(totalThb * tryRate);
  const totalUsd = Math.round(totalThb / usdRate);
  const totalEur = Math.round(totalThb / eurRate);

  return {
    subtotalThb,
    discountThb,
    totalThb,
    depositThb,
    remainingThb,
    totalTry,
    totalUsd,
    totalEur,
  };
}

/**
 * WhatsApp'tan misafire tek tıkla atılabilecek zengin Türkçe teklif metni üretir.
 */
export function generateCuratedProposalWhatsAppMessage(
  proposal: CuratedProposalData,
  financials: CuratedProposalFinancials
): string {
  const paxStr = `${proposal.adultCount} Yetişkin${
    proposal.childCount > 0 ? ` + ${proposal.childCount} Çocuk` : ''
  }`;

  const daysSummary = proposal.days
    .map(
      (d) =>
        `📍 *Gün ${d.dayNumber}: ${d.dayTitle}*\n   • Tur: ${d.tourTitle}\n   • Alınış: ${d.pickupWindow} | Saatler: ${d.tourDuration}\n   • Öne Çıkan: ${d.highlight}`
    )
    .join('\n\n');

  return `🌴 *PHUKET TATİLİ — KİŞİYE ÖZEL TATİL & TUR TEKLİFİ* 🌴
🏢 *Lisanslı Tur Operatörü · TAT License: 34/02819*
📋 *Teklif No:* ${proposal.proposalNumber}
📅 *Geçerlilik:* ${proposal.validUntilDate} tarihine kadar

Sayın *${proposal.customerName}*,

Sizin için özenle hazırladığımız *${proposal.packageTitle}* programı detayları aşağıdadır:

🏨 *Konaklama:* ${proposal.hotelName} (${proposal.hotelZone})
👥 *Kişi Sayısı:* ${paxStr}

───────────────────────────────
🗓️ *GÜN GÜN TATİL PROGRAMINIZ:*

${daysSummary}

───────────────────────────────
💰 *FİYATLANDIRMA & ÖDEME PLANI:*
• Liste Fiyatı Toplamı: ${financials.subtotalThb.toLocaleString()} THB
• Özel Paket İndirimi (%${proposal.discountPercent}): -${financials.discountThb.toLocaleString()} THB
💎 *NET PAKET FİYATI:* *${financials.totalThb.toLocaleString()} THB*
   (~${financials.totalTry.toLocaleString()} TL / ~${financials.totalUsd.toLocaleString()} USD)

💵 *Rezervasyon Kapora Tutarı (%${proposal.depositPercent}):* ${financials.depositThb.toLocaleString()} THB
💵 *Tur Günü Teslim Edilecek Kalan:* ${financials.remainingThb.toLocaleString()} THB (Nakit Baht)

🛡️ *Dahil Olan Güvenceler:*
✓ Klimalı VIP araçlarla otelden gidiş-dönüş transferler
✓ 7/24 Türkçe Saha Asistanı & WhatsApp Desteği
✓ Tüm turlarda öğle yemeği, soğuk içecekler ve şnorkel ekipmanı
✓ Kapsamlı deniz ve kaza sigortası
✓ Hava muhalefetinde %100 ücretsiz tarih değişimi veya tam iade garantisi

Teklifi onaylamak ve tarihleriniz için yerinizi ayırtmak için bu mesaja yanıt vermeniz yeterlidir.
İyi tatiller dileriz! 🇹🇭✨`;
}
