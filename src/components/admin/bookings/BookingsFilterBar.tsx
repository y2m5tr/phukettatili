
import { Search, Send, ShieldAlert, Coins, Download, Plus } from 'lucide-react';
import type { PickupItem } from '../../../lib/adminFilters';

export interface BookingsFilterBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  dateFilter: string;
  setDateFilter: (d: string) => void;
  todayStr: string;
  tomorrowStr: string;
  tomorrowPickups: PickupItem[];
  currentFilterPickups: PickupItem[];
  onOpenBulkDispatch: (date: string) => void;
  onOpenDietaryManifest?: () => void;
  onOpenFieldCashier?: () => void;
  onExportCSV: () => void;
  onOpenCreate: () => void;
}

export function BookingsFilterBar({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  dateFilter,
  setDateFilter,
  todayStr,
  tomorrowStr,
  tomorrowPickups,
  currentFilterPickups,
  onOpenBulkDispatch,
  onOpenDietaryManifest,
  onOpenFieldCashier,
  onExportCSV,
  onOpenCreate,
}: BookingsFilterBarProps) {
  return (
    <div className="bg-white dark:bg-surface-2 p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex flex-1 items-center gap-2.5 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Müşteri adı, otel, telefon veya tur ara..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none"
        >
          <option value="all">Tüm Durumlar</option>
          <option value="confirmed">🟢 Onaylananlar</option>
          <option value="inquiry">🟡 Teklif / Bekleyen</option>
          <option value="completed">🔵 Tamamlananlar</option>
          <option value="cancelled">🔴 İptaller</option>
        </select>

        {/* Hızlı Tarih Kısayolları (Chips) */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setDateFilter('')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              !dateFilter
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Tümü
          </button>
          <button
            type="button"
            onClick={() => setDateFilter(todayStr)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
              dateFilter === todayStr
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>⚡ Bugün</span>
          </button>
          <button
            type="button"
            onClick={() => setDateFilter(tomorrowStr)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
              dateFilter === tomorrowStr
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>🌅 Yarın</span>
          </button>
        </div>

        {/* Yarınki Toplu WhatsApp Butonu */}
        {tomorrowPickups.length > 0 && (
          <button
            type="button"
            onClick={() => onOpenBulkDispatch(tomorrowStr)}
            className="px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Yarınki turların lobi hazır WhatsApp mesajlarını tek ekrandan gönder"
          >
            <Send className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Yarınki WhatsApp ({tomorrowPickups.length})</span>
          </button>
        )}

        {/* Seçili Farklı Tarih Varsa Toplu WhatsApp Butonu */}
        {dateFilter && dateFilter !== tomorrowStr && currentFilterPickups.length > 0 && (
          <button
            type="button"
            onClick={() => onOpenBulkDispatch(dateFilter)}
            className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title={`${dateFilter} tarihindeki misafirlerin WhatsApp lobi mesajlarını hazırla`}
          >
            <Send className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Tarih WhatsApp ({currentFilterPickups.length})</span>
          </button>
        )}

        {/* Tarih Takvim Kutusu */}
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            title="Tarih bazlı filtrele (çoklu tur kayıtlarında herhangi bir tur tarihi eşleşirse gösterilir)"
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none"
          />
          {dateFilter && (
            <button
              type="button"
              onClick={() => setDateFilter('')}
              title="Tarih filtresini temizle"
              className="px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-500 hover:border-red-300 text-xs font-bold transition-colors cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap">
        {onOpenDietaryManifest && (
          <button
            type="button"
            onClick={onOpenDietaryManifest}
            className="px-3.5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Misafir Diyet & Medikal Emniyet Manifestosu"
          >
            <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>Diyet & Medikal</span>
          </button>
        )}

        {onOpenFieldCashier && (
          <button
            type="button"
            onClick={() => onOpenFieldCashier()}
            className="px-3.5 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Saha Çoklu Döviz & Para Üstü Kasa Hesaplayıcı"
          >
            <Coins className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Saha Döviz Kasa</span>
          </button>
        )}

        <button
          onClick={onExportCSV}
          className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Dışa Aktar (CSV)</span>
        </button>
        <button
          onClick={onOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-bold shadow-md shadow-brand-primary/20 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Ekle</span>
        </button>
      </div>
    </div>
  );
}
