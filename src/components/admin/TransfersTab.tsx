import { useState, useMemo, useEffect } from 'react';
import {
  Car,
  Copy,
  Navigation,
  ShieldCheck,
  MapPin,
  Phone,
  MessageCircle,
  ExternalLink,
  Ticket,
  Camera,
  CheckCircle2,
  Clock,
  Filter,
  List,
  Send,
  Waves,
  Wind,
  AlertTriangle,
  RefreshCw,
  Package,
  ShieldAlert,
  Coins,
  Plane,
  Fuel,
  Luggage,
  Compass,
  Wifi,
  Star,
  Moon,
  FileText,
  UserCheck,
  BellRing,
} from 'lucide-react';
import { generateMultiStopMapUrl, getSingleHotelMapUrl, detectDeparturePier, getZoneOrder } from '../../lib/maps';
import { buildDailyPickups, type PickupItem } from '../../lib/adminFilters';
import type { Booking, VehicleItem, DriverItem } from '../../data/adminInitialData';
import BulkDispatchModal from './BulkDispatchModal';
import {
  getMarineSafetyStatus,
  type MarineSafetyReport,
  getWeatherPostponeWhatsAppUrl,
} from '../../lib/marineWeather';
import { type RouteSortMode } from '../../lib/routeSequencer';
import { getConciergeWhatsAppUrl } from '../../lib/guestConcierge';
import { getGoogleReviewWhatsAppUrl } from '../../lib/reviewBooster';
import { sendTransferPushNotification } from '../../lib/pwaNotifications';

