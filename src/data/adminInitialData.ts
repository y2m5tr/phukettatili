export interface BookingTourSchedule {
  tourId?: string;
  tourTitle: string;
  tourDate: string;
  pickupTime?: string;
  priceThb?: number;
  costThb?: number;
  supplier?: string;
  nationalParkFeeIncluded?: boolean;
  pickupStatus?: 'pending' | 'picked_up' | 'on_tour' | 'completed' | 'no_show';
  pickedUpAt?: string;
  assignedVehicle?: string;
  assignedDriver?: string;
  hotelZone?: string;
  supplierRefCode?: string;
  supplierStatus?: 'pending' | 'confirmed' | 'cancelled';
}

export type DietaryPreference =
  | 'standard'
  | 'vegetarian'
  | 'halal'
  | 'vegan'
  | 'seafood_allergy';

export interface PassengerItem {
  fullName: string;
  passportNo?: string;
  nationality?: string;
  birthDate?: string;
  gender?: 'M' | 'F';
  dietaryPreference?: DietaryPreference;
}

export type PaymentMethod =
  | 'cash_thb'
  | 'promptpay'
  | 'kbank_transfer'
  | 'tr_bank_transfer'
  | 'cash_usd'
  | 'cash_eur'
  | 'credit_card'
  | 'wise'
  | 'other';

export type CollectionLocation =
  | 'hotel_lobby'
  | 'pier_marina'
  | 'office'
  | 'bank_online'
  | 'other';

export interface PaymentRecord {
  id: string;
  bookingId: string;
  customerName?: string;
  tourTitle?: string;
  amountThb: number;
  method: PaymentMethod;
  collectedBy?: string;
  collectionLocation?: CollectionLocation;
  collectedAt: string;
  note?: string;
  receiptNo?: string;
}

export interface Booking {
  id: string;
  customerName: string;
  phone: string;
  email?: string;
  hotel: string;
  roomNumber?: string;
  tourId: string;
  tourTitle: string;
  tourDate: string;
  pickupTime?: string;
  tours?: BookingTourSchedule[];
  adultCount: number;
  childCount: number;
  totalPriceThb: number;
  costThb?: number;
  supplier?: string;
  paidAmountThb: number;
  remainingAmountThb: number;
  nationalParkFeeIncluded?: boolean;
  status: 'inquiry' | 'confirmed' | 'completed' | 'cancelled';
  pickupStatus?: 'pending' | 'picked_up' | 'on_tour' | 'completed' | 'no_show';
  pickedUpAt?: string;
  assignedVehicle?: string;
  assignedDriver?: string;
  hotelZone?: string;
  paymentStatus: 'unpaid' | 'partial' | 'paid' | 'refunded';
  specialNotes?: string;
  passengers?: PassengerItem[];
  payments?: PaymentRecord[];
  collectionLocation?: CollectionLocation;
  depositMethod?: PaymentMethod;
  balanceCollector?: string;
  // B2B & Acenta / Satıcı Takibi (Faz 2)
  agentId?: string;
  agentName?: string;
  agentCommissionThb?: number;
  agentCommissionStatus?: 'pending' | 'settled' | 'cancelled';
  // Tedarikçi Sipariş & Onay Takibi
  supplierRefCode?: string;
  supplierStatus?: 'pending' | 'confirmed' | 'cancelled';
  /**
   * Misafir bilet portalı kodu (/bilet/[code]).
   * Kayıt id'si (BK-XXXX) tahmin edilebilir olduğu için portala ayrı,
   * rastgele, tahmin edilemez kod atanır (PT-XXXXXXX).
   */
  ticketCode?: string;
  // WhatsApp Otomasyon & Tetikleme Takibi (Aşama 5)
  lastWhatsAppNotifiedAt?: string;
  whatsAppReminderSent?: boolean;
  whatsAppReviewSent?: boolean;
  createdAt: string;
}

/**
 * Phuket otel bölgeleri — araç hat planlamasında ve manifesto gruplamasında
 * kullanılır. detectHotelZone() bu değerleri döndürür.
 */
export const HOTEL_ZONES = [
  'Patong & Kalim',
  'Kata & Karon',
  'Kamala',
  'Bang Tao & Surin',
  'Rawai & Chalong',
  'Cape Panwa',
  'Phuket Town',
  'Kuzey / Havalimanı',
  'Genel Phuket',
] as const;

