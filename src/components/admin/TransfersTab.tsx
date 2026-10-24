import { useState, useMemo, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { buildDailyPickups, type PickupItem } from '../../lib/adminFilters';
import type { Booking, VehicleItem, DriverItem } from '../../data/adminInitialData';
import BulkDispatchModal from './BulkDispatchModal';
import { getMarineSafetyStatus, type MarineSafetyReport } from '../../lib/marineWeather';
import { playLobbyReadyChime } from '../../lib/pwaNotifications';
import { fmtMoney } from '../../lib/moneyFormat';
import TransferOperationsBar from './transfers/TransferOperationsBar';
import TransferMarineSafetyCard from './transfers/TransferMarineSafetyCard';
import TransferTableView from './transfers/TransferTableView';
import TransferRoutesView from './transfers/TransferRoutesView';
import TransferFilterBar from './transfers/TransferFilterBar';
import { useTransferRoutes } from './transfers/useTransferRoutes';

export interface TransfersTabProps {
  bookings?: Booking[];
  manifestDate?: string;
  setManifestDate: (d: string) => void;
  vehicles?: VehicleItem[];
  drivers?: DriverItem[];
  googleReviewUrl?: string;
  showToast: (msg: string) => void;
  handleAssignVehicleToBooking: (bookingId: string, tourIndex: number, vehicle: string) => void;
  handleAssignDriverToBooking: (bookingId: string, tourIndex: number, driverId: string) => void;
  handleUpdatePickupStatus?: (
    bookingId: string,
    tourIndex: number,
    status: 'pending' | 'picked_up' | 'on_tour' | 'completed' | 'no_show'
  ) => void;
  handleUpdatePickupTime?: (bookingId: string, tourIndex: number, newTime: string) => Promise<void> | void;
  setWhatsAppModalBooking: (b: Booking) => void;
  setVoucherBooking: (b: Booking) => void;
  onOpenPoliceManifest: () => void;
  onOpenQrScanner?: () => void;
  onOpenLostFound?: () => void;
  onOpenDietaryManifest?: () => void;
  onOpenFieldCashier?: () => void;
  onOpenFlightRadar?: () => void;
  onOpenDriverExpense?: () => void;
  onOpenGuideExpense?: () => void;
  onOpenWelcomeBoard?: (b?: Booking) => void;
  onOpenLuggageExpress?: () => void;
  onOpenCaptainVault?: () => void;
  onOpenCuratedProposal?: (b?: Booking) => void;
  onOpenWorkflow?: (b: Booking) => void;
  pendingBookingIds?: Set<string>;
}

export function isPickupLobbyReady(p: PickupItem): boolean {
  if (p.specialNotes && p.specialNotes.includes('LOBİDE')) return true;
  if (typeof window !== 'undefined') {
    return localStorage.getItem(`ptt_lobby_ready_${p.bookingId}`) === 'true';
  }
  return false;
}

export default function TransfersTab({
  bookings = [],
  manifestDate = new Date().toISOString().split('T')[0],
  setManifestDate,
  vehicles = [],
  drivers = [],
  googleReviewUrl,
  showToast,
  handleAssignVehicleToBooking,
  handleAssignDriverToBooking,
  handleUpdatePickupStatus,
  handleUpdatePickupTime,
  setWhatsAppModalBooking,
  setVoucherBooking,
  onOpenPoliceManifest,
  onOpenQrScanner,
  onOpenLostFound,
  onOpenDietaryManifest,
  onOpenFieldCashier,
  onOpenFlightRadar,
  onOpenDriverExpense,
  onOpenGuideExpense,
  onOpenWelcomeBoard,
  onOpenLuggageExpress,
  onOpenCaptainVault,
  onOpenCuratedProposal,
  onOpenWorkflow,
  pendingBookingIds,
}: TransfersTabProps) {
  const safeVehicles = Array.isArray(vehicles) ? vehicles : [];
  const safeDrivers = Array.isArray(drivers) ? drivers : [];
  const safeDate = manifestDate || new Date().toISOString().split('T')[0];

  const dailyPickups: PickupItem[] = buildDailyPickups(bookings, safeDate);

  const totalDailyPassengers = dailyPickups.reduce(
    (acc, p) => acc + (p.adultCount || 0) + (p.childCount || 0),
    0
  );

  const [vehicleFilter, setVehicleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [lobbyOnlyFilter, setLobbyOnlyFilter] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('ptt_lobby_sound_enabled') !== 'false';
  });
  const [lastKnownLobbyReadyIds, setLastKnownLobbyReadyIds] = useState<string[]>([]);
  const [storageTick, setStorageTick] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'table' | 'routes'>('table');
  const [isBulkDispatchOpen, setIsBulkDispatchOpen] = useState(false);

  // Hook: Şoför ve araç hat rotaları yönetimi
  const {
    routeVehicles,
    vehicleRoutes,
    setRouteSortModes,
    setCustomStopOrder,
    handleMoveStop,
    handleSendWhatsAppRouteToDriver,
    handleCopyRouteForDriver,
  } = useTransferRoutes({
    dailyPickups,
    safeDrivers,
    safeDate,
    showToast,
  });

  // Depolama senkronizasyonu
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleStorage = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('ptt_lobby_ready_')) {
        setStorageTick((t) => t + 1);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const lobbyReadyCount = useMemo(() => {
    return dailyPickups.filter(isPickupLobbyReady).length;
  }, [dailyPickups, storageTick]);

  const filteredPickups = useMemo(() => {
    return dailyPickups.filter((p) => {
      const matchVehicle = vehicleFilter === 'all' || p.assignedVehicle === vehicleFilter;
      const matchStatus = statusFilter === 'all' || (p.pickupStatus || 'pending') === statusFilter;
      const matchLobby = !lobbyOnlyFilter || isPickupLobbyReady(p);
      return matchVehicle && matchStatus && matchLobby;
    });
  }, [dailyPickups, vehicleFilter, statusFilter, lobbyOnlyFilter, storageTick]);

  useEffect(() => {
    const currentReadyPickups = dailyPickups.filter(isPickupLobbyReady);
    const currentReadyIds = currentReadyPickups.map((p) => p.bookingId);

    if (lastKnownLobbyReadyIds.length > 0) {
      const newlyReady = currentReadyPickups.find(
        (p) => !lastKnownLobbyReadyIds.includes(p.bookingId)
      );
      if (newlyReady) {
        if (soundEnabled) {
          playLobbyReadyChime();
        }
        showToast(`🙋‍♂️ Misafir Lobide Hazır: ${newlyReady.customerName} (${newlyReady.hotel})`);
        if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
          try {
            navigator.vibrate([150, 80, 150]);
          } catch {}
        }
      }
    }

    setLastKnownLobbyReadyIds(currentReadyIds);
  }, [dailyPickups, soundEnabled, storageTick]);

  const pickedUpCount = dailyPickups.filter((p) => p.pickupStatus === 'picked_up').length;
  const pendingCount = dailyPickups.filter((p) => !p.pickupStatus || p.pickupStatus === 'pending').length;

  // Andaman Denizi Canlı Dalga & Güvenlik Radarı
  const [marineReport, setMarineReport] = useState<MarineSafetyReport | null>(null);
  const [isRefreshingMarine, setIsRefreshingMarine] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getMarineSafetyStatus().then((rep) => {
      if (isMounted) setMarineReport(rep);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleRefreshMarine = async () => {
    setIsRefreshingMarine(true);
    try {
      const res = await fetch('/api/marine-safety?refresh=true');
      if (res.ok) {
        const data = await res.json();
        if (data.ok) {
          setMarineReport(data);
          showToast('🌊 Andaman Denizi dalga ve rüzgar verileri güncellendi!');
        }
      }
    } catch {
      showToast('Hava durumu servisine ulaşılamadı.');
    } finally {
      setIsRefreshingMarine(false);
    }
  };

  const generateManifestText = () => {
    if (dailyPickups.length === 0) return '';
    const dateStr = (() => {
      try {
        const d = new Date(safeDate);
        return isNaN(d.getTime())
          ? safeDate
          : d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
      } catch {
        return safeDate;
      }
    })();
    const textLines = [
      `🚐 *PHUKET TATİLİ - GÜNLÜK TRANSFER & OPERASYON LİSTESİ*`,
      `📅 *Tarih:* ${dateStr}`,
      `👥 *Toplam Yolcu:* ${totalDailyPassengers} Kişi (${dailyPickups.length} Transfer)`,
      `───────────────────────────────`,
      ...dailyPickups.map((p, idx) => {
        const guests = `${p.adultCount || 1} Yetişkin${(p.childCount || 0) > 0 ? ` + ${p.childCount} Çocuk` : ''}`;
        const remaining = Number(p.remainingAmountThb) || 0;
        const remainingText =
          remaining > 0
            ? ` ⚠️ Tahsil Edilecek: *${fmtMoney(remaining)} THB*`
            : ` ✅ Ödendi`;
        const pickupStateText =
          p.pickupStatus === 'picked_up'
            ? ` [🚐 BİNDİ: ${p.pickedUpAt || 'OK'}]`
            : p.pickupStatus === 'no_show'
            ? ` [❌ NO-SHOW]`
            : '';
        return (
          `${idx + 1}️⃣ ⏰ *${p.pickupTime}* — *${p.hotel}* ${p.roomNumber ? `(Oda: ${p.roomNumber})` : ''}\n` +
          `   👤 Misafir: *${p.customerName}* (${guests})\n` +
          `   📞 Tel: ${p.phone}\n` +
          `   🏝️ Tur: *${p.tourTitle}*` +
          (p.supplier ? ` [${p.supplier}]` : '') +
          `\n   💰 Durum:${remainingText}${pickupStateText}` +
          (p.specialNotes ? `\n   📝 Not: ${p.specialNotes}` : '') +
          `\n`
        );
      }),
      `───────────────────────────────`,
      `🇹🇭 Phuket Tatili Operasyon Merkezi`,
    ];
    return textLines.join('\n');
  };

  const handleCopyManifest = () => {
    const text = generateManifestText();
    if (!text) {
      showToast('Seçilen tarihte transfer kaydı bulunmuyor.');
      return;
    }
    navigator.clipboard.writeText(text);
    showToast('Transfer listesi WhatsApp için panoya kopyalandı! 📋');
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white dark:bg-surface-2 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 dark:text-white">
              Günlük Transfer & Alınış Takibi
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-primary/10 text-brand-primary dark:bg-brand-accent/20 dark:text-brand-accent">
              Canlı
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Günün tüm otel transferleri, şoför/minibüs hatları ve liman buluşmaları.
          </p>
        </div>

        {/* Header Sağ: Tarih & Rota Hızlı Araçları */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Date Shortcuts */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => {
                const today = new Date().toISOString().split('T')[0];
                setManifestDate(today);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                manifestDate === new Date().toISOString().split('T')[0]
                  ? 'bg-white dark:bg-slate-700 text-brand-primary dark:text-brand-accent shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Bugün
            </button>
            <button
              type="button"
              onClick={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                setManifestDate(tomorrow.toISOString().split('T')[0]);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                (() => {
                  const tm = new Date();
                  tm.setDate(tm.getDate() + 1);
                  return manifestDate === tm.toISOString().split('T')[0];
                })()
                  ? 'bg-white dark:bg-slate-700 text-brand-primary dark:text-brand-accent shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Yarın
            </button>
          </div>

          {/* Date Input */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/60 px-3.5 py-2 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <Clock className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={manifestDate}
              onChange={(e) => setManifestDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            />
          </div>

          <button
            type="button"
            onClick={handleCopyManifest}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            title="Seçili tarihteki tüm transferleri WhatsApp için panoya kopyala"
          >
            <span>📋</span>
            <span>WhatsApp Listesi Kopyala</span>
          </button>
        </div>
      </div>

      {/* 🧭 OPERASYON, SAHA MASRAFLARI & EMNİYET MASASI */}
      <TransferOperationsBar
        onOpenPoliceManifest={onOpenPoliceManifest}
        onOpenQrScanner={onOpenQrScanner}
        onOpenLostFound={onOpenLostFound}
        onOpenDietaryManifest={onOpenDietaryManifest}
        onOpenFieldCashier={onOpenFieldCashier}
        onOpenFlightRadar={onOpenFlightRadar}
        onOpenDriverExpense={onOpenDriverExpense}
        onOpenGuideExpense={onOpenGuideExpense}
        onOpenWelcomeBoard={onOpenWelcomeBoard}
        onOpenLuggageExpress={onOpenLuggageExpress}
        onOpenCaptainVault={onOpenCaptainVault}
        onOpenCuratedProposal={onOpenCuratedProposal}
        setIsBulkDispatchOpen={setIsBulkDispatchOpen}
      />

      {/* 🌊 ANDAMAN DENİZİ CANLI GÜVENLİK & DALGA RADARI */}
      <TransferMarineSafetyCard
        marineReport={marineReport}
        manifestDate={manifestDate}
        dailyPickups={dailyPickups}
        safeDate={safeDate}
        onRefreshMarine={handleRefreshMarine}
        isRefreshingMarine={isRefreshingMarine}
      />

      {/* Summary Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-surface-2 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <p className="text-xs text-slate-500 font-medium">Toplam Yolcu</p>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            {totalDailyPassengers} <span className="text-xs font-normal text-slate-400">kişi</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {dailyPickups.length} rezervasyon
          </p>
        </div>
        <div className="bg-white dark:bg-surface-2 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <p className="text-xs text-slate-500 font-medium">Binen Yolcu</p>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">
            {pickedUpCount} <span className="text-xs font-normal text-slate-400">kişi</span>
          </p>
          <p className="text-[11px] text-emerald-600/70 mt-0.5">Araçta seyir halinde</p>
        </div>
        <div className="bg-white dark:bg-surface-2 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <p className="text-xs text-slate-500 font-medium">Bekleyen Alınış</p>
          <p className="text-xl sm:text-2xl font-black text-amber-600 mt-1">
            {pendingCount} <span className="text-xs font-normal text-slate-400">nokta</span>
          </p>
          <p className="text-[11px] text-amber-600/70 mt-0.5">Henüz alınmadı</p>
        </div>
        <div className="bg-white dark:bg-surface-2 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <p className="text-xs text-slate-500 font-medium">Lobide Bekleyen</p>
          <p className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
            <span>{lobbyReadyCount}</span>
            {lobbyReadyCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
            )}
          </p>
          <p className="text-[11px] text-emerald-600/70 mt-0.5">Lobiye indiğini bildirdi</p>
        </div>
      </div>

      {/* Filters & Live Status Bar */}
      <TransferFilterBar
        vehicleFilter={vehicleFilter}
        setVehicleFilter={setVehicleFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        lobbyOnlyFilter={lobbyOnlyFilter}
        setLobbyOnlyFilter={setLobbyOnlyFilter}
        soundEnabled={soundEnabled}
        onToggleSound={() => {
          const next = !soundEnabled;
          setSoundEnabled(next);
          if (typeof window !== 'undefined') {
            localStorage.setItem('ptt_lobby_sound_enabled', String(next));
          }
          showToast(next ? '🔔 Lobi sesli uyarısı açıldı.' : '🔕 Lobi sesli uyarısı sessize alındı.');
          if (next) playLobbyReadyChime();
        }}
        routeVehicles={routeVehicles}
        pendingCount={pendingCount}
        pickedUpCount={pickedUpCount}
        lobbyReadyCount={lobbyReadyCount}
        filteredPickupsCount={filteredPickups.length}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* Manifest Table or Routes View */}
      {viewMode === 'table' ? (
        <TransferTableView
          filteredPickups={filteredPickups}
          bookings={bookings}
          safeVehicles={safeVehicles}
          safeDrivers={safeDrivers}
          pendingBookingIds={pendingBookingIds}
          googleReviewUrl={googleReviewUrl}
          showToast={showToast}
          isPickupLobbyReady={isPickupLobbyReady}
          handleAssignVehicleToBooking={handleAssignVehicleToBooking}
          handleAssignDriverToBooking={handleAssignDriverToBooking}
          handleUpdatePickupStatus={handleUpdatePickupStatus}
          handleUpdatePickupTime={handleUpdatePickupTime}
          setWhatsAppModalBooking={setWhatsAppModalBooking}
          setVoucherBooking={setVoucherBooking}
          onOpenWorkflow={onOpenWorkflow}
        />
      ) : (
        <TransferRoutesView
          vehicleRoutes={vehicleRoutes}
          bookings={bookings}
          pendingBookingIds={pendingBookingIds}
          googleReviewUrl={googleReviewUrl}
          showToast={showToast}
          setRouteSortModes={setRouteSortModes}
          setCustomStopOrder={setCustomStopOrder}
          handleMoveStop={handleMoveStop}
          handleSendWhatsAppRouteToDriver={handleSendWhatsAppRouteToDriver}
          handleCopyRouteForDriver={handleCopyRouteForDriver}
          handleUpdatePickupStatus={handleUpdatePickupStatus}
          handleUpdatePickupTime={handleUpdatePickupTime}
          onOpenWorkflow={onOpenWorkflow}
        />
      )}

      {isBulkDispatchOpen && (
        <BulkDispatchModal
          pickups={dailyPickups}
          manifestDate={manifestDate}
          onClose={() => setIsBulkDispatchOpen(false)}
          showToast={showToast}
        />
      )}
    </div>
  );
}
