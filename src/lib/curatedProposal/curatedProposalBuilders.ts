import { generateHolidayPackage, type PackageDuration, type TravelStyle } from '../holidayPlanner';
import type {
  CuratedProposalData,
  CuratedProposalDay,
  CuratedProposalFinancials,
  CuratedProposalHotelStay,
  MealPlanType,
  NationalParkStatus,
  ProposalTimelineStep,
  TransportType,
} from './curatedProposalTypes';
import {
  DEFAULT_AGENT_INFO,
  DEFAULT_EXCLUSIONS,
  DEFAULT_GIFTS,
  DEFAULT_INCLUSIONS,
  DEFAULT_PROPOSAL_ADDONS,
  MEAL_PLAN_META,
  TRANSPORT_META,
} from './curatedProposalTypes';
import {
  DEFAULT_SINGLE_TOUR_TIPS,
  PROPOSAL_CATALOG_TOURS,
} from './curatedProposalCatalog';

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
    let transportType: TransportType = 'speedboat';
    let mealPlan: MealPlanType = 'buffet_lunch';
    let nationalParkFeeStatus: NationalParkStatus = 'included';
    let included = ['Klimalı VIP Transfer', 'Öğle Yemeği & İçecekler', 'Şnorkel & Can Yeleği', 'Kapsamlı Turizm Sigortası'];
    let image = '/assets/phi_phi_island.webp';

    if (item.category === 'show') {
      pickupWindow = '18:15 - 18:30';
      tourDuration = '19:30 - 21:00';
      transportType = 'vip_minivan';
      mealPlan = item.tourTitle.toLowerCase().includes('carnival') ? 'dinner_show' : 'none';
      nationalParkFeeStatus = 'exempt';
      included = ['VIP Ön Sıra Koltuk', 'Gidiş-Dönüş Otel Transferi', 'Şov Bileti'];
      image = '/assets/simon_cabaret.webp';
    } else if (item.category === 'bay') {
      pickupWindow = '08:00 - 08:30';
      tourDuration = '09:00 - 17:00';
      transportType = 'speedboat';
      mealPlan = 'buffet_lunch';
      nationalParkFeeStatus = 'included';
      included = ['Klimalı Minivan', 'Kano Ekipmanı & Profesyonel Kürekçi', 'Öğle Yemeği', 'Milli Park Girişleri'];
      image = '/assets/james_bond.webp';
    } else if (item.category === 'nature') {
      pickupWindow = '08:45 - 09:00';
      tourDuration = '09:30 - 13:00';
      transportType = 'vip_minivan';
      mealPlan = 'set_menu';
      nationalParkFeeStatus = 'exempt';
      included = ['Etik Fil Bakımı & Besleme', 'Çamur Banyosu', 'Geleneksel Tay Yemeği', 'Otel Transferi'];
      image = '/assets/elephant_sanctuary.webp';
    } else if (item.category === 'transfer') {
      pickupWindow = 'Uçuş Saatinde';
      tourDuration = 'Havalimanı - Otel VIP';
      transportType = 'vip_minivan';
      mealPlan = 'none';
      nationalParkFeeStatus = 'exempt';
      included = ['VIP Lüks Minibüs', 'İsimli Karşılama Panosu', 'Soğuk Su & Havlu İkramı'];
      image = '/assets/vip_transfer.webp';
    }

    return {
      id: `DAY-${idx + 1}-${Date.now().toString().slice(-4)}`,
      dayNumber: item.dayNumber || idx + 1,
      dayTitle: item.dayTitle,
      tourTitle: item.tourTitle,
      pickupWindow,
      tourDuration,
      category: item.category,
      transportType,
      mealPlan,
      nationalParkFeeStatus,
      guideLanguage: 'turkish',
      highlight: item.highlight,
      included,
      image,
      priceThb: item.individualPriceThb * adultCount + Math.round(item.individualPriceThb * 0.7 * childCount),
    };
  });

  const proposalNumber = `PT-PROP-${today.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const welcomeMessage = `Sayın ${customerName}, Phuket tatiliniz için tropikal adalar, turkuaz lagünler ve unutulmaz anılarla dolu kişiye özel bir seyahat programı hazırladık. Tüm detaylar konforunuz ve güvenliğiniz ön planda tutularak planlanmıştır.`;

  const hotels: CuratedProposalHotelStay[] = [
    {
      id: 'hotel-1',
      hotelName,
      hotelZone,
      checkInDate: formatIsoDate(today),
      checkOutDate: formatIsoDate(new Date(today.getTime() + duration * 24 * 60 * 60 * 1000)),
    },
  ];

  return {
    proposalType: 'package_multiday',
    proposalNumber,
    createdAtDate: formatIsoDate(today),
    validUntilDate: formatIsoDate(validUntil),
    customerName,
    hotelName,
    hotelZone,
    hotels,
    adultCount,
    childCount,
    packageTitle: packagePlan.packageName,
    packageSubtitle: packagePlan.packageDescription,
    travelStyle: style,
    currency: 'THB',
    days,
    inclusions: [...DEFAULT_INCLUSIONS],
    exclusions: [...DEFAULT_EXCLUSIONS],
    specialGifts: style === 'honeymoon' ? [...DEFAULT_GIFTS] : [DEFAULT_GIFTS[1]],
    addons: DEFAULT_PROPOSAL_ADDONS.map((a) => ({ ...a })),
    agentInfo: { ...DEFAULT_AGENT_INFO },
    welcomeMessage,
    discountPercent: packagePlan.discountPercentage || 12,
    depositPercent: 30,
    customNotes:
      'Teklifimiz rezervasyon talebinden itibaren 7 gün boyunca fiyat garantilidir. Hava muhalefetinde liman başkanlığı kararıyla %100 tarih değişimi veya tam ücret iadesi uygulanır.',
    paymentMethodsNote: 'Kapora: Türkiye İş Bankası / Garanti Bankası TL Havale, Kredi Kartı veya Wise. Kalan bakiye tur günü nakit Baht olarak teslim edilir.',
  };
}

export function buildSingleTourProposal(
  customerName: string = 'Sayın Misafirimiz',
  presetId: string = 'phi_phi_speed',
  tourDate: string = '',
  hotelName: string = 'Amari Phuket',
  hotelZone: string = 'Patong & Kalim',
  adultCount: number = 2,
  childCount: number = 0
): CuratedProposalData {
  const preset = PROPOSAL_CATALOG_TOURS.find((p) => p.id === presetId) || PROPOSAL_CATALOG_TOURS[0];
  const today = new Date();
  const validUntil = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const formatIsoDate = (d: Date) => d.toISOString().split('T')[0];
  const effectiveTourDate = tourDate || formatIsoDate(new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000));

  const dayPrice = preset.priceThb * adultCount + Math.round(preset.priceThb * 0.7 * childCount);

  const timelineSteps: ProposalTimelineStep[] = (preset.timeline || [
    { time: preset.pickupWindow, title: 'Otel Lobisinden Alınış', description: 'Klimalı VIP minivan ile transfer' },
    { time: '09:00', title: 'Aktivite Başlangıcı', description: preset.highlight },
    { time: '12:30', title: 'Öğle Yemeği & Dinlenme', description: MEAL_PLAN_META[preset.mealPlan]?.label || 'Yemek molası' },
    { time: '16:30', title: 'Otele Güvenli Dönüş', description: 'Lobide teslim ediliş' },
  ]).map((t, idx) => ({
    id: `step-${idx + 1}-${Date.now().toString().slice(-4)}`,
    time: t.time,
    title: t.title,
    description: t.description || '',
  }));

  const singleDay: CuratedProposalDay = {
    id: `DAY-1-${Date.now().toString().slice(-4)}`,
    dayNumber: 1,
    dayTitle: preset.defaultDayTitle,
    tourTitle: preset.tourTitle,
    date: effectiveTourDate,
    pickupWindow: preset.pickupWindow,
    tourDuration: preset.tourDuration,
    category: preset.category,
    transportType: preset.transportType,
    mealPlan: preset.mealPlan,
    nationalParkFeeStatus: preset.nationalParkFeeStatus,
    guideLanguage: 'turkish',
    highlight: preset.highlight,
    included: [...preset.included],
    image: preset.image,
    priceThb: dayPrice,
    hotelName,
    hotelZone,
  };

  const proposalNumber = `PT-TOUR-${today.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const welcomeMessage = `Sayın ${customerName}, ${effectiveTourDate} tarihli "${preset.tourTitle}" turunuz için kişiye özel VIP teklifiniz ve detaylı saatlik tur akışınız hazırlanmıştır.`;

  const hotels: CuratedProposalHotelStay[] = [
    {
      id: 'hotel-1',
      hotelName,
      hotelZone,
      checkInDate: effectiveTourDate,
      checkOutDate: effectiveTourDate,
    },
  ];

  return {
    proposalType: 'single_tour',
    singleTourDate: effectiveTourDate,
    singleTourTimeline: timelineSteps,
    singleTourVesselInfo: TRANSPORT_META[preset.transportType]?.label || 'VIP Klimalı Araç & Konforlu Tekne',
    singleTourTips: [...DEFAULT_SINGLE_TOUR_TIPS],
    proposalNumber,
    createdAtDate: formatIsoDate(today),
    validUntilDate: formatIsoDate(validUntil),
    customerName,
    hotelName,
    hotelZone,
    hotels,
    adultCount,
    childCount,
    packageTitle: preset.tourTitle,
    packageSubtitle: `${preset.defaultDayTitle} · Özel VIP Tur Teklifi`,
    travelStyle: 'adventure',
    currency: 'THB',
    days: [singleDay],
    inclusions: [...DEFAULT_INCLUSIONS],
    exclusions: [...DEFAULT_EXCLUSIONS],
    specialGifts: ['Soğuk Su, Taze Meyve & İçecek İkramları 🥥', 'WhatsApp Türkçe Saha Desteği 🇹🇷'],
    addons: DEFAULT_PROPOSAL_ADDONS.map((a) => ({ ...a })),
    agentInfo: { ...DEFAULT_AGENT_INFO },
    welcomeMessage,
    discountPercent: 0,
    depositPercent: 30,
    customNotes:
      'Teklifimiz rezervasyon talebinden itibaren 7 gün boyunca fiyat garantilidir. Andaman Denizi hava muhalefetinde liman başkanlığı kararıyla %100 tarih değişimi veya tam ücret iadesi uygulanır.',
    paymentMethodsNote: 'Kapora: Türkiye IBAN (TL), Kredi Kartı veya Wise. Kalan bakiye tur günü araçta / marinada nakit Baht olarak ödenir.',
  };
}

