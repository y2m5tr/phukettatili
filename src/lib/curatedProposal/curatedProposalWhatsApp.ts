import { fmtMoney } from '../moneyFormat';
import type {
  CuratedProposalData,
  CuratedProposalDay,
  CuratedProposalFinancials,
} from './curatedProposalTypes';
import {
  MEAL_PLAN_META,
  TRANSPORT_META,
} from './curatedProposalTypes';
import { calculateProposalFinancials } from './curatedProposalBuilders';

export function generateCuratedProposalWhatsAppMessage(
  proposal: CuratedProposalData,
  financials: CuratedProposalFinancials
): string {
  const paxStr = `${proposal.adultCount} Yetişkin${
    proposal.childCount > 0 ? ` + ${proposal.childCount} Çocuk` : ''
  }`;

  const inclusionsSummary = proposal.inclusions.slice(0, 5).map((i) => `✓ ${i}`).join('\n');
  const giftsSummary =
    proposal.specialGifts && proposal.specialGifts.length > 0
      ? `\n🎁 *Kişiye Özel İkram & Sürprizler:*\n` + proposal.specialGifts.map((g) => `• ${g}`).join('\n') + `\n`
      : '';

  // TEKLİ TUR TEKLİFİ WHATSAPP METNİ
  if (proposal.proposalType === 'single_tour') {
    const singleDay = proposal.days[0] || ({} as CuratedProposalDay);
    const trans = TRANSPORT_META[singleDay.transportType]?.label || 'Tekne / VIP Araç';
    const meal = MEAL_PLAN_META[singleDay.mealPlan]?.label || 'Öğle Yemeği';
    const np =
      singleDay.nationalParkFeeStatus === 'included'
        ? '✅ Milli Park Dahil'
        : singleDay.nationalParkFeeStatus === 'not_included'
        ? '⚠️ Milli Park Harcı Hariç (Gişede Nakit)'
        : 'ℹ️ Harçsız';

    const timelineStr =
      proposal.singleTourTimeline && proposal.singleTourTimeline.length > 0
        ? `\n⏰ *ÖNGÖRÜLEN TUR AKIŞI & SAATLER:*\n` +
          proposal.singleTourTimeline
            .map((s) => `• *${s.time}* - ${s.title}${s.description ? ` (${s.description})` : ''}`)
            .join('\n') +
          `\n`
        : '';

    const tipsStr =
      proposal.singleTourTips && proposal.singleTourTips.length > 0
        ? `\n🎒 *Yanınızda Getirmeniz Önerilenler:*\n` + proposal.singleTourTips.map((t) => `• ${t}`).join('\n') + `\n`
        : '';

    return `🌴 *PHUKET TATİLİ — KİŞİYE ÖZEL TEK TUR TEKLİFİ* 🌴
🏢 *Lisanslı Tur Operatörü · TAT License: 34/02819*
📋 *Teklif No:* ${proposal.proposalNumber}
📅 *Tur Tarihi:* ${proposal.singleTourDate || singleDay.date || 'Belirtilecek'}
👨‍💼 *Operasyon Danışmanı:* ${proposal.agentInfo.name} (${proposal.agentInfo.phone})

Sayın *${proposal.customerName}*,

${proposal.welcomeMessage || 'Talep ettiğiniz tur için hazırladığımız özel teklif detayları aşağıdadır:'}

🎯 *Tur:* *${singleDay.tourTitle || proposal.packageTitle}*
🏨 *Alınış Oteli:* ${proposal.hotelName} (${proposal.hotelZone})
⏰ *Lobi Alınış Saati:* *${singleDay.pickupWindow}* (Süre: ${singleDay.tourDuration})
👥 *Kişi Sayısı:* ${paxStr}
🚤 *Ulaşım:* ${trans}
🍽️ *Yemek Planı:* ${meal}
🎫 *Milli Park Durumu:* ${np}
✨ *Öne Çıkan:* _${singleDay.highlight}_
${timelineStr}
───────────────────────────────
💰 *FİYATLANDIRMA & ÖDEME:*
• Tur Liste Fiyatı: ${fmtMoney(financials.subtotalThb)} THB
${proposal.discountPercent > 0 ? `• Özel İndirim (%${proposal.discountPercent}): -${fmtMoney(financials.discountThb)} THB\n` : ''}💎 *NET TUR TUTARI:* *${fmtMoney(financials.totalThb)} THB*
   (~${fmtMoney(financials.totalTry)} TL / ~${fmtMoney(financials.totalUsd)} USD / ~${fmtMoney(financials.totalEur)} EUR)
   (Kişi başı: ${fmtMoney(financials.perPersonThb)} THB)

💵 *Rezervasyon Kapora Bedeli (%${proposal.depositPercent}):* *${fmtMoney(financials.depositThb)} THB*
💵 *Tur Günü Kalan Bakiye:* *${fmtMoney(financials.remainingThb)} THB* (Nakit Baht)
${giftsSummary}
🛡️ *Dahil Olan Güvenceler:*
${inclusionsSummary}
✓ Andaman Denizi hava muhalefetinde %100 ücretsiz tarih değişimi veya tam iade garantisi
${tipsStr}
💳 *Ödeme Yöntemi:* ${proposal.paymentMethodsNote || 'Türkiye IBAN Havale, Kredi Kartı veya Wise ile kapora; kalan tur günü nakit Baht.'}

Turu onaylamak ve yerinizi ayırtmak için bu mesaja yanıt vermeniz yeterlidir.
Keyifli bir tur dileriz! 🇹🇭✨`;
  }

  // ÇOK GÜNLÜ TATİL PAKETİ WHATSAPP METNİ
  const daysSummary = proposal.days
    .map((d) => {
      const trans = TRANSPORT_META[d.transportType]?.label || 'Tekne / Transfer';
      const meal = MEAL_PLAN_META[d.mealPlan]?.label || 'Öğle Yemeği';
      const np =
        d.nationalParkFeeStatus === 'included'
          ? '✅ Milli Park Dahil'
          : d.nationalParkFeeStatus === 'not_included'
          ? '⚠️ Milli Park Hariç'
          : 'ℹ️ Harçsız';
      const hotelInfo = d.hotelName ? `\n   • Alınış Oteli: *${d.hotelName}* (${d.hotelZone || proposal.hotelZone})` : '';
      return (
        `📍 *Gün ${d.dayNumber}: ${d.dayTitle}*\n` +
        `   • Tur: *${d.tourTitle}*\n` +
        `   • Lobi Alınış: *${d.pickupWindow}* | Süre: ${d.tourDuration}${hotelInfo}\n` +
        `   • Ulaşım: ${trans} | Yemek: ${meal}\n` +
        `   • Durum: ${np}\n` +
        `   • Öne Çıkan: _${d.highlight}_\n` +
        `   • Tutar: *${fmtMoney(d.priceThb)} THB*`
      );
    })
    .join('\n\n');

  let accommodationText = `🏨 *Konaklama:* ${proposal.hotelName} (${proposal.hotelZone})`;
  if (proposal.hotels && proposal.hotels.length > 1) {
    accommodationText =
      `🏨 *Konaklama Otelleri (${proposal.hotels.length} Farklı Otel):*\n` +
      proposal.hotels
        .map(
          (h, i) =>
            `   ${i + 1}. *${h.hotelName}* (${h.hotelZone || 'Phuket'})${
              h.checkInDate && h.checkOutDate ? ` · 📅 ${h.checkInDate} ➔ ${h.checkOutDate}` : ''
            }${h.notes ? ` (${h.notes})` : ''}`
        )
        .join('\n');
  }

  return `🌴 *PHUKET TATİLİ — KİŞİYE ÖZEL TATİL & TUR TEKLİFİ* 🌴
🏢 *Lisanslı Tur Operatörü · TAT License: 34/02819*
📋 *Teklif No:* ${proposal.proposalNumber}
📅 *Geçerlilik:* ${proposal.validUntilDate} tarihine kadar
👨‍💼 *Operasyon Danışmanı:* ${proposal.agentInfo.name} (${proposal.agentInfo.phone})

Sayın *${proposal.customerName}*,

${proposal.welcomeMessage || 'Sizin için özenle hazırladığımız tatil programı detayları aşağıdadır:'}

${accommodationText}
👥 *Kişi Sayısı:* ${paxStr}
✨ *Paket:* ${proposal.packageTitle}

───────────────────────────────
🗓️ *GÜN GÜN TATİL PROGRAMINIZ:*

${daysSummary}

───────────────────────────────
💰 *FİYATLANDIRMA & ÖDEME PLANI:*
• Turlar Liste Fiyatı: ${fmtMoney(financials.subtotalThb)} THB
${proposal.discountPercent > 0 ? `• Özel Paket İndirimi (%${proposal.discountPercent}): -${fmtMoney(financials.discountThb)} THB\n` : ''}💎 *NET PAKET FİYATI:* *${fmtMoney(financials.totalThb)} THB*
   (~${fmtMoney(financials.totalTry)} TL / ~${fmtMoney(financials.totalUsd)} USD / ~${fmtMoney(financials.totalEur)} EUR)
   (Kişi başı yaklaşık: ${fmtMoney(financials.perPersonThb)} THB)

💵 *Rezervasyon Kapora Bedeli (%${proposal.depositPercent}):* *${fmtMoney(financials.depositThb)} THB*
💵 *Tur Günü Teslim Edilecek Kalan:* *${fmtMoney(financials.remainingThb)} THB* (Nakit Baht)
${giftsSummary}
🛡️ *Dahil Olan Güvenceler:*
${inclusionsSummary}
✓ Andaman Denizi hava muhalefetinde %100 ücretsiz tarih değişimi veya tam iade garantisi

💳 *Ödeme:* ${proposal.paymentMethodsNote || 'Türkiye IBAN Havale, Kredi Kartı veya Wise ile kapora; kalan tur günü nakit Baht.'}

Teklifi onaylamak veya gün/tur değişikliği yapmak için bu mesaja yanıt vermeniz yeterlidir.
İyi tatiller dileriz! 🇹🇭✨`;
}

