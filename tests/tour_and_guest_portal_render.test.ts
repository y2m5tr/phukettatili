import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import TourModal from '../src/components/admin/TourModal';
import { TourItineraryTab } from '../src/components/admin/tour-modal/TourItineraryTab';
import { TourInclusionsTab } from '../src/components/admin/tour-modal/TourInclusionsTab';
import GuestTicketPortal from '../src/components/guest/GuestTicketPortal';
import LuggageExpressModal from '../src/components/admin/LuggageExpressModal';
import PierManifestModal from '../src/components/admin/PierManifestModal';
import DietaryManifestModal from '../src/components/admin/DietaryManifestModal';
import CaptainOfflineDrawer from '../src/components/admin/CaptainOfflineDrawer';
import { buildInitialTourFormData } from '../src/components/admin/dashboard/adminTourFormUtils';
import type { GuestBookingView } from '../src/components/guest/guestPortalTypes';

/**
 * Render-smoke testleri: Riskli/büyük modalların SSR render'ı çökmemeli.
 *
 * Arka plan: `astro check` bileşeni derleme grafiğinde görmüyorsa tanımsız
 * değişkenleri yakalayamıyor (LostFoundModal örneği). Ağaç tamSuite'de
 * `environment: 'node'` koşuyor; bu bileşenler `typeof window` guard'lı
 * olduğu için SSR render'ı düz node'da güvenli.
 */

describe('TourModal render', () => {
  const baseProps = () => ({
    isOpen: true,
    onClose: vi.fn(),
    editingTour: null,
    tourFormData: buildInitialTourFormData(0),
    setTourFormData: vi.fn() as any,
    onSubmit: vi.fn(),
    categories: [],
    allTours: [],
    allImageOptions: [],
    mediaList: [],
  });

  it('yeni tur formu olarak çökmeden render eder', () => {
    const html = renderToString(React.createElement(TourModal, baseProps() as any));
    expect(html).toContain('Yeni Tur Ekle');
    expect(html).toContain('Fiyatlar, fotoğraflar, tur akışı');
  });

  it('düzenleme modunda tur başlığını gösterir', () => {
    const html = renderToString(
      React.createElement(TourModal, {
        ...baseProps(),
        editingTour: { id: 't-1', title: 'Phi Phi Adaları' } as any,
      } as any)
    );
    expect(html).toContain('Turu Düzenle: Phi Phi Adaları');
  });

  it('tüm alt sekme başlıkları görünür durumda', () => {
    const html = renderToString(React.createElement(TourModal, baseProps() as any));
    expect(html).toContain('Genel Bilgiler');
    expect(html).toContain('Fotoğraflar');
    expect(html).toContain('Tur Akışı &amp; Program');
    expect(html).toContain('Dahil &amp; Hariç Olanlar');
    expect(html).toContain('Özel SSS');
  });

  it('dahil/hariç havuzu verilmediğinde boş kütüphaneyle açılır', () => {
    const html = renderToString(
      React.createElement(TourModal, {
        ...baseProps(),
        inclusionLibrary: { included: [], excluded: [] },
        onRememberOption: vi.fn(),
        onForgetOption: vi.fn(),
      } as any)
    );
    expect(html).toContain('Yeni Tur Ekle');
  });
});

describe('TourItineraryTab render (çoklu akış fotoğrafı)', () => {
  const props = (formData: Record<string, unknown>) => ({
    tourFormData: formData as any,
    setTourFormData: vi.fn() as any,
    getImageUrl: (url?: string) => url || '',
    openPicker: vi.fn(),
    allImageOptions: [],
  });

  it('program adımlarını ve adım fotoğraf sayaçlarını basar', () => {
    const html = renderToString(
      React.createElement(
        TourItineraryTab,
        props({
          program: ['Sabah otelden alım', 'İskeleye transfer', 'Ada vardiyası'],
          programImages: [['/img/a.jpg', '/img/b.jpg'], [], '/img/c.jpg'],
        })
      )
    );
    expect(html).toContain('Tur Programı &amp; Akış Adımları (<!-- -->3<!-- -->)');
    expect(html).toContain('Sabah otelden alım');
    expect(html).toContain('Ada vardiyası');
    // Çoklu fotoğraf: ilk adımda 2 görsel sayacı görünmeli
    expect(html).toContain('Bu adımda 2 fotoğraf var');
    expect(html).toContain('Bu adımda 1 fotoğraf var');
  });

  it('eski tek-fotoğraf kaydı (string) kırık render vermez', () => {
    const html = renderToString(
      React.createElement(
        TourItineraryTab,
        props({
          program: ['İskeleye transfer'],
          programImages: ['/img/legacy.jpg'],
        })
      )
    );
    expect(html).toContain('İskeleye transfer');
    expect(html).toContain('Bu adımda 1 fotoğraf var');
  });

  it('boş programda yeni adım ekleme kontrolü görünür', () => {
    const html = renderToString(React.createElement(TourItineraryTab, props({})));
    expect(html).toContain('Tur Programı &amp; Akış Adımları (<!-- -->0<!-- -->)');
  });
});

