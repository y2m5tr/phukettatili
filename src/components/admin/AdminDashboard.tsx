import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  Save,
  ChevronLeft,
  ChevronRight,
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

  const visibleNavItems = useMemo(
    () => NAV_ITEMS.filter((i) => i.id !== 'users' || viewerRole === 'owner'),
    [viewerRole],
  );
  const canDeleteBookings = viewerRole === 'owner' || viewerRole === null;

  // Active Tab — son seçim localStorage'da tutulur; sayfa yenilense bile
  // kullanıcı kaldığı bölüme döner (operasyonda sık yenileme yapılır).
  // URL'de ?tab=... varsa o ÖNCE gelir: "tarih filtreli müşteri listesi"
  // gibi linkler ekip içinde paylaşılabilir.
  const [activeTab, setActiveTabState] = useState<AdminTab>(() => {
    if (typeof window !== 'undefined') {
      try {
        const isAllowedTab = (t: string | null): t is AdminTab =>
          Boolean(t && (t !== 'users' || viewerRole === 'owner') && NAV_ITEMS.some((i) => i.id === t));
        const urlTab = new URL(window.location.href).searchParams.get('tab');
        if (isAllowedTab(urlTab)) return urlTab;
        const saved = window.localStorage.getItem('ptt_admin_active_tab');
        if (isAllowedTab(saved)) return saved;
      } catch { /* gizli mod / kota: sessizce varsayılana düş */ }
    }
    return 'overview';
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

  // Cloud Database Sync State
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);

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
  const [tourActiveTab, setTourActiveTab] = useState<
    'general' | 'photos' | 'itinerary' | 'inclusions' | 'faqs' | 'notes'
  >('general');
  // Dynamic fields for Tour Modal
  const [tempProgramItem, setTempProgramItem] = useState<string>('');
  const [tempIncludedItem, setTempIncludedItem] = useState<string>('');
  const [tempExcludedItem, setTempExcludedItem] = useState<string>('');
  const [tempFaqQ, setTempFaqQ] = useState<string>('');
  const [tempFaqA, setTempFaqA] = useState<string>('');
  const [tempRestrictionItem, setTempRestrictionItem] = useState<string>('');

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

      // ☁️ Bulut verisi: tablo erişimi /api/bookings üzerinden (oturum
      // cookie'si ile). Client Supabase anahtarı tabloyu okuyamaz — RLS kapalı.
      void fetchBookingsFromServer(true);

      // 2) CMS koleksiyonları (tours/blog/sss/…): bulut > yerel > initial.
      //    Bulutta kayıt varsa yerelin üstüne yazar; yoksa yerel kalır.
      void (async () => {
        const { items } = await loadCmsCollections();
        const apply = <T,>(key: CmsCollectionKey, setValue: (v: T) => void, fallback: T) => {
          const cloud = items[key];
          if (cloud === undefined) return; // bulutta yok — yerel/initial geçerli
          setValue(cloud as T);
          // Bulut değerini yerel cache'e da yaz — çevrimdışı açılışta taze.
          writeLocalCollection(key, cloud);
          void fallback; // fallback yalnızca tip çıkarımı için
        };
        apply('tours', setTours, initialTours);
        apply('blogs', setBlogs, initialBlogs);
        apply('services', setServices, initialServices);
        apply('faqs', setFaqs, initialFaqs);
        apply('testimonials', setTestimonials, initialTestimonials);
        apply('media', setMediaList, []);
        apply('site-settings', setSiteSettings, initialSiteSettings);
        apply('vehicles', setVehicles, initialVehicles);
        apply('drivers', setDrivers, initialDrivers);
        apply('payments', setPayments, initialPayments);
        apply('agents', setAgents, initialAgents);
        apply('suppliers', setSuppliers, initialSuppliers);
        apply('tour-costs', setTourCosts, initialTourCosts);
      })();
    } catch {
      setBookings(initialBookings);
      setTours(initialTours);
    }
  }, []);

  /**
   * Bulut verisini /api/bookings üzerinden çeker ve state + localStorage
   * cache'ini tazeler. silent=true iken hata durumunda toast gösterilmez.
   */
  const fetchBookingsFromServer = useCallback(async (silent = false): Promise<void> => {
    try {
      const res = await fetch('/api/bookings');
      if (!res.ok) {
        if (!silent) showToast('⚠️ Bulut verisi alınamadı.');
        setIsCloudConnected(false);
        return;
      }
      const payload = (await res.json()) as { bookings?: Booking[] };
      if (Array.isArray(payload.bookings)) {
        if (payload.bookings.length > 0) {
          setBookings(payload.bookings);
          localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(payload.bookings));
        }
        setIsCloudConnected(true);
      }
    } catch {
      setIsCloudConnected(false);
    }
  }, []);

  /**
   * Canlı senkronizasyon: sunucunun "bookings değişti" Broadcast sinyalini
   * dinler. Sinyal veri taşımaz; veri her seferinde /api/bookings üzerinden
   * yeniden çekilir. Abonelik self:false ile kurulur — kendi yazmamızın
   * yankısı bize geri dönmez.
   */
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const unsubscribe = subscribeBookingsSignal(() => {
      void fetchBookingsFromServer(true);
    });
    return unsubscribe;
  }, [isSupabaseConfigured, fetchBookingsFromServer]);

  // Save helpers — her kayıt yerele VE buluta (/api/content) yazılır.
  // Bulut yazma yangın-and-forget; hata toast'u yerel kopyanın geçerli
  // olduğunu söyler. Yerel yazma davranışı değişmedi.
  const saveBookings = (next: Booking[]) => {
    setBookings(next);
    localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(next));
  };
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
      saveBookings(bookings.filter((b) => b.id !== id));
      showToast('Rezervasyon silindi.');

      // Bulut silmesi /api/bookings üzerinden. Silme yalnızca admin
      // oturumuyla yapılabilir (API tarafında guard 'admin' ister).
      void fetch(`/api/bookings?id=${encodeURIComponent(id)}`, { method: 'DELETE' }).then(
        (res) => {
          if (!res.ok) showToast('⚠️ Bulut silme hatası: yetki veya sunucu sorunu.');
        },
        () => showToast('⚠️ Bulut silme hatası: ağ bağlantısı kurulamadı.')
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
            if (!res.ok) console.warn('Bulut güncelleme hatası:', res.status);
          },
          (err) => console.warn('Bulut güncelleme hatası:', err)
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
      saveBookings([newBooking, ...bookings]);
      showToast(`Yeni rezervasyon eklendi — bilet kodu: ${newBooking.ticketCode}`);

      // Bulut yazımı /api/bookings üzerinden (oturum cookie'si ile).
      void fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBooking),
      }).then(
        (res) => {
          if (!res.ok) console.warn('Bulut ekleme hatası:', res.status);
        },
        (err) => console.warn('Bulut ekleme hatası:', err)
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
      if (!res.ok) console.warn('Bulut atama senkron hatası:', res.status);
    } catch (err) {
      console.warn('Bulut atama senkron hatası:', err);
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
                    {viewerRole === 'owner' ? '👑 Yönetici' : '🧭 Müdür'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-1" title="Murat Gençer (👑 Yönetici)">
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
        <header className="sticky top-0 z-30 h-16 bg-white/95 dark:bg-surface-1/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 shadow-2xs">
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

          {/* Sağ: Durum + Hızlı Eylemler */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Spotlight Arama Butonu (Cmd+K) */}
            <button
              type="button"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800 text-xs font-medium transition-all cursor-pointer"
              title="Klavyeden ⌘K veya Ctrl+K ile hızlı arama"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden md:inline">Hızlı Arama / Komut</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-white dark:bg-surface-2 border border-slate-200 dark:border-slate-700 text-slate-500">
                ⌘K
              </kbd>
            </button>

            {/* Canlı Bağlantı Durumu */}
            <div
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 text-[11px] font-semibold text-slate-600 dark:text-slate-300"
              title={isCloudConnected ? 'Bulut Canlı (Supabase)' : 'Yerel Mod'}
            >
              <span className={`w-2 h-2 rounded-full ${isCloudConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              <span>{isCloudConnected ? 'Canlı Bulut' : 'Yerel Mod'}</span>
            </div>

            <button
              type="button"
              onClick={() => setIsQrScannerOpen(true)}
              className="hidden sm:flex px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30 text-xs font-bold transition-all items-center gap-1.5 cursor-pointer"
              title="Misafir Kuponu / Bilet QR Kodu Oku & Doğrula"
            >
              <Camera className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Bilet Tara</span>
            </button>

            <button
              type="button"
              onClick={() => setIsLostFoundOpen(true)}
              className="hidden lg:flex px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-xs font-bold transition-all items-center gap-1.5 cursor-pointer"
              title="Kayıp Eşya Masası & Bagaj Güvenlik Protokolü"
            >
              <Package className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Kayıp Eşya</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDietaryManifestOpen(true)}
              className="hidden lg:flex px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/30 text-xs font-bold transition-all items-center gap-1.5 cursor-pointer"
              title="Misafir Diyet & Medikal Emniyet Manifestosu"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>Diyet & Medikal</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCashierBooking(null);
                setIsFieldCashierOpen(true);
              }}
              className="hidden sm:flex px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all items-center gap-1.5 cursor-pointer"
              title="Saha Çoklu Döviz & Para Üstü Kasa Hesaplayıcı"
            >
              <Coins className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Saha Kasa</span>
            </button>

            <button
              onClick={handleOpenCreateBooking}
              className="px-3.5 py-1.5 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-white text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Yeni Rezervasyon</span>
              <span className="sm:hidden">Yeni</span>
            </button>

            <button
              onClick={handleLogout}
              disabled={isSigningOut}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="Çıkış Yap"
            >
              <LogOut className={`w-4 h-4 ${isSigningOut ? 'animate-pulse' : ''}`} />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        
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
            setActiveTab={setActiveTab}
            onOpenCreateBooking={handleOpenCreateBooking}
            onOpenQrScanner={() => setIsQrScannerOpen(true)}
            onOpenPoliceManifest={() => setIsPoliceManifestOpen(true)}
            onOpenBulkReschedule={() => setIsBulkRescheduleOpen(true)}
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
          />
        )}

        {/* ==================================================== */}
        {/* TAB 2.3: ERP FINANCE & CASHFLOW */}
        {/* ==================================================== */}
        {activeTab === 'finance' && (
          <FinanceTab
            bookings={bookings}
            payments={payments}
            onAddPayment={handleAddPayment}
            onUpdateBooking={(updated) => {
              saveBookings(bookings.map((b) => (b.id === updated.id ? updated : b)));
              void fetch('/api/bookings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated),
              });
            }}
            showToast={showToast}
            setVoucherBooking={setVoucherBooking}
          />
        )}

        {/* ==================================================== */}
        {/* TAB 2.5: TRANSFERS & DRIVER MANIFEST */}
        {/* ==================================================== */}
        {activeTab === 'transfers' && (
          <TransfersTab
            bookings={bookings}
            manifestDate={manifestDate}
            setManifestDate={setManifestDate}
            vehicles={vehicles}
            drivers={drivers}
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
          />
        )}

        {/* ==================================================== */}
        {/* TAB 2.55: SUPPLIER SETTLEMENTS & PROFIT ENGINE */}
        {/* ==================================================== */}
        {activeTab === 'settlements' && (
          <SupplierSettlementManager
            bookings={bookings}
            onUpdateBooking={(updated) => {
              saveBookings(bookings.map((b) => (b.id === updated.id ? updated : b)));
              void fetch('/api/bookings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated),
              });
              showToast('Tedarikçi maliyeti güncellendi! 💰');
            }}
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
        {activeTab === 'settings' && (
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
        {activeTab === 'users' && viewerRole === 'owner' && (
          <UsersTab showToast={showToast} />
        )}

      </main>
      </div>

      {/* ==================================================== */}
      {/* MODAL 1: BOOKING */}
      {/* ==================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-2 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
                {editingBooking ? 'Rezervasyonu Düzenle' : 'Yeni Rezervasyon Ekle'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400">✕</button>
            </div>

            <form onSubmit={handleSubmitBooking} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Müşteri Adı *</label>
                  <input
                    type="text"
                    required
                    value={formData.customerName || ''}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Telefon / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-5">
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    🏨 Otel Adı *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Millennium Resort Patong"
                    value={formData.hotel || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      const detected = detectHotelZone(val);
                      const recTime = getRecommendedPickupTime(detected);
                      setFormData((prev) => {
                        const updatedTours = (prev.tours || []).map((t, idx) =>
                          idx === 0 && (!t.pickupTime || t.pickupTime === '07:30')
                            ? { ...t, pickupTime: recTime }
                            : t
                        );
                        return {
                          ...prev,
                          hotel: val,
                          hotelZone:
                            !prev.hotelZone || prev.hotelZone === 'Patong & Kalim' || prev.hotelZone === 'Genel Phuket'
                              ? detected
                              : prev.hotelZone,
                          pickupTime: !prev.pickupTime || prev.pickupTime === '07:30' ? recTime : prev.pickupTime,
                          tours: updatedTours.length > 0 ? updatedTours : prev.tours,
                        };
                      });
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/40"
                  />
                </div>
                <div className="sm:col-span-4">
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    📍 Bölge / Hat *
                  </label>
                  <select
                    value={formData.hotelZone || (formData.hotel ? detectHotelZone(formData.hotel) : 'Patong & Kalim')}
                    onChange={(e) => {
                      const zone = e.target.value;
                      const recTime = getRecommendedPickupTime(zone);
                      setFormData((prev) => {
                        const updatedTours = (prev.tours || []).map((t, idx) =>
                          idx === 0 && (!t.pickupTime || t.pickupTime === '07:30')
                            ? { ...t, pickupTime: recTime }
                            : t
                        );
                        return {
                          ...prev,
                          hotelZone: zone,
                          pickupTime: !prev.pickupTime || prev.pickupTime === '07:30' ? recTime : prev.pickupTime,
                          tours: updatedTours.length > 0 ? updatedTours : prev.tours,
                        };
                      });
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/40 text-slate-900 dark:text-white"
                  >
                    {HOTEL_ZONES.map((zone) => (
                      <option key={zone} value={zone}>
                        {zone} (Alış: {getRecommendedPickupTime(zone)})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    🚪 Oda Numarası
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: 402"
                    value={formData.roomNumber || ''}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/40"
                  />
                </div>
              </div>

              {/* Çoklu Tur & Tarih Programı */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Rezerve Edilen Turlar & Tarihler ({(formData.tours || []).length} Tur)
                    </label>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Aynı misafir için farklı günlerde gerçekleşecek birden fazla tur ekleyebilirsiniz.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const curTours = formData.tours || [];
                      const lastTour = curTours[curTours.length - 1];
                      let nextDate = new Date().toISOString().split('T')[0];
                      if (lastTour?.tourDate) {
                        const d = new Date(lastTour.tourDate);
                        d.setDate(d.getDate() + 1);
                        nextDate = d.toISOString().split('T')[0];
                      }
                      const nextTourItem = tours[curTours.length % tours.length] || tours[0];
                      const updated: BookingTourSchedule[] = [
                        ...curTours,
                        {
                          tourTitle: nextTourItem?.title || 'Phuket Turu',
                          tourDate: nextDate,
                          pickupTime: '07:30',
                          priceThb: nextTourItem?.priceThb || 3200,
                        },
                      ];
                      const adults = Number(formData.adultCount) || 1;
                      const calculatedTotal = updated.reduce((acc, t) => acc + (t.priceThb || 0), 0) * adults;
                      setFormData({
                        ...formData,
                        tours: updated,
                        totalPriceThb: calculatedTotal > 0 ? calculatedTotal : formData.totalPriceThb,
                      });
                    }}
                    className="px-3.5 py-2 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Başka Bir Tur & Tarih Ekle</span>
                  </button>
                </div>

                <div className="space-y-3 pt-1">
                  {(formData.tours || []).map((tourSchedule, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-2.5 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-brand-primary text-white">
                          #{idx + 1} Tur Programı
                        </span>

                        {(formData.tours || []).length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (formData.tours || []).filter((_, i) => i !== idx);
                              const adults = Number(formData.adultCount) || 1;
                              const calculatedTotal = updated.reduce((acc, t) => acc + (t.priceThb || 0), 0) * adults;
                              setFormData({
                                ...formData,
                                tours: updated,
                                totalPriceThb: calculatedTotal > 0 ? calculatedTotal : formData.totalPriceThb,
                              });
                            }}
                            className="text-slate-400 hover:text-red-500 p-1 text-xs font-bold transition-colors"
                            title="Bu turu kaldır"
                          >
                            ✕ Turu Kaldır
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                        <div className="sm:col-span-5">
                          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                            Tur Adı *
                          </label>
                          <select
                            value={tourSchedule.tourTitle}
                            onChange={(e) => {
                              const selectedTitle = e.target.value;
                              const matchedTour = tours.find((t) => t.title === selectedTitle);
                              const updated = (formData.tours || []).map((item, i) =>
                                i === idx
                                  ? {
                                      ...item,
                                      tourTitle: selectedTitle,
                                      priceThb: matchedTour?.priceThb || item.priceThb,
                                    }
                                  : item
                              );
                              const adults = Number(formData.adultCount) || 1;
                              const calculatedTotal = updated.reduce((acc, t) => acc + (t.priceThb || 0), 0) * adults;
                              setFormData({
                                ...formData,
                                tours: updated,
                                totalPriceThb: calculatedTotal > 0 ? calculatedTotal : formData.totalPriceThb,
                              });
                            }}
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none font-medium"
                          >
                            {tours.map((t) => (
                              <option key={t.id} value={t.title}>
                                {t.title}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 flex items-center justify-between">
                            <span>Tur Tarihi *</span>
                            {tourSchedule.tourDate && (() => {
                              const s = getPhuketSeason(tourSchedule.tourDate);
                              return (
                                <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold border ${s.badgeColor}`}>
                                  {s.season === 'peak' ? '⚡ Peak' : s.season === 'low' ? '🌴 Low' : '☀️ High'}
                                </span>
                              );
                            })()}
                          </label>
                          <input
                            type="date"
                            required
                            value={tourSchedule.tourDate}
                            onChange={(e) => {
                              const updated = (formData.tours || []).map((item, i) =>
                                i === idx ? { ...item, tourDate: e.target.value } : item
                              );
                              setFormData({ ...formData, tours: updated });
                            }}
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none font-semibold"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                            Alınış Saati
                          </label>
                          <input
                            type="text"
                            placeholder="07:30"
                            value={tourSchedule.pickupTime || ''}
                            onChange={(e) => {
                              const updated = (formData.tours || []).map((item, i) =>
                                i === idx ? { ...item, pickupTime: e.target.value } : item
                              );
                              setFormData({ ...formData, tours: updated });
                            }}
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                            Fiyat (Kişi Başı THB)
                          </label>
                          <input
                            type="number"
                            value={tourSchedule.priceThb || 0}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              const updated = (formData.tours || []).map((item, i) =>
                                i === idx ? { ...item, priceThb: val } : item
                              );
                              const adults = Number(formData.adultCount) || 1;
                              const calculatedTotal = updated.reduce((acc, t) => acc + (t.priceThb || 0), 0) * adults;
                              setFormData({
                                ...formData,
                                tours: updated,
                                totalPriceThb: calculatedTotal > 0 ? calculatedTotal : formData.totalPriceThb,
                              });
                            }}
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Canlı Kontenjan & Overbooking Barı */}
                      {tourSchedule.tourTitle && tourSchedule.tourDate && (() => {
                        const curPax = (Number(formData.adultCount) || 1) + (Number(formData.childCount) || 0);
                        const matchedTour = tours.find((t) => t.title === tourSchedule.tourTitle);
                        const capacity = matchedTour?.maxCapacity || getTourCapacity(tourSchedule.tourTitle, matchedTour);
                        const occ = calculateTourOccupancy(
                          tourSchedule.tourTitle,
                          tourSchedule.tourDate,
                          bookings.filter((b) => b.id !== editingBooking?.id),
                          capacity
                        );
                        const remainingAfterThis = occ.remainingSeats - curPax;
                        const isOverbooking = remainingAfterThis < 0;

                        return (
                          <div
                            className={`p-2.5 rounded-xl text-xs flex flex-wrap items-center justify-between gap-2 border ${
                              isOverbooking
                                ? 'bg-red-50 text-red-800 border-red-300 dark:bg-red-950/60 dark:text-red-200 dark:border-red-800 font-bold'
                                : occ.remainingSeats <= 5
                                ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-800'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-800'
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <span>⛵ Kontenjan Durumu:</span>
                              <strong>{occ.bookedPax} / {occ.capacity} Koltuk Dolu (%{occ.occupancyPercent})</strong>
                            </div>

                            {isOverbooking ? (
                              <span className="text-red-700 dark:text-red-300 font-bold">
                                ⚠️ OVERBOOKING RİSKİ! {curPax} kişi eklendiğinde kapasite {Math.abs(remainingAfterThis)} kişi aşılacak!
                              </span>
                            ) : (
                              <span>
                                Bu Rezervasyon Sonrası Kalan: <strong>{remainingAfterThis} Boş Koltuk</strong>
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Yetişkin Sayısı</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.adultCount || 1}
                    onChange={(e) => {
                      const count = Number(e.target.value) || 1;
                      const curTours = formData.tours || [];
                      const calculatedTotal = curTours.reduce((acc, t) => acc + (t.priceThb || 0), 0) * count;
                      setFormData({
                        ...formData,
                        adultCount: count,
                        totalPriceThb: calculatedTotal > 0 ? calculatedTotal : formData.totalPriceThb,
                      });
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Çocuk Sayısı</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.childCount || 0}
                    onChange={(e) => setFormData({ ...formData, childCount: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Toplam Satış Tutarı (THB)</label>
                  <input
                    type="number"
                    value={formData.totalPriceThb || 0}
                    onChange={(e) => setFormData({ ...formData, totalPriceThb: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Alınan Kapora (THB)</label>
                  <input
                    type="number"
                    value={formData.paidAmountThb || 0}
                    onChange={(e) => setFormData({ ...formData, paidAmountThb: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none text-emerald-600 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Durum</label>
                  <select
                    value={formData.status || 'confirmed'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Booking['status'] })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none font-semibold"
                  >
                    <option value="inquiry">🟡 Teklif</option>
                    <option value="confirmed">🟢 Onaylandı</option>
                    <option value="completed">🔵 Tamamlandı</option>
                    <option value="cancelled">🔴 İptal</option>
                  </select>
                </div>
              </div>

              {/* Tahsilat & Kasa Planı */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5" />
                    Kasa & Tahsilat Planı
                  </span>
                  <span className="text-xs font-extrabold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-md">
                    Kalan Bakiye: {Math.max(0, Number(formData.totalPriceThb || 0) - Number(formData.paidAmountThb || 0)).toLocaleString()} THB
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Kapora Ödeme Yöntemi
                    </label>
                    <select
                      value={formData.depositMethod || 'tr_bank_transfer'}
                      onChange={(e) => setFormData({ ...formData, depositMethod: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 text-xs focus:outline-none font-medium"
                    >
                      <option value="tr_bank_transfer">🇹🇷 TR Banka Havale / EFT</option>
                      <option value="promptpay">📱 PromptPay (K-Bank QR)</option>
                      <option value="cash_thb">💵 Nakit THB (El Kasası)</option>
                      <option value="credit_card">💳 Kredi Kartı / Online</option>
                      <option value="kbank_transfer">🏦 Tayland Banka Havalesi</option>
                      <option value="cash_usd">💵 Nakit USD</option>
                      <option value="cash_eur">💶 Nakit EUR</option>
                      <option value="wise">🌐 Wise / Uluslararası</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Bakiye Tahsilat Noktası
                    </label>
                    <select
                      value={formData.collectionLocation || 'hotel_lobby'}
                      onChange={(e) => setFormData({ ...formData, collectionLocation: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 text-xs focus:outline-none font-medium"
                    >
                      <option value="hotel_lobby">🏨 Otel Lobisi (Alış Anında)</option>
                      <option value="pier_marina">⚓ İskele / Marina Girişi</option>
                      <option value="office">🏢 Acenta Ofisi</option>
                      <option value="bank_online">💻 Önceden Havale / Online</option>
                      <option value="other">📍 Diğer Nokta</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Bakiyeyi Alacak Kişi
                    </label>
                    <input
                      type="text"
                      placeholder="Örn: Somchai (Şoför) veya Ofis"
                      value={formData.balanceCollector || ''}
                      onChange={(e) => setFormData({ ...formData, balanceCollector: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* B2B Partner / Acenta & Komisyon Paneli (Faz 2 ERP) */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5" />
                    B2B Partner & Alt Acenta Komisyonu
                  </span>
                  {formData.agentId && (Number(formData.agentCommissionThb) || 0) > 0 && (
                    <span className="text-xs font-extrabold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                      Komisyon: {(Number(formData.agentCommissionThb) || 0).toLocaleString()} THB ({formData.agentCommissionStatus === 'settled' ? 'Ödendi / Kapatıldı' : formData.agentCommissionStatus === 'cancelled' ? 'İptal' : 'Ödeme Bekliyor'})
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Yönlendiren Acenta / Partner
                    </label>
                    <select
                      value={formData.agentId || ''}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        if (!selectedId) {
                          setFormData({
                            ...formData,
                            agentId: undefined,
                            agentName: undefined,
                            agentCommissionThb: 0,
                            agentCommissionStatus: 'pending',
                          });
                          return;
                        }
                        const selectedAgent = agents.find((a) => a.id === selectedId);
                        if (selectedAgent) {
                          const comm = calculateAgentCommission(
                            selectedAgent,
                            Number(formData.totalPriceThb) || 0,
                            Number(formData.adultCount) || 1,
                            Number(formData.childCount) || 0
                          );
                          setFormData({
                            ...formData,
                            agentId: selectedAgent.id,
                            agentName: selectedAgent.name,
                            agentCommissionThb: comm,
                            agentCommissionStatus: formData.agentCommissionStatus || 'pending',
                          });
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-xs focus:outline-none font-medium"
                    >
                      <option value="">Doğrudan Satış / Acenta Yok</option>
                      {agents.map((ag) => (
                        <option key={ag.id} value={ag.id}>
                          {ag.name} ({ag.commissionType === 'percentage' ? `%${ag.commissionRate}` : `${ag.commissionRate} THB/Pax`})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Hesaplanan Komisyon (THB)
                    </label>
                    <input
                      type="number"
                      value={formData.agentCommissionThb || 0}
                      onChange={(e) => setFormData({ ...formData, agentCommissionThb: Number(e.target.value) })}
                      disabled={!formData.agentId}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-700 dark:text-indigo-300 focus:outline-none disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Komisyon Durumu
                    </label>
                    <select
                      value={formData.agentCommissionStatus || 'pending'}
                      onChange={(e) => setFormData({ ...formData, agentCommissionStatus: e.target.value as any })}
                      disabled={!formData.agentId}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-xs focus:outline-none font-medium disabled:opacity-50"
                    >
                      <option value="pending">⏳ Beklemede (Ödenecek)</option>
                      <option value="settled">✅ Ödendi / Mutabakat Yapıldı</option>
                      <option value="cancelled">❌ İptal Edildi</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Cost & Supplier & Profit Row (Faz 3 ERP) */}
              <div className="p-4 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" />
                    Tedarikçi Maliyeti & Kârlılık Hesabı
                  </span>
                  {Number(formData.totalPriceThb || 0) > 0 && (
                    <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                      Net Kâr: {Math.max(0, Number(formData.totalPriceThb || 0) - Number(formData.costThb || 0) - (Number(formData.agentCommissionThb) || 0)).toLocaleString()} THB
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400">
                        Tedarikçi Firma / Tekne Sahibi
                      </label>
                      {formData.supplier && (
                        <span className="text-[10px] text-brand-primary dark:text-brand-accent font-semibold">
                          Kayıtlı Tedarikçiler
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      list="registered-suppliers-list"
                      placeholder="Örn: Andaman Wave Master, Royal Phuket Marina vb."
                      value={formData.supplier || ''}
                      onChange={(e) => {
                        const sName = e.target.value;
                        const primaryTour = formData.tours?.[0]?.tourTitle || formData.tourTitle;
                        let newCost = formData.costThb;
                        if (primaryTour && sName) {
                          const costRule = lookupTourCost(tourCosts, primaryTour, sName);
                          if (costRule) {
                            const aCount = Number(formData.adultCount) || 1;
                            const cCount = Number(formData.childCount) || 0;
                            newCost = (costRule.netCostAdultThb * aCount) + (costRule.netCostChildThb * cCount);
                          }
                        }
                        setFormData({ ...formData, supplier: sName, costThb: newCost });
                      }}
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 text-xs focus:outline-none"
                    />
                    <datalist id="registered-suppliers-list">
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.name} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400">
                        Toplam Alış / Maliyet Gideri (THB)
                      </label>
                      {(() => {
                        const primaryTour = formData.tours?.[0]?.tourTitle || formData.tourTitle;
                        const match = primaryTour && formData.supplier ? lookupTourCost(tourCosts, primaryTour, formData.supplier) : null;
                        if (!match) return null;
                        return (
                          <button
                            type="button"
                            onClick={() => {
                              const aCount = Number(formData.adultCount) || 1;
                              const cCount = Number(formData.childCount) || 0;
                              const calc = (match.netCostAdultThb * aCount) + (match.netCostChildThb * cCount);
                              setFormData({ ...formData, costThb: calc });
                              showToast(`Matris uygulandı: ${calc.toLocaleString()} THB`);
                            }}
                            className="text-[10px] text-rose-600 hover:underline font-bold flex items-center gap-0.5"
                          >
                            ⚡ Matristen Doldur ({match.netCostAdultThb} THB/Pax)
                          </button>
                        );
                      })()}
                    </div>
                    <input
                      type="number"
                      placeholder="Tekneye ödenecek toplam tutar"
                      value={formData.costThb || 0}
                      onChange={(e) => setFormData({ ...formData, costThb: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Tedarikçi Konfirmasyon No (Ref)
                    </label>
                    <input
                      type="text"
                      placeholder="Örn: AWM-8492"
                      value={formData.supplierRefCode || ''}
                      onChange={(e) => setFormData({ ...formData, supplierRefCode: e.target.value.toUpperCase() })}
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 text-xs font-mono uppercase focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Tedarikçi Onay Durumu
                    </label>
                    <select
                      value={formData.supplierStatus || 'pending'}
                      onChange={(e) => setFormData({ ...formData, supplierStatus: e.target.value as any })}
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 text-xs font-semibold focus:outline-none"
                    >
                      <option value="pending">⏳ Sipariş İletildi / Teyit Bekliyor</option>
                      <option value="confirmed">✅ Tedarikçi Onayladı</option>
                      <option value="cancelled">❌ Tekne Dolu / İptal</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 border-t border-rose-200/60 dark:border-rose-900/30">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.nationalParkFeeIncluded ?? false}
                      onChange={(e) => setFormData({ ...formData, nationalParkFeeIncluded: e.target.checked })}
                      className="w-4 h-4 rounded text-brand-accent focus:ring-brand-accent"
                    />
                    <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                      Millî Park Giriş Harcı Fiyata DAHİLDİR (İşaretlenmezse WhatsApp ve kuponda misafire limanda nakit hazırlaması hatırlatılır)
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Özel Notlar</label>
                <textarea
                  rows={2}
                  value={formData.specialNotes || ''}
                  onChange={(e) => setFormData({ ...formData, specialNotes: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl border text-sm font-semibold">Vazgeç</button>
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-bold">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 2: TOUR (DEEP & COMPREHENSIVE EDITOR) */}
      {/* ==================================================== */}
      {isTourModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-2 w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
                  {editingTour ? `Turu Düzenle: ${editingTour.title}` : 'Yeni Tur Ekle'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Fiyatlar, fotoğraflar, tur akışı, dahil olanlar ve tüm operasyonel ayrıntılar
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsTourModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Sub-Tabs Bar */}
            <div className="px-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto py-2.5 bg-slate-50/50 dark:bg-slate-900/40 shrink-0">
              <button
                type="button"
                onClick={() => setTourActiveTab('general')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  tourActiveTab === 'general'
                    ? 'bg-brand-primary text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Genel Bilgiler</span>
              </button>
              <button
                type="button"
                onClick={() => setTourActiveTab('photos')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  tourActiveTab === 'photos'
                    ? 'bg-brand-primary text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <Image className="w-3.5 h-3.5" />
                <span>Fotoğraflar & Galeri ({(tourFormData.gallery || []).length + 1})</span>
              </button>
              <button
                type="button"
                onClick={() => setTourActiveTab('itinerary')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  tourActiveTab === 'itinerary'
                    ? 'bg-brand-primary text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Tur Akışı & Program ({(tourFormData.program || []).length})</span>
              </button>
              <button
                type="button"
                onClick={() => setTourActiveTab('inclusions')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  tourActiveTab === 'inclusions'
                    ? 'bg-brand-primary text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <ListChecks className="w-3.5 h-3.5" />
                <span>Dahil & Hariç</span>
              </button>
              <button
                type="button"
                onClick={() => setTourActiveTab('faqs')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  tourActiveTab === 'faqs'
                    ? 'bg-brand-primary text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>SSS ({(tourFormData.faq || []).length})</span>
              </button>
              <button
                type="button"
                onClick={() => setTourActiveTab('notes')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  tourActiveTab === 'notes'
                    ? 'bg-brand-primary text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Kısıtlamalar & Metin</span>
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmitTour} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* TAB 1: GENEL BİLGİLER */}
              {tourActiveTab === 'general' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                      Tur Başlığı *
                    </label>
                    <input
                      type="text"
                      required
                      value={tourFormData.title || ''}
                      onChange={(e) => setTourFormData({ ...tourFormData, title: e.target.value })}
                      placeholder="Örn: Phi Phi, Maya Bay ve Bamboo Adası"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                        Kategori *
                      </label>
                      <select
                        value={tourFormData.category || 'island-tours'}
                        onChange={(e) => setTourFormData({ ...tourFormData, category: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
                      >
                        <option value="island-tours">Ada Turları</option>
                        <option value="adventure-tours">Macera & Doğa</option>
                        <option value="entertainment-tours">Kültür & Şovlar</option>
                        <option value="private-charters">VIP Yat & Özel</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                        Tur Süresi
                      </label>
                      <input
                        type="text"
                        value={tourFormData.duration || ''}
                        onChange={(e) => setTourFormData({ ...tourFormData, duration: e.target.value })}
                        placeholder="Örn: Tam Gün (07:30 - 17:30)"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                        Kişi Başı Satış Fiyatı (THB)
                      </label>
                      <input
                        type="number"
                        value={tourFormData.priceThb || 0}
                        onChange={(e) => setTourFormData({ ...tourFormData, priceThb: Number(e.target.value) })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none font-bold"
                      />
                      <span className="text-[11px] text-slate-400 mt-1 block">0 girilirse "Teklif Alın" görünür.</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                        Kısa Açıklama (Özet)
                      </label>
                      <textarea
                        rows={2}
                        value={tourFormData.excerpt || ''}
                        onChange={(e) => setTourFormData({ ...tourFormData, excerpt: e.target.value })}
                        placeholder="Tur kartında görünecek 1-2 cümlelik tanıtım..."
                        className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Supplier & Cost in Tour Editor */}
                  <div className="p-4 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                        Tedarikçi Firma / Tekne Operatörü
                      </label>
                      <input
                        type="text"
                        placeholder="Örn: Andaman Wave Master, Sea Angel vb."
                        value={tourFormData.supplier || ''}
                        onChange={(e) => setTourFormData({ ...tourFormData, supplier: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 text-xs focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                        Kişi Başı Alış / Maliyet Tutarı (THB)
                      </label>
                      <input
                        type="number"
                        placeholder="Acente maliyet tutarı"
                        value={tourFormData.costThb || 0}
                        onChange={(e) => setTourFormData({ ...tourFormData, costThb: Number(e.target.value) })}
                        className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-600 focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">Rezervasyonlarda otomatik kâr hesaplamasında kullanılır.</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tourFormData.featured || false}
                        onChange={(e) => setTourFormData({ ...tourFormData, featured: e.target.checked })}
                        className="w-4 h-4 rounded text-brand-accent focus:ring-brand-accent"
                      />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Bu turu Ana Sayfada "Öne Çıkan Turlar" arasına ekle ⭐
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 2: FOTOĞRAFLAR & GALERİ */}
              {tourActiveTab === 'photos' && (
                <div className="space-y-6">
                  {/* Kapak Fotoğrafı */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                        Ana Kapak Fotoğrafı *
                      </label>
                      <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Bilgisayardan Yükle</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileUpload(file, (url) => {
                                setTourFormData({ ...tourFormData, image: url });
                              });
                            }
                            e.target.value = '';
                          }}
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                      <select
                        value={tourFormData.image || 'phuket_hero.webp'}
                        onChange={(e) => setTourFormData({ ...tourFormData, image: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none"
                      >
                        {allImageOptions.map((img) => (
                          <option key={img} value={img}>
                            {img.startsWith('data:') ? 'Özel Yüklenen Dosya' : img}
                          </option>
                        ))}
                      </select>

                      <input
                        type="text"
                        placeholder="veya direkt görsel URL'si girin..."
                        value={tourFormData.image || ''}
                        onChange={(e) => setTourFormData({ ...tourFormData, image: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
                      />
                    </div>

                    {tourFormData.image && (
                      <div className="flex items-center gap-3 pt-2">
                        <img
                          src={getImageUrl(tourFormData.image)}
                          alt="Kapak Önizleme"
                          className="w-24 h-16 object-cover rounded-xl border border-slate-300 dark:border-slate-700 shadow-sm"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/phuket_hero.webp';
                          }}
                        />
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Kapak Önizleme</span>
                          <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 truncate block max-w-sm">
                            {tourFormData.image}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Galeri Fotoğrafları */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          Turdan Fotoğraflar (Galeri)
                        </span>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Tur sayfasında sergilenecek ek fotoğraflar ({ (tourFormData.gallery || []).length } adet)
                        </p>
                      </div>

                      <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs">
                        <Plus className="w-3.5 h-3.5" />
                        <span>Galeriye Fotoğraf Yükle</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileUpload(file, (url) => {
                                setTourFormData({
                                  ...tourFormData,
                                  gallery: [...(tourFormData.gallery || []), url],
                                });
                              });
                            }
                            e.target.value = '';
                          }}
                        />
                      </label>
                    </div>

                    {/* Galeri Önizleme Grid */}
                    {(tourFormData.gallery || []).length > 0 ? (
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 pt-2">
                        {(tourFormData.gallery || []).map((img, idx) => (
                          <div key={`${img}-${idx}`} className="relative group">
                            <img
                              src={getImageUrl(img)}
                              alt={`Galeri ${idx + 1}`}
                              className="w-full h-16 object-cover rounded-xl border border-slate-300 dark:border-slate-700 shadow-xs"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setTourFormData({
                                  ...tourFormData,
                                  gallery: (tourFormData.gallery || []).filter((_, i) => i !== idx),
                                })
                              }
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-bold shadow-md hover:bg-red-600 transition-colors"
                              title="Fotoğrafı Galeriden Kaldır"
                            >
                              ✕
                            </button>
                            {idx === 0 && (
                              <span className="absolute bottom-1 left-1 px-1 py-0.5 rounded bg-black/70 text-white text-[8px] font-bold">
                                #1
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 py-3 italic text-center">
                        Henüz galeri fotoğrafı eklenmemiş. Aşağıdan veya bilgisayarınızdan ekleyebilirsiniz.
                      </p>
                    )}

                    {/* Kütüphaneden Seçerek Galeriye Ekle */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <select
                        value=""
                        onChange={(e) => {
                          const selected = e.target.value;
                          if (selected && !(tourFormData.gallery || []).includes(selected)) {
                            setTourFormData({
                              ...tourFormData,
                              gallery: [...(tourFormData.gallery || []), selected],
                            });
                          }
                          e.target.value = '';
                        }}
                        className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
                      >
                        <option value="">+ Kütüphaneden Fotoğraf Seç ve Ekle...</option>
                        {allImageOptions.map((img) => (
                          <option key={img} value={img}>
                            {img.startsWith('data:') ? 'Özel Yüklenen Görsel' : img}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: TUR AKIŞI & PROGRAM */}
              {tourActiveTab === 'itinerary' && (
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300 block mb-1">
                      Tur Programı & Akış Adımları ({(tourFormData.program || []).length})
                    </span>
                    <p className="text-xs text-slate-400 mb-3">
                      Misafirlerin tur sayfasında gördüğü saat saat zaman çizelgesi.
                    </p>
                  </div>

                  {/* List of items */}
                  <div className="space-y-2">
                    {(tourFormData.program || []).map((step, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 gap-2 text-xs"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <span className="w-6 h-6 rounded-lg bg-brand-primary/10 text-brand-primary dark:text-brand-accent font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">{step}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setTourFormData({
                              ...tourFormData,
                              program: (tourFormData.program || []).filter((_, i) => i !== idx),
                            })
                          }
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40"
                          title="Adımı Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add step */}
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      value={tempProgramItem}
                      onChange={(e) => setTempProgramItem(e.target.value)}
                      placeholder="Örn: 09:30 - Maya Bay kumsalında serbest fotoğraf molası"
                      className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (tempProgramItem.trim()) {
                            setTourFormData({
                              ...tourFormData,
                              program: [...(tourFormData.program || []), tempProgramItem.trim()],
                            });
                            setTempProgramItem('');
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (tempProgramItem.trim()) {
                          setTourFormData({
                            ...tourFormData,
                            program: [...(tourFormData.program || []), tempProgramItem.trim()],
                          });
                          setTempProgramItem('');
                        }
                      }}
                      className="px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-bold shrink-0 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ekle</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: DAHİL & HARİÇ OLANLAR */}
              {tourActiveTab === 'inclusions' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Dahil Olanlar */}
                  <div className="space-y-3 p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-emerald-800 dark:text-emerald-300">
                        ✅ Dahil Olanlar ({(tourFormData.included || []).length})
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-56 overflow-y-auto">
                      {(tourFormData.included || []).map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900 text-xs"
                        >
                          <span className="text-slate-800 dark:text-slate-200">{item}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setTourFormData({
                                ...tourFormData,
                                included: (tourFormData.included || []).filter((_, i) => i !== idx),
                              })
                            }
                            className="text-slate-400 hover:text-red-500 p-1"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5 pt-2">
                      <input
                        type="text"
                        value={tempIncludedItem}
                        onChange={(e) => setTempIncludedItem(e.target.value)}
                        placeholder="Örn: Açık büfe öğle yemeği"
                        className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 text-xs focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (tempIncludedItem.trim()) {
                            setTourFormData({
                              ...tourFormData,
                              included: [...(tourFormData.included || []), tempIncludedItem.trim()],
                            });
                            setTempIncludedItem('');
                          }
                        }}
                        className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0"
                      >
                        + Ekle
                      </button>
                    </div>
                  </div>

                  {/* Hariç Olanlar */}
                  <div className="space-y-3 p-4 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-red-800 dark:text-red-300">
                        ❌ Hariç Olanlar ({(tourFormData.excluded || []).length})
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-56 overflow-y-auto">
                      {(tourFormData.excluded || []).map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900 text-xs"
                        >
                          <span className="text-slate-800 dark:text-slate-200">{item}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setTourFormData({
                                ...tourFormData,
                                excluded: (tourFormData.excluded || []).filter((_, i) => i !== idx),
                              })
                            }
                            className="text-slate-400 hover:text-red-500 p-1"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5 pt-2">
                      <input
                        type="text"
                        value={tempExcludedItem}
                        onChange={(e) => setTempExcludedItem(e.target.value)}
                        placeholder="Örn: Milli Park Giriş Harcı"
                        className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800 text-xs focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (tempExcludedItem.trim()) {
                            setTourFormData({
                              ...tourFormData,
                              excluded: [...(tourFormData.excluded || []), tempExcludedItem.trim()],
                            });
                            setTempExcludedItem('');
                          }
                        }}
                        className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shrink-0"
                      >
                        + Ekle
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: TURA ÖZEL SSS */}
              {tourActiveTab === 'faqs' && (
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300 block mb-1">
                      Tura Özel Sıkça Sorulan Sorular ({(tourFormData.faq || []).length})
                    </span>
                    <p className="text-xs text-slate-400 mb-3">
                      Misafirlerin bu tur sayfasına özel göreceği sorular ve cevapları.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {(tourFormData.faq || []).map((faqItem, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 relative group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            S: {faqItem.q}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setTourFormData({
                                ...tourFormData,
                                faq: (tourFormData.faq || []).filter((_, i) => i !== idx),
                              })
                            }
                            className="text-slate-400 hover:text-red-500 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          C: {faqItem.a}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Add FAQ */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
                    <span className="text-xs font-bold uppercase text-brand-primary dark:text-brand-accent block">
                      + Yeni Soru & Cevap Ekle
                    </span>
                    <input
                      type="text"
                      placeholder="Soru: Örn: Turda vejetaryen yemek var mı?"
                      value={tempFaqQ}
                      onChange={(e) => setTempFaqQ(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
                    />
                    <textarea
                      rows={2}
                      placeholder="Cevap: Örn: Evet, rezervasyon sırasında belirtirseniz vejetaryen menü hazırlanmaktadır."
                      value={tempFaqA}
                      onChange={(e) => setTempFaqA(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (tempFaqQ.trim() && tempFaqA.trim()) {
                          setTourFormData({
                            ...tourFormData,
                            faq: [...(tourFormData.faq || []), { q: tempFaqQ.trim(), a: tempFaqA.trim() }],
                          });
                          setTempFaqQ('');
                          setTempFaqA('');
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-bold"
                    >
                      Soruyu Ekle
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 6: KISITLAMALAR & AÇIKLAMA METNİ */}
              {tourActiveTab === 'notes' && (
                <div className="space-y-5">
                  {/* Restrictions */}
                  <div className="p-4 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 space-y-3">
                    <span className="text-xs font-bold uppercase text-amber-800 dark:text-amber-300 block">
                      ⚠️ Katılım Kısıtlamaları & Sağlık Uyarıları ({(tourFormData.restrictions || []).length})
                    </span>

                    <div className="space-y-1.5">
                      {(tourFormData.restrictions || []).map((res, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-amber-100 dark:border-amber-900 text-xs"
                        >
                          <span className="text-slate-800 dark:text-slate-200">{res}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setTourFormData({
                                ...tourFormData,
                                restrictions: (tourFormData.restrictions || []).filter((_, i) => i !== idx),
                              })
                            }
                            className="text-slate-400 hover:text-red-500 p-1"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      <input
                        type="text"
                        value={tempRestrictionItem}
                        onChange={(e) => setTempRestrictionItem(e.target.value)}
                        placeholder="Örn: Hamile misafirler ve 1 yaş altı bebekler için uygun değildir"
                        className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 text-xs focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (tempRestrictionItem.trim()) {
                            setTourFormData({
                              ...tourFormData,
                              restrictions: [...(tourFormData.restrictions || []), tempRestrictionItem.trim()],
                            });
                            setTempRestrictionItem('');
                          }
                        }}
                        className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0"
                      >
                        + Ekle
                      </button>
                    </div>
                  </div>

                  {/* Body Text */}
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                      Tur Detay Yazısı (Açıklama / Markdown)
                    </label>
                    <textarea
                      rows={6}
                      value={tourFormData.body || ''}
                      onChange={(e) => setTourFormData({ ...tourFormData, body: e.target.value })}
                      placeholder="Tur hakkında ayrıntılı açıklama yazısı..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {editingTour ? 'Değişiklikler anında yerel veritabanına kaydedilir.' : 'Yeni tur hemen listeye eklenecektir.'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsTourModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-bold shadow-md shadow-brand-primary/20 flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingTour ? 'Değişiklikleri Kaydet' : 'Turu Oluştur'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

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
