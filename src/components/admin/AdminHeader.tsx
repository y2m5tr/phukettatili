/**
 * Üst header barı — AdminDashboard'dan ayrıldı.
 *
 * Saf presentational bileşen: aktif sekme başlığı, hızlı masraf kısayolları,
 * ⚡ Hızlı Operasyon Araçları menüsü (dropdown state'i burada yerel), Spotlight
 * arama, çevrimdışı/bulut senkron göstergeleri, yeni rezervasyon ve çıkış
 * butonları. Tüm eylemler `actions` nesnesi ve callback prop'larıyla gelir;
 * modal state'leri parent'ta kalır.
 */
import { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  Camera,
  ChevronDown,
  CloudUpload,
  Coins,
  FileText,
  Fuel,
  LogOut,
  Luggage,
  Menu,
  Package,
  Plane,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  Ship,
  Smartphone,
  Trash2,
  UserCheck,
  WifiOff,
} from 'lucide-react';
import type { NavItem } from './adminNav';
import { resolveAssetUrl } from '../../lib/assets';
import {
  getNotificationPermissionStatus,
  requestNotificationPermission,
  getNotificationHistory,
  markAllNotificationsAsRead,
  clearNotificationHistory,
  sendTransferPushNotification,
  type CrewNotificationItem,
} from '../../lib/pwaNotifications';

/** Hızlı araçlar menüsünün açtığı tüm masalar — parent'taki modal setter'ları. */
export interface AdminHeaderActions {
  openQrScanner: () => void;
  openWelcomeBoard: () => void;
  openDriverExpense: () => void;
  openGuideExpense: () => void;
  openFieldCashier: () => void;
  openPromptPayQr: () => void;
  openFlightRadar: () => void;
  openLuggageExpress: () => void;
  openLostFound: () => void;
  openPoliceManifest: () => void;
  openPierManifest: () => void;
  openDietaryManifest: () => void;
  openCaptainDrawer: () => void;
  openProposals: () => void;
}

export interface AdminHeaderSyncState {
  isOnline: boolean;
  isCloudConnected: boolean;
  isSyncing: boolean;
  pendingSyncCount: number;
  lastSyncedAt: Date | null;
}

interface AdminHeaderProps {
  activeNavItem?: NavItem;
  onMobileSidebarOpen: () => void;
  onOpenCommandPalette: () => void;
  onNewBooking: () => void;
  onLogout: () => void;
  isSigningOut: boolean;
  canCreateBookings: boolean;
  sync: AdminHeaderSyncState;
  onManualSync: () => void;
  actions: AdminHeaderActions;
  logoUrl?: string;
  logoText?: string;
}

