import { generateHolidayPackage, type PackageDuration, type TravelStyle } from './holidayPlanner';

export type TransportType = 'speedboat' | 'catamaran' | 'longtail' | 'vip_minivan' | 'ferry' | 'other';
export type MealPlanType = 'buffet_lunch' | 'set_menu' | 'picnic_island' | 'dinner_show' | 'none';
export type NationalParkStatus = 'included' | 'not_included' | 'exempt';
export type GuideLanguage = 'turkish' | 'english' | 'private_guide';
export type CurrencyCode = 'THB' | 'TRY' | 'USD' | 'EUR' | 'GBP';

export interface CuratedProposalDay {
  id: string;
  dayNumber: number;
  dayTitle: string;
  tourTitle: string;
  date?: string; // Örn: "2026-10-20"
  pickupWindow: string; // Örn: "07:30 - 07:45"
  tourDuration: string; // Örn: "08:30 - 16:30"
  category: 'island' | 'bay' | 'show' | 'nature' | 'transfer' | 'leisure';
  transportType: TransportType;
  mealPlan: MealPlanType;
  nationalParkFeeStatus: NationalParkStatus;
  guideLanguage?: GuideLanguage;
  highlight: string;
  included: string[];
  image: string;
  priceThb: number;
  hotelName?: string; // Gün/tur bazında özel alınış oteli (farklı otelde konaklama)
  hotelZone?: string;
}

export interface CuratedProposalHotelStay {
  id: string;
  hotelName: string;
  hotelZone: string;
  checkInDate?: string;
  checkOutDate?: string;
  roomType?: string;
  notes?: string;
}

export interface ProposalAgentInfo {
  name: string;
  title: string;
  phone: string;
  email?: string;
  badge?: string;
}

export interface CuratedProposalData {
  proposalNumber: string;
  createdAtDate: string;
  validUntilDate: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  hotelName: string;
  hotelZone: string;
  hotels?: CuratedProposalHotelStay[]; // Çoklu otel konaklamaları (örn: 3 gün Patong, 4 gün Kata)
  adultCount: number;
  childCount: number;
  packageTitle: string;
  packageSubtitle: string;
  travelStyle: TravelStyle;
  currency: CurrencyCode;
  days: CuratedProposalDay[];
  inclusions: string[];
  exclusions: string[];
  specialGifts: string[];
  agentInfo: ProposalAgentInfo;
  welcomeMessage?: string;
  discountPercent: number;
  depositPercent: number;
  customNotes: string;
  paymentMethodsNote?: string;
}

export interface CuratedProposalFinancials {
  subtotalThb: number;
  discountThb: number;
  totalThb: number;
  depositThb: number;
  remainingThb: number;
  perPersonThb: number;
  totalTry: number;
  totalUsd: number;
  totalEur: number;
  totalGbp: number;
  primaryCurrencyAmount: number;
  primaryCurrencyCode: CurrencyCode;
}

