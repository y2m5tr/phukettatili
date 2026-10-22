import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import BookingWorkflowModal from '../src/components/admin/BookingWorkflowModal';
import type { Booking } from '../src/data/adminInitialData';

describe('BookingWorkflowModal pipeline stepper', () => {
  const sampleBooking: Booking = {
    id: 'BK-TEST-1',
    customerName: 'Selin & Can Yılmaz',
    phone: '+905551234567',
    hotel: 'Amari Phuket',
    roomNumber: '402',
    tourTitle: 'Phi Phi & Maya Bay',
    tourDate: '2026-11-20',
    pickupTime: '07:30',
    adultCount: 2,
    childCount: 0,
    totalPriceThb: 6400,
    paidAmountThb: 2000,
    remainingAmountThb: 4400,
    status: 'confirmed',
    paymentStatus: 'partial',
    pickupStatus: 'pending',
    assignedVehicle: 'Minibüs 1',
  };

  it('renders all 5 pipeline steps without crashing', () => {
    const html = renderToString(
      React.createElement(BookingWorkflowModal, {
        isOpen: true,
        onClose: vi.fn(),
        booking: sampleBooking,
        vehicles: [{ id: 'v1', label: 'Minibüs 1' }],
        drivers: [{ id: 'd1', fullName: 'Somchai' }],
      })
    );

    expect(html).toContain('1. Rezervasyon Teyidi');
    expect(html).toContain('2. Araç &amp; Şoför Görevlendirme');
    expect(html).toContain('3. Misafire Alınış Saati Bildirimi');
    expect(html).toContain('4. Lobide Biniş / Check-in');
    expect(html).toContain('5. Ödeme &amp; Kalan Tahsilat');
    expect(html).toContain('Selin &amp; Can Yılmaz');
    expect(html).toContain('4,400');
    expect(html).toContain('THB');
  });

  it('renders null when isOpen is false', () => {
    const html = renderToString(
      React.createElement(BookingWorkflowModal, {
        isOpen: false,
        onClose: vi.fn(),
        booking: sampleBooking,
      })
    );
    expect(html).toBe('');
  });
});
