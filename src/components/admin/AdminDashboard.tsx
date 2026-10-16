import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Users,
  Compass,
  DollarSign,
  TrendingUp,
  Plus,
  Trash2,
  MessageCircle,
  Clock,
  FileText,
  LogOut,
  Sparkles,
  Settings,
  HelpCircle,
  RefreshCw,
  Save,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  BookOpen,
  Car,
  MessageSquareQuote,
  Image,
  Upload,
  Layers,
  ListChecks,
  Briefcase,
  Smartphone,
  Bus,
  Zap,
  Wallet,
  Building,
  Ship,
  Camera,
  Globe,
  Search,
  Package,
  ShieldAlert,
  Coins,
  Plane,
  Fuel,
  Luggage,
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
  calculateAgentCommission,
  lookupTourCost,
  HOTEL_ZONES,
  detectHotelZone,
  getRecommendedPickupTime,
  getPhuketSeason,
} from '../../data/adminInitialData';
import CommandPaletteModal from './CommandPaletteModal';
import BulkRescheduleModal from './BulkRescheduleModal';
import TourQuotePdfModal from './TourQuotePdfModal';
import BoardingPassModal from '../shared/BoardingPassModal';
import FleetManager from './FleetManager';
import SupplierSettlementManager from './SupplierSettlementManager';
import SettingsTab, { type SiteSettingsState } from './SettingsTab';
import UsersTab from './UsersTab';
import WhatsAppTab from './WhatsAppTab';
import TestimonialsTab from './TestimonialsTab';
import FaqsTab from './FaqsTab';
import BlogsTab from './BlogsTab';
import ServicesTab from './ServicesTab';
import MediaTab from './MediaTab';
import ToursTab from './ToursTab';
import TransfersTab from './TransfersTab';
import OverviewTab from './OverviewTab';
import BookingsTab from './BookingsTab';
import FinanceTab from './FinanceTab';
import PartnersTab from './PartnersTab';
import SuppliersTab from './SuppliersTab';
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
import WelcomeBoardModal from './WelcomeBoardModal';
import TourMediaModal from './TourMediaModal';
import LuggageExpressModal from './LuggageExpressModal';
import AdminErrorBoundary from './AdminErrorBoundary';
import {
  loadCmsCollections,
  saveCmsCollection,
  writeLocalCollection,
  type CmsCollectionKey,
} from '../../lib/cmsSync';
import { filterBookings, filterTours } from '../../lib/adminFilters';
import { calculateTourOccupancy, getTourCapacity } from '../../lib/allotment';
import {
  isSupabaseConfigured,
  subscribeBookingsSignal,
} from '../../lib/supabase';
import { generateTicketCode } from '../../lib/ticketCodes';
import { useAdminStore } from '../../stores/useAdminStore';
import { getRolePermissions, getRoleBadge } from '../../lib/rbac';

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

/* ---------------------------------------------------------------------------
   PANEL MENÜSÜ — tek kaynak
   Sekmeler üç iş grubuna ayrılır: Operasyon (bugün sahada ne oluyor),
   İçerik (sitede ne görünüyor), Sistem (iletişim + ayarlar).
   Bir sekme eklemek için yalnızca buraya bir satır yazmak yeterlidir;
   JSX'te tekrarlanan buton bloğu yoktur.
   ------------------------------------------------------------------------- */

export type AdminTab =
  | 'overview' | 'bookings' | 'finance' | 'transfers' | 'partners' | 'settlements' | 'suppliers' | 'fleet'
  | 'tours' | 'media' | 'services' | 'blogs' | 'faqs' | 'testimonials'
  | 'whatsapp' | 'settings' | 'users';

export type NavCategory = 'operations' | 'content' | 'system' | 'all';

export interface NavItem {
  id: AdminTab;
  label: string;
  shortLabel?: string;
  category: 'operations' | 'content' | 'system';
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  hotkey?: string;
  showCount?: boolean;
}

