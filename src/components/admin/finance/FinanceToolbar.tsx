import { Receipt, AlertCircle, Wallet, Car, Fuel, Download, Plus } from 'lucide-react';

export type FinanceSubTab = 'ledger' | 'outstanding' | 'accounts' | 'driver_handover' | 'expenses';

interface FinanceToolbarProps {
  subTab: FinanceSubTab;
  setSubTab: (t: FinanceSubTab) => void;
  ledgerCount: number;
  outstandingCount: number;
  expenseCount: number;
  onExportCSV: () => void;
  onQuickCollect: () => void;
}

/** Alt sekme degistirici + hizli eylemler (presentational; FinanceTab'dan tasindi). */
export default function FinanceToolbar({
  subTab,
  setSubTab,
  ledgerCount,
  outstandingCount,
  expenseCount,
  onExportCSV,
  onQuickCollect,
}: FinanceToolbarProps) {
  return (
    <div className="bg-white dark:bg-surface-2 p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Alt Sekme Değiştirici */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 self-start md:self-auto">
        <button
          type="button"
          onClick={() => setSubTab('ledger')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            subTab === 'ledger'
              ? 'bg-white dark:bg-surface-1 text-slate-900 dark:text-white shadow-2xs font-extrabold'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Kasa Defteri ({ledgerCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('outstanding')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            subTab === 'outstanding'
              ? 'bg-amber-500 text-white shadow-2xs font-extrabold'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Otel Tahsilatları ({outstandingCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('accounts')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            subTab === 'accounts'
              ? 'bg-white dark:bg-surface-1 text-slate-900 dark:text-white shadow-2xs font-extrabold'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>Kasa Hesapları</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('driver_handover')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            subTab === 'driver_handover'
              ? 'bg-purple-600 text-white shadow-2xs font-extrabold'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Car className="w-3.5 h-3.5" />
          <span>Şoför Z-Raporu & Teslimat</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('expenses')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            subTab === 'expenses'
              ? 'bg-rose-600 text-white shadow-2xs font-extrabold'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Fuel className="w-3.5 h-3.5" />
          <span>Gider & Yakıt ({expenseCount})</span>
        </button>
      </div>

      {/* Sağ Butonlar: Tahsilat Al + Dışa Aktar */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onExportCSV}
          className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5"
          title="Kasa defterini Excel / CSV olarak indir"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">CSV İndir</span>
        </button>

        <button
          type="button"
          onClick={onQuickCollect}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Yeni Tahsilat Girişi</span>
        </button>
      </div>
    </div>
  );
}