export function convertProposalToBookingFormData(proposal: CuratedProposalData): any {
  const financials = calculateProposalFinancials(proposal);
  const isSingle = proposal.proposalType === 'single_tour';
  const todayStr = new Date().toISOString().split('T')[0];

  let mappedTours: any[] = [];
  if (isSingle) {
    const singleTitle = proposal.days[0]?.tourTitle || proposal.packageTitle || 'Özel Tur';
    mappedTours = [
      {
        tourTitle: singleTitle,
        tourDate: proposal.singleTourDate || todayStr,
        pickupTime: proposal.days[0]?.pickupWindow || '07:30 - 07:45',
        priceThb: financials.totalThb,
        costThb: Math.round(financials.totalThb * 0.6),
        supplier: 'Andaman Wave Master',
        nationalParkFeeIncluded: proposal.days[0]?.nationalParkFeeStatus === 'included',
        hotel: proposal.hotelName,
        hotelZone: proposal.hotelZone,
      },
    ];
  } else {
    mappedTours = (proposal.days || [])
      .filter((d) => d.category !== 'leisure')
      .map((d, index) => {
        let tourDate = d.date;
        if (!tourDate) {
          const dt = new Date();
          dt.setDate(dt.getDate() + index + 1);
          tourDate = dt.toISOString().split('T')[0];
        }
        return {
          tourTitle: d.tourTitle,
          tourDate,
          pickupTime: d.pickupWindow || '07:30 - 07:45',
          priceThb: d.priceThb,
          costThb: Math.round(d.priceThb * 0.6),
          supplier: 'Andaman Wave Master',
          nationalParkFeeIncluded: d.nationalParkFeeStatus === 'included',
          hotel: d.hotelName || proposal.hotelName,
          hotelZone: d.hotelZone || proposal.hotelZone,
        };
      });

    if (mappedTours.length === 0 && proposal.days && proposal.days.length > 0) {
      mappedTours = [
        {
          tourTitle: proposal.days[0].tourTitle,
          tourDate: proposal.days[0].date || todayStr,
          pickupTime: proposal.days[0].pickupWindow || '07:30 - 07:45',
          priceThb: financials.totalThb,
          costThb: Math.round(financials.totalThb * 0.6),
          supplier: 'Andaman Wave Master',
          nationalParkFeeIncluded: false,
          hotel: proposal.hotelName,
          hotelZone: proposal.hotelZone,
        },
      ];
    }
  }

  const primaryTour = mappedTours[0] || {
    tourTitle: proposal.packageTitle || 'Phuket Turu',
    tourDate: todayStr,
    pickupTime: '07:30 - 07:45',
    priceThb: financials.totalThb,
    costThb: Math.round(financials.totalThb * 0.6),
    supplier: 'Andaman Wave Master',
    nationalParkFeeIncluded: false,
  };

  const depositThb = financials.depositThb || 0;
  const isHotelHop =
    Boolean(proposal.hotels && proposal.hotels.length > 1) ||
    mappedTours.some((t) => t.hotel && t.hotel !== proposal.hotelName);

  return {
    customerName: proposal.customerName,
    phone: proposal.customerPhone || '',
    email: proposal.customerEmail || '',
    hotel: proposal.hotelName,
    hotelZone: proposal.hotelZone || 'Patong & Kalim',
    roomNumber: '',
    hotelStays: (proposal.hotels || []).map((h) => ({
      id: h.id || String(Date.now()),
      hotelName: h.hotelName,
      hotelZone: h.hotelZone,
      checkInDate: h.checkInDate,
      checkOutDate: h.checkOutDate,
      notes: h.notes,
    })),
    tourTitle: primaryTour.tourTitle,
    tourDate: primaryTour.tourDate,
    pickupTime: primaryTour.pickupTime || '07:30 - 07:45',
    tours: mappedTours,
    adultCount: proposal.adultCount || 2,
    childCount: proposal.childCount || 0,
    totalPriceThb: financials.totalThb,
    costThb: Math.round(financials.totalThb * 0.6),
    supplier: primaryTour.supplier || 'Andaman Wave Master',
    nationalParkFeeIncluded: Boolean(primaryTour.nationalParkFeeIncluded),
    paidAmountThb: depositThb,
    status: 'confirmed',
    paymentStatus: depositThb > 0 ? (depositThb >= financials.totalThb ? 'paid' : 'partial') : 'unpaid',
    isHotelHop,
    hasLuggage: isHotelHop,
    luggageCount: isHotelHop ? (proposal.adultCount || 2) : 0,
    specialNotes: `[TEKLİFTEN AKTARILDI - ${proposal.proposalNumber || 'ÖZEL'}]
Paket: ${proposal.packageTitle}
${proposal.specialGifts && proposal.specialGifts.length > 0 ? '🎁 Dahil Hediyeler: ' + proposal.specialGifts.join(', ') : ''}
${isHotelHop ? '🧳 Çoklu Otel Konaklaması / Valiz Transfer İhtiyacı Mevcut' : ''}`,
  };
}
