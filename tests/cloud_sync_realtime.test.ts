import { describe, it, expect, vi } from 'vitest';
import { useAdminStore } from '../src/stores/useAdminStore';
import {
  bookingToRow,
  rowToBooking,
  subscribeBookingsSignal,
  BOOKINGS_SIGNAL_CHANNEL,
} from '../src/lib/supabase';
import type { Booking } from '../src/data/adminInitialData';

describe('Aşama 2: Cloud Sync & Realtime Signal Engine', () => {
  it('manages isSyncing, lastSyncedAt and isCloudConnected in useAdminStore', () => {
    const store = useAdminStore.getState();
    expect(store.isSyncing).toBe(false);
    expect(store.lastSyncedAt).toBeNull();

    // Toggle syncing state
    store.setIsSyncing(true);
    expect(useAdminStore.getState().isSyncing).toBe(true);

    const now = new Date();
    store.setLastSyncedAt(now);
    expect(useAdminStore.getState().lastSyncedAt).toEqual(now);

    store.setIsCloudConnected(true);
    expect(useAdminStore.getState().isCloudConnected).toBe(true);

    // Reset back
    store.setIsSyncing(false);
    expect(useAdminStore.getState().isSyncing).toBe(false);
  });

  it('preserves all operations and passport fields through bookingToRow and rowToBooking', () => {
    const originalBooking: Booking = {
      id: 'BK-TEST-SYNC',
      customerName: 'Ahmet Yılmaz',
      phone: '+905551234567',
      email: 'ahmet@example.com',
      hotel: 'Amari Phuket',
      hotelZone: 'Patong & Kalim',
      roomNumber: '402',
      tourId: 'phi-phi',
      tourTitle: 'Phi Phi Islands Speedboat',
      tourDate: '2026-11-20',
      pickupTime: '07:15',
      adultCount: 2,
      childCount: 1,
      totalPriceThb: 7500,
      costThb: 4200,
      supplier: 'Andaman Wave Master',
      paidAmountThb: 3000,
      remainingAmountThb: 4500,
      nationalParkFeeIncluded: true,
      status: 'confirmed',
      paymentStatus: 'partial',
      specialNotes: 'VIP ön koltuk talebi',
      pickupStatus: 'picked_up',
      pickedUpAt: '07:22',
      assignedVehicle: 'Minivan VIP 01',
      assignedDriver: 'Somchai (081-555-0199)',
      ticketCode: 'PT-98765',
      passengers: [
        {
          id: 'p-1',
          fullName: 'Ahmet Yılmaz',
          passportNumber: 'U12345678',
          nationality: 'TR',
          birthDate: '1988-05-12',
          gender: 'male',
        },
      ],
      tours: [
        {
          tourId: 'phi-phi',
          tourTitle: 'Phi Phi Islands Speedboat',
          tourDate: '2026-11-20',
          pickupTime: '07:15',
          priceThb: 7500,
          costThb: 4200,
          supplier: 'Andaman Wave Master',
          assignedVehicle: 'Minivan VIP 01',
          assignedDriver: 'Somchai (081-555-0199)',
          hotelZone: 'Patong & Kalim',
          pickupStatus: 'picked_up',
          pickedUpAt: '07:22',
        },
      ],
      createdAt: '2026-10-16',
    };

    const row = bookingToRow(originalBooking);
    expect(row.id).toBe('BK-TEST-SYNC');
    expect(row.customer_name).toBe('Ahmet Yılmaz');
    expect(row.hotel_zone).toBe('Patong & Kalim');
    expect(row.assigned_vehicle).toBe('Minivan VIP 01');
    expect(row.assigned_driver).toBe('Somchai (081-555-0199)');
    expect(row.pickup_status).toBe('picked_up');
    expect(row.picked_up_at).toBe('07:22');
    expect(row.ticket_code).toBe('PT-98765');
    expect(row.passengers).toHaveLength(1);
    expect(row.passengers[0].passportNumber).toBe('U12345678');

    const reconstituted = rowToBooking(row);
    expect(reconstituted.id).toBe(originalBooking.id);
    expect(reconstituted.customerName).toBe(originalBooking.customerName);
    expect(reconstituted.hotelZone).toBe(originalBooking.hotelZone);
    expect(reconstituted.assignedVehicle).toBe(originalBooking.assignedVehicle);
    expect(reconstituted.assignedDriver).toBe(originalBooking.assignedDriver);
    expect(reconstituted.pickupStatus).toBe(originalBooking.pickupStatus);
    expect(reconstituted.pickedUpAt).toBe(originalBooking.pickedUpAt);
    expect(reconstituted.ticketCode).toBe(originalBooking.ticketCode);
    expect(reconstituted.passengers?.[0].passportNumber).toBe('U12345678');
  });

  it('exposes BOOKINGS_SIGNAL_CHANNEL and returns cleanup function when subscribing', () => {
    expect(BOOKINGS_SIGNAL_CHANNEL).toBe('bookings-changed');
    const callback = vi.fn();
    const unsubscribe = subscribeBookingsSignal(callback);
    expect(typeof unsubscribe).toBe('function');
    unsubscribe();
  });
});
