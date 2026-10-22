/**
 * Operasyon & Yönetim Paneli İş Mantığı Fonksiyonları ve Etiket Sözlükleri
 */
import type {
  Booking,
  PartnerAgent,
  TourCostItem,
  PaymentMethod,
  CollectionLocation,
  ExpenseCategory,
} from './adminTypes';
import { detectHotelZone } from '../lib/publicRefs';

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

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, { label: string; icon: string }> = {
  fuel: { label: 'Minibüs & Tekne Yakıtı (Dizel)', icon: '⛽' },
  guide_wage: { label: 'Rehber & Şoför Yevmiyesi', icon: '🗣️' },
  pier_fee: { label: 'İskele / Liman / Palamar Harcı', icon: '⚓' },
  national_park: { label: 'Millî Park Toplu Gişe Ödemesi', icon: '🏞️' },
  vehicle_maintenance: { label: 'Araç / Tekne Bakım & Yıkama', icon: '🔧' },
  office_overhead: { label: 'Ofis & İletişim / Saha Gideri', icon: '🏢' },
  other: { label: 'Diğer Operasyonel Harcama', icon: '📦' },
};
