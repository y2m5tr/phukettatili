/**
 * Yönetim paneli filtre/türetim mantığı — saf fonksiyonlar.
 *
 * Bu modül AdminDashboard ve TransfersTab'daki useMemo gövdelerinin
 * test edilebilir çıkarımıdır. Aynı mantık orada çalışır; buradaki
 * kopya ile senkron kalması tests/adminFilters.test.ts tarafından
 * gözetilir (türetim mantığı değişirse test kırmızıya döner).
 */
import type { Booking, TourItem } from '../data/adminInitialData';
import { detectHotelZone } from '../data/adminInitialData';

/** BookingsTab filtresi — arama + durum + tarih. */
export function filterBookings(
  bookings: Booking[],
  searchQuery: string,
  statusFilter: string,
  dateFilter: string,
): Booking[] {
  return bookings.filter((b) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      b.customerName.toLowerCase().includes(q) ||
      b.phone.toLowerCase().includes(q) ||
      b.hotel.toLowerCase().includes(q) ||
      b.tourTitle.toLowerCase().includes(q) ||
      (b.tours || []).some((t) => t.tourTitle.toLowerCase().includes(q));

    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchDate =
      !dateFilter ||
      b.tourDate === dateFilter ||
      (b.tours || []).some((t) => t.tourDate === dateFilter);

    return matchSearch && matchStatus && matchDate;
  });
}

/** ToursTab filtresi — arama + kategori. */
export function filterTours(
  tours: TourItem[],
  searchQuery: string,
  categoryFilter: string,
): TourItem[] {
  return tours.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = categoryFilter === 'all' || t.category === categoryFilter;
    return matchSearch && matchCat;
  });
}

/** TransfersTab'ın manifest satırı. */
export interface PickupItem {
  bookingId: string;
  customerName: string;
  phone: string;
  hotel: string;
  roomNumber?: string;
  tourTitle: string;
  tourDate?: string;
  pickupTime: string;
  adultCount: number;
  childCount: number;
  remainingAmountThb: number;
  specialNotes?: string;
  supplier?: string;
  status?: string;
  assignedVehicle?: string;
  assignedDriver?: string;
  hotelZone: string;
  tourIndex: number;
  pickupStatus?: 'pending' | 'picked_up' | 'on_tour' | 'completed' | 'no_show';
  pickedUpAt?: string;
  ticketCode?: string;
}

/**
 * Günlük transfer manifesti — seçilen tarihteki tüm alınışları düzleştirir.
 *
 * Çoklu turlu kayıtlarda her tur ayrı satır olur (tourIndex ile işaretli);
 * tek turlu kayıtlar tek satırdır. İptal edilmiş kayıtlar hiç girmez.
 * Sonuç pickupTime'a göre kronolojik sıralanır.
 */
export function buildDailyPickups(
  bookings: Booking[] = [],
  manifestDate: string = ''
): PickupItem[] {
  const dailyPickups: PickupItem[] = [];
  if (!Array.isArray(bookings)) return dailyPickups;

  bookings.forEach((b) => {
    if (!b || b.status === 'cancelled') return;

    if (b.tours && Array.isArray(b.tours) && b.tours.length > 0) {
      b.tours.forEach((t, tIdx) => {
        if (t && t.tourDate === manifestDate) {
          dailyPickups.push({
            bookingId: b.id || '',
            customerName: b.customerName || '',
            phone: b.phone || '',
            hotel: b.hotel || '',
            roomNumber: b.roomNumber,
            tourTitle: t.tourTitle || b.tourTitle || '',
            pickupTime: t.pickupTime || b.pickupTime || '07:30',
            adultCount: Number(b.adultCount) || 1,
            childCount: Number(b.childCount) || 0,
            remainingAmountThb: Number(b.remainingAmountThb) || 0,
            specialNotes: b.specialNotes,
            supplier: t.supplier || b.supplier,
            status: b.status || 'confirmed',
            assignedVehicle: t.assignedVehicle || b.assignedVehicle || 'Atanmadı',
            assignedDriver: t.assignedDriver || b.assignedDriver,
            hotelZone: b.hotelZone || t.hotelZone || detectHotelZone(b.hotel || ''),
            tourIndex: tIdx,
            pickupStatus: t.pickupStatus || b.pickupStatus || 'pending',
            pickedUpAt: t.pickedUpAt || b.pickedUpAt,
            ticketCode: b.ticketCode,
          });
        }
      });
    } else if (b.tourDate === manifestDate) {
      dailyPickups.push({
        bookingId: b.id || '',
        customerName: b.customerName || '',
        phone: b.phone || '',
        hotel: b.hotel || '',
        roomNumber: b.roomNumber,
        tourTitle: b.tourTitle || '',
        pickupTime: b.pickupTime || '07:30',
        adultCount: Number(b.adultCount) || 1,
        childCount: Number(b.childCount) || 0,
        remainingAmountThb: Number(b.remainingAmountThb) || 0,
        specialNotes: b.specialNotes,
        supplier: b.supplier,
        status: b.status || 'confirmed',
        assignedVehicle: b.assignedVehicle || 'Atanmadı',
        assignedDriver: b.assignedDriver,
        hotelZone: b.hotelZone || detectHotelZone(b.hotel || ''),
        tourIndex: -1,
        pickupStatus: b.pickupStatus || 'pending',
        pickedUpAt: b.pickedUpAt,
        ticketCode: b.ticketCode,
      });
    }
  });

  dailyPickups.sort((a, b) => (a.pickupTime || '07:30').localeCompare(b.pickupTime || '07:30'));
  return dailyPickups;
}
