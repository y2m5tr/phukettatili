import { Building, FileText, Filter } from 'lucide-react';
import { fmtMoney } from '../../../lib/moneyFormat';
import type { SupplierGroup } from './types';

export interface SupplierGroupsGridProps {
  supplierGroups: SupplierGroup[];
  onStatement: (supplier: string) => void;
  onFilterSupplier: (supplier: string) => void;
}

// TEDARİKÇİ BAZINDA HAKEDİŞ ÖZETİ KARTLARI — birebir taşındı.
export default function SupplierGroupsGrid({
  supplierGroups,
  onStatement,
  onFilterSupplier,
}: SupplierGroupsGridProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
        <Building className="w-4 h-4 text-amber-500" />
        <span>Tedarikçi Borç & Hakediş Dağılımı ({supplierGroups.length} Firma)</span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {supplierGroups.map((g) => (
          <div
            key={g.supplier}
            className="bg-white dark:bg-surface-2 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-amber-500/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                  {g.supplier}
                </h4>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                  {g.toursCount} Tur · {g.pax} PAX
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Ödenecek Borç</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400 text-base">
                    {fmtMoney(g.totalCost)} THB
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Acenta Kârı</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-base">
                    {fmtMoney(g.netProfit)} THB
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
              <button
                type="button"
                onClick={() => onStatement(g.supplier)}
                className="flex-1 py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Mutabakat Fişi</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onFilterSupplier(g.supplier);
                }}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                title="Bu tedarikçiyi filtrele"
              >
                <Filter className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
