import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import CommandPaletteModal from '../src/components/admin/CommandPaletteModal';
import { safeSet, clearMemoryFallback } from '../src/lib/safeStorage';
import type { Booking } from '../src/data/adminInitialData';

describe('CommandPaletteModal recents and keyboard ergonomics', () => {
  beforeEach(() => {
    clearMemoryFallback();
  });

  const sampleBookings: Booking[] = [
    {
      id: 'BK-CP-1',
      customerName: 'Zeynep Aksoy',
      phone: '+905551112233',
      hotel: 'The Shore at Katathani',
      tourTitle: 'Racha & Coral Katamaran',
      tourDate: '2026-11-25',
      pickupTime: '08:00',
      adultCount: 2,
      childCount: 0,
      totalPriceThb: 7000,
      paidAmountThb: 7000,
      remainingAmountThb: 0,
      status: 'confirmed',
      paymentStatus: 'paid',
    },
  ];

  it('renders command palette with field workflow action and accessibility attributes', () => {
    const html = renderToString(
      React.createElement(CommandPaletteModal, {
        isOpen: true,
        onClose: vi.fn(),
        bookings: sampleBookings,
        navItems: [
          {
            id: 'overview',
            label: 'Genel Bakış',
            category: 'operations',
            description: 'Genel operasyon kokpiti',
            icon: () => null,
          },
        ],
        onSelectTab: vi.fn(),
        onOpenCreateBooking: vi.fn(),
        onOpenQrScanner: vi.fn(),
        onOpenPoliceManifest: vi.fn(),
        onSelectBooking: vi.fn(),
        onSetNavMode: vi.fn(),
        onOpenWorkflow: vi.fn(),
      })
    );

    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-label="Komut Paleti ve Hızlı Arama"');
    expect(html).toContain('Saha İş Akışı &amp; Operasyon Stepper');
    expect(html).toContain('Yeni Rezervasyon Ekle');
  });

  it('surfaces recent action badge when action id exists in storage', () => {
    safeSet('ptt_recent_palette_actions', ['act-qr-scan']);

    const html = renderToString(
      React.createElement(CommandPaletteModal, {
        isOpen: true,
        onClose: vi.fn(),
        bookings: sampleBookings,
        navItems: [],
        onSelectTab: vi.fn(),
        onOpenCreateBooking: vi.fn(),
        onOpenQrScanner: vi.fn(),
        onOpenPoliceManifest: vi.fn(),
        onSelectBooking: vi.fn(),
        onSetNavMode: vi.fn(),
      })
    );

    expect(html).toContain('🕒 Son Kullanılan');
  });

  it('renders null when closed', () => {
    const html = renderToString(
      React.createElement(CommandPaletteModal, {
        isOpen: false,
        onClose: vi.fn(),
        bookings: sampleBookings,
        navItems: [],
        onSelectTab: vi.fn(),
        onOpenCreateBooking: vi.fn(),
        onOpenQrScanner: vi.fn(),
        onOpenPoliceManifest: vi.fn(),
        onSelectBooking: vi.fn(),
        onSetNavMode: vi.fn(),
      })
    );

    expect(html).toBe('');
  });
});
