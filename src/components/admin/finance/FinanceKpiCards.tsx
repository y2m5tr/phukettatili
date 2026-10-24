import { DollarSign, TrendingUp, AlertCircle, Wallet } from 'lucide-react';
import { fmtMoney } from '../../../lib/moneyFormat';

interface FinanceKpiCardsProps {
  totalRevenue: number;
  totalCollected: number;
  collectionRate: number;
  totalOutstanding: number;
  outstandingCount: number;
  cashThb: number;
  promptpayThb: number;
  netProfit: number;
  profitMargin: number;
  totalCost: number;
  onOpenOutstanding: () => void;
}

/** Ust finansal KPI kartlari (presentational; FinanceTab'dan tasindi). */
export default function FinanceKpiCards({
  totalRevenue,
  totalCollected,
  collectionRate,
  totalOutstanding,
  outstandingCount,
  cashThb,
  promptpayThb,
  netProfit,
  profitMargin,
  totalCost,
  onOpenOutstanding,
}: FinanceKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: Toplam Ciro & Tahsilat Oranı */}
      <div className="bg-white dark:bg-surface-2 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Toplam Satış Cirosu
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900 dark:text-white font-serif">
          {fmtMoney(totalRevenue)}{' '}
          <span className="text-xs font-sans text-slate-400 font-semibold">THB</span>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">Tahsil Edilen:</span>
          <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
            {fmtMoney(totalCollected)} THB (%{collectionRate})
          </span>
        </div>
        {/* Progress bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, collectionRate)}%` }}
          />
        </div>
      </div>

      {/* KPI 2: Açık Bakiye (Alacaklar) */}
      <div
        onClick={onOpenOutstanding}
        className="bg-white dark:bg-surface-2 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden cursor-pointer hover:border-amber-300 dark:hover:border-amber-700 transition-all group"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Tahsil Edilecek Açık Bakiye
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-serif">
          {fmtMoney(totalOutstanding)}{' '}
          <span className="text-xs font-sans text-slate-400 font-semibold">THB</span>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">Bekleyen Misafir:</span>
          <span className="font-extrabold text-slate-800 dark:text-slate-200 group-hover:text-amber-600 transition-colors">
            {outstandingCount} Rezervasyon →
          </span>
        </div>
      </div>

      {/* KPI 3: Nakit El Kasası (THB) */}
      <div className="bg-white dark:bg-surface-2 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Nakit El Kasası (THB)
          </span>
          <div className="w-8 h-8 rounded-xl bg-brand-primary/10 text-brand-primary dark:text-brand-accent flex items-center justify-center font-bold">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900 dark:text-white font-serif">
          {fmtMoney(cashThb)}{' '}
          <span className="text-xs font-sans text-slate-400 font-semibold">THB</span>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">PromptPay QR:</span>
          <span className="font-extrabold text-sky-600 dark:text-sky-400">
            {fmtMoney(promptpayThb)} THB
          </span>
        </div>
      </div>

      {/* KPI 4: Net Acenta Kârı */}
      <div className="bg-white dark:bg-surface-2 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Tahmini Net Acenta Kârı
          </span>
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-serif">
          {fmtMoney(netProfit)}{' '}
          <span className="text-xs font-sans text-slate-400 font-semibold">THB</span>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">Net Kâr Marjı:</span>
          <span className="font-extrabold text-slate-800 dark:text-slate-200">
            %{profitMargin} (Maliyet: {fmtMoney(totalCost)} THB)
          </span>
        </div>
      </div>
    </div>
  );
}