export function detectHotelZone(hotel: string): string {
  const h = (hotel || '').toLowerCase();
  if (h.includes('patong') || h.includes('kalim') || h.includes('tri trang')) return 'Patong & Kalim';
  if (h.includes('karon') || h.includes('kata')) return 'Kata & Karon';
  if (h.includes('kamala')) return 'Kamala';
  if (h.includes('bang tao') || h.includes('laguna') || h.includes('surin')) return 'Bang Tao & Surin';
  if (h.includes('rawai') || h.includes('nai harn') || h.includes('chalong')) return 'Rawai & Chalong';
  if (h.includes('panwa') || h.includes('cape panwa')) return 'Cape Panwa';
  if (h.includes('phuket town') || h.includes('old town') || h.includes('şehir')) return 'Phuket Town';
  if (h.includes('maikhao') || h.includes('nai yang') || h.includes('havalimanı')) return 'Kuzey / Havalimanı';
  return 'Genel Phuket';
}

export function getRecommendedPickupTime(zone: string): string {
  switch (zone) {
    case 'Kuzey / Havalimanı':
      return '06:45';
    case 'Bang Tao & Surin':
      return '07:00';
    case 'Kamala':
      return '07:10';
    case 'Patong & Kalim':
      return '07:15';
    case 'Kata & Karon':
      return '07:30';
    case 'Rawai & Chalong':
      return '07:45';
    case 'Cape Panwa':
      return '07:45';
    case 'Phuket Town':
      return '08:00';
    default:
      return '07:30';
  }
}

/** Standart döviz kurları (1 yabancı birim = X THB) */
export const DEFAULT_EXCHANGE_RATES: Record<'TRY' | 'USD' | 'EUR' | 'GBP', number> = {
  TRY: 1.05,
  USD: 36.5,
  EUR: 39.5,
  GBP: 46.0,
};

export function convertToThb(
  amount: number,
  currency: 'TRY' | 'USD' | 'EUR' | 'GBP',
  customRates?: Partial<Record<'TRY' | 'USD' | 'EUR' | 'GBP', number>>
): number {
  const rate = customRates?.[currency] ?? DEFAULT_EXCHANGE_RATES[currency] ?? 1;
  return Math.round(amount * rate);
}

/** Phuket Turizm Sezonları */
export type PhuketSeason = 'low' | 'high' | 'peak';

export interface SeasonInfo {
  season: PhuketSeason;
  name: string;
  badgeColor: string;
  note: string;
  multiplier: number;
}

export function getPhuketSeason(dateStr?: string): SeasonInfo {
  const d = dateStr ? new Date(dateStr) : new Date();
  const month = d.getMonth() + 1; // 1-12
  const day = d.getDate();

  // Peak: 15 Dec - 15 Jan
  if ((month === 12 && day >= 15) || (month === 1 && day <= 15)) {
    return {
      season: 'peak',
      name: 'Peak Season (Zirve)',
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
      note: 'Yılbaşı yoğun dönemi · Yoğun talep & tedarikçi ek ücretleri geçerlidir',
      multiplier: 1.25,
    };
  }

  // Low Season: 1 May - 31 Oct
  if (month >= 5 && month <= 10) {
    return {
      season: 'low',
      name: 'Low Season (Muson / İndirimli)',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      note: 'Yaz musonu dönemi · İndirimli fiyatlar & sakin deniz turları',
      multiplier: 0.85,
    };
  }

  // High Season: 1 Nov - 14 Dec & 16 Jan - 30 Apr
  return {
    season: 'high',
    name: 'High Season (Yüksek Sezon)',
    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    note: 'Güneşli & sakin deniz dönemi · Standart katalog fiyatları',
    multiplier: 1.0,
  };
}

/** Tedarikçiye gidecek resmi İngilizce Booking Order / Tur Siparişi metni */
export function generateSupplierBookingOrder(booking: Booking, tourScheduleIndex: number = 0): string {
  const t = (booking.tours && booking.tours[tourScheduleIndex]) || {
    tourTitle: booking.tourTitle,
    tourDate: booking.tourDate,
    pickupTime: booking.pickupTime || '07:30',
    supplier: booking.supplier,
    nationalParkFeeIncluded: booking.nationalParkFeeIncluded,
    supplierRefCode: booking.supplierRefCode,
  };

  const lines = [
    `*BOOKING ORDER / VOUCHER*`,
    `Agent: Phuket Tatili DMC (Thailand)`,
    `Booking Ref: ${booking.id}`,
    t.supplierRefCode ? `Supplier Ref: ${t.supplierRefCode}` : null,
    `-----------------------------`,
    `Tour: ${t.tourTitle}`,
    `Date: ${t.tourDate}`,
    `Pickup Time: ${t.pickupTime || '07:30'}`,
    `Hotel: ${booking.hotel}${booking.roomNumber ? ` (Room: ${booking.roomNumber})` : ''}`,
    `Area: ${booking.hotelZone || detectHotelZone(booking.hotel)}`,
    `Guests: ${booking.adultCount} Adult(s)${booking.childCount ? `, ${booking.childCount} Child(ren)` : ''} [Total: ${booking.adultCount + booking.childCount} Pax]`,
    `Lead Guest: ${booking.customerName}`,
    `Guest Phone: ${booking.phone}`,
    booking.specialNotes ? `Special Request: ${booking.specialNotes}` : null,
    t.nationalParkFeeIncluded ? `National Park Fee: INCLUDED in booking` : `National Park Fee: NOT INCLUDED (Pax will pay direct)`,
    `-----------------------------`,
    `Please confirm receipt and reply with Confirmation Ref No. Thank you! 🙏`,
  ].filter(Boolean);

  return lines.join('\n');
}

