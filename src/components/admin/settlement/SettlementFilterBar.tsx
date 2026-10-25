import { Receipt } from 'lucide-react';

export type SettlementDateFilter = 'all' | 'today' | 'tomorrow' | 'this_week' | 'this_month' | 'custom';

export interface SettlementFilterBarProps {
  dateFilter: SettlementDateFilter;
  onDateFilterChange: (df: SettlementDateFilter) => void;
  startDate: string;
  onStartDateChange: (value: string) => void;
  endDate: string;
  onEndDateChange: (value: string) => void;
  selectedSupplier: string;
  onSelectedSupplierChange: (value: string) => void;
  availableSuppliers: string[];
  statusFilter: 'all' | 'confirmed_only';
  onStatusFilterChange: (value: 'all' | 'confirmed_only') => void;
}

// ÜST FİLTRE VE BAŞLIK KARTI — SupplierSettlementManager'dan birebir taşındı.
export default function SettlementFilterBar({
  dateFilter,
  onDateFilterChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  selectedSupplier,
  onSelectedSupplierChange,
  availableSuppliers,
  statusFilter,
  onStatusFilterChange,
}: SettlementFilterBarProps) {
  return (
    <div className="bg-white dark:bg-surface-2 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Receipt className="w-5 h-5" />
          </span>
          <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
            Tedarikçi Hakediş & Net Kâr Yönetimi
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Tekne, safari, fil kampı ve transfer tedarikçilerine ödenecek hakedişleri takip edin, net kâr marjını hesaplayın ve mutabakat fişleri oluşturun.
        </p>
      </div>

      {/* Hızlı Filtre Butonları */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
          {(['today', 'this_week', 'this_month', 'all'] as const).map((df) => (
            <button
              key={df}
              type="button"
              onClick={() => onDateFilterChange(df)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                dateFilter === df
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {df === 'today' ? 'Bugün' : df === 'this_week' ? 'Bu Hafta' : df === 'this_month' ? 'Bu Ay' : 'Tümü'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-xl text-xs">
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              onStartDateChange(e.target.value);
              onDateFilterChange('custom');
            }}
            className="bg-transparent text-slate-800 dark:text-slate-200 text-xs font-mono font-bold focus:outline-none"
            title="Başlangıç Tarihi"
          />
          <span className="text-slate-400 font-bold">-</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              onEndDateChange(e.target.value);
              onDateFilterChange('custom');
            }}
            className="bg-transparent text-slate-800 dark:text-slate-200 text-xs font-mono font-bold focus:outline-none"
            title="Bitiş Tarihi"
          />
        </div>

        {/* Tedarikçi Seçici */}
        <select
          value={selectedSupplier}
          onChange={(e) => onSelectedSupplierChange(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
        >
          <option value="all">🏢 Tüm Tedarikçiler ({availableSuppliers.length})</option>
          {availableSuppliers.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* Durum Filtresi */}
        <button
          type="button"
          onClick={() => onStatusFilterChange(statusFilter === 'all' ? 'confirmed_only' : 'all')}
          className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
            statusFilter === 'confirmed_only'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
              : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
          }`}
        >
          {statusFilter === 'confirmed_only' ? '✓ Yalnızca Onaylılar' : 'Tüm Durumlar'}
        </button>
      </div>
    </div>
  );
}
