import type { Booking, BookingTourSchedule, TourItem } from '../../../data/adminInitialData';
import { detectHotelZone } from '../../../data/adminInitialData';
import { generateTicketCode } from '../../../lib/ticketCodes';

export function buildInitialBookingFormData(initialTourItem?: TourItem): Partial<Booking> {
  const initialSchedule: BookingTourSchedule[] = [
    {
      tourTitle: initialTourItem?.title || 'Phi Phi Adaları',
      tourDate: new Date().toISOString().split('T')[0],
      pickupTime: '07:30',
      priceThb: initialTourItem?.priceThb || 3200,
      costThb: initialTourItem?.costThb || 1900,
      supplier: initialTourItem?.supplier || 'Andaman Wave Master',
      nationalParkFeeIncluded: false,
    },
  ];

  return {
    customerName: '',
    phone: '',
    hotel: '',
    hotelZone: 'Patong & Kalim',
    roomNumber: '',
    tourTitle: initialTourItem?.title || 'Phi Phi Adaları',
    tourDate: new Date().toISOString().split('T')[0],
    pickupTime: '07:30',
    tours: initialSchedule,
    adultCount: 2,
    childCount: 0,
    totalPriceThb: (initialTourItem?.priceThb || 3200) * 2,
    costThb: (initialTourItem?.costThb || 1900) * 2,
    supplier: initialTourItem?.supplier || 'Andaman Wave Master',
    nationalParkFeeIncluded: false,
    paidAmountThb: 2000,
    status: 'confirmed',
    paymentStatus: 'partial',
    specialNotes: '',
  };
}

export function buildEditBookingFormData(b: Booking): Partial<Booking> {
  const schedule: BookingTourSchedule[] =
    b.tours && b.tours.length > 0
      ? b.tours
      : [
          {
            tourTitle: b.tourTitle,
            tourDate: b.tourDate,
            pickupTime: b.pickupTime || '07:30',
            priceThb: Math.round(b.totalPriceThb / (b.adultCount || 1)),
            costThb: b.costThb ? Math.round(b.costThb / (b.adultCount || 1)) : undefined,
            supplier: b.supplier,
            nationalParkFeeIncluded: b.nationalParkFeeIncluded,
          },
        ];

  return {
    ...b,
    hotelZone: b.hotelZone || detectHotelZone(b.hotel),
    tours: schedule,
  };
}

export function buildSubmittedBooking(
  formData: Partial<Booking>,
  editingBooking: Booking | null,
  fallbackTourTitle: string
): Booking {
  const total = Number(formData.totalPriceThb) || 0;
  const paid = Number(formData.paidAmountThb) || 0;
  const remaining = Math.max(0, total - paid);
  const adults = Number(formData.adultCount) || 1;

  let paymentStatus: Booking['paymentStatus'] = 'unpaid';
  if (paid >= total && total > 0) paymentStatus = 'paid';
  else if (paid > 0) paymentStatus = 'partial';

  const schedule: BookingTourSchedule[] =
    formData.tours && formData.tours.length > 0
      ? formData.tours
      : [
          {
            tourTitle: formData.tourTitle || fallbackTourTitle,
            tourDate: formData.tourDate || new Date().toISOString().split('T')[0],
            pickupTime: formData.pickupTime || '07:30',
            priceThb: total,
            costThb: formData.costThb ? Math.round(formData.costThb / adults) : 0,
            supplier: formData.supplier,
            nationalParkFeeIncluded: formData.nationalParkFeeIncluded,
          },
        ];

  const calculatedCost =
    formData.costThb !== undefined
      ? Number(formData.costThb)
      : schedule.reduce((acc, t) => acc + (t.costThb || 0), 0) * adults;

  const primaryTourTitle =
    schedule.length > 1
      ? `${schedule[0].tourTitle} + ${schedule.length - 1} Tur`
      : schedule[0].tourTitle;
  const primaryTourDate = schedule[0].tourDate;
  const primaryPickupTime = formData.pickupTime || schedule[0].pickupTime || '07:30';
  if (schedule[0]) schedule[0].pickupTime = primaryPickupTime;

  const resolvedZone =
    formData.hotelZone ||
    (formData.hotel ? detectHotelZone(formData.hotel) : 'Patong & Kalim');

  if (editingBooking) {
    return {
      ...editingBooking,
      ...formData,
      hotelZone: resolvedZone,
      tourTitle: primaryTourTitle,
      tourDate: primaryTourDate,
      pickupTime: primaryPickupTime,
      tours: schedule,
      totalPriceThb: total,
      costThb: calculatedCost,
      paidAmountThb: paid,
      remainingAmountThb: remaining,
      paymentStatus,
    } as Booking;
  }

  return {
    id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
    customerName: formData.customerName || 'İsimsiz Misafir',
    phone: formData.phone || '',
    hotel: formData.hotel || 'Belirtilmedi',
    hotelZone: resolvedZone,
    roomNumber: formData.roomNumber,
    tourId: formData.tourId || 'coklu-tur',
    tourTitle: primaryTourTitle,
    tourDate: primaryTourDate,
    pickupTime: primaryPickupTime,
    tours: schedule,
    adultCount: adults,
    childCount: Number(formData.childCount) || 0,
    totalPriceThb: total,
    costThb: calculatedCost,
    supplier: formData.supplier || schedule[0]?.supplier || 'Yerel Acente',
    paidAmountThb: paid,
    remainingAmountThb: remaining,
    nationalParkFeeIncluded: formData.nationalParkFeeIncluded ?? false,
    status: (formData.status as Booking['status']) || 'confirmed',
    paymentStatus,
    depositMethod: formData.depositMethod,
    collectionLocation: formData.collectionLocation,
    balanceCollector: formData.balanceCollector,
    agentId: formData.agentId,
    agentName: formData.agentName,
    agentCommissionThb: formData.agentCommissionThb,
    agentCommissionStatus: formData.agentCommissionStatus,
    supplierRefCode: formData.supplierRefCode,
    supplierStatus: formData.supplierStatus,
    specialNotes: formData.specialNotes,
    passengers: formData.passengers || [],
    ticketCode: generateTicketCode(),
    createdAt: new Date().toISOString().split('T')[0],
  };
}