/** Araç tipi — filo kaydı. */
export type VehicleKind = 'minibus' | 'vip' | 'speedboat' | 'other';

/** Minibüs / VIP araç / tekne kaydı. Eskiden kodda sabit yazılıydı. */
export interface VehicleItem {
  id: string;
  label: string;
  zone?: string;
  plateNo?: string;
  capacity: number;
  kind: VehicleKind;
  active: boolean;
}

/** Şoför / rehber kadrosu. */
export interface DriverItem {
  id: string;
  fullName: string;
  phone?: string;
  role: 'driver' | 'guide' | 'both';
  licenseNo?: string;
  vehicleId?: string;
  active: boolean;
  notes?: string;
}

export interface TourFaq {
  q: string;
  a: string;
}

export interface TourItem {
  id: string;
  title: string;
  category: string;
  categoryLabel: string;
  priceThb: number;
  costThb?: number;
  supplier?: string;
  duration: string;
  featured: boolean;
  active: boolean;
  image: string;
  maxCapacity?: number;
  excerpt?: string;
  gallery?: string[];
  included?: string[];
  excluded?: string[];
  program?: string[];
  faq?: TourFaq[];
  restrictions?: string[];
  body?: string;
}

export interface MediaItem {
  id: string;
  title: string;
  url: string;
  type: 'system' | 'uploaded' | 'external';
  size?: string;
  createdAt: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  type: string;
  tour: string;
  stars: number;
  text: string;
}

export interface ServiceItem {
  slug: string;
  title: string;
  eyebrow?: string;
  heading?: string;
  intro?: string;
  media?: string;
}

export interface BlogItem {
  id: string;
  title: string;
  excerpt: string;
  cover_image: string;
  date: string;
  author: string;
  featured: boolean;
}