export default function AdminHeader({
  activeNavItem,
  onMobileSidebarOpen,
  onOpenCommandPalette,
  onNewBooking,
  onLogout,
  isSigningOut,
  canCreateBookings,
  sync,
  onManualSync,
  actions,
  logoUrl,
  logoText,
}: AdminHeaderProps) {
  const [isQuickToolsDropdownOpen, setIsQuickToolsDropdownOpen] = useState<boolean>(false);
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<CrewNotificationItem[]>([]);
  const [permissionStatus, setPermissionStatus] = useState<string>('default');
  const { isOnline, isCloudConnected, isSyncing, pendingSyncCount, lastSyncedAt } = sync;

  useEffect(() => {
    setNotifications(getNotificationHistory());
    setPermissionStatus(getNotificationPermissionStatus());

    const handleUpdate = (e: any) => {
      if (e.detail?.items) {
        setNotifications(e.detail.items);
      }
    };
    window.addEventListener('ptt:notification:updated', handleUpdate);
    return () => window.removeEventListener('ptt:notification:updated', handleUpdate);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleToggleNotifications = () => {
    setIsNotificationMenuOpen((prev) => !prev);
    if (!isNotificationMenuOpen && unreadCount > 0) {
      markAllNotificationsAsRead();
    }
  };

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setPermissionStatus(granted ? 'granted' : 'denied');
    if (granted) {
      await sendTransferPushNotification({
        bookingId: 'TEST-01',
        customerName: 'Saha Testi',
        hotel: 'PWA Push Bildirimleri Başarıyla Açıldı!',
        newTime: 'Şimdi',
        vehicle: 'VIP Hat',
      });
    }
  };

  const handleSendTestPush = async () => {
    await sendTransferPushNotification({
      bookingId: 'PWA-DEMO',
      customerName: 'Test Misafiri',
      hotel: 'Hilton Phuket Resort (Karon)',
      oldTime: '07:30',
      newTime: '07:50',
      vehicle: 'Minibüs Hat-2',
      roomNumber: '304',
    });
  };

  return (
    <header className="sticky top-0 z-30 min-h-16 py-2 bg-white/95 dark:bg-surface-1/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 shadow-2xs">
      {/* Sol: Menü Açma (Mobil) + Logo + Aktif Sekme Başlığı */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMobileSidebarOpen}
          className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          aria-label="Menüyü Aç"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobilde Sol Üst Logo */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="md:hidden shrink-0 flex items-center"
          title="Web Sitesini Yeni Sekmede Aç"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-900/5 dark:bg-slate-800/80 p-0.5 flex items-center justify-center border border-slate-200 dark:border-slate-700/60 shadow-2xs">
            <img
              src={resolveAssetUrl(logoUrl, '/assets/logo-main-transparent.png')}
              alt={logoText || 'Phuket Tatili'}
              className="w-full h-full object-contain"
            />
          </div>
        </a>

        {activeNavItem && (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white dark:bg-brand-accent dark:text-slate-950 flex items-center justify-center shrink-0">
              <activeNavItem.icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 leading-none">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {activeNavItem.category === 'operations'
                    ? 'Operasyon & Saha'
                    : activeNavItem.category === 'finance'
                    ? 'Finans, Kasa & B2B'
                    : activeNavItem.category === 'content'
                    ? 'Web & İçerik'
                    : 'Sistem & Yönetim'}
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
        {/* Masaüstü Hızlı Masraf Kısayolları (Şoför & Rehber Masrafı doğrudan tek tıkla önünüzde) */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            type="button"
            onClick={actions.openDriverExpense}
            className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/25 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Şoför Saha Yakıt, Otopark & Harç Masraf Masası"
          >
            <Fuel className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="hidden md:inline">Şoför Masrafı</span>
            <span className="md:hidden">Şoför</span>
          </button>

          <button
            type="button"
            onClick={actions.openGuideExpense}
            className="px-2.5 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-800 dark:text-teal-300 border border-teal-500/25 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Rehber Taksi/Grab, Yemek, Karşılama & Saha Masraf Masası"
          >
            <UserCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span className="hidden md:inline">Rehber Masrafı</span>
            <span className="md:hidden">Rehber</span>
          </button>
        </div>

        {/* ⚡ Hızlı Operasyon Araçları Açılır Menüsü (Tüm ekran boyutlarında modüler 4 masa) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsQuickToolsDropdownOpen((v) => !v)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800 text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Tüm Hızlı Saha & Operasyon Araçları"
          >
            <span className="text-amber-500">⚡</span>
            <span className="hidden sm:inline">Hızlı Araçlar</span>
            <span className="sm:hidden">Araçlar</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isQuickToolsDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsQuickToolsDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-surface-2 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2.5 z-50 divide-y divide-slate-100 dark:divide-slate-800 max-h-[85vh] overflow-y-auto">
                {/* 1. Saha & Check-in */}
                <div className="p-1 space-y-1">
                  <div className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider px-2 py-0.5 flex items-center gap-1">
                    <span>🚀</span>
                    <span>Sevk & Check-in</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      actions.openQrScanner();
                      setIsQuickToolsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-purple-500/10 hover:text-purple-600 transition-colors text-left cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-purple-600" />
                    <span>Bilet QR Oku / Check-in</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      actions.openWelcomeBoard();
                      setIsQuickToolsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-amber-500/10 hover:text-amber-600 transition-colors text-left cursor-pointer"
                  >
                    <span className="text-xs">🪧</span>
                    <span>VIP Karşılama İsimlik Stüdyosu</span>
                  </button>
                </div>

                {/* 2. Kasa & Masraflar */}
                <div className="p-1 pt-2 space-y-1">
                  <div className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider px-2 py-0.5 flex items-center gap-1">
                    <span>💵</span>
                    <span>Kasa & Masraflar</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      actions.openDriverExpense();
                      setIsQuickToolsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-amber-500/10 hover:text-amber-600 transition-colors text-left cursor-pointer"
                  >
                    <Fuel className="w-3.5 h-3.5 text-amber-600" />
                    <span>Şoför Yakıt & Harç Masrafı</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      actions.openGuideExpense();
                      setIsQuickToolsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-teal-500/10 hover:text-teal-600 transition-colors text-left cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                    <span>Rehber Masrafı (Taksi, Yemek, Saha)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      actions.openFieldCashier();
                      setIsQuickToolsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-600 transition-colors text-left cursor-pointer"
                  >
                    <Coins className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Saha Çoklu Döviz Kasa Hesaplayıcı</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      actions.openPromptPayQr();
                      setIsQuickToolsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-sky-500/10 hover:text-sky-600 transition-colors text-left cursor-pointer"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-sky-600" />
                    <span>PromptPay QR Kod Üretici</span>
                  </button>
                </div>

                {/* 3. Lojistik & Uçuş */}
                <div className="p-1 pt-2 space-y-1">
                  <div className="text-[10px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-wider px-2 py-0.5 flex items-center gap-1">
                    <span>✈️</span>
                    <span>Lojistik & Havalimanı</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      actions.openFlightRadar();
                      setIsQuickToolsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-sky-500/10 hover:text-sky-600 transition-colors text-left cursor-pointer"
                  >
                    <Plane className="w-3.5 h-3.5 text-sky-600" />
                    <span>Canlı Uçuş Radarı & Rötar Kalkanı</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      actions.openLuggageExpress();
                      setIsQuickToolsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-500/10 hover:text-indigo-600 transition-colors text-left cursor-pointer"
                  >
                    <Luggage className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Oteller Arası Bagaj Transfer Masası</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      actions.openLostFound();
                      setIsQuickToolsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-amber-500/10 hover:text-amber-600 transition-colors text-left cursor-pointer"
                  >
                    <Package className="w-3.5 h-3.5 text-amber-600" />
                    <span>Kayıp Eşya Takip Masası</span>
                  </button>
                </div>

                {/* 4. Emniyet & Manifestolar */}
                <div className="p-1 pt-2 space-y-1">
                  <div className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider px-2 py-0.5 flex items-center gap-1">
                    <span>🛡️</span>
                    <span>Emniyet & Manifestolar</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      actions.openPoliceManifest();
                      setIsQuickToolsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-rose-500/10 hover:text-rose-600 transition-colors text-left cursor-pointer"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                    <span>Deniz Polisi Güvenlik Manifestosu</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      actions.openPierManifest();
                      setIsQuickToolsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-sky-500/10 hover:text-sky-600 transition-colors text-left cursor-pointer"
                  >
                    <Ship className="w-3.5 h-3.5 text-sky-600" />
                    <span>İskele & Kaptan Manifestosu</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      actions.openDietaryManifest();
                      setIsQuickToolsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-rose-500/10 hover:text-rose-600 transition-colors text-left cursor-pointer"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                    <span>Diyet & Medikal Emniyet Manifestosu</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      actions.openCaptainDrawer();
                      setIsQuickToolsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-cyan-500/10 hover:text-cyan-600 transition-colors text-left cursor-pointer"
                  >
                    <span className="text-xs">📶</span>
                    <span>Kaptan Kasası (Çevrimdışı PWA)</span>
                  </button>
                </div>

                {/* 5. Teklifler */}
                <div className="p-1 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      actions.openProposals();
                      setIsQuickToolsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-900 dark:text-amber-300 hover:bg-amber-500/25 transition-colors text-left cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-amber-600" />
                    <span>📄 Teklifler (Çok Günlü & Tekli Tur)</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sağ Blok: Arama, Bildirimler, Bulut, Yeni Rezervasyon, Çıkış */}
        <div className="flex items-center gap-1.5">
          {/* Spotlight Arama Butonu (Cmd+K) */}
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800 text-xs font-medium transition-all cursor-pointer"
            title="Klavyeden ⌘K veya Ctrl+K ile hızlı arama"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden xl:inline text-xs">Ara</span>
            <kbd className="hidden sm:inline-flex items-center px-1 py-0.5 rounded text-[10px] font-mono font-bold bg-white dark:bg-surface-2 border border-slate-200 dark:border-slate-700 text-slate-500">
              ⌘K
            </kbd>
          </button>

          {/* PWA Bildirim Merkezi (Şoför & Ekip Push Bildirimleri) */}
          <div className="relative">
            <button
              type="button"
              onClick={handleToggleNotifications}
              className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800 transition-all cursor-pointer"
              title="Şoför & Saha PWA Push Bildirim Merkezi"
            >
              {unreadCount > 0 ? (
                <BellRing className="w-4 h-4 text-amber-500 animate-bounce" />
              ) : (
                <Bell className="w-4 h-4 text-slate-400 hover:text-slate-200" />
              )}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px] font-black min-w-[17px] text-center shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Bildirim Paneli Açılır Menüsü */}
            {isNotificationMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsNotificationMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-surface-1 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Başlık */}
                  <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🔔</span>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                        Saha & Şoför Bildirimleri
                      </h4>
                    </div>
                    {notifications.length > 0 && (
                      <button
                        type="button"
                        onClick={clearNotificationHistory}
                        className="text-[11px] text-slate-400 hover:text-rose-500 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Temizle</span>
                      </button>
                    )}
                  </div>

                  {/* İzin Durumu Banner'ı */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800/80">
                    {permissionStatus === 'granted' ? (
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          Push Bildirimleri Aktif
                        </span>
                        <button
                          type="button"
                          onClick={handleSendTestPush}
                          className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold transition cursor-pointer"
                        >
                          Test Gönder
                        </button>
                      </div>
                    ) : permissionStatus === 'denied' ? (
                      <div className="text-[11px] text-rose-600 dark:text-rose-400">
                        ⚠️ Bildirimler tarayıcıda engellenmiş. Adres çubuğundaki kilit simgesinden izin verebilirsiniz.
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleRequestPermission}
                        className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <BellRing className="w-3.5 h-3.5" />
                        <span>Telefon Bildirimlerini Etkinleştir</span>
                      </button>
                    )}
                  </div>

                  {/* Bildirim Listesi */}
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 space-y-1">
                        <p className="text-xs font-semibold">Henüz bildirim yok</p>
                        <p className="text-[10px] text-slate-500">
                          Transfer saati veya araç atamaları güncellendiğinde şoför ve ekibe burada anlık liste gösterilir.
                        </p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3 text-xs transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                            !notif.read ? 'bg-amber-500/5' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-slate-900 dark:text-white truncate">
                              {notif.title}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono shrink-0">
                              {new Date(notif.timestamp).toLocaleTimeString('tr-TR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed whitespace-pre-line">
                            {notif.body}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Çevrimdışı Durum Göstergesi (Aşama 4) */}
          {!isOnline ? (
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/15 dark:bg-amber-400/15 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 text-[11px] font-bold"
              title="Cihaz çevrimdışı. Yapılan tüm bilet ve operasyon işlemleri güvenle IndexedDB'de saklanır."
            >
              <WifiOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-pulse" />
              <span>Çevrimdışı {pendingSyncCount > 0 ? `(${pendingSyncCount})` : ''}</span>
            </div>
          ) : pendingSyncCount > 0 ? (
            <button
              type="button"
              onClick={onManualSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-500/15 dark:bg-blue-400/15 hover:bg-blue-500/25 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700/60 text-[11px] font-bold cursor-pointer transition-all"
              title="Kuyrukta bekleyen çevrimdışı işlemleri hemen buluta gönder"
            >
              <CloudUpload className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-bounce" />
              <span>{pendingSyncCount} Eşitle</span>
            </button>
          ) : null}

          {/* Canlı Bulut Senkronizasyon Durumu & Manuel Yenileme */}
          <button
            type="button"
            onClick={onManualSync}
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

          {canCreateBookings && (
            <button
              type="button"
              onClick={onNewBooking}
              className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-white text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Yeni Rezervasyon</span>
              <span className="sm:hidden">Yeni</span>
            </button>
          )}

          <button
            type="button"
            onClick={onLogout}
            disabled={isSigningOut}
            className="p-1.5 sm:p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            title="Çıkış Yap"
          >
            <LogOut className={`w-4 h-4 ${isSigningOut ? 'animate-pulse' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
}
