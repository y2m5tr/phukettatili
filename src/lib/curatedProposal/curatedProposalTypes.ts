import type { TravelStyle } from '../holidayPlanner';

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
  hotelName?: string;
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
  hotels?: CuratedProposalHotelStay[];
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
  addons?: ProposalAddon[];
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

export type ProposalFinancials = CuratedProposalFinancials;

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