export const initialBookings: Booking[] = [
  {
    id: 'BK-1001',
    customerName: 'Ahmet & Zeynep Yılmaz',
    phone: '+90 532 456 78 90',
    email: 'ahmet.yilmaz@gmail.com',
    hotel: 'Amari Phuket (Patong)',
    roomNumber: '304',
    tourId: 'phi-phi-maya-ve-bamboo-adasi',
    tourTitle: 'Phi Phi, Maya Bay ve Bamboo Adası',
    tourDate: '2026-11-15',
    pickupTime: '07:30',
    tours: [
      {
        tourTitle: 'Phi Phi, Maya Bay ve Bamboo Adası',
        tourDate: '2026-11-15',
        pickupTime: '07:30',
        priceThb: 3200,
        costThb: 1900,
        supplier: 'Andaman Wave Master',
        nationalParkFeeIncluded: false,
      },
    ],
    adultCount: 2,
    childCount: 0,
    totalPriceThb: 6400,
    costThb: 3800,
    supplier: 'Andaman Wave Master',
    paidAmountThb: 2400,
    remainingAmountThb: 4000,
    nationalParkFeeIncluded: false,
    status: 'confirmed',
    paymentStatus: 'partial',
    specialNotes: 'Balayı çifti. Tekne ön tarafında oturmak istiyorlar. Vejetaryen öğle yemeği.',
    passengers: [
      { fullName: 'Ahmet Yılmaz', passportNo: 'U14285910', nationality: 'TÜRKİYE (TUR)', birthDate: '1988-05-14', gender: 'M' },
      { fullName: 'Ayşe Yılmaz', passportNo: 'U99283411', nationality: 'TÜRKİYE (TUR)', birthDate: '1990-11-20', gender: 'F' },
    ],
    createdAt: '2026-10-10',
  },
  {
    id: 'BK-1002',
    customerName: 'Burak Demir',
    phone: '+90 544 123 45 67',
    email: 'burak.demir@outlook.com',
    hotel: 'The Shore at Katathani (Kata Noi)',
    roomNumber: 'Villa 12',
    tourId: 'james-bond-adasi-ve-kano-turu',
    tourTitle: 'James Bond Adası ve Kano Turu',
    tourDate: '2026-11-16',
    pickupTime: '08:15',
    tours: [
      {
        tourTitle: 'James Bond Adası ve Kano Turu',
        tourDate: '2026-11-16',
        pickupTime: '08:15',
        priceThb: 2800,
        costThb: 1700,
        supplier: 'Phang Nga Discovery',
        nationalParkFeeIncluded: true,
      },
    ],
    adultCount: 3,
    childCount: 1,
    totalPriceThb: 11200,
    costThb: 6800,
    supplier: 'Phang Nga Discovery',
    paidAmountThb: 11200,
    remainingAmountThb: 0,
    nationalParkFeeIncluded: true,
    status: 'confirmed',
    paymentStatus: 'paid',
    specialNotes: 'Ödemenin tamamı havale ile peşin alındı. Çocuk için can yeleği hazır edilecek.',
    passengers: [
      { fullName: 'Burak Demir', passportNo: 'U88392011', nationality: 'TÜRKİYE (TUR)', birthDate: '1985-02-10', gender: 'M' },
      { fullName: 'Zeynep Demir', passportNo: 'U77329102', nationality: 'TÜRKİYE (TUR)', birthDate: '1987-09-18', gender: 'F' },
      { fullName: 'Kaan Demir', passportNo: 'U44120938', nationality: 'TÜRKİYE (TUR)', birthDate: '1962-04-05', gender: 'M' },
      { fullName: 'Mina Demir (Çocuk)', passportNo: 'U11029384', nationality: 'TÜRKİYE (TUR)', birthDate: '2019-06-12', gender: 'F' },
    ],
    createdAt: '2026-10-11',
  },
  {
    id: 'BK-1003',
    customerName: 'Selin & Mert Kaya',
    phone: '+90 533 987 65 43',
    hotel: 'Banyan Tree Phuket (Bang Tao)',
    roomNumber: '210',
    tourId: 'moonlight-luks-yat-turu',
    tourTitle: 'Moonlight Lüks Özel Yat Kiralama',
    tourDate: '2026-11-18',
    pickupTime: '13:00',
    tours: [
      {
        tourTitle: 'Moonlight Lüks Özel Yat Kiralama',
        tourDate: '2026-11-18',
        pickupTime: '13:00',
        priceThb: 45000,
        costThb: 30000,
        supplier: 'Blue Voyage Charters',
        nationalParkFeeIncluded: true,
      },
    ],
    adultCount: 2,
    childCount: 0,
    totalPriceThb: 45000,
    costThb: 30000,
    supplier: 'Blue Voyage Charters',
    paidAmountThb: 15000,
    remainingAmountThb: 30000,
    nationalParkFeeIncluded: true,
    status: 'confirmed',
    paymentStatus: 'partial',
    specialNotes: 'Gün batımı özel şampanya ve meyve ikramı talep edildi.',
    createdAt: '2026-10-11',
  },
  {
    id: 'BK-1004',
    customerName: 'Canan Özdemir (Aile)',
    phone: '+90 505 333 22 11',
    hotel: 'Novotel Phuket Resort (Patong)',
    tourId: 'fil-besleme-ve-bakim-deneyimi',
    tourTitle: 'Fil Besleme ve Doğal Bakım Deneyimi',
    tourDate: '2026-11-19',
    pickupTime: '09:00',
    adultCount: 2,
    childCount: 2,
    totalPriceThb: 9600,
    costThb: 5400,
    supplier: 'Phuket Elephant Sanctuary',
    paidAmountThb: 0,
    remainingAmountThb: 9600,
    status: 'confirmed',
    paymentStatus: 'unpaid',
    specialNotes: 'WhatsApp üzerinden bilgi verildi, dönüş bekleniyor.',
    passengers: [
      { fullName: 'Canan Özdemir', passportNo: 'U55910293', nationality: 'TÜRKİYE (TUR)', birthDate: '1984-07-22', gender: 'F' },
      { fullName: 'Serdar Özdemir', passportNo: 'U88291044', nationality: 'TÜRKİYE (TUR)', birthDate: '1982-03-15', gender: 'M' },
      { fullName: 'Efe Özdemir (Çocuk)', passportNo: 'U22910482', nationality: 'TÜRKİYE (TUR)', birthDate: '2016-09-08', gender: 'M' },
      { fullName: 'İpek Özdemir (Çocuk)', passportNo: 'U33910552', nationality: 'TÜRKİYE (TUR)', birthDate: '2018-12-04', gender: 'F' },
    ],
    createdAt: '2026-10-12',
  },
];

/**
 * Varsayılan filo. Eskiden transfer sekmesindeki <select> içinde sabit
 * yazılıydı; artık panelden yönetilebilir bir kayıt listesi.
 */
