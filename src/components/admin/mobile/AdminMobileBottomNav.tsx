import {
  Compass,
  FileText,
  Plus,
  Car,
  Menu,
} from 'lucide-react';
import type { AdminTab } from '../adminNav';

interface AdminMobileBottomNavProps {
  activeTab: AdminTab;
  onTabSelect: (tab: AdminTab) => void;
  pendingBookingsCount: number;
  onOpenQuickActions: () => void;
  onOpenSidebar: () => void;
}

export function AdminMobileBottomNav({
  activeTab,
  onTabSelect,
  pendingBookingsCount,
  onOpenQuickActions,
  onOpenSidebar,
}: AdminMobileBottomNavProps) {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/90 dark:border-slate-800/90 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-4px_25px_rgba(0,0,0,0.08)] select-none"
      aria-label="Mobil Yönetim Menüsü"
    >
      <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto relative">
        {/* 1. Özet / Genel Bakış */}
        <button
          type="button"
          onClick={() => onTabSelect('overview')}
          className={`flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'text-amber-500 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
          aria-label="Genel Bakış"
        >
          <div className="relative">
            <Compass className={`w-5 h-5 ${activeTab === 'overview' ? 'stroke-[2.5]' : ''}`} />
            {activeTab === 'overview' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-500" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Özet</span>
        </button>

        {/* 2. Rezervasyonlar */}
        <button
          type="button"
          onClick={() => onTabSelect('bookings')}
          className={`flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 transition-all cursor-pointer ${
            activeTab === 'bookings'
              ? 'text-amber-500 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
          aria-label="Rezervasyonlar"
        >
          <div className="relative">
            <FileText className={`w-5 h-5 ${activeTab === 'bookings' ? 'stroke-[2.5]' : ''}`} />
            {pendingBookingsCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1.5 min-w-[16px] h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                {pendingBookingsCount > 9 ? '9+' : pendingBookingsCount}
              </span>
            )}
            {activeTab === 'bookings' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-500" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Rezervasyon</span>
        </button>

        {/* 3. Center Raised Quick Action FAB Button */}
        <div className="flex-1 flex items-center justify-center">
          <button
            type="button"
            onClick={onOpenQuickActions}
            className="w-12 h-12 -mt-5 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/35 border-2 border-white dark:border-slate-900 flex items-center justify-center cursor-pointer active:scale-95 transition-all"
            aria-label="Hızlı Saha ve Operasyon İşlemleri"
            title="Hızlı İşlemler"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        {/* 4. Transferler */}
        <button
          type="button"
          onClick={() => onTabSelect('transfers')}
          className={`flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 transition-all cursor-pointer ${
            activeTab === 'transfers'
              ? 'text-amber-500 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
          aria-label="Transferler"
        >
          <div className="relative">
            <Car className={`w-5 h-5 ${activeTab === 'transfers' ? 'stroke-[2.5]' : ''}`} />
            {activeTab === 'transfers' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-500" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Transfer</span>
        </button>

        {/* 5. Tüm Menü */}
        <button
          type="button"
          onClick={onOpenSidebar}
          className="flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all cursor-pointer"
          aria-label="Tüm Menüyü Aç"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Menü</span>
        </button>
      </div>
    </nav>
  );
}
