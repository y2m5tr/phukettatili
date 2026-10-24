import React from 'react';
import { Compass, Camera, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { formatDateDisplay } from './fieldTypes';

export interface FieldHeaderProps {
  crewName: string;
  activeTab: 'schedule' | 'new_booking' | 'cash' | 'settings';
  isOnline: boolean;
  isCloudConnected: boolean;
  isRefreshing: boolean;
  selectedDate: string;
  setSelectedDate: (d: string) => void;
  yesterdayStr: string;
  todayStr: string;
  tomorrowStr: string;
  onOpenQrScanner: () => void;
  onRefresh: () => void;
}

export function FieldHeader({
  crewName,
  activeTab,
  isOnline,
  isCloudConnected,
  isRefreshing,
  selectedDate,
  setSelectedDate,
  yesterdayStr,
  todayStr,
  tomorrowStr,
  onOpenQrScanner,
  onRefresh,
}: FieldHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center font-bold text-slate-950 shadow-md">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white tracking-tight">Phuket Operasyon</h1>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-[170px]">
              {crewName} · <span className="text-amber-400 font-medium">Saha Aktif</span>
            </p>
          </div>
        </div>

        {/* Durum & Yenile */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenQrScanner}
            className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
            title="QR Biniş Kartı Okut"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>QR Tara</span>
          </button>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-label="Yenile"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 active:scale-95 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
          </button>
          <div
            className={`p-1.5 rounded-lg border text-[10px] font-semibold flex items-center gap-1 ${
              !isOnline
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                : isCloudConnected
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}
            title={
              !isOnline
                ? 'İnternet Yok (Çevrimdışı)'
                : isCloudConnected
                ? 'Supabase Bulut Bağlı'
                : 'Yerel Hafıza Modu'
            }
          >
            {!isOnline ? (
              <WifiOff className="w-3.5 h-3.5" />
            ) : isCloudConnected ? (
              <Wifi className="w-3.5 h-3.5" />
            ) : (
              <WifiOff className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">
              {!isOnline ? 'Çevrimdışı' : isCloudConnected ? 'Bulut' : 'Yerel'}
            </span>
          </div>
        </div>
      </div>

      {/* Tarih Seçici Çubuğu (Schedule Tab'ındayken) */}
      {activeTab === 'schedule' && (
        <div className="mt-3 pt-3 border-t border-slate-800/60">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <button
              onClick={() => setSelectedDate(yesterdayStr)}
              className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition-all ${
                selectedDate === yesterdayStr
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:bg-slate-900'
              }`}
            >
              Dün
            </button>
            <button
              onClick={() => setSelectedDate(todayStr)}
              className={`px-3 py-1.5 rounded-xl font-bold shrink-0 transition-all ${
                selectedDate === todayStr
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-amber-400 border border-amber-500/30'
              }`}
            >
              📍 Bugün ({formatDateDisplay(todayStr).slice(0, 6)})
            </button>
            <button
              onClick={() => setSelectedDate(tomorrowStr)}
              className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition-all ${
                selectedDate === tomorrowStr
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:bg-slate-900'
              }`}
            >
              Yarın
            </button>
            <div className="relative shrink-0">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
