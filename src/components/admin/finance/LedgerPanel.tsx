import { Search } from 'lucide-react';
import {
  type PaymentRecord,
  PAYMENT_METHOD_LABELS,
  COLLECTION_LOCATION_LABELS,
} from '../../../data/adminInitialData';

export type LedgerDateFilter = 'all' | 'today' | 'this_week' | 'this_month';

interface LedgerPanelProps {
  filteredPayments: PaymentRecord[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  methodFilter: string;
  setMethodFilter: (m: string) => void;
  dateFilter: LedgerDateFilter;
  setDateFilter: (d: LedgerDateFilter) => void;
}

export default function LedgerPanel({
  filteredPayments,
  searchQuery,
  setSearchQuery,
  methodFilter,
  setMethodFilter,
  dateFilter,
  setDateFilter,
}: LedgerPanelProps) {
  return (
    <div className="space-y-4">
      {/* Arama & Filtre Çubuğu */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Misafir adı, tur, makbuz no veya şoför ara..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-surface-2 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-surface-2 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none font-medium"
        >
          <option value="all">Tüm Ödeme Yöntemleri</option>
          <option value="cash_thb">💵 Nakit THB (El Kasası)</option>
          <option value="promptpay">📱 PromptPay (K-Bank QR)</option>
          <option value="tr_bank_transfer">🇹🇷 TR Banka Havale / EFT</option>
          <option value="kbank_transfer">🏦 Tayland Banka Havalesi</option>
          <option value="credit_card">💳 Kredi Kartı / POS</option>
          <option value="wise">🌐 Wise / Uluslararası</option>
        </select>

        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value as LedgerDateFilter)}
          className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-surface-2 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none font-medium"
        >
          <option value="all">Tüm Tarihler</option>
          <option value="today">Bugün</option>
          <option value="this_week">Son 7 Gün</option>
          <option value="this_month">Bu Ay</option>
        </select>
      </div>

      {/* Hareket Tablosu */}
      <div className="bg-white dark:bg-surface-2 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/40 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Makbuz / Tarih</th>
                <th className="py-3.5 px-4">Misafir & Tur</th>
                <th className="py-3.5 px-4">Kasa / Yöntem</th>
                <th className="py-3.5 px-4">Tahsil Eden & Nokta</th>
                <th className="py-3.5 px-4 text-right">Tahsil Edilen Tutar</th>
                <th className="py-3.5 px-4">Not / Açıklama</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Arama kriterlerine uygun tahsilat kaydı bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const methodInfo = PAYMENT_METHOD_LABELS[p.method] || {
                    label: p.method,
                    icon: '💵',
                  };
                  const locLabel =
                    COLLECTION_LOCATION_LABELS[p.collectionLocation || 'other'];

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-900/30 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-900 dark:text-white block">
                          {p.receiptNo || p.id}
                        </span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          {new Date(p.collectedAt).toLocaleString('tr-TR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {p.customerName || 'Misafir'}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 block truncate max-w-xs">
                          {p.tourTitle || 'Phuket Turu'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700">
                          <span>{methodInfo.icon}</span>
                          <span>{methodInfo.label}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block text-xs">
                          {p.collectedBy || 'Ofis'}
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          📍 {locLabel}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 block font-mono">
                          +{p.amountThb.toLocaleString()} THB
                        </span>
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold uppercase tracking-wider">
                          ✓ Kasaya Girdi
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-xs text-slate-600 dark:text-slate-400 italic block max-w-xs truncate">
                          {p.note || '—'}
                        </span>
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