export const CATEGORY_ICONS: Record<string, string> = {
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

export const TRANSPORT_META: Record<TransportType, { label: string; icon: string }> = {
  speedboat: { label: 'Sürat Teknesi (Speedboat)', icon: '🚤' },
  catamaran: { label: 'Lüks Katamaran Yat', icon: '⛵' },
  longtail: { label: 'Geleneksel Longtail Tekne', icon: '🛶' },
  vip_minivan: { label: 'VIP Klimalı Minivan', icon: '🚐' },
  ferry: { label: 'Hızlı Feribot', icon: '🚢' },
  other: { label: 'Özel / Esnek Ulaşım', icon: '🌴' },
};

export const MEAL_PLAN_META: Record<MealPlanType, { label: string; icon: string }> = {
  buffet_lunch: { label: 'Açık Büfe Öğle Yemeği', icon: '🍽️' },
  set_menu: { label: 'Özel Restoran Set Menü', icon: '🥗' },
  picnic_island: { label: 'Ada Kumanyası & Taze Meyve', icon: '🥪' },
  dinner_show: { label: 'Akşam Yemeği & Şov Büfesi', icon: '🎭' },
  none: { label: 'Yemeksiz / Serbest Tercih', icon: '☕' },
};

export const NATIONAL_PARK_META: Record<NationalParkStatus, { label: string; badge: string }> = {
  included: { label: 'Milli Park Dahil', badge: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
  not_included: { label: 'Milli Park Hariç (Gişede)', badge: 'bg-amber-50 text-amber-700 border-amber-300' },
  exempt: { label: 'Milli Park Harcı Yok', badge: 'bg-slate-100 text-slate-600 border-slate-200' },
};

export const GUIDE_LANGUAGE_META: Record<GuideLanguage, { label: string; icon: string }> = {
  turkish: { label: 'Türkçe Rehberli / WhatsApp Asistanlı', icon: '🇹🇷' },
  english: { label: 'İngilizce Lisanslı Rehberli', icon: '🇬🇧' },
  private_guide: { label: 'Kişiye Özel Özel Rehber', icon: '⭐' },
};

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  THB: '฿',
  TRY: '₺',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

export const DEFAULT_INCLUSIONS: string[] = [
  'Tüm turlarda otelden gidiş-dönüş VIP klimalı transferler',
  '7/24 Türkçe Saha Asistanı & WhatsApp Rehberlik Desteği (Murat Gençer)',
  'Tüm deniz turlarında açık büfe / set menü öğle yemeği ve soğuk içecekler',
  'Sterilize şnorkel maskesi, can yeleği ve deniz güvenlik brifingi',
  'Tayland Turizm Bakanlığı (TAT: 34/02819) onaylı kaza ve yolcu seyahat sigortası',
  'Tüm adalarda gün boyu serinletici soğuk su, kola ve taze tropikal meyve ikramı',
  'Hava muhalefetinde %100 kesintisiz tarih değişimi veya tam ücret iadesi garantisi',
];

export const DEFAULT_EXCLUSIONS: string[] = [
  'Uluslararası ve iç hat uçak biletleri',
  'Belirtilmeyen akşam yemekleri ve oteldeki kişisel harcamalar',
  'Rehber, şoför ve tekne mürettebatı bahşişleri (isteğe bağlı)',
  'Milli park harçları (dahil olarak işaretlenmeyen turlarda gişede ödenir)',
];

export const DEFAULT_GIFTS: string[] = [
  'Otel odanıza hoş geldiniz taze tropikal meyve sepeti ikramı 🥥',
  'Havalimanında isme özel VIP karşılama panosu & soğuk havlu 🪧',
  'Turlarda profesyonel dijital anı fotoğrafı çekimi 📸',
];

export const DEFAULT_AGENT_INFO: ProposalAgentInfo = {
  name: 'Murat Gençer',
  title: 'Phuket Tatili Operasyon Direktörü',
  phone: '+66 82 895 0665',
  email: 'info@phukettatili.com',
  badge: 'Lisanslı Acenta · TAT License: 34/02819',
};

/**
 * Teklife tek tıkla eklenebilecek hazır katalog turları
 */
export interface CatalogTourPreset {
  id: string;
  tourTitle: string;
  defaultDayTitle: string;
  category: 'island' | 'bay' | 'show' | 'nature' | 'transfer' | 'leisure';
  transportType: TransportType;
  mealPlan: MealPlanType;
  nationalParkFeeStatus: NationalParkStatus;
  pickupWindow: string;
  tourDuration: string;
  priceThb: number;
  highlight: string;
  image: string;
  included: string[];
}

export const PROPOSAL_CATALOG_TOURS: CatalogTourPreset[] = [
  {
    id: 'phi_phi_speed',
    tourTitle: 'Phi Phi, Maya Bay ve Bamboo Adası',
    defaultDayTitle: 'Turkuaz Cennet: Phi Phi & Maya Bay Rüyası',
    category: 'island',
    transportType: 'speedboat',
    mealPlan: 'buffet_lunch',
    nationalParkFeeStatus: 'not_included',
    pickupWindow: '07:15 - 07:30',
    tourDuration: '08:30 - 16:30',
    priceThb: 3200,
    highlight: 'The Beach filminin çekildiği efsanevi Maya Bay, Viking Mağarası ve Bamboo Adası şnorkeli.',
    image: '/assets/phi_phi_island.webp',
    included: ['VIP Klimalı Transfer', 'Açık Büfe Öğle Yemeği', 'Şnorkel & Can Yeleği', 'Kaza Sigortası'],
  },
  {
    id: 'james_bond_canoe',
    tourTitle: 'James Bond Adası ve Phang Nga Körfezi Kano Turu',
    defaultDayTitle: 'Efsanevi Körfez: James Bond & Gizli Lagünler',
    category: 'bay',
    transportType: 'speedboat',
    mealPlan: 'buffet_lunch',
    nationalParkFeeStatus: 'included',
    pickupWindow: '08:00 - 08:30',
    tourDuration: '09:00 - 17:00',
    priceThb: 2400,
    highlight: 'Devasa kireçtaşı adaları arasında çift kişilik kano gezisi ve Koh Panyee yüzen köyü.',
    image: '/assets/james_bond.webp',
    included: ['Klimalı Minivan', 'Kano Ekipmanı & Kürekçi', 'Öğle Yemeği', 'Milli Park Girişleri Dahil'],
  },
  {
    id: 'sunset_yacht_catamaran',
    tourTitle: 'Coral & Racha Lüks Katamaran Günbatımı Yat Turu',
    defaultDayTitle: 'Romantik Günbatımı: Lüks Katamaran & Şnorkel',
    category: 'island',
    transportType: 'catamaran',
    mealPlan: 'buffet_lunch',
    nationalParkFeeStatus: 'included',
    pickupWindow: '10:30 - 11:00',
    tourDuration: '12:00 - 19:30',
    priceThb: 4200,
    highlight: 'Geniş fileli lüks katamaranda yelken keyfi, şeffaf koylarda yüzme ve günbatımı akşam yemeği.',
    image: '/assets/vip_transfer.webp',
    included: ['Katamaran Yelkenlisi', 'Öğle Yemeği & Meyve', 'Olta & Şnorkel', 'Günbatımı İçeceği'],
  },
  {
    id: 'similan_islands',
    tourTitle: 'Similan Adaları Kristal Deniz Turu (Sezonluk)',
    defaultDayTitle: 'Dünyanın En Berrak Suları: Similan Adaları',
    category: 'island',
    transportType: 'speedboat',
    mealPlan: 'buffet_lunch',
    nationalParkFeeStatus: 'included',
    pickupWindow: '05:45 - 06:15',
    tourDuration: '07:30 - 17:30',
    priceThb: 3800,
    highlight: 'Yelkenli Kaya (Sail Rock) manzarası, bembeyaz pudra kumsal ve deniz kaplumbağaları ile şnorkel.',
    image: '/assets/phi_phi_island.webp',
    included: ['Uzun Mesafe Transfer', '3 Öğün İkram & Yemek', 'Milli Park Girişi Dahil', 'Palet & Şnorkel'],
  },
  {
    id: 'elephant_sanctuary',
    tourTitle: 'Etik Fil Koruma, Besleme ve Çamur Banyosu',
    defaultDayTitle: 'Doğayla Buluşma: Etik Fil Koruma Alanı',
    category: 'nature',
    transportType: 'vip_minivan',
    mealPlan: 'set_menu',
    nationalParkFeeStatus: 'exempt',
    pickupWindow: '09:00 - 09:30',
    tourDuration: '10:00 - 13:30',
    priceThb: 2200,
    highlight: 'Kurtarılmış filleri ellerinizle muzla besleme, çamur spa masajı ve birlikte nehir banyosu.',
    image: '/assets/elephant_sanctuary.webp',
    included: ['Etik Barınak Girişi', 'Muz & Besleme Sepeti', 'Tay Pişirme Dersi / Yemek', 'Otel Transferi'],
  },
  {
    id: 'hanuman_zipline',
    tourTitle: 'Hanuman World Yağmur Ormanı Zipline & Roller',
    defaultDayTitle: 'Adrenalin Zirvesi: Hanuman Yağmur Ormanı',
    category: 'nature',
    transportType: 'vip_minivan',
    mealPlan: 'set_menu',
    nationalParkFeeStatus: 'exempt',
    pickupWindow: '09:00 - 09:30',
    tourDuration: '10:00 - 14:00',
    priceThb: 2500,
    highlight: 'Asırlık tropik ağaçlar üzerinde 16-30 platformlu zipline, asma köprüler ve roller zipline.',
    image: '/assets/elephant_sanctuary.webp',
    included: ['Petzl Güvenlik Ekipmanı', 'Profesyonel Zipline Eğitmenleri', 'Açık Büfe Tay Yemeği', 'Transfer'],
  },
  {
    id: 'carnival_magic',
    tourTitle: 'Carnival Magic Işık Sarayı & Kraliyet Geçidi',
    defaultDayTitle: 'Masalsı Gece: Carnival Magic Işık Krallığı',
    category: 'show',
    transportType: 'vip_minivan',
    mealPlan: 'dinner_show',
    nationalParkFeeStatus: 'exempt',
    pickupWindow: '16:30 - 17:00',
    tourDuration: '17:30 - 21:30',
    priceThb: 2600,
    highlight: '40 milyondan fazla ışıkla Guinness rekorlu ışık sarayı, açık büfe kraliyet yemeği ve geçit töreni.',
    image: '/assets/simon_cabaret.webp',
    included: ['Giriş Bileti', 'Krallık Açık Büfe Yemeği', 'Dev Gösteri Girişi', 'Gidiş-Dönüş Transfer'],
  },
  {
    id: 'simon_cabaret',
    tourTitle: 'Simon Cabaret VIP Phuket Gösterisi',
    defaultDayTitle: 'Sahne İhtişamı: Simon Cabaret VIP Şovu',
    category: 'show',
    transportType: 'vip_minivan',
    mealPlan: 'none',
    nationalParkFeeStatus: 'exempt',
    pickupWindow: '18:15 - 18:45',
    tourDuration: '19:30 - 21:00',
    priceThb: 1200,
    highlight: 'Phuket\'in dünyaca ünlü kabare tiyatrosunda büyüleyici kostümler ve VIP ön sıra konforu.',
    image: '/assets/simon_cabaret.webp',
    included: ['VIP Koltuk Bileti', 'Klimalı Otel Transferi', 'Hoş Geldiniz İçeceği'],
  },
  {
    id: 'vip_airport_transfer',
    tourTitle: 'Özel Havalimanı (HKT) VIP Karşılama ve Transfer',
    defaultDayTitle: 'Hoş Geldiniz: Havalimanı Karşılama & Otele VIP Geçiş',
    category: 'transfer',
    transportType: 'vip_minivan',
    mealPlan: 'none',
    nationalParkFeeStatus: 'exempt',
    pickupWindow: 'Uçuş Saatine Göre',
    tourDuration: 'Havalimanı - Otel (~1 Saat)',
    priceThb: 1100,
    highlight: 'Havalimanı çıkış kapısında isminize özel pano ile karşılama ve lüks minibüsle otele transfer.',
    image: '/assets/vip_transfer.webp',
    included: ['İsimli Karşılama Panosu', 'Klimalı VIP Minivan', 'Bagaj Yardımı', 'Soğuk Su & Havlu'],
  },
  {
    id: 'city_viewpoints',
    tourTitle: 'Phuket Özel Şehir, Büyük Buddha & Manzara Turu',
    defaultDayTitle: 'Kültür & Manzara: Büyük Buddha, Chalong & Eski Şehir',
    category: 'nature',
    transportType: 'vip_minivan',
    mealPlan: 'set_menu',
    nationalParkFeeStatus: 'exempt',
    pickupWindow: '09:00 - 09:30',
    tourDuration: '09:30 - 15:30',
    priceThb: 2200,
    highlight: '45 metrelik beyaz mermer Büyük Buddha, tarihi Wat Chalong Tapınağı ve renkli Old Phuket Town.',
    image: '/assets/vip_transfer.webp',
    included: ['Özel Şoförlü Minibüs', 'Tüm Tapınak Girişleri', 'Öğle Yemeği', 'Bölge Rehberi'],
  },
  {
    id: 'free_day_leisure',
    tourTitle: 'Serbest Gün & Otel / Plaj Dinlenmesi',
    defaultDayTitle: 'Tropikal Huzur: Serbest Dinlenme & Plaj Keyfi',
    category: 'leisure',
    transportType: 'other',
    mealPlan: 'none',
    nationalParkFeeStatus: 'exempt',
    pickupWindow: 'Esnek / Serbest',
    tourDuration: 'Tüm Gün',
    priceThb: 0,
    highlight: 'Otelinizin havuzunda ve Phuket\'in altın kumlu plajlarında dilediğinizce dinlenme günü.',
    image: '/assets/phi_phi_island.webp',
    included: ['7/24 WhatsApp Restoran & Plaj Öneri Desteği'],
  },
];

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
      id: `hotel-1`,
      hotelName,
      hotelZone,
      checkInDate: formatIsoDate(today),
      checkOutDate: formatIsoDate(new Date(today.getTime() + duration * 24 * 60 * 60 * 1000)),
    },
  ];

  return {
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
    agentInfo: { ...DEFAULT_AGENT_INFO },
    welcomeMessage,
    discountPercent: packagePlan.discountPercentage || 12,
    depositPercent: 30,
    customNotes:
      'Teklifimiz rezervasyon talebinden itibaren 7 gün boyunca fiyat garantilidir. Hava muhalefetinde liman başkanlığı kararıyla %100 tarih değişimi veya tam ücret iadesi uygulanır.',
    paymentMethodsNote: 'Kapora: Türkiye İş Bankası / Garanti Bankası TL Havale, Kredi Kartı veya Wise. Kalan bakiye tur günü nakit Baht olarak teslim edilir.',
  };
}

