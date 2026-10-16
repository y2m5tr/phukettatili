import React, { useState, useMemo, useEffect } from 'react';
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

interface TransfersTabProps {
  bookings?: Booking[];
  manifestDate?: string;
  setManifestDate: (d: string) => void;
  vehicles?: VehicleItem[];
  drivers?: DriverItem[];
  /** Toast gösterici — AdminDashboard ile aynı davranış. */
  showToast: (msg: string) => void;
  handleAssignVehicleToBooking: (bookingId: string, tourIndex: number, vehicle: string) => void;
  handleAssignDriverToBooking: (bookingId: string, tourIndex: number, driverId: string) => void;
  handleUpdatePickupStatus?: (
    bookingId: string,
    tourIndex: number,
    status: 'pending' | 'picked_up' | 'on_tour' | 'completed' | 'no_show'
  ) => void;
  setWhatsAppModalBooking: (b: Booking) => void;
  setVoucherBooking: (b: Booking) => void;
  onOpenPoliceManifest: () => void;
  onOpenQrScanner?: () => void;
  onOpenLostFound?: () => void;
  onOpenDietaryManifest?: () => void;
  onOpenFieldCashier?: () => void;
  onOpenFlightRadar?: () => void;
  onOpenDriverExpense?: () => void;
  onOpenWelcomeBoard?: (b?: Booking) => void;
  onOpenLuggageExpress?: () => void;
}

