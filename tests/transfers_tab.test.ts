import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import TransfersTab from '../src/components/admin/TransfersTab';
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
});