export const initialVehicles: VehicleItem[] = [
  {
    id: 'veh-minibus-1',
    label: 'Minibüs 1 (Patong & Kalim)',
    zone: 'Patong & Kalim',
    capacity: 10,
    kind: 'minibus',
    active: true,
  },
  {
    id: 'veh-minibus-2',
    label: 'Minibüs 2 (Kata & Karon)',
    zone: 'Kata & Karon',
    capacity: 10,
    kind: 'minibus',
    active: true,
  },
  {
    id: 'veh-minibus-3',
    label: 'Minibüs 3 (Bang Tao & Kamala)',
    zone: 'Bang Tao & Kamala',
    capacity: 10,
    kind: 'minibus',
    active: true,
  },
  {
    id: 'veh-vip',
    label: 'VIP Özel Araç',
    zone: 'Genel Phuket',
    capacity: 4,
    kind: 'vip',
    active: true,
  },
];

/** Varsayılan kadro — panelden düzenlenir. */
export const initialDrivers: DriverItem[] = [
  {
    id: 'drv-deniz',
    fullName: 'Deniz Yılmaz',
    role: 'guide',
    phone: '+66 82 895 0665',
    vehicleId: 'veh-minibus-1',
    active: true,
  },
  {
    id: 'drv-somchai',
    fullName: 'Somchai P.',
    role: 'driver',
    phone: '+66 81 234 5678',
    vehicleId: 'veh-minibus-2',
    active: true,
  },
];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, { label: string; icon: string; category: 'cash' | 'bank' | 'card' }> = {
  cash_thb: { label: 'Nakit THB (Kasa)', icon: '💵', category: 'cash' },
  promptpay: { label: 'PromptPay (K-Bank QR)', icon: '📱', category: 'bank' },
  kbank_transfer: { label: 'Tayland Banka Havalesi', icon: '🏦', category: 'bank' },
  tr_bank_transfer: { label: 'TR Banka Havale / EFT', icon: '🇹🇷', category: 'bank' },
  cash_usd: { label: 'Nakit USD', icon: '💵', category: 'cash' },
  cash_eur: { label: 'Nakit EUR', icon: '💶', category: 'cash' },
  credit_card: { label: 'Kredi Kartı / POS', icon: '💳', category: 'card' },
  wise: { label: 'Wise / Uluslararası', icon: '🌐', category: 'bank' },
  other: { label: 'Diğer / Çeşitli', icon: '📝', category: 'cash' },
};

export const COLLECTION_LOCATION_LABELS: Record<CollectionLocation, string> = {
  hotel_lobby: 'Otel Lobisi (Alış Anında)',
  pier_marina: 'İskele / Marina Girişi',
  office: 'Acenta Ofisi',
  bank_online: 'Önceden Havale / Online',
  other: 'Diğer Nokta',
};

export const initialPayments: PaymentRecord[] = [
  {
    id: 'PAY-1001-1',
    bookingId: 'BK-1001',
    customerName: 'Ahmet & Zeynep Yılmaz',
    tourTitle: 'Phi Phi, Maya Bay ve Bamboo Adası',
    amountThb: 2400,
    method: 'tr_bank_transfer',
    collectedBy: 'Murat Gençer (Ofis)',
    collectionLocation: 'bank_online',
    collectedAt: '2026-10-10T14:30:00Z',
    note: 'Kapora alındı (İş Bankası Havalesi)',
    receiptNo: 'RCP-202610-001',
  },
  {
    id: 'PAY-1002-1',
    bookingId: 'BK-1002',
    customerName: 'Burak Demir',
    tourTitle: 'James Bond Adası ve Kano Turu',
    amountThb: 8400,
    method: 'promptpay',
    collectedBy: 'Ofis',
    collectionLocation: 'bank_online',
    collectedAt: '2026-10-11T10:15:00Z',
    note: 'Tamamı ödendi (PromptPay K-Bank QR)',
    receiptNo: 'RCP-202610-002',
  },
  {
    id: 'PAY-1003-1',
    bookingId: 'BK-1003',
    customerName: 'Selin & Caner Öztürk',
    tourTitle: 'Fil Koruma Alanı + Zipline',
    amountThb: 3000,
    method: 'credit_card',
    collectedBy: 'Web Online',
    collectionLocation: 'bank_online',
    collectedAt: '2026-10-12T16:45:00Z',
    note: 'Online Kredi Kartı Ön Ödemesi',
    receiptNo: 'RCP-202610-003',
  },
  {
    id: 'PAY-1004-1',
    bookingId: 'BK-1004',
    customerName: 'Emre Karaca',
    tourTitle: 'Racha & Coral Adası Sürat Teknesi',
    amountThb: 3500,
    method: 'cash_thb',
    collectedBy: 'Somchai (Şoför)',
    collectionLocation: 'hotel_lobby',
    collectedAt: '2026-10-13T07:45:00Z',
    note: 'Patong otel lobisinde nakit elden alındı',
    receiptNo: 'RCP-202610-004',
  },
];

/* ---------------------------------------------------------------------------
   FAZ 2: B2B & ARACI ACENTA / TEMSİLCİ YÖNETİMİ
   ------------------------------------------------------------------------- */
