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
  CloudUpload,
  Fuel,
  LogOut,
  Menu,
  Plus,
  RefreshCw,
  Search,
  UserCheck,
  WifiOff,
} from 'lucide-react';
import type { NavItem } from './adminNav';
import type { FailedMutation } from '../../lib/offlineQueue';
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
import { QuickToolsDropdown } from './header/QuickToolsDropdown';
import { NotificationCenterMenu } from './header/NotificationCenterMenu';

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
  failedSyncItems: FailedMutation[];
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
  const { isOnline, isCloudConnected, isSyncing, pendingSyncCount, failedSyncItems, lastSyncedAt } = sync;

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

        {/* ⚡ Hızlı Operasyon Araçları Açılır Menüsü */}
        <QuickToolsDropdown
          isOpen={isQuickToolsDropdownOpen}
          setIsOpen={setIsQuickToolsDropdownOpen}
          actions={actions}
        />

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
          <NotificationCenterMenu
            isOpen={isNotificationMenuOpen}
            setIsOpen={setIsNotificationMenuOpen}
            unreadCount={unreadCount}
            notifications={notifications}
            permissionStatus={permissionStatus}
            onClearHistory={clearNotificationHistory}
            onRequestPermission={handleRequestPermission}
            onSendTestPush={handleSendTestPush}
            onToggle={handleToggleNotifications}
          />

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

          {failedSyncItems.length > 0 && (
            <div
              role="status"
              aria-live="polite"
              className="max-w-56 rounded-lg border border-rose-300 bg-rose-50 px-2 py-1 text-[10px] text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200"
              title={failedSyncItems.map((item) => `${item.description}: ${item.error}`).join('\n')}
            >
              {failedSyncItems.filter((item) => item.status === 'needs_attention').length > 0
                ? `${failedSyncItems.filter((item) => item.status === 'needs_attention').length} işlem müdahale bekliyor`
                : `${failedSyncItems.length} işlem tekrar denenecek`}
              <span className="sr-only">{failedSyncItems.map((item) => `${item.description}: ${item.error}`).join('; ')}</span>
            </div>
          )}

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