export interface NavCategoryDef {
  id: NavCategory;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export const NAV_CATEGORIES: NavCategoryDef[] = [
  {
    id: 'operations',
    label: 'Operasyon & Finans',
    shortLabel: 'Operasyon',
    icon: Zap,
    description: 'Günlük rezervasyon, transfer, filo ve hakediş yönetimi',
  },
  {
    id: 'content',
    label: 'Web & İçerik',
    shortLabel: 'İçerik',
    icon: Compass,
    description: 'Turlar, medya, blog, hizmetler ve vitrin yönetimi',
  },
  {
    id: 'system',
    label: 'Sistem & Ayarlar',
    shortLabel: 'Sistem',
    icon: Settings,
    description: 'WhatsApp şablonları ve site ayarları',
  },
  {
    id: 'all',
    label: 'Tüm Menü',
    shortLabel: 'Tümü',
    icon: Layers,
    description: 'Tüm yönetim modüllerini tek bakışta gör',
  },
];

export const NAV_ITEMS: NavItem[] = [
  // ⚡ OPERASYON & FİNANS (Günlük Kullanım)
  {
    id: 'overview',
    label: 'Genel Bakış',
    shortLabel: 'Özet',
    category: 'operations',
    icon: TrendingUp,
    description: 'Günlük ciro, doluluk ve operasyonel özet',
    hotkey: '1',
  },
  {
    id: 'bookings',
    label: 'Rezervasyonlar',
    shortLabel: 'Rezervasyon',
    category: 'operations',
    icon: Users,
    description: 'Misafir kayıtları, biletler ve durum takibi',
    hotkey: '2',
    showCount: true,
  },
  {
    id: 'finance',
    label: 'Kasa & Finans',
    shortLabel: 'Kasa',
    category: 'operations',
    icon: Wallet,
    description: 'Nakit kasa, PromptPay, tahsilat makbuzları ve alacak takibi',
    hotkey: '3',
  },
  {
    id: 'transfers',
    label: 'Transferler',
    shortLabel: 'Transfer',
    category: 'operations',
    icon: Car,
    description: 'Havalimanı & otel alma/bırakma manifestosu',
    hotkey: '4',
  },
  {
    id: 'partners',
    label: 'Acenta & B2B',
    shortLabel: 'Acenta',
    category: 'operations',
    icon: Building,
    description: 'Partner alt acentalar, otel rehberleri ve komisyon carileri',
    hotkey: '5',
  },
  {
    id: 'settlements',
    label: 'Hakediş & Kâr',
    shortLabel: 'Hakediş',
    category: 'operations',
    icon: DollarSign,
    description: 'Tedarikçi ödemeleri, kâr marjı ve mutabakat ekstresi',
    hotkey: '6',
  },
  {
    id: 'suppliers',
    label: 'Tedarikçi Kataloğu',
    shortLabel: 'Tedarikçi',
    category: 'operations',
    icon: Ship,
    description: 'Tekne firmaları ve net tur alış fiyat matrisi',
    hotkey: '7',
  },
  {
    id: 'fleet',
    label: 'Filo & Şoförler',
    shortLabel: 'Filo',
    category: 'operations',
    icon: Bus,
    description: 'Minibüsler, şoförler ve araç rotalama',
    hotkey: '8',
  },

  // 🌐 WEB & İÇERİK (CMS)
  {
    id: 'tours',
    label: 'Turlar & Fiyatlar',
    shortLabel: 'Turlar',
    category: 'content',
    icon: Compass,
    description: 'Tur programları, fiyatlandırma ve içerikler',
  },
  {
    id: 'media',
    label: 'Medya Galerisi',
    shortLabel: 'Medya',
    category: 'content',
    icon: Image,
    description: 'Görseller, fotoğraf kütüphanesi ve afişler',
  },
  {
    id: 'services',
    label: 'Hizmetler',
    shortLabel: 'Hizmetler',
    category: 'content',
    icon: Briefcase,
    description: 'VIP karşılama, yat kiralama ve özel hizmetler',
  },
  {
    id: 'blogs',
    label: 'Blog Yazıları',
    shortLabel: 'Blog',
    category: 'content',
    icon: BookOpen,
    description: 'Rehber yazıları ve gezi makaleleri',
  },
  {
    id: 'faqs',
    label: 'Sıkça Sorulanlar',
    shortLabel: 'SSS',
    category: 'content',
    icon: HelpCircle,
    description: 'Phuket tatili ve tur SSS maddeleri',
  },
  {
    id: 'testimonials',
    label: 'Müşteri Yorumları',
    shortLabel: 'Yorumlar',
    category: 'content',
    icon: MessageSquareQuote,
    description: 'Misafir değerlendirmeleri ve referanslar',
  },

  // ⚙️ İLETİŞİM & SİSTEM
  {
    id: 'whatsapp',
    label: 'WhatsApp Şablonları',
    shortLabel: 'WhatsApp',
    category: 'system',
    icon: MessageCircle,
    description: 'Misafir ve şoför otomatik hazır mesaj metinleri',
  },
  {
    id: 'settings',
    label: 'Site Ayarları',
    shortLabel: 'Ayarlar',
    category: 'system',
    icon: Settings,
    description: 'Telefon, e-posta, sosyal medya ve genel ayarlar',
  },
  {
    id: 'users',
    label: 'Ekip & Yetkiler',
    shortLabel: 'Ekip',
    category: 'system',
    icon: Users,
    description: 'Yönetici, müdür, rehber ve şoför hesapları',
    showCount: true,
  },
];

export const PRIMARY_NAV_ITEMS = NAV_ITEMS.filter((i) => i.category === 'operations');
export const CMS_NAV_ITEMS = NAV_ITEMS.filter((i) => i.category === 'content');
export const SYSTEM_NAV_ITEMS = NAV_ITEMS.filter((i) => i.category === 'system');

interface AdminDashboardProps {
  initialTours: TourItem[];
  initialBlogs: BlogItem[];
  initialServices: ServiceItem[];
  initialFaqs: FaqItem[];
  initialTestimonials: TestimonialItem[];
  initialSiteSettings: SiteSettingsState;
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
        const saved = window.localStorage.getItem('ptt_admin_active_tab');
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
    try { window.localStorage.setItem('ptt_admin_active_tab', activeTab); } catch { /* yok say */ }
  }, [activeTab]);

  // Kenar Çubuğu (Sidebar) kontrolü — kullanıcı tercihi localStorage'da saklanır
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('ptt_admin_sidebar_collapsed') === 'true';
      } catch { /* yok say */ }
    }
    return false;
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('ptt_admin_sidebar_collapsed', String(next));
      } catch { /* yok say */ }
      return next;
    });
  };

  // ⚡ Çift Modlu Menü Switcher: 'operations' (ERP) vs 'cms' (Web İçerik)
  const [navMode, setNavMode] = useState<'operations' | 'cms'>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('ptt_admin_nav_mode');
        if (saved === 'operations' || saved === 'cms') return saved;
      } catch { /* yok say */ }
    }
    return 'operations';
  });

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
    const item = NAV_ITEMS.find((i) => i.id === tabId);
    if (item?.category === 'content') {
      setNavMode('cms');
      try { localStorage.setItem('ptt_admin_nav_mode', 'cms'); } catch {}
    } else if (item?.category === 'operations') {
      setNavMode('operations');
      try { localStorage.setItem('ptt_admin_nav_mode', 'operations'); } catch {}
    }
    setActiveTab(tabId);
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

  // Kurumsal PDF Teklif & Fiyatlandırma / Proforma Modalı
  const [quoteModalData, setQuoteModalData] = useState<{ booking?: Booking; tour?: TourItem } | null>(null);

  // WhatsApp Automation Templates Modal
  const [whatsAppModalBooking, setWhatsAppModalBooking] = useState<Booking | null>(null);

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

  // VIP Karşılama Tabela Stüdyosu Modalı
  const [isWelcomeBoardOpen, setIsWelcomeBoardOpen] = useState<boolean>(false);
  const [welcomeBoardBooking, setWelcomeBoardBooking] = useState<Booking | null>(null);

  // Misafir Tur Fotoğraf & Video Teslim Kasası Modalı
  const [isTourMediaOpen, setIsTourMediaOpen] = useState<boolean>(false);
  const [tourMediaBooking, setTourMediaBooking] = useState<Booking | null>(null);

  // Oteller Arası Bagaj Transfer Masası Modalı
  const [isLuggageExpressOpen, setIsLuggageExpressOpen] = useState<boolean>(false);

  // Hızlı Saha & Operasyon Araçları Açılır Menüsü (Mobil / Tablet)
  const [isQuickToolsDropdownOpen, setIsQuickToolsDropdownOpen] = useState<boolean>(false);

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

  const operationNavItems = useMemo(() => {
    const list = NAV_ITEMS.filter((i) => i.category === 'operations');
    if (viewerRole === 'owner') {
      const usersItem = NAV_ITEMS.find((i) => i.id === 'users');
      if (usersItem && !list.some((i) => i.id === 'users')) {
        return [...list, usersItem];
      }
    }
    return list;
  }, [viewerRole]);

  const cmsNavItems = useMemo(() => {
    return NAV_ITEMS.filter((i) => i.category === 'content');
  }, []);

  const systemNavItems = useMemo(() => {
    return NAV_ITEMS.filter((i) => i.category === 'system' && i.id !== 'users');
  }, []);

  /** Klavye ile menüde gezinme:
   *  [ = önceki sekme, ] = sonraki sekme
   *  1-5 = Temel operasyon sekmelerine doğrudan hızlı atlama
   */
  const isAnyModalOpen =
    isModalOpen ||
    Boolean(voucherBooking) ||
    Boolean(quoteModalData) ||
    Boolean(whatsAppModalBooking) ||
    isPoliceManifestOpen ||
    isQrScannerOpen ||
    isBulkRescheduleOpen ||
    isLostFoundOpen ||
    isDietaryManifestOpen ||
    isFieldCashierOpen ||
    isFlightRadarOpen ||
    isDriverExpenseOpen ||
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
      await Promise.all([
        fetchBookingsFromServer(false),
        refreshCmsFromServer(),
      ]);
      showToast('✅ Bulut verileri başarıyla eşitlendi.');
    } catch {
      showToast('⚠️ Eşitleme sırasında hata oluştu.');
    } finally {
      setTimeout(() => setIsSyncing(false), 400);
    }
  }, [fetchBookingsFromServer, refreshCmsFromServer, setIsSyncing, showToast]);

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
  };

  /**
   * Tek bir rezervasyonu hem yerel state'te günceller hem de buluta (/api/bookings PUT)
   * optimistic update ile yazar. Hata durumunda eski duruma geri alır (rollback).
   */
  const handleUpdateSingleBooking = useCallback(
    async (updated: Booking, successMsg?: string) => {
      const prevBookings = bookings;
      const next = bookings.map((b) => (b.id === updated.id ? updated : b));
      saveBookings(next);
      if (successMsg) showToast(successMsg);

      try {
        const res = await fetch('/api/bookings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
        });
        if (!res.ok) {
          setBookings(prevBookings);
          localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(prevBookings));
          showToast('⚠️ Bulut kayıt hatası: Değişiklik sunucuya kaydedilemedi, geri alındı.');
        }
      } catch {
        setBookings(prevBookings);
        localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(prevBookings));
        showToast('⚠️ Ağ hatası: Rezervasyon buluta kaydedilemedi, geri alındı.');
      }
    },
    [bookings, showToast]
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
            setBookings(prevBookings);
            localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(prevBookings));
            showToast('⚠️ Bulut silme hatası: Yetki veya sunucu sorunu nedeniyle geri alındı.');
          }
        },
        () => {
          setBookings(prevBookings);
          localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(prevBookings));
          showToast('⚠️ Bulut silme hatası: Ağ bağlantısı kurulamadı, geri alındı.');
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
    const primaryPickupTime = schedule[0].pickupTime || '07:30';

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
              setBookings(prevBookings);
              localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(prevBookings));
              showToast('⚠️ Bulut kayıt hatası: Değişiklik kaydedilemedi, geri alındı.');
            }
          },
          () => {
            setBookings(prevBookings);
            localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(prevBookings));
            showToast('⚠️ Ağ hatası: Rezervasyon güncellenemedi, geri alındı.');
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
            setBookings(prevBookings);
            localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(prevBookings));
            showToast('⚠️ Bulut kayıt hatası: Yeni rezervasyon sunucuya yazılamadı, geri alındı.');
          }
        },
        () => {
          setBookings(prevBookings);
          localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(prevBookings));
          showToast('⚠️ Ağ hatası: Yeni rezervasyon sunucuya aktarılamadı, geri alındı.');
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
   */
  const applyAssignment = async (
    bookingId: string,
    tourIndex: number,
    patch: Partial<Pick<BookingTourSchedule, 'assignedVehicle' | 'assignedDriver' | 'pickupStatus' | 'pickedUpAt'>>
  ) => {
    const target = bookings.find((b) => b.id === bookingId);
    if (!target) return;

    const full = { ...target };
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
    setBookings(updated);
    localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(updated));

    // Bulut yazımı /api/bookings üzerinden.
    try {
      const res = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(full),
      });
      if (!res.ok) {
        setBookings(prevBookings);
        localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(prevBookings));
        showToast('⚠️ Bulut atama senkron hatası: Değişiklik sunucuya kaydedilemedi, geri alındı.');
        return null;
      }
    } catch (err) {
      setBookings(prevBookings);
      localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(prevBookings));
      showToast('⚠️ Ağ hatası: Atama buluta kaydedilemedi, geri alındı.');
      return null;
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
    if (full) showToast(`🚐 ${full.customerName} için hat atandı: ${vehicle}`);
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
    }
  };

  // Tour CRUD
  const handleOpenCreateTour = () => {
    setEditingTour(null);
    setTourActiveTab('general');
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
    setTourActiveTab('general');
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

  const handleFileUpload = (file: File, callback?: (url: string) => void) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (!base64) return;
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      const newMedia: MediaItem = {
        id: `med-${Date.now()}`,
        title: cleanTitle,
        url: base64,
        type: 'uploaded',
        size: `${Math.round(file.size / 1024)} KB`,
        createdAt: new Date().toLocaleDateString('tr-TR'),
      };
      const updated = [newMedia, ...mediaList];
      saveMediaList(updated);
      showToast(`"${file.name}" başarıyla kütüphaneye yüklendi!`);
      if (callback) callback(base64);
    };
    reader.readAsDataURL(file);
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
      {/* 1. Mobilde Açılan Menü Karartma Katmanı */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* 2. Sol Kenar Çubuğu (Sidebar) — Masaüstünde Sabit/Daraltılabilir, Mobilde Çekmece */}
      <aside
        className={`fixed md:sticky top-0 z-50 md:z-30 h-screen shrink-0 bg-white dark:bg-surface-1 border-r border-slate-200 dark:border-slate-800 transition-all duration-200 flex flex-col ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        } ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Sidebar Üst: Logo & Başlık */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-brand-primary text-white flex items-center justify-center font-serif font-black text-sm shrink-0 shadow-sm border border-slate-700/60 ring-1 ring-white/10">
              PT
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0">
                <span className="font-serif font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate block leading-tight">
                  Phuket Tatili
                </span>
                <span className="text-[10px] font-bold text-brand-accent uppercase tracking-wider block">
                  Yönetim Paneli
                </span>
              </div>
            )}
          </div>
          {/* Mobilde Kapatma Butonu */}
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
            aria-label="Menüyü Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Çift Modlu Menü Switcher: Operasyon ERP vs Web CMS */}
        <div className="p-3 pb-1 shrink-0">
          <div className="p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 grid grid-cols-2 gap-1 border border-slate-200/60 dark:border-slate-800/60">
            <button
              type="button"
              onClick={() => {
                setNavMode('operations');
                try { localStorage.setItem('ptt_admin_nav_mode', 'operations'); } catch {}
                if (cmsNavItems.some((i) => i.id === activeTab)) {
                  setActiveTab('overview');
                }
              }}
              title={isSidebarCollapsed ? 'Operasyon Masası (ERP)' : undefined}
              className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                navMode === 'operations'
                  ? 'bg-white dark:bg-surface-2 text-slate-900 dark:text-white shadow-2xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              {!isSidebarCollapsed && <span>Operasyon</span>}
            </button>

            <button
              type="button"
              onClick={() => {
                setNavMode('cms');
                try { localStorage.setItem('ptt_admin_nav_mode', 'cms'); } catch {}
                if (operationNavItems.some((i) => i.id === activeTab)) {
                  setActiveTab('tours');
                }
              }}
              title={isSidebarCollapsed ? 'Web & İçerik Modu (CMS)' : undefined}
              className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                navMode === 'cms'
                  ? 'bg-white dark:bg-surface-2 text-slate-900 dark:text-white shadow-2xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-sky-500" />
              {!isSidebarCollapsed && <span>Web CMS</span>}
            </button>
          </div>
        </div>

        {/* Sidebar Menü Listesi (Kaydırılabilir) */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {navMode === 'operations' ? (
            /* Grup 1: Operasyon ERP */
            <div>
              {!isSidebarCollapsed ? (
                <div className="px-3 pb-1 text-[10px] font-black tracking-wider uppercase text-slate-400 dark:text-slate-500 flex items-center justify-between">
                  <span>Operasyon Masası</span>
                  <span className="font-mono text-[9px] opacity-75">{operationNavItems.length} Modül</span>
                </div>
              ) : (
                <div className="my-1 border-t border-slate-200/60 dark:border-slate-800/60" />
              )}
              <div className="space-y-0.5">
                {operationNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  const isBookings = item.id === 'bookings';
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleTabSelect(item.id)}
                      title={isSidebarCollapsed ? item.label : undefined}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer relative group ${
                        isActive
                          ? 'bg-slate-900 text-white dark:bg-brand-accent dark:text-slate-950 shadow-sm font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                      } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-brand-accent dark:text-slate-950' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
                      }`} />
                      {!isSidebarCollapsed && (
                        <>
                          <span className="truncate flex-1 text-left">{item.label}</span>
                          {isBookings && pendingBookingsCount > 0 && (
                            <span className="rounded-full px-2 py-0.5 text-[10px] font-black bg-amber-500 text-white animate-pulse">
                              {pendingBookingsCount}
                            </span>
                          )}
                          {isBookings && pendingBookingsCount === 0 && bookings.length > 0 && (
                            <span className={`text-[10px] opacity-60 font-mono ${isActive ? 'text-white' : 'text-slate-400'}`}>
                              {bookings.length}
                            </span>
                          )}
                        </>
                      )}
                      {isSidebarCollapsed && isBookings && pendingBookingsCount > 0 && (
                        <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              {/* Grup 2: Web Sitesi & İçerik */}
              <div>
                {!isSidebarCollapsed ? (
                  <div className="px-3 pb-1 text-[10px] font-black tracking-wider uppercase text-slate-400 dark:text-slate-500 flex items-center justify-between">
                    <span>Web & İçerik</span>
                    <span className="font-mono text-[9px] opacity-75">{cmsNavItems.length} Modül</span>
                  </div>
                ) : (
                  <div className="my-1 border-t border-slate-200/60 dark:border-slate-800/60" />
                )}
                <div className="space-y-0.5">
                  {cmsNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleTabSelect(item.id)}
                        title={isSidebarCollapsed ? item.label : undefined}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer group ${
                          isActive
                            ? 'bg-slate-900 text-white dark:bg-brand-accent dark:text-slate-950 shadow-sm font-bold'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                        } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-brand-accent dark:text-slate-950' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
                        }`} />
                        {!isSidebarCollapsed && (
                          <span className="truncate flex-1 text-left">{item.label}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Grup 3: Sistem & İletişim */}
              <div>
                {!isSidebarCollapsed ? (
                  <div className="px-3 pb-1 text-[10px] font-black tracking-wider uppercase text-slate-400 dark:text-slate-500">
                    Sistem & İletişim
                  </div>
                ) : (
                  <div className="my-1 border-t border-slate-200/60 dark:border-slate-800/60" />
                )}
                <div className="space-y-0.5">
                  {systemNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleTabSelect(item.id)}
                        title={isSidebarCollapsed ? item.label : undefined}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer group ${
                          isActive
                            ? 'bg-slate-900 text-white dark:bg-brand-accent dark:text-slate-950 shadow-sm font-bold'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                        } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-brand-accent dark:text-slate-950' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
                        }`} />
                        {!isSidebarCollapsed && (
                          <span className="truncate flex-1 text-left">{item.label}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sidebar Alt: Profil & Daralt/Genişlet Butonu */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2 shrink-0">
          {!isSidebarCollapsed ? (
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/60">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-brand-primary/10 text-brand-primary dark:text-brand-accent flex items-center justify-center font-bold text-xs shrink-0">
                  MG
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate text-slate-800 dark:text-slate-200">Murat Gençer</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                    {roleBadge.label}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-1" title={`Murat Gençer (${roleBadge.label})`}>
              <div className="w-8 h-8 rounded-xl bg-brand-primary/10 text-brand-primary dark:text-brand-accent flex items-center justify-center font-bold text-xs">
                MG
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={toggleSidebar}
            className="hidden md:flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={isSidebarCollapsed ? 'Menüyü Genişlet' : 'Menüyü Daralt'}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Menüyü Daralt</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* 3. Ana Sütun (Header + Main) */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Üst İnce Header Bar */}
        <header className="sticky top-0 z-30 min-h-16 py-2 bg-white/95 dark:bg-surface-1/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 shadow-2xs">
          {/* Sol: Menü Açma (Mobil) + Aktif Sekme Başlığı */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              aria-label="Menüyü Aç"
            >
              <Menu className="w-5 h-5" />
            </button>

            {activeNavItem && (
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white dark:bg-brand-accent dark:text-slate-950 flex items-center justify-center shrink-0">
                  <activeNavItem.icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 leading-none">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      {activeNavItem.category === 'operations' ? 'Operasyon' : activeNavItem.category === 'content' ? 'Web Sitesi' : 'Sistem'}
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">/</span>
                    <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                      {activeNavItem.label}
                    </h1>
                  </div>
                  {activeNavItem.description && (
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:block truncate mt-0.5">
                      {activeNavItem.description}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sağ: Hızlı Operasyon Masası + Spotlight + Eylemler */}
          <div className="flex items-center gap-2 shrink-0">
            {/* ⚡ ÇİFT SATIR HIZLI OPERASYON MASASI (Desktop: lg ve üzeri) */}
            <div className="hidden lg:flex flex-col items-end gap-1">
              {/* Satır 1: Saha & Güvenlik */}
              <div
                className="flex items-center gap-1 p-0.5 bg-slate-100/70 dark:bg-slate-900/50 rounded-xl border border-slate-200/60 dark:border-slate-800/60"
                title="Saha & Güvenlik Masası"
              >
                <button
                  type="button"
                  onClick={() => setIsQrScannerOpen(true)}
                  className="px-2 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/20 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                  title="Misafir Kuponu / Bilet QR Kodu Oku & Doğrula"
                >
                  <Camera className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                  <span>Bilet Tara</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsLostFoundOpen(true)}
                  className="px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                  title="Kayıp Eşya Masası & Bagaj Güvenlik Protokolü"
                >
                  <Package className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span>Kayıp Eşya</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsDietaryManifestOpen(true)}
                  className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/20 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                  title="Misafir Diyet & Medikal Emniyet Manifestosu"
                >
                  <ShieldAlert className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                  <span>Diyet & Medikal</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCashierBooking(null);
                    setIsFieldCashierOpen(true);
                  }}
                  className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                  title="Saha Çoklu Döviz & Para Üstü Kasa Hesaplayıcı"
                >
                  <Coins className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Saha Kasa</span>
                </button>
              </div>

              {/* Satır 2: Lojistik & VIP Servisler */}
              <div
                className="flex items-center gap-1 p-0.5 bg-slate-100/70 dark:bg-slate-900/50 rounded-xl border border-slate-200/60 dark:border-slate-800/60"
                title="Lojistik, Uçuş & Karşılama Masası"
              >
                <button
                  type="button"
                  onClick={() => {
                    setFlightRadarFlight('TK 172');
                    setFlightRadarGuest('');
                    setIsFlightRadarOpen(true);
                  }}
                  className="px-2 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/20 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                  title="Phuket Havalimanı Canlı Uçuş Radarı & Rötar Kalkanı"
                >
                  <Plane className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                  <span>Uçuş Radarı</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsDriverExpenseOpen(true)}
                  className="px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                  title="Şoför Saha Yakıt, Otopark & Harç Masraf Masası"
                >
                  <Fuel className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span>Şoför Masrafı</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setWelcomeBoardBooking(null);
                    setIsWelcomeBoardOpen(true);
                  }}
                  className="px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                  title="Havalimanı VIP Karşılama İsimlik Stüdyosu (Tablet & Baskı)"
                >
                  <span className="text-xs leading-none">🪧</span>
                  <span>VIP İsimlik</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsLuggageExpressOpen(true)}
                  className="px-2 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                  title="Oteller Arası Bagaj Transfer Masası"
                >
                  <Luggage className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                  <span>Bagaj Masası</span>
                </button>
              </div>
            </div>

            {/* 📱 Mobil & Tablet: Tek Butonlu Açılır Operasyon Menüsü (Dropdown) */}
            <div className="relative lg:hidden">
              <button
                type="button"
                onClick={() => setIsQuickToolsDropdownOpen((v) => !v)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Hızlı Saha & Operasyon Araçları"
              >
                <span>⚡</span>
                <span className="text-xs">Araçlar</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isQuickToolsDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsQuickToolsDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-surface-2 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 divide-y divide-slate-100 dark:divide-slate-800">
                    <div className="p-1">
                      <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-2 py-1">
                        Saha & Güvenlik
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsQrScannerOpen(true);
                          setIsQuickToolsDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-purple-500/10 hover:text-purple-600 transition-colors text-left"
                      >
                        <Camera className="w-3.5 h-3.5 text-purple-600" />
                        <span>Bilet Tara</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsLostFoundOpen(true);
                          setIsQuickToolsDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-amber-500/10 hover:text-amber-600 transition-colors text-left"
                      >
                        <Package className="w-3.5 h-3.5 text-amber-600" />
                        <span>Kayıp Eşya Masası</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsDietaryManifestOpen(true);
                          setIsQuickToolsDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-rose-500/10 hover:text-rose-600 transition-colors text-left"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                        <span>Diyet & Medikal Manifesto</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCashierBooking(null);
                          setIsFieldCashierOpen(true);
                          setIsQuickToolsDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-600 transition-colors text-left"
                      >
                        <Coins className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Saha Çoklu Döviz Kasa</span>
                      </button>
                    </div>

                    <div className="p-1 pt-2">
                      <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-2 py-1">
                        Lojistik & Operasyon
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFlightRadarFlight('TK 172');
                          setFlightRadarGuest('');
                          setIsFlightRadarOpen(true);
                          setIsQuickToolsDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-sky-500/10 hover:text-sky-600 transition-colors text-left"
                      >
                        <Plane className="w-3.5 h-3.5 text-sky-600" />
                        <span>Havalimanı Uçuş Radarı</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsDriverExpenseOpen(true);
                          setIsQuickToolsDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-amber-500/10 hover:text-amber-600 transition-colors text-left"
                      >
                        <Fuel className="w-3.5 h-3.5 text-amber-600" />
                        <span>Şoför Yakıt & Masraf</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setWelcomeBoardBooking(null);
                          setIsWelcomeBoardOpen(true);
                          setIsQuickToolsDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-amber-500/10 hover:text-amber-600 transition-colors text-left"
                      >
                        <span className="text-xs">🪧</span>
                        <span>VIP Karşılama İsimliği</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsLuggageExpressOpen(true);
                          setIsQuickToolsDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-500/10 hover:text-indigo-600 transition-colors text-left"
                      >
                        <Luggage className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Bagaj Transfer Masası</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Sağ Blok: Arama, Bulut, Yeni Rezervasyon, Çıkış */}
            <div className="flex items-center gap-1.5">
              {/* Spotlight Arama Butonu (Cmd+K) */}
              <button
                type="button"
                onClick={() => setIsCommandPaletteOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800 text-xs font-medium transition-all cursor-pointer"
                title="Klavyeden ⌘K veya Ctrl+K ile hızlı arama"
              >
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden xl:inline text-xs">Ara</span>
                <kbd className="hidden sm:inline-flex items-center px-1 py-0.5 rounded text-[10px] font-mono font-bold bg-white dark:bg-surface-2 border border-slate-200 dark:border-slate-700 text-slate-500">
                  ⌘K
                </kbd>
              </button>

              {/* Canlı Bulut Senkronizasyon Durumu & Manuel Yenileme */}
              <button
                type="button"
                onClick={handleManualSync}
                disabled={isSyncing}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 text-[11px] font-semibold text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60 transition-all cursor-pointer disabled:opacity-75 disabled:cursor-wait"
                title={
                  isSyncing
                    ? 'Bulut ile senkronize ediliyor...'
                    : isCloudConnected
                    ? `Bulut Canlı (Supabase Realtime Aktif)${lastSyncedAt ? ` • Son Eşitleme: ${lastSyncedAt.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : ''} • Tıklayarak şimdi eşitle`
                    : 'Yerel Mod (Buluta bağlanılamadı) • Tıklayarak tekrar dene'
                }
              >
                {isSyncing ? (
                  <RefreshCw className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                ) : (
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isCloudConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                    }`}
                  />
                )}
                <span className="hidden xl:inline">
                  {isSyncing
                    ? 'Eşitleniyor...'
                    : isCloudConnected
                    ? 'Bulut Canlı'
                    : 'Yerel Mod'}
                </span>
                {lastSyncedAt && !isSyncing && (
                  <span className="hidden 2xl:inline text-[10px] text-slate-400 font-normal">
                    {lastSyncedAt.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </button>

              {perms.canCreateBookings && (
                <button
                  onClick={handleOpenCreateBooking}
                  className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-white text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Yeni Rezervasyon</span>
                  <span className="sm:hidden">Yeni</span>
                </button>
              )}

              <button
                onClick={handleLogout}
                disabled={isSigningOut}
                className="p-1.5 sm:p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                title="Çıkış Yap"
              >
                <LogOut className={`w-4 h-4 ${isSigningOut ? 'animate-pulse' : ''}`} />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
          <AdminErrorBoundary
            tabName={activeNavItem?.label}
            onResetToOverview={() => setActiveTab('overview')}
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
            onOpenQuotePdf={(b) => setQuoteModalData({ booking: b })}
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
            showToast={showToast}
            handleAssignVehicleToBooking={handleAssignVehicleToBooking}
            handleAssignDriverToBooking={handleAssignDriverToBooking}
            handleUpdatePickupStatus={handleUpdatePickupStatus}
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
            onOpenWelcomeBoard={(b) => {
              setWelcomeBoardBooking(b || null);
              setIsWelcomeBoardOpen(true);
            }}
            onOpenLuggageExpress={() => setIsLuggageExpressOpen(true)}
          />
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
            onOpenQuotePdf={(t) => setQuoteModalData({ tour: t })}
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
        {/* ==================================================== */}
        {activeTab === 'whatsapp' && <WhatsAppTab />}

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
            viewerRole={viewerRole}
            showToast={showToast}
          />
        )}

        {/* TAB 10: EKİP ÜYELERİ — yalnızca owner (üyelik sistemi).
            manager paneli görür ama bu sekmeyi görmez; API tarafında
            ayrıca owner-only guard çalışır (UI gizlemesi kozmetik). */}
        {activeTab === 'users' && perms.canManageUsers && (
          <UsersTab showToast={showToast} />
        )}
          </AdminErrorBoundary>
        </main>
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
              Fotoğrafı Tur Kapağı Yap
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              "{assignMediaModal.title}" görselini hangi turun kapak fotoğrafı yapmak istersiniz?
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

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setAssignMediaModal(null)}
                className="px-4 py-2 rounded-xl border text-xs font-semibold"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={() => {
                  const sel = (document.getElementById('assignTourSelect') as HTMLSelectElement)?.value;
                  if (sel) handleAssignMediaAsTourCover(assignMediaModal.url, sel);
                }}
                className="px-5 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold shadow-md"
              >
                Kapak Olarak Ata
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
      {/* MODAL 10.5: CORPORATE TOUR QUOTE & PROFORMA PDF ENGINE */}
      {/* ==================================================== */}
      {quoteModalData && (
        <TourQuotePdfModal
          booking={quoteModalData.booking}
          tour={quoteModalData.tour}
          onClose={() => setQuoteModalData(null)}
          showToast={showToast}
          whatsappNumber={siteSettings.whatsappNumber}
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
        onSetNavMode={(mode) => {
          setNavMode(mode);
          try {
            localStorage.setItem('ptt_admin_nav_mode', mode);
          } catch {}
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
              bookingId: payment.bookingId,
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
