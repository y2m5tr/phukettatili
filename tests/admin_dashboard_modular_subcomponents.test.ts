import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { buildInitialBookingFormData, buildSubmittedBooking } from '../src/components/admin/dashboard/adminBookingFormUtils';
import { buildInitialTourFormData, buildSubmittedTour } from '../src/components/admin/dashboard/adminTourFormUtils';
import { DashboardCmsModalsHost } from '../src/components/admin/dashboard/DashboardCmsModalsHost';

describe('AdminDashboard modular subcomponents (500-line refactor)', () => {
  it('builds initial booking form data correctly', () => {
    const data = buildInitialBookingFormData({
      id: 'tour-1',
      title: 'Similan Adaları',
      priceThb: 3500,
      costThb: 2000,
      supplier: 'Sea Star',
    } as any);

    expect(data.tourTitle).toBe('Similan Adaları');
    expect(data.totalPriceThb).toBe(7000);
    expect(data.adultCount).toBe(2);
    expect(data.paymentStatus).toBe('partial');
  });

  it('builds submitted booking with ticket code and formatted fields', () => {
    const booking = buildSubmittedBooking(
      {
        customerName: 'Selin & Burak',
        phone: '+905321112233',
        hotel: 'Amari Phuket',
        totalPriceThb: 6000,
        paidAmountThb: 6000,
      },
      null,
      'Phi Phi Turu'
    );

    expect(booking.customerName).toBe('Selin & Burak');
    expect(booking.paymentStatus).toBe('paid');
    expect(booking.remainingAmountThb).toBe(0);
    expect(booking.ticketCode).toBeDefined();
    expect(booking.id).toMatch(/^BK-\d+$/);
  });

  it('builds initial and submitted tour data correctly', () => {
    const initial = buildInitialTourFormData(5);
    expect(initial.order).toBe(6);
    expect(initial.duration).toBe('Tam Gün');

    const submitted = buildSubmittedTour(
      {
        title: 'Özel Katamaran Sunset',
        priceThb: 15000,
        category: 'private-charters',
      },
      null,
      []
    );

    expect(submitted.title).toBe('Özel Katamaran Sunset');
    expect(submitted.priceThb).toBe(15000);
    expect(submitted.category).toBe('private-charters');
  });

  it('renders DashboardCmsModalsHost assign media modal without crashing', () => {
    const html = renderToString(
      React.createElement(DashboardCmsModalsHost, {
        isModalOpen: false,
        setIsModalOpen: vi.fn(),
        editingBooking: null,
        formData: {},
        setFormData: vi.fn(),
        onSubmitBooking: vi.fn(),
        tours: [{ id: 't-1', title: 'Phi Phi' } as any],
        vehicles: [],
        drivers: [],
        onOpenCreateTour: vi.fn(),
        isTourModalOpen: false,
        setIsTourModalOpen: vi.fn(),
        editingTour: null,
        tourFormData: {},
        setTourFormData: vi.fn(),
        onSubmitTour: vi.fn(),
        categories: [],
        inclusionLibrary: { included: [], excluded: [] },
        onRememberOption: vi.fn(),
        onForgetOption: vi.fn(),
        availableImages: [],
        isCategoryModalOpen: false,
        setIsCategoryModalOpen: vi.fn(),
        onSaveCategory: vi.fn(),
        onDeleteCategory: vi.fn(),
        isBlogModalOpen: false,
        setIsBlogModalOpen: vi.fn(),
        editingBlog: null,
        blogFormData: {},
        setBlogFormData: vi.fn(),
        onSubmitBlog: vi.fn(),
        isServiceModalOpen: false,
        setIsServiceModalOpen: vi.fn(),
        serviceFormData: {},
        setServiceFormData: vi.fn(),
        onSubmitService: vi.fn(),
        isFaqModalOpen: false,
        setIsFaqModalOpen: vi.fn(),
        editingFaq: null,
        faqFormData: {},
        setFaqFormData: vi.fn(),
        onSubmitFaq: vi.fn(),
        isTestiModalOpen: false,
        setIsTestiModalOpen: vi.fn(),
        editingTesti: null,
        testiFormData: {},
        setTestiFormData: vi.fn(),
        onSubmitTesti: vi.fn(),
        isAddMediaModalOpen: false,
        setIsAddMediaModalOpen: vi.fn(),
        mediaUploadMode: 'file',
        setMediaUploadMode: vi.fn(),
        newMediaTitle: '',
        setNewMediaTitle: vi.fn(),
        newMediaUrl: '',
        setNewMediaUrl: vi.fn(),
        onAddMediaSubmit: vi.fn(),
        selectedLightboxMedia: null,
        setSelectedLightboxMedia: vi.fn(),
        onCopyMediaUrl: vi.fn(),
        assignMediaModal: { url: '/test.jpg', title: 'Test Görsel' } as any,
        setAssignMediaModal: vi.fn(),
        onAddMediaToTourGallery: vi.fn(),
        onAssignMediaAsTourCover: vi.fn(),
      })
    );

    expect(html).toContain('Görseli Tura Bağla');
    expect(html).toContain('Test Görsel');
    expect(html).toContain('Kapak Yap');
  });
});
