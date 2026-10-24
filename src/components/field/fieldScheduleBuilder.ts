import { detectHotelZone, type Booking } from '../../data/adminInitialData';
import type { FieldScheduleItem } from './fieldTypes';

export function buildScheduleItems(
  bookings: Booking[],
  selectedDate: string
): FieldScheduleItem[] {
  const items: FieldScheduleItem[] = [];

  bookings.forEach((b) => {
    if (b.tours && b.tours.length > 0) {
      b.tours.forEach((t, idx) => {
        if (t.tourDate === selectedDate) {
          items.push({
            key: `${b.id}-tour-${idx}`,
            bookingId: b.id,
            customerName: b.customerName,
            phone: b.phone,
            hotel: b.hotel,
            roomNumber: b.roomNumber,
            tourTitle: t.tourTitle || b.tourTitle,
            tourId: t.tourId || b.tourId || '',
            tourDate: t.tourDate,
            pickupTime: t.pickupTime || b.pickupTime || '07:30',
            tourIndex: idx,
            adultCount: b.adultCount,
            childCount: b.childCount,
            totalPriceThb: b.totalPriceThb,
            paidAmountThb: b.paidAmountThb,
            remainingAmountThb: b.remainingAmountThb,
            paymentStatus: b.paymentStatus,
            nationalParkFeeIncluded: t.nationalParkFeeIncluded ?? (b.nationalParkFeeIncluded ?? false),
            specialNotes: b.specialNotes,
            pickupStatus: t.pickupStatus || b.pickupStatus || 'pending',
            pickedUpAt: t.pickedUpAt || b.pickedUpAt,
            assignedVehicle: t.assignedVehicle || b.assignedVehicle || 'Atanmadı',
            assignedDriver: t.assignedDriver || b.assignedDriver,
            hotelZone: b.hotelZone || t.hotelZone || detectHotelZone(b.hotel),
            fullBooking: b,
          });
        }
      });
    } else {
      if (b.tourDate === selectedDate) {
        items.push({
          key: `${b.id}-single`,
          bookingId: b.id,
          customerName: b.customerName,
          phone: b.phone,
          hotel: b.hotel,
          roomNumber: b.roomNumber,
          tourTitle: b.tourTitle,
          tourId: b.tourId || '',
          tourDate: b.tourDate,
          pickupTime: b.pickupTime || '07:30',
          tourIndex: -1,
          adultCount: b.adultCount,
          childCount: b.childCount,
          totalPriceThb: b.totalPriceThb,
          paidAmountThb: b.paidAmountThb,
          remainingAmountThb: b.remainingAmountThb,
          paymentStatus: b.paymentStatus,
          nationalParkFeeIncluded: b.nationalParkFeeIncluded ?? false,
          specialNotes: b.specialNotes,
          pickupStatus: b.pickupStatus || 'pending',
          pickedUpAt: b.pickedUpAt,
          assignedVehicle: b.assignedVehicle || 'Atanmadı',
          assignedDriver: b.assignedDriver,
          hotelZone: b.hotelZone || detectHotelZone(b.hotel),
          fullBooking: b,
        });
      }
    }
  });

  return items.sort((a, b) => a.pickupTime.localeCompare(b.pickupTime));
}

export function filterScheduleItems(
  scheduleItems: FieldScheduleItem[],
  searchQuery: string,
  statusFilter: string,
  vehicleFilter: string
): FieldScheduleItem[] {
  return scheduleItems.filter((item) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        item.customerName.toLowerCase().includes(q) ||
        item.hotel.toLowerCase().includes(q) ||
        item.tourTitle.toLowerCase().includes(q) ||
        item.phone.includes(q) ||
        (item.assignedVehicle && item.assignedVehicle.toLowerCase().includes(q)) ||
        (item.hotelZone && item.hotelZone.toLowerCase().includes(q)) ||
        (item.roomNumber && item.roomNumber.toLowerCase().includes(q));
      if (!match) return false;
    }

    if (vehicleFilter !== 'all' && item.assignedVehicle !== vehicleFilter) {
      return false;
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'pending' && item.pickupStatus !== 'pending') return false;
      if (statusFilter === 'picked_up' && item.pickupStatus !== 'picked_up') return false;
      if (statusFilter === 'completed' && item.pickupStatus !== 'completed') return false;
      if (statusFilter === 'no_show' && item.pickupStatus !== 'no_show') return false;
      if (statusFilter === 'unpaid' && item.remainingAmountThb <= 0) return false;
    }

    return true;
  });
}

export interface ScheduleStats {
  totalTransfers: number;
  totalPax: number;
  pickedUpCount: number;
  pendingCount: number;
  totalCashToCollect: number;
}

export function computeScheduleStats(scheduleItems: FieldScheduleItem[]): ScheduleStats {
  let totalPax = 0;
  let pickedUpCount = 0;
  let pendingCount = 0;
  let totalCashToCollect = 0;

  scheduleItems.forEach((i) => {
    totalPax += i.adultCount + i.childCount;
    if (i.pickupStatus === 'picked_up' || i.pickupStatus === 'completed' || i.pickupStatus === 'on_tour') {
      pickedUpCount++;
    } else if (i.pickupStatus === 'pending') {
      pendingCount++;
    }
    totalCashToCollect += i.remainingAmountThb;
  });

  return {
    totalTransfers: scheduleItems.length,
    totalPax,
    pickedUpCount,
    pendingCount,
    totalCashToCollect,
  };
}

export function extractAvailableVehicles(scheduleItems: FieldScheduleItem[]): string[] {
  const list = new Set<string>();
  scheduleItems.forEach((i) => {
    if (i.assignedVehicle && i.assignedVehicle !== 'Atanmadı') {
      list.add(i.assignedVehicle);
    }
  });
  return Array.from(list);
}