/**
 * Teklifin finansal özetini hesaplar.
 */
export function calculateProposalFinancials(
  proposal: CuratedProposalData,
  rates: { tryRate?: number; usdRate?: number; eurRate?: number; gbpRate?: number } = {}
): CuratedProposalFinancials {
  const tryRate = rates.tryRate || 0.95; // 1 THB = ~0.95 TRY
  const usdRate = rates.usdRate || 36; // 1 USD = ~36 THB
  const eurRate = rates.eurRate || 39; // 1 EUR = ~39 THB
  const gbpRate = rates.gbpRate || 46; // 1 GBP = ~46 THB

  const subtotalThb = proposal.days.reduce((acc, d) => acc + (d.priceThb || 0), 0);
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
    .map((d) => {
      const trans = TRANSPORT_META[d.transportType]?.label || 'Tekne / Transfer';
      const meal = MEAL_PLAN_META[d.mealPlan]?.label || 'Öğle Yemeği';
      const np = d.nationalParkFeeStatus === 'included' ? '✅ Milli Park Dahil' : d.nationalParkFeeStatus === 'not_included' ? '⚠️ Milli Park Hariç' : 'ℹ️ Harçsız';
      const hotelInfo = d.hotelName ? `\n   • Alınış Oteli: *${d.hotelName}* (${d.hotelZone || proposal.hotelZone})` : '';
      return `📍 *Gün ${d.dayNumber}: ${d.dayTitle}*\n` +
        `   • Tur: *${d.tourTitle}*\n` +
        `   • Lobi Alınış: *${d.pickupWindow}* | Süre: ${d.tourDuration}${hotelInfo}\n` +
        `   • Ulaşım: ${trans} | Yemek: ${meal}\n` +
        `   • Durum: ${np}\n` +
        `   • Öne Çıkan: _${d.highlight}_\n` +
        `   • Tutar: *${d.priceThb.toLocaleString()} THB*`;
    })
    .join('\n\n');

  const inclusionsSummary = proposal.inclusions.slice(0, 5).map((i) => `✓ ${i}`).join('\n');
  const giftsSummary =
    proposal.specialGifts && proposal.specialGifts.length > 0
      ? `\n🎁 *Kişiye Özel İkram & Sürprizler:*\n` + proposal.specialGifts.map((g) => `• ${g}`).join('\n') + `\n`
      : '';

  let accommodationText = `🏨 *Konaklama:* ${proposal.hotelName} (${proposal.hotelZone})`;
  if (proposal.hotels && proposal.hotels.length > 1) {
    accommodationText = `🏨 *Konaklama Otelleri (${proposal.hotels.length} Farklı Otel):*\n` +
      proposal.hotels.map((h, i) => `   ${i + 1}. *${h.hotelName}* (${h.hotelZone || 'Phuket'})${h.checkInDate && h.checkOutDate ? ` · 📅 ${h.checkInDate} ➔ ${h.checkOutDate}` : ''}${h.notes ? ` (${h.notes})` : ''}`).join('\n');
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
• Turlar Liste Fiyatı: ${financials.subtotalThb.toLocaleString()} THB
${proposal.discountPercent > 0 ? `• Özel Paket İndirimi (%${proposal.discountPercent}): -${financials.discountThb.toLocaleString()} THB\n` : ''}💎 *NET PAKET FİYATI:* *${financials.totalThb.toLocaleString()} THB*
   (~${financials.totalTry.toLocaleString()} TL / ~${financials.totalUsd.toLocaleString()} USD / ~${financials.totalEur.toLocaleString()} EUR)
   (Kişi başı yaklaşık: ${financials.perPersonThb.toLocaleString()} THB)

💵 *Rezervasyon Kapora Bedeli (%${proposal.depositPercent}):* *${financials.depositThb.toLocaleString()} THB*
💵 *Tur Günü Teslim Edilecek Kalan:* *${financials.remainingThb.toLocaleString()} THB* (Nakit Baht)
${giftsSummary}
🛡️ *Dahil Olan Güvenceler:*
${inclusionsSummary}
✓ Andaman Denizi hava muhalefetinde %100 ücretsiz tarih değişimi veya tam iade garantisi

💳 *Ödeme:* ${proposal.paymentMethodsNote || 'Türkiye IBAN Havale, Kredi Kartı veya Wise ile kapora; kalan tur günü nakit Baht.'}

Teklifi onaylamak veya gün/tur değişikliği yapmak için bu mesaja yanıt vermeniz yeterlidir.
İyi tatiller dileriz! 🇹🇭✨`;
}
