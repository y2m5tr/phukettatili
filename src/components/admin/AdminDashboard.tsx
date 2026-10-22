import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Users,
  TrendingUp,
  Sparkles,
  Menu,
  Car,
  Wallet,
} from 'lucide-react';
import {
  initialBookings,
  initialVehicles,
  initialDrivers,
  initialPayments,
  initialAgents,
  initialSuppliers,
  initialTourCosts,
  type Booking,
  type BookingTourSchedule,
  type TourItem,
  type FaqItem,
  type TestimonialItem,
  type ServiceItem,
  type BlogItem,
  type MediaItem,
  type VehicleItem,
  type DriverItem,
  type PassengerItem,
  type PaymentRecord,
  type PartnerAgent,
  type SupplierItem,
  type TourCostItem,
  detectHotelZone,
} from '../../data/adminInitialData';
import AdminSidebar from './AdminSidebar';
import AdminHeader, { type AdminHeaderActions } from './AdminHeader';
import CommandPaletteModal from './CommandPaletteModal';
import BulkRescheduleModal from './BulkRescheduleModal';
import BoardingPassModal from '../shared/BoardingPassModal';
import OverviewTab from './OverviewTab';
import BookingsTab from './BookingsTab';
import TransfersTab from './TransfersTab';
import type { SiteSettingsState } from './SettingsTab';

// Dynamic code-split tabs (React.lazy) to minimize the initial admin bundle size
const FinanceTab = React.lazy(() => import('./FinanceTab'));
const FleetManager = React.lazy(() => import('./FleetManager'));
const SupplierSettlementManager = React.lazy(() => import('./SupplierSettlementManager'));
const SettingsTab = React.lazy(() => import('./SettingsTab'));
const UsersTab = React.lazy(() => import('./UsersTab'));
const WhatsAppTab = React.lazy(() => import('./WhatsAppTab'));
const TestimonialsTab = React.lazy(() => import('./TestimonialsTab'));
const FaqsTab = React.lazy(() => import('./FaqsTab'));
const BlogsTab = React.lazy(() => import('./BlogsTab'));
const ServicesTab = React.lazy(() => import('./ServicesTab'));
const MediaTab = React.lazy(() => import('./MediaTab'));
const ToursTab = React.lazy(() => import('./ToursTab'));
const HomeEditorTab = React.lazy(() => import('./HomeEditorTab'));
const PartnersTab = React.lazy(() => import('./PartnersTab'));
const SuppliersTab = React.lazy(() => import('./SuppliersTab'));
import BookingModal from './BookingModal';
import TourModal from './TourModal';
import TestimonialModal from './TestimonialModal';
import FaqModal from './FaqModal';
import ServiceModal from './ServiceModal';
import BlogModal from './BlogModal';
import { AddMediaModal, MediaLightboxModal } from './MediaModals';
import WhatsAppTemplatesModal from '../shared/WhatsAppTemplatesModal';
import MarinePoliceManifestModal from '../shared/MarinePoliceManifestModal';
import QrScannerModal from '../shared/QrScannerModal';
import LostFoundModal from './LostFoundModal';
import DietaryManifestModal from './DietaryManifestModal';
import FieldCashierModal from './FieldCashierModal';
import FlightRadarModal from './FlightRadarModal';
import DriverExpenseModal from './DriverExpenseModal';
import GuideExpenseModal from './GuideExpenseModal';
import WelcomeBoardModal from './WelcomeBoardModal';
import TourMediaModal from './TourMediaModal';
import LuggageExpressModal from './LuggageExpressModal';
import PierManifestModal from './PierManifestModal';
import SupplierDispatchModal from './SupplierDispatchModal';
import CuratedProposalModal from './CuratedProposalModal';
import CaptainOfflineDrawer from './CaptainOfflineDrawer';
import BookingWorkflowModal from './BookingWorkflowModal';
import PromptPayQrModal from '../shared/PromptPayQrModal';
import AdminErrorBoundary from './AdminErrorBoundary';
import {
  loadCmsCollections,
  saveCmsCollection,
  writeLocalCollection,
  type CmsCollectionKey,
} from '../../lib/cmsSync';
import { filterBookings, filterTours, buildDailyPickups } from '../../lib/adminFilters';
import {
  isSupabaseConfigured,
  subscribeBookingsSignal,
} from '../../lib/supabase';
import { generateTicketCode } from '../../lib/ticketCodes';
import { useAdminStore } from '../../stores/useAdminStore';
import { getRolePermissions, getRoleBadge } from '../../lib/rbac';
import {
  enqueueMutation,
  submitMutation,
  getPendingMutations,
  flushPendingMutations,
  setOfflineCache,
  getOfflineCache,
} from '../../lib/offlineQueue';
import { safeGetRaw, safeSetRaw } from '../../lib/safeStorage';
import {
  NAV_ITEMS,
  type AdminTab,
  type NavCategory,
  type NavItem,
  type NavSubItem,
} from './adminNav';
import {
  UPLOAD_MAX_MB,
  slugifyFileName,
  processImageFile,
  uploadToStorage,
} from '../../lib/imageUpload';
import { sendTransferPushNotification } from '../../lib/pwaNotifications';

// Geriye dönük uyumluluk: CommandPaletteModal ve OverviewTab bu tipleri
// AdminDashboard üzerinden import ediyor.
export type { AdminTab, NavCategory, NavCategoryDef, NavItem, NavSubItem } from './adminNav';

const STORAGE_KEY_BOOKINGS = 'phuket_tatili_crm_bookings_v2';
const STORAGE_KEY_TOURS = 'phuket_tatili_crm_tours_v2';
const STORAGE_KEY_BLOGS = 'phuket_tatili_crm_blogs_v2';
const STORAGE_KEY_SERVICES = 'phuket_tatili_crm_services_v2';
const STORAGE_KEY_FAQS = 'phuket_tatili_crm_faqs_v2';
const STORAGE_KEY_TESTIMONIALS = 'phuket_tatili_crm_testimonials_v2';
const STORAGE_KEY_SITE = 'phuket_tatili_crm_site_settings_v2';
const STORAGE_KEY_MEDIA = 'phuket_tatili_crm_media_v2';
const STORAGE_KEY_VEHICLES = 'phuket_tatili_crm_vehicles_v1';
const STORAGE_KEY_DRIVERS = 'phuket_tatili_crm_drivers_v1';
const STORAGE_KEY_PAYMENTS = 'phuket_tatili_crm_payments_v1';
const STORAGE_KEY_AGENTS = 'phuket_tatili_crm_agents_v1';
const STORAGE_KEY_SUPPLIERS = 'phuket_tatili_crm_suppliers_v1';
const STORAGE_KEY_TOUR_COSTS = 'phuket_tatili_crm_tour_costs_v1';
const STORAGE_KEY_HOME_SETTINGS = 'phuket_tatili_crm_home_settings_v1';

interface AdminDashboardProps {
  initialTours: TourItem[];
  initialBlogs: BlogItem[];
  initialServices: ServiceItem[];
  initialFaqs: FaqItem[];
  initialTestimonials: TestimonialItem[];
  initialSiteSettings: SiteSettingsState;
  initialHomeSettings?: any;
  availableImages?: string[];
  /** Giriş yapan üyenin rolü (üyelik sistemi) — null: eski şifre girişi. */
  viewerRole?: 'owner' | 'manager' | 'guide' | 'driver' | null;
}

// Panelin görsel seçiminde sunacağı varsayılan envanter (prop gelmezse)
const DEFAULT_AVAILABLE_IMAGES = [
  'phuket_hero.webp',
  'phuket_yacht.webp',
  'pileh.webp',
  'beach.webp',
  'beachclub.webp',
  'couple.webp',
  'family.webp',
  'longtail.webp',
  'railay.webp',
  'bay.webp',
  'elephant.webp',
  'underwater.webp',
  'culture.webp',
  'food.webp',
  'phuket_transfer.webp',
  'phuket_culture.webp',
  'yacht.webp',
];

