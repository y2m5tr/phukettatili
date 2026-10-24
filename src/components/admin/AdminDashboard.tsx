import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles } from 'lucide-react';
import type { Booking, TourItem } from '../../data/adminInitialData';
import AdminSidebar from './AdminSidebar';
import AdminHeader, { type AdminHeaderActions } from './AdminHeader';
import AdminErrorBoundary from './AdminErrorBoundary';
import { useAdminStore } from '../../stores/useAdminStore';
import { subscribeBookingsSignal, isSupabaseConfigured } from '../../lib/supabase';
import {
  flushPendingMutations,
  getPendingMutations,
  getOfflineCache,
  enqueueMutation,
} from '../../lib/offlineQueue';
import { safeSet } from '../../lib/safeStorage';
import type { AdminTab } from './adminNav';
import {
  DEFAULT_AVAILABLE_IMAGES,
  STORAGE_KEY_BOOKINGS,
  type AdminDashboardProps,
} from './dashboard/dashboardTypes';
import { useAdminNavigation } from './dashboard/useAdminNavigation';
import { useAdminDashboardModals } from './dashboard/useAdminDashboardModals';
import { useAdminCollections } from './dashboard/useAdminCollections';
import { useAdminBookings } from './dashboard/useAdminBookings';
import { DashboardMainView } from './dashboard/DashboardMainView';
import { exportBookingsCsv, exportSiteJson } from './dashboard/adminExportUtils';
import {
  buildInitialBookingFormData,
  buildEditBookingFormData,
  buildSubmittedBooking,
} from './dashboard/adminBookingFormUtils';
import {
  buildInitialTourFormData,
  buildSubmittedTour,
} from './dashboard/adminTourFormUtils';

import { useAdminShortcuts } from './dashboard/useAdminShortcuts';

export type { AdminTab, NavCategory, NavCategoryDef, NavItem, NavSubItem } from './adminNav';

