import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { BookingModalHeader } from '../src/components/admin/booking/BookingModalHeader';
import { BookingCustomerPassengers } from '../src/components/admin/booking/BookingCustomerPassengers';
import { BookingFinanceTab } from '../src/components/admin/booking/BookingFinanceTab';
import { BookingModalFooter } from '../src/components/admin/booking/BookingModalFooter';
import { parsePickupRange, addMinutesToTime } from '../src/components/admin/booking/bookingHelpers';

describe('Booking Modular Subcomponents', () => {
  it('parses pickup time range correctly', () => {
    expect(parsePickupRange('08:30 - 09:00')).toEqual({ start: '08:30', end: '09:00' });
    expect(parsePickupRange('07:15')).toEqual({ start: '07:15', end: '07:30' });
    expect(parsePickupRange('')).toEqual({ start: '07:30', end: '07:45' });
    expect(addMinutesToTime('08:45', 15)).toBe('09:00');
  });

  it('renders BookingModalHeader in SSR', () => {
    const html = renderToString(
      React.createElement(BookingModalHeader, {
        editingBooking: null,
        activeTab: 'main',
        setActiveTab: () => {},
        isQuickPasteOpen: false,
        setIsQuickPasteOpen: () => {},
        quickPasteText: '',
        setQuickPasteText: () => {},
        onApplyWhatsAppPaste: () => {},
        onClose: () => {},
        remainingBalance: 1500,
        hasB2bOrSupplier: true,
      })
    );
    expect(html).toContain('Yeni Rezervasyon Ekle');
    expect(html).toContain('Hızlı Doldur');
    expect(html).toContain('1. Rezervasyon &amp; Otel');
  });

  it('renders BookingCustomerPassengers with passenger rows', () => {
    const html = renderToString(
      React.createElement(BookingCustomerPassengers, {
        formData: { customerName: 'Ali Yılmaz', phone: '+905551112233' },
        setFormData: () => {},
        passengers: [
          { id: 'p1', fullName: 'Ayşe Yılmaz', passportNo: 'U12345', isChild: true },
        ],
        handleAddPassenger: () => {},
        handleUpdatePassenger: () => {},
        handleRemovePassenger: () => {},
        handleAutoSyncPaxCount: () => {},
      })
    );
    expect(html).toContain('Ali Yılmaz');
    expect(html).toContain('Ayşe Yılmaz');
    expect(html).toContain('Çocuk');
  });

  it('renders BookingFinanceTab with balance calculation', () => {
    const html = renderToString(
      React.createElement(BookingFinanceTab, {
        formData: { totalPriceThb: 10000, paidAmountThb: 3000 },
        setFormData: () => {},
        remainingBalance: 7000,
      })
    );
    expect(html).toContain('Tahsilat Durumu');
    expect(html).toContain('7,000');
  });

  it('renders BookingModalFooter with cancel and submit buttons', () => {
    const html = renderToString(
      React.createElement(BookingModalFooter, {
        formData: { totalPriceThb: 5000, paidAmountThb: 1000 },
        remainingBalance: 4000,
        editingBooking: null,
        onClose: () => {},
      })
    );
    expect(html).toContain('Vazgeç');
    expect(html).toContain('Rezervasyonu Kaydet');
  });
});