interface TransfersTabProps {
  bookings?: Booking[];
  manifestDate?: string;
  setManifestDate: (d: string) => void;
  vehicles?: VehicleItem[];
  drivers?: DriverItem[];
  googleReviewUrl?: string;
  /** Toast gösterici — AdminDashboard ile aynı davranış. */
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
}: TransfersTabProps) {
  const safeVehicles = Array.isArray(vehicles) ? vehicles : [];
  const safeDrivers = Array.isArray(drivers) ? drivers : [];
  const safeDate = manifestDate || new Date().toISOString().split('T')[0];

  // Günlük alınışlar — mantık src/lib/adminFilters.ts'te (testli tek kaynak).
  const dailyPickups: PickupItem[] = buildDailyPickups(bookings, safeDate);

  const totalDailyPassengers = dailyPickups.reduce(
    (acc, p) => acc + (p.adultCount || 0) + (p.childCount || 0),
    0
  );

  const [vehicleFilter, setVehicleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const routeVehicles = useMemo(() => {
    return Array.from(new Set(dailyPickups.map((p) => p.assignedVehicle).filter(Boolean)));
  }, [dailyPickups]);

  const filteredPickups = useMemo(() => {
    return dailyPickups.filter((p) => {
      const matchVehicle = vehicleFilter === 'all' || p.assignedVehicle === vehicleFilter;
      const matchStatus = statusFilter === 'all' || (p.pickupStatus || 'pending') === statusFilter;
      return matchVehicle && matchStatus;
    });
  }, [dailyPickups, vehicleFilter, statusFilter]);

  const pickedUpCount = dailyPickups.filter((p) => p.pickupStatus === 'picked_up').length;
  const pendingCount = dailyPickups.filter((p) => !p.pickupStatus || p.pickupStatus === 'pending').length;

  const [viewMode, setViewMode] = useState<'table' | 'routes'>('table');
  const [isBulkDispatchOpen, setIsBulkDispatchOpen] = useState(false);

  // Andaman Denizi Canlı Dalga & Güvenlik Radarı
  const [marineReport, setMarineReport] = useState<MarineSafetyReport | null>(null);
  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);
  const [isRefreshingMarine, setIsRefreshingMarine] = useState(false);

  // Akıllı Rota Sıralayıcısı Durumları
  const [routeSortModes, setRouteSortModes] = useState<Record<string, RouteSortMode>>({});
  const [customStopOrder, setCustomStopOrder] = useState<Record<string, string[]>>({});

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

  // Hat bazlı rota sıralaması: her araç için oteller seçilen moda veya manuel sıraya göre dizilir
  const vehicleRoutes = useMemo(() => {
    const groups: Record<string, PickupItem[]> = {};
    dailyPickups.forEach((p) => {
      const v = p.assignedVehicle || 'Atanmadı';
      if (!groups[v]) groups[v] = [];
      groups[v].push(p);
    });

    return Object.entries(groups).map(([vehicle, items]) => {
      const currentMode: RouteSortMode = routeSortModes[vehicle] || 'pier_bound';

      let sortedStops = [...items].sort((a, b) => {
        if (currentMode === 'time') {
          const timeCompare = (a.pickupTime || '07:30').localeCompare(b.pickupTime || '07:30');
          if (timeCompare !== 0) return timeCompare;
          return getZoneOrder(a.hotelZone) - getZoneOrder(b.hotelZone);
        } else if (currentMode === 'reverse') {
          const zoneCompare = getZoneOrder(b.hotelZone) - getZoneOrder(a.hotelZone);
          if (zoneCompare !== 0) return zoneCompare;
          return (a.pickupTime || '07:30').localeCompare(b.pickupTime || '07:30');
        } else {
          // pier_bound: İskele yönü (Kuzeyden Güneye doğal coğrafi akış)
          const zoneCompare = getZoneOrder(a.hotelZone) - getZoneOrder(b.hotelZone);
          if (zoneCompare !== 0) return zoneCompare;
          return (a.pickupTime || '07:30').localeCompare(b.pickupTime || '07:30');
        }
      });

      // Manuel sıra özelleştirmesi varsa uygula
      const manualOrder = customStopOrder[vehicle];
      if (manualOrder && manualOrder.length > 0) {
        sortedStops = [...sortedStops].sort((a, b) => {
          const keyA = `${a.bookingId}-${a.tourIndex}`;
          const keyB = `${b.bookingId}-${b.tourIndex}`;
          const idxA = manualOrder.indexOf(keyA);
          const idxB = manualOrder.indexOf(keyB);
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          return 0;
        });
      }

      const uniqueHotels = Array.from(new Set(sortedStops.map((s) => s.hotel)));
      const pier = detectDeparturePier(sortedStops[0]?.tourTitle || '');
      const mapsUrl = generateMultiStopMapUrl(uniqueHotels, pier);
      const totalGuests = sortedStops.reduce((sum, s) => sum + (s.adultCount || 0) + (s.childCount || 0), 0);
      const driverId = sortedStops.find((s) => s.assignedDriver)?.assignedDriver;
      const driver = safeDrivers.find((d) => d && d.id === driverId);

      const firstHotelLocation = uniqueHotels[0] ? uniqueHotels[0] : pier;
      const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(firstHotelLocation + ', Phuket, Thailand')}&navigate=yes`;

      return {
        vehicle,
        driver,
        stops: sortedStops,
        uniqueHotels,
        pier,
        mapsUrl,
        wazeUrl,
        totalGuests,
        sortMode: currentMode,
      };
    });
  }, [dailyPickups, safeDrivers, routeSortModes, customStopOrder]);

  const handleMoveStop = (vehicle: string, index: number, direction: 'up' | 'down') => {
    const route = vehicleRoutes.find((r) => r.vehicle === vehicle);
    if (!route) return;
    const currentKeys = route.stops.map((s) => `${s.bookingId}-${s.tourIndex}`);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentKeys.length) return;

    const newKeys = [...currentKeys];
    const [moved] = newKeys.splice(index, 1);
    newKeys.splice(targetIndex, 0, moved);

    setCustomStopOrder((prev) => ({
      ...prev,
      [vehicle]: newKeys,
    }));
    showToast('Durak sırası güncellendi 📍');
  };

  const handleSendWhatsAppRouteToDriver = (route: (typeof vehicleRoutes)[0]) => {
    const dateStr = (() => {
      try {
        const d = new Date(safeDate);
        return isNaN(d.getTime()) ? safeDate : d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
      } catch {
        return safeDate;
      }
    })();

    const cleanPhone = (route.driver?.phone || '66828950665').replace(/[^0-9]/g, '');
    const lines = [
      `🚐 *PHUKET TATİLİ — TRANSFER GÖREV EMRİ & ROTA PLANI*`,
      `📅 *Tarih:* ${dateStr}`,
      `🚐 *Hat:* ${route.vehicle}`,
      `🧑‍✈️ *Şoför:* ${route.driver ? `${route.driver.fullName} (${route.driver.phone || 'Tel Yok'})` : 'Atanmadı'}`,
      `👥 *Toplam Yolcu:* ${route.totalGuests} Kişi (${route.stops.length} Alınış)`,
      `🏁 *Varış İskelesi:* ${route.pier}`,
      `🧭 *Sıralama Modu:* ${
        route.sortMode === 'pier_bound'
          ? '🗺️ İskele İstikameti (Kuzey➔Güney)'
          : route.sortMode === 'time'
          ? '🕒 Alınış Saatine Göre'
          : '🔄 Güney➔Kuzey'
      }`,
      `───────────────────────────────`,
      `🗺️ *Canlı Google Haritalar Rotası:*`,
      `${route.mapsUrl}`,
      ``,
      `🚙 *Waze Navigasyon (1. Durak):*`,
      `${route.wazeUrl}`,
      `───────────────────────────────`,
      `📍 *DURAK VE YOLCU SIRALAMASI:*`,
      ...route.stops.map((s, idx) => {
        const pax = `${s.adultCount || 1} Yetişkin${(s.childCount || 0) > 0 ? ` + ${s.childCount} Çocuk` : ''}`;
        const remaining = Number(s.remainingAmountThb) || 0;
        const cash = remaining > 0 ? `\n   💵 *ALINACAK NAKİT:* ${remaining.toLocaleString()} THB` : ' \n   ✅ *Ödeme Alındı*';
        const room = s.roomNumber ? ` (Oda: ${s.roomNumber})` : '';
        const singleMap = getSingleHotelMapUrl(s.hotel);
        return `${idx + 1}️⃣ [⏰ *${s.pickupTime || '07:30'}*] *${s.hotel}*${room}\n   👤 ${s.customerName} (${pax}) · 📞 ${s.phone}${cash}\n   📍 Harita: ${singleMap}`;
      }),
      `───────────────────────────────`,
      `İyi ve güvenli sürüşler dileriz! 🌴🇹🇭`,
    ];

    const message = lines.join('\n');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleCopyRouteForDriver = (route: (typeof vehicleRoutes)[0]) => {
    const dateStr = (() => {
      try {
        const d = new Date(safeDate);
        return isNaN(d.getTime()) ? safeDate : d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
      } catch {
        return safeDate;
      }
    })();

    const lines = [
      `🚐 *TRANSFER GÖREV EMRİ & ROTA PLANI*`,
      `📅 *Tarih:* ${dateStr}`,
      `🚐 *Hat:* ${route.vehicle}`,
      `🧑‍✈️ *Şoför:* ${route.driver ? `${route.driver.fullName} (${route.driver.phone || 'Tel Yok'})` : 'Atanmadı'}`,
      `👥 *Toplam Yolcu:* ${route.totalGuests} Kişi (${route.stops.length} Alınış)`,
      `🏁 *Varış İskelesi:* ${route.pier}`,
      `───────────────────────────────`,
      `🗺️ *Canlı Google Haritalar Rotası:*`,
      `${route.mapsUrl}`,
      `───────────────────────────────`,
      `📍 *DURAK SIRALAMASI:*`,
      ...route.stops.map((s, idx) => {
        const pax = `${s.adultCount || 1} Yetişkin${(s.childCount || 0) > 0 ? ` + ${s.childCount} Çocuk` : ''}`;
        const remaining = Number(s.remainingAmountThb) || 0;
        const cash = remaining > 0 ? ` ⚠️ ALINACAK NAKİT: *${remaining.toLocaleString()} THB*` : ' ✓ Ödendi';
        const room = s.roomNumber ? ` (Oda: ${s.roomNumber})` : '';
        return `${idx + 1}. [${s.pickupTime || '07:30'}] ${s.hotel}${room}\n   👤 ${s.customerName} (${pax}) · 📞 ${s.phone}\n  ${cash}`;
      }),
      `───────────────────────────────`,
      `İyi ve güvenli sürüşler dileriz! 🌴🇹🇭`,
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    showToast(`"${route.vehicle}" şoför görev metni panoya kopyalandı! 📋`);
  };

  // Generate clipboard text for drivers / suppliers
  const generateManifestText = () => {
    if (dailyPickups.length === 0) return '';
    const dateStr = (() => {
      try {
        const d = new Date(safeDate);
        return isNaN(d.getTime()) ? safeDate : d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
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
            ? ` ⚠️ Tahsil Edilecek: *${remaining.toLocaleString()} THB*`
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
            <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
              <Car className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
              Günlük Transfer & Şoför Dağıtım Listesi
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Şoförlere ve yerel transfer firmalarına iletilecek saat sıralı alınış listesi.
          </p>
        </div>

        {/* Header Sağ: Tarih & Rota Hızlı Araçları */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Date Shortcuts */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setManifestDate(new Date().toISOString().split('T')[0])}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                manifestDate === new Date().toISOString().split('T')[0]
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Bugün
            </button>
            <button
              type="button"
              onClick={() => {
                const d = new Date();
                d.setDate(d.getDate() + 1);
                setManifestDate(d.toISOString().split('T')[0]);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900"
            >
              Yarın
            </button>
          </div>

          {/* Date Input */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={manifestDate}
              onChange={(e) => setManifestDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleCopyManifest}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            title="Şoför ve acenta için saat sıralı WhatsApp manifestosunu kopyala"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Şoför İçin Kopyala</span>
          </button>

          {dailyPickups.length > 0 && (
            <a
              href={`https://wa.me/?text=${encodeURIComponent(generateManifestText())}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
              title="Şoför WhatsApp'ına doğrudan manifestoyu gönder"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp ile Gönder</span>
            </a>
          )}

          {dailyPickups.length > 0 && (
            <a
              href={generateMultiStopMapUrl(
                dailyPickups.map((p) => p.hotel),
                detectDeparturePier(dailyPickups[0]?.tourTitle)
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs shadow-sky-600/20 flex items-center gap-1.5 transition-all"
              title="Günün tüm otellerini ardışık Google Maps rotası olarak aç"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>🗺️ Rota (Maps)</span>
            </a>
          )}
        </div>
      </div>

      {/* 🧭 OPERASYON, SAHA MASRAFLARI & EMNİYET MASASI (Kategorize Edilmiş Temiz Menü) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5">
        
        {/* GRUP 1: 🚀 SAHA SEVK & CHECK-IN */}
        <div className="bg-white dark:bg-surface-2 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-500 uppercase tracking-wider px-1">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <Send className="w-3.5 h-3.5" />
              <span>Sevk & Check-in</span>
            </span>
            <span className="text-[10px] text-slate-400">Yolcu</span>
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            <button
              type="button"
              onClick={() => setIsBulkDispatchOpen(true)}
              className="w-full px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs flex items-center justify-between transition-all cursor-pointer"
              title="Gündeki tüm misafirlere WhatsApp lobi ve biniş hatırlatmalarını sırayla gönder"
            >
              <span className="flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5" />
                <span>Toplu WhatsApp Gönderici</span>
              </span>
              <span className="text-[10px] bg-emerald-700/60 px-1.5 py-0.2 rounded-full">Oto-Lobi</span>
            </button>

            {onOpenQrScanner && (
              <button
                type="button"
                onClick={onOpenQrScanner}
                className="w-full px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs flex items-center justify-between transition-all cursor-pointer"
                title="Misafir Kuponu / Bilet QR Kodu Oku & Doğrula"
              >
                <span className="flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" />
                  <span>Bilet QR Oku / Check-in</span>
                </span>
                <span className="text-[10px] bg-purple-700/60 px-1.5 py-0.2 rounded-full">Kamera</span>
              </button>
            )}

            {onOpenWelcomeBoard && (
              <button
                type="button"
                onClick={() => onOpenWelcomeBoard()}
                className="w-full px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Havalimanı VIP Karşılama İsimliği & Tablet Tabelası"
              >
                <span className="text-xs leading-none">🪧</span>
                <span>VIP Karşılama İsimliği</span>
              </button>
            )}
          </div>
        </div>

        {/* GRUP 2: 💵 SAHA KASA & MASRAF MASASI */}
        <div className="bg-white dark:bg-surface-2 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-500 uppercase tracking-wider px-1">
            <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <Coins className="w-3.5 h-3.5" />
              <span>Kasa & Masraflar</span>
            </span>
            <span className="text-[10px] text-slate-400">Saha Nakit</span>
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            {onOpenDriverExpense && (
              <button
                type="button"
                onClick={onOpenDriverExpense}
                className="w-full px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 dark:text-amber-200 border border-amber-500/30 text-xs font-bold flex items-center justify-between transition-all cursor-pointer"
                title="Şoför Yakıt, Otopark & Harç Masraf Masası"
              >
                <span className="flex items-center gap-1.5">
                  <Fuel className="w-3.5 h-3.5 text-amber-600" />
                  <span>Şoför Yakıt & Harç</span>
                </span>
                <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.2 rounded-full font-mono">Dizel/Park</span>
              </button>
            )}

            {onOpenGuideExpense && (
              <button
                type="button"
                onClick={onOpenGuideExpense}
                className="w-full px-3 py-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-900 dark:text-teal-200 border border-teal-500/30 text-xs font-bold flex items-center justify-between transition-all cursor-pointer"
                title="Rehber Taksi/Grab, Yemek, Karşılama & Saha Masraf Masası"
              >
                <span className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>Rehber Masrafı</span>
                </span>
                <span className="text-[10px] bg-teal-500/20 px-1.5 py-0.2 rounded-full font-mono">Grab/Yemek</span>
              </button>
            )}

            {onOpenFieldCashier && (
              <button
                type="button"
                onClick={onOpenFieldCashier}
                className="w-full px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Saha Çoklu Döviz & Para Üstü Kasa Hesaplayıcı"
              >
                <Coins className="w-3.5 h-3.5 text-emerald-600" />
                <span>Saha Çoklu Döviz Kasa</span>
              </button>
            )}
          </div>
        </div>

        {/* GRUP 3: 🛡️ EMNİYET & RESMÎ MANİFESTOLAR */}
        <div className="bg-white dark:bg-surface-2 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-500 uppercase tracking-wider px-1">
            <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Emniyet & Manifestolar</span>
            </span>
            <span className="text-[10px] text-slate-400">Resmî / TAT</span>
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            <button
              type="button"
              onClick={onOpenPoliceManifest}
              className="w-full px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center justify-between transition-all cursor-pointer"
              title="Tayland Deniz Polisi & Millî Park Yolcu Manifestosu"
            >
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Deniz Polisi Manifestosu</span>
              </span>
              <span className="text-[10px] bg-indigo-700/60 px-1.5 py-0.2 rounded-full">PDF/Baskı</span>
            </button>

            {onOpenDietaryManifest && (
              <button
                type="button"
                onClick={onOpenDietaryManifest}
                className="w-full px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Misafir Diyet, Alerji ve Tekne Güvenlik Manifestosu"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                <span>Diyet & Medikal Emniyet</span>
              </button>
            )}

            {onOpenCaptainVault && (
              <button
                type="button"
                onClick={onOpenCaptainVault}
                className="w-full px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Andaman Denizi Çevrimdışı Kaptan Kasası & Acil Durum Rehberi (PWA)"
              >
                <Wifi className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>📶 Kaptan Kasası (PWA)</span>
              </button>
            )}
          </div>
        </div>

        {/* GRUP 4: ✈️ LOJİSTİK & TEKLİF BROŞÜRÜ */}
        <div className="bg-white dark:bg-surface-2 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-500 uppercase tracking-wider px-1">
            <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
              <Plane className="w-3.5 h-3.5" />
              <span>Lojistik & Teklif</span>
            </span>
            <span className="text-[10px] text-slate-400">Havalimanı</span>
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            <div className="grid grid-cols-2 gap-1.5">
              {onOpenFlightRadar && (
                <button
                  type="button"
                  onClick={onOpenFlightRadar}
                  className="px-2.5 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-800 dark:text-sky-300 border border-sky-500/30 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                  title="Phuket Havalimanı Canlı Uçuş Radarı & Rötar Kalkanı"
                >
                  <Plane className="w-3.5 h-3.5 text-sky-600" />
                  <span className="truncate">Uçuş Radarı</span>
                </button>
              )}

              {onOpenLuggageExpress && (
                <button
                  type="button"
                  onClick={onOpenLuggageExpress}
                  className="px-2.5 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border border-indigo-500/30 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                  title="Oteller Arası Bagaj Transfer & Emanet Takip Masası"
                >
                  <Luggage className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="truncate">Bagaj Masası</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {onOpenLostFound && (
                <button
                  type="button"
                  onClick={onOpenLostFound}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                  title="Araçta ve teknede unutulan kayıp eşya takibi"
                >
                  <Package className="w-3.5 h-3.5 text-amber-600" />
                  <span className="truncate">Kayıp Eşya</span>
                </button>
              )}

              {onOpenCuratedProposal && (
                <button
                  type="button"
                  onClick={() => onOpenCuratedProposal()}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                  title="Kişiye Özel Logolu A4 PDF Tur Teklifi & Tatil Broşürü"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-600" />
                  <span className="truncate">PDF Teklif</span>
                </button>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* 🌊 ANDAMAN DENİZİ CANLI GÜVENLİK & DALGA RADARI */}
      {marineReport && (
        <div
          className={`p-4 sm:p-5 rounded-3xl border shadow-xs transition-all ${
            marineReport.level === 'severe'
              ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800/60'
              : marineReport.level === 'moderate'
              ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800/60'
              : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/60'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border shadow-xs ${
                  marineReport.level === 'severe'
                    ? 'bg-rose-100 dark:bg-rose-500/20 border-rose-300 dark:border-rose-500/40 text-rose-700 dark:text-rose-400'
                    : marineReport.level === 'moderate'
                    ? 'bg-amber-100 dark:bg-amber-500/20 border-amber-300 dark:border-amber-500/40 text-amber-700 dark:text-amber-400'
                    : 'bg-emerald-100 dark:bg-emerald-500/20 border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-400'
                }`}
              >
                {marineReport.level === 'severe' ? (
                  <AlertTriangle className="w-6 h-6 animate-pulse" />
                ) : (
                  <Waves className="w-6 h-6" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-xs font-black uppercase tracking-wider ${
                      marineReport.level === 'severe'
                        ? 'text-rose-950 dark:text-rose-100'
                        : marineReport.level === 'moderate'
                        ? 'text-amber-950 dark:text-amber-100'
                        : 'text-emerald-950 dark:text-emerald-100'
                    }`}
                  >
                    🌊 Andaman Denizi Canlı Güvenlik Radarı
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border shadow-xs ${
                      marineReport.level === 'severe'
                        ? 'bg-rose-600 text-white border-rose-700 dark:border-rose-500 font-black'
                        : marineReport.level === 'moderate'
                        ? 'bg-amber-500 text-slate-950 border-amber-600 dark:border-amber-400 font-bold'
                        : 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 border-emerald-700 dark:border-emerald-400 font-bold'
                    }`}
                  >
                    {marineReport.level === 'severe'
                      ? '🔴 Fırtına / Dalga Alarmı'
                      : marineReport.level === 'moderate'
                      ? '🟡 Orta Dalgalı'
                      : '🟢 Sakin Deniz'}
                  </span>
                </div>
                <p
                  className={`text-xs font-medium mt-0.5 ${
                    marineReport.level === 'severe'
                      ? 'text-rose-900/90 dark:text-rose-200/90'
                      : marineReport.level === 'moderate'
                      ? 'text-amber-900/90 dark:text-amber-200/90'
                      : 'text-emerald-900/90 dark:text-emerald-200/90'
                  }`}
                >
                  {marineReport.summary}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div
                className={`px-3 py-1.5 rounded-xl border font-mono flex items-center gap-1.5 shadow-xs ${
                  marineReport.level === 'severe'
                    ? 'bg-white/90 dark:bg-slate-950/70 border-rose-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-200'
                    : marineReport.level === 'moderate'
                    ? 'bg-white/90 dark:bg-slate-950/70 border-amber-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-200'
                    : 'bg-white/90 dark:bg-slate-950/70 border-emerald-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-200'
                }`}
              >
                <Waves className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>
                  Dalga: <strong className="text-slate-950 dark:text-white font-bold">{marineReport.waveHeightMeters}m</strong>
                </span>
              </div>
              <div
                className={`px-3 py-1.5 rounded-xl border font-mono flex items-center gap-1.5 shadow-xs ${
                  marineReport.level === 'severe'
                    ? 'bg-white/90 dark:bg-slate-950/70 border-rose-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-200'
                    : marineReport.level === 'moderate'
                    ? 'bg-white/90 dark:bg-slate-950/70 border-amber-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-200'
                    : 'bg-white/90 dark:bg-slate-950/70 border-emerald-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-200'
                }`}
              >
                <Wind className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>
                  Rüzgar: <strong className="text-slate-950 dark:text-white font-bold">{marineReport.windSpeedKnots} Kts</strong> (
                  {marineReport.windDirectionText})
                </span>
              </div>
              <button
                type="button"
                onClick={handleRefreshMarine}
                disabled={isRefreshingMarine}
                className="p-2 rounded-xl bg-white/90 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white transition disabled:opacity-50 cursor-pointer shadow-xs"
                title="Radarı Yenile"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingMarine ? 'animate-spin' : ''}`} />
              </button>

              <button
                type="button"
                onClick={() => setIsWeatherModalOpen(true)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                  marineReport.level === 'severe'
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/40'
                    : 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white'
                }`}
                title="Hava Durumu Nedeniyle Misafirlere WhatsApp Bilgilendirmesi Gönder"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
                <span>⚠️ Hava Durumu Erteleme Çağrısı</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-surface-2 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-bold uppercase text-slate-400 block">Seçilen Tarih</span>
          <span className="text-base font-bold text-slate-900 dark:text-white mt-0.5 block">
            {(() => {
              try {
                const d = new Date(safeDate);
                return isNaN(d.getTime()) ? safeDate : d.toLocaleDateString('tr-TR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });
              } catch {
                return safeDate;
              }
            })()}
          </span>
        </div>

        <div className="bg-white dark:bg-surface-2 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-bold uppercase text-slate-400 block">Transfer Sayısı</span>
          <span className="text-base font-bold text-emerald-600 mt-0.5 block">
            {dailyPickups.length} Araç Alınışı
          </span>
        </div>

        <div className="bg-white dark:bg-surface-2 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-bold uppercase text-slate-400 block">Taşınacak Yolcu</span>
          <span className="text-base font-bold text-purple-600 mt-0.5 block">
            {totalDailyPassengers} Misafir
          </span>
        </div>

        <div className="bg-white dark:bg-surface-2 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-bold uppercase text-slate-400 block">Sahada Kalan Tahsilat</span>
          <span className="text-base font-bold text-amber-600 mt-0.5 block">
            {dailyPickups
              .reduce((acc, p) => acc + (Number(p.remainingAmountThb) || 0), 0)
              .toLocaleString()}{' '}
            THB
          </span>
        </div>
      </div>

      {/* Filters & Live Status Bar */}
      <div className="bg-white dark:bg-surface-2 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold mr-1">
            <Filter className="w-3.5 h-3.5 text-brand-primary dark:text-brand-accent" />
            <span>Filtrele:</span>
          </div>

          {/* Araç Filtresi */}
          <select
            value={vehicleFilter}
            onChange={(e) => setVehicleFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">🚐 Tüm Araçlar / Hatlar ({dailyPickups.length})</option>
            {routeVehicles.map((v) => (
              <option key={v} value={v}>
                {v} ({dailyPickups.filter((p) => p.assignedVehicle === v).length})
              </option>
            ))}
          </select>

          {/* Biniş Durumu Filtresi */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">🚦 Tüm Biniş Durumları</option>
            <option value="pending">⏳ Alınmayı Bekleyenler ({pendingCount})</option>
            <option value="picked_up">🚐 Araca Binenler ({pickedUpCount})</option>
            <option value="on_tour">⛵ Turda Olanlar</option>
            <option value="completed">✅ Tamamlananlar</option>
            <option value="no_show">❌ Gelmeyenler (No-Show)</option>
          </select>
        </div>

        {/* Görünüm Seçici & Live Pickup Counter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-surface-2 text-brand-primary dark:text-brand-accent shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Tablo
            </button>
            <button
              type="button"
              onClick={() => setViewMode('routes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'routes'
                  ? 'bg-white dark:bg-surface-2 text-brand-primary dark:text-brand-accent shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              Hat & Rota Planı ({vehicleRoutes.length})
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Binen: {pickedUpCount}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Bekleyen: {pendingCount}
            </span>
          </div>
        </div>
      </div>

      {viewMode === 'table' ? (
        /* Manifest Table */
        <div className="bg-white dark:bg-surface-2 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200/80 dark:border-slate-800 uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-4 px-5">⏰ Alınış Saati</th>
                <th className="py-4 px-5">📍 Otel & Oda</th>
                <th className="py-4 px-5">🚐 Hat & Minibüs</th>
                <th className="py-4 px-5">🧑‍✈️ Şoför / Rehber</th>
                <th className="py-4 px-5">👤 Misafir & Telefon</th>
                <th className="py-4 px-5">👥 Kişi</th>
                <th className="py-4 px-5">🏝️ Tur & Tedarikçi</th>
                <th className="py-4 px-5">💰 Tahsilat</th>
                <th className="py-4 px-5">🚦 Saha / Biniş Durumu</th>
                <th className="py-4 px-5 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPickups.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-14 text-center text-slate-400">
                    <Car className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                    <p className="font-semibold text-slate-600 dark:text-slate-400">
                      Seçilen filtre ve tarihte transfer kaydı bulunamadı.
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Filtreleri sıfırlayabilir veya yukarıdan başka bir tarih seçebilirsiniz.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredPickups.map((p, idx) => (
                  <tr
                    key={`${p.bookingId}-${idx}`}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-900/30 transition-colors"
                  >
                    <td className="py-4 px-5 font-mono text-sm font-extrabold text-brand-primary dark:text-brand-accent">
                      <button
                        type="button"
                        onClick={() => {
                          const current = p.pickupTime || '07:30';
                          const next = prompt(`"${p.customerName}" (${p.hotel}) için yeni alınış saatini girin:`, current);
                          if (next && next.trim() && next.trim() !== current) {
                            if (handleUpdatePickupTime) {
                              handleUpdatePickupTime(p.bookingId, p.tourIndex, next.trim());
                            }
                          }
                        }}
                        className="hover:underline hover:text-amber-500 cursor-pointer text-left"
                        title="Alınış Saatini Değiştir & Şoföre PWA Bildirimi Gönder"
                      >
                        ⏰ {p.pickupTime} ✎
                      </button>
                    </td>

                    <td className="py-4 px-5">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {p.hotel}
                      </span>
                      {p.roomNumber && (
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          Oda: {p.roomNumber}
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-5">
                      <select
                        value={p.assignedVehicle || 'Atanmadı'}
                        onChange={(e) =>
                          handleAssignVehicleToBooking(
                            p.bookingId,
                            p.tourIndex,
                            e.target.value
                          )
                        }
                        className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-accent max-w-[190px]"
                      >
                        <option value="Atanmadı">Hat Atanmadı</option>
                        {safeVehicles.filter((v) => v && v.active).map((v) => (
                          <option key={v.id} value={v.label}>
                            {v.kind === 'vip' ? '⭐' : v.kind === 'speedboat' ? '🚤' : '🚐'} {v.label}
                          </option>
                        ))}
                        {p.assignedVehicle &&
                          p.assignedVehicle !== 'Atanmadı' &&
                          !safeVehicles.some((v) => v && v.label === p.assignedVehicle) && (
                            <option value={p.assignedVehicle}>{p.assignedVehicle}</option>
                          )}
                      </select>
                      <div className="text-[10px] text-sky-500 font-semibold mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{p.hotelZone}</span>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <select
                        value={p.assignedDriver || ''}
                        onChange={(e) =>
                          handleAssignDriverToBooking &&
                          handleAssignDriverToBooking(
                            p.bookingId,
                            p.tourIndex,
                            e.target.value
                          )
                        }
                        className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-accent max-w-[170px]"
                      >
                        <option value="">Görevli Atanmadı</option>
                        {safeDrivers.filter((d) => d && d.active).map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.role === 'guide' ? '🗣️' : d.role === 'both' ? '⭐' : '🚐'} {d.fullName}
                          </option>
                        ))}
                        {p.assignedDriver &&
                          !safeDrivers.some((d) => d && d.id === p.assignedDriver) && (
                            <option value={p.assignedDriver}>{p.assignedDriver}</option>
                          )}
                      </select>
                      {(() => {
                        const d = safeDrivers.find((drv) => drv && drv.id === p.assignedDriver);
                        return d?.phone ? (
                          <a
                            href={`https://wa.me/${d.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-emerald-600 hover:underline block mt-1"
                          >
                            📞 {d.phone}
                          </a>
                        ) : null;
                      })()}
                    </td>

                    <td className="py-4 px-5">
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        {p.customerName}
                      </span>
                      <a
                        href={`https://wa.me/${p.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-emerald-600 hover:underline inline-flex items-center gap-1 mt-0.5"
                      >
                        <Phone className="w-3 h-3" /> {p.phone}
                      </a>
                    </td>

                    <td className="py-4 px-5">
                      <span className="font-bold">{p.adultCount || 1} Yetişkin</span>
                      {(p.childCount || 0) > 0 && (
                        <span className="text-xs text-slate-500 block">
                          +{p.childCount} Çocuk
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-5">
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        {p.tourTitle}
                      </span>
                      {p.supplier && (
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          Tedarikçi: {p.supplier}
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-5">
                      {(Number(p.remainingAmountThb) || 0) > 0 ? (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 inline-block">
                          Alınacak: {(Number(p.remainingAmountThb) || 0).toLocaleString()} THB
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 inline-block">
                          ✓ Tamamı Ödendi
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-5">
                      <select
                        value={p.pickupStatus || 'pending'}
                        onChange={(e) =>
                          handleUpdatePickupStatus &&
                          handleUpdatePickupStatus(
                            p.bookingId,
                            p.tourIndex,
                            e.target.value as any
                          )
                        }
                        className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold focus:outline-none transition-colors cursor-pointer ${
                          p.pickupStatus === 'picked_up'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                            : p.pickupStatus === 'on_tour'
                            ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-300'
                            : p.pickupStatus === 'completed'
                            ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300'
                            : p.pickupStatus === 'no_show'
                            ? 'bg-red-50 dark:bg-red-950/60 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300'
                            : 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        <option value="pending">⏳ Bekliyor</option>
                        <option value="picked_up">🚐 Araca Bindi</option>
                        <option value="on_tour">⛵ Turda</option>
                        <option value="completed">✅ Tamamlandı</option>
                        <option value="no_show">❌ Gelmedi (No-Show)</option>
                      </select>
                      {p.pickedUpAt && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono block mt-0.5">
                          Biniş: {p.pickedUpAt}
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {(() => {
                          const target = bookings.find((b) => b.id === p.bookingId);
                          if (!target) return null;
                          return (
                            <>
                              <a
                                href={getConciergeWhatsAppUrl('evening_breakfast', target)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 hover:bg-purple-600 hover:text-white transition-colors"
                                title="🌙 Akşam 20:00 Hatırlatması & Kahvaltı Kutusu (2 Saat Satırlı)"
                              >
                                <Moon className="w-4 h-4" />
                              </a>
                              <a
                                href={getConciergeWhatsAppUrl('vehicle_in_zone', target, p.hotelZone || 'bölgeniz')}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition-colors"
                                title="🚐 Minivan Bölgede / Lobiye İnin Acil Bildirimi"
                              >
                                <Car className="w-4 h-4" />
                              </a>
                              {p.pickupStatus === 'completed' && (
                                <a
                                  href={getGoogleReviewWhatsAppUrl(target)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 rounded-xl bg-yellow-50 dark:bg-yellow-950/40 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500 hover:text-slate-950 transition-colors"
                                  title="⭐ 18:30 Tur Sonu Akıllı Yorum İste (Google Review Booster)"
                                >
                                  <Star className="w-4 h-4" />
                                </a>
                              )}
                            </>
                          );
                        })()}
                        <a
                          href={getSingleHotelMapUrl(p.hotel)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 hover:bg-sky-600 hover:text-white transition-colors"
                          title="Otele Google Harita Navigasyonu Aç"
                        >
                          <Navigation className="w-4 h-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            const target = bookings.find((b) => b.id === p.bookingId);
                            if (target) setWhatsAppModalBooking(target);
                          }}
                          className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors"
                          title="WhatsApp Şablonları & Hazır Mesajlar"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        <a
                          href={`/bilet/${p.bookingId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition-colors"
                          title="Misafir Canlı Takip Portalını Aç (/bilet/[kod])"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            const target = bookings.find((b) => b.id === p.bookingId);
                            if (target) setVoucherBooking(target);
                          }}
                          className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 hover:bg-purple-600 hover:text-white transition-colors"
                          title="Bilet / Voucher Kuponu Aç"
                        >
                          <Ticket className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const target = bookings.find((b) => b.id === p.bookingId);
                            if (target) {
                              const url = getGoogleReviewWhatsAppUrl(target, { googleReviewUrl });
                              window.open(url, '_blank', 'noopener,noreferrer');
                            }
                          }}
                          className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-400 hover:text-slate-950 transition-colors"
                          title="⭐ Misafirden 5-Yıldızlı Google Yorumu İste (WhatsApp)"
                        >
                          <Star className="w-4 h-4 fill-current" />
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            await sendTransferPushNotification({
                              bookingId: p.bookingId,
                              customerName: p.customerName,
                              hotel: p.hotel,
                              newTime: p.pickupTime || '07:30',
                              vehicle: p.assignedVehicle,
                              driverId: p.assignedDriver,
                              roomNumber: p.roomNumber,
                              phone: p.phone,
                            });
                            showToast(`📢 ${p.customerName} transfer bildirimi şoföre iletildi!`);
                          }}
                          className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                          title="📲 Şoföre Anlık PWA Push Bildirimi Gönder"
                        >
                          <BellRing className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      ) : (
        /* Hat & Şoför Rota Planı Kartları */
        <div className="space-y-6">
          {vehicleRoutes.length === 0 ? (
            <div className="bg-white dark:bg-surface-2 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center text-slate-400">
              <Car className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
              <p className="font-semibold text-slate-600 dark:text-slate-400">Seçilen tarihte hat / araç ataması bulunamadı.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {vehicleRoutes.map((route) => {
                const pickedInRoute = route.stops.filter((s) => s.pickupStatus === 'picked_up').length;
                const totalCashToCollect = route.stops.reduce((acc, s) => acc + (Number(s.remainingAmountThb) || 0), 0);

                return (
                  <div
                    key={route.vehicle}
                    className="bg-white dark:bg-surface-2 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between"
                  >
                    {/* Route Header */}
                    <div className="p-5 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200/80 dark:border-slate-800">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="w-9 h-9 rounded-xl bg-brand-primary/10 dark:bg-brand-accent/10 text-brand-primary dark:text-brand-accent flex items-center justify-center font-bold text-lg">
                              🚐
                            </span>
                            <div>
                              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                                {route.vehicle}
                              </h3>
                              <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                                <span>🧑‍✈️ {route.driver ? `${route.driver.fullName}` : 'Şoför Atanmadı'}</span>
                                {route.driver?.phone && (
                                  <a
                                    href={`tel:${route.driver.phone}`}
                                    className="text-brand-primary dark:text-brand-accent hover:underline flex items-center gap-0.5 font-medium"
                                  >
                                    <Phone className="w-3 h-3" />
                                    {route.driver.phone}
                                  </a>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Status Pills */}
                        <div className="flex flex-col items-end gap-1">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            {route.totalGuests} Misafir · {route.stops.length} Alınış
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500">
                            Binen: {pickedInRoute} / {route.stops.length}
                          </span>
                        </div>
                      </div>

                      {/* Cash to collect badge & Pier info */}
                      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" />
                          <span>Varış: <strong className="text-slate-900 dark:text-white">{route.pier}</strong></span>
                        </div>
                        {totalCashToCollect > 0 ? (
                          <span className="px-2.5 py-0.5 rounded-lg font-bold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
                            💰 Alınacak Nakit: {totalCashToCollect.toLocaleString()} THB
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-lg font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300">
                            ✓ Nakit Yok (Ödendi)
                          </span>
                        )}
                      </div>

                      {/* Akıllı Sıralama Modu Seçici */}
                      <div className="mt-3 p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-between gap-2 flex-wrap text-xs">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <Compass className="w-3.5 h-3.5 text-brand-primary" />
                          <span>Rota Sıralaması:</span>
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setRouteSortModes((prev) => ({ ...prev, [route.vehicle]: 'pier_bound' }));
                              setCustomStopOrder((prev) => {
                                const next = { ...prev };
                                delete next[route.vehicle];
                                return next;
                              });
                            }}
                            className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                              route.sortMode === 'pier_bound'
                                ? 'bg-brand-primary text-white shadow-xs'
                                : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                            }`}
                          >
                            🗺️ İskele Yönü (Kuzey➔Güney)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRouteSortModes((prev) => ({ ...prev, [route.vehicle]: 'time' }));
                              setCustomStopOrder((prev) => {
                                const next = { ...prev };
                                delete next[route.vehicle];
                                return next;
                              });
                            }}
                            className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                              route.sortMode === 'time'
                                ? 'bg-brand-primary text-white shadow-xs'
                                : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                            }`}
                          >
                            🕒 Saate Göre
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRouteSortModes((prev) => ({ ...prev, [route.vehicle]: 'reverse' }));
                              setCustomStopOrder((prev) => {
                                const next = { ...prev };
                                delete next[route.vehicle];
                                return next;
                              });
                            }}
                            className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                              route.sortMode === 'reverse'
                                ? 'bg-brand-primary text-white shadow-xs'
                                : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                            }`}
                          >
                            🔄 Ters Sıra
                          </button>
                        </div>
                      </div>

                      {/* Action Buttons for Route */}
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <a
                          href={route.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Google Maps</span>
                        </a>
                        <a
                          href={route.wazeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Waze</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => handleSendWhatsAppRouteToDriver(route)}
                          className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Şoföre Rota At</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyRouteForDriver(route)}
                          className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Kopyala</span>
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            const firstStop = route.stops[0];
                            await sendTransferPushNotification({
                              bookingId: `ROUTE-${route.vehicle}`,
                              customerName: `${route.totalGuests} Yolcu (${route.stops.length} Durak)`,
                              hotel: `${route.stops.map((s) => s.hotel).slice(0, 2).join(', ')}${route.stops.length > 2 ? '...' : ''}`,
                              newTime: firstStop?.pickupTime || '07:30',
                              vehicle: route.vehicle,
                              driverName: route.driver?.fullName,
                              driverId: route.driver?.id,
                            });
                            showToast(`📲 "${route.vehicle}" şoförüne (${route.driver?.fullName || 'Tüm Ekip'}) PWA bildirimi iletildi!`);
                          }}
                          className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                          title="Şoförün telefonuna anlık PWA push bildirimi fırlat"
                        >
                          <BellRing className="w-3.5 h-3.5" />
                          <span>PWA Bildir</span>
                        </button>
                      </div>
                    </div>

                    {/* Timeline Stops */}
                    <div className="p-5 divide-y divide-slate-100 dark:divide-slate-800/60 flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          📍 Durak Sıralaması ({route.stops.length} Otel)
                        </p>
                        <span className="text-[10px] text-slate-400">
                          ▲/▼ ile sırayı değiştirebilirsiniz
                        </span>
                      </div>
                      <div className="space-y-4">
                        {route.stops.map((stop, idx) => (
                          <div key={`${stop.bookingId}-${stop.tourIndex}`} className="pt-3 first:pt-0 flex items-start gap-2.5">
                            <div className="flex flex-col items-center gap-0.5 shrink-0 mt-0.5">
                              <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <div className="flex items-center gap-0.5">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => handleMoveStop(route.vehicle, idx, 'up')}
                                  className="w-4 h-4 rounded text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-20 cursor-pointer flex items-center justify-center"
                                  title="Yukarı taşı"
                                >
                                  ▲
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === route.stops.length - 1}
                                  onClick={() => handleMoveStop(route.vehicle, idx, 'down')}
                                  className="w-4 h-4 rounded text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-20 cursor-pointer flex items-center justify-center"
                                  title="Aşağı taşı"
                                >
                                  ▼
                                </button>
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <a
                                  href={getSingleHotelMapUrl(stop.hotel)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-bold text-slate-900 dark:text-white text-xs truncate hover:text-brand-primary flex items-center gap-1"
                                  title="Google Haritalar'da Gör"
                                >
                                  <span>{stop.hotel}</span>
                                  <ExternalLink className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                </a>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const current = stop.pickupTime || '07:30';
                                    const next = prompt(`"${stop.customerName}" (${stop.hotel}) için yeni alınış saatini girin:`, current);
                                    if (next && next.trim() && next.trim() !== current) {
                                      if (handleUpdatePickupTime) {
                                        handleUpdatePickupTime(stop.bookingId, stop.tourIndex, next.trim());
                                      }
                                    }
                                  }}
                                  className="px-2 py-0.5 rounded-md font-mono text-xs font-bold bg-slate-100 hover:bg-amber-100 dark:bg-slate-800 dark:hover:bg-amber-950/60 text-slate-700 hover:text-amber-700 dark:text-slate-300 dark:hover:text-amber-400 shrink-0 cursor-pointer transition border border-transparent hover:border-amber-300"
                                  title="Alınış Saatini Değiştir & Şoföre PWA Bildirimi Gönder"
                                >
                                  ⏰ {stop.pickupTime || '07:30'} ✎
                                </button>
                              </div>

                              <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                <span>{stop.customerName}</span>
                                <span>·</span>
                                <span>{stop.adultCount || 1} Yetişkin{(stop.childCount || 0) > 0 ? ` + ${stop.childCount} Çocuk` : ''}</span>
                                {stop.roomNumber && (
                                  <>
                                    <span>·</span>
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">Oda: {stop.roomNumber}</span>
                                  </>
                                )}
                              </div>

                              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                                {(Number(stop.remainingAmountThb) || 0) > 0 ? (
                                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded">
                                    Nakit: {(Number(stop.remainingAmountThb) || 0).toLocaleString()} THB
                                  </span>
                                ) : (
                                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                    ✓ Ödendi
                                  </span>
                                )}

                                <div className="flex items-center gap-1.5">
                                  <select
                                    value={stop.pickupStatus || 'pending'}
                                    onChange={(e) =>
                                      handleUpdatePickupStatus &&
                                      handleUpdatePickupStatus(
                                        stop.bookingId,
                                        stop.tourIndex,
                                        e.target.value as any
                                      )
                                    }
                                    className={`px-2 py-1 rounded-lg border text-[11px] font-bold focus:outline-none transition-colors cursor-pointer ${
                                      stop.pickupStatus === 'picked_up'
                                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                                        : stop.pickupStatus === 'on_tour'
                                        ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-300'
                                        : 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300'
                                    }`}
                                  >
                                    <option value="pending">⏳ Bekliyor</option>
                                    <option value="picked_up">🚐 Bindi</option>
                                    <option value="on_tour">⛵ Turda</option>
                                    <option value="completed">✅ Bitti</option>
                                    <option value="no_show">❌ Gelmedi</option>
                                  </select>
                                  {stop.pickupStatus === 'completed' && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const target = bookings.find((b) => b.id === stop.bookingId);
                                        if (target) {
                                          const url = getGoogleReviewWhatsAppUrl(target, { googleReviewUrl });
                                          window.open(url, '_blank', 'noopener,noreferrer');
                                        }
                                      }}
                                      className="px-2 py-1 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                                      title="Misafire Google Yorum Daveti Gönder (WhatsApp)"
                                    >
                                      <Star className="w-3 h-3 fill-current" />
                                      <span>Yorum</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Pier Final Stop */}
                        <div className="pt-3 flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                            🏁
                          </span>
                          <div className="flex-1">
                            <span className="font-bold text-slate-900 dark:text-white text-xs">
                              {route.pier}
                            </span>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Varış & Tekneye Biniş / Liman Buluşması
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {isBulkDispatchOpen && (
        <BulkDispatchModal
          pickups={dailyPickups}
          manifestDate={manifestDate}
          onClose={() => setIsBulkDispatchOpen(false)}
          showToast={showToast}
        />
      )}

      {/* 🌊 HAVA DURUMU & FIRTINA ERTELEME MODALI */}
      {isWeatherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Hava Durumu & Fırtına Erteleme Bildirimi</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 font-mono">
                      {manifestDate}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Dalga ve fırtına nedeniyle misafirlere tek tıkla alternatif rota veya tarih erteleme WhatsApp mesajı gönderin.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsWeatherModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <span className="text-lg">✕</span>
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-3">
              {dailyPickups.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  Seçilen tarihte kayıtlı yolcu bulunamadı.
                </div>
              ) : (
                dailyPickups.map((p) => {
                  const bObj: Booking = {
                    id: p.bookingId,
                    customerName: p.customerName,
                    phone: p.phone,
                    hotel: p.hotel,
                    tourId: 'sea-tour',
                    tourTitle: p.tourTitle,
                    tourDate: safeDate,
                    adultCount: p.adultCount,
                    childCount: p.childCount,
                    totalPriceThb: 0,
                    paidAmountThb: 0,
                    remainingAmountThb: p.remainingAmountThb,
                    status: 'confirmed',
                    pickupStatus: p.pickupStatus,
                    paymentStatus: 'paid',
                    createdAt: new Date().toISOString(),
                  };

                  return (
                    <div
                      key={`${p.bookingId}-${p.tourIndex}`}
                      className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white truncate">{p.customerName}</span>
                          <span className="text-xs text-slate-400 font-mono">({p.phone})</span>
                        </div>
                        <div className="text-xs text-rose-300 font-medium truncate mt-0.5">
                          🏝️ {p.tourTitle}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          📍 {p.hotel} · ⏰ {p.pickupTime || '07:30'}
                        </div>
                      </div>

                      <a
                        href={getWeatherPostponeWhatsAppUrl(
                          bObj,
                          'James Bond Adası & Phang Nga Kano (Sakin Körfez)'
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-md cursor-pointer"
                        title="Misafire WhatsApp Fırtına/Erteleme Şablonu Gönder"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp Gönder</span>
                      </a>
                    </div>
                  );
                })
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
              <span>💡 Mesajda misafire tarih erteleme, James Bond körfez rotasına geçiş ve iade seçeneği sunulur.</span>
              <button
                type="button"
                onClick={() => setIsWeatherModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
