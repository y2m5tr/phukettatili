import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import AdminDashboard from '../src/components/admin/AdminDashboard';
import {
  initialBookings,
  initialVehicles,
  initialDrivers,
  type TourItem,
  type BlogItem,
  type ServiceItem,
  type FaqItem,
  type TestimonialItem,
} from '../src/data/adminInitialData';
import type { SiteSettingsState } from '../src/components/admin/SettingsTab';
import TransfersTab from '../src/components/admin/TransfersTab';

const initialTours: TourItem[] = [
  {
    id: 'phi-phi-island',
    title: 'Phi Phi, Maya Bay ve Bamboo Adası',
    category: 'island-tours',
    categoryLabel: 'Ada Turları',
    priceThb: 3200,
    duration: 'Tam Gün (08:00 - 17:00)',
    featured: true,
    active: true,
    image: 'phuket_hero.webp',
    excerpt: 'Turkuaz sular ve eşsiz koylar.',
  },
];
const initialBlogs: BlogItem[] = [];
const initialServices: ServiceItem[] = [];
const initialFaqs: FaqItem[] = [];
const initialTestimonials: TestimonialItem[] = [];
const initialSiteSettings: SiteSettingsState = {
  whatsappNumber: '66828950665',
  email: 'info@phukettatili.com',
  siteTitle: 'Phuket Tatili',
  instagramUrl: 'https://instagram.com/phukettatili',
  heroTitle: 'Phuket Tatili',
  heroSubtitle: 'En İyi Turlar',
  heroImage: 'phuket_hero.webp',
};

describe('AdminDashboard & TransfersTab deep test', () => {
  it('renders TransfersTab with various booking states', () => {
    // Test with malformed booking objects (e.g. missing adultCount, missing remainingAmountThb, missing customerName, etc.)
    const trickyBookings = [
      ...initialBookings,
      {
        id: 'TRICKY-1',
        customerName: 'Test Tricky',
        phone: '123456',
        hotel: 'Patong Beach Hotel',
        tourId: 'phi-phi',
        tourTitle: 'Phi Phi Tour',
        tourDate: '2026-11-15',
        adultCount: 2,
        childCount: 0,
        totalPriceThb: 5000,
        paidAmountThb: 0,
        status: 'confirmed' as const,
        paymentStatus: 'unpaid' as const,
        createdAt: '2026-10-16',
        remainingAmountThb: undefined as any,
        pickupTime: undefined,
        hotelZone: undefined,
        assignedVehicle: undefined,
        assignedDriver: undefined,
      },
      {
        id: 'TRICKY-2',
        customerName: 'Null Amount',
        phone: '123456',
        hotel: 'Rawai Resort',
        tourId: 'james-bond',
        tourTitle: 'James Bond Island',
        tourDate: '2026-11-15',
        adultCount: 1,
        childCount: 1,
        totalPriceThb: 4000,
        paidAmountThb: 0,
        status: 'confirmed' as const,
        paymentStatus: 'unpaid' as const,
        createdAt: '2026-10-16',
        remainingAmountThb: null as any,
        pickupTime: null as any,
      },
      {
        id: 'TRICKY-3',
        customerName: 'Tours Array',
        phone: '999999',
        hotel: 'Kata Beach Resort',
        tourId: 'city',
        tourTitle: 'Phuket City Tour',
        tourDate: '2026-11-14',
        adultCount: 2,
        childCount: 0,
        totalPriceThb: 6000,
        paidAmountThb: 6000,
        status: 'confirmed' as const,
        paymentStatus: 'paid' as const,
        createdAt: '2026-10-16',
        remainingAmountThb: 0,
        tours: [
          {
            tourId: 'city',
            tourTitle: 'Phuket City Tour',
            tourDate: '2026-11-15',
            pickupTime: undefined,
            assignedVehicle: undefined,
            assignedDriver: undefined,
            hotelZone: undefined,
            pickupStatus: undefined,
            supplier: undefined,
          },
        ],
      },
    ];

    expect(() => {
      renderToString(
        React.createElement(TransfersTab, {
          bookings: trickyBookings,
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
        })
      );
    }).not.toThrow();
  });

  it('renders AdminDashboard without throwing', () => {
    expect(() => {
      renderToString(
        React.createElement(AdminDashboard, {
          initialTours,
          initialBlogs,
          initialServices,
          initialFaqs,
          initialTestimonials,
          initialSiteSettings,
          availableImages: ['phuket_hero.webp'],
          viewerRole: 'owner',
        })
      );
    }).not.toThrow();
  });
});
