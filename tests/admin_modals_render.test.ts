/**
 * Riskli admin/modal bileşenleri için render-smoke regresyon testleri.
 *
 * NEDEN VAR: LostFoundModal vakası (2026-10-24) tip kontrolünün yetmediğini
 * gösterdi — `astro check` dosyayı "temiz" saymıştı çünkü bileşen derleme
 * grafiğinde değildi; eksik tanımlı değişken (`counters`/`filteredItems`) ancak
 * panelde açılınca `ReferenceError` veriyordu. Bu dosya aynı sınıf hatayı build
 * öncesi yakalar: bileşenler gerçekçi prop'larla ÇÖKMEDEN render olmalı ve
 * kilit UI parçalarını üretmeli.
 *
 * TEKNİK NOT: `renderToString` (react-dom/server) yalnızca render fazını
 * çalıştırır; `useEffect`/`useState(() => …)` lazy initializer'ları ve async
 * çağrılar (QR üretimi, fetch, Supabase) TETİKLENMEZ. Bu bilinçli — biz
 * "render sırasında patlayan eksik tanım" sınıfını test ediyoruz, effect
 * yan etkilerini değil. Node ortamı (jsdom yok), vitest.config.ts'te sabit.
 */
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import DriverExpenseModal from '../src/components/admin/DriverExpenseModal';
import MediaTab from '../src/components/admin/MediaTab';
import BoardingPassModal from '../src/components/shared/BoardingPassModal';
import TourQuickBookingDrawer from '../src/components/tour/TourQuickBookingDrawer';
import type { Booking, DriverItem, MediaItem } from '../src/data/adminTypes';

const noop = vi.fn();

describe('DriverExpenseModal render', () => {
  const drivers: DriverItem[] = [
    { id: 'd1', fullName: 'Somchai P.', role: 'driver', active: true },
  ];

  const render = (isOpen: boolean) =>
    renderToString(
      React.createElement(DriverExpenseModal, {
        isOpen,
        onClose: noop,
        drivers,
        showToast: noop,
        onAddFinanceExpense: noop,
      })
    );

  it('kapalıyken çökmeden render eder (boş içerik)', () => {
    expect(() => render(false)).not.toThrow();
  });

  it('açıkken çökmeden render eder', () => {
    expect(() => render(true)).not.toThrow();
  });

  it('açıkken şoför seçim alanını üretir', () => {
    const html = render(true);
    // Şoför adı seçeneklerde görünmeli — eksik bir `drivers` tanımı burada patlar.
    expect(html).toContain('Somchai');
  });
});

describe('MediaTab render', () => {
  const media: MediaItem[] = [
    { id: 'm1', title: 'phi-phi.webp', url: '/assets/phi-phi.webp', type: 'system', createdAt: '2026-10-01' },
  ];

  const render = () =>
    renderToString(
      React.createElement(MediaTab, {
        mediaSearchQuery: '',
        setMediaSearchQuery: noop,
        mediaTypeFilter: 'all' as never,
        setMediaTypeFilter: noop,
        filteredMedia: media,
        getImageUrl: (img?: string) => img ?? '',
        handleFileUpload: noop,
        onOpenUrlModal: noop,
        setSelectedLightboxMedia: noop,
        setAssignMediaModal: noop,
        handleCopyMediaUrl: noop,
        handleDeleteMedia: noop,
      })
    );

  it('çökmeden render eder', () => {
    expect(() => render()).not.toThrow();
  });

  it('medya kaydını listeler', () => {
    const html = render();
    expect(html).toContain('phi-phi.webp');
  });
});

describe('BoardingPassModal render', () => {
  const booking: Booking = {
    id: 'b1',
    customerName: 'Ayşe Yılmaz',
    phone: '+905551234567',
    hotel: 'Patong Bay Hotel',
    tourTitle: 'Phi Phi Adaları Turu',
    tourDate: '2026-11-01',
    adultCount: 2,
    childCount: 0,
    totalPriceThb: 3600,
    paidAmountThb: 3600,
    remainingAmountThb: 0,
    status: 'confirmed',
    paymentStatus: 'paid',
  };

  it('booking null iken çökmeden null render eder', () => {
    const html = renderToString(
      React.createElement(BoardingPassModal, { booking: null, onClose: noop })
    );
    expect(html).toBe('');
  });

  it('gerçek bir rezervasyonla çökmeden render eder', () => {
    expect(() =>
      renderToString(
        React.createElement(BoardingPassModal, { booking, onClose: noop })
      )
    ).not.toThrow();
  });

  it('müşteri adını ve tur başlığını biniş kartına basar', () => {
    const html = renderToString(
      React.createElement(BoardingPassModal, { booking, onClose: noop })
    );
    expect(html).toContain('Ayşe Yılmaz');
    expect(html).toContain('Phi Phi Adaları Turu');
  });
});

describe('TourQuickBookingDrawer render', () => {
  it('çökmeden render eder', () => {
    expect(() =>
      renderToString(
        React.createElement(TourQuickBookingDrawer, {
          tourTitle: 'James Bond Adası',
          tourId: 't-james-bond',
          priceThb: 1800,
        })
      )
    ).not.toThrow();
  });

  it('sticky barda fiyatı ve rezervasyon tetikleyicisini gösterir', () => {
    const html = renderToString(
      React.createElement(TourQuickBookingDrawer, {
        tourTitle: 'James Bond Adası',
        tourId: 't-james-bond',
        priceThb: 1800,
      })
    );
    // Fiyat en-US binlik ayraçla basılır (fmtMoney kuralı) — çıplak toLocaleString
    // ortam locale'ine kayarsa bu assert tr-TR runner'da kırılır ve yakalanır.
    expect(html).toContain('1.800');
    expect(html).toContain('Rezervasyon');
    // Tur başlığı WhatsApp ön-dolu mesaj linkine URL-kodlu girer.
    expect(html).toContain('wa.me/66828950665');
  });
});
