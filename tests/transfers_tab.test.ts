import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import TransfersTab, { isPickupLobbyReady } from '../src/components/admin/TransfersTab';
import {
  initialBookings,
  initialVehicles,
  initialDrivers,
} from '../src/data/adminInitialData';

describe('TransfersTab Render Verification', () => {
  it('renders TransfersTab without throwing with initial data', () => {
    const html = renderToString(
      React.createElement(TransfersTab, {
        bookings: initialBookings,
        manifestDate: '2026-11-15',
        setManifestDate: () => {},
        vehicles: initialVehicles,
        drivers: initialDrivers,
        showToast: () => {},
        handleAssignVehicleToBooking: () => {},
        handleAssignDriverToBooking: () => {},
        setWhatsAppModalBooking: () => {},
        setVoucherBooking: () => {},
        onOpenPoliceManifest: () => {},
        onOpenFlightRadar: () => {},
        onOpenDriverExpense: () => {},
      })
    );
    expect(html).toContain('Transfer');
  });

  it('renders TransfersTab with empty arrays', () => {
    const html = renderToString(
      React.createElement(TransfersTab, {
        bookings: [],
        manifestDate: '2026-11-15',
        setManifestDate: () => {},
        vehicles: [],
        drivers: [],
        showToast: () => {},
        handleAssignVehicleToBooking: () => {},
        handleAssignDriverToBooking: () => {},
        setWhatsAppModalBooking: () => {},
        setVoucherBooking: () => {},
        onOpenPoliceManifest: () => {},
      })
    );
    expect(html).toContain('Transfer');
  });

  it('correctly identifies lobby ready pickup items', () => {
    const readyWithNote = {
      bookingId: 'BK-001',
      customerName: 'Ahmet',
      phone: '0555',
      hotel: 'Hilton',
      tourTitle: 'Phi Phi',
      pickupTime: '07:30',
      adultCount: 2,
      childCount: 0,
      remainingAmountThb: 0,
      hotelZone: 'Patong',
      tourIndex: 0,
      specialNotes: 'Not: [LOBİDE HAZIR: 07:15]',
    };

    expect(isPickupLobbyReady(readyWithNote)).toBe(true);

    const notReady = {
      bookingId: 'BK-002',
      customerName: 'Mehmet',
      phone: '0555',
      hotel: 'Marriott',
      tourTitle: 'James Bond',
      pickupTime: '08:00',
      adultCount: 2,
      childCount: 0,
      remainingAmountThb: 0,
      hotelZone: 'Karon',
      tourIndex: 0,
      specialNotes: 'Standart rezervasyon',
    };

    expect(isPickupLobbyReady(notReady)).toBe(false);
  });
});
