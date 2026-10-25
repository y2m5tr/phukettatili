import { DollarSign, MapPin, Ship, TrendingUp } from 'lucide-react';
import type { SupplierItem, TourCostItem } from '../../../data/adminInitialData';
import { fmtMoney } from '../../../lib/moneyFormat';

export interface SuppliersKpiCardsProps {
  suppliers: SupplierItem[];
  tourCosts: TourCostItem[];
}

// ÜST KPI KARTLARI (SuppliersTab'den birebir taşındı)
export default function SuppliersKpiCards({ suppliers, tourCosts }: SuppliersKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: Tedarikçi Sayısı */}
      <div className="bg-white dark:bg-surface-2 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Anlaşmalı Tedarikçiler
          </span>
          <div className="w-8 h-8 rounded-xl bg-brand-primary/10 text-brand-primary dark:text-brand-accent flex items-center justify-center font-bold">
            <Ship className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900 dark:text-white font-serif">
          {suppliers.length}{' '}
          <span className="text-xs font-sans text-slate-400 font-semibold">Firma</span>
        </div>
        <div className="mt-2 text-xs text-slate-500">
          Tekne, macera, şov ve safari operatörleri
        </div>
      </div>

      {/* KPI 2: Fiyat Kataloğu Kalem Sayısı */}
      <div className="bg-white dark:bg-surface-2 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Net Alış Kataloğu
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900 dark:text-white font-serif">
          {tourCosts.length}{' '}
          <span className="text-xs font-sans text-slate-400 font-semibold">Tur Maliyeti</span>
        </div>
        <div className="mt-2 text-xs text-slate-500">
          Rezervasyonlarda otomatik kâr hesaplar
        </div>
      </div>

      {/* KPI 3: Ortalama Yetişkin Net Alışı */}
      <div className="bg-white dark:bg-surface-2 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Ort. Net Tur Alışı
          </span>
          <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-sky-600 dark:text-sky-400 font-serif">
          {tourCosts.length > 0
            ? fmtMoney(Math.round(
                tourCosts.reduce((acc, c) => acc + c.netCostAdultThb, 0) / tourCosts.length
              ))
            : 0}{' '}
          <span className="text-xs font-sans text-slate-400 font-semibold">THB</span>
        </div>
        <div className="mt-2 text-xs text-slate-500">
          Kişi başı ortalama acenta maliyeti
        </div>
      </div>

      {/* KPI 4: Çıkış İskeleleri */}
      <div className="bg-white dark:bg-surface-2 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Aktif İskele & Marinalar
          </span>
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <MapPin className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-serif">
          {new Set(suppliers.map((s) => s.pierOrLocation)).size}{' '}
          <span className="text-xs font-sans text-slate-400 font-semibold">Nokta</span>
        </div>
        <div className="mt-2 text-xs text-slate-500">
          Rassada, Ao Po, Chalong vb.
        </div>
      </div>
    </div>
  );
}
