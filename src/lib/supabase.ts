/**
 * CLIENT tarafı Supabase modülü.
 *
 * GÜVENLİK MODELİ (bu proje için):
 * - Tablo verisine erişim YOK. Tüm okuma/yazma /api/bookings üzerinden,
 *   oturum cookie'si ile, sunucuda servis rolü anahtarıyla yapılır.
 * - Bu istemcinin tek görevi realtime WEBSOCKET'ine bağlanıp payload'sız
 *   "bookings değişti" sinyalini dinlemektir. RLS anon'a kapalı olduğu
 *   için anon anahtarla tablo okunamaz — anahtar yalnızca sinyal
 *   dinleyebilir.
 * - bookingToRow/rowToBooking dönüşümleri hem server (API route) hem
 *   client (localStorage cache) tarafından kullanılır; bu yüzden
 *   burada kalırlar. Veri erişimi taşınmadı, yalnızca dönüşüm.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Booking } from '../data/adminInitialData';

const supabaseUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.PUBLIC_SUPABASE_URL) ||
  'https://xiyuozntwoqibvwivkms.supabase.co';

const supabaseAnonKey =
  (typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env?.PUBLIC_SUPABASE_ANON_KEY) ||
  'sb_publishable_hG4NUSXvRtW_Xd_Yp4aWRA_EBMdmJlc';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/**
 * Sinyal dinleme istemcisi. Tablo erişimi için DEĞİL — yalnızca
 * Broadcast kanalına abone olmak için. `.from()` çağrıları RLS
 * tarafından reddedilir (bilinçli davranış).
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

/** Sunucunun yayınladığı "bookings değişti" sinyal kanalının adı. */
export const BOOKINGS_SIGNAL_CHANNEL = 'bookings-changed';

/**
 * Veri yenileme sinyaline abone olur. Sinyal geldiğinde callback
 * çağrılır; callback veriyi /api/bookings üzerinden çeker.
 * Temizleme fonksiyonu döner.
 */
export function subscribeBookingsSignal(
  onSignal: (payload?: { source?: string; rev?: number }) => void
): () => void {
  if (!supabase) return () => undefined;
  const channel = supabase
    .channel(BOOKINGS_SIGNAL_CHANNEL, { config: { broadcast: { self: false } } })
    .on('broadcast', { event: 'changed' }, (e: any) => onSignal(e?.payload))
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

// Database Schema Helper: converts local Booking interface to Supabase table row
export function bookingToRow(b: Booking) {
  return {
    id: b.id,
    customer_name: b.customerName,
    phone: b.phone,
    email: b.email || null,
    hotel: b.hotel,
    room_number: b.roomNumber || null,
    tour_id: b.tourId,
    tour_title: b.tourTitle,
    tour_date: b.tourDate,
    pickup_time: b.pickupTime || null,
    tours: b.tours || [],
    adult_count: b.adultCount,
    child_count: b.childCount,
    total_price_thb: b.totalPriceThb,
    cost_thb: b.costThb ?? 0,
    supplier: b.supplier || null,
    paid_amount_thb: b.paidAmountThb,
    remaining_amount_thb: b.remainingAmountThb,
    national_park_fee_included: b.nationalParkFeeIncluded ?? false,
    status: b.status,
    payment_status: b.paymentStatus,
    special_notes: b.specialNotes || null,
    // Operasyon alanları: araç/şoför ataması + saha pickup takibi.
    // Bunlar taşınmazsa ofisteki hat planlaması buluta yazılmaz ve
    // saha uygulaması atamayı göremez.
    pickup_status: b.pickupStatus || null,
    picked_up_at: b.pickedUpAt || null,
    assigned_vehicle: b.assignedVehicle || null,
    assigned_driver: b.assignedDriver || null,
    hotel_zone: b.hotelZone || null,
    // Yolcu pasaport bilgileri (deniz polisi / sigorta manifestosu).
    // Taşınmazsa manifestoda girilen pasaportlar buluta yazılmaz ve
    // sayfa yenilenince kaybolur.
    passengers: b.passengers || [],
    // Misafir bilet portalı kodu — id tahmin edilebilir olduğu için portala
    // ayrı rastgele kod atanır. Kolon şemada varsa yazılır, yoksa update
    // hata verir: SQL'i önce çalıştırmak gerekir.
    ticket_code: b.ticketCode || null,
    created_at: b.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

// Database Schema Helper: converts Supabase table row to local Booking interface
export function rowToBooking(r: any): Booking {
  return {
    id: r.id,
    customerName: r.customer_name,
    phone: r.phone,
    email: r.email || undefined,
    hotel: r.hotel,
    roomNumber: r.room_number || undefined,
    tourId: r.tour_id,
    tourTitle: r.tour_title,
    tourDate: r.tour_date,
    pickupTime: r.pickup_time || undefined,
    tours: Array.isArray(r.tours) ? r.tours : [],
    adultCount: Number(r.adult_count) || 1,
    childCount: Number(r.child_count) || 0,
    totalPriceThb: Number(r.total_price_thb) || 0,
    costThb: Number(r.cost_thb) || 0,
    supplier: r.supplier || undefined,
    paidAmountThb: Number(r.paid_amount_thb) || 0,
    remainingAmountThb: Number(r.remaining_amount_thb) || 0,
    nationalParkFeeIncluded: Boolean(r.national_park_fee_included),
    status: r.status,
    paymentStatus: r.payment_status,
    specialNotes: r.special_notes || undefined,
    pickupStatus: r.pickup_status || undefined,
    pickedUpAt: r.picked_up_at || undefined,
    assignedVehicle: r.assigned_vehicle || undefined,
    assignedDriver: r.assigned_driver || undefined,
    hotelZone: r.hotel_zone || undefined,
    passengers: Array.isArray(r.passengers) ? r.passengers : undefined,
    ticketCode: r.ticket_code || undefined,
    createdAt: r.created_at
      ? new Date(r.created_at).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
  };
}
