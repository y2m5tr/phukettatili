
import {
  Camera,
  ChevronDown,
  Coins,
  FileText,
  Fuel,
  Luggage,
  Package,
  Plane,
  ShieldAlert,
  Ship,
  Smartphone,
  UserCheck,
} from 'lucide-react';
import type { AdminHeaderActions } from '../AdminHeader';

export interface QuickToolsDropdownProps {
  isOpen: boolean;
  setIsOpen: (v: boolean | ((prev: boolean) => boolean)) => void;
  actions: AdminHeaderActions;
}

export function QuickToolsDropdown({ isOpen, setIsOpen, actions }: QuickToolsDropdownProps) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800 text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
        title="Tüm Hızlı Saha & Operasyon Araçları"
      >
        <span className="text-amber-500">⚡</span>
        <span className="hidden sm:inline">Hızlı Araçlar</span>
        <span className="sm:hidden">Araçlar</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-surface-2 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2.5 z-50 divide-y divide-slate-100 dark:divide-slate-800 max-h-[85vh] overflow-y-auto">
            {/* 1. Saha & Check-in */}
            <div className="p-1 space-y-1">
              <div className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider px-2 py-0.5 flex items-center gap-1">
                <span>🚀</span>
                <span>Sevk & Check-in</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  actions.openQrScanner();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-purple-500/10 hover:text-purple-600 transition-colors text-left cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-purple-600" />
                <span>Bilet QR Oku / Check-in</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  actions.openWelcomeBoard();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-amber-500/10 hover:text-amber-600 transition-colors text-left cursor-pointer"
              >
                <span className="text-xs">🪧</span>
                <span>VIP Karşılama İsimlik Stüdyosu</span>
              </button>
            </div>

            {/* 2. Kasa & Masraflar */}
            <div className="p-1 pt-2 space-y-1">
              <div className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider px-2 py-0.5 flex items-center gap-1">
                <span>💵</span>
                <span>Kasa & Masraflar</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  actions.openDriverExpense();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-amber-500/10 hover:text-amber-600 transition-colors text-left cursor-pointer"
              >
                <Fuel className="w-3.5 h-3.5 text-amber-600" />
                <span>Şoför Yakıt & Harç Masrafı</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  actions.openGuideExpense();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-teal-500/10 hover:text-teal-600 transition-colors text-left cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>Rehber Masrafı (Taksi, Yemek, Saha)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  actions.openFieldCashier();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-600 transition-colors text-left cursor-pointer"
              >
                <Coins className="w-3.5 h-3.5 text-emerald-600" />
                <span>Saha Çoklu Döviz Kasa Hesaplayıcı</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  actions.openPromptPayQr();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-sky-500/10 hover:text-sky-600 transition-colors text-left cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5 text-sky-600" />
                <span>PromptPay QR Kod Üretici</span>
              </button>
            </div>

            {/* 3. Lojistik & Uçuş */}
            <div className="p-1 pt-2 space-y-1">
              <div className="text-[10px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-wider px-2 py-0.5 flex items-center gap-1">
                <span>✈️</span>
                <span>Lojistik & Havalimanı</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  actions.openFlightRadar();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-sky-500/10 hover:text-sky-600 transition-colors text-left cursor-pointer"
              >
                <Plane className="w-3.5 h-3.5 text-sky-600" />
                <span>Canlı Uçuş Radarı & Rötar Kalkanı</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  actions.openLuggageExpress();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-500/10 hover:text-indigo-600 transition-colors text-left cursor-pointer"
              >
                <Luggage className="w-3.5 h-3.5 text-indigo-600" />
                <span>Oteller Arası Bagaj Transfer Masası</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  actions.openLostFound();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-amber-500/10 hover:text-amber-600 transition-colors text-left cursor-pointer"
              >
                <Package className="w-3.5 h-3.5 text-amber-600" />
                <span>Kayıp Eşya Takip Masası</span>
              </button>
            </div>

            {/* 4. Emniyet & Manifestolar */}
            <div className="p-1 pt-2 space-y-1">
              <div className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider px-2 py-0.5 flex items-center gap-1">
                <span>🛡️</span>
                <span>Emniyet & Manifestolar</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  actions.openPoliceManifest();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-rose-500/10 hover:text-rose-600 transition-colors text-left cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span>Deniz Polisi Güvenlik Manifestosu</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  actions.openPierManifest();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-sky-500/10 hover:text-sky-600 transition-colors text-left cursor-pointer"
              >
                <Ship className="w-3.5 h-3.5 text-sky-600" />
                <span>İskele & Kaptan Manifestosu</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  actions.openDietaryManifest();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-rose-500/10 hover:text-rose-600 transition-colors text-left cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span>Diyet & Medikal Emniyet Manifestosu</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  actions.openCaptainDrawer();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-cyan-500/10 hover:text-cyan-600 transition-colors text-left cursor-pointer"
              >
                <span className="text-xs">📶</span>
                <span>Kaptan Kasası (Çevrimdışı PWA)</span>
              </button>
            </div>

            {/* 5. Teklifler */}
            <div className="p-1 pt-2">
              <button
                type="button"
                onClick={() => {
                  actions.openProposals();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-900 dark:text-amber-300 hover:bg-amber-500/25 transition-colors text-left cursor-pointer"
              >
                <FileText className="w-4 h-4 text-amber-600" />
                <span>📄 Teklifler (Çok Günlü & Tekli Tur)</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