describe('TourInclusionsTab render (dahil/hariç havuzu)', () => {
  const props = (formData: Record<string, unknown>) => ({
    tourFormData: formData as any,
    setTourFormData: vi.fn() as any,
    availableInclusions: ['Otel Transferi', 'Havuzdan Madde A'],
    availableExclusions: ['Kişisel Harcamalar'],
    inclusionLibrary: { included: ['Havuzdan Madde A'], excluded: [] },
    onRememberOption: vi.fn(),
    onForgetOption: vi.fn(),
  });

  it('mevcut dahil/hariç listesini render eder', () => {
    const html = renderToString(
      React.createElement(
        TourInclusionsTab,
        props({ included: ['Otel Transferi'], excluded: ['Kişisel Harcamalar'] })
      )
    );
    expect(html).toContain('Otel Transferi');
    expect(html).toContain('Kişisel Harcamalar');
  });

  it('boş kayıtla çökmez', () => {
    expect(() =>
      renderToString(React.createElement(TourInclusionsTab, props({})))
    ).not.toThrow();
  });
});

describe('GuestTicketPortal render', () => {
  const booking: GuestBookingView = {
    id: 'BK-TEST',
    customerName: 'Test Misafir',
    hotel: 'Katathani Resort',
    tourTitle: 'Phi Phi Adaları',
    tourDate: '2026-11-15',
    pickupTime: '08:30 - 09:00',
    adultCount: 2,
    childCount: 1,
    remainingAmountThb: 1500,
    nationalParkFeeIncluded: true,
    passengerNames: ['Test Misafir', 'İkinci Misafir'],
  };

  it('SSR render çökmez (localStorage guard)', () => {
    expect(() =>
      renderToString(React.createElement(GuestTicketPortal, { booking }))
    ).not.toThrow();
  });

  it('rezervasyon kartı bilgilerini basar', () => {
    const html = renderToString(
      React.createElement(GuestTicketPortal, { booking })
    );
    expect(html).toContain('Test Misafir');
    expect(html).toContain('Phi Phi Adaları');
    expect(html).toContain('Katathani Resort');
    // localStorage yok → SSR'da lobi hazır = false; sayı para formatlı basılmalı
    expect(html).toContain('1,500');
  });

  it('kalan bakiye sıfırsa ödeme kartı farklı basar', () => {
    const html = renderToString(
      React.createElement(GuestTicketPortal, {
        booking: { ...booking, remainingAmountThb: 0 },
      })
    );
    expect(html).toContain('Test Misafir');
  });
});

describe('Operasyon modalları render (günlük saha kullanımı)', () => {
  const booking = {
    id: 'BK-OP1',
    customerName: 'Op Misafir',
    hotel: 'Graceland Khaolak',
    tourTitle: 'Similan Adaları',
    tourDate: '2026-11-16',
    pickupTime: '06:30',
    adultCount: 2,
    childCount: 0,
    totalPriceThb: 9000,
    paidAmountThb: 9000,
    status: 'confirmed',
  } as any;

  it('LuggageExpressModal boş veriyle çökmez', () => {
    const html = renderToString(
      React.createElement(LuggageExpressModal, {
        isOpen: true,
        onClose: vi.fn(),
        showToast: vi.fn(),
      })
    );
    expect(typeof html).toBe('string');
  });

  it('PierManifestModal kayıtlı tur günüyle render eder', () => {
    const html = renderToString(
      React.createElement(PierManifestModal, {
        isOpen: true,
        onClose: vi.fn(),
        bookings: [booking],
        showToast: vi.fn(),
      })
    );
    expect(typeof html).toBe('string');
  });

  it('DietaryManifestModal boş rezervasyon listesiyle çökmez', () => {
    const html = renderToString(
      React.createElement(DietaryManifestModal, {
        isOpen: true,
        onClose: vi.fn(),
        bookings: [],
        showToast: vi.fn(),
      })
    );
    expect(typeof html).toBe('string');
  });

  it('CaptainOfflineDrawer boş alım listesiyle render eder', () => {
    const html = renderToString(
      React.createElement(CaptainOfflineDrawer, {
        isOpen: true,
        onClose: vi.fn(),
        currentDate: '2026-11-16',
        pickups: [],
        showToast: vi.fn(),
      })
    );
    expect(typeof html).toBe('string');
  });
});
