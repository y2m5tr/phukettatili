import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { jsonError, jsonOk } from '../../lib/server/apiGuard';
import { checkRateLimit } from '../../lib/server/rateLimit';
import {
  getSupabaseAdmin,
  isSupabaseAdminConfigured,
  broadcastBookingsChanged,
} from '../../lib/server/supabaseAdmin';
import { bookingToRow } from '../../lib/supabase';
import {
  type Booking,
  type PartnerAgent,
  initialAgents,
  calculateAgentCommission,
  detectHotelZone,
  getRecommendedPickupTime,
} from '../../data/adminInitialData';
import { generateTicketCode } from '../../lib/ticketCodes';

export const prerender = false;

interface B2BBookingPayload {
  agentCode: string;
  customerName: string;
  phone: string;
  hotel: string;
  hotelZone?: string;
  roomNumber?: string;
  tourId?: string;
  tourTitle: string;
  tourDate: string;
  pickupTime?: string;
  adultCount: number;
  childCount?: number;
  pricePerAdultThb?: number;
  pricePerChildThb?: number;
  paymentPreference: 'agent_collected' | 'office_cash_on_pickup';
  specialNotes?: string;
}

export const POST: APIRoute = async (context) => {
  const clientIp =
    context.clientAddress ||
    (context.request.headers.get('x-forwarded-for') || '').split(',')[0].trim() ||
    'unknown';

  const limiter = await checkRateLimit('b2b-booking', clientIp, 20, 60);
  if (!limiter.allowed) {
    return jsonError(429, 'Çok fazla rezervasyon denemesi. Lütfen bir dakika sonra tekrar deneyiniz.');
  }

  let body: Partial<B2BBookingPayload>;
  try {
    body = await context.request.json();
  } catch {
    return jsonError(400, 'Geçersiz JSON verisi.');
  }

  const {
    agentCode,
    customerName,
    phone,
    hotel,
    hotelZone,
    roomNumber,
    tourId,
    tourTitle,
    tourDate,
    pickupTime,
    adultCount = 1,
    childCount = 0,
    pricePerAdultThb,
    pricePerChildThb,
    paymentPreference = 'office_cash_on_pickup',
    specialNotes = '',
  } = body;

  if (!agentCode || typeof agentCode !== 'string') {
    return jsonError(400, 'Acente kodu (agentCode) zorunludur.');
  }

  const normalizedCode = agentCode.trim().toUpperCase();
  const matchedAgent: PartnerAgent | undefined = initialAgents.find(
    (a) => a.code.toUpperCase() === normalizedCode && a.active
  );

  if (!matchedAgent) {
    return jsonError(403, 'Geçersiz veya pasif acente kodu. Lütfen yetkili acenta kodunuzu kontrol ediniz.');
  }

  // Acente bazlı hız limiti (kodun kötüye kullanımını engeller)
  const agentLimiter = await checkRateLimit(`b2b-agent:${matchedAgent.code}`, clientIp, 25, 60);
  if (!agentLimiter.allowed) {
    return jsonError(429, 'Bu acente kodu ile çok fazla istek yapıldı. Lütfen biraz bekleyin.');
  }

  if (!customerName || customerName.trim().length === 0) {
    return jsonError(422, 'Misafir adı ve soyadı zorunludur.');
  }
  if (!phone || phone.trim().length === 0) {
    return jsonError(422, 'Misafir irtibat telefonu zorunludur.');
  }
  if (!hotel || hotel.trim().length === 0) {
    return jsonError(422, 'Otel bilgisi zorunludur.');
  }
  if (!tourTitle || tourTitle.trim().length === 0) {
    return jsonError(422, 'Tur seçimi zorunludur.');
  }
  if (!tourDate || !/^\d{4}-\d{2}-\d{2}$/.test(tourDate)) {
    return jsonError(422, 'Geçerli bir tur tarihi (YYYY-AA-GG) seçilmelidir.');
  }
  if (typeof adultCount !== 'number' || adultCount < 1) {
    return jsonError(422, 'En az 1 yetişkin misafir girilmelidir.');
  }

  const adults = Math.max(1, Math.min(100, adultCount));
  const children = Math.max(0, Math.min(50, Number(childCount) || 0));

  // --- Sunucu Taraflı Fiyat Doğrulama (Finding 2 Mitigasyonu) ---
  // İstemciden gelen kontrolsüz fiyat (ör. 1 THB) kabul edilmez. Katalog fiyatı taban alınır.
  let catalogPriceAdult = 2800;
  try {
    const mdTours = await getCollection('tours');
    const matchedTour = mdTours.find(
      (t) =>
        t.id === tourId ||
        (tourTitle && t.data.title.toLowerCase().trim() === tourTitle.toLowerCase().trim())
    );
    if (matchedTour && typeof matchedTour.data.price_thb === 'number' && matchedTour.data.price_thb > 0) {
      catalogPriceAdult = matchedTour.data.price_thb;
    }
  } catch {
    // Koleksiyon okunamadıysa varsayılan 2800 THB tabanı kullanılır
  }

  const catalogPriceChild = Math.round(catalogPriceAdult * 0.7);
  const minAllowedAdultPrice = Math.max(500, Math.round(catalogPriceAdult * 0.7));
  const minAllowedChildPrice = Math.max(300, Math.round(catalogPriceChild * 0.7));

  const inputAdultPrice = Number(pricePerAdultThb);
  if (Number.isFinite(inputAdultPrice) && inputAdultPrice < minAllowedAdultPrice) {
    return jsonError(
      422,
      `Geçersiz fiyat: Yetişkin fiyatı taban fiyat olan ${minAllowedAdultPrice} THB'nin altında olamaz.`
    );
  }

  const inputChildPrice = Number(pricePerChildThb);
  if (Number.isFinite(inputChildPrice) && inputChildPrice < minAllowedChildPrice) {
    return jsonError(
      422,
      `Geçersiz fiyat: Çocuk fiyatı taban fiyat olan ${minAllowedChildPrice} THB'nin altında olamaz.`
    );
  }

  const verifiedPriceAdult =
    Number.isFinite(inputAdultPrice) && inputAdultPrice >= minAllowedAdultPrice
      ? inputAdultPrice
      : catalogPriceAdult;

  const verifiedPriceChild =
    Number.isFinite(inputChildPrice) && inputChildPrice >= minAllowedChildPrice
      ? inputChildPrice
      : catalogPriceChild;

  const calculatedTotal = adults * verifiedPriceAdult + children * verifiedPriceChild;

  const commissionThb = calculateAgentCommission(matchedAgent, calculatedTotal, adults, children);
  const detectedZone = hotelZone || detectHotelZone(hotel);
  const defaultPickup = pickupTime || getRecommendedPickupTime(detectedZone);

  const isAgentPaid = paymentPreference === 'agent_collected';
  const paidAmount = isAgentPaid ? calculatedTotal : 0;
  const remainingAmount = isAgentPaid ? 0 : calculatedTotal;
  const paymentStatus = isAgentPaid ? 'paid' : 'unpaid';

  const ticketCode = generateTicketCode();
  const nowIso = new Date().toISOString();

  const auditNotePrefix = isAgentPaid
    ? `[B2B Acente Portalı: ${matchedAgent.name} (${matchedAgent.code}) — Acente Tahsilatı / Mutabakat Bekliyor]`
    : `[B2B Acente Portalı: ${matchedAgent.name} (${matchedAgent.code}) — Ofis / Şoför Tahsilatı]`;

  const newBooking: Booking = {
    id: ticketCode,
    ticketCode,
    customerName: customerName.trim(),
    phone: phone.trim(),
    hotel: hotel.trim(),
    hotelZone: detectedZone,
    roomNumber: roomNumber ? roomNumber.trim() : undefined,
    tourId: tourId || 'tour-b2b',
    tourTitle: tourTitle.trim(),
    tourDate,
    pickupTime: defaultPickup,
    tours: [
      {
        tourId: tourId || 'tour-b2b',
        tourTitle: tourTitle.trim(),
        tourDate,
        pickupTime: defaultPickup,
        priceThb: calculatedTotal,
        pickupStatus: 'pending',
        hotelZone: detectedZone,
      },
    ],
    adultCount: adults,
    childCount: children,
    totalPriceThb: calculatedTotal,
    paidAmountThb: paidAmount,
    remainingAmountThb: remainingAmount,
    status: 'confirmed',
    pickupStatus: 'pending',
    paymentStatus,
    specialNotes: `${auditNotePrefix} ${specialNotes}`.trim(),
    agentId: matchedAgent.id,
    agentName: matchedAgent.name,
    agentCommissionThb: commissionThb,
    agentCommissionStatus: 'pending',
    createdAt: nowIso,
  };

  if (isSupabaseAdminConfigured()) {
    const db = getSupabaseAdmin();
    if (db) {
      const { error } = await db.from('bookings').upsert(bookingToRow(newBooking));
      if (error) {
        console.error('B2B Booking DB error:', error);
      } else {
        await broadcastBookingsChanged('field');
      }
    }
  }

  return jsonOk({
    ok: true,
    booking: newBooking,
    ticketUrl: `/bilet/${ticketCode}`,
    commission: {
      rate: matchedAgent.commissionRate,
      type: matchedAgent.commissionType,
      amountThb: commissionThb,
      netToPayToAgencyThb: Math.max(0, calculatedTotal - commissionThb),
    },
  });
};
