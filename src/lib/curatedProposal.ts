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

export type ProposalType = 'package_multiday' | 'single_tour';

export interface ProposalTimelineStep {
  id: string;
  time: string;
  title: string;
  description?: string;
}

export interface ProposalAgentInfo {
  name: string;
  title: string;
  phone: string;
  email?: string;
  badge?: string;
}

export interface ProposalAddon {
  id: string;
  title: string;
  priceThb: number;
  selected: boolean;
  icon?: string;
  description?: string;
}

export const DEFAULT_PROPOSAL_ADDONS: ProposalAddon[] = [
  {
    id: 'addon_drone',
    title: 'Profesyonel Drone & Sualtı Fotoğraf Çekimi',
    priceThb: 1500,
    selected: false,
    icon: '📸',
    description: 'Tüm gün 4K drone ve sualtı aksiyon kamerası video/fotoğraf çekimi + hafıza kartı teslimi',
  },
  {
    id: 'addon_gear',
    title: 'Numaralı Şnorkel Maskesi & Profesyonel Palet',
    priceThb: 250,
    selected: false,
    icon: '🤿',
    description: 'Kişiye özel dezenfekte edilmiş premium şnorkel takımı ve yüzme paleti',
  },
  {
    id: 'addon_vip_transfer',
    title: 'VIP Minivan Otel Transfer Yükseltmesi',
    priceThb: 1200,
    selected: false,
    icon: '🚐',
    description: 'Paylaşımlı araç yerine gidiş-dönüş size özel klimalı VIP Toyota Commuter',
  },
  {
    id: 'addon_turkish_guide',
    title: 'Özel Türkçe Rehber Eşliği',
    priceThb: 2500,
    selected: false,
    icon: '🇹🇷',
    description: 'Tur boyunca sadece sizinle ilgilenen lisanslı Türk tur lideri',
  },
];

export interface CuratedProposalData {
  proposalType?: ProposalType;
  singleTourDate?: string;
  singleTourTimeline?: ProposalTimelineStep[];
  singleTourVesselInfo?: string;
  singleTourTips?: string[];
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
  addons?: ProposalAddon[]; // Opsiyonel tur içi ekstralar (drone, palet, özel rehber vb.)
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
  timeline?: { time: string; title: string; description?: string }[];
}

