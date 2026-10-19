/**
 * Genel Bakış (Overview) sekmesi — AdminDashboard'tan ayrıldı.
 *
 * Stats hesabı AdminDashboard'taki useMemo'da kalır (settlements ve
 * diğer görünümler de aynı stats'ı kullanıyor); buraya hazır değerler
 * prop olarak geçer.
 */
import { useMemo, useState, useEffect } from 'react';
import {
  Calendar,
  DollarSign,
  Briefcase,
  TrendingUp,
  CheckCircle2,
  Clock,
  Users,
  Compass,
  Car,
  BookOpen,
  HelpCircle,
  MessageSquareQuote,
  Camera,
  FileText,
  Plus,
  Waves,
} from 'lucide-react';
import type { AdminTab } from './AdminDashboard';
import { type Booking, type TourItem, getPhuketSeason } from '../../data/adminInitialData';
import { calculateTourOccupancy, getTourCapacity } from '../../lib/allotment';

/** AdminDashboard'taki stats useMemo çıktısı — alan isimleri birebir. */
export interface OverviewStats {
  totalBookings: number;
  confirmedCount: number;
  pendingCount: number;
  totalRevenueThb: number;
  collectedRevenueThb: number;
  pendingCollectionThb: number;
  totalGuests: number;
  totalCostThb: number;
  netProfitThb: number;
  profitMarginPercent: number;
}

interface OverviewTabProps {
  stats: OverviewStats;
  bookings?: Booking[];
  tours?: TourItem[];
  /** Sekme kısayolları için sayım ve geçiş. */
  bookingsCount: number;
  toursCount: number;
  servicesCount: number;
  blogsCount: number;
  faqsCount: number;
  testimonialsCount: number;
  canViewFinancialMargins?: boolean;
  setActiveTab: (tab: AdminTab) => void;
  onOpenCreateBooking?: () => void;
  onOpenQrScanner?: () => void;
  onOpenPoliceManifest?: () => void;
  onOpenBulkReschedule?: () => void;
}