export default function TransfersTab({
  bookings = [],
  manifestDate = new Date().toISOString().split('T')[0],
  setManifestDate,
  vehicles = [],
  drivers = [],
  showToast,
  handleAssignVehicleToBooking,
  handleAssignDriverToBooking,
  handleUpdatePickupStatus,
  setWhatsAppModalBooking,
  setVoucherBooking,
  onOpenPoliceManifest,
  onOpenQrScanner,
  onOpenLostFound,
  onOpenDietaryManifest,
  onOpenFieldCashier,
  onOpenFlightRadar,
  onOpenDriverExpense,
  onOpenWelcomeBoard,
  onOpenLuggageExpress,
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

  // Hat bazlı rota sıralaması: her araç için oteller saat ve bölgeye göre sıralanır
  const vehicleRoutes = useMemo(() => {
    const groups: Record<string, PickupItem[]> = {};
    dailyPickups.forEach((p) => {
      const v = p.assignedVehicle || 'Atanmadı';
      if (!groups[v]) groups[v] = [];
      groups[v].push(p);
    });

    return Object.entries(groups).map(([vehicle, items]) => {
      // Sıralama mantığı: önce pickupTime, sonra getZoneOrder
      const sortedStops = [...items].sort((a, b) => {
        const timeCompare = (a.pickupTime || '07:30').localeCompare(b.pickupTime || '07:30');
        if (timeCompare !== 0) return timeCompare;
        return getZoneOrder(a.hotelZone) - getZoneOrder(b.hotelZone);
      });

      const uniqueHotels = Array.from(new Set(sortedStops.map((s) => s.hotel)));
      const pier = detectDeparturePier(sortedStops[0]?.tourTitle || '');
      const mapsUrl = generateMultiStopMapUrl(uniqueHotels, pier);
      const totalGuests = sortedStops.reduce((sum, s) => sum + (s.adultCount || 0) + (s.childCount || 0), 0);
      const driverId = sortedStops.find((s) => s.assignedDriver)?.assignedDriver;
      const driver = safeDrivers.find((d) => d && d.id === driverId);

      return {
        vehicle,
        driver,
        stops: sortedStops,
        uniqueHotels,
        pier,
        mapsUrl,
        totalGuests,
      };
    });
  }, [dailyPickups, safeDrivers]);

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
  const handleCopyManifest = () => {
    if (dailyPickups.length === 0) {
      showToast('Seçilen tarihte transfer kaydı bulunmuyor.');
      return;
    }
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

    navigator.clipboard.writeText(textLines.join('\n'));
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

        <div className="flex flex-wrap items-center gap-3">
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
              className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          {/* 📷 Bilet QR Tara / Check-in Butonu (Saha Entegrasyonu) */}
          {onOpenQrScanner && (
            <button
              type="button"
              onClick={onOpenQrScanner}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-purple-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Misafir Kuponu / Bilet QR Kodu Oku & Doğrula"
            >
              <Camera className="w-4 h-4" />
              <span>📷 Bilet QR Oku / Check-in</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsBulkDispatchOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-black shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Gündeki tüm misafirlere WhatsApp lobi ve biniş hatırlatmalarını sırayla gönder"
          >
            <Send className="w-4 h-4" />
            <span>🚀 Toplu WhatsApp Gönderici</span>
          </button>

          <button
            type="button"
            onClick={handleCopyManifest}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-bold shadow-md flex items-center gap-1.5 transition-all"
          >
            <Copy className="w-4 h-4" />
            <span>Şoför İçin Kopyala</span>
          </button>

          {dailyPickups.length > 0 && (
            <a
              href={generateMultiStopMapUrl(
                dailyPickups.map((p) => p.hotel),
                detectDeparturePier(dailyPickups[0]?.tourTitle)
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-sky-600/20 flex items-center gap-1.5 transition-all"
              title="Günün tüm otellerini ardışık Google Maps rotası olarak aç"
            >
              <Navigation className="w-4 h-4" />
              <span>🗺️ Çoklu Rota (Maps)</span>
            </a>
          )}

          <button
            type="button"
            onClick={onOpenPoliceManifest}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
            title="Tayland Deniz Polisi & Millî Park Yolcu Manifestosu"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>🛂 Deniz Polisi Manifestosu</span>
          </button>

          {onOpenLostFound && (
            <button
              type="button"
              onClick={onOpenLostFound}
              className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-xs sm:text-sm font-bold shadow-md shadow-amber-500/10 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Araçta ve teknede unutulan kayıp eşya takibi"
            >
              <Package className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>📦 Kayıp Eşya Masası</span>
            </button>
          )}

          {onOpenDietaryManifest && (
            <button
              type="button"
              onClick={onOpenDietaryManifest}
              className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-500/30 text-xs sm:text-sm font-bold shadow-md shadow-rose-500/10 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Misafir Diyet, Alerji ve Tekne Güvenlik Manifestosu"
            >
              <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>🛡️ Diyet & Emniyet</span>
            </button>
          )}

          {onOpenFieldCashier && (
            <button
              type="button"
              onClick={onOpenFieldCashier}
              className="px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 text-xs sm:text-sm font-bold shadow-md shadow-emerald-500/10 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Saha Çoklu Döviz & Para Üstü Kasa Hesaplayıcı"
            >
              <Coins className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>💱 Saha Döviz Kasa</span>
            </button>
          )}

          {onOpenFlightRadar && (
            <button
              type="button"
              onClick={onOpenFlightRadar}
              className="px-4 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-800 dark:text-sky-300 border border-sky-500/30 text-xs sm:text-sm font-bold shadow-md shadow-sky-500/10 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Phuket Havalimanı Canlı Uçuş Radarı & Rötar Kalkanı"
            >
              <Plane className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>✈️ Uçuş Radarı</span>
            </button>
          )}

          {onOpenDriverExpense && (
            <button
              type="button"
              onClick={onOpenDriverExpense}
              className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-xs sm:text-sm font-bold shadow-md shadow-amber-500/10 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Şoför Yakıt, Otopark & Harç Masraf Masası"
            >
              <Fuel className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>⛽ Şoför Masrafı</span>
            </button>
          )}

          {onOpenWelcomeBoard && (
            <button
              type="button"
              onClick={() => onOpenWelcomeBoard()}
              className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-xs sm:text-sm font-bold shadow-md shadow-amber-500/10 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Havalimanı VIP Karşılama İsimliği & Tablet Tabelası"
            >
              <span>🪧 VIP İsimlik</span>
            </button>
          )}

          {onOpenLuggageExpress && (
            <button
              type="button"
              onClick={onOpenLuggageExpress}
              className="px-4 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border border-indigo-500/30 text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/10 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Oteller Arası Bagaj Transfer & Emanet Takip Masası"
            >
              <Luggage className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>🧳 Bagaj Transferi</span>
            </button>
          )}
        </div>
      </div>

      {/* 🌊 ANDAMAN DENİZİ CANLI GÜVENLİK & DALGA RADARI */}
      {marineReport && (
        <div
          className={`p-4 sm:p-5 rounded-3xl border shadow-xs transition-all ${
            marineReport.level === 'severe'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              : marineReport.level === 'moderate'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                  marineReport.level === 'severe'
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                    : marineReport.level === 'moderate'
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                    : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                }`}
              >
                {marineReport.level === 'severe' ? (
                  <AlertTriangle className="w-6 h-6 animate-pulse" />
                ) : (
                  <Waves className="w-6 h-6" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-white">
                    🌊 Andaman Denizi Canlı Güvenlik Radarı
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                      marineReport.level === 'severe'
                        ? 'bg-rose-500 text-slate-950 border-rose-400 font-black'
                        : marineReport.level === 'moderate'
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                        : 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                    }`}
                  >
                    {marineReport.level === 'severe'
                      ? '🔴 Fırtına / Dalga Alarmı'
                      : marineReport.level === 'moderate'
                      ? '🟡 Orta Dalgalı'
                      : '🟢 Sakin Deniz'}
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-300 dark:text-slate-300 mt-0.5">
                  {marineReport.summary}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800 font-mono flex items-center gap-1.5 text-slate-200">
                <Waves className="w-3.5 h-3.5 text-sky-400" />
                <span>
                  Dalga: <strong className="text-white">{marineReport.waveHeightMeters}m</strong>
                </span>
              </div>
              <div className="bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800 font-mono flex items-center gap-1.5 text-slate-200">
                <Wind className="w-3.5 h-3.5 text-sky-400" />
                <span>
                  Rüzgar: <strong className="text-white">{marineReport.windSpeedKnots} Kts</strong> (
                  {marineReport.windDirectionText})
                </span>
              </div>
              <button
                type="button"
                onClick={handleRefreshMarine}
                disabled={isRefreshingMarine}
                className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-white transition disabled:opacity-50 cursor-pointer"
                title="Radarı Yenile"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingMarine ? 'animate-spin' : ''}`} />
              </button>

              <button
                type="button"
                onClick={() => setIsWeatherModalOpen(true)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md ${
                  marineReport.level === 'severe'
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/40'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
                title="Hava Durumu Nedeniyle Misafirlere WhatsApp Bilgilendirmesi Gönder"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
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
                      ⏰ {p.pickupTime}
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

                      {/* Action Buttons for Route */}
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <a
                          href={route.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                        >
                          <Navigation className="w-4 h-4" />
                          <span>Google Haritalar Navigasyonu</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => handleCopyRouteForDriver(route)}
                          className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                        >
                          <Copy className="w-4 h-4" />
                          <span>Şoför Görev Emrini Kopyala</span>
                        </button>
                      </div>
                    </div>

                    {/* Timeline Stops */}
                    <div className="p-5 divide-y divide-slate-100 dark:divide-slate-800/60 flex-1">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                        📍 Durak Sıralaması (Kuzeyden Güneye / İskele Hattı)
                      </p>
                      <div className="space-y-4">
                        {route.stops.map((stop, idx) => (
                          <div key={`${stop.bookingId}-${stop.tourIndex}`} className="pt-3 first:pt-0 flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold text-slate-900 dark:text-white text-xs truncate">
                                  {stop.hotel}
                                </span>
                                <span className="px-2 py-0.5 rounded-md font-mono text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                                  ⏰ {stop.pickupTime || '07:30'}
                                </span>
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
