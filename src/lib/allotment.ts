import type { Booking, TourItem } from '../data/adminInitialData';

export interface TourOccupancy {
  tourTitle: string;
  tourDate: string;
  bookedPax: number;
  capacity: number;
  remainingSeats: number;
  occupancyPercent: number;
  isFull: boolean;
  isOverbooked: boolean;
  status: 'available' | 'filling' | 'critical' | 'full' | 'overbooked';
  statusLabel: string;
  statusColor: string;
}

/**
 * Tur tipi veya kategorisine göre varsayılan tekne / araç kapasitesi belirler
 */
export function getTourCapacity(tourTitle: string = '', tourItem?: TourItem): number {
  if (tourItem?.maxCapacity && tourItem.maxCapacity > 0) {
    return tourItem.maxCapacity;
  }

  const t = tourTitle.toLowerCase();
  const c = (tourItem?.category || '').toLowerCase();

  if (t.includes('yat') || t.includes('yacht') || c.includes('yat')) return 25;
  if (t.includes('katamaran') || t.includes('catamaran')) return 45;
  if (t.includes('atv') || t.includes('fil') || t.includes('safari') || t.includes('zipline')) return 20;
  if (t.includes('similan') || t.includes('phi phi') || t.includes('james bond') || t.includes('speedboat')) return 35;
  if (t.includes('şehir') || t.includes('özel araç') || t.includes('vip van')) return 12;

  return 35;
}

/**
 * Belirli bir tur ve tarih için doluluk oranını hesaplar
 */
export function calculateTourOccupancy(
  tourTitle: string,
  tourDate: string,
  bookings: Booking[],
  customCapacity?: number
): TourOccupancy {
  const capacity = customCapacity && customCapacity > 0 ? customCapacity : getTourCapacity(tourTitle);

  let bookedPax = 0;

  bookings.forEach((b) => {
    // İptal edilmiş rezervasyonları doluluktan düş
    if (b.status === 'cancelled' || (b as any).isCancelled) return;

    const pax = (b.adultCount || 1) + (b.childCount || 0);

    if (b.tours && b.tours.length > 0) {
      b.tours.forEach((t) => {
        if (t.tourDate === tourDate && t.tourTitle.toLowerCase().trim() === tourTitle.toLowerCase().trim()) {
          bookedPax += pax;
        }
      });
    } else {
      if (b.tourDate === tourDate && b.tourTitle.toLowerCase().trim() === tourTitle.toLowerCase().trim()) {
        bookedPax += pax;
      }
    }
  });

  const remainingSeats = capacity - bookedPax;
  const occupancyPercent = capacity > 0 ? Math.round((bookedPax / capacity) * 100) : 0;
  const isFull = remainingSeats <= 0;
  const isOverbooked = remainingSeats < 0;

  let status: TourOccupancy['status'] = 'available';
  let statusLabel = 'Müsait';
  let statusColor = 'emerald';

  if (isOverbooked) {
    status = 'overbooked';
    statusLabel = 'Overbooking!';
    statusColor = 'red';
  } else if (isFull) {
    status = 'full';
    statusLabel = 'Kapasite Doldu';
    statusColor = 'rose';
  } else if (occupancyPercent >= 80) {
    status = 'critical';
    statusLabel = 'Son Koltuklar';
    statusColor = 'amber';
  } else if (occupancyPercent >= 50) {
    status = 'filling';
    statusLabel = 'Doluyor';
    statusColor = 'sky';
  }

  return {
    tourTitle,
    tourDate,
    bookedPax,
    capacity,
    remainingSeats,
    occupancyPercent,
    isFull,
    isOverbooked,
    status,
    statusLabel,
    statusColor,
  };
}

/**
 * Yeni veya güncellenen rezervasyon için overbooking kontrolü ve uyarı mesajı üretir
 */
export function checkBookingOverbookingWarning(
  tourTitle: string,
  tourDate: string,
  paxToAdd: number,
  bookings: Booking[],
  customCapacity?: number,
  excludeBookingId?: string
): { hasWarning: boolean; message?: string; remainingSeats: number; capacity: number } {
  if (!tourTitle || !tourDate || paxToAdd <= 0) {
    return { hasWarning: false, remainingSeats: 35, capacity: 35 };
  }

  const capacity = customCapacity && customCapacity > 0 ? customCapacity : getTourCapacity(tourTitle);
  const filteredBookings = excludeBookingId
    ? bookings.filter((b) => b.id !== excludeBookingId)
    : bookings;

  const currentOccupancy = calculateTourOccupancy(tourTitle, tourDate, filteredBookings, capacity);
  const projectedTotal = currentOccupancy.bookedPax + paxToAdd;

  if (projectedTotal > capacity) {
    const excess = projectedTotal - capacity;
    return {
      hasWarning: true,
      message: `⚠️ Kontenjan Uyarısı: ${tourDate} tarihli ${tourTitle} için kalan koltuk: ${Math.max(0, currentOccupancy.remainingSeats)}. ${paxToAdd} kişi eklediğinizde kontenjan ${excess} kişi aşılacak (Overbooking riski)!`,
      remainingSeats: currentOccupancy.remainingSeats,
      capacity,
    };
  }

  return {
    hasWarning: false,
    remainingSeats: currentOccupancy.remainingSeats - paxToAdd,
    capacity,
  };
}
