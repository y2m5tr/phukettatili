
import {
  Calendar,
  Navigation,
  Search,
  X,
  Bus,
  ShieldCheck,
  Share2,
} from 'lucide-react';
import { fmtMoney } from '../../lib/moneyFormat';
import { generateMultiStopMapUrl, detectDeparturePier } from '../../lib/maps';
import { formatDateDisplay, type FieldScheduleItem } from './fieldTypes';
import type { Booking } from '../../data/adminInitialData';
import type { ScheduleStats } from './fieldScheduleBuilder';
import { FieldScheduleCard } from './FieldScheduleCard';

export interface FieldScheduleTabProps {
  selectedDate: string;
  todayStr: string;
  isDriverOnly: boolean;
  scheduleItems: FieldScheduleItem[];
  filteredSchedule: FieldScheduleItem[];
  stats: ScheduleStats;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  vehicleFilter: string;
  setVehicleFilter: (v: string) => void;
  availableVehicles: string[];
  onOpenPoliceManifest: () => void;
  onSendDayEndReport: () => void;
  onOpenCashModal: (item: FieldScheduleItem) => void;
  onOpenWhatsAppModal: (booking: Booking) => void;
  onOpenBoardingPass: (booking: Booking, tourIndex: number) => void;
  onSetPickupStatus: (
    item: FieldScheduleItem,
    status: 'pending' | 'picked_up' | 'on_tour' | 'completed' | 'no_show'
  ) => void;
  onNavigateToNewBooking: () => void;
}

export function FieldScheduleTab({
  selectedDate,
  todayStr,
  isDriverOnly,
  scheduleItems,
  filteredSchedule,
  stats,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  vehicleFilter,
  setVehicleFilter,
  availableVehicles,
  onOpenPoliceManifest,
  onSendDayEndReport,
  onOpenCashModal,
  onOpenWhatsAppModal,
  onOpenBoardingPass,
  onSetPickupStatus,
  onNavigateToNewBooking,
}: FieldScheduleTabProps) {
  return (
    <main className="flex-1 px-4 py-4 space-y-4">
      {/* Günün Durum Özeti (Sayaçlar) */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Toplam Misafir</span>
          <div className="text-xl font-bold text-white mt-0.5">
            {stats.totalPax} <span className="text-xs font-normal text-slate-400">kişi</span>
          </div>
          <span className="text-[10px] text-slate-500">{stats.totalTransfers} transfer</span>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Alınan / Bekleyen</span>
          <div className="text-xl font-bold text-emerald-400 mt-0.5">
            {stats.pickedUpCount} <span className="text-xs font-normal text-slate-400">/ {stats.pendingCount}</span>
          </div>
          <span className="text-[10px] text-slate-500">otel karşılama</span>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Tahsil Edilecek</span>
          <div className="text-sm font-bold text-amber-400 mt-1 truncate">
            {stats.totalCashToCollect > 0 ? `${fmtMoney(stats.totalCashToCollect)} ฿` : '0 ฿ (Tam)'}
          </div>
          <span className="text-[10px] text-slate-500">kalan bakiye</span>
        </div>
      </div>

      {/* Arama & Hızlı Filtre */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Misafir adı, otel veya oda no ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Durum Hapları */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-full font-medium shrink-0 transition-all ${
              statusFilter === 'all'
                ? 'bg-white text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            Tümü ({scheduleItems.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1 rounded-full font-medium shrink-0 transition-all ${
              statusFilter === 'pending'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-900 text-amber-400 border border-slate-800'
            }`}
          >
            Bekleyenler ({stats.pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter('picked_up')}
            className={`px-3 py-1 rounded-full font-medium shrink-0 transition-all ${
              statusFilter === 'picked_up'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-slate-900 text-emerald-400 border border-slate-800'
            }`}
          >
            Alınanlar ({stats.pickedUpCount})
          </button>
          {stats.totalCashToCollect > 0 && (
            <button
              onClick={() => setStatusFilter('unpaid')}
              className={`px-3 py-1 rounded-full font-medium shrink-0 transition-all ${
                statusFilter === 'unpaid'
                  ? 'bg-rose-500 text-white font-bold'
                  : 'bg-slate-900 text-rose-400 border border-slate-800'
              }`}
            >
              Tahsilatlılar
            </button>
          )}
        </div>

        {/* Hat / Minibüs Filtresi */}
        {availableVehicles.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px] pt-1 border-t border-slate-800/40">
            <span className="text-[10px] text-slate-500 uppercase font-semibold shrink-0 flex items-center gap-1">
              <Bus className="w-3 h-3 text-sky-400" /> Hat:
            </span>
            <button
              onClick={() => setVehicleFilter('all')}
              className={`px-2.5 py-0.5 rounded-lg text-[11px] font-medium shrink-0 transition-all ${
                vehicleFilter === 'all'
                  ? 'bg-sky-500 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              Tüm Hatlar
            </button>
            {availableVehicles.map((v) => (
              <button
                key={v}
                onClick={() => setVehicleFilter(v)}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-medium shrink-0 transition-all ${
                  vehicleFilter === v
                    ? 'bg-sky-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-sky-400 border border-slate-800'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Manifest Başlığı & Saha Operasyon Aksiyonları */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400 px-1 pt-1">
        <span className="font-semibold text-slate-300">
          {formatDateDisplay(selectedDate)} Manifestosu ({filteredSchedule.length} Kayıt)
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {filteredSchedule.length > 0 && (
            <a
              href={generateMultiStopMapUrl(
                filteredSchedule.map((i) => i.hotel),
                detectDeparturePier(filteredSchedule[0]?.tourTitle)
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 font-bold text-xs flex items-center gap-1 active:scale-95 transition-all"
              title="Günün tüm otellerini ardışık Google Maps rotası olarak aç"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>🗺️ Çoklu Rota</span>
            </a>
          )}
          <button
            type="button"
            onClick={onOpenPoliceManifest}
            className="px-2.5 py-1 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-bold text-xs flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
            title="Tayland Deniz Polisi & Millî Park Yolcu Manifestosu"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>🛂 Polis Manifestosu</span>
          </button>
          <button
            type="button"
            onClick={onSendDayEndReport}
            className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-semibold flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Raporla</span>
          </button>
        </div>
      </div>

      {/* LİSTE / KARTLAR */}
      {filteredSchedule.length === 0 ? (
        <div className="text-center py-12 px-4 bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl">
          <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-300">
            {selectedDate === todayStr ? 'Bugün için planlanmış tur bulunamadı' : 'Bu tarihte tur bulunamadı'}
          </p>
          {!isDriverOnly && (
            <>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Yeni bir misafir eklemek için alttaki "+ Yeni Satış" butonunu kullanabilirsiniz.
              </p>
              <button
                onClick={onNavigateToNewBooking}
                className="mt-4 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold shadow-md hover:bg-amber-400 transition-all cursor-pointer"
              >
                + Yeni Rezervasyon Oluştur
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSchedule.map((item) => (
            <FieldScheduleCard
              key={item.key}
              item={item}
              isDriverOnly={isDriverOnly}
              onOpenCashModal={onOpenCashModal}
              onOpenWhatsAppModal={onOpenWhatsAppModal}
              onOpenBoardingPass={onOpenBoardingPass}
              onSetPickupStatus={onSetPickupStatus}
            />
          ))}
        </div>
      )}
    </main>
  );
}
