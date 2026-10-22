import { create } from 'zustand';
import type { Booking, TourItem } from '../data/adminInitialData';
import type { FailedMutation } from '../lib/offlineQueue';

export type AdminTab =
  | 'overview'
  | 'bookings'
  | 'finance'
  | 'transfers'
  | 'proposals'
  | 'partners'
  | 'settlements'
  | 'suppliers'
  | 'fleet'
  | 'tours'
  | 'homepage'
  | 'media'
  | 'services'
  | 'blogs'
  | 'faqs'
  | 'testimonials'
  | 'whatsapp'
  | 'settings'
  | 'users';

export interface AdminStoreState {
  // Navigation & View State
  activeTab: AdminTab;
  navMode: 'operations' | 'cms';
  isSidebarCollapsed: boolean;
  isMobileSidebarOpen: boolean;
  isQuickToolsDropdownOpen: boolean;

  // Cloud & Feedback State
  isCloudConnected: boolean;
  isSyncing: boolean;
  isOnline: boolean;
  pendingSyncCount: number;
  failedSyncItems: FailedMutation[];
  lastSyncedAt: Date | null;
  toastMessage: string;

  // Modal Visibility & Payloads
  isCommandPaletteOpen: boolean;
  isQrScannerOpen: boolean;
  isLostFoundOpen: boolean;
  isDietaryManifestOpen: boolean;
  isPoliceManifestOpen: boolean;
  isBulkRescheduleOpen: boolean;
  isDriverExpenseOpen: boolean;
  isGuideExpenseOpen: boolean;
  isLuggageExpressOpen: boolean;

  // Modals with Data Payloads
  voucherBooking: Booking | null;
  whatsAppModalBooking: Booking | null;
  quoteModalData: { booking?: Booking; tour?: TourItem } | null;

  cashierBooking: Booking | null;
  isFieldCashierOpen: boolean;

  flightRadarFlight: string;
  flightRadarGuest: string;
  isFlightRadarOpen: boolean;

  welcomeBoardBooking: Booking | null;
  isWelcomeBoardOpen: boolean;

  tourMediaBooking: Booking | null;
  isTourMediaOpen: boolean;

  // Actions
  setActiveTab: (tab: AdminTab) => void;
  setNavMode: (mode: 'operations' | 'cms') => void;
  toggleSidebar: () => void;
  setIsSidebarCollapsed: (v: boolean | ((prev: boolean) => boolean)) => void;
  setIsMobileSidebarOpen: (v: boolean) => void;
  setIsQuickToolsDropdownOpen: (v: boolean | ((prev: boolean) => boolean)) => void;

  showToast: (msg: string) => void;
  setToastMessage: (msg: string) => void;
  setIsCloudConnected: (v: boolean) => void;
  setIsSyncing: (v: boolean) => void;
  setIsOnline: (v: boolean) => void;
  setPendingSyncCount: (v: number | ((prev: number) => number)) => void;
  setFailedSyncItems: (items: FailedMutation[]) => void;
  setLastSyncedAt: (date: Date | null) => void;

  // Modal Controls
  setIsCommandPaletteOpen: (v: boolean | ((prev: boolean) => boolean)) => void;
  setIsQrScannerOpen: (v: boolean) => void;
  setIsLostFoundOpen: (v: boolean) => void;
  setIsDietaryManifestOpen: (v: boolean) => void;
  setIsPoliceManifestOpen: (v: boolean) => void;
  setIsBulkRescheduleOpen: (v: boolean) => void;
  setIsDriverExpenseOpen: (v: boolean) => void;
  setIsGuideExpenseOpen: (v: boolean) => void;
  setIsLuggageExpressOpen: (v: boolean) => void;

  setVoucherBooking: (b: Booking | null) => void;
  setWhatsAppModalBooking: (b: Booking | null) => void;
  setQuoteModalData: (data: { booking?: Booking; tour?: TourItem } | null) => void;

  openFieldCashier: (b: Booking | null) => void;
  closeFieldCashier: () => void;

  openFlightRadar: (flight?: string, guest?: string) => void;
  closeFlightRadar: () => void;

  openWelcomeBoard: (b: Booking | null) => void;
  closeWelcomeBoard: () => void;

  openTourMedia: (b: Booking | null) => void;
  closeTourMedia: () => void;
}