export type AgentCommissionType = 'percentage' | 'fixed_per_pax';

export interface PartnerAgent {
  id: string;
  name: string;
  companyTitle?: string;
  code: string;
  contactPerson: string;
  phone: string;
  email?: string;
  cityOrZone?: string;
  commissionType: AgentCommissionType;
  commissionRate: number; // örn: 15 (%15) veya 300 (300 THB/kişi)
  totalPaidCommissionThb: number;
  active: boolean;
  notes?: string;
  createdAt: string;
}

export const initialAgents: PartnerAgent[] = [
  {
    id: 'agent-ist-travel',
    name: 'İstanbul Tour Partner',
    companyTitle: 'İstanbul Turizm ve Seyahat Ltd.',
    code: 'IST-TRV',
    contactPerson: 'Serkan Yılmaz',
    phone: '+90 532 999 11 22',
    email: 'b2b@istanbultour.com',
    cityOrZone: 'İstanbul / TR',
    commissionType: 'percentage',
    commissionRate: 15,
    totalPaidCommissionThb: 12000,
    active: true,
    notes: 'Aylık toplu mutabakat yapılıyor. Türkiye kaynaklı paket turlar.',
    createdAt: '2026-08-01',
  },
  {
    id: 'agent-ali-patong',
    name: 'Ali Güven (Patong Otel Rehberi)',
    companyTitle: 'Bağımsız Otel Rehberi',
    code: 'ALI-PAT',
    contactPerson: 'Ali Güven',
    phone: '+66 89 555 44 33',
    email: 'ali.guven.phuket@gmail.com',
    cityOrZone: 'Patong & Karon / Phuket',
    commissionType: 'fixed_per_pax',
    commissionRate: 300,
    totalPaidCommissionThb: 4500,
    active: true,
    notes: 'Patong otellerindeki misafirlere tur satıyor. Kişi başı 300 THB komisyon.',
    createdAt: '2026-09-10',
  },
  {
    id: 'agent-direct-web',
    name: 'Direct Web (Doğrudan Web Sitesi)',
    companyTitle: 'Phuket Tatili Organik Satış',
    code: 'DIR-WEB',
    contactPerson: 'Merkez Ofis',
    phone: '+66 82 895 0665',
    cityOrZone: 'Phuket',
    commissionType: 'percentage',
    commissionRate: 0,
    totalPaidCommissionThb: 0,
    active: true,
    notes: 'Doğrudan web sitesinden gelen organik komisyonsuz misafirler.',
    createdAt: '2026-01-01',
  },
];

export function calculateAgentCommission(
  agent: PartnerAgent,
  totalPriceThb: number,
  adultCount: number,
  childCount: number = 0
): number {
  if (!agent) return 0;
  const rate = Number(agent.commissionRate) || 0;
  if (rate <= 0) return 0;

  if (agent.commissionType === 'percentage') {
    const total = Math.max(0, Number(totalPriceThb) || 0);
    return Math.round((total * rate) / 100);
  }
  if (agent.commissionType === 'fixed_per_pax') {
    const adults = Math.max(0, Number(adultCount) || 0);
    const children = Math.max(0, Number(childCount) || 0);
    return Math.round((adults + children * 0.5) * rate);
  }
  return 0;
}

/* ---------------------------------------------------------------------------
   FAZ 3: TEDARİKÇİ & NET ALIŞ MALİYET KATALOĞU
   ------------------------------------------------------------------------- */
export type SupplierCategory =
  | 'speedboat'
  | 'catamaran'
  | 'yacht'
  | 'adventure'
  | 'show'
  | 'safari'
  | 'transfer'
  | 'other';

export interface SupplierItem {
  id: string;
  name: string;
  category: SupplierCategory;
  contactPerson?: string;
  phone: string;
  email?: string;
  pierOrLocation: string;
  paymentTerms: 'weekly_friday' | 'monthly_invoice' | 'cash_at_pier' | 'per_booking';
  bankDetails?: string;
  rating?: number;
  active: boolean;
  notes?: string;
}

export interface TourCostItem {
  id: string;
  tourId: string;
  tourTitle: string;
  supplierId: string;
  supplierName: string;
  netCostAdultThb: number;
  netCostChildThb: number;
  nationalParkFeeIncluded: boolean;
  notes?: string;
}

