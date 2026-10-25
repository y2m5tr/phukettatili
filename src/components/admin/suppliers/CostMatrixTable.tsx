import { Edit2, Search, Ship, Trash2 } from 'lucide-react';
import type { TourCostItem, TourItem } from '../../../data/adminInitialData';
import { fmtMoney } from '../../../lib/moneyFormat';

export interface CostMatrixTableProps {
  filteredCosts: TourCostItem[];
  tours: TourItem[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onEditCost: (cost: TourCostItem) => void;
  onDeleteCost: (id: string, title: string) => void;
}

// GÖRÜNÜM A: NET ALIŞ FİYAT KATALOĞU (COST MATRIX) — SuppliersTab'den birebir taşındı.
export default function CostMatrixTable({
  filteredCosts,
  tours,
  searchQuery,
  onSearchChange,
  onEditCost,
  onDeleteCost,
}: CostMatrixTableProps) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tur adı veya tedarikçi firma ara..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-surface-2 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none"
        />
      </div>

      <div className="bg-white dark:bg-surface-2 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/40 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Tur Adı</th>
                <th className="py-3.5 px-4">Tedarikçi Firma</th>
                <th className="py-3.5 px-4">Net Alış (Yetişkin)</th>
                <th className="py-3.5 px-4">Net Alış (Çocuk)</th>
                <th className="py-3.5 px-4">Satış Liste Fiyatı</th>
                <th className="py-3.5 px-4">Tahmini Net Marj</th>
                <th className="py-3.5 px-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCosts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Net alış maliyeti bulunamadı. Üstteki butonla yeni ekleyebilirsiniz.
                  </td>
                </tr>
              ) : (
                filteredCosts.map((c) => {
                  const matchedTour = tours.find(
                    (t) => t.id === c.tourId || t.title === c.tourTitle
                  );
                  const salePrice = matchedTour?.priceThb || 0;
                  const profitPerAdult = Math.max(0, salePrice - c.netCostAdultThb);
                  const marginPercent =
                    salePrice > 0 ? Math.round((profitPerAdult / salePrice) * 100) : 0;

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-900/30 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {c.tourTitle}
                        </span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          {c.nationalParkFeeIncluded ? '✅ Milli Park Dahil' : '⚠️ Milli Park Hariç'}
                          {c.notes ? ` · ${c.notes}` : ''}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                          <Ship className="w-3.5 h-3.5 text-sky-500" />
                          <span>{c.supplierName}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-rose-600 dark:text-rose-400">
                        {fmtMoney(c.netCostAdultThb)} THB
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                        {fmtMoney(c.netCostChildThb)} THB
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {salePrice > 0 ? `${fmtMoney(salePrice)} THB` : '—'}
                      </td>

                      <td className="py-3.5 px-4">
                        {salePrice > 0 ? (
                          <div>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 block font-mono">
                              +{fmtMoney(profitPerAdult)} THB
                            </span>
                            <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                              %{marginPercent} Kâr Marjı
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onEditCost(c)}
                            title="Düzenle"
                            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteCost(c.id, c.tourTitle)}
                            title="Sil"
                            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500 hover:border-rose-300 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