export const useAdminStore = create<AdminStoreState>((set) => ({
  activeTab: 'overview',
  navMode: 'operations',
  isSidebarCollapsed: false,
  isMobileSidebarOpen: false,
  isQuickToolsDropdownOpen: false,

  isCloudConnected: false,
  isSyncing: false,
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  pendingSyncCount: 0,
  failedSyncItems: [],
  lastSyncedAt: null,
  toastMessage: '',

  isCommandPaletteOpen: false,
  isQrScannerOpen: false,
  isLostFoundOpen: false,
  isDietaryManifestOpen: false,
  isPoliceManifestOpen: false,
  isBulkRescheduleOpen: false,
  isDriverExpenseOpen: false,
  isGuideExpenseOpen: false,
  isLuggageExpressOpen: false,

  voucherBooking: null,
  whatsAppModalBooking: null,
  quoteModalData: null,

  cashierBooking: null,
  isFieldCashierOpen: false,

  flightRadarFlight: 'TK 172',
  flightRadarGuest: '',
  isFlightRadarOpen: false,

  welcomeBoardBooking: null,
  isWelcomeBoardOpen: false,

  tourMediaBooking: null,
  isTourMediaOpen: false,

  setActiveTab: (tab) => {
    set({ activeTab: tab });
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ptt_admin_active_tab', tab);
        const url = new URL(window.location.href);
        url.searchParams.set('tab', tab);
        window.history.replaceState({}, '', url);
      } catch {}
    }
  },

  setNavMode: (navMode) => {
    set({ navMode });
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ptt_admin_nav_mode', navMode);
      } catch {}
    }
  },

  toggleSidebar: () =>
    set((state) => {
      const next = !state.isSidebarCollapsed;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('ptt_admin_sidebar_collapsed', String(next));
        } catch {}
      }
      return { isSidebarCollapsed: next };
    }),

  setIsSidebarCollapsed: (v) =>
    set((state) => {
      const next = typeof v === 'function' ? v(state.isSidebarCollapsed) : v;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('ptt_admin_sidebar_collapsed', String(next));
        } catch {}
      }
      return { isSidebarCollapsed: next };
    }),

  setIsMobileSidebarOpen: (isMobileSidebarOpen) => set({ isMobileSidebarOpen }),
  setIsQuickToolsDropdownOpen: (v) =>
    set((state) => ({
      isQuickToolsDropdownOpen:
        typeof v === 'function' ? v(state.isQuickToolsDropdownOpen) : v,
    })),

  showToast: (msg: string) => {
    set({ toastMessage: msg });
    const isError = /hata|bulut|başarılamadı|başarısız|bulunamadı|aşıyor/i.test(msg);
    setTimeout(() => {
      set((s) => (s.toastMessage === msg ? { toastMessage: '' } : {}));
    }, isError ? 8000 : 3000);
  },

  setToastMessage: (toastMessage) => set({ toastMessage }),
  setIsCloudConnected: (isCloudConnected) => set({ isCloudConnected }),
  setIsSyncing: (isSyncing) => set({ isSyncing }),
  setIsOnline: (isOnline) => set({ isOnline }),
  setPendingSyncCount: (v) =>
    set((state) => ({
      pendingSyncCount: typeof v === 'function' ? v(state.pendingSyncCount) : v,
    })),
  setFailedSyncItems: (failedSyncItems) => set({ failedSyncItems }),
  setLastSyncedAt: (lastSyncedAt) => set({ lastSyncedAt }),

  setIsCommandPaletteOpen: (v) =>
    set((state) => ({
      isCommandPaletteOpen:
        typeof v === 'function' ? v(state.isCommandPaletteOpen) : v,
    })),
  setIsQrScannerOpen: (isQrScannerOpen) => set({ isQrScannerOpen }),
  setIsLostFoundOpen: (isLostFoundOpen) => set({ isLostFoundOpen }),
  setIsDietaryManifestOpen: (isDietaryManifestOpen) => set({ isDietaryManifestOpen }),
  setIsPoliceManifestOpen: (isPoliceManifestOpen) => set({ isPoliceManifestOpen }),
  setIsBulkRescheduleOpen: (isBulkRescheduleOpen) => set({ isBulkRescheduleOpen }),
  setIsDriverExpenseOpen: (isDriverExpenseOpen) => set({ isDriverExpenseOpen }),
  setIsGuideExpenseOpen: (isGuideExpenseOpen) => set({ isGuideExpenseOpen }),
  setIsLuggageExpressOpen: (isLuggageExpressOpen) => set({ isLuggageExpressOpen }),

  setVoucherBooking: (voucherBooking) => set({ voucherBooking }),
  setWhatsAppModalBooking: (whatsAppModalBooking) => set({ whatsAppModalBooking }),
  setQuoteModalData: (quoteModalData) => set({ quoteModalData }),

  openFieldCashier: (b) => set({ cashierBooking: b, isFieldCashierOpen: true }),
  closeFieldCashier: () => set({ cashierBooking: null, isFieldCashierOpen: false }),

  openFlightRadar: (flight = 'TK 172', guest = '') =>
    set({ flightRadarFlight: flight, flightRadarGuest: guest, isFlightRadarOpen: true }),
  closeFlightRadar: () => set({ isFlightRadarOpen: false }),

  openWelcomeBoard: (b) => set({ welcomeBoardBooking: b, isWelcomeBoardOpen: true }),
  closeWelcomeBoard: () => set({ welcomeBoardBooking: null, isWelcomeBoardOpen: false }),

  openTourMedia: (b) => set({ tourMediaBooking: b, isTourMediaOpen: true }),
  closeTourMedia: () => set({ tourMediaBooking: null, isTourMediaOpen: false }),
}));
