import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { FieldShiftScreen } from '../src/components/field/FieldShiftScreen';
import { FieldHeader } from '../src/components/field/FieldHeader';
import { FieldCashModal } from '../src/components/field/FieldCashModal';
import { FieldBottomNav } from '../src/components/field/FieldBottomNav';
import { FieldCashTab } from '../src/components/field/FieldCashTab';
import { FieldScheduleCard } from '../src/components/field/FieldScheduleCard';
import { buildScheduleItems, computeScheduleStats } from '../src/components/field/fieldScheduleBuilder';
import { initialBookings } from '../src/data/adminInitialData';

describe('FieldApp modular subcomponents (500-line refactor)', () => {
  it('renders FieldShiftScreen with title and shift start button', () => {
    const html = renderToString(
      React.createElement(FieldShiftScreen, {
        crewName: 'Rehber Deniz',
        setCrewName: vi.fn(),
        identityError: '',
        setIdentityError: vi.fn(),
        onStartShift: vi.fn(),
        onLogout: vi.fn(),
      })
    );

    expect(html).toContain('Saha &amp; Rehber Operasyon');
    expect(html).toContain('Vardiyayı Başlat');
    expect(html).toContain('Rehber Deniz');
  });

  it('renders FieldHeader with status and date navigation chips', () => {
    const html = renderToString(
      React.createElement(FieldHeader, {
        crewName: 'Rehber Deniz',
        activeTab: 'schedule',
        isOnline: true,
        isCloudConnected: true,
        isRefreshing: false,
        selectedDate: '2026-10-24',
        setSelectedDate: vi.fn(),
        yesterdayStr: '2026-10-23',
        todayStr: '2026-10-24',
        tomorrowStr: '2026-10-25',
        onOpenQrScanner: vi.fn(),
        onRefresh: vi.fn(),
      })
    );

    expect(html).toContain('Phuket Operasyon');
    expect(html).toContain('QR Tara');
    expect(html).toContain('Dün');
    expect(html).toContain('Yarın');
  });

  it('renders FieldCashTab correctly with total amounts', () => {
    const items = buildScheduleItems(initialBookings, initialBookings[0]?.tourDate || '2026-10-24');
    const stats = computeScheduleStats(items);

    const html = renderToString(
      React.createElement(FieldCashTab, {
        selectedDate: '2026-10-24',
        scheduleItems: items,
        totalCashToCollect: stats.totalCashToCollect,
        onSendDayEndReport: vi.fn(),
      })
    );

    expect(html).toContain('Günün Kasa Durumu');
    expect(html).toContain('Kayıtlı Tahsilat');
    expect(html).toContain('Tahsilat Detayları');
  });

  it('renders FieldBottomNav with manifesto, cash, and settings navigation buttons', () => {
    const html = renderToString(
      React.createElement(FieldBottomNav, {
        activeTab: 'schedule',
        setActiveTab: vi.fn(),
        isDriverOnly: false,
      })
    );

    expect(html).toContain('Manifesto');
    expect(html).toContain('+ Satış');
    expect(html).toContain('Kasa');
    expect(html).toContain('Ekip');
  });

  it('renders FieldCashModal when item is provided', () => {
    const items = buildScheduleItems(initialBookings, initialBookings[0]?.tourDate || '2026-10-24');
    const firstItem = items[0];

    if (firstItem) {
      const html = renderToString(
        React.createElement(FieldCashModal, {
          cashModalItem: firstItem,
          collectedAmountInput: '1500',
          setCollectedAmountInput: vi.fn(),
          onClose: vi.fn(),
          onConfirm: vi.fn(),
        })
      );

      expect(html).toContain('Nakit Tahsilat');
      expect(html).toContain('Ahmet');
      expect(html).toContain('Tahsil Edildi');
    }
  });

  it('renders FieldScheduleCard correctly', () => {
    const items = buildScheduleItems(initialBookings, initialBookings[0]?.tourDate || '2026-10-24');
    const firstItem = items[0];

    if (firstItem) {
      const html = renderToString(
        React.createElement(FieldScheduleCard, {
          item: firstItem,
          isDriverOnly: false,
          onOpenCashModal: vi.fn(),
          onOpenWhatsAppModal: vi.fn(),
          onOpenBoardingPass: vi.fn(),
          onSetPickupStatus: vi.fn(),
        })
      );

      expect(html).toContain('Ahmet');
      expect(html).toContain('Harita');
      expect(html).toContain('Şablonlar');
    }
  });
});
