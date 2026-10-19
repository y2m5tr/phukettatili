import { Fuel, Plus, X } from 'lucide-react';
import {
  type ExpenseRecord,
  EXPENSE_CATEGORY_LABELS,
} from '../../../data/adminInitialData';
import type { FinancialBreakdown } from '../../../lib/profitability';
import { VAULT_ACCOUNTS } from './vaultTypes';

interface ExpensesPanelProps {
  financialBreakdown: FinancialBreakdown;
  expenses: ExpenseRecord[];
  setIsExpenseModalOpen: (open: boolean) => void;
  onDeleteExpense: (id: string) => void;
}

export default function ExpensesPanel({
  financialBreakdown,
  expenses,
  setIsExpenseModalOpen,
  onDeleteExpense,
}: ExpensesPanelProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Aksiyon */}
      <div className="bg-white dark:bg-surface-2 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Fuel className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            <span>Akıllı Gider, Yakıt & Kârlılık Takibi</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Minibüs yakıtı, şoför/rehber yevmiyeleri, liman harçları ve operasyonel harcamaları kaydedin; net faaliyet kârını anında görün.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsExpenseModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-md shadow-rose-950/30 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Harcama / Fiş Gir</span>
          </button>
        </div>
      </div>

      {/* 4'lü Kârlılık ve Harcama Barometresi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Ciro */}
        <div className="bg-white dark:bg-surface-2 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Toplam Tur Satış Hacmi
          </span>
          <span className="text-2xl font-black text-slate-900 dark:text-white font-mono block">
            {financialBreakdown.totalRevenueThb.toLocaleString()} THB
          </span>
          <span className="text-xs text-slate-500 mt-1 block">Tüm onaylı tur cirosu</span>
        </div>

        {/* 2. Tedarikçi & Komisyon Maliyeti */}
        <div className="bg-white dark:bg-surface-2 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Tedarikçi & Komisyonlar
          </span>
          <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono block">
            -{(financialBreakdown.totalSupplierCostThb + financialBreakdown.totalCommissionThb).toLocaleString()} THB
          </span>
          <span className="text-xs text-slate-500 mt-1 block">
            Tekne alış: {financialBreakdown.totalSupplierCostThb.toLocaleString()} + Acente kom: {financialBreakdown.totalCommissionThb.toLocaleString()}
          </span>
        </div>

        {/* 3. Operasyonel Saha Giderleri */}
        <div className="bg-white dark:bg-surface-2 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Saha & Araç Harcamaları
          </span>
          <span className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono block">
            -{financialBreakdown.totalOperatingExpensesThb.toLocaleString()} THB
          </span>
          <span className="text-xs text-slate-500 mt-1 block">
            Yakıt, yevmiye ve liman harçları
          </span>
        </div>

        {/* 4. Net Faaliyet Kârı */}
        <div className="bg-white dark:bg-surface-2 p-5 rounded-3xl border border-emerald-500/30 dark:border-emerald-500/30 shadow-sm bg-emerald-500/5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Net İşletme Kârı
            </span>
            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-mono">
              %{financialBreakdown.profitMarginPercent} Marj
            </span>
          </div>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono block">
            +{financialBreakdown.netOperatingProfitThb.toLocaleString()} THB
          </span>
          <span className="text-xs text-slate-500 mt-1 block">
            Tüm maliyetler sonrası net nakit kâr
          </span>
        </div>
      </div>

      {/* Gider Tablosu */}
      <div className="bg-white dark:bg-surface-2 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Kaydedilen Harcama Fişleri ({expenses.length})
          </h4>
          <span className="text-xs text-slate-400 font-mono">
            Toplam Gider: {financialBreakdown.totalOperatingExpensesThb.toLocaleString()} THB
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Fiş No & Tarih</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Harcama Açıklaması</th>
                <th className="py-3 px-4">İlgili Araç / Tur</th>
                <th className="py-3 px-4">Ödenen Kasa</th>
                <th className="py-3 px-4">Tutar (THB)</th>
                <th className="py-3 px-4 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Henüz gider kaydı bulunmuyor. Yeni harcama eklemek için yukarıdaki butonu kullanabilirsiniz.
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => {
                  const cat = EXPENSE_CATEGORY_LABELS[exp.category] || { label: exp.category, icon: '📦' };
                  const vault = VAULT_ACCOUNTS[exp.paidFromAccount];
                  return (
                    <tr key={exp.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-900 dark:text-white block">{exp.id}</span>
                        <span className="text-[10px] text-slate-400">{exp.date}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          <span>{cat.icon}</span>
                          <span>{cat.label}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-800 dark:text-slate-200 block">{exp.title}</span>
                        {exp.note && <span className="text-[10px] text-slate-400 block mt-0.5">{exp.note}</span>}
                      </td>
                      <td className="py-3.5 px-4">
                        {exp.assignedVehicle ? (
                          <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 block">
                            🚐 {exp.assignedVehicle}
                          </span>
                        ) : exp.assignedTour ? (
                          <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 block">
                            🏝️ {exp.assignedTour}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Genel Merkez</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          <span>{vault?.icon || '🏦'}</span>
                          <span>{vault?.name || exp.paidFromAccount}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-black text-rose-600 dark:text-rose-400">
                        -{exp.amountThb.toLocaleString()} THB
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => onDeleteExpense(exp.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                          title="Gider Kaydını Sil"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
