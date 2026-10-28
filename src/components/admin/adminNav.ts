/**
 * Panel menüsünün tek kaynağı — AdminDashboard'dan ayrıldı.
 *
 * `AdminTab` tipi, kategori tanımları ve `NAV_ITEMS` listesi burada yaşar;
 * AdminDashboard yalnızca bunları tüketir. Yeni bir sekme eklemek için başka
 * bir dosyaya dokunmaya gerek yoktur.
 *
 * Geriye dönük uyumluluk: AdminDashboard bu tipleri yeniden dışa aktarır,
 * çünkü CommandPaletteModal ve OverviewTab oradan import ediyor.
 */
import type React from 'react';
import {
  Users,
  Compass,
  DollarSign,
  TrendingUp,
  MessageCircle,
  FileText,
  Settings,
  HelpCircle,
  BookOpen,
  Car,
  MessageSquareQuote,
  Image,
  Layers,
  Briefcase,
  Bus,
  Zap,
  Wallet,
  Building,
  Ship,
  Globe,
  History,
} from 'lucide-react';

/* ---------------------------------------------------------------------------
   PANEL MENÜSÜ — tek kaynak
   Sekmeler üç iş grubuna ayrılır: Operasyon (bugün sahada ne oluyor),
   İçerik (sitede ne görünüyor), Sistem (iletişim + ayarlar).
   Bir sekme eklemek için yalnızca buraya bir satır yazmak yeterlidir;
   JSX'te tekrarlanan buton bloğu yoktur.
   ------------------------------------------------------------------------- */

export type AdminTab =
  | 'overview' | 'bookings' | 'finance' | 'transfers' | 'proposals' | 'partners' | 'settlements' | 'suppliers' | 'fleet'
  | 'tours' | 'homepage' | 'media' | 'services' | 'blogs' | 'faqs' | 'testimonials'
  | 'whatsapp' | 'settings' | 'users' | 'audit';

export type NavCategory = 'operations' | 'finance' | 'content' | 'system' | 'all';

export interface NavSubItem {
  id: string;
  label: string;
  shortLabel?: string;
  icon?: string;
  badge?: string;
  actionKey?: string;
}

export interface NavItem {
  id: AdminTab;
  label: string;
  shortLabel?: string;
  category: 'operations' | 'finance' | 'content' | 'system';
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  hotkey?: string;
  showCount?: boolean;
  subItems?: NavSubItem[];
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
    id: 'all',
    label: 'Tüm Modüller',
    shortLabel: 'Tümü',
    icon: Layers,
    description: 'Tüm operasyon, finans, içerik ve sistem araçları',
  },
  {
    id: 'operations',
    label: 'Operasyon & Saha',
    shortLabel: 'Operasyon',
    icon: Zap,
    description: 'Günlük rezervasyon, transfer, teklif ve filo yönetimi',
  },
  {
    id: 'finance',
    label: 'Finans, Kasa & B2B',
    shortLabel: 'Finans',
    icon: Wallet,
    description: 'Kasa, masraflar, hakedişler, B2B acentalar ve tedarikçiler',
  },
  {
    id: 'content',
    label: 'Web & İçerik (CMS)',
    shortLabel: 'İçerik',
    icon: Globe,
    description: 'Turlar, medya, hizmetler, blog ve vitrin yönetimi',
  },
  {
    id: 'system',
    label: 'Sistem & Yönetim',
    shortLabel: 'Sistem',
    icon: Settings,
    description: 'WhatsApp şablonları, ekip yetkileri ve site ayarları',
  },
];