export function calculateProposalFinancials(
  proposal: CuratedProposalData,
  rates: { tryRate?: number; usdRate?: number; eurRate?: number; gbpRate?: number } = {}
): CuratedProposalFinancials {
  const tryRate = rates.tryRate || 0.95;
  const usdRate = rates.usdRate || 36;
  const eurRate = rates.eurRate || 39;
  const gbpRate = rates.gbpRate || 46;

  const addonsTotalThb = (proposal.addons || [])
    .filter((a) => a.selected)
    .reduce((acc, a) => acc + (a.priceThb || 0), 0);

  const subtotalThb = proposal.days.reduce((acc, d) => acc + (d.priceThb || 0), 0) + addonsTotalThb;
  const discountThb = Math.round((subtotalThb * (proposal.discountPercent || 0)) / 100);
  const totalThb = Math.max(0, subtotalThb - discountThb);

  const depositThb = Math.round((totalThb * (proposal.depositPercent || 30)) / 100);
  const remainingThb = totalThb - depositThb;

  const totalPax = Math.max(1, (proposal.adultCount || 1) + (proposal.childCount || 0));
  const perPersonThb = Math.round(totalThb / totalPax);

  const totalTry = Math.round(totalThb * tryRate);
  const totalUsd = Math.round(totalThb / usdRate);
  const totalEur = Math.round(totalThb / eurRate);
  const totalGbp = Math.round(totalThb / gbpRate);

  let primaryCurrencyAmount = totalThb;
  if (proposal.currency === 'TRY') primaryCurrencyAmount = totalTry;
  else if (proposal.currency === 'USD') primaryCurrencyAmount = totalUsd;
  else if (proposal.currency === 'EUR') primaryCurrencyAmount = totalEur;
  else if (proposal.currency === 'GBP') primaryCurrencyAmount = totalGbp;

  return {
    subtotalThb,
    discountThb,
    totalThb,
    depositThb,
    remainingThb,
    perPersonThb,
    totalTry,
    totalUsd,
    totalEur,
    totalGbp,
    primaryCurrencyAmount,
    primaryCurrencyCode: proposal.currency || 'THB',
  };
}