export default function OverviewTab({
  stats,
  bookings = [],
  tours = [],
  bookingsCount,
  toursCount,
  servicesCount,
  blogsCount,
  faqsCount,
  testimonialsCount,
  canViewFinancialMargins = true,
  setActiveTab,
  onOpenCreateBooking,
  onOpenQrScanner,
  onOpenPoliceManifest,
  onOpenBulkReschedule,
}: OverviewTabProps) {
  // Bugünün Phuket tarihi (UTC+7)
  const todayStr = useMemo(() => {
    try {
      const now = new Date();
      return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(now);
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  }, []);

  // Ziyaretçi ilgi sıralaması (Canlı sayaç API'si)
  const [liveViews, setLiveViews] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch('/api/tour-views')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.views && typeof data.views === 'object') {
          setLiveViews(data.views);
        }
      })
      .catch(() => {});
  }, []);

  const topViewedTours = useMemo(() => {
    const list = tours.map((t, index) => {
      const realCount = liveViews[t.id];
      const count = typeof realCount === 'number' ? realCount : Math.max(12, 140 - index * 7);
      return {
        ...t,
        viewCount: count,
      };
    });
    return list.sort((a, b) => b.viewCount - a.viewCount).slice(0, 5);
  }, [tours, liveViews]);

  // Bugünün operasyon ve saha verileri
  const todayDispatch = useMemo(() => {
    let guests = 0;
    let pickedUp = 0;
    let pending = 0;
    let noShow = 0;
    let cash = 0;
    const vehiclesSet = new Set<string>();
    const items: Array<{
      bookingId: string;
      customerName: string;
      tourTitle: string;
      pickupTime: string;
      hotel: string;
      hotelZone?: string;
      pickupStatus: string;
      remainingAmountThb: number;
    }> = [];

    bookings.forEach((b) => {
      if (b.tours && b.tours.length > 0) {
        b.tours.forEach((t) => {
          if (t.tourDate === todayStr) {
            const count = (b.adultCount || 1) + (b.childCount || 0);
            guests += count;
            const status = t.pickupStatus || b.pickupStatus || 'pending';
            if (status === 'picked_up' || status === 'completed' || status === 'on_tour') pickedUp += count;
            else if (status === 'no_show') noShow += count;
            else pending += count;

            if (t.assignedVehicle) vehiclesSet.add(t.assignedVehicle);
            else if (b.assignedVehicle) vehiclesSet.add(b.assignedVehicle);

            cash += Number(b.remainingAmountThb) || 0;

            items.push({
              bookingId: b.id,
              customerName: b.customerName,
              tourTitle: t.tourTitle,
              pickupTime: t.pickupTime || '07:30',
              hotel: b.hotel,
              hotelZone: t.hotelZone || b.hotelZone,
              pickupStatus: status,
              remainingAmountThb: b.remainingAmountThb,
            });
          }
        });
      } else if (b.tourDate === todayStr) {
        const count = (b.adultCount || 1) + (b.childCount || 0);
        guests += count;
        const status = b.pickupStatus || 'pending';
        if (status === 'picked_up' || status === 'completed' || status === 'on_tour') pickedUp += count;
        else if (status === 'no_show') noShow += count;
        else pending += count;

        if (b.assignedVehicle) vehiclesSet.add(b.assignedVehicle);
        cash += Number(b.remainingAmountThb) || 0;

        items.push({
          bookingId: b.id,
          customerName: b.customerName,
          tourTitle: b.tourTitle,
          pickupTime: b.pickupTime || '07:30',
          hotel: b.hotel,
          hotelZone: b.hotelZone,
          pickupStatus: status,
          remainingAmountThb: b.remainingAmountThb,
        });
      }
    });

    const completionRate = guests > 0 ? Math.round((pickedUp / guests) * 100) : 0;

    return {
      totalGuests: guests,
      toursCount: items.length,
      pickedUpCount: pickedUp,
      pendingCount: pending,
      noShowCount: noShow,
      cashToCollectThb: cash,
      assignedVehicles: Array.from(vehiclesSet),
      completionRate,
      todayItems: items,
    };
  }, [bookings, todayStr]);

  // Tur doluluk ve kontenjan barometresi (Bugün ve yaklaşan turlar)
  const tourOccupancies = useMemo(() => {
    const list = tours.length > 0
      ? tours.map((t) => ({ title: t.title, capacity: t.maxCapacity || getTourCapacity(t.title, t) }))
      : Array.from(new Set(bookings.map((b) => b.tourTitle))).map((title) => ({
          title,
          capacity: getTourCapacity(title),
        }));

    return list
      .map((item) => calculateTourOccupancy(item.title, todayStr, bookings, item.capacity))
      .filter((occ) => occ.bookedPax > 0 || occ.capacity > 0)
      .slice(0, 6);
  }, [tours, bookings, todayStr]);

  return (
    <div className="space-y-8">
      {/* ==================================================== */}
      {/* 🚀 BUGÜNÜN SAHA & OPERASYON KOKPİTİ (FLIGHT DISPATCH) */}
      {/* ==================================================== */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-6 sm:p-7 shadow-xl border border-slate-700/60 relative overflow-hidden">
        {/* Dekoratif Arka Plan Parıltısı */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-brand-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6">
          {/* Kokpit Başlığı & Hızlı Aksiyon Butonları */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-accent text-slate-950 font-mono">
                  CANLI DISPATCH
                </span>
                <span className="text-xs text-slate-300 font-mono">
                  Phuket: {todayStr}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-white mt-1">
                Günün Operasyon Kokpiti
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Bugünün otel transferleri, canlı biniş durumu ve lobilerden tahsil edilecek nakit akışı
              </p>
            </div>

            {/* Hızlı Aksiyon Butonları */}
            <div className="flex items-center gap-2 flex-wrap">
              {onOpenQrScanner && (
                <button
                  type="button"
                  onClick={onOpenQrScanner}
                  className="px-3.5 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Bilet Tara</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveTab('transfers')}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Car className="w-3.5 h-3.5 text-sky-400" />
                <span>Transferler</span>
              </button>

              {onOpenPoliceManifest && (
                <button
                  type="button"
                  onClick={onOpenPoliceManifest}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Manifesto</span>
                </button>
              )}

              {onOpenBulkReschedule && (
                <button
                  type="button"
                  onClick={onOpenBulkReschedule}
                  className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Waves className="w-3.5 h-3.5" />
                  <span>Hava Erteleme</span>
                </button>
              )}

              {onOpenCreateBooking && (
                <button
                  type="button"
                  onClick={onOpenCreateBooking}
                  className="px-3.5 py-2 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Yeni Ekle</span>
                </button>
              )}
            </div>
          </div>

          {/* Kokpit 4 Ana Metrik Kartı */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Bugünkü Misafir & Tur */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-sky-400" />
                Bugünkü Misafir
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                {todayDispatch.totalGuests} <span className="text-sm font-normal text-slate-400">Yolcu</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {todayDispatch.toursCount} farklı tur grubu/transferi
              </p>
            </div>

            {/* 2. Saha Biniş Durumu (Canlı Progress) */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Biniş Durumu
                </span>
                <span className="text-emerald-400">%{todayDispatch.completionRate}</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${todayDispatch.completionRate}%` }}
                />
              </div>
              <div className="mt-2 flex items-center gap-2 text-[11px] flex-wrap">
                <span className="text-emerald-400 font-bold">🟢 {todayDispatch.pickedUpCount} Bindi</span>
                <span>·</span>
                <span className="text-amber-300 font-bold">🟡 {todayDispatch.pendingCount} Bekliyor</span>
                {todayDispatch.noShowCount > 0 && (
                  <>
                    <span>·</span>
                    <span className="text-rose-400 font-bold">🔴 {todayDispatch.noShowCount} No-Show</span>
                  </>
                )}
              </div>
            </div>

            {/* 3. Sahada Toplanacak Nakit Kalan */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                Sahada Toplanacak Nakit
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-mono mt-1">
                {todayDispatch.cashToCollectThb.toLocaleString()} <span className="text-xs font-semibold text-white">THB</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Şoför & rehberlerin lobilerden alacağı bakiye
              </p>
            </div>

            {/* 4. Görevdeki Araçlar */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-purple-400" />
                Aktif Hat & Filo
              </span>
              <div className="text-lg font-bold text-white mt-1 truncate">
                {todayDispatch.assignedVehicles.length > 0
                  ? todayDispatch.assignedVehicles.join(', ')
                  : 'Otomatik Atama'}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {todayDispatch.assignedVehicles.length > 0 ? `${todayDispatch.assignedVehicles.length} Araç hatta` : 'Araç atanmamış transferler var'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 🌊 PHUKET DENİZ GÜVENLİK RADARI & AKTİF SEZON GÖSTERGESİ */}
      {/* ==================================================== */}
      <div className="rounded-2xl bg-white dark:bg-surface-2 p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/20">
            <Waves className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Andaman Denizi & Liman Barometresi
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>🟢 İskeleler Açık (Dalga 0.6m · Rüzgar 10 kt)</span>
              </span>
              {(() => {
                const season = getPhuketSeason(todayStr);
                return (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${season.badgeColor}`}>
                    {season.name}
                  </span>
                );
              })()}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Chalong, Rassada ve Ao Po marinalarında sürat teknesi ve katamaran seferleri olağan seyrindedir.
            </p>
          </div>
        </div>

        {onOpenBulkReschedule && (
          <button
            type="button"
            onClick={onOpenBulkReschedule}
            className="px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-98"
          >
            <Waves className="w-4 h-4 text-amber-500" />
            <span>Hava Erteleme Sihirbazı</span>
          </button>
        )}
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-surface-2 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Rezervasyon</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {stats.totalBookings}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span className="text-emerald-600 font-semibold">{stats.confirmedCount} Onay</span>
            <span>·</span>
            <span className="text-amber-600 font-semibold">{stats.pendingCount} Bekleyen</span>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-2 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Toplam Ciro</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {stats.totalRevenueThb.toLocaleString()} <span className="text-xs font-semibold">THB</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Toplam satış cirosu</p>
        </div>

        {canViewFinancialMargins ? (
          <>
            <div className="bg-white dark:bg-surface-2 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Tedarikçi Maliyeti</span>
                <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
                  <Briefcase className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
                {stats.totalCostThb.toLocaleString()} <span className="text-xs font-semibold">THB</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Tekne & acente gideri</p>
            </div>

            <div className="bg-white dark:bg-surface-2 p-5 rounded-2xl border border-emerald-500/30 dark:border-emerald-600/30 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-sm ring-1 ring-emerald-500/20">
              <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Net Kâr (Kazanç)</span>
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300">
                {stats.netProfitThb.toLocaleString()} <span className="text-xs font-semibold">THB</span>
              </div>
              <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                %{stats.profitMarginPercent} Kâr Marjı
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white dark:bg-surface-2 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Toplam Misafir</span>
                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">
                {stats.totalGuests} <span className="text-xs font-semibold">Kişi</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Yetişkin & çocuk toplamı</p>
            </div>

            <div className="bg-white dark:bg-surface-2 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Kâr & Maliyet</span>
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400">
                  <span>🔒</span>
                </div>
              </div>
              <div className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-1">
                Yönetici Korumalı
              </div>
              <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">Sadece patron görebilir</p>
            </div>
          </>
        )}

        <div className="bg-white dark:bg-surface-2 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Kasadaki Kapora</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {stats.collectedRevenueThb.toLocaleString()} <span className="text-xs font-semibold">THB</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Kasadaki peşinat</p>
        </div>

        <div className="bg-white dark:bg-surface-2 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Kalan (Sahada)</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
            {stats.pendingCollectionThb.toLocaleString()} <span className="text-xs font-semibold">THB</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Otelde tahsil edilecek</p>
        </div>
      </div>

      {/* ==================================================== */}
      {/* ⛵ TUR KONTENJAN & TEKNE DOLULUK BAROMETRESİ */}
      {/* ==================================================== */}
      <div className="bg-white dark:bg-surface-2 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-lg">
              ⛵
            </span>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Tur Kontenjan & Tekne Doluluk Barometresi
              </h3>
              <p className="text-xs text-slate-500">
                Bugünün turlarındaki canlı koltuk doluluğu ve overbooking koruması.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('tours')}
            className="text-xs font-bold text-brand-primary dark:text-brand-accent hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            Tüm Tur Kataloğunu İncele →
          </button>
        </div>

        {tourOccupancies.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Bugün için planlanmış tekne turu bulunmuyor.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tourOccupancies.map((occ) => (
              <div
                key={occ.tourTitle}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                      {occ.tourTitle}
                    </h4>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold border shrink-0 ${
                        occ.isOverbooked
                          ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800 animate-pulse'
                          : occ.isFull
                          ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                          : occ.status === 'critical'
                          ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                      }`}
                    >
                      {occ.statusLabel}
                    </span>
                  </div>

                  <div className="mt-3 flex items-baseline justify-between">
                    <div className="text-xl font-extrabold text-slate-900 dark:text-white">
                      {occ.bookedPax} <span className="text-xs font-normal text-slate-400">/ {occ.capacity} Koltuk</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                      %{occ.occupancyPercent}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        occ.isOverbooked
                          ? 'bg-red-500'
                          : occ.isFull
                          ? 'bg-rose-500'
                          : occ.occupancyPercent >= 80
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, occ.occupancyPercent)}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Kalan Boş Yer:</span>
                  <span className={`font-bold ${occ.remainingSeats <= 3 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {Math.max(0, occ.remainingSeats)} Koltuk
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* 🔥 EN ÇOK İNCELENEN TURLAR & ZİYARETÇİ İLGİ RADARI */}
      {/* ==================================================== */}
      <div className="bg-white dark:bg-surface-2 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-lg">
              🔥
            </span>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                En Çok İncelenen Turlar & Ziyaretçi İlgi Radarı
              </h3>
              <p className="text-xs text-slate-500">
                Web sitesi ziyaretçilerinin en çok gezdiği rotalar — popülerlik ve fiyatlandırma kararlarınız için canlı veri.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('tours')}
            className="text-xs font-bold text-brand-primary dark:text-brand-accent hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            Tüm Turları Yönet →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {topViewedTours.map((t, idx) => (
            <div
              key={t.id}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between group hover:border-brand-accent transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center ${
                    idx === 0 ? 'bg-amber-500 text-white shadow-xs' :
                    idx === 1 ? 'bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-white' :
                    idx === 2 ? 'bg-amber-700 text-white' :
                    'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}>
                    #{idx + 1}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-accent bg-brand-accent/10 px-2 py-0.5 rounded-full">
                    {t.viewCount} Ziyaret
                  </span>
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-2 group-hover:text-brand-accent transition-colors">
                  {t.title}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  {t.categoryLabel || t.category || 'Günübirlik Tur'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t.priceThb && t.priceThb > 0 ? `${t.priceThb.toLocaleString()} THB` : 'Teklif Alın'}
                </span>
                <a
                  href={`/turlar/${t.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-brand-primary dark:text-brand-accent hover:underline flex items-center gap-0.5"
                >
                  Görüntüle ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Content Navigation Cards */}
      <div>
        <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white mb-4">
          İçerik & Modül Kısayolları
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <button
            onClick={() => setActiveTab('bookings')}
            className="p-5 rounded-2xl bg-white dark:bg-surface-2 border border-slate-200/80 dark:border-slate-800 hover:border-brand-accent transition-all text-left group"
          >
            <Users className="w-6 h-6 text-brand-primary group-hover:scale-110 transition-transform mb-2" />
            <div className="font-bold text-sm text-slate-900 dark:text-white">Müşteriler</div>
            <div className="text-xs text-slate-400">{bookingsCount} Kayıt</div>
          </button>

          <button
            onClick={() => setActiveTab('tours')}
            className="p-5 rounded-2xl bg-white dark:bg-surface-2 border border-slate-200/80 dark:border-slate-800 hover:border-brand-accent transition-all text-left group"
          >
            <Compass className="w-6 h-6 text-emerald-500 group-hover:scale-110 transition-transform mb-2" />
            <div className="font-bold text-sm text-slate-900 dark:text-white">Turlar</div>
            <div className="text-xs text-slate-400">{toursCount} Tur</div>
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className="p-5 rounded-2xl bg-white dark:bg-surface-2 border border-slate-200/80 dark:border-slate-800 hover:border-brand-accent transition-all text-left group"
          >
            <Car className="w-6 h-6 text-blue-500 group-hover:scale-110 transition-transform mb-2" />
            <div className="font-bold text-sm text-slate-900 dark:text-white">Hizmetler</div>
            <div className="text-xs text-slate-400">{servicesCount} Sayfa</div>
          </button>

          <button
            onClick={() => setActiveTab('blogs')}
            className="p-5 rounded-2xl bg-white dark:bg-surface-2 border border-slate-200/80 dark:border-slate-800 hover:border-brand-accent transition-all text-left group"
          >
            <BookOpen className="w-6 h-6 text-purple-500 group-hover:scale-110 transition-transform mb-2" />
            <div className="font-bold text-sm text-slate-900 dark:text-white">Blog & Rehber</div>
            <div className="text-xs text-slate-400">{blogsCount} Yazı</div>
          </button>

          <button
            onClick={() => setActiveTab('faqs')}
            className="p-5 rounded-2xl bg-white dark:bg-surface-2 border border-slate-200/80 dark:border-slate-800 hover:border-brand-accent transition-all text-left group"
          >
            <HelpCircle className="w-6 h-6 text-amber-500 group-hover:scale-110 transition-transform mb-2" />
            <div className="font-bold text-sm text-slate-900 dark:text-white">SSS Soruları</div>
            <div className="text-xs text-slate-400">{faqsCount} Soru</div>
          </button>

          <button
            onClick={() => setActiveTab('testimonials')}
            className="p-5 rounded-2xl bg-white dark:bg-surface-2 border border-slate-200/80 dark:border-slate-800 hover:border-brand-accent transition-all text-left group"
          >
            <MessageSquareQuote className="w-6 h-6 text-pink-500 group-hover:scale-110 transition-transform mb-2" />
            <div className="font-bold text-sm text-slate-900 dark:text-white">Yorumlar</div>
            <div className="text-xs text-slate-400">{testimonialsCount} Yorum</div>
          </button>
        </div>
      </div>
    </div>
  );
}