export default function AdminDashboard({
  initialTours,
  initialCategories = [],
  initialBlogs,
  initialServices,
  initialFaqs,
  initialTestimonials,
  initialSiteSettings,
  initialHomeSettings,
  availableImages = DEFAULT_AVAILABLE_IMAGES,
  viewerRole = null,
}: AdminDashboardProps) {
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    const isError = /hata|bulut|başarılamadı|başarısız|bulunamadı|aşıyor/i.test(msg);
    setTimeout(() => setToastMessage(''), isError ? 8000 : 3000);
  }, []);

  const {
    isCloudConnected,
    setIsCloudConnected,
    isSyncing,
    setIsSyncing,
    isOnline,
    setIsOnline,
    pendingSyncCount,
    setPendingSyncCount,
    failedSyncItems,
    setFailedSyncItems,
    lastSyncedAt,
    setLastSyncedAt,
  } = useAdminStore();

  const nav = useAdminNavigation({ viewerRole });
  const modals = useAdminDashboardModals();

  const coll = useAdminCollections({
    initialTours,
    initialCategories,
    initialBlogs,
    initialServices,
    initialFaqs,
    initialTestimonials,
    initialSiteSettings,
    initialHomeSettings,
    availableImages,
    showToast,
  });

  const bk = useAdminBookings({
    drivers: coll.drivers,
    showToast,
    setPendingSyncCount,
    setIsCloudConnected,
    setIsSyncing,
    setLastSyncedAt,
    setConflictBooking: modals.setConflictBooking,
  });

  useEffect(() => {
    void bk.fetchBookingsFromServer(true);
    void coll.refreshCmsFromServer();

    const handleOnline = async () => {
      setIsOnline(true);
      showToast('📶 İnternet bağlantısı sağlandı. Bekleyen çevrimdışı işlemler eşitleniyor...');
      try {
        const res = await flushPendingMutations();
        if (res.succeeded > 0) {
          showToast(`✅ ${res.succeeded} adet çevrimdışı işlem buluta aktarıldı!`);
        }
        setPendingSyncCount(res.remaining);
        setFailedSyncItems(res.items);
      } catch {
        // ignore
      }
      void bk.fetchBookingsFromServer(true);
      void coll.refreshCmsFromServer();
    };

    const handleOffline = () => {
      setIsOnline(false);
      showToast('📶 Çevrimdışı moda geçildi. İskele ve teknede yapılan tüm işlemler yerel kuyrukta saklanacaktır.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    void getPendingMutations().then((list) => {
      setPendingSyncCount(list.length);
    });

    const hasLocal = localStorage.getItem(STORAGE_KEY_BOOKINGS);
    if (!hasLocal) {
      void getOfflineCache<Booking[]>('bookings').then((cached) => {
        if (cached && Array.isArray(cached) && cached.length > 0 && !localStorage.getItem(STORAGE_KEY_BOOKINGS)) {
          bk.setBookings(cached);
          localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(cached));
        }
      });
    }

    let unsubscribeSignal: (() => void) | undefined;
    if (isSupabaseConfigured) {
      unsubscribeSignal = subscribeBookingsSignal(() => {
        void bk.fetchBookingsFromServer(true);
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (unsubscribeSignal) unsubscribeSignal();
    };
  }, []);

  useAdminShortcuts({
    activeTab: nav.activeTab,
    setActiveTab: nav.setActiveTab,
    visibleNavItems: nav.visibleNavItems,
    allowedTabs: nav.perms.allowedTabs,
    modals,
    showToast,
  });

  const headerActions: AdminHeaderActions = {
    openQrScanner: () => modals.setIsQrScannerOpen(true),
    openWelcomeBoard: () => {
      modals.setWelcomeBoardBooking(null);
      modals.setIsWelcomeBoardOpen(true);
    },
    openDriverExpense: () => modals.setIsDriverExpenseOpen(true),
    openGuideExpense: () => modals.setIsGuideExpenseOpen(true),
    openFieldCashier: () => {
      modals.setCashierBooking(null);
      modals.setIsFieldCashierOpen(true);
    },
    openPromptPayQr: () => modals.setIsPromptPayQrOpen(true),
    openFlightRadar: () => {
      modals.setFlightRadarFlight('TK 172');
      modals.setFlightRadarGuest('');
      modals.setIsFlightRadarOpen(true);
    },
    openLuggageExpress: () => modals.setIsLuggageExpressOpen(true),
    openLostFound: () => modals.setIsLostFoundOpen(true),
    openPoliceManifest: () => modals.setIsPoliceManifestOpen(true),
    openPierManifest: () => modals.setIsPierManifestOpen(true),
    openDietaryManifest: () => modals.setIsDietaryManifestOpen(true),
    openCaptainDrawer: () => modals.setIsCaptainDrawerOpen(true),
    openProposals: () => nav.setActiveTab('proposals'),
  };

  const handleLogout = async () => {
    setIsSigningOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    window.location.href = '/admin-login';
  };

  const handleOpenCreateBooking = () => {
    modals.setEditingBooking(null);
    modals.setFormData(buildInitialBookingFormData(coll.tours[0]));
    modals.setIsModalOpen(true);
  };

  const handleOpenEditBooking = (b: Booking) => {
    modals.setEditingBooking(b);
    modals.setFormData(buildEditBookingFormData(b));
    modals.setIsModalOpen(true);
  };

  const handleDeleteBooking = (id: string, name: string) => {
    if (!nav.canDeleteBookings) {
      showToast('⚠️ Kalıcı rezervasyon silme yetkisi yalnızca yöneticidedir.');
      return;
    }
    modals.requestConfirm({
      title: 'Rezervasyonu Sil',
      message: `"${name}" misafirine ait ${id} numaralı rezervasyon kaydını kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`,
      confirmText: 'Rezervasyonu Sil',
      isDestructive: true,
      onConfirm: () => {
        const prev = bk.bookings;
        bk.saveBookings(bk.bookings.filter((b) => b.id !== id));
        showToast('Rezervasyon silindi.');

        void fetch(`/api/bookings?id=${encodeURIComponent(id)}`, { method: 'DELETE' }).then(
          (res) => {
            if (!res.ok) {
              if (res.status >= 400 && res.status < 500) {
                bk.setBookings(prev);
                safeSet(STORAGE_KEY_BOOKINGS, prev);
                showToast('⚠️ Bulut silme hatası: Geri alındı.');
              } else {
                void enqueueMutation({
                  type: 'DELETE_BOOKING',
                  url: `/api/bookings?id=${encodeURIComponent(id)}`,
                  method: 'DELETE',
                  description: `${name} rezervasyon silme (${id})`,
                }).then(() => setPendingSyncCount((c) => c + 1));
                showToast('📶 Çevrimdışı silindi: Sıraya alındı.');
              }
            }
          },
          () => {
            void enqueueMutation({
              type: 'DELETE_BOOKING',
              url: `/api/bookings?id=${encodeURIComponent(id)}`,
              method: 'DELETE',
              description: `${name} rezervasyon silme (${id})`,
            }).then(() => setPendingSyncCount((c) => c + 1));
            showToast('📶 Çevrimdışı silindi: İnternet bağlandığında buluttan silinecektir.');
          }
        );
      },
    });
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    const fallbackTitle = coll.tours[0]?.title || 'Phuket Turu';
    const submitted = buildSubmittedBooking(modals.formData, modals.editingBooking, fallbackTitle);

    if (modals.editingBooking) {
      await bk.handleUpdateSingleBooking(submitted, 'Rezervasyon güncellendi!');
      modals.setIsModalOpen(false);
      return;
    }

    const prev = bk.bookings;
    bk.saveBookings([submitted, ...bk.bookings]);
    showToast(`Yeni rezervasyon eklendi — bilet kodu: ${submitted.ticketCode}`);

    void fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submitted),
    }).then(
      (res) => {
        if (!res.ok) {
          if (res.status >= 400 && res.status < 500) {
            bk.setBookings(prev);
            safeSet(STORAGE_KEY_BOOKINGS, prev);
            showToast('⚠️ Bulut kayıt hatası: Geri alındı.');
          } else {
            void enqueueMutation({
              type: 'POST_BOOKING',
              url: '/api/bookings',
              method: 'POST',
              body: submitted,
              description: `${submitted.customerName} yeni rezervasyon`,
            }).then(() => setPendingSyncCount((c) => c + 1));
            showToast('📶 Çevrimdışı kaydedildi: Sıraya alındı.');
          }
        }
      },
      () => {
        void enqueueMutation({
          type: 'POST_BOOKING',
          url: '/api/bookings',
          method: 'POST',
          body: submitted,
          description: `${submitted.customerName} yeni rezervasyon`,
        }).then(() => setPendingSyncCount((c) => c + 1));
        showToast('📶 Çevrimdışı kaydedildi: Sıraya alındı.');
      }
    );
    modals.setIsModalOpen(false);
  };

  const handleOpenCreateTour = () => {
    modals.setEditingTour(null);
    modals.setTourFormData(buildInitialTourFormData(coll.tours.length || 0));
    modals.setIsTourModalOpen(true);
  };

  const handleOpenEditTour = (t: TourItem) => {
    modals.setEditingTour(t);
    modals.setTourFormData(t);
    modals.setIsTourModalOpen(true);
  };

  const handleDeleteTour = (id: string, title: string) => {
    modals.requestConfirm({
      title: 'Turu Sil',
      message: `"${title}" turunu silmek istediğinize emin misiniz?`,
      confirmText: 'Turu Sil',
      isDestructive: true,
      onConfirm: () => {
        coll.saveTours(coll.tours.filter((t) => t.id !== id));
        showToast('Tur silindi.');
      },
    });
  };

  const handleSubmitTour = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modals.tourFormData.title) return;
    const submitted = buildSubmittedTour(modals.tourFormData, modals.editingTour, coll.categories);

    if (modals.editingTour) {
      coll.saveTours(coll.tours.map((t) => (t.id === modals.editingTour?.id ? submitted : t)));
      showToast('Tur başarıyla güncellendi!');
    } else {
      coll.saveTours([submitted, ...coll.tours]);
      showToast('Yeni tur başarıyla eklendi!');
    }
    modals.setIsTourModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex">
      <AdminSidebar
        isMobileSidebarOpen={nav.isMobileSidebarOpen}
        onMobileSidebarClose={() => nav.setIsMobileSidebarOpen(false)}
        isSidebarCollapsed={nav.isSidebarCollapsed}
        categoryFilter={nav.categoryFilter}
        onSelectCategory={nav.handleSelectCategory}
        operationNavItems={nav.operationNavItems}
        financeNavItems={nav.financeNavItems}
        cmsNavItems={nav.cmsNavItems}
        systemNavItems={nav.systemNavItems}
        activeTab={nav.activeTab}
        onTabSelect={nav.handleTabSelect}
        pendingBookingsCount={bk.pendingBookingsCount}
        bookingsCount={bk.bookings.length}
        roleBadgeLabel={nav.roleBadge.label}
        onToggleCollapse={nav.toggleSidebar}
        logoUrl={coll.siteSettings.logoUrl}
        logoText={coll.siteSettings.logoText || coll.siteSettings.siteTitle}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          activeNavItem={nav.activeNavItem}
          onMobileSidebarOpen={() => nav.setIsMobileSidebarOpen(true)}
          onOpenCommandPalette={() => modals.setIsCommandPaletteOpen(true)}
          onNewBooking={handleOpenCreateBooking}
          onLogout={handleLogout}
          isSigningOut={isSigningOut}
          canCreateBookings={nav.perms.canCreateBookings}
          sync={{
            isOnline,
            isCloudConnected,
            isSyncing,
            pendingSyncCount,
            failedSyncItems,
            lastSyncedAt,
          }}
          onManualSync={() => {
            void bk.fetchBookingsFromServer();
            void coll.refreshCmsFromServer();
          }}
          actions={headerActions}
          logoUrl={coll.siteSettings.logoUrl}
          logoText={coll.siteSettings.logoText || coll.siteSettings.siteTitle}
        />

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 md:pb-8">
          <AdminErrorBoundary
            tabName={nav.activeNavItem?.label}
            onResetToOverview={() => nav.setActiveTab('overview')}
          >
            <React.Suspense
              fallback={
                <div className="flex flex-col items-center justify-center py-24 space-y-3 text-slate-400">
                  <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-medium">Bölüm yükleniyor...</span>
                </div>
              }
            >
              <DashboardMainView
                nav={nav}
                modals={modals}
                coll={coll}
                bk={bk}
                availableImages={availableImages}
                viewerRole={viewerRole}
                showToast={showToast}
                onOpenCreateBooking={handleOpenCreateBooking}
                onOpenEditBooking={handleOpenEditBooking}
                onDeleteBooking={handleDeleteBooking}
                onSubmitBooking={handleSubmitBooking}
                onOpenCreateTour={handleOpenCreateTour}
                onOpenEditTour={handleOpenEditTour}
                onDeleteTour={handleDeleteTour}
                onSubmitTour={handleSubmitTour}
                onExportCSV={() => exportBookingsCsv(bk.bookings)}
                onExportSiteData={() => exportSiteJson(coll.tours, coll.faqs, coll.testimonials, coll.homeSettings)}
              />
            </React.Suspense>
          </AdminErrorBoundary>
        </main>
      </div>

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl bg-slate-900/95 text-white text-xs sm:text-sm font-bold shadow-2xl border border-slate-700/80 flex items-center gap-2.5 backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-brand-accent animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