export const initialSuppliers: SupplierItem[] = [
  {
    id: 'sup-andaman-wave',
    name: 'Andaman Wave Master',
    category: 'speedboat',
    contactPerson: 'K. Somkiat',
    phone: '+66 76 281 234',
    email: 'booking@andamanwavemaster.com',
    pierOrLocation: 'Rassada Pier',
    paymentTerms: 'weekly_friday',
    bankDetails: 'Kasikorn Bank (K-Bank): 720-2-33445-1',
    rating: 5,
    active: true,
    notes: 'Phi Phi sürat teknesi ve feribot operatörü. İskelede kendi check-in masası var.',
  },
  {
    id: 'sup-phangnga-discovery',
    name: 'Phang Nga Discovery',
    category: 'speedboat',
    contactPerson: 'K. Narin',
    phone: '+66 76 345 678',
    email: 'ops@phangngadiscovery.co.th',
    pierOrLocation: 'Ao Po Grand Marina',
    paymentTerms: 'weekly_friday',
    bankDetails: 'SCB Bank: 554-1-29834-0',
    rating: 5,
    active: true,
    notes: 'James Bond Adası ve kano turları. Yüksek kaliteli sürat tekneleri.',
  },
  {
    id: 'sup-hanuman-world',
    name: 'Hanuman World Phuket',
    category: 'adventure',
    contactPerson: 'Sales Team',
    phone: '+66 62 979 5533',
    email: 'info@hanumanworldphuket.com',
    pierOrLocation: 'Wichit, Muang Phuket',
    paymentTerms: 'monthly_invoice',
    bankDetails: 'Bangkok Bank: 312-0-44918-2',
    rating: 5,
    active: true,
    notes: 'Zipline, luge ve macera parkı. Transfer otelden doğrudan Hanuman minibüsüyle.',
  },
  {
    id: 'sup-carnival-magic',
    name: 'Carnival Magic & FantaSea',
    category: 'show',
    contactPerson: 'Agency Desk',
    phone: '+66 76 385 555',
    email: 'b2b@carnivalmagic.fun',
    pierOrLocation: 'Kamala Beach',
    paymentTerms: 'monthly_invoice',
    bankDetails: 'Kasikorn Bank: 102-3-88991-0',
    rating: 5,
    active: true,
    notes: 'Işık ve tema parkı, akşam açık büfe akşam yemeği.',
  },
  {
    id: 'sup-elephant-care',
    name: 'Phuket Elephant Care Sanctuary',
    category: 'safari',
    contactPerson: 'K. Prasert',
    phone: '+66 84 123 9988',
    email: 'sanctuary@phuketelephantcare.com',
    pierOrLocation: 'Chalong / Kathu',
    paymentTerms: 'weekly_friday',
    bankDetails: 'Krung Thai Bank: 441-2-00129-3',
    rating: 5,
    active: true,
    notes: 'Etik fil bakımı ve besleme deneyimi. Kafes veya binme kesinlikle yok.',
  },
];

export const initialTourCosts: TourCostItem[] = [
  {
    id: 'cost-phi-phi-wave',
    tourId: 'phi-phi-maya-ve-bamboo-adasi',
    tourTitle: 'Phi Phi, Maya Bay ve Bamboo Adası',
    supplierId: 'sup-andaman-wave',
    supplierName: 'Andaman Wave Master',
    netCostAdultThb: 1900,
    netCostChildThb: 1300,
    nationalParkFeeIncluded: false,
    notes: 'Açık büfe öğle yemeği, şnorkel ekipmanı dahil. Milli park misafire ait (400 THB).',
  },
  {
    id: 'cost-james-bond-disc',
    tourId: 'james-bond-adasi-ve-kano-turu',
    tourTitle: 'James Bond Adası ve Kano Turu',
    supplierId: 'sup-phangnga-discovery',
    supplierName: 'Phang Nga Discovery',
    netCostAdultThb: 1700,
    netCostChildThb: 1200,
    nationalParkFeeIncluded: true,
    notes: 'Kano kürekçisi bahşişi hariç tüm milli park ve öğle yemeği dahil.',
  },
  {
    id: 'cost-hanuman-world',
    tourId: 'hanuman-world-zipline-deneyimi',
    tourTitle: 'Hanuman World Zipline Deneyimi',
    supplierId: 'sup-hanuman-world',
    supplierName: 'Hanuman World Phuket',
    netCostAdultThb: 1600,
    netCostChildThb: 1600,
    nationalParkFeeIncluded: true,
    notes: '16 platform macera paketi.',
  },
  {
    id: 'cost-carnival-magic',
    tourId: 'carnival-magic-isik-ve-tema-parki',
    tourTitle: 'Carnival Magic Işık ve Tema Parkı',
    supplierId: 'sup-carnival-magic',
    supplierName: 'Carnival Magic & FantaSea',
    netCostAdultThb: 1800,
    netCostChildThb: 1400,
    nationalParkFeeIncluded: true,
    notes: 'Giriş + Açık Büfe Akşam Yemeği + Krallık Geçidi Gösterisi dahil.',
  },
  {
    id: 'cost-elephant-care',
    tourId: 'fil-besleme-ve-bakim-deneyimi',
    tourTitle: 'Fil Besleme ve Bakım Deneyimi',
    supplierId: 'sup-elephant-care',
    supplierName: 'Phuket Elephant Care Sanctuary',
    netCostAdultThb: 1500,
    netCostChildThb: 1000,
    nationalParkFeeIncluded: true,
    notes: 'Muz besleme, çamur banyosu ve duş deneyimi.',
  },
];

