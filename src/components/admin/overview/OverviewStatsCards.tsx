import React from 'react';
import {
  Calendar,
  DollarSign,
  Briefcase,
  TrendingUp,
  CheckCircle2,
  Clock,
  Users,
  Waves,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import type { AdminTab } from '../AdminDashboard';
import type { Booking } from '../../../data/adminInitialData';
import { getPhuketSeason } from '../../../data/adminInitialData';
import { fmtMoney } from '../../../lib/moneyFormat';
import type { OverviewStats } from './overviewTypes';

interface OverviewStatsCardsProps {
  stats: OverviewStats;
  todayStr: string;
  overdueBookings: Booking[];
  overdueAmountThb: number;
  canViewFinancialMargins?: boolean;
  setActiveTab: (tab: AdminTab) => void;
  onOpenBulkReschedule?: () => void;
}

export const OverviewStatsCards: React.FC<OverviewStatsCardsProps> = ({
  stats,
  todayStr,
  overdueBookings,
  overdueAmountThb,
  canViewFinancialMargins = true,
  setActiveTab,
  onOpenBulkReschedule,
}) => {
  return (
    <div className="space-y-6">
      {/* OPERASYONEL DİKKAT: BEKLEYEN TALEPLER & GECİKEN TAHSİLATLAR */}
      {(stats.pendingCount > 0 || overdueBookings.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.pendingCount > 0 && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-800 dark:text-amber-300">
                    {stats.pendingCount} Bekleyen Rezervasyon Talebi
                  </div>
                  <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 mt-0.5">
                    İnceleme bekleyen web/WhatsApp talepleri
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('bookings')}
                className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
              >
                <span>İncele</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}

          {overdueBookings.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-rose-800 dark:text-rose-300">
                    {overdueBookings.length} Geciken Tahsilat Kaydı
                  </div>
                  <p className="text-[11px] text-rose-700/80 dark:text-rose-400/80 mt-0.5 font-mono">
                    Toplam {fmtMoney(overdueAmountThb)} THB tahsil edilmedi
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('finance')}
                className="px-3 py-1.5 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
              >
                <span>Kasaya Git</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* PHUKET DENİZ GÜVENLİK RADARI & AKTİF SEZON GÖSTERGESİ */}
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
            {fmtMoney(stats.totalRevenueThb)} <span className="text-xs font-semibold">THB</span>
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
                {fmtMoney(stats.totalCostThb)} <span className="text-xs font-semibold">THB</span>
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
                {fmtMoney(stats.netProfitThb)} <span className="text-xs font-semibold">THB</span>
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
            {fmtMoney(stats.collectedRevenueThb)} <span className="text-xs font-semibold">THB</span>
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
            {fmtMoney(stats.pendingCollectionThb)} <span className="text-xs font-semibold">THB</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Otelde tahsil edilecek</p>
        </div>
      </div>
    </div>
  );
};
