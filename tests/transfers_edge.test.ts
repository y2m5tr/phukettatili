import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import TransfersTab from '../src/components/admin/TransfersTab';
import { initialBookings } from '../src/data/adminInitialData';

describe('TransfersTab edge cases', () => {
  it('handles undefined or null drivers/vehicles', () => {
    expect(() => {
      renderToString(
        React.createElement(TransfersTab, {
          bookings: initialBookings,
          manifestDate: '2026-11-15',
          setManifestDate: () => {},
          vehicles: undefined as any,
          drivers: undefined as any,
          showToast: () => {},
          handleAssignVehicleToBooking: () => {},
          handleAssignDriverToBooking: () => {},
          setWhatsAppModalBooking: () => {},
          setVoucherBooking: () => {},
          onOpenPoliceManifest: () => {},
        })
      );
    }).not.toThrow();
  });
});
