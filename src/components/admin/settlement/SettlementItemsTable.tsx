import { useState } from 'react';
import { Edit2, Search } from 'lucide-react';
import { fmtMoney } from '../../../lib/moneyFormat';
import type { SettlementItem } from './types';

export interface SettlementItemsTableProps {
  filteredItems: SettlementItem[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  // true dönerse satır içi düzenleme kapatılır (orijinal davranış:
  // onUpdateBooking yokken düzenleme açık kalırdı).
  onSaveCost: (item: SettlementItem, newCost: number) => boolean;
}

// DETAYLI KALEMLER TABLOSU — SupplierSettlementManager'dan birebir taşındı.
// Satır içi maliyet düzenleme durumu (editingItem) yalnızca bu tabloda
// kullanıldığı için tabloya taşındı.
export default function SettlementItemsTable({
  filteredItems,
  searchQuery,
  onSearchChange,
  onSaveCost,
}: SettlementItemsTableProps) {
  const [editingItem, setEditingItem] = useState<{ bookingId: string; tourIndex: number; cost: number } | null>(null);

  const handleSaveCost = (item: SettlementItem, newCost: number) => {
    if (onSaveCost(item, newCost)) {
      setEditingItem(null);
    }
  };

  return (
    <div className="bg-white dark:bg-surface-2 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            Tüm Tur & Hakediş Kayıtları ({filteredItems.length})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rezervasyon veya Misafir Ara..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none w-56"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] uppercase font-bold text-slate-500">
            <tr>
              <th className="py-3.5 px-4">Tarih</th>
              <th className="py-3.5 px-4">Rezervasyon / Misafir</th>
              <th className="py-3.5 px-4">Tur Başlığı</th>
              <th className="py-3.5 px-4">Tedarikçi</th>
              <th className="py-3.5 px-4 text-center">PAX</th>
              <th className="py-3.5 px-4 text-right">Satış (THB)</th>
              <th className="py-3.5 px-4 text-right">Hakediş Maliyeti (THB)</th>
              <th className="py-3.5 px-4 text-right">Net Kâr</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  Seçilen filtrelerde hakediş kaydı bulunamadı.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={`${item.bookingId}-${item.tourIndex}`} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono font-medium whitespace-nowrap">
                    {item.tourDate}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {item.customerName}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {item.bookingId}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-slate-900 dark:text-white max-w-xs truncate block">
                      {item.tourTitle}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      {item.supplier}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap font-mono font-bold">
                    {item.totalPax}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap font-mono font-bold text-slate-900 dark:text-white">
                    {fmtMoney(item.revenueThb)} ฿
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap font-mono font-bold text-rose-600 dark:text-rose-400">
                    {editingItem && editingItem.bookingId === item.bookingId && editingItem.tourIndex === item.tourIndex ? (
                      <div className="flex items-center justify-end gap-1">
                        <input
                          type="number"
                          defaultValue={item.costThb}
                          id={`cost-input-${item.bookingId}`}
                          className="w-20 px-1.5 py-0.5 rounded border border-amber-500 text-xs font-mono text-slate-900 dark:text-white bg-white dark:bg-slate-900"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const el = document.getElementById(`cost-input-${item.bookingId}`) as HTMLInputElement;
                            if (el) handleSaveCost(item, Number(el.value) || 0);
                          }}
                          className="px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold"
                        >
                          ✓
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-1.5 group">
                        <span>{fmtMoney(item.costThb)} ฿</span>
                        <button
                          type="button"
                          onClick={() =>
                            setEditingItem({
                              bookingId: item.bookingId,
                              tourIndex: item.tourIndex,
                              cost: item.costThb,
                            })
                          }
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-amber-500 transition-opacity"
                          title="Maliyeti Düzenle"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    +{fmtMoney(item.profitThb)} ฿
                    <span className="text-[10px] text-slate-400 ml-1 font-sans">
                      (%{item.marginPercent})
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