export default function AdminDashboard({
  initialTours,
  initialBlogs,
  initialServices,
  initialFaqs,
  initialTestimonials,
  initialSiteSettings,
  initialHomeSettings,
  availableImages = DEFAULT_AVAILABLE_IMAGES,
  viewerRole = null,
}: AdminDashboardProps) {
  // Kimlik doğrulama sunucu tarafında yapılır (src/middleware.ts).
  // Bu bileşen yalnızca yetkili isteklerde render edildiği için
  // client'ta şifre tutulmaz; çıkış da sunucuya bırakılır.
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);

  // Rol Bazlı Yetki Matrisi (RBAC)
  const perms = useMemo(() => getRolePermissions(viewerRole), [viewerRole]);
  const roleBadge = useMemo(() => getRoleBadge(viewerRole), [viewerRole]);

  const visibleNavItems = useMemo(
    () => NAV_ITEMS.filter((i) => perms.allowedTabs.includes(i.id)),
    [perms],
  );
  const canDeleteBookings = perms.canDeleteBookings;

  // Active Tab — izinli sekmelere göre filtrelenir; yetkisiz sekmeye düşmez.
  // URL'de ?tab=... varsa ve role izinliyse o gelir, yoksa rolün varsayılan sekmesi (örn. şoför için 'transfers').
  const [activeTab, setActiveTabState] = useState<AdminTab>(() => {
    if (typeof window !== 'undefined') {
      try {
        const isAllowedTab = (t: string | null): t is AdminTab =>
          Boolean(t && perms.allowedTabs.includes(t as AdminTab));
        const urlTab = new URL(window.location.href).searchParams.get('tab');
        if (isAllowedTab(urlTab)) return urlTab;
        const saved = safeGetRaw('ptt_admin_active_tab');
        if (isAllowedTab(saved)) return saved;
      } catch { /* gizli mod / kota: sessizce varsayılana düş */ }
    }
    return perms.defaultTab;
  });
  const setActiveTab = (tab: AdminTab) => {
    setActiveTabState(tab);
    // URL'yi de senkronla — geri/ileri ve link paylaşımı çalışsın.
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.replaceState({}, '', url);
    } catch { /* yok say */ }
  };
  useEffect(() => {
    safeSetRaw('ptt_admin_active_tab', activeTab);
  }, [activeTab]);

  // Kenar Çubuğu (Sidebar) kontrolü — kullanıcı tercihi localStorage'da saklanır
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return safeGetRaw('ptt_admin_sidebar_collapsed') === 'true';
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      safeSetRaw('ptt_admin_sidebar_collapsed', String(next));
      return next;
    });
  };

  // ⚡ Kategori Filtresi: 'all' | 'operations' | 'finance' | 'content' | 'system'
  const [categoryFilter, setCategoryFilter] = useState<NavCategory>(() => {
    const saved = safeGetRaw('ptt_admin_nav_category');
    if (saved && ['all', 'operations', 'finance', 'content', 'system'].includes(saved)) {
      return saved as NavCategory;
    }
    return 'operations';
  });

  /** Sidebar'daki masa switcher'ı — state'i günceller ve tercihi kalıcılaştırır. */
  const handleSelectCategory = (cat: NavCategory) => {
    setCategoryFilter(cat);
    safeSetRaw('ptt_admin_nav_category', cat);
  };

  /** Header'daki ⚡ Hızlı Araçlar menüsünün açtığı masalar — modal state'leri burada kalır. */
  const headerActions: AdminHeaderActions = {
    openQrScanner: () => setIsQrScannerOpen(true),
    openWelcomeBoard: () => {
      setWelcomeBoardBooking(null);
      setIsWelcomeBoardOpen(true);
    },
    openDriverExpense: () => setIsDriverExpenseOpen(true),
    openGuideExpense: () => setIsGuideExpenseOpen(true),
    openFieldCashier: () => {
      setCashierBooking(null);
      setIsFieldCashierOpen(true);
    },
    openPromptPayQr: () => setIsPromptPayQrOpen(true),
    openFlightRadar: () => {
      setFlightRadarFlight('TK 172');
      setFlightRadarGuest('');
      setIsFlightRadarOpen(true);
    },
    openLuggageExpress: () => setIsLuggageExpressOpen(true),
    openLostFound: () => setIsLostFoundOpen(true),
    openPoliceManifest: () => setIsPoliceManifestOpen(true),
    openPierManifest: () => setIsPierManifestOpen(true),
    openDietaryManifest: () => setIsDietaryManifestOpen(true),
    openCaptainDrawer: () => setIsCaptainDrawerOpen(true),
    openProposals: () => setActiveTab('proposals'),
  };

  // Spotlight / Hızlı Komut Paleti Modalı (Cmd+K)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleTabSelect = (tabId: AdminTab) => {
    setActiveTab(tabId);
    const item = NAV_ITEMS.find((i) => i.id === tabId);
    if (item && categoryFilter !== 'all' && categoryFilter !== item.category) {
      setCategoryFilter(item.category);
      try {
        localStorage.setItem('ptt_admin_nav_category', item.category);
      } catch { /* yok say */ }
    }
    setIsMobileSidebarOpen(false);
  };

  const _handleSubItemClick = (subItem: NavSubItem, parentTab: AdminTab) => {
    if (activeTab !== parentTab && perms.allowedTabs.includes(parentTab)) {
      setActiveTab(parentTab);
    }
    if (subItem.actionKey) {
      switch (subItem.actionKey) {
        case 'create_booking':
          handleOpenCreateBooking();
          break;
        case 'open_qr_scanner':
          setIsQrScannerOpen(true);
          break;
        case 'open_welcome_board':
          setWelcomeBoardBooking(null);
          setIsWelcomeBoardOpen(true);
          break;
        case 'open_flight_radar':
          setFlightRadarFlight('TK 172');
          setFlightRadarGuest('');
          setIsFlightRadarOpen(true);
          break;
        case 'open_luggage_express':
          setIsLuggageExpressOpen(true);
          break;
        case 'open_pier_manifest':
          setIsPierManifestOpen(true);
          break;
        case 'open_marine_police':
          setIsPoliceManifestOpen(true);
          break;
        case 'open_dietary_manifest':
          setIsDietaryManifestOpen(true);
          break;
        case 'open_lost_found':
          setIsLostFoundOpen(true);
          break;
        case 'open_captain_vault':
          setIsCaptainDrawerOpen(true);
          break;
        case 'open_driver_expense':
          setIsDriverExpenseOpen(true);
          break;
        case 'open_guide_expense':
          setIsGuideExpenseOpen(true);
          break;
        case 'open_field_cashier':
          setCashierBooking(null);
          setIsFieldCashierOpen(true);
          break;
        case 'open_promptpay':
          setIsPromptPayQrOpen(true);
          break;
        case 'open_proposal_print':
          setActiveTab('proposals');
          setTimeout(() => window.print(), 200);
          break;
        case 'open_proposal_whatsapp':
          setActiveTab('proposals');
          break;
        case 'create_tour':
          handleOpenCreateTour();
          break;
        case 'create_blog':
          handleOpenCreateBlog();
          break;
        case 'upload_media':
          setIsAddMediaModalOpen(true);
          break;
        default:
          setActiveTab(parentTab);
          break;
      }
    }
    setIsMobileSidebarOpen(false);
  };

  // Toast Feedback — hata/başarı ayrımı: hatalar 8 sn kalır (kullanıcı
  // fark etmeden kaybolmasın — örn. buluta kaydedilemedi uyarısı),
  // bilgiler 3 sn.
  const [toastMessage, setToastMessage] = useState<string>('');
  const showToast = (msg: string) => {
    setToastMessage(msg);
    const isError = /hata|bulut|başarılamadı|başarısız|bulunamadı|aşıyor/i.test(msg);
    setTimeout(() => setToastMessage(''), isError ? 8000 : 3000);
  };

  // Cloud Database Sync State (Zustand Store)
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
  const hasSyncedOnce = useRef<boolean>(false);

  // 1. Bookings State
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [formData, setFormData] = useState<Partial<Booking>>({});

  // Voucher / Ticket Modal State
  const [voucherBooking, setVoucherBooking] = useState<Booking | null>(null);

  // Kişiye Özel Logolu PDF Tur Teklifi & Tatil Programı Modalı
  const [curatedProposalData, setCuratedProposalData] = useState<{
    customerName?: string;
    hotel?: string;
    zone?: string;
    phone?: string;
    proposalType?: 'package_multiday' | 'single_tour';
    tourTitle?: string;
    tourDate?: string;
    adultCount?: number;
    childCount?: number;
  } | null>(null);

  // Andaman Denizi Çevrimdışı Kaptan Kasası & Acil Durum Rehberi (PWA)
  const [isCaptainDrawerOpen, setIsCaptainDrawerOpen] = useState<boolean>(false);

  // WhatsApp Automation Templates Modal
  const [whatsAppModalBooking, setWhatsAppModalBooking] = useState<Booking | null>(null);

  // Saha İş Akışı & 5 Adımlı Operasyon Stepper Modalı (Item 2)
  const [workflowBooking, setWorkflowBooking] = useState<Booking | null>(null);

  // Marine Police Manifest Modal
  const [isPoliceManifestOpen, setIsPoliceManifestOpen] = useState<boolean>(false);

  // QR Ticket Scanner Modal (Saha Bilet Check-in)
  const [isQrScannerOpen, setIsQrScannerOpen] = useState<boolean>(false);

  // Hava Muhalefeti & Toplu Tur Erteleme Modalı
  const [isBulkRescheduleOpen, setIsBulkRescheduleOpen] = useState<boolean>(false);

  // Kayıp Eşya Masası Modalı
  const [isLostFoundOpen, setIsLostFoundOpen] = useState<boolean>(false);

  // Misafir Diyet & Medikal Emniyet Manifestosu Modalı
  const [isDietaryManifestOpen, setIsDietaryManifestOpen] = useState<boolean>(false);

  // Saha Döviz & Para Üstü Kasa Hesaplayıcı Modalı
  const [isFieldCashierOpen, setIsFieldCashierOpen] = useState<boolean>(false);
  const [cashierBooking, setCashierBooking] = useState<Booking | null>(null);

  // Havalimanı Canlı Uçuş Radarı Modalı
  const [isFlightRadarOpen, setIsFlightRadarOpen] = useState<boolean>(false);
  const [flightRadarFlight, setFlightRadarFlight] = useState<string>('TK 172');
  const [flightRadarGuest, setFlightRadarGuest] = useState<string>('');

  // Şoför Saha Yakıt, Otopark & Harç Masraf Masası Modalı
  const [isDriverExpenseOpen, setIsDriverExpenseOpen] = useState<boolean>(false);

  // Rehber Saha Masraf (Taksi, Yemek, Karşılama vb.) Masası Modalı
  const [isGuideExpenseOpen, setIsGuideExpenseOpen] = useState<boolean>(false);

  // VIP Karşılama Tabela Stüdyosu Modalı
  const [isWelcomeBoardOpen, setIsWelcomeBoardOpen] = useState<boolean>(false);
  const [welcomeBoardBooking, setWelcomeBoardBooking] = useState<Booking | null>(null);

  // Misafir Tur Fotoğraf & Video Teslim Kasası Modalı
  const [isTourMediaOpen, setIsTourMediaOpen] = useState<boolean>(false);
  const [tourMediaBooking, setTourMediaBooking] = useState<Booking | null>(null);

  // Oteller Arası Bagaj Transfer Masası Modalı
  const [isLuggageExpressOpen, setIsLuggageExpressOpen] = useState<boolean>(false);

  // İskele & Kaptan Manifestosu Modalı
  const [isPierManifestOpen, setIsPierManifestOpen] = useState<boolean>(false);

  // Tedarikçi WhatsApp Sipariş Modalı (Auto-Dispatch)
  const [isSupplierDispatchOpen, setIsSupplierDispatchOpen] = useState<boolean>(false);
  const [supplierDispatchBooking, setSupplierDispatchBooking] = useState<Booking | null>(null);

  // PromptPay Canlı QR Modalı
  const [isPromptPayQrOpen, setIsPromptPayQrOpen] = useState<boolean>(false);
  const [promptPayQrBooking, setPromptPayQrBooking] = useState<Booking | null>(null);

  const handleUpdateSupplierStatus = (
    bookingId: string,
    supplierStatus: 'pending' | 'confirmed' | 'cancelled',
    supplierRefCode?: string
  ) => {
    const updated = bookings.map((b) =>
      b.id === bookingId
        ? {
            ...b,
            supplierStatus,
            ...(supplierRefCode ? { supplierRefCode } : {}),
          }
        : b
    );
    saveBookings(updated);
  };

  // Hızlı Saha & Operasyon Araçları Açılır Menüsü (Mobil / Tablet)
  const [_isQuickToolsDropdownOpen, _setIsQuickToolsDropdownOpen] = useState<boolean>(false);

  const handleBulkReschedule = async (
    bookingIds: string[],
    newDate: string,
    reason: string
  ) => {
    const updated = bookings.map((b) => {
      if (!bookingIds.includes(b.id)) return b;
      const nextTours = b.tours?.map((t) => ({ ...t, tourDate: newDate })) || [];
      return {
        ...b,
        tourDate: newDate,
        tours: nextTours,
        specialNotes: b.specialNotes
          ? `${b.specialNotes} | Erteleme: ${reason}`
          : `Erteleme: ${reason}`,
      };
    });

    setBookings(updated);
    try {
      localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(updated));
    } catch { /* ignore */ }

    // Bulut yazımı
    for (const id of bookingIds) {
      const found = updated.find((b) => b.id === id);
      if (found) {
        void fetch('/api/bookings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(found),
        });
      }
    }
    showToast(`🌊 ${bookingIds.length} rezervasyon ${newDate} tarihine ertelendi.`);
  };

  // Yolcu pasaport bilgilerini günceller (deniz polisi / sigorta manifestosu).
  // localStorage + Supabase'e yazılır: sahadaki rehber manifestoyu teknede
  // çıkardığı için bu verinin buluta gitmesi şart.
  const handleUpdateBookingPassengers = async (
    bookingId: string,
    passengers: PassengerItem[]
  ) => {
    const target = bookings.find((b) => b.id === bookingId);
    if (!target) return;

    const full: Booking = { ...target, passengers };
    const updated = bookings.map((b) => (b.id === bookingId ? full : b));

    setBookings(updated);
    localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(updated));

    // Bulut yazımı /api/bookings üzerinden (oturum cookie'si ile).
    // Sunucu servis rolüyle yazar ve sinyal yayınlar.
    try {
      const res = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(full),
      });
      if (!res.ok) {
        showToast('⚠️ Kaydedildi ama buluta yazılamadı.');
        return;
      }
    } catch {
      showToast('⚠️ Kaydedildi ama buluta yazılamadı.');
      return;
    }

    showToast('✅ Yolcu pasaport bilgileri kaydedildi.');
  };

  // Driver Manifest & Operations State
  const [manifestDate, setManifestDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // 1.5 Fleet & Crew State (araç filosu + şoför/rehber kadrosu)
  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);
  const [drivers, setDrivers] = useState<DriverItem[]>([]);

  const saveVehicles = (next: VehicleItem[]) => {
    setVehicles(next);
    saveCmsCollection('vehicles', next, showToast);
  };

  const saveDrivers = (next: DriverItem[]) => {
    setDrivers(next);
    saveCmsCollection('drivers', next, showToast);
  };

  // 1.6 ERP Finans & Kasa Hareketleri State'i
  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(STORAGE_KEY_PAYMENTS);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch { /* ignore */ }
      }
    }
    return initialPayments;
  });

  const savePayments = (next: PaymentRecord[]) => {
    setPayments(next);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_PAYMENTS, JSON.stringify(next));
      } catch { /* ignore */ }
    }
    saveCmsCollection('payments', next, () =>
      showToast('⚠️ Bulut yazma hatası: kasa kayıtları buluta kaydedilemedi.')
    );
  };

  const handleAddPayment = (record: Omit<PaymentRecord, 'id' | 'collectedAt'>) => {
    const newRecord: PaymentRecord = {
      ...record,
      id: `PAY-${Date.now().toString().slice(-6)}`,
      collectedAt: new Date().toISOString(),
    };
    savePayments([newRecord, ...payments]);
  };

  // 1.7 ERP B2B Partner & Alt Acentalar State'i (Faz 2)
  const [agents, setAgents] = useState<PartnerAgent[]>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(STORAGE_KEY_AGENTS);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch { /* ignore */ }
      }
    }
    return initialAgents;
  });

  const saveAgents = (next: PartnerAgent[]) => {
    setAgents(next);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_AGENTS, JSON.stringify(next));
      } catch { /* ignore */ }
    }
    saveCmsCollection('agents', next, () =>
      showToast('⚠️ Bulut yazma hatası: acenta kayıtları buluta kaydedilemedi.')
    );
  };

  // 1.8 ERP Tedarikçi Kataloğu & Net Alış Fiyatları State'i (Faz 3)
  const [suppliers, setSuppliers] = useState<SupplierItem[]>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(STORAGE_KEY_SUPPLIERS);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch { /* ignore */ }
      }
    }
    return initialSuppliers;
  });

  const saveSuppliers = (next: SupplierItem[]) => {
    setSuppliers(next);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_SUPPLIERS, JSON.stringify(next));
      } catch { /* ignore */ }
    }
    saveCmsCollection('suppliers', next, () =>
      showToast('⚠️ Bulut yazma hatası: tedarikçi kayıtları buluta kaydedilemedi.')
    );
  };

  const [tourCosts, setTourCosts] = useState<TourCostItem[]>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(STORAGE_KEY_TOUR_COSTS);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch { /* ignore */ }
      }
    }
    return initialTourCosts;
  });

  const saveTourCosts = (next: TourCostItem[]) => {
    setTourCosts(next);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_TOUR_COSTS, JSON.stringify(next));
      } catch { /* ignore */ }
    }
    saveCmsCollection('tour-costs', next, () =>
      showToast('⚠️ Bulut yazma hatası: tur maliyet kayıtları buluta kaydedilemedi.')
    );
  };

  // 2. Tours State
  const [tours, setTours] = useState<TourItem[]>([]);
  const [tourSearchQuery, setTourSearchQuery] = useState<string>('');
  const [tourCategoryFilter, setTourCategoryFilter] = useState<string>('all');
  /** Kategori filtresi seçenekleri — kayıtlardaki benzersiz kategoriler. */
  const tourCategoryOptions = useMemo(
    () => Array.from(new Set(tours.map((t) => t.category).filter(Boolean))).sort(),
    [tours],
  );
  const [isTourModalOpen, setIsTourModalOpen] = useState<boolean>(false);
  const [editingTour, setEditingTour] = useState<TourItem | null>(null);
  const [tourFormData, setTourFormData] = useState<Partial<TourItem>>({});

  // 3. Media & Photos State
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [mediaSearchQuery, setMediaSearchQuery] = useState<string>('');
  const [mediaTypeFilter, setMediaTypeFilter] = useState<'all' | 'system' | 'uploaded' | 'external'>('all');
  const [isAddMediaModalOpen, setIsAddMediaModalOpen] = useState<boolean>(false);
  const [mediaUploadMode, setMediaUploadMode] = useState<'file' | 'url'>('file');
  const [newMediaTitle, setNewMediaTitle] = useState<string>('');
  const [newMediaUrl, setNewMediaUrl] = useState<string>('');
  const [selectedLightboxMedia, setSelectedLightboxMedia] = useState<MediaItem | null>(null);
  const [assignMediaModal, setAssignMediaModal] = useState<MediaItem | null>(null);

  // 4. Blogs State
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState<boolean>(false);
  const [editingBlog, setEditingBlog] = useState<BlogItem | null>(null);
  const [blogFormData, setBlogFormData] = useState<Partial<BlogItem>>({});

  // 5. Services State
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [serviceFormData, setServiceFormData] = useState<Partial<ServiceItem>>({});

  // 6. FAQs State
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [isFaqModalOpen, setIsFaqModalOpen] = useState<boolean>(false);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [faqFormData, setFaqFormData] = useState<Partial<FaqItem>>({});

  // 7. Testimonials State
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [isTestiModalOpen, setIsTestiModalOpen] = useState<boolean>(false);
  const [editingTesti, setEditingTesti] = useState<TestimonialItem | null>(null);
  const [testiFormData, setTestiFormData] = useState<Partial<TestimonialItem>>({});

  // 8. Site Settings State
  const [siteSettings, setSiteSettings] = useState<SiteSettingsState>(initialSiteSettings);
  const [settingsSaved, setSettingsSaved] = useState<boolean>(false);

  // 9. Homepage Settings State
  const [homeSettings, setHomeSettings] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(STORAGE_KEY_HOME_SETTINGS);
        if (cached) return JSON.parse(cached);
      } catch { /* ignore */ }
    }
    return initialHomeSettings || null;
  });

  /* -------------------------------------------------------------------------
     Menü Durum ve Filtre Mantığı:
     Kategori filtresi, anlık arama ve aktif sekme senkronizasyonu
     ------------------------------------------------------------------------- */
  const pendingBookingsCount = useMemo(
    () => bookings.filter((b) => b.status === 'inquiry').length,
    [bookings]
  );
  const activeNavItem: NavItem | undefined = useMemo(
    () => NAV_ITEMS.find((i) => i.id === activeTab),
    [activeTab]
  );

  const operationNavItems = useMemo(
    () => NAV_ITEMS.filter((i) => i.category === 'operations' && perms.allowedTabs.includes(i.id)),
    [perms],
  );

  const financeNavItems = useMemo(
    () => NAV_ITEMS.filter((i) => i.category === 'finance' && perms.allowedTabs.includes(i.id)),
    [perms],
  );

  const cmsNavItems = useMemo(
    () => NAV_ITEMS.filter((i) => i.category === 'content' && perms.allowedTabs.includes(i.id)),
    [perms],
  );

  const systemNavItems = useMemo(
    () => NAV_ITEMS.filter((i) => i.category === 'system' && perms.allowedTabs.includes(i.id)),
    [perms],
  );

  /** Klavye ile menüde gezinme:
   *  [ = önceki sekme, ] = sonraki sekme
   *  1-5 = Temel operasyon sekmelerine doğrudan hızlı atlama
   */
  const isAnyModalOpen =
    isModalOpen ||
    Boolean(voucherBooking) ||
    Boolean(curatedProposalData) ||
    Boolean(workflowBooking) ||
    isCaptainDrawerOpen ||
    Boolean(whatsAppModalBooking) ||
    isPoliceManifestOpen ||
    isQrScannerOpen ||
    isBulkRescheduleOpen ||
    isLostFoundOpen ||
    isDietaryManifestOpen ||
    isFieldCashierOpen ||
    isFlightRadarOpen ||
    isDriverExpenseOpen ||
    isGuideExpenseOpen ||
    isTourModalOpen ||
    isAddMediaModalOpen ||
    Boolean(assignMediaModal) ||
    Boolean(selectedLightboxMedia) ||
    isBlogModalOpen ||
    isServiceModalOpen ||
    isFaqModalOpen ||
    isTestiModalOpen;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isAnyModalOpen) return; // Form/modal açıkken sekme değiştirme
      // Kullanıcı bir alana yazıyorken kısayol çalışmasın
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === '[' || e.key === ']') {
        const idx = visibleNavItems.findIndex((i) => i.id === activeTab);
        if (idx === -1) {
          setActiveTab(visibleNavItems[0].id);
        } else {
          const next = e.key === ']' ? (idx + 1) % visibleNavItems.length : (idx - 1 + visibleNavItems.length) % visibleNavItems.length;
          setActiveTab(visibleNavItems[next].id);
        }
      }

      // 1-5 tuşları ile temel operasyon sekmelerine doğrudan hızlı geçiş
      if (['1', '2', '3', '4', '5'].includes(e.key)) {
        const keyMap: Record<string, AdminTab> = {
          '1': 'overview',
          '2': 'bookings',
          '3': 'transfers',
          '4': 'settlements',
          '5': 'fleet',
        };
        const targetTab = keyMap[e.key];
        if (targetTab) {
          setActiveTab(targetTab);
          const found = NAV_ITEMS.find((i) => i.id === targetTab);
          if (found) {
            showToast(`⚡ ${found.label} sekmesine geçildi`);
          }
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeTab, isAnyModalOpen]);


  // Helper for universal image URL resolution
  const getImageUrl = (img?: string): string => {
    if (!img) return '/assets/phuket_hero.webp';
    if (img.startsWith('data:') || img.startsWith('http://') || img.startsWith('https://') || img.startsWith('/')) {
      return img;
    }
    return `/assets/${img}`;
  };

  // Pre-seed default system media
  const getDefaultSystemMedia = (): MediaItem[] => {
    const list = availableImages && availableImages.length > 0 ? availableImages : DEFAULT_AVAILABLE_IMAGES;
    return list.map((filename, idx) => {
      const cleanName = filename.replace(/\.(webp|jpg|jpeg|png)$/i, '').replace(/[-_]/g, ' ');
      const title = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
      return {
        id: `sys-${idx + 1}-${filename}`,
        title: title || filename,
        url: filename,
        type: 'system',
        createdAt: 'Sistem',
      };
    });
  };

  // Initialize data on mount
  useEffect(() => {
    try {
      // 1) Anında yerel yükleme (bulut yoksa panel boş açılmasın).
      const savedBookings = localStorage.getItem(STORAGE_KEY_BOOKINGS);
      setBookings(savedBookings ? JSON.parse(savedBookings) : initialBookings);

      const savedTours = localStorage.getItem(STORAGE_KEY_TOURS);
      setTours(savedTours ? JSON.parse(savedTours) : initialTours);

      // Load Fleet & Crew (araç filosu + şoför/rehber kadrosu)
      const savedVehicles = localStorage.getItem(STORAGE_KEY_VEHICLES);
      setVehicles(savedVehicles ? JSON.parse(savedVehicles) : initialVehicles);

      const savedDrivers = localStorage.getItem(STORAGE_KEY_DRIVERS);
      setDrivers(savedDrivers ? JSON.parse(savedDrivers) : initialDrivers);

      // Load B2B Partners, Suppliers & Tour Costs (Faz 2 & 3 ERP)
      const savedAgents = localStorage.getItem(STORAGE_KEY_AGENTS);
      setAgents(savedAgents ? JSON.parse(savedAgents) : initialAgents);

      const savedSuppliers = localStorage.getItem(STORAGE_KEY_SUPPLIERS);
      setSuppliers(savedSuppliers ? JSON.parse(savedSuppliers) : initialSuppliers);

      const savedTourCosts = localStorage.getItem(STORAGE_KEY_TOUR_COSTS);
      setTourCosts(savedTourCosts ? JSON.parse(savedTourCosts) : initialTourCosts);

      // Load Media
      const savedMedia = localStorage.getItem(STORAGE_KEY_MEDIA);
      if (savedMedia) {
        setMediaList(JSON.parse(savedMedia));
      } else {
        const defaultMedia = getDefaultSystemMedia();
        setMediaList(defaultMedia);
        localStorage.setItem(STORAGE_KEY_MEDIA, JSON.stringify(defaultMedia));
      }

      const savedBlogs = localStorage.getItem(STORAGE_KEY_BLOGS);
      setBlogs(savedBlogs ? JSON.parse(savedBlogs) : initialBlogs);

      const savedServices = localStorage.getItem(STORAGE_KEY_SERVICES);
      setServices(savedServices ? JSON.parse(savedServices) : initialServices);

      const savedFaqs = localStorage.getItem(STORAGE_KEY_FAQS);
      setFaqs(savedFaqs ? JSON.parse(savedFaqs) : initialFaqs);

      const savedTestis = localStorage.getItem(STORAGE_KEY_TESTIMONIALS);
      setTestimonials(savedTestis ? JSON.parse(savedTestis) : initialTestimonials);

      const savedSettings = localStorage.getItem(STORAGE_KEY_SITE);
      if (savedSettings) setSiteSettings(JSON.parse(savedSettings));

      // ☁️ Bulut verisi & CMS koleksiyonları: ilk açılışta paralel senkronize et
      void fetchBookingsFromServer(true);
      void refreshCmsFromServer();
    } catch {
      setBookings(initialBookings);
      setTours(initialTours);
    }

    // 2) Çevrimdışı kuyruk dinleyicisi & ağ bağlantı takibi (Aşama 4)
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
        if (res.items.some((item) => item.status === 'needs_attention')) {
          showToast(`⚠️ ${res.items.filter((item) => item.status === 'needs_attention').length} işlem müdahale bekliyor; senkron ayrıntılarını kontrol edin.`);
        }
      } catch {}
      void fetchBookingsFromServer(true);
      void refreshCmsFromServer();
    };

    const handleOffline = () => {
      setIsOnline(false);
      showToast('📶 Çevrimdışı moda geçildi. İskele ve teknede yapılan tüm işlemler yerel kuyrukta saklanacaktır.');
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      void getPendingMutations().then((list) => {
        setPendingSyncCount(list.length);
        setFailedSyncItems(list.flatMap((item) => item.syncStatus === 'retrying' || item.syncStatus === 'needs_attention'
          ? [{ ...item, status: item.syncStatus, statusCode: item.lastStatusCode, error: item.lastError || 'Senkronizasyon başarısız.' }]
          : []));
      });

      const hasLocal = typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY_BOOKINGS);
      if (!hasLocal) {
        void getOfflineCache<Booking[]>('bookings').then((cached) => {
          if (cached && Array.isArray(cached) && cached.length > 0 && !localStorage.getItem(STORAGE_KEY_BOOKINGS)) {
            setBookings(cached);
            localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(cached));
          }
        });
      }
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, []);

  /**
   * CMS koleksiyonlarını (turlar, araçlar, şoförler, kasalar vb.) buluttan
   * çeker ve state + localStorage cache'ini günceller.
   */
  const refreshCmsFromServer = useCallback(async (): Promise<void> => {
    try {
      const { items, offline } = await loadCmsCollections();
      if (offline) return;
      const apply = <T,>(key: CmsCollectionKey, setValue: (v: T) => void) => {
        const cloud = items[key];
        if (cloud === undefined) return;
        setValue(cloud as T);
        writeLocalCollection(key, cloud);
      };
      apply('tours', setTours);
      apply('blogs', setBlogs);
      apply('services', setServices);
      apply('faqs', setFaqs);
      apply('testimonials', setTestimonials);
      apply('media', setMediaList);
      apply('site-settings', setSiteSettings);
      apply('home-settings', setHomeSettings);
      apply('vehicles', setVehicles);
      apply('drivers', setDrivers);
      apply('payments', setPayments);
      apply('agents', setAgents);
      apply('suppliers', setSuppliers);
      apply('tour-costs', setTourCosts);
    } catch {
      // Çevrimdışı veya JSON parse hatası
    }
  }, []);

  /**
   * Bulut verisini /api/bookings üzerinden çeker ve state + localStorage
   * cache'ini tazeler. silent=true iken hata durumunda toast gösterilmez.
   */
  const fetchBookingsFromServer = useCallback(async (silent = false): Promise<void> => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/bookings');
      if (!res.ok) {
        if (!silent) showToast('⚠️ Bulut verisi alınamadı.');
        setIsCloudConnected(false);
        return;
      }
      const payload = (await res.json()) as { bookings?: Booking[] };
      if (Array.isArray(payload.bookings)) {
        if (payload.bookings.length > 0 || hasSyncedOnce.current) {
          setBookings(payload.bookings);
          localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(payload.bookings));
        } else if (payload.bookings.length === 0 && !localStorage.getItem(STORAGE_KEY_BOOKINGS)) {
          setBookings(initialBookings);
        }
        hasSyncedOnce.current = true;
        setIsCloudConnected(true);
        setLastSyncedAt(new Date());
      }
    } catch {
      setIsCloudConnected(false);
    } finally {
      setTimeout(() => setIsSyncing(false), 300);
    }
  }, [showToast, setIsCloudConnected, setIsSyncing, setLastSyncedAt]);

  /**
   * Kullanıcının üst bardaki senkronize et butonuna basarak tetiklediği
   * manuel tam senkronizasyon (Rezervasyonlar + CMS/Operasyon).
   */
  const handleManualSync = useCallback(async () => {
    setIsSyncing(true);
    try {
      const flushResult = await flushPendingMutations();
      if (flushResult.succeeded > 0) {
        showToast(`📶 ${flushResult.succeeded} adet çevrimdışı işlem buluta aktarıldı!`);
      }
      setPendingSyncCount(flushResult.remaining);
      setFailedSyncItems(flushResult.items);
      if (flushResult.items.some((item) => item.status === 'needs_attention')) {
        showToast(`⚠️ ${flushResult.items.filter((item) => item.status === 'needs_attention').length} işlem müdahale bekliyor; senkron ayrıntılarını kontrol edin.`);
      }

      await Promise.all([
        fetchBookingsFromServer(false),
        refreshCmsFromServer(),
      ]);
    } catch {
      showToast('⚠️ Eşitleme sırasında hata oluştu.');
    } finally {
      setTimeout(() => setIsSyncing(false), 400);
    }
  }, [fetchBookingsFromServer, refreshCmsFromServer, setIsSyncing, showToast, setPendingSyncCount]);

  /**
   * Canlı senkronizasyon: sunucunun "bookings/cms değişti" Broadcast sinyalini
   * dinler. Sinyal payload'ındaki source bilgisine göre ilgili veri kümesini tazeler.
   */
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const unsubscribe = subscribeBookingsSignal(async (payload) => {
      setIsSyncing(true);
      try {
        const promises: Promise<void>[] = [];
        if (!payload || payload.source !== 'admin-cms') {
          promises.push(fetchBookingsFromServer(true));
        }
        if (!payload || payload.source === 'admin-cms') {
          promises.push(refreshCmsFromServer());
        }
        await Promise.all(promises);
        setLastSyncedAt(new Date());
      } finally {
        setTimeout(() => setIsSyncing(false), 400);
      }
    });
    return unsubscribe;
  }, [isSupabaseConfigured, fetchBookingsFromServer, refreshCmsFromServer, setIsSyncing, setLastSyncedAt]);

  // Save helpers — her kayıt yerele VE buluta (/api/content) yazılır.
  // Bulut yazma yangın-and-forget; hata toast'u yerel kopyanın geçerli
  // olduğunu söyler. Yerel yazma davranışı değişmedi.
  const saveBookings = (next: Booking[]) => {
    setBookings(next);
    localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(next));
    void setOfflineCache('bookings', next);
  };

  /**
   * Tek bir rezervasyonu hem yerel state'te günceller hem de buluta (/api/bookings PUT)
   * optimistic update ile yazar. Çevrimdışı veya sunucu hatasında asla geri almaz (rollback yapmaz);
   * IndexedDB çevrimdışı outbox kuyruğuna alarak internet geldiğinde senkronlar.
   */
  const handleUpdateSingleBooking = useCallback(
    async (updated: Booking, successMsg?: string) => {
      const next = bookings.map((b) => (b.id === updated.id ? updated : b));
      saveBookings(next);

      const result = await submitMutation({
        type: 'PUT_BOOKING',
        url: '/api/bookings',
        method: 'PUT',
        body: updated,
        description: `${updated.customerName} rezervasyon güncellemesi`,
      });
      if (result.status === 'saved') {
        if (successMsg) showToast(successMsg);
        return;
      }
      if (result.status === 'rejected') {
        const failed = {
          ...result,
          id: `rejected-${updated.id}-${Date.now()}`,
          type: 'PUT_BOOKING' as const,
          url: '/api/bookings',
          method: 'PUT' as const,
          body: updated,
          description: `${updated.customerName} rezervasyon güncellemesi`,
          createdAt: Date.now(),
          retryCount: 0,
          status: 'needs_attention' as const,
          error: result.error,
        };
        setFailedSyncItems([failed]);
        showToast(`⚠️ Rezervasyon sunucu tarafından kabul edilmedi: ${result.error}`);
        return;
      }
      setPendingSyncCount((count) => count + 1);
      showToast('📶 Rezervasyon yerelde saklandı; internet gelince senkronlanacak.');
      if (successMsg) showToast(`${successMsg} (Yerel olarak kaydedildi; senkron bekliyor.)`);
    },
    [bookings, showToast, setPendingSyncCount, setFailedSyncItems]
  );

  const saveTours = (next: TourItem[]) => {
    setTours(next);
    saveCmsCollection('tours', next, showToast);
  };
  const saveMediaList = (next: MediaItem[]) => {
    setMediaList(next);
    saveCmsCollection('media', next, showToast);
  };
  const saveBlogs = (next: BlogItem[]) => {
    setBlogs(next);
    saveCmsCollection('blogs', next, showToast);
  };
  const saveServices = (next: ServiceItem[]) => {
    setServices(next);
    saveCmsCollection('services', next, showToast);
  };
  const saveFaqs = (next: FaqItem[]) => {
    setFaqs(next);
    saveCmsCollection('faqs', next, showToast);
  };
  const saveTestimonials = (next: TestimonialItem[]) => {
    setTestimonials(next);
    saveCmsCollection('testimonials', next, showToast);
  };
  const saveHomeSettings = (next: any) => {
    setHomeSettings(next);
    try {
      localStorage.setItem(STORAGE_KEY_HOME_SETTINGS, JSON.stringify(next));
    } catch { /* ignore */ }
    saveCmsCollection('home-settings', next, showToast);
  };

  // All available image URLs (system + uploaded) for pickers
  const allImageOptions = useMemo(() => {
    const set = new Set<string>();
    availableImages.forEach((img) => set.add(img));
    mediaList.forEach((m) => set.add(m.url));
    return Array.from(set);
  }, [availableImages, mediaList]);

  // Çıkış: sunucudaki imzalı oturum çerezini siler, sonra giriş ekranına döner.
  const handleLogout = async () => {
    setIsSigningOut(true);
    try {
      await fetch('/api/ops-login', { method: 'DELETE' });
    } catch {
      // Ağ hatası olsa da kullanıcıyı giriş ekranına gönder
    }
    window.location.href = '/ops-login?next=/admin';
  };

  // Metrics & Profitability
  const stats = useMemo(() => {
    const totalBookings = bookings.length;
    const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;
    const pendingCount = bookings.filter((b) => b.status === 'inquiry').length;
    const activeBookings = bookings.filter((b) => b.status !== 'cancelled');

    const totalRevenueThb = activeBookings.reduce((acc, b) => acc + (b.totalPriceThb || 0), 0);
    const collectedRevenueThb = activeBookings.reduce((acc, b) => acc + (b.paidAmountThb || 0), 0);
    const pendingCollectionThb = activeBookings.reduce((acc, b) => acc + (b.remainingAmountThb || 0), 0);
    const totalGuests = activeBookings.reduce((acc, b) => acc + (b.adultCount || 0) + (b.childCount || 0), 0);

    // Calculate total cost (Tedarikçi Maliyeti)
    const totalCostThb = activeBookings.reduce((acc, b) => {
      if (b.costThb !== undefined && b.costThb !== null) {
        return acc + b.costThb;
      }
      if (b.tours && b.tours.length > 0) {
        const toursCost = b.tours.reduce((tAcc, t) => tAcc + (t.costThb || 0), 0) * (b.adultCount || 1);
        return acc + toursCost;
      }
      return acc;
    }, 0);

    const netProfitThb = totalRevenueThb - totalCostThb;
    const profitMarginPercent = totalRevenueThb > 0 ? Math.round((netProfitThb / totalRevenueThb) * 100) : 0;

    return {
      totalBookings,
      confirmedCount,
      pendingCount,
      totalRevenueThb,
      collectedRevenueThb,
      pendingCollectionThb,
      totalGuests,
      totalCostThb,
      netProfitThb,
      profitMarginPercent,
    };
  }, [bookings]);

  // Filters — mantık src/lib/adminFilters.ts'te (testli tek kaynak).
  const filteredBookings = useMemo(
    () => filterBookings(bookings, searchQuery, statusFilter, dateFilter),
    [bookings, searchQuery, statusFilter, dateFilter],
  );

  const filteredTours = useMemo(
    () => filterTours(tours, tourSearchQuery, tourCategoryFilter),
    [tours, tourSearchQuery, tourCategoryFilter],
  );

  // Booking CRUD
  const handleOpenCreateBooking = () => {
    setEditingBooking(null);
    const initialTourItem = tours[0];
    const initialSchedule: BookingTourSchedule[] = [
      {
        tourTitle: initialTourItem?.title || 'Phi Phi, Maya Bay ve Bamboo Adası',
        tourDate: new Date().toISOString().split('T')[0],
        pickupTime: '07:30',
        priceThb: initialTourItem?.priceThb || 3200,
        costThb: initialTourItem?.costThb || 1900,
        supplier: initialTourItem?.supplier || 'Andaman Wave Master',
        nationalParkFeeIncluded: false,
      },
    ];

    setFormData({
      customerName: '',
      phone: '',
      hotel: '',
      hotelZone: 'Patong & Kalim',
      roomNumber: '',
      tourTitle: initialTourItem?.title || 'Phi Phi Adaları',
      tourDate: new Date().toISOString().split('T')[0],
      pickupTime: '07:30',
      tours: initialSchedule,
      adultCount: 2,
      childCount: 0,
      totalPriceThb: (initialTourItem?.priceThb || 3200) * 2,
      costThb: (initialTourItem?.costThb || 1900) * 2,
      supplier: initialTourItem?.supplier || 'Andaman Wave Master',
      nationalParkFeeIncluded: false,
      paidAmountThb: 2000,
      status: 'confirmed',
      paymentStatus: 'partial',
      specialNotes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditBooking = (b: Booking) => {
    setEditingBooking(b);
    const schedule: BookingTourSchedule[] =
      b.tours && b.tours.length > 0
        ? b.tours
        : [
            {
              tourTitle: b.tourTitle,
              tourDate: b.tourDate,
              pickupTime: b.pickupTime || '07:30',
              priceThb: Math.round(b.totalPriceThb / (b.adultCount || 1)),
              costThb: b.costThb ? Math.round(b.costThb / (b.adultCount || 1)) : undefined,
              supplier: b.supplier,
              nationalParkFeeIncluded: b.nationalParkFeeIncluded,
            },
          ];

    setFormData({
      ...b,
      hotelZone: b.hotelZone || detectHotelZone(b.hotel),
      tours: schedule,
    });
    setIsModalOpen(true);
  };

  const handleConvertProposalToBooking = (convertedBookingData: any) => {
    setCuratedProposalData(null);
    setEditingBooking(null);
    setFormData(convertedBookingData);
    setIsModalOpen(true);
    showToast('🎉 Teklif başarıyla yeni rezervasyon formuna aktarıldı!');
  };

  const handleDeleteBooking = (id: string, name: string) => {
    if (!canDeleteBookings) {
      showToast('⚠️ Kalıcı rezervasyon silme yetkisi yalnızca yöneticidedir.');
      return;
    }
    if (window.confirm(`"${name}" rezervasyonunu silmek istediğinize emin misiniz?`)) {
      const prevBookings = bookings;
      saveBookings(bookings.filter((b) => b.id !== id));
      showToast('Rezervasyon silindi.');

      // Bulut silmesi /api/bookings üzerinden. Silme yalnızca admin
      // oturumuyla yapılabilir (API tarafında guard 'admin' ister).
      void fetch(`/api/bookings?id=${encodeURIComponent(id)}`, { method: 'DELETE' }).then(
        (res) => {
          if (!res.ok) {
            if (res.status >= 400 && res.status < 500) {
              setBookings(prevBookings);
              localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(prevBookings));
              showToast('⚠️ Bulut silme hatası: Yetki veya sunucu sorunu nedeniyle geri alındı.');
            } else {
              void enqueueMutation({
                type: 'DELETE_BOOKING',
                url: `/api/bookings?id=${encodeURIComponent(id)}`,
                method: 'DELETE',
                description: `${name} rezervasyon silme (${id})`,
              }).then(() => setPendingSyncCount((c) => c + 1));
              showToast('📶 Çevrimdışı silindi: Sunucu geçici yanıt vermiyor, sıraya alındı.');
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
    }
  };

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const total = Number(formData.totalPriceThb) || 0;
    const paid = Number(formData.paidAmountThb) || 0;
    const remaining = Math.max(0, total - paid);
    const adults = Number(formData.adultCount) || 1;

    let paymentStatus: Booking['paymentStatus'] = 'unpaid';
    if (paid >= total && total > 0) paymentStatus = 'paid';
    else if (paid > 0) paymentStatus = 'partial';

    // Normalize tours schedule
    const schedule: BookingTourSchedule[] =
      formData.tours && formData.tours.length > 0
        ? formData.tours
        : [
            {
              tourTitle: formData.tourTitle || tours[0]?.title || 'Phuket Turu',
              tourDate: formData.tourDate || new Date().toISOString().split('T')[0],
              pickupTime: formData.pickupTime || '07:30',
              priceThb: total,
              costThb: formData.costThb ? Math.round(formData.costThb / adults) : 0,
              supplier: formData.supplier,
              nationalParkFeeIncluded: formData.nationalParkFeeIncluded,
            },
          ];

    // Calculate total cost from schedule if available
    const calculatedCost =
      formData.costThb !== undefined
        ? Number(formData.costThb)
        : schedule.reduce((acc, t) => acc + (t.costThb || 0), 0) * adults;

    // Primary summary title
    const primaryTourTitle =
      schedule.length > 1
        ? `${schedule[0].tourTitle} + ${schedule.length - 1} Tur`
        : schedule[0].tourTitle;
    const primaryTourDate = schedule[0].tourDate;
    const primaryPickupTime = formData.pickupTime || schedule[0].pickupTime || '07:30';
    if (schedule[0]) {
      schedule[0].pickupTime = primaryPickupTime;
    }

    const resolvedZone =
      formData.hotelZone ||
      (formData.hotel ? detectHotelZone(formData.hotel) : 'Patong & Kalim');

    if (editingBooking) {
      const updated = bookings.map((b) =>
        b.id === editingBooking.id
          ? ({
              ...b,
              ...formData,
              hotelZone: resolvedZone,
              tourTitle: primaryTourTitle,
              tourDate: primaryTourDate,
              pickupTime: primaryPickupTime,
              tours: schedule,
              totalPriceThb: total,
              costThb: calculatedCost,
              paidAmountThb: paid,
              remainingAmountThb: remaining,
              paymentStatus,
            } as Booking)
          : b
      );
      const prevBookings = bookings;
      saveBookings(updated);
      showToast('Rezervasyon güncellendi!');

      // Bulut yazımı /api/bookings üzerinden (oturum cookie'si ile).
      const target = updated.find((b) => b.id === editingBooking.id);
      if (target) {
        void fetch('/api/bookings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(target),
        }).then(
          (res) => {
            if (!res.ok) {
              if (res.status >= 400 && res.status < 500) {
                setBookings(prevBookings);
                localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(prevBookings));
                showToast('⚠️ Bulut kayıt hatası: Sunucu isteği reddetti, geri alındı.');
              } else {
                void enqueueMutation({
                  type: 'PUT_BOOKING',
                  url: '/api/bookings',
                  method: 'PUT',
                  body: target,
                  description: `${target.customerName} güncelleme`,
                }).then(() => setPendingSyncCount((c) => c + 1));
                showToast('📶 Çevrimdışı kaydedildi: Sunucu geçici yanıt veremedi, sıraya alındı.');
              }
            }
          },
          () => {
            void enqueueMutation({
              type: 'PUT_BOOKING',
              url: '/api/bookings',
              method: 'PUT',
              body: target,
              description: `${target.customerName} güncelleme`,
            }).then(() => setPendingSyncCount((c) => c + 1));
            showToast('📶 Çevrimdışı kaydedildi: Değişiklik internet gelince buluta aktarılacak.');
          }
        );
      }
    } else {
      const newBooking: Booking = {
        id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: formData.customerName || 'İsimsiz Misafir',
        phone: formData.phone || '',
        hotel: formData.hotel || 'Belirtilmedi',
        hotelZone: resolvedZone,
        roomNumber: formData.roomNumber,
        tourId: formData.tourId || 'coklu-tur',
        tourTitle: primaryTourTitle,
        tourDate: primaryTourDate,
        pickupTime: primaryPickupTime,
        tours: schedule,
        adultCount: adults,
        childCount: Number(formData.childCount) || 0,
        totalPriceThb: total,
        costThb: calculatedCost,
        supplier: formData.supplier || schedule[0]?.supplier || 'Yerel Acente',
        paidAmountThb: paid,
        remainingAmountThb: remaining,
        nationalParkFeeIncluded: formData.nationalParkFeeIncluded ?? false,
        status: (formData.status as Booking['status']) || 'confirmed',
        paymentStatus,
        depositMethod: formData.depositMethod,
        collectionLocation: formData.collectionLocation,
        balanceCollector: formData.balanceCollector,
        agentId: formData.agentId,
        agentName: formData.agentName,
        agentCommissionThb: formData.agentCommissionThb,
        agentCommissionStatus: formData.agentCommissionStatus,
        supplierRefCode: formData.supplierRefCode,
        supplierStatus: formData.supplierStatus,
        specialNotes: formData.specialNotes,
        passengers: formData.passengers || [],
        // Misafir bilet portalı kodu — id tahmin edilebilir olduğu için
        // ayrı rastgele kod atanır (misafire WhatsApp'tan bu gönderilir).
        ticketCode: generateTicketCode(),
        createdAt: new Date().toISOString().split('T')[0],
      };
      const prevBookings = bookings;
      saveBookings([newBooking, ...bookings]);
      showToast(`Yeni rezervasyon eklendi — bilet kodu: ${newBooking.ticketCode}`);

      // Bulut yazımı /api/bookings üzerinden (oturum cookie'si ile).
      void fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBooking),
      }).then(
        (res) => {
          if (!res.ok) {
            if (res.status >= 400 && res.status < 500) {
              setBookings(prevBookings);
              localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(prevBookings));
              showToast('⚠️ Bulut kayıt hatası: Yeni rezervasyon sunucuya yazılamadı, geri alındı.');
            } else {
              void enqueueMutation({
                type: 'POST_BOOKING',
                url: '/api/bookings',
                method: 'POST',
                body: newBooking,
                description: `${newBooking.customerName} yeni rezervasyon`,
              }).then(() => setPendingSyncCount((c) => c + 1));
              showToast('📶 Çevrimdışı kaydedildi: Sunucu geçici yanıt veremedi, sıraya alındı.');
            }
          }
        },
        () => {
          void enqueueMutation({
            type: 'POST_BOOKING',
            url: '/api/bookings',
            method: 'POST',
            body: newBooking,
            description: `${newBooking.customerName} yeni rezervasyon`,
          }).then(() => setPendingSyncCount((c) => c + 1));
          showToast('📶 Çevrimdışı kaydedildi: Yeni rezervasyon internet gelince buluta aktarılacak.');
        }
      );
    }
    setIsModalOpen(false);
  };

  /**
   * Bir rezervasyonun (veya çoklu tur programındaki tek bir turun)
   * araç/şoför atamasını günceller; localStorage'a yazar ve Supabase'e senkronlar.
   *
   * `tourIndex >= 0` ise atama ilgili tur kalemine, değilse rezervasyonun
   * kendisine yazılır (tek turlu kayıtlar için).
   *
   * Çevrimdışı veya iskelede internet kesintisinde IndexedDB kuyruğuna alınır,
   * asla geri alınmaz (rollback yapılmaz).
   */
  const applyAssignment = async (
    bookingId: string,
    tourIndex: number,
    patch: Partial<Pick<BookingTourSchedule, 'assignedVehicle' | 'assignedDriver' | 'pickupStatus' | 'pickedUpAt' | 'pickupTime'>>
  ) => {
    const target = bookings.find((b) => b.id === bookingId);
    if (!target) return null;

    const full = { ...target };
    if (patch.pickupTime && (tourIndex === 0 || !full.tours || full.tours.length === 0)) {
      full.pickupTime = patch.pickupTime;
    }
    if (tourIndex >= 0 && full.tours && full.tours[tourIndex]) {
      const nextTours = [...full.tours];
      nextTours[tourIndex] = { ...nextTours[tourIndex], ...patch };
      full.tours = nextTours;
    } else {
      Object.assign(full, patch);
    }

    if (patch.pickupStatus === 'completed') {
      full.status = 'completed';
    }

    const prevBookings = bookings;
    const updated = bookings.map((b) => (b.id === bookingId ? full : b));
    saveBookings(updated);

    // Bulut yazımı /api/bookings üzerinden.
    try {
      const res = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(full),
      });
      if (!res.ok) {
        if (res.status >= 400 && res.status < 500) {
          setBookings(prevBookings);
          localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(prevBookings));
          showToast('⚠️ Bulut atama senkron hatası: Sunucu isteği reddetti, geri alındı.');
          return null;
        } else {
          await enqueueMutation({
            type: 'PUT_BOOKING',
            url: '/api/bookings',
            method: 'PUT',
            body: full,
            description: `${full.customerName} atama/durum güncellemesi`,
          });
          setPendingSyncCount((c) => c + 1);
          showToast('📶 Çevrimdışı kaydedildi: Sunucu geçici yanıt veremedi, sıraya alındı.');
        }
      }
    } catch {
      await enqueueMutation({
        type: 'PUT_BOOKING',
        url: '/api/bookings',
        method: 'PUT',
        body: full,
        description: `${full.customerName} atama/durum güncellemesi`,
      });
      setPendingSyncCount((c) => c + 1);
      showToast('📶 Çevrimdışı kaydedildi: Atama internet gelince buluta aktarılacak.');
    }

    return full;
  };

  const handleUpdatePickupStatus = async (
    bookingId: string,
    tourIndex: number,
    status: 'pending' | 'picked_up' | 'on_tour' | 'completed' | 'no_show'
  ) => {
    const nowTime = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    const full = await applyAssignment(bookingId, tourIndex, {
      pickupStatus: status,
      pickedUpAt: status === 'picked_up' ? nowTime : undefined,
    });
    if (full) {
      if (status === 'picked_up') {
        showToast(`🚐 ${full.customerName} otelden alındı (${nowTime})`);
      } else if (status === 'no_show') {
        showToast(`⚠️ ${full.customerName} NO-SHOW olarak işaretlendi`);
      } else {
        showToast(`Durum güncellendi: ${status}`);
      }
    }
  };

  const handleQrScanResult = async (scannedCode: string, tourIndex: number) => {
    const clean = scannedCode.trim().toUpperCase();
    const found = bookings.find(
      (b) =>
        b.id.toUpperCase() === clean ||
        b.id.toUpperCase().includes(clean) ||
        (b.ticketCode && b.ticketCode.toUpperCase() === clean)
    );
    if (!found) {
      showToast(`⚠️ Rezervasyon bulunamadı: ${clean}`);
      return;
    }
    const nowTime = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    await applyAssignment(found.id, tourIndex >= 0 ? tourIndex : 0, {
      pickupStatus: 'picked_up',
      pickedUpAt: nowTime,
    });
    setIsQrScannerOpen(false);
    if (found.remainingAmountThb > 0) {
      showToast(`✅ ${found.customerName} bindi! ⚠️ Kalan Alınacak: ${found.remainingAmountThb.toLocaleString()} THB`);
    } else {
      showToast(`✅ ${found.customerName} bilet doğrulandı ve araca bindi olarak kaydedildi.`);
    }
  };

  const handleAssignVehicleToBooking = async (
    bookingId: string,
    tourIndex: number,
    vehicle: string
  ) => {
    const full = await applyAssignment(bookingId, tourIndex, { assignedVehicle: vehicle });
    if (full) {
      showToast(`🚐 ${full.customerName} için hat atandı: ${vehicle}`);
      void sendTransferPushNotification({
        bookingId: full.id,
        customerName: full.customerName,
        hotel: full.hotel,
        newTime: full.pickupTime || '07:30',
        vehicle,
        roomNumber: full.roomNumber,
      });
    }
  };

  const handleAssignDriverToBooking = async (
    bookingId: string,
    tourIndex: number,
    driverId: string
  ) => {
    // Boş seçim = atamayı kaldır
    const driverName = driverId
      ? drivers.find((d) => d.id === driverId)?.fullName
      : undefined;
    const full = await applyAssignment(bookingId, tourIndex, {
      assignedDriver: driverId || undefined,
    });
    if (full) {
      showToast(
        driverName
          ? `🧑‍✈️ ${full.customerName} için görevli atandı: ${driverName}`
          : `ℹ️ ${full.customerName} için görevli ataması kaldırıldı.`
      );
      if (driverName) {
        void sendTransferPushNotification({
          bookingId: full.id,
          customerName: full.customerName,
          hotel: full.hotel,
          newTime: full.pickupTime || '07:30',
          driverName,
          driverId,
          roomNumber: full.roomNumber,
        });
      }
    }
  };

  const handleUpdatePickupTime = async (
    bookingId: string,
    tourIndex: number,
    newTime: string
  ) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    const currentSchedule = booking.tours || [];
    const targetTour = currentSchedule[tourIndex] || currentSchedule[0];
    const oldTime = targetTour?.pickupTime || booking.pickupTime || '07:30';

    const full = await applyAssignment(bookingId, tourIndex, { pickupTime: newTime });
    if (full) {
      showToast(`⏰ ${full.customerName} alınış saati güncellendi: ${newTime}`);

      // Şoföre & Ekibe PWA Anlık Push Bildirimi Gönder
      const assignedDriver = drivers.find((d) => d.id === targetTour?.assignedDriver);
      void sendTransferPushNotification({
        bookingId: full.id,
        customerName: full.customerName,
        hotel: full.hotel,
        oldTime,
        newTime,
        vehicle: targetTour?.assignedVehicle,
        driverName: assignedDriver?.fullName,
        driverId: assignedDriver?.id,
        roomNumber: full.roomNumber,
        phone: full.phone,
      });
    }
  };

  // Tour CRUD
  const handleOpenCreateTour = () => {
    setEditingTour(null);
    setTourFormData({
      title: '',
      category: 'island-tours',
      categoryLabel: 'Ada Turları',
      priceThb: 3200,
      duration: 'Tam Gün (08:00 - 17:00)',
      featured: false,
      active: true,
      image: 'phuket_hero.webp',
      excerpt: '',
      gallery: [],
      included: [
        'Otel çift yönlü klimalı transferi (seçili bölgeler)',
        'Sürat teknesi veya katamaran ulaşımı',
        'Öğle yemeği ve taze tropikal meyve ikramları',
        'Şnorkel maskesi, can yeleği ve deniz güvenlik ekipmanları',
        'İngilizce & Türkçe operasyon desteği',
        'Temel seyahat ve kaza sigortası',
      ],
      excluded: [
        'Millî park giriş ücretleri (yerinde nakit ödenir)',
        'Kişisel harcamalar ve özel içecekler',
        'Rehber ve tekne mürettebatı bahşişleri',
      ],
      program: [
        '07:30 - Otelden klimalı transfer ve iskelede karşılama & brifing',
        '09:00 - Sürat teknesi ile ilk ada koyuna hareket',
        '11:30 - Berrak turkuaz lagünde yüzme ve şnorkel molası',
        '13:00 - Adada kumsal kenarında açık büfe öğle yemeği',
        '14:30 - Fotoğraf çekimi, plaj yürüyüşü ve serbest zaman',
        '16:30 - Phuket iskelesine dönüş ve otele transfer',
      ],
      faq: [
        {
          q: 'Tura katılırken yanıma ne almalıyım?',
          a: 'Güneş kremi, güneş gözlüğü, havlu, yedek kuru kıyafet, su geçirmez telefon kılıfı ve milli park harçları için nakit Baht almanız önerilir.',
        },
        {
          q: 'Hava şartları bozulursa tur iptal olur mu?',
          a: 'Deniz güvenliği önceliğimizdir. Dalga veya hava uyarısı durumunda tur bir sonraki güne ertelenir veya tam iade sağlanır.',
        },
      ],
      restrictions: [
        'Hamile misafirler ve 1 yaşından küçük bebekler için sürat tekneleri uygun değildir.',
        'Kalp veya bel/omurga rahatsızlığı olan misafirlerimiz için katamaran turları önerilir.',
      ],
      body: 'Tur detayları ve özel rota notları...',
    });
    setIsTourModalOpen(true);
  };

  const handleOpenEditTour = (t: TourItem) => {
    setEditingTour(t);
    setTourFormData({
      ...t,
      gallery: t.gallery || [],
      included: t.included || [],
      excluded: t.excluded || [],
      program: t.program || [],
      faq: t.faq || [],
      restrictions: t.restrictions || [],
      body: t.body || '',
    });
    setIsTourModalOpen(true);
  };

  const handleDeleteTour = (id: string, title: string) => {
    if (window.confirm(`"${title}" turunu silmek istediğinize emin misiniz?`)) {
      saveTours(tours.filter((t) => t.id !== id));
      showToast(`"${title}" turu silindi.`);
    }
  };

  const handleToggleTourFeatured = (id: string) => {
    saveTours(tours.map((t) => (t.id === id ? { ...t, featured: !t.featured } : t)));
    showToast('Öne çıkarılan tur durumu güncellendi.');
  };

  const handleSubmitTour = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tourFormData.title) return;

    if (editingTour) {
      saveTours(
        tours.map((t) =>
          t.id === editingTour.id
            ? ({
                ...t,
                ...tourFormData,
                priceThb: Number(tourFormData.priceThb) || 0,
                costThb: Number(tourFormData.costThb) || 0,
                supplier: tourFormData.supplier || '',
                gallery: tourFormData.gallery || [],
                included: tourFormData.included || [],
                excluded: tourFormData.excluded || [],
                program: tourFormData.program || [],
                faq: tourFormData.faq || [],
                restrictions: tourFormData.restrictions || [],
                body: tourFormData.body || '',
              } as TourItem)
            : t
        )
      );
      showToast('Tur başarıyla güncellendi!');
    } else {
      const slug = tourFormData.title
        .toLowerCase()
        .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const newTour: TourItem = {
        id: slug || `tur-${Date.now()}`,
        title: tourFormData.title,
        category: tourFormData.category || 'island-tours',
        categoryLabel:
          tourFormData.category === 'island-tours'
            ? 'Ada Turları'
            : tourFormData.category === 'adventure-tours'
            ? 'Macera & Doğa'
            : tourFormData.category === 'entertainment-tours'
            ? 'Kültür & Şov'
            : 'VIP Yat & Özel',
        priceThb: Number(tourFormData.priceThb) || 0,
        costThb: Number(tourFormData.costThb) || 0,
        supplier: tourFormData.supplier || '',
        duration: tourFormData.duration || 'Tam Gün',
        featured: Boolean(tourFormData.featured),
        active: true,
        image: tourFormData.image || 'phuket_hero.webp',
        excerpt: tourFormData.excerpt,
        gallery: tourFormData.gallery || [],
        included: tourFormData.included || [],
        excluded: tourFormData.excluded || [],
        program: tourFormData.program || [],
        faq: tourFormData.faq || [],
        restrictions: tourFormData.restrictions || [],
        body: tourFormData.body || '',
      };
      saveTours([newTour, ...tours]);
      showToast('Yeni tur başarıyla eklendi!');
    }
    setIsTourModalOpen(false);
  };

  // Media Handlers
  const filteredMedia = useMemo(() => {
    return mediaList.filter((m) => {
      const matchesSearch =
        m.title.toLowerCase().includes(mediaSearchQuery.toLowerCase()) ||
        m.url.toLowerCase().includes(mediaSearchQuery.toLowerCase());
      const matchesType = mediaTypeFilter === 'all' || m.type === mediaTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [mediaList, mediaSearchQuery, mediaTypeFilter]);

  // Görsel yükleme motoru src/lib/imageUpload.ts'e taşındı; burada yalnızca
  // sonuç mediaList state'ine yazılır ve toast gösterilir.
  const handleFileUpload = (file: File, callback?: (url: string) => void) => {
    if (!file) return;
    // 1) Dogrulama
    if (!file.type.startsWith('image/')) {
      showToast('Hata: Sadece görsel dosyası yüklenebilir (JPG, PNG, WebP, GIF).');
      return;
    }
    if (file.size > UPLOAD_MAX_MB * 1024 * 1024) {
      showToast(`Hata: Dosya çok büyük (${(file.size / 1024 / 1024).toFixed(1)}MB). En fazla ${UPLOAD_MAX_MB}MB — otomatik küçültülecek.`);
      return;
    }
    // 2) Isle (boyutlandir + WebP) ve Storage'a yukle
    processImageFile(file)
      .then(async ({ url: base64, width, height, blob }) => {
        const slug = slugifyFileName(file.name);
        const ext = blob.type === 'image/webp' ? 'webp' : 'jpg';
        const fileName = `${slug}.${ext}`;
        const { url: finalUrl, cloud } = await uploadToStorage(blob, fileName);
        const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        const newMedia: MediaItem = {
          id: `med-${Date.now()}`,
          title: cleanTitle,
          url: finalUrl,
          type: 'uploaded',
          size: `${Math.round(blob.size / 1024)} KB · ${width}×${height}`,
          createdAt: new Date().toLocaleDateString('tr-TR'),
          slug: fileName,
        };
        const updated = [newMedia, ...mediaList];
        saveMediaList(updated);
        showToast(cloud
          ? `"${file.name}" buluta yüklendi: ${width}×${height} → ${(blob.size / 1024).toFixed(0)}KB WebP`
          : `"${file.name}" yerel yüklendi (bulut kapalı): ${width}×${height}`);
        if (callback) callback(finalUrl);
        void base64; // base64 yalnız fallback'te kullanıldı
      })
      .catch((err) => {
        showToast(err?.message || 'Yükleme sırasında hata oluştu.');
      });
  };

  const handleAddMediaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMediaUrl.trim()) return;
    const newMedia: MediaItem = {
      id: `med-${Date.now()}`,
      title: newMediaTitle.trim() || 'Yeni Görsel',
      url: newMediaUrl.trim(),
      type: mediaUploadMode === 'file' ? 'uploaded' : 'external',
      createdAt: new Date().toLocaleDateString('tr-TR'),
    };
    saveMediaList([newMedia, ...mediaList]);
    setNewMediaTitle('');
    setNewMediaUrl('');
    setIsAddMediaModalOpen(false);
    showToast('Fotoğraf kütüphaneye eklendi!');
  };

  const handleDeleteMedia = (id: string, title: string) => {
    if (window.confirm(`"${title}" görselini kütüphaneden silmek istediğinize emin misiniz?`)) {
      saveMediaList(mediaList.filter((m) => m.id !== id));
      showToast('Görsel silindi.');
    }
  };

  const handleCopyMediaUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    showToast('Görsel bağlantısı panoya kopyalandı! 📋');
  };

  const handleAssignMediaAsTourCover = (mediaUrl: string, tourId: string) => {
    saveTours(tours.map((t) => (t.id === tourId ? { ...t, image: mediaUrl } : t)));
    setAssignMediaModal(null);
    showToast('Görsel seçilen turun kapak fotoğrafı yapıldı! ⭐');
  };

  const handleAddMediaToTourGallery = (mediaUrl: string, tourId: string) => {
    saveTours(
      tours.map((t) => {
        if (t.id === tourId) {
          const gallery = t.gallery || [];
          if (!gallery.includes(mediaUrl)) {
            return { ...t, gallery: [...gallery, mediaUrl] };
          }
        }
        return t;
      })
    );
    setAssignMediaModal(null);
    showToast('Görsel seçilen turun galerisine eklendi! 🖼️');
  };

  // Blog CRUD
  const handleOpenCreateBlog = () => {
    setEditingBlog(null);
    setBlogFormData({
      title: '',
      excerpt: '',
      cover_image: 'pileh.webp',
      date: new Date().toISOString().split('T')[0],
      author: 'Phuket Tatili Ekibi',
      featured: false,
    });
    setIsBlogModalOpen(true);
  };

  const handleOpenEditBlog = (b: BlogItem) => {
    setEditingBlog(b);
    setBlogFormData(b);
    setIsBlogModalOpen(true);
  };

  const handleDeleteBlog = (id: string, title: string) => {
    if (window.confirm(`"${title}" yazısını silmek istediğinize emin misiniz?`)) {
      saveBlogs(blogs.filter((b) => b.id !== id));
    }
  };

  const handleSubmitBlog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogFormData.title) return;
    if (editingBlog) {
      saveBlogs(blogs.map((b) => (b.id === editingBlog.id ? ({ ...b, ...blogFormData } as BlogItem) : b)));
    } else {
      const slug = blogFormData.title
        .toLowerCase()
        .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
        .replace(/[^a-z0-9]+/g, '-');
      const newBlog: BlogItem = {
        id: slug || `blog-${Date.now()}`,
        title: blogFormData.title,
        excerpt: blogFormData.excerpt || '',
        cover_image: blogFormData.cover_image || 'pileh.webp',
        date: blogFormData.date || new Date().toISOString().split('T')[0],
        author: blogFormData.author || 'Phuket Tatili Ekibi',
        featured: Boolean(blogFormData.featured),
      };
      saveBlogs([newBlog, ...blogs]);
    }
    setIsBlogModalOpen(false);
  };

  // Service CRUD
  const handleOpenEditService = (s: ServiceItem) => {
    setEditingService(s);
    setServiceFormData(s);
    setIsServiceModalOpen(true);
  };

  const handleSubmitService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    saveServices(
      services.map((s) => (s.slug === editingService.slug ? ({ ...s, ...serviceFormData } as ServiceItem) : s))
    );
    setIsServiceModalOpen(false);
  };

  // FAQ CRUD
  const handleOpenCreateFaq = () => {
    setEditingFaq(null);
    setFaqFormData({ question: '', answer: '' });
    setIsFaqModalOpen(true);
  };

  const handleOpenEditFaq = (f: FaqItem) => {
    setEditingFaq(f);
    setFaqFormData(f);
    setIsFaqModalOpen(true);
  };

  const handleDeleteFaq = (id: string) => {
    if (window.confirm('Bu SSS sorusunu silmek istediğinize emin misiniz?')) {
      saveFaqs(faqs.filter((f) => f.id !== id));
    }
  };

  const handleSubmitFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqFormData.question) return;
    if (editingFaq) {
      saveFaqs(faqs.map((f) => (f.id === editingFaq.id ? ({ ...f, ...faqFormData } as FaqItem) : f)));
    } else {
      const newFaq: FaqItem = {
        id: `faq-${Date.now()}`,
        question: faqFormData.question,
        answer: faqFormData.answer || '',
      };
      saveFaqs([...faqs, newFaq]);
    }
    setIsFaqModalOpen(false);
  };

  // Testimonial CRUD
  const handleOpenCreateTesti = () => {
    setEditingTesti(null);
    setTestiFormData({ name: '', type: 'Balayı Çifti', tour: 'Phi Phi & Maya Bay', stars: 5, text: '' });
    setIsTestiModalOpen(true);
  };

  const handleOpenEditTesti = (t: TestimonialItem) => {
    setEditingTesti(t);
    setTestiFormData(t);
    setIsTestiModalOpen(true);
  };

  const handleDeleteTesti = (id: string, name: string) => {
    if (window.confirm(`"${name}" adlı yorumu silmek istediğinize emin misiniz?`)) {
      saveTestimonials(testimonials.filter((t) => t.id !== id));
    }
  };

  const handleSubmitTesti = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testiFormData.name) return;
    if (editingTesti) {
      saveTestimonials(
        testimonials.map((t) => (t.id === editingTesti.id ? ({ ...t, ...testiFormData } as TestimonialItem) : t))
      );
    } else {
      const newTesti: TestimonialItem = {
        id: `testi-${Date.now()}`,
        name: testiFormData.name,
        type: testiFormData.type || 'Misafir',
        tour: testiFormData.tour || 'Phuket Turu',
        stars: Number(testiFormData.stars) || 5,
        text: testiFormData.text || '',
      };
      saveTestimonials([newTesti, ...testimonials]);
    }
    setIsTestiModalOpen(false);
  };

  // Save Settings — artık yerele + buluta yazılır.
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveCmsCollection('site-settings', siteSettings, showToast);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  // Site Verisi İndir (JSON) — apply-cms.ts uyumlu format
  const handleExportSiteData = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      tours: tours.map((t) => ({
        id: t.id,
        title: t.title,
        category: t.category,
        categoryLabel: t.categoryLabel,
        priceThb: t.priceThb,
        duration: t.duration,
        featured: t.featured,
        image: t.image,
        excerpt: t.excerpt,
        gallery: t.gallery,
        programImages: t.programImages,
      })),
      faqs: faqs.map((f) => ({ question: f.question, answer: f.answer })),
      testimonials: testimonials.map((tm) => ({
        name: tm.name,
        type: tm.type,
        tour: tm.tour,
        stars: tm.stars ?? 5,
        text: tm.text,
      })),
      homeSettings,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `phuket-cms-data-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Site verisi JSON olarak indirildi');
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['ID,Musteri,Telefon,Otel,Oda,Turlar,Tarihler,Yetiskin,Cocuk,ToplamTHB,OdenenTHB,KalanTHB,Durum\n'];
    const rows = bookings.map((b) => {
      const toursSummary = (b.tours || [{ tourTitle: b.tourTitle, tourDate: b.tourDate }])
        .map((t) => `${t.tourTitle} (${t.tourDate})`)
        .join(' + ');
      const datesSummary = (b.tours || [{ tourDate: b.tourDate }]).map((t) => t.tourDate).join('; ');
      return `"${b.id}","${b.customerName}","${b.phone}","${b.hotel}","${b.roomNumber || ''}","${toursSummary}","${datesSummary}",${b.adultCount},${b.childCount},${b.totalPriceThb},${b.paidAmountThb},${b.remainingAmountThb},"${b.status}"\n`;
    });
    const blob = new Blob([...headers, ...rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `phuket_tatili_rezervasyonlar_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ----------------------------------------------------
  // PANEL — kimlik doğrulama sunucuda (src/middleware.ts).
  // Bu bileşen yalnızca geçerli oturumu olan isteklerde render edilir.
  // ----------------------------------------------------
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex">
      <AdminSidebar
        isMobileSidebarOpen={isMobileSidebarOpen}
        onMobileSidebarClose={() => setIsMobileSidebarOpen(false)}
        isSidebarCollapsed={isSidebarCollapsed}
        categoryFilter={categoryFilter}
        onSelectCategory={handleSelectCategory}
        operationNavItems={operationNavItems}
        financeNavItems={financeNavItems}
        cmsNavItems={cmsNavItems}
        systemNavItems={systemNavItems}
        activeTab={activeTab}
        onTabSelect={handleTabSelect}
        pendingBookingsCount={pendingBookingsCount}
        bookingsCount={bookings.length}
        roleBadgeLabel={roleBadge.label}
        onToggleCollapse={toggleSidebar}
        logoUrl={siteSettings.logoUrl}
        logoText={siteSettings.logoText || siteSettings.siteTitle}
      />

      {/* 3. Ana Sütun (Header + Main) */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Üst İnce Header Bar — AdminHeader bileşeni (hızlı araçlar menüsü dahil) */}
        <AdminHeader
          activeNavItem={activeNavItem}
          onMobileSidebarOpen={() => setIsMobileSidebarOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onNewBooking={handleOpenCreateBooking}
          onLogout={handleLogout}
          isSigningOut={isSigningOut}
          canCreateBookings={perms.canCreateBookings}
          sync={{ isOnline, isCloudConnected, isSyncing, pendingSyncCount, failedSyncItems, lastSyncedAt }}
          onManualSync={handleManualSync}
          actions={headerActions}
          logoUrl={siteSettings.logoUrl}
          logoText={siteSettings.logoText || siteSettings.siteTitle}
        />

        {/* Main Content */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 md:pb-8">
          <AdminErrorBoundary
            tabName={activeNavItem?.label}
            onResetToOverview={() => setActiveTab('overview')}
          >
            <React.Suspense
              fallback={
                <div className="flex flex-col items-center justify-center py-24 space-y-3 text-slate-400">
                  <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-medium">Bölüm yükleniyor...</span>
                </div>
              }
            >
        
        {/* ==================================================== */}
        {/* TAB 1: OVERVIEW */}
        {/* ==================================================== */}
        {activeTab === 'overview' && (
          <OverviewTab
            stats={stats}
            bookings={bookings}
            tours={tours}
            bookingsCount={bookings.length}
            toursCount={tours.length}
            servicesCount={services.length}
            blogsCount={blogs.length}
            faqsCount={faqs.length}
            testimonialsCount={testimonials.length}
            canViewFinancialMargins={perms.canViewFinancialMargins}
            setActiveTab={setActiveTab}
            onOpenCreateBooking={perms.canCreateBookings ? handleOpenCreateBooking : undefined}
            onOpenQrScanner={() => setIsQrScannerOpen(true)}
            onOpenPoliceManifest={() => setIsPoliceManifestOpen(true)}
            onOpenBulkReschedule={perms.canAssignTransfers ? () => setIsBulkRescheduleOpen(true) : undefined}
            onOpenWorkflow={(b) => setWorkflowBooking(b)}
            showToast={showToast}
            sync={{
              isOnline,
              isCloudConnected,
              isSyncing,
              pendingSyncCount,
              failedSyncItems,
              lastSyncedAt,
            }}
          />
        )}

        {/* ==================================================== */}
        {/* TAB 2: BOOKINGS CRM */}
        {/* ==================================================== */}
        {activeTab === 'bookings' && (
          <BookingsTab
            filteredBookings={filteredBookings}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            onExportCSV={handleExportCSV}
            onOpenCreate={handleOpenCreateBooking}
            onOpenEdit={handleOpenEditBooking}
            onDelete={handleDeleteBooking}
            canDelete={canDeleteBookings}
            setVoucherBooking={setVoucherBooking}
            setWhatsAppModalBooking={setWhatsAppModalBooking}
            onQuickCollect={(_b) => setActiveTab('finance')}
            googleReviewUrl={siteSettings.googleReviewUrl}
            onOpenQuotePdf={(b) =>
              setCuratedProposalData({
                customerName: b.customerName,
                hotel: b.hotel,
                phone: b.phone,
                proposalType: 'single_tour',
                tourTitle: b.tourTitle,
                tourDate: b.tourDate,
                adultCount: b.adultCount,
                childCount: b.childCount,
              })
            }
            onOpenDietaryManifest={() => setIsDietaryManifestOpen(true)}
            onOpenFieldCashier={(b) => {
              setCashierBooking(b || null);
              setIsFieldCashierOpen(true);
            }}
            onOpenFlightRadar={(flight, guest) => {
              setFlightRadarFlight(flight || 'TK 172');
              setFlightRadarGuest(guest || '');
              setIsFlightRadarOpen(true);
            }}
            onOpenWelcomeBoard={(b) => {
              setWelcomeBoardBooking(b);
              setIsWelcomeBoardOpen(true);
            }}
            onOpenTourMedia={(b) => {
              setTourMediaBooking(b);
              setIsTourMediaOpen(true);
            }}
            onUpdateStatus={(b, nextStatus) => {
              const statusLabels: Record<string, string> = {
                confirmed: '🟢 Onaylandı',
                inquiry: '🟡 Teklif / Talep',
                completed: '🔵 Tamamlandı',
                cancelled: '🔴 İptal Edildi',
              };
              handleUpdateSingleBooking(
                { ...b, status: nextStatus },
                `Durum güncellendi: ${statusLabels[nextStatus] || nextStatus}`
              );
            }}
            onOpenSupplierDispatch={(b) => {
              setSupplierDispatchBooking(b);
              setIsSupplierDispatchOpen(true);
            }}
            onOpenPromptPayQr={(b) => {
              setPromptPayQrBooking(b);
              setIsPromptPayQrOpen(true);
            }}
            onOpenWorkflow={(b) => setWorkflowBooking(b)}
          />
        )}

        {/* ==================================================== */}
        {/* TAB 2.3: ERP FINANCE & CASHFLOW */}
        {/* ==================================================== */}
        {activeTab === 'finance' && perms.allowedTabs.includes('finance') && (
          <FinanceTab
            bookings={bookings}
            payments={payments}
            onAddPayment={handleAddPayment}
            onUpdateBooking={(updated) =>
              handleUpdateSingleBooking(updated, 'Ödeme ve bakiye durumu güncellendi! 💳')
            }
            showToast={showToast}
            setVoucherBooking={setVoucherBooking}
          />
        )}

        {/* ==================================================== */}
        {/* TAB 2.5: TRANSFERS & DRIVER MANIFEST */}
        {/* ==================================================== */}
        {activeTab === 'transfers' && (
          <TransfersTab
            bookings={bookings || []}
            manifestDate={manifestDate || new Date().toISOString().split('T')[0]}
            setManifestDate={setManifestDate}
            vehicles={vehicles || []}
            drivers={drivers || []}
            googleReviewUrl={siteSettings.googleReviewUrl}
            showToast={showToast}
            handleAssignVehicleToBooking={handleAssignVehicleToBooking}
            handleAssignDriverToBooking={handleAssignDriverToBooking}
            handleUpdatePickupStatus={handleUpdatePickupStatus}
            handleUpdatePickupTime={handleUpdatePickupTime}
            setWhatsAppModalBooking={setWhatsAppModalBooking}
            setVoucherBooking={setVoucherBooking}
            onOpenPoliceManifest={() => setIsPoliceManifestOpen(true)}
            onOpenQrScanner={() => setIsQrScannerOpen(true)}
            onOpenLostFound={() => setIsLostFoundOpen(true)}
            onOpenDietaryManifest={() => setIsDietaryManifestOpen(true)}
            onOpenFieldCashier={() => {
              setCashierBooking(null);
              setIsFieldCashierOpen(true);
            }}
            onOpenFlightRadar={() => {
              setFlightRadarFlight('TK 172');
              setFlightRadarGuest('');
              setIsFlightRadarOpen(true);
            }}
            onOpenDriverExpense={() => setIsDriverExpenseOpen(true)}
            onOpenGuideExpense={() => setIsGuideExpenseOpen(true)}
            onOpenWelcomeBoard={(b) => {
              setWelcomeBoardBooking(b || null);
              setIsWelcomeBoardOpen(true);
            }}
            onOpenLuggageExpress={() => setIsLuggageExpressOpen(true)}
            onOpenCaptainVault={() => setIsCaptainDrawerOpen(true)}
            onOpenCuratedProposal={(b) => {
              setCuratedProposalData(
                b
                  ? { customerName: b.customerName, hotel: b.hotel, zone: b.hotelZone }
                  : { customerName: 'Begüm & Canberk Özkan', hotel: 'The Shore at Katathani', zone: 'Kata & Karon' }
              );
            }}
          />
        )}

        {/* ==================================================== */}
        {/* TAB 2.45: TEKLİFLER STÜDYOSU (ÇOK GÜNLÜ & TEKLİ TUR) */}
        {/* ==================================================== */}
        {activeTab === 'proposals' && (
          <div className="w-full">
            <CuratedProposalModal
              isOpen={true}
              isEmbedded={true}
              onClose={() => setActiveTab('transfers')}
              showToast={showToast}
              initialCustomerName="Begüm & Canberk Özkan"
              initialHotel="The Shore at Katathani"
              initialZone="Kata & Karon"
              onConvertToBooking={handleConvertProposalToBooking}
            />
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2.55: SUPPLIER SETTLEMENTS & PROFIT ENGINE */}
        {/* ==================================================== */}
        {activeTab === 'settlements' && perms.canViewFinancialMargins && (
          <SupplierSettlementManager
            bookings={bookings}
            onUpdateBooking={(updated) =>
              handleUpdateSingleBooking(updated, 'Tedarikçi maliyeti güncellendi! 💰')
            }
            managerPhone={siteSettings.whatsappNumber}
          />
        )}

        {/* ==================================================== */}
        {/* TAB 2.6: FLEET & CREW (Araç Filosu + Şoför/Rehber Kadrosu) */}
        {/* ==================================================== */}
        {activeTab === 'fleet' && (
          <FleetManager
            vehicles={vehicles}
            drivers={drivers}
            onSaveVehicles={saveVehicles}
            onSaveDrivers={saveDrivers}
            showToast={showToast}
          />
        )}

        {/* ==================================================== */}
        {/* TAB 2.7: B2B PARTNER & SUB-AGENCY PORTAL (FAZ 2) */}
        {/* ==================================================== */}
        {activeTab === 'partners' && (
          <PartnersTab
            agents={agents}
            bookings={bookings}
            onSaveAgents={saveAgents}
            showToast={showToast}
            managerPhone={siteSettings.whatsappNumber}
          />
        )}

        {/* ==================================================== */}
        {/* TAB 2.8: TEDARİKÇİ & NET MALİYET KATALOĞU (FAZ 3) */}
        {/* ==================================================== */}
        {activeTab === 'suppliers' && (
          <SuppliersTab
            suppliers={suppliers}
            tourCosts={tourCosts}
            tours={tours}
            onSaveSuppliers={saveSuppliers}
            onSaveTourCosts={saveTourCosts}
            showToast={showToast}
          />
        )}

        {/* ==================================================== */}
        {/* TAB 3: TOURS & PRICES */}
        {/* ==================================================== */}
        {activeTab === 'tours' && (
          <ToursTab
            tours={tours}
            filteredTours={filteredTours}
            tourSearchQuery={tourSearchQuery}
            setTourSearchQuery={setTourSearchQuery}
            tourCategoryFilter={tourCategoryFilter}
            setTourCategoryFilter={setTourCategoryFilter}
            tourCategoryOptions={tourCategoryOptions}
            getImageUrl={getImageUrl}
            onOpenCreate={handleOpenCreateTour}
            onOpenEdit={handleOpenEditTour}
            onToggleFeatured={handleToggleTourFeatured}
            onDelete={handleDeleteTour}
            onOpenQuotePdf={(t) =>
              setCuratedProposalData({
                customerName: 'Sayın Misafirimiz',
                proposalType: 'single_tour',
                tourTitle: t.title,
                adultCount: 2,
                childCount: 0,
              })
            }
            onBulkUpdateTours={(updatedTours) => {
              saveTours(updatedTours);
              showToast('Tüm fiyat ve süre değişiklikleri başarıyla kaydedildi! ⚡');
            }}
            onOpenMultiTourProposal={(selectedTours) => {
              setCuratedProposalData({
                customerName: 'Sayın Misafirimiz',
                proposalType: selectedTours.length === 1 ? 'single_tour' : 'package_multiday',
                tourTitle: selectedTours[0]?.title || 'Özel Phuket Tur Paketi',
                adultCount: 2,
                childCount: 0,
              });
            }}
          />
        )}

        {/* ==================================================== */}
        {/* TAB: HOMEPAGE DESIGN & SECTION STUDIO */}
        {/* ==================================================== */}
        {activeTab === 'homepage' && (
          <HomeEditorTab
            homeSettings={homeSettings}
            setHomeSettings={setHomeSettings}
            onSave={saveHomeSettings}
            getImageUrl={getImageUrl}
            handleFileUpload={handleFileUpload}
            allImageOptions={allImageOptions}
            mediaList={mediaList}
            showToast={showToast}
          />
        )}

        {/* ==================================================== */}
        {/* TAB: MEDIA & PHOTO LIBRARY */}
        {/* ==================================================== */}
        {activeTab === 'media' && (
          <MediaTab
            mediaSearchQuery={mediaSearchQuery}
            setMediaSearchQuery={setMediaSearchQuery}
            mediaTypeFilter={mediaTypeFilter}
            setMediaTypeFilter={setMediaTypeFilter}
            filteredMedia={filteredMedia}
            getImageUrl={getImageUrl}
            handleFileUpload={handleFileUpload}
            onOpenUrlModal={() => {
              setMediaUploadMode('url');
              setNewMediaTitle('');
              setNewMediaUrl('');
              setIsAddMediaModalOpen(true);
            }}
            setSelectedLightboxMedia={setSelectedLightboxMedia}
            setAssignMediaModal={setAssignMediaModal}
            handleCopyMediaUrl={handleCopyMediaUrl}
            handleDeleteMedia={handleDeleteMedia}
            onUpdateMedia={(id, patch) => {
              const next = mediaList.map((m) => (m.id === id ? { ...m, ...patch } : m));
              saveMediaList(next);
              showToast('Görsel güncellendi.');
            }}
          />
        )}

        {/* ==================================================== */}
        {/* TAB 4: SERVICES MANAGEMENT */}
        {/* ==================================================== */}
        {activeTab === 'services' && (
          <ServicesTab services={services} onOpenEdit={handleOpenEditService} />
        )}

        {/* ==================================================== */}
        {/* TAB 5: BLOG ARTICLES */}
        {/* ==================================================== */}
        {activeTab === 'blogs' && (
          <BlogsTab
            blogs={blogs}
            onOpenCreate={handleOpenCreateBlog}
            onOpenEdit={handleOpenEditBlog}
            onDelete={handleDeleteBlog}
          />
        )}

        {/* ==================================================== */}
        {/* TAB 6: FAQS */}
        {/* ==================================================== */}
        {activeTab === 'faqs' && (
          <FaqsTab
            faqs={faqs}
            onOpenCreate={handleOpenCreateFaq}
            onOpenEdit={handleOpenEditFaq}
            onDelete={handleDeleteFaq}
          />
        )}

        {/* ==================================================== */}
        {/* TAB 7: TESTIMONIALS */}
        {/* ==================================================== */}
        {activeTab === 'testimonials' && (
          <TestimonialsTab
            testimonials={testimonials}
            onOpenCreate={handleOpenCreateTesti}
            onOpenEdit={handleOpenEditTesti}
            onDelete={handleDeleteTesti}
          />
        )}

        {/* ==================================================== */}
        {/* TAB 8: WHATSAPP TEMPLATES */}
        {activeTab === 'whatsapp' && (
          <WhatsAppTab
            bookings={bookings}
            onUpdateBooking={handleUpdateSingleBooking}
            showToast={showToast}
          />
        )}

        {/* ==================================================== */}
        {/* TAB 9: SITE & HERO SETTINGS */}
        {/* ==================================================== */}
        {activeTab === 'settings' && perms.canManageSettings && (
          <SettingsTab
            siteSettings={siteSettings}
            setSiteSettings={setSiteSettings}
            settingsSaved={settingsSaved}
            onSave={handleSaveSettings}
            getImageUrl={getImageUrl}
            handleFileUpload={handleFileUpload}
            allImageOptions={allImageOptions}
            mediaList={mediaList}
            viewerRole={viewerRole}
            showToast={showToast}
            onExportSiteData={handleExportSiteData}
          />
        )}

        {/* TAB 10: EKİP ÜYELERİ — yalnızca owner (üyelik sistemi).
            manager paneli görür ama bu sekmeyi görmez; API tarafında
            ayrıca owner-only guard çalışır (UI gizlemesi kozmetik). */}
        {activeTab === 'users' && perms.canManageUsers && (
          <UsersTab showToast={showToast} />
        )}
            </React.Suspense>
          </AdminErrorBoundary>
        </main>

        {/* ==================================================== */}
        {/* MOBİL ERGONOMİK ALT BAR (TEK BAŞPARMAKLA HIZLI ERİŞİM) */}
        {/* ==================================================== */}
        <nav
          aria-label="Mobil Hızlı Alt Bar"
          className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-surface-1/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-3 py-1.5 flex items-center justify-around shadow-2xl"
        >
          <button
            type="button"
            onClick={() => handleTabSelect('overview')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-w-[56px] cursor-pointer ${
              activeTab === 'overview'
                ? 'text-brand-primary dark:text-brand-accent font-black'
                : 'text-slate-500 dark:text-slate-400 font-medium'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Özet</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabSelect('bookings')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-w-[56px] relative cursor-pointer ${
              activeTab === 'bookings'
                ? 'text-brand-primary dark:text-brand-accent font-black'
                : 'text-slate-500 dark:text-slate-400 font-medium'
            }`}
          >
            <div className="relative">
              <Users className="w-5 h-5" />
              {pendingBookingsCount > 0 && (
                <span className="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[9px] font-black animate-pulse">
                  {pendingBookingsCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5">Rezervasyon</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabSelect('transfers')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-w-[56px] cursor-pointer ${
              activeTab === 'transfers'
                ? 'text-brand-primary dark:text-brand-accent font-black'
                : 'text-slate-500 dark:text-slate-400 font-medium'
            }`}
          >
            <Car className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Transfer</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabSelect('finance')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-w-[56px] cursor-pointer ${
              activeTab === 'finance'
                ? 'text-brand-primary dark:text-brand-accent font-black'
                : 'text-slate-500 dark:text-slate-400 font-medium'
            }`}
          >
            <Wallet className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Kasa</span>
          </button>

          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-w-[56px] text-slate-500 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Tüm Menü</span>
          </button>
        </nav>
      </div>

      {/* ==================================================== */}
      {/* MODAL 1: BOOKING */}
      {/* ==================================================== */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingBooking={editingBooking}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmitBooking}
        tours={tours}
        bookings={bookings}
        agents={agents}
        suppliers={suppliers}
        tourCosts={tourCosts}
        showToast={showToast}
      />

      {/* ==================================================== */}
      {/* MODAL 2: TOUR (DEEP & COMPREHENSIVE EDITOR) */}
      {/* ==================================================== */}
      <TourModal
        isOpen={isTourModalOpen}
        onClose={() => setIsTourModalOpen(false)}
        editingTour={editingTour}
        tourFormData={tourFormData}
        setTourFormData={setTourFormData}
        onSubmit={handleSubmitTour}
        getImageUrl={getImageUrl}
        handleFileUpload={handleFileUpload}
        allImageOptions={allImageOptions}
        mediaList={mediaList}
        allTours={tours}
      />

      {/* ==================================================== */}
      {/* MODAL 3: BLOG */}
      {/* ==================================================== */}
        {isBlogModalOpen && (
          <BlogModal
            editingBlog={editingBlog}
            blogFormData={blogFormData}
            setBlogFormData={setBlogFormData}
            onSubmit={handleSubmitBlog}
            onClose={() => setIsBlogModalOpen(false)}
            getImageUrl={getImageUrl}
            handleFileUpload={handleFileUpload}
            allImageOptions={allImageOptions}
            mediaList={mediaList}
          />
        )}

      {/* ==================================================== */}
      {/* MODAL 4: SERVICE */}
      {/* ==================================================== */}
        {isServiceModalOpen && (
          <ServiceModal
            serviceFormData={serviceFormData}
            setServiceFormData={setServiceFormData}
            onSubmit={handleSubmitService}
            onClose={() => setIsServiceModalOpen(false)}
            getImageUrl={getImageUrl}
            handleFileUpload={handleFileUpload}
            allImageOptions={allImageOptions}
            mediaList={mediaList}
          />
        )}

      {/* ==================================================== */}
      {/* MODAL 5: FAQ */}
      {/* ==================================================== */}
        {isFaqModalOpen && (
          <FaqModal
            editingFaq={editingFaq}
            faqFormData={faqFormData}
            setFaqFormData={setFaqFormData}
            onSubmit={handleSubmitFaq}
            onClose={() => setIsFaqModalOpen(false)}
          />
        )}

      {/* ==================================================== */}
      {/* MODAL 6: TESTIMONIAL */}
      {/* ==================================================== */}
        {isTestiModalOpen && (
          <TestimonialModal
            editingTesti={editingTesti}
            testiFormData={testiFormData}
            setTestiFormData={setTestiFormData}
            onSubmit={handleSubmitTesti}
            onClose={() => setIsTestiModalOpen(false)}
          />
        )}

      {/* ==================================================== */}
      {/* MODAL 7: ADD MEDIA (FOTOĞRAF YÜKLE / URL EKLE) */}
      {/* ==================================================== */}
        {isAddMediaModalOpen && (
          <AddMediaModal
            mediaUploadMode={mediaUploadMode}
            setMediaUploadMode={setMediaUploadMode}
            newMediaTitle={newMediaTitle}
            setNewMediaTitle={setNewMediaTitle}
            newMediaUrl={newMediaUrl}
            setNewMediaUrl={setNewMediaUrl}
            onSubmit={handleAddMediaSubmit}
            onClose={() => setIsAddMediaModalOpen(false)}
            getImageUrl={getImageUrl}
          />
        )}

      {/* ==================================================== */}
      {/* MODAL 8: LIGHTBOX (BÜYÜK BOYUT GÖRSEL İNCELEME) */}
      {/* ==================================================== */}
        {selectedLightboxMedia && (
          <MediaLightboxModal
            media={selectedLightboxMedia}
            onClose={() => setSelectedLightboxMedia(null)}
            onCopyUrl={handleCopyMediaUrl}
            onAssignToTour={() => {
              setAssignMediaModal(selectedLightboxMedia);
              setSelectedLightboxMedia(null);
            }}
            getImageUrl={getImageUrl}
          />
        )}

      {/* ==================================================== */}
      {/* MODAL 9: ASSIGN PHOTO AS TOUR COVER */}
      {/* ==================================================== */}
      {assignMediaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-2 w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6">
            <h3 className="font-bold font-serif text-lg text-slate-900 dark:text-white mb-2">
              Fotoğrafı Tura Ata
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              "{assignMediaModal.title}" görselini hangi turun kapağına veya galerisine eklemek istersiniz?
            </p>

            <div className="mb-4">
              <img
                src={getImageUrl(assignMediaModal.url)}
                alt="Seçilen Görsel"
                className="w-full h-32 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="space-y-2 mb-6">
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                Hedef Turu Seçin
              </label>
              <select
                id="assignTourSelect"
                defaultValue={tours[0]?.id || ''}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
              >
                {tours.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setAssignMediaModal(null)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={() => {
                  const sel = (document.getElementById('assignTourSelect') as HTMLSelectElement)?.value;
                  if (sel) handleAddMediaToTourGallery(assignMediaModal.url, sel);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-colors"
              >
                🖼️ Galeriye Ekle
              </button>
              <button
                type="button"
                onClick={() => {
                  const sel = (document.getElementById('assignTourSelect') as HTMLSelectElement)?.value;
                  if (sel) handleAssignMediaAsTourCover(assignMediaModal.url, sel);
                }}
                className="px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-bold shadow-md transition-colors"
              >
                ⭐ Kapak Olarak Ata
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 10: OFFICIAL TOUR VOUCHER / DIGITAL TICKET (QR BOARDING PASS) */}
      {/* ==================================================== */}
      {voucherBooking && (
        <BoardingPassModal
          booking={voucherBooking}
          tourIndex={0}
          managerPhone={siteSettings.whatsappNumber}
          onClose={() => setVoucherBooking(null)}
        />
      )}

      {/* ==================================================== */}
      {/* MODAL 11: WHATSAPP AUTOMATION TEMPLATES */}
      {/* ==================================================== */}
      {whatsAppModalBooking && (
        <WhatsAppTemplatesModal
          booking={whatsAppModalBooking}
          managerPhone={siteSettings.whatsappNumber}
          onClose={() => setWhatsAppModalBooking(null)}
        />
      )}

      {/* ==================================================== */}
      {/* MODAL 12: THAI MARINE POLICE & PASSENGER MANIFEST */}
      {/* ==================================================== */}
      {isPoliceManifestOpen && (
        <MarinePoliceManifestModal
          date={manifestDate}
          bookings={bookings.filter(
            (b) =>
              b.tourDate === manifestDate ||
              b.tours?.some((t) => t.tourDate === manifestDate)
          )}
          onUpdatePassengers={handleUpdateBookingPassengers}
          onClose={() => setIsPoliceManifestOpen(false)}
        />
      )}

      {/* ==================================================== */}
      {/* MODAL 13: QR CODE TICKET SCANNER & CHECK-IN (SAHA ENTEGRASYONU) */}
      {/* ==================================================== */}
      {isQrScannerOpen && (
        <QrScannerModal
          isOpen={isQrScannerOpen}
          onClose={() => setIsQrScannerOpen(false)}
          onScanResult={handleQrScanResult}
        />
      )}

      {/* ==================================================== */}
      {/* MODAL 14: SPOTLIGHT & COMMAND PALETTE (CMD+K / CTRL+K) */}
      {/* ==================================================== */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        bookings={bookings}
        navItems={visibleNavItems}
        onSelectTab={handleTabSelect}
        onOpenCreateBooking={handleOpenCreateBooking}
        onOpenQrScanner={() => setIsQrScannerOpen(true)}
        onOpenPoliceManifest={() => setIsPoliceManifestOpen(true)}
        onOpenBulkReschedule={() => setIsBulkRescheduleOpen(true)}
        onOpenLostFound={() => setIsLostFoundOpen(true)}
        onOpenDietaryManifest={() => setIsDietaryManifestOpen(true)}
        onOpenFieldCashier={() => {
          setCashierBooking(null);
          setIsFieldCashierOpen(true);
        }}
        onSelectBooking={(b) => handleOpenEditBooking(b)}
        tours={tours}
        onSelectTour={(t) => handleOpenEditTour(t)}
        onOpenWorkflow={(b) => setWorkflowBooking(b)}
        onSetNavMode={(mode) => {
          const cat = mode === 'operations' ? 'operations' : 'content';
          setCategoryFilter(cat);
          safeSetRaw('ptt_admin_nav_category', cat);
        }}
      />

      {/* ==================================================== */}
      {/* MODAL 15: BULK WEATHER RESCHEDULE & MARINE RADAR */}
      {/* ==================================================== */}
      {isBulkRescheduleOpen && (
        <BulkRescheduleModal
          isOpen={isBulkRescheduleOpen}
          onClose={() => setIsBulkRescheduleOpen(false)}
          bookings={bookings}
          onBulkReschedule={handleBulkReschedule}
          managerPhone={siteSettings.whatsappNumber}
        />
      )}

      {/* ==================================================== */}
      {/* MODAL 16: KAYIP EŞYA MASASI (LOST & FOUND HUB) */}
      {/* ==================================================== */}
      {isLostFoundOpen && (
        <LostFoundModal
          isOpen={isLostFoundOpen}
          onClose={() => setIsLostFoundOpen(false)}
          showToast={showToast}
        />
      )}

      {/* ==================================================== */}
      {/* MODAL 17: DİYET & MEDİKAL EMNİYET MANİFESTOSU */}
      {/* ==================================================== */}
      {isDietaryManifestOpen && (
        <DietaryManifestModal
          isOpen={isDietaryManifestOpen}
          onClose={() => setIsDietaryManifestOpen(false)}
          bookings={bookings}
          showToast={showToast}
          defaultDate={manifestDate}
        />
      )}

      {/* ==================================================== */}
      {/* MODAL 18: SAHA ÇOKLU DÖVİZ & PARA ÜSTÜ KASA HESAPLAYICI */}
      {/* ==================================================== */}
      {isFieldCashierOpen && (
        <FieldCashierModal
          isOpen={isFieldCashierOpen}
          onClose={() => {
            setIsFieldCashierOpen(false);
            setCashierBooking(null);
          }}
          bookings={bookings}
          initialBooking={cashierBooking}
          showToast={showToast}
          onRecordPayment={(payment) => {
            handleAddPayment({
              bookingId: payment.bookingId || cashierBooking?.id || '',
              amountThb: payment.amountThb,
              method: 'cash_thb',
              collectedBy: 'Saha Kasa / Şoför',
              note: payment.note,
            });
          }}
        />
      )}

      {/* ==================================================== */}
      {/* MODAL 19: HAVALİMANI CANLI UÇUŞ RADARI (FLIGHT SENTINEL) */}
      {/* ==================================================== */}
      {isFlightRadarOpen && (
        <FlightRadarModal
          isOpen={isFlightRadarOpen}
          onClose={() => setIsFlightRadarOpen(false)}
          bookings={bookings}
          initialFlight={flightRadarFlight}
          initialGuestName={flightRadarGuest}
          showToast={showToast}
        />
      )}

      {/* ==================================================== */}
      {/* MODAL 20: ŞOFÖR SAHA YAKIT & HARÇ MASRAF MASASI */}
      {/* ==================================================== */}
      {isDriverExpenseOpen && (
        <DriverExpenseModal
          isOpen={isDriverExpenseOpen}
          onClose={() => setIsDriverExpenseOpen(false)}
          drivers={drivers}
          vehicles={vehicles}
          showToast={showToast}
        />
      )}

      {/* ==================================================== */}
      {/* MODAL 20.5: REHBER SAHA MASRAF & KARŞILAMA MASASI */}
      {/* ==================================================== */}
      {isGuideExpenseOpen && (
        <GuideExpenseModal
          isOpen={isGuideExpenseOpen}
          onClose={() => setIsGuideExpenseOpen(false)}
          drivers={drivers}
          showToast={showToast}
        />
      )}

      {/* ==================================================== */}
      {/* MODAL 21: VIP KARŞILAMA TABELA STÜDYOSU (TABLET & BASKI) */}
      {/* ==================================================== */}
      {isWelcomeBoardOpen && (
        <WelcomeBoardModal
          isOpen={isWelcomeBoardOpen}
          onClose={() => setIsWelcomeBoardOpen(false)}
          bookings={bookings}
          drivers={drivers}
          initialBooking={welcomeBoardBooking}
          showToast={showToast}
        />
      )}

      {/* ==================================================== */}
      {/* MODAL 22: MİSAFİR TUR FOTOĞRAF & VİDEO TESLİM KASASI */}
      {/* ==================================================== */}
      {isTourMediaOpen && (
        <TourMediaModal
          isOpen={isTourMediaOpen}
          onClose={() => setIsTourMediaOpen(false)}
          bookings={bookings}
          initialBooking={tourMediaBooking}
          showToast={showToast}
        />
      )}

      {/* ==================================================== */}
      {/* MODAL 23: OTELLER ARASI BAGAJ TRANSFER MASASI */}
      {/* ==================================================== */}
      {isLuggageExpressOpen && (
        <LuggageExpressModal
          isOpen={isLuggageExpressOpen}
          onClose={() => setIsLuggageExpressOpen(false)}
          bookings={bookings}
          drivers={drivers}
          showToast={showToast}
        />
      )}

      {/* ==================================================== */}
      {/* MODAL 24: İSKELE & KAPTAN OPERASYON MANİFESTOSU */}
      {/* ==================================================== */}
      {isPierManifestOpen && (
        <PierManifestModal
          isOpen={isPierManifestOpen}
          onClose={() => setIsPierManifestOpen(false)}
          bookings={bookings}
          showToast={showToast}
        />
      )}

      {/* ==================================================== */}
      {/* MODAL 25: TEDARİKÇİ WHATSAPP SİPARİŞİ (AUTO-DISPATCH) */}
      {/* ==================================================== */}
      {isSupplierDispatchOpen && supplierDispatchBooking && (
        <SupplierDispatchModal
          isOpen={isSupplierDispatchOpen}
          onClose={() => {
            setIsSupplierDispatchOpen(false);
            setSupplierDispatchBooking(null);
          }}
          booking={supplierDispatchBooking}
          suppliers={suppliers}
          onUpdateBookingSupplierStatus={handleUpdateSupplierStatus}
          showToast={showToast}
        />
      )}

      {/* ==================================================== */}
      {/* MODAL 26: PROMPTPAY CANLI QR ÖDEME MODALI */}
      {/* ==================================================== */}
      {isPromptPayQrOpen && promptPayQrBooking && (
        <PromptPayQrModal
          isOpen={isPromptPayQrOpen}
          onClose={() => {
            setIsPromptPayQrOpen(false);
            setPromptPayQrBooking(null);
          }}
          bookingRef={promptPayQrBooking.ticketCode || promptPayQrBooking.id}
          customerName={promptPayQrBooking.customerName}
          initialAmountThb={
            (promptPayQrBooking.remainingAmountThb || 0) > 0
              ? promptPayQrBooking.remainingAmountThb
              : promptPayQrBooking.totalPriceThb
          }
          promptPayTarget={siteSettings.whatsappNumber}
          onMarkPaid={(amt) => {
            handleAddPayment({
              bookingId: promptPayQrBooking.id,
              amountThb: amt,
              method: 'promptpay',
              collectedBy: 'PromptPay QR (Online/Saha)',
              note: `PromptPay ile tahsil edildi (${promptPayQrBooking.customerName})`,
            });
            showToast(`✅ ${amt.toLocaleString()} THB PromptPay tahsilatı işlendi!`);
          }}
          showToast={showToast}
        />
      )}

      {/* ==================================================== */}
      {/* MODAL 27: KİŞİYE ÖZEL LOGOLU PDF TUR TEKLİFİ & TATİL BROŞÜRÜ */}
      {/* ==================================================== */}
      {curatedProposalData && (
        <CuratedProposalModal
          isOpen={Boolean(curatedProposalData)}
          onClose={() => setCuratedProposalData(null)}
          showToast={showToast}
          initialCustomerName={curatedProposalData.customerName}
          initialHotel={curatedProposalData.hotel}
          initialZone={curatedProposalData.zone}
          initialPhone={curatedProposalData.phone}
          initialProposalType={curatedProposalData.proposalType}
          initialTourTitle={curatedProposalData.tourTitle}
          initialTourDate={curatedProposalData.tourDate}
          initialAdultCount={curatedProposalData.adultCount}
          initialChildCount={curatedProposalData.childCount}
          onConvertToBooking={handleConvertProposalToBooking}
        />
      )}

      {/* ==================================================== */}
      {/* MODAL 28: ANDAMAN DENİZİ ÇEVRİMDIŞI KAPTAN KASASI & ACİL REHBER (PWA) */}
      {/* ==================================================== */}
      {isCaptainDrawerOpen && (
        <CaptainOfflineDrawer
          isOpen={isCaptainDrawerOpen}
          onClose={() => setIsCaptainDrawerOpen(false)}
          currentDate={manifestDate || new Date().toISOString().split('T')[0]}
          pickups={buildDailyPickups(bookings || [], manifestDate || new Date().toISOString().split('T')[0])}
          showToast={showToast}
        />
      )}

      {/* ==================================================== */}
      {/* MODAL 29: SAHA İŞ AKIŞI & GÖREV ADIMLARI (PIPELINE) */}
      {/* ==================================================== */}
      {workflowBooking && (
        <BookingWorkflowModal
          isOpen={Boolean(workflowBooking)}
          onClose={() => setWorkflowBooking(null)}
          booking={workflowBooking}
          onUpdateBooking={handleUpdateSingleBooking}
          vehicles={vehicles}
          drivers={drivers}
          showToast={showToast}
        />
      )}

      {/* ==================================================== */}
      {/* TOAST FEEDBACK NOTIFICATION */}
      {/* ==================================================== */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl bg-slate-900/95 text-white text-xs sm:text-sm font-bold shadow-2xl border border-slate-700/80 flex items-center gap-2.5 backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-brand-accent animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
