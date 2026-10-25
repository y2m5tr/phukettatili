import { AlertCircle, Building, DollarSign, Percent } from 'lucide-react';
import type { PartnerAgent } from '../../../data/adminInitialData';
import { fmtMoney } from '../../../lib/moneyFormat';

export interface PartnersKpiCardsProps {
  agents: PartnerAgent[];
  totalPartnerRevenue: number;
  totalEarnedCommission: number;
  totalPaidCommission: number;
  totalOutstandingCommission: number;
}

// ÜST KPI KARTLARI (PartnersTab'ten birebir taşındı)
export default function PartnersKpiCards({
  agents,
  totalPartnerRevenue,
  totalEarnedCommission,
  totalPaidCommission,
  totalOutstandingCommission,
}: PartnersKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: Partner Acenta Sayısı */}
      <div className="bg-white dark:bg-surface-2 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Kayıtlı Partner Acentalar
          </span>
          <div className="w-8 h-8 rounded-xl bg-brand-primary/10 text-brand-primary dark:text-brand-accent flex items-center justify-center font-bold">
            <Building className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900 dark:text-white font-serif">
          {agents.length}{' '}
          <span className="text-xs font-sans text-slate-400 font-semibold">Partner</span>
        </div>
        <div className="mt-2 text-xs text-slate-500">
          {agents.filter((a) => a.active).length} Aktif Acenta & Rehber
        </div>
      </div>

      {/* KPI 2: B2B Satış Cirosu */}
      <div className="bg-white dark:bg-surface-2 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            B2B Partner Satış Cirosu
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900 dark:text-white font-serif">
          {fmtMoney(totalPartnerRevenue)}{' '}
          <span className="text-xs font-sans text-slate-400 font-semibold">THB</span>
        </div>
        <div className="mt-2 text-xs text-slate-500">
          Acentalar üzerinden gelen toplam satış
        </div>
      </div>

      {/* KPI 3: Hak Edilen Toplam Komisyon */}
      <div className="bg-white dark:bg-surface-2 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Hak Edilen Toplam Komisyon
          </span>
          <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
            <Percent className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-sky-600 dark:text-sky-400 font-serif">
          {fmtMoney(totalEarnedCommission)}{' '}
          <span className="text-xs font-sans text-slate-400 font-semibold">THB</span>
        </div>
        <div className="mt-2 text-xs text-slate-500">
          Ödenen: {fmtMoney(totalPaidCommission)} THB
        </div>
      </div>

      {/* KPI 4: Kalan Komisyon Borcu */}
      <div className="bg-white dark:bg-surface-2 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Ödenecek Komisyon Borcu
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-serif">
          {fmtMoney(totalOutstandingCommission)}{' '}
          <span className="text-xs font-sans text-slate-400 font-semibold">THB</span>
        </div>
        <div className="mt-2 text-xs text-slate-500">
          Partnerlere ödenecek bekleyen hakediş
        </div>
      </div>
    </div>
  );
}
