
import {
  Filter,
  List,
  Compass,
  Volume2,
  VolumeX,
} from 'lucide-react';

export interface TransferFilterBarProps {
  vehicleFilter: string;
  setVehicleFilter: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  lobbyOnlyFilter: boolean;
  setLobbyOnlyFilter: (l: boolean) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  routeVehicles: string[];
  pendingCount: number;
  pickedUpCount: number;
  lobbyReadyCount: number;
  filteredPickupsCount: number;
  viewMode: 'table' | 'routes';
  setViewMode: (m: 'table' | 'routes') => void;
}

export default function TransferFilterBar({
  vehicleFilter,
  setVehicleFilter,
  statusFilter,
  setStatusFilter,
  lobbyOnlyFilter,
  setLobbyOnlyFilter,
  soundEnabled,
  onToggleSound,
  routeVehicles,
  pendingCount,
  pickedUpCount,
  lobbyReadyCount,
  filteredPickupsCount,
  viewMode,
  setViewMode,
}: TransferFilterBarProps) {
  return (
    <div className="bg-white dark:bg-surface-2 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 mr-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Filtrele:</span>
        </div>

        {/* Araç Filtresi */}
        <select
          value={vehicleFilter}
          onChange={(e) => setVehicleFilter(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
        >
          <option value="all">Tüm Hatlar ({routeVehicles.length})</option>
          {routeVehicles.map((v) => (
            <option key={v} value={v}>
              🚐 {v}
            </option>
          ))}
        </select>

        {/* Biniş Durumu Filtresi */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
        >
          <option value="all">Tüm Durumlar</option>
          <option value="pending">⏳ Bekleyenler ({pendingCount})</option>
          <option value="picked_up">🚐 Araca Binenler ({pickedUpCount})</option>
          <option value="on_tour">⛵ Turda Olanlar</option>
          <option value="completed">✅ Tamamlananlar</option>
          <option value="no_show">❌ Gelmeyenler (No-Show)</option>
        </select>

        {/* 🙋‍♂️ Lobide Hazır Hızlı Filtresi & Sesli Uyarı */}
        <button
          type="button"
          onClick={() => setLobbyOnlyFilter(!lobbyOnlyFilter)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
            lobbyOnlyFilter
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
              : 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
          }`}
          title="Sadece otel lobisinde hazır olduğunu bildiren misafirleri göster"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>🙋‍♂️ Sadece Lobide Hazırlar ({lobbyReadyCount})</span>
        </button>

        {/* Lobi Bildirim Sesi Aç/Kapat */}
        <button
          type="button"
          onClick={onToggleSound}
          className={`p-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
            soundEnabled
              ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
              : 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 border-rose-200 dark:border-rose-800'
          }`}
          title={soundEnabled ? 'Lobi Bildirim Sesini Kapat' : 'Lobi Bildirim Sesini Aç'}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <VolumeX className="w-4 h-4 text-rose-500" />
          )}
        </button>
      </div>

      {/* Görünüm Seçici & Live Pickup Counter */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/80 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setViewMode('table')}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            viewMode === 'table'
              ? 'bg-white dark:bg-surface-2 text-brand-primary dark:text-brand-accent shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <List className="w-3.5 h-3.5" />
          <span>Tablo ({filteredPickupsCount})</span>
        </button>
        <button
          type="button"
          onClick={() => setViewMode('routes')}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            viewMode === 'routes'
              ? 'bg-white dark:bg-surface-2 text-brand-primary dark:text-brand-accent shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Hat / Şoför Rotaları ({routeVehicles.length})</span>
        </button>
      </div>
    </div>
  );
}