export const DEFAULT_SINGLE_TOUR_TIPS: string[] = [
  'Güneş kremi, güneş gözlüğü ve şapka',
  'Yedek tişört / şort ve plaj havlusu',
  'Su geçirmez telefon kılıfı',
  'Deniz ayakkabısı (mercanlı plajlar için önerilir)',
  'Milli park nakit harcı (varsa) ve kişisel harcamalar',
];

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
    timeline: [
      { time: '07:15 - 07:30', title: 'Otel Lobisinden Alınış', description: 'Klimalı VIP minivan ile otelinizden alınış' },
      { time: '08:30', title: 'Marina Karşılama & Brifing', description: 'İskelede çay, kahve ikramı ve lisanslı rehber brifingi' },
      { time: '09:00', title: 'Andaman Denizi\'ne Hareket', description: 'Modern sürat teknesi ile hareket' },
      { time: '10:15', title: 'Maya Bay & Plaj Yürüyüşü', description: 'The Beach filmiyle ünlü koyda kumsal ve fotoğraf molası' },
      { time: '11:30', title: 'Pileh Lagoon & Viking Mağarası', description: 'Turkuaz lagünde yüzme molası ve tarihi mağara' },
      { time: '12:30', title: 'Phi Phi Don Açık Büfe Yemek', description: 'Ada sahilinde deniz manzaralı zengin açık büfe' },
      { time: '14:00', title: 'Bamboo Adası Şnorkel', description: 'Kristal berrak sularda rengarenk mercanlar ve balıklar' },
      { time: '16:30', title: 'Otele Konforlu Dönüş', description: 'İskeleden klimalı araçla otele transfer' },
    ],
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
    timeline: [
      { time: '08:00 - 08:30', title: 'Otel Lobisinden Alınış', description: 'Phang Nga Körfezi iskelesine transfer' },
      { time: '09:30', title: 'İskeleden Tekneye Biniş', description: 'Güvenlik brifingi ve seyre başlama' },
      { time: '10:30', title: 'Panak & Hong Adası Kano', description: 'Dev kayalar altında kürekçiler eşliğinde lagün keşfi' },
      { time: '12:00', title: 'Koh Panyee Yüzen Köy', description: 'Tarihi yüzen köyde lezzetli açık büfe öğle yemeği' },
      { time: '13:30', title: 'James Bond Adası (Khao Phing Kan)', description: '007 filmiyle ikonikleşen dikilitaş ve fotoğraf molası' },
      { time: '15:00', title: 'Plaj Dinlenmesi & Yüzme', description: 'Sakin kumsalda dinlenme ve serbest yüzme' },
      { time: '17:00', title: 'Otele Dönüş Transferi', description: 'Akşam üzeri otele varış' },
    ],
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
    timeline: [
      { time: '10:30 - 11:00', title: 'Otel Lobisinden Alınış', description: 'Chalong İskelesi VIP lounge alanına geçiş' },
      { time: '12:00', title: 'Lüks Katamarana Biniş', description: 'Geniş fileli yelkende hoş geldiniz kokteyli ve hareket' },
      { time: '13:30', title: 'Coral Adası Şnorkel & Plaj', description: 'Bembeyaz kumsalda serbest zaman ve su sporları' },
      { time: '15:30', title: 'Racha Yai Adası Şeffaf Koy', description: 'Akvaryum berraklığındaki sularda şnorkel ve olta balıkçılığı' },
      { time: '17:30', title: 'Günbatımı Yemeği & Müzik', description: 'Promthep Burnu açıklarında enfes günbatımı ve akşam yemeği' },
      { time: '19:30', title: 'İskele ve Otele VIP Transfer', description: 'Unutulmaz bir günün ardından otele dönüş' },
    ],
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
    timeline: [
      { time: '05:45 - 06:15', title: 'Erken Otel Alınışı', description: 'Khaolak özel iskelesine klimalı VIP transfer' },
      { time: '08:00', title: 'Marina Kahvaltısı & Brifing', description: 'Sıcak kruvasan, çay, kahve ve şnorkel ekipman teslimi' },
      { time: '08:30', title: 'Similan Takımadalarına Hareket', description: 'Hızlı sürat teknesiyle berrak sulara yolculuk' },
      { time: '10:00', title: 'Donald Duck Koyu & Sail Rock', description: 'İkonik yelkenli kayaya tırmanış ve muhteşem manzara' },
      { time: '11:15', title: 'Kaplumbağa Koyu Şnorkel (No. 9)', description: 'Deniz kaplumbağaları ve palyaço balıklarıyla yüzme' },
      { time: '12:30', title: 'Adada Piknik Öğle Yemeği', description: 'Gölge ağaçlar altında açık büfe Tay lezzetleri' },
      { time: '14:00', title: 'Honeymoon Bay & Prenses Koyu (No. 4)', description: 'Pudra gibi bembeyaz kumlar ve turkuaz lagün' },
      { time: '16:30', title: 'İskele ve Otele Dönüş', description: 'İskelede dondurma ikramı sonrası otele transfer' },
    ],
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
    timeline: [
      { time: '09:00 - 09:30', title: 'Otel Lobisinden Alınış', description: 'Doğal orman vadisine transfer' },
      { time: '10:00', title: 'Barınak Karşılama & Hikaye', description: 'Kurtarılmış fillerin hikayeleri ve etik bakım brifingi' },
      { time: '10:30', title: 'Besleme Sepeti Hazırlığı', description: 'Muz, şeker kamışı ve vitamin toplarıyla filleri besleme' },
      { time: '11:15', title: 'Çamur Spa Masajı & Nehir', description: 'Fillerle çamur havuzunda eğlenceli cilt bakımı ve nehirde yıkanma' },
      { time: '12:15', title: 'Tay Yemek Workshop & Öğle Yemeği', description: 'Geleneksel Pad Thai yapımı ve organik açık büfe' },
      { time: '13:30', title: 'Otele Dönüş Transferi', description: 'Unutulmaz anılarla otele dönüş' },
    ],
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
    timeline: [
      { time: '09:00 - 09:30', title: 'Otel Lobisinden Alınış', description: 'Khao Rang ormanlık tepesine transfer' },
      { time: '10:00', title: 'Güvenlik Donanımı & Brifing', description: 'Petzl emniyet kemeri, kask ve test parkuru brifingi' },
      { time: '10:30', title: 'Kanopi Zipline Parkuru', description: 'Ağaç tepelerinde 400 metrelik hatlar ve asma köprüler' },
      { time: '12:00', title: 'Roller Zipline Heyecanı', description: 'Ağaçların arasından kıvrılan yüksek hızlı raylı zipline' },
      { time: '12:45', title: 'Orman İçi Açık Büfe Yemek', description: 'Doğayla iç içe dinlenme ve leziz Tay menüsü' },
      { time: '14:00', title: 'Otele Dönüş', description: 'Otel lobisine konforlu bırakılış' },
    ],
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
    timeline: [
      { time: '16:30 - 17:00', title: 'Otel Lobisinden Alınış', description: 'Kamala bölgesindeki eğlence parkına transfer' },
      { time: '17:30', title: 'Karnaval Caddesi & Eğlenceler', description: 'Işıltılı karnaval sokakları, maskotlar ve interaktif oyunlar' },
      { time: '18:30', title: 'Bird of Paradise Açık Büfe', description: 'Devasa salonda dünya mutfakları ve deniz ürünleri ziyafeti' },
      { time: '20:00', title: 'River Carnival Dev Gösterisi', description: 'Dünyanın en büyük kapalı sahnesinde ışık ve müzik şovu' },
      { time: '21:00', title: 'Kingdom of Lights Işık Parkı', description: '40 milyon led ışıkla parlayan masal sarayında yürüyüş' },
      { time: '21:30', title: 'Otele Dönüş', description: 'VIP minibüsle otele transfer' },
    ],
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
    timeline: [
      { time: '18:15 - 18:45', title: 'Otel Lobisinden Alınış', description: 'Patong Simon Cabaret Tiyatrosuna transfer' },
      { time: '19:00', title: 'Tiyatroya Giriş & VIP Koltuklar', description: 'Hoş geldiniz içeceği eşliğinde yerinize geçiş' },
      { time: '19:30 - 20:45', title: 'Büyüleyici Simon Cabaret Şovu', description: 'Görkemli kostümler, Broadway müzikleri ve ışık şovları' },
      { time: '20:45', title: 'Sanatçılarla Fotoğraf Molası', description: 'Tiyatro avlusunda anı fotoğrafları' },
      { time: '21:00', title: 'Otele Dönüş Transferi', description: 'Klimalı minibüsle otele rahat dönüş' },
    ],
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
    timeline: [
      { time: 'Uçuş İniş Saati', title: 'Uçağın Phuket\'e (HKT) İnişi', description: 'Pasaport ve bagaj alım işlemlerinin tamamlanması' },
      { time: '+30 Dk', title: 'Kapıda İsimli Pano ile Karşılama', description: '3 Numaralı kapıda Türkçe/İngilizce isim panosuyla buluşma' },
      { time: '+45 Dk', title: 'VIP Minivana Yerleşim', description: 'Bagaj yardımı, soğuk su ikramı ve hareket' },
      { time: '~1 Saat Yol', title: 'Otel Lobisine VIP Ulaşım', description: 'Doğrudan otelinizin lobisine güvenli varış' },
    ],
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
    timeline: [
      { time: '09:00 - 09:30', title: 'Otel Lobisinden Alınış', description: 'Özel klimalı minibüs ve rehberiniz ile hareket' },
      { time: '10:00', title: 'Karon & Kata Manzara Tepesi', description: 'Üç hilal koyun nefes kesen panoramik fotoğrafı' },
      { time: '11:00', title: 'Big Buddha Zirve Tapınağı', description: 'Phuket adasını kuşbakışı gören dev beyaz mermer heykel' },
      { time: '12:30', title: 'Wat Chalong Tapınağı', description: 'Phuket\'in en büyük ve en kutsal Budist manastırı ziyareti' },
      { time: '13:30', title: 'Geleneksel Tay Öğle Yemeği', description: 'Tarihi restoranda yerel lezzetler' },
      { time: '14:30', title: 'Old Phuket Town & Sino-Portekiz Evleri', description: 'Renkli tarihi sokaklar, butik kahveciler ve sokak sanatı' },
      { time: '15:30', title: 'Otele Konforlu Dönüş', description: 'Günün sonunda otele transfer' },
    ],
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
    timeline: [
      { time: 'Sabah', title: 'Tropikal Kahvaltı & Havuz Keyfi', description: 'Otelinizde dinlendirici sabah' },
      { time: 'Öğleden Sonra', title: 'Plaj & Deniz Sezonu', description: 'Yakın plajlarda güneşlenme ve masaj keyfi' },
      { time: 'Akşam', title: 'Günbatımı Kokteyli & Akşam Yemeği', description: 'Önerdiğimiz yerel restoran veya beach club ziyareti' },
    ],
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

