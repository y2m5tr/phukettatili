/**
 * Misafir bilet portalı görünümü — halka açık sayfaya inen ASGARİ veri.
 *
 * GÜVENLİK SÖZLEŞMESİ: /bilet/[code] oturum gerektirmez ve Astro, island'a
 * geçen her prop'u HTML içine JSON olarak serileştirir. Tam `Booking`
 * nesnesi geçilirse maliyet, tedarikçi, kapora, telefon, e-posta, özel
 * notlar ve YOLCU PASAPORT BİLGİLERİ sayfa kaynağında görünür.
 *
 * Bu fonksiyon YALNIZCA portalın çizdiği alanları geçirir. Alan eklemek
 * gerekiyorsa: önce GuestTicketPortal'da nereye çizileceğine bak, sonra
 * buraya ekle, sonra ALLOWED_GUEST_VIEW_KEYS listesini güncelle.
 * test/guestView.test.ts, izinli alan listesi dışına çıkan hiçbir alanın
 * geçmediğini doğrular (sızıntı regression koruması).
 */
import type { Booking } from '../../data/adminInitialData';
import type { GuestBookingView } from '../../components/guest/GuestTicketPortal';

/**
 * Misafire inmesine İZİN VERİLEN alanlar — tek gerçek kaynak.
 * Test bu listeyi serileştirilmiş çıktıyla karşılaştırır.
 */
export const ALLOWED_GUEST_VIEW_KEYS = [
  'id',
  'customerName',
  'hotel',
  'roomNumber',
  'tourTitle',
  'tourDate',
  'pickupTime',
  'adultCount',
  'childCount',
  'remainingAmountThb',
  'nationalParkFeeIncluded',
  'assignedVehicle',
  'passengerNames',
] as const satisfies readonly (keyof GuestBookingView)[];

/** Tam Booking'den misafir görünümüne dönüşüm. Null kayıt → null görünüm. */
export function toGuestBookingView(booking: Booking | null): GuestBookingView | null {
  if (!booking) return null;
  return {
    id: booking.id,
    customerName: booking.customerName,
    hotel: booking.hotel,
    roomNumber: booking.roomNumber,
    tourTitle: booking.tourTitle,
    tourDate: booking.tourDate,
    pickupTime: booking.pickupTime,
    adultCount: booking.adultCount,
    childCount: booking.childCount,
    remainingAmountThb: booking.remainingAmountThb,
    nationalParkFeeIncluded: booking.nationalParkFeeIncluded ?? false,
    assignedVehicle: booking.assignedVehicle,
    // Pasaport/uyruk/doğum tarihi GÖNDERİLMEZ — yalnızca yolcu isimleri.
    passengerNames: (booking.passengers ?? []).map((p) => p.fullName),
  };
}