export const NAV_ITEMS: NavItem[] = [
  // =========================================================
  // 🚀 GRUP 1: OPERASYON & SAHA (Günlük Saha ve Misafir Yönetimi)
  // =========================================================
  {
    id: 'overview',
    label: 'Genel Bakış',
    shortLabel: 'Özet',
    category: 'operations',
    icon: TrendingUp,
    description: 'Günlük ciro, doluluk ve operasyonel canlı özet',
    hotkey: '1',
    subItems: [
      { id: 'overview_stats', label: 'Canlı Metrikler & Doluluk', icon: '📊' },
      { id: 'overview_today', label: 'Günün Hızlı Özeti', icon: '⚡' },
    ],
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
    subItems: [
      { id: 'bookings_list', label: 'Tüm Rezervasyonlar', icon: '📋' },
      { id: 'bookings_new', label: 'Yeni Rezervasyon Ekle', icon: '➕', actionKey: 'create_booking' },
      { id: 'bookings_qr', label: 'Bilet QR Oku / Check-in', icon: '🎫', actionKey: 'open_qr_scanner' },
      { id: 'bookings_welcome', label: 'VIP Karşılama İsimliği', icon: '🪧', actionKey: 'open_welcome_board' },
    ],
  },
  {
    id: 'transfers',
    label: 'Transferler & Lojistik',
    shortLabel: 'Transfer',
    category: 'operations',
    icon: Car,
    description: 'Havalimanı & otel alma/bırakma sevk manifestosu',
    hotkey: '3',
    subItems: [
      { id: 'transfers_manifest', label: 'Sevk Manifestosu & Harita', icon: '🚐' },
      { id: 'transfers_flight', label: 'Canlı Uçuş Radarı', icon: '✈️', actionKey: 'open_flight_radar' },
      { id: 'transfers_luggage', label: 'Bagaj Masası & Emanet', icon: '🧳', actionKey: 'open_luggage_express' },
      { id: 'transfers_pier', label: 'İskele Kaptan Manifestosu', icon: '🚢', actionKey: 'open_pier_manifest' },
      { id: 'transfers_police', label: 'Deniz Polisi Manifestosu', icon: '📋', actionKey: 'open_marine_police' },
      { id: 'transfers_dietary', label: 'Diyet & Medikal Emniyet', icon: '🥗', actionKey: 'open_dietary_manifest' },
      { id: 'transfers_lost', label: 'Kayıp Eşya Masası', icon: '📦', actionKey: 'open_lost_found' },
      { id: 'transfers_pwa', label: 'Kaptan Kasası (PWA)', icon: '📶', actionKey: 'open_captain_vault' },
    ],
  },
  {
    id: 'proposals',
    label: 'Teklifler',
    shortLabel: 'Teklifler',
    category: 'operations',
    icon: FileText,
    description: 'Kişiye özel çok günlü tatil paketi ve tekli VIP tur teklif stüdyosu',
    hotkey: '4',
    subItems: [
      { id: 'proposals_studio', label: 'Teklif Stüdyosu', icon: '📄' },
      { id: 'proposals_print', label: 'A4 PDF İndir / Yazdır', icon: '🖨️', actionKey: 'open_proposal_print' },
      { id: 'proposals_wa', label: 'WhatsApp Formatında Paylaş', icon: '📱', actionKey: 'open_proposal_whatsapp' },
    ],
  },
  {
    id: 'fleet',
    label: 'Filo & Şoförler',
    shortLabel: 'Filo',
    category: 'operations',
    icon: Bus,
    description: 'Minibüsler, şoförler ve araç rotalama',
    hotkey: '5',
    subItems: [
      { id: 'fleet_vehicles', label: 'Minibüs Filosu & VIP Vanlar', icon: '🚌' },
      { id: 'fleet_drivers', label: 'Şoför Kadrosu & Nöbet', icon: '👤' },
    ],
  },

  // =========================================================
  // 💵 GRUP 2: FİNANS, KASA & B2B (Muhasebe, Masraflar & Ortaklar)
  // =========================================================
  {
    id: 'finance',
    label: 'Kasa & Finans',
    shortLabel: 'Kasa',
    category: 'finance',
    icon: Wallet,
    description: 'Nakit kasa, PromptPay, tahsilat makbuzları ve alacak takibi',
    hotkey: '6',
    subItems: [
      { id: 'finance_summary', label: 'Kasa Özeti & Tahsilat', icon: '💰' },
      { id: 'finance_driver_exp', label: 'Şoför Masrafı (Yakıt/Harç)', icon: '⛽', actionKey: 'open_driver_expense' },
      { id: 'finance_guide_exp', label: 'Rehber Masrafı (Taksi/Yemek)', icon: '🗣️', actionKey: 'open_guide_expense' },
      { id: 'finance_cashier', label: 'Saha Çoklu Döviz Kasa', icon: '💱', actionKey: 'open_field_cashier' },
      { id: 'finance_promptpay', label: 'PromptPay QR Üretici', icon: '📱', actionKey: 'open_promptpay' },
    ],
  },
  {
    id: 'settlements',
    label: 'Hakediş & Kâr',
    shortLabel: 'Hakediş',
    category: 'finance',
    icon: DollarSign,
    description: 'Tedarikçi ödemeleri, kâr marjı ve mutabakat ekstresi',
    hotkey: '7',
    subItems: [
      { id: 'settlements_suppliers', label: 'Tedarikçi Mutabakatı', icon: '📊' },
      { id: 'settlements_profit', label: 'Kâr Marjı & Maliyet Analizi', icon: '📈' },
    ],
  },
  {
    id: 'partners',
    label: 'Acenta & B2B',
    shortLabel: 'Acenta',
    category: 'finance',
    icon: Building,
    description: 'Partner alt acentalar, otel rehberleri ve komisyon carileri',
    hotkey: '8',
    subItems: [
      { id: 'partners_agents', label: 'Partner Seyahat Acentaları', icon: '🏢' },
      { id: 'partners_guides', label: 'Otel Tur Rehberleri', icon: '🏖️' },
      { id: 'partners_commissions', label: 'Komisyon & Cari Hesaplar', icon: '📋' },
    ],
  },
  {
    id: 'suppliers',
    label: 'Tedarikçi Kataloğu',
    shortLabel: 'Tedarikçi',
    category: 'finance',
    icon: Ship,
    description: 'Tekne firmaları ve net tur alış fiyat matrisi',
    hotkey: '9',
    subItems: [
      { id: 'suppliers_boats', label: 'Tekne Firmaları (Andaman Wave)', icon: '🚢' },
      { id: 'suppliers_parks', label: 'Fil Koruma & Şov Merkezleri', icon: '🐘' },
      { id: 'suppliers_matrix', label: 'Net Tur Alış Fiyat Matrisi', icon: '🏷️' },
    ],
  },

  // =========================================================
  // 🌐 GRUP 3: WEB & İÇERİK (CMS Vitrin Yönetimi)
  // =========================================================
  {
    id: 'tours',
    label: 'Turlar & Fiyatlar',
    shortLabel: 'Turlar',
    category: 'content',
    icon: Compass,
    description: 'Tur programları, fiyatlandırma ve içerikler',
    subItems: [
      { id: 'tours_catalog', label: 'Tur Kataloğu & Fiyatlar', icon: '🏝️' },
      { id: 'tours_new', label: 'Yeni Tur Ekle', icon: '➕', actionKey: 'create_tour' },
    ],
  },
  {
    id: 'homepage',
    label: 'Anasayfa & Vitrin',
    shortLabel: 'Anasayfa',
    category: 'content',
    icon: Globe,
    description: 'Bölüm görünürlükleri, slaytlar, vitrin ve dinamik metinler',
    subItems: [
      { id: 'home_sections', label: 'Bölüm Aç / Kapa', icon: '🎛️' },
      { id: 'home_hero', label: 'Hero & Slaytlar', icon: '🖼️' },
      { id: 'home_trust', label: 'Güven Rozetleri', icon: '🛡️' },
      { id: 'home_whyus', label: 'Neden Biz & Kartlar', icon: '✨' },
    ],
  },
  {
    id: 'services',
    label: 'VIP & Hizmetler',
    shortLabel: 'Hizmetler',
    category: 'content',
    icon: Briefcase,
    description: 'VIP karşılama, yat kiralama ve özel hizmetler',
    subItems: [
      { id: 'services_list', label: 'VIP Hizmet Kataloğu', icon: '🛥️' },
      { id: 'services_new', label: 'Yeni Hizmet Ekle', icon: '➕', actionKey: 'create_service' },
    ],
  },
  {
    id: 'media',
    label: 'Medya Galerisi',
    shortLabel: 'Medya',
    category: 'content',
    icon: Image,
    description: 'Görseller, fotoğraf kütüphanesi ve afişler',
    subItems: [
      { id: 'media_gallery', label: 'Görsel Kütüphanesi', icon: '📸' },
      { id: 'media_upload', label: 'Yeni Görsel Yükle', icon: '⬆️', actionKey: 'upload_media' },
    ],
  },
  {
    id: 'blogs',
    label: 'Blog & Rehber',
    shortLabel: 'Blog',
    category: 'content',
    icon: BookOpen,
    description: 'Rehber yazıları ve gezi makaleleri',
    subItems: [
      { id: 'blogs_articles', label: 'Rehber Yazıları & SEO', icon: '✍️' },
      { id: 'blogs_new', label: 'Yeni Yazı Ekle', icon: '➕', actionKey: 'create_blog' },
    ],
  },
  {
    id: 'faqs',
    label: 'Sıkça Sorulanlar',
    shortLabel: 'SSS',
    category: 'content',
    icon: HelpCircle,
    description: 'Phuket tatili ve tur SSS maddeleri',
    subItems: [
      { id: 'faqs_list', label: 'SSS Soru & Cevap Maddeleri', icon: '❓' },
    ],
  },
  {
    id: 'testimonials',
    label: 'Müşteri Yorumları',
    shortLabel: 'Yorumlar',
    category: 'content',
    icon: MessageSquareQuote,
    description: 'Misafir değerlendirmeleri ve referanslar',
    subItems: [
      { id: 'testi_reviews', label: 'Misafir Değerlendirmeleri', icon: '⭐' },
    ],
  },

  // =========================================================
  // ⚙️ GRUP 4: SİSTEM & YÖNETİM (İletişim, Ekip ve Ayarlar)
  // =========================================================
  {
    id: 'whatsapp',
    label: 'WhatsApp Masası',
    shortLabel: 'WhatsApp',
    category: 'system',
    icon: MessageCircle,
    description: 'Misafir ve şoför otomatik hazır mesaj metinleri',
    subItems: [
      { id: 'wa_templates', label: 'Hazır Şablon Metinleri', icon: '💬' },
      { id: 'wa_morning', label: 'Sabah Lobi Hatırlatıcı', icon: '⏰' },
      { id: 'wa_review', label: 'Tur Sonu Google Yorum Booster', icon: '🌟' },
    ],
  },
  {
    id: 'users',
    label: 'Ekip & Yetkiler',
    shortLabel: 'Ekip',
    category: 'system',
    icon: Users,
    description: 'Yönetici, müdür, rehber ve şoför hesapları',
    showCount: true,
    subItems: [
      { id: 'users_list', label: 'Personel Hesapları', icon: '👥' },
      { id: 'users_rbac', label: 'Rol & Yetki Matrisi', icon: '🛡️' },
    ],
  },
  {
    id: 'audit',
    label: 'Değişiklik Geçmişi',
    shortLabel: 'Geçmiş',
    category: 'system',
    icon: History,
    description: 'CMS koleksiyonlarında yapılan son değişiklikler',
  },
  {
    id: 'settings',
    label: 'Site Ayarları',
    shortLabel: 'Ayarlar',
    category: 'system',
    icon: Settings,
    description: 'Telefon, e-posta, sosyal medya ve genel ayarlar',
    subItems: [
      { id: 'settings_contact', label: 'İletişim & WhatsApp Hattı', icon: '📞' },
      { id: 'settings_fx', label: 'Döviz Kurları & Para Birimi', icon: '💱' },
      { id: 'settings_seo', label: 'Site Başlığı & SEO Bilgileri', icon: '🌐' },
    ],
  },
];

export const PRIMARY_NAV_ITEMS = NAV_ITEMS.filter((i) => i.category === 'operations');
export const FINANCE_NAV_ITEMS = NAV_ITEMS.filter((i) => i.category === 'finance');
export const CMS_NAV_ITEMS = NAV_ITEMS.filter((i) => i.category === 'content');
export const SYSTEM_NAV_ITEMS = NAV_ITEMS.filter((i) => i.category === 'system');
