import { ArrowUpRight, Building, DollarSign, Receipt, TrendingUp, Users } from 'lucide-react';
import { fmtMoney } from '../../../lib/moneyFormat';
import type { SettlementTotals } from './types';

export interface SettlementKpiCardsProps {
  totals: SettlementTotals;
}

// FİNANSAL KPI METRİK KARTLARI — SupplierSettlementManager'dan birebir taşındı.
export default function SettlementKpiCards({ totals }: SettlementKpiCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
      {/* Toplam Ciro */}
      <div className="bg-white dark:bg-surface-2 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider">Toplam Satış (Ciro)</span>
          <DollarSign className="w-4 h-4 text-sky-500" />
        </div>
        <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white">
          {fmtMoney(totals.totalRev)} <span className="text-xs font-sans font-bold text-slate-400">THB</span>
        </div>
        <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
          {totals.itemCount} Tur / Rezervasyon
        </span>
      </div>

      {/* Toplam Tedarikçi Hakedişi */}
      <div className="bg-white dark:bg-surface-2 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500 dark:text-rose-400">Tedarikçi Borcu</span>
          <Building className="w-4 h-4 text-rose-500" />
        </div>
        <div className="text-xl sm:text-2xl font-black font-mono text-rose-600 dark:text-rose-400">
          {fmtMoney(totals.totalCost)} <span className="text-xs font-sans font-bold text-slate-400">THB</span>
        </div>
        <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
          Ödenecek Toplam Hakediş
        </span>
      </div>

      {/* Net Acenta Kârı */}
      <div className="bg-white dark:bg-surface-2 p-4 sm:p-5 rounded-2xl border border-emerald-500/30 dark:border-emerald-500/20 bg-gradient-to-br from-emerald-50/50 dark:from-emerald-950/20 to-transparent shadow-2xs">
        <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider">Net Acenta Kârı</span>
          <TrendingUp className="w-4 h-4" />
        </div>
        <div className="text-xl sm:text-2xl font-black font-mono text-emerald-700 dark:text-emerald-300">
          {fmtMoney(totals.totalNetProfit)} <span className="text-xs font-sans font-bold text-emerald-600/70">THB</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>%{totals.marginPct} Kâr Marjı</span>
        </div>
      </div>

      {/* Toplam Yolcu */}
      <div className="bg-white dark:bg-surface-2 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider">Toplam Yolcu (PAX)</span>
          <Users className="w-4 h-4 text-amber-500" />
        </div>
        <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white">
          {totals.totalPax} <span className="text-xs font-sans font-bold text-slate-400">Kişi</span>
        </div>
        <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
          Hakediş Hesaplanan Yolcu
        </span>
      </div>

      {/* Ortalama Yolcu Başı Net Kâr */}
      <div className="bg-white dark:bg-surface-2 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider">PAX Başına Kâr</span>
          <Receipt className="w-4 h-4 text-indigo-500" />
        </div>
        <div className="text-xl sm:text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400">
          {fmtMoney(totals.avgProfitPerPax)} <span className="text-xs font-sans font-bold text-slate-400">THB</span>
        </div>
        <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
          Kişi Başı Ortalama Net Getiri
        </span>
      </div>
    </div>
  );
}
