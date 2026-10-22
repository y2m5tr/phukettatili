import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import OverviewTab, { type OverviewStats } from '../src/components/admin/OverviewTab';
import type { Booking } from '../src/data/adminInitialData';

describe('OverviewTab Today Operations Cockpit', () => {
  const dummyStats: OverviewStats = {
    totalBookings: 5,
    confirmedCount: 3,
    pendingCount: 2,
    totalRevenueThb: 15000,
    collectedRevenueThb: 10000,
    pendingCollectionThb: 5000,
    totalGuests: 10,
    totalCostThb: 8000,
    netProfitThb: 7000,
    profitMarginPercent: 46.6,
  };

  const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(new Date());

  const sampleBookings: Booking[] = [
    {
      id: 'BK-TODAY-1',
      customerName: 'Melis Kaya',
      phone: '+905559876543',
      hotel: 'Hilton Phuket',
      tourTitle: 'James Bond & Kano',
      tourDate: todayStr,
      pickupTime: '08:15',
      adultCount: 2,
      childCount: 0,
      totalPriceThb: 5200,
      paidAmountThb: 2000,
      remainingAmountThb: 3200,
      status: 'confirmed',
      paymentStatus: 'partial',
      pickupStatus: 'pending',
    },
    {
      id: 'BK-PAST-DUE',
      customerName: 'Ali Demir',
      phone: '+905550001122',
      hotel: 'Kata Palm',
      tourTitle: 'Phi Phi Sunset',
      tourDate: '2026-01-01',
      pickupTime: '07:30',
      adultCount: 1,
      childCount: 0,
      totalPriceThb: 3000,
      paidAmountThb: 1000,
      remainingAmountThb: 2000,
      status: 'confirmed',
      paymentStatus: 'partial',
      pickupStatus: 'completed',
    },
  ];

  it('renders today dispatch table with guest name, remaining cash and pickup status', () => {
    const html = renderToString(
      React.createElement(OverviewTab, {
        stats: dummyStats,
        bookings: sampleBookings,
        tours: [],
        bookingsCount: 2,
        toursCount: 1,
        servicesCount: 1,
        blogsCount: 1,
        faqsCount: 1,
        testimonialsCount: 1,
        setActiveTab: vi.fn(),
      })
    );

    expect(html).toContain('Günün Operasyon Kokpiti');
    expect(html).toContain('Bugünün Saha &amp; Karşılama Akışı');
    expect(html).toContain('Melis Kaya');
    expect(html).toContain('Hilton Phuket');
    expect(html).toContain('3,200');
    expect(html).toContain('THB');
  });

  it('renders sync alert banner when offline or with failed sync items', () => {
    const html = renderToString(
      React.createElement(OverviewTab, {
        stats: dummyStats,
        bookings: sampleBookings,
        tours: [],
        bookingsCount: 2,
        toursCount: 1,
        servicesCount: 1,
        blogsCount: 1,
        faqsCount: 1,
        testimonialsCount: 1,
        setActiveTab: vi.fn(),
        sync: {
          isOnline: false,
          isCloudConnected: false,
          isSyncing: false,
          pendingSyncCount: 2,
          failedSyncItems: [{ id: 'mut-1', error: '409 Conflict' }],
          lastSyncedAt: new Date(),
        },
      })
    );

    expect(html).toContain('Çevrimdışı Çalışma Modu');
    expect(html).toContain('Son Başarılı Senkron');
  });

  it('renders pending inquiries and overdue collection alert cards', () => {
    const html = renderToString(
      React.createElement(OverviewTab, {
        stats: dummyStats,
        bookings: sampleBookings,
        tours: [],
        bookingsCount: 2,
        toursCount: 1,
        servicesCount: 1,
        blogsCount: 1,
        faqsCount: 1,
        testimonialsCount: 1,
        setActiveTab: vi.fn(),
      })
    );

    expect(html).toContain('Bekleyen Rezervasyon Talebi');
    expect(html).toContain('Geciken Tahsilat Kaydı');
    expect(html).toContain('Kasaya Git');
  });
});
