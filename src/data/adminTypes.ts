/**
 * Operasyon & Yönetim Paneli Tip Tanımları (TypeScript Data Models)
 *
 * Yalnızca tür (type/interface) tanımlarını içerir — runtime tohum verisi
 * (seed data) taşımaz. Public veya client adacıklarında güvenle import edilebilir.
 */
import type { PhuketSeason, SeasonInfo } from '../lib/publicRefs';

export type { PhuketSeason, SeasonInfo };

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
  hotel?: string; // Tur bazında özel alınış oteli (farklı otelde konaklama)
  roomNumber?: string; // Tur bazında oda numarası
  supplierRefCode?: string;
  supplierStatus?: 'pending' | 'confirmed' | 'cancelled';
}

export interface BookingHotelStay {
  id: string;
  hotelName: string;
  hotelZone?: string;
  roomNumber?: string;
  checkInDate?: string;
  checkOutDate?: string;
  notes?: string;
}

export type DietaryPreference =
  | 'standard'
  | 'vegetarian'
  | 'halal'
  | 'vegan'
  | 'seafood_allergy';

export interface PassengerItem {
  id?: string;
  fullName: string;
  passportNo?: string;
  passportNumber?: string;
  nationality?: string;
  birthDate?: string;
  gender?: 'M' | 'F' | 'male' | 'female' | '-';
  dietaryPreference?: DietaryPreference;
  isChild?: boolean;
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
  hotels?: BookingHotelStay[]; // Misafirin birden fazla konaklama oteli (örn: 3 gece Patong, 4 gece Kata)
  tourId?: string;
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
  flightNumber?: string;
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
  // Otel Değişimi & Valiz / Bagaj Takibi
  isHotelHop?: boolean;
  hasLuggage?: boolean;
  luggageCount?: number;
  luggageNotes?: string;
  createdAt?: string;
  updatedAt?: string;
  expectedUpdatedAt?: string;
}

/** Araç tipi — filo kaydı. */
export type VehicleKind = 'minibus' | 'vip' | 'speedboat' | 'other';

/** Minibüs / VIP araç / tekne kaydı. */
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
  name?: string;
  phone?: string;
  role: 'driver' | 'guide' | 'both';
  licenseNo?: string;
  vehicleId?: string;
  assignedVehicle?: string;
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
  programImages?: (string | string[])[];
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
  /** Slugify edilmiş dosya adı — siteye uygulanırken kullanılır (örnek: phi-phi-koyu.webp). */
  slug?: string;
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
