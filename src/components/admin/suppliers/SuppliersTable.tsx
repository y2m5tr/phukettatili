import { Edit2, Phone, Search, Trash2 } from 'lucide-react';
import type { SupplierItem } from '../../../data/adminInitialData';
import { SUPPLIER_CATEGORY_LABELS } from './categoryLabels';

export interface SuppliersTableProps {
  suppliers: SupplierItem[];
  filteredSuppliers: SupplierItem[];
  searchQuery: string;
  categoryFilter: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onEditSupplier: (supplier: SupplierItem) => void;
  onDeleteSupplier: (id: string, name: string) => void;
}

// GÖRÜNÜM B: TEDARİKÇİ FİRMALAR (SuppliersTab'den birebir taşındı)
export default function SuppliersTable({
  suppliers,
  filteredSuppliers,
  searchQuery,
  categoryFilter,
  onSearchChange,
  onCategoryChange,
  onEditSupplier,
  onDeleteSupplier,
}: SuppliersTableProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Firma adı, iskele, yetkili veya telefon ara..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-surface-2 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-surface-2 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none"
        >
          <option value="all">Tüm Kategoriler ({suppliers.length})</option>
          {Object.entries(SUPPLIER_CATEGORY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v.icon} {v.label}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white dark:bg-surface-2 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/40 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Tedarikçi Firma</th>
                <th className="py-3.5 px-4">Kategori & İskele</th>
                <th className="py-3.5 px-4">İletişim & WhatsApp</th>
                <th className="py-3.5 px-4">Ödeme Koşulları</th>
                <th className="py-3.5 px-4">Banka / PromptPay</th>
                <th className="py-3.5 px-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Arama kriterlerine uygun tedarikçi firma bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((s) => {
                  const cat = SUPPLIER_CATEGORY_LABELS[s.category] || {
                    label: s.category,
                    icon: '🌴',
                  };

                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-900/30 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {s.name}
                        </span>
                        {s.notes && (
                          <span className="text-[11px] text-slate-400 block truncate max-w-xs">
                            {s.notes}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          <span>{cat.icon}</span>
                          <span>{cat.label}</span>
                        </span>
                        <span className="text-xs text-slate-600 dark:text-slate-300 block mt-1">
                          📍 {s.pierOrLocation}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {s.contactPerson && (
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                            {s.contactPerson}
                          </span>
                        )}
                        <a
                          href={`https://wa.me/${s.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 mt-0.5"
                        >
                          <Phone className="w-3 h-3" /> {s.phone}
                        </a>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                          {s.paymentTerms === 'weekly_friday'
                            ? 'Haftalık Cuma Mutabakatı'
                            : s.paymentTerms === 'monthly_invoice'
                            ? 'Aylık Fatura'
                            : s.paymentTerms === 'cash_at_pier'
                            ? 'İskelede Peşin'
                            : 'Tur Bazında'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-xs text-slate-600 dark:text-slate-400 font-mono block">
                          {s.bankDetails || '—'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onEditSupplier(s)}
                            title="Düzenle"
                            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteSupplier(s.id, s.name)}
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
