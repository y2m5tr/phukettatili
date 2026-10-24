import type { Booking, TourItem } from '../../data/adminInitialData';

export const CREW_NAME_STORAGE_KEY = 'phuket_field_crew_name';
export const LOCAL_BOOKINGS_KEY = 'phuket_bookings_cache_v1';

// Phuket (UTC+7) tarihini YYYY-MM-DD olarak alma
export function getPhuketToday(): string {
  try {
    const now = new Date();
    const phuketStr = now.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' });
    const phuketDate = new Date(phuketStr);
    const y = phuketDate.getFullYear();
    const m = String(phuketDate.getMonth() + 1).padStart(2, '0');
    const d = String(phuketDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

export function formatDateDisplay(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split('-');
    const months = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
    ];
    return `${Number(d)} ${months[Number(m) - 1]} ${y}`;
  } catch {
    return dateStr;
  }
}

export interface FieldScheduleItem {
  key: string;
  bookingId: string;
  customerName: string;
  phone: string;
  hotel: string;
  roomNumber?: string;
  tourTitle: string;
  tourId: string;
  tourDate: string;
  pickupTime: string;
  tourIndex: number;
  adultCount: number;
  childCount: number;
  totalPriceThb: number;
  paidAmountThb: number;
  remainingAmountThb: number;
  paymentStatus: 'unpaid' | 'partial' | 'paid' | 'refunded';
  nationalParkFeeIncluded: boolean;
  specialNotes?: string;
  pickupStatus: 'pending' | 'picked_up' | 'on_tour' | 'completed' | 'no_show';
  pickedUpAt?: string;
  assignedVehicle?: string;
  assignedDriver?: string;
  hotelZone?: string;
  fullBooking: Booking;
}

export interface FieldAppProps {
  initialTours?: TourItem[];
  managerPhone?: string;
  viewerRole?: 'owner' | 'manager' | 'guide' | 'driver' | null;
}