/**
 * Tekli tur ve tekli paket teklifleri için zengin şablon üretir.
 */
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
      id: `hotel-1`,
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
• Tur Liste Fiyatı: ${financials.subtotalThb.toLocaleString('en-US')} THB
${proposal.discountPercent > 0 ? `• Özel İndirim (%${proposal.discountPercent}): -${financials.discountThb.toLocaleString('en-US')} THB\n` : ''}💎 *NET TUR TUTARI:* *${financials.totalThb.toLocaleString('en-US')} THB*
   (~${financials.totalTry.toLocaleString('en-US')} TL / ~${financials.totalUsd.toLocaleString('en-US')} USD / ~${financials.totalEur.toLocaleString('en-US')} EUR)
   (Kişi başı: ${financials.perPersonThb.toLocaleString('en-US')} THB)

💵 *Rezervasyon Kapora Bedeli (%${proposal.depositPercent}):* *${financials.depositThb.toLocaleString('en-US')} THB*
💵 *Tur Günü Kalan Bakiye:* *${financials.remainingThb.toLocaleString('en-US')} THB* (Nakit Baht)
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
        `   • Tutar: *${d.priceThb.toLocaleString('en-US')} THB*`
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
• Turlar Liste Fiyatı: ${financials.subtotalThb.toLocaleString('en-US')} THB
${proposal.discountPercent > 0 ? `• Özel Paket İndirimi (%${proposal.discountPercent}): -${financials.discountThb.toLocaleString('en-US')} THB\n` : ''}💎 *NET PAKET FİYATI:* *${financials.totalThb.toLocaleString('en-US')} THB*
   (~${financials.totalTry.toLocaleString('en-US')} TL / ~${financials.totalUsd.toLocaleString('en-US')} USD / ~${financials.totalEur.toLocaleString('en-US')} EUR)
   (Kişi başı yaklaşık: ${financials.perPersonThb.toLocaleString('en-US')} THB)

💵 *Rezervasyon Kapora Bedeli (%${proposal.depositPercent}):* *${financials.depositThb.toLocaleString('en-US')} THB*
💵 *Tur Günü Teslim Edilecek Kalan:* *${financials.remainingThb.toLocaleString('en-US')} THB* (Nakit Baht)
${giftsSummary}
🛡️ *Dahil Olan Güvenceler:*
${inclusionsSummary}
✓ Andaman Denizi hava muhalefetinde %100 ücretsiz tarih değişimi veya tam iade garantisi

💳 *Ödeme:* ${proposal.paymentMethodsNote || 'Türkiye IBAN Havale, Kredi Kartı veya Wise ile kapora; kalan tur günü nakit Baht.'}

Teklifi onaylamak veya gün/tur değişikliği yapmak için bu mesaja yanıt vermeniz yeterlidir.
İyi tatiller dileriz! 🇹🇭✨`;
}

/**
 * Kişiye Özel Teklifi (Curated Proposal) doğrudan Yönetim Paneli Yeni Rezervasyon Formu formatına dönüştürür.
 */
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

