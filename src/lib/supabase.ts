import { createClient } from '@supabase/supabase-js';
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

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

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
    createdAt: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  };
}