export function lookupTourCost(
  tourCosts: TourCostItem[],
  tourIdOrTitle: string,
  supplierName?: string
): TourCostItem | undefined {
  if (!tourIdOrTitle) return undefined;
  const tNorm = tourIdOrTitle.toLowerCase().trim();
  const sNorm = supplierName ? supplierName.toLowerCase().trim() : '';

  const tourMatches = (c: TourCostItem) => {
    const cTitle = c.tourTitle.toLowerCase().trim();
    const cId = c.tourId.toLowerCase().trim();
    return (
      cTitle === tNorm ||
      cId === tNorm ||
      cTitle.includes(tNorm) ||
      tNorm.includes(cTitle)
    );
  };

  const supplierMatches = (c: TourCostItem) => {
    if (!sNorm) return true;
    const sTitle = c.supplierName.toLowerCase().trim();
    const sId = c.supplierId.toLowerCase().trim();
    return sTitle.includes(sNorm) || sNorm.includes(sTitle) || sId === sNorm;
  };

  if (sNorm) {
    const exactBoth = tourCosts.find((c) => tourMatches(c) && supplierMatches(c));
    if (exactBoth) return exactBoth;
  }

  return tourCosts.find((c) => tourMatches(c));
}

/* ---------------------------------------------------------------------------
   FAZ 6: AKILLI GİDER & YAKIT / OPERASYON MALİYETLERİ
   ------------------------------------------------------------------------- */
export type ExpenseCategory =
  | 'fuel'
  | 'guide_wage'
  | 'pier_fee'
  | 'national_park'
  | 'vehicle_maintenance'
  | 'office_overhead'
  | 'other';

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, { label: string; icon: string }> = {
  fuel: { label: 'Minibüs & Tekne Yakıtı (Dizel)', icon: '⛽' },
  guide_wage: { label: 'Rehber & Şoför Yevmiyesi', icon: '🗣️' },
  pier_fee: { label: 'İskele / Liman / Palamar Harcı', icon: '⚓' },
  national_park: { label: 'Millî Park Toplu Gişe Ödemesi', icon: '🏞️' },
  vehicle_maintenance: { label: 'Araç / Tekne Bakım & Yıkama', icon: '🔧' },
  office_overhead: { label: 'Ofis & İletişim / Saha Gideri', icon: '🏢' },
  other: { label: 'Diğer Operasyonel Harcama', icon: '📦' },
};

export interface ExpenseRecord {
  id: string;
  date: string;
  category: ExpenseCategory;
  title: string;
  amountThb: number;
  paidFromAccount: 'office_cash' | 'kbank' | 'tr_bank' | 'wise';
  assignedVehicle?: string;
  assignedTour?: string;
  recordedBy: string;
  note?: string;
  createdAt: string;
}

export const initialExpenses: ExpenseRecord[] = [
  {
    id: 'EXP-101',
    date: '2026-10-14',
    category: 'fuel',
    title: '1 Nolu Minibüs Dizel Yakıt Dolumu (PTT Station Patong)',
    amountThb: 1800,
    paidFromAccount: 'office_cash',
    assignedVehicle: '1 Nolu Hat (Kuzey-Similan)',
    recordedBy: 'Somchai (Şoför)',
    note: '52 litre B7 dizel yakıt alındı',
    createdAt: '2026-10-14T06:15:00Z',
  },
  {
    id: 'EXP-102',
    date: '2026-10-14',
    category: 'guide_wage',
    title: 'Phi Phi Türkçe Rehberlik Günlük Yevmiyesi',
    amountThb: 2500,
    paidFromAccount: 'office_cash',
    assignedTour: 'Phi Phi & Maya Bay Sürat Teknesi',
    recordedBy: 'Murat Gençer',
    note: '14 kişilik grup tam gün Türkçe rehberlik hizmeti',
    createdAt: '2026-10-14T18:00:00Z',
  },
  {
    id: 'EXP-103',
    date: '2026-10-15',
    category: 'pier_fee',
    title: 'Rassada Pier Tekne Yanaşma & Bagaj Harcı',
    amountThb: 600,
    paidFromAccount: 'kbank',
    assignedTour: 'Phi Phi & Maya Bay Sürat Teknesi',
    recordedBy: 'Ofis Saha Ekibi',
    note: 'Rassada Marina resmi liman çıkış fişi',
    createdAt: '2026-10-15T08:30:00Z',
  },
];



