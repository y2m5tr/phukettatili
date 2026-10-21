/**
 * Sol kenar çubuğu — AdminDashboard'dan ayrıldı.
 *
 * Saf presentational bileşen: tüm state (kategori filtresi, daraltma, mobil
 * çekmece) ve kalıcılık (localStorage) parent'ta kalır. Sidebar yalnızca
 * prop alır ve callback çağırır.
 *
 * İçerik: mobil karartma katmanı + logo, masa switcher'ı (4 kategori),
 * kategorize menü listesi (alt menüler + rezervasyon rozeti) ve alt profil
 * / daralt-genişlet bölümü.
 */
import {
  ChevronLeft,
  ChevronRight,
  Globe,
  Settings,
  Wallet,
  X,
  Zap,
} from 'lucide-react';
import { NAV_CATEGORIES, type AdminTab, type NavCategory, type NavItem } from './adminNav';
import { resolveAssetUrl } from '../../lib/assets';

interface AdminSidebarProps {
  isMobileSidebarOpen: boolean;
  onMobileSidebarClose: () => void;
  isSidebarCollapsed: boolean;
  categoryFilter: NavCategory;
  /** Kategori seçimi — parent state'i günceller ve localStorage'a yazar. */
  onSelectCategory: (cat: NavCategory) => void;
  operationNavItems: NavItem[];
  financeNavItems: NavItem[];
  cmsNavItems: NavItem[];
  systemNavItems: NavItem[];
  activeTab: AdminTab;
  onTabSelect: (tab: AdminTab) => void;
  pendingBookingsCount: number;
  bookingsCount: number;
  /** Oturum sahibinin rol rozeti etiketi (ör. 'Kurucu'). */
  roleBadgeLabel: string;
  onToggleCollapse: () => void;
  logoUrl?: string;
  logoText?: string;
}

export default function AdminSidebar({
  isMobileSidebarOpen,
  onMobileSidebarClose,
  isSidebarCollapsed,
  categoryFilter,
  onSelectCategory,
  operationNavItems,
  financeNavItems,
  cmsNavItems,
  systemNavItems,
  activeTab,
  onTabSelect,
  pendingBookingsCount,
  bookingsCount,
  roleBadgeLabel,
  onToggleCollapse,
  logoUrl,
  logoText,
}: AdminSidebarProps) {
  return (
    <>
      {/* 1. Mobilde Açılan Menü Karartma Katmanı */}
      {isMobileSidebarOpen && (
        <div
          onClick={onMobileSidebarClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* 2. Sol Kenar Çubuğu (Sidebar) — Masaüstünde Sabit/Daraltılabilir, Mobilde Çekmece */}
      <aside
        className={`fixed md:sticky top-0 z-50 md:z-30 h-screen shrink-0 bg-white dark:bg-surface-1 border-r border-slate-200 dark:border-slate-800 transition-all duration-200 flex flex-col ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        } ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Sidebar Üst: Logo & Başlık */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 shrink-0">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 overflow-hidden group/brand"
            title="Web Sitesini Görüntüle"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-900/5 dark:bg-slate-800/80 p-1 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700/60 shadow-xs ring-1 ring-black/5 dark:ring-white/10 group-hover:scale-105 transition-transform overflow-hidden">
              <img
                src={resolveAssetUrl(logoUrl, '/assets/logo-main-transparent.png')}
                alt={logoText || 'Phuket Tatili'}
                className="w-full h-full object-contain"
              />
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0">
                <span className="font-serif font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate block leading-tight group-hover:text-brand-accent transition-colors">
                  {logoText || 'Phuket Tatili'}
                </span>
                <span className="text-[10px] font-bold text-brand-accent uppercase tracking-wider block">
                  Yönetim Paneli
                </span>
              </div>
            )}
          </a>
          {/* Mobilde Kapatma Butonu */}
          <button
            type="button"
            onClick={onMobileSidebarClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
            aria-label="Menüyü Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Segmented Masa Switcher: 4 Temel Masa (Operasyon / Finans / İçerik / Sistem) */}
        <div className="p-2.5 pb-2 shrink-0 border-b border-slate-100 dark:border-slate-800/80">
          {!isSidebarCollapsed ? (
            <div className="space-y-1.5">
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60">
                {NAV_CATEGORIES.filter((c) => c.id !== 'all').map((cat) => {
                  const isSel = categoryFilter === cat.id;
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => onSelectCategory(cat.id)}
                      title={cat.description}
                      className={`py-1.5 px-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer justify-center ${
                        isSel
                          ? 'bg-white dark:bg-surface-2 text-slate-900 dark:text-white shadow-xs font-extrabold ring-1 ring-slate-200/60 dark:ring-slate-700/60'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/40 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isSel ? 'text-brand-accent' : 'text-slate-400'}`} />
                      <span className="truncate">{cat.shortLabel}</span>
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-medium text-slate-400">Görünüm:</span>
                <button
                  type="button"
                  onClick={() => onSelectCategory(categoryFilter === 'all' ? 'operations' : 'all')}
                  className="text-[10px] font-bold text-brand-primary dark:text-brand-accent hover:underline cursor-pointer"
                >
                  {categoryFilter === 'all' ? 'Masa Moduna Dön ↩' : 'Tüm Modüller (18) ↗'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              {NAV_CATEGORIES.map((cat) => {
                const isSel = categoryFilter === cat.id;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onSelectCategory(cat.id)}
                    title={cat.label}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                      isSel
                        ? 'bg-slate-900 text-white dark:bg-brand-accent dark:text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar Menü Listesi (Kategorize + Alt Menüler) */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3">
          {[
            {
              id: 'operations' as NavCategory,
              title: 'Operasyon & Saha',
              icon: <Zap className="w-3.5 h-3.5 text-amber-500" />,
              items: operationNavItems,
            },
            {
              id: 'finance' as NavCategory,
              title: 'Finans, Kasa & B2B',
              icon: <Wallet className="w-3.5 h-3.5 text-emerald-500" />,
              items: financeNavItems,
            },
            {
              id: 'content' as NavCategory,
              title: 'Web & İçerik (CMS)',
              icon: <Globe className="w-3.5 h-3.5 text-sky-500" />,
              items: cmsNavItems,
            },
            {
              id: 'system' as NavCategory,
              title: 'Sistem & Yönetim',
              icon: <Settings className="w-3.5 h-3.5 text-purple-500" />,
              items: systemNavItems,
            },
          ].map((grp) => {
            if (grp.items.length === 0) return null;
            if (categoryFilter !== 'all' && categoryFilter !== grp.id) return null;

            return (
              <div key={grp.id} className="space-y-1">
                {!isSidebarCollapsed ? (
                  <div className="px-2 pt-1 pb-0.5 text-[10px] font-black tracking-wider uppercase text-slate-400 dark:text-slate-500 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-bold">
                      {grp.icon}
                      <span>{grp.title}</span>
                    </span>
                    <span className="font-mono text-[9px] opacity-75">{grp.items.length}</span>
                  </div>
                ) : (
                  <div className="my-1 border-t border-slate-200/60 dark:border-slate-800/60" />
                )}

                <div className="space-y-1">
                  {grp.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    const isBookings = item.id === 'bookings';

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onTabSelect(item.id)}
                        title={isSidebarCollapsed ? item.label : item.description}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer relative group ${
                          isActive
                            ? 'bg-slate-900 text-white dark:bg-brand-accent dark:text-slate-950 shadow-sm font-bold'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                        } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                      >
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive
                              ? 'text-brand-accent dark:text-slate-950'
                              : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
                          }`}
                        />
                        {!isSidebarCollapsed && (
                          <>
                            <span className="truncate flex-1 text-left">{item.label}</span>
                            {isBookings && pendingBookingsCount > 0 && (
                              <span className="rounded-full px-2 py-0.5 text-[10px] font-black bg-amber-500 text-white animate-pulse">
                                {pendingBookingsCount}
                              </span>
                            )}
                            {isBookings && pendingBookingsCount === 0 && bookingsCount > 0 && (
                              <span
                                className={`text-[10px] opacity-60 font-mono ${
                                  isActive ? 'text-white dark:text-slate-950' : 'text-slate-400'
                                }`}
                              >
                                {bookingsCount}
                              </span>
                            )}
                          </>
                        )}
                        {isSidebarCollapsed && isBookings && pendingBookingsCount > 0 && (
                          <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar Alt: Profil & Daralt/Genişlet Butonu */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2 shrink-0">
          {!isSidebarCollapsed ? (
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/60">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-brand-primary/10 text-brand-primary dark:text-brand-accent flex items-center justify-center font-bold text-xs shrink-0">
                  MG
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate text-slate-800 dark:text-slate-200">Murat Gençer</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                    {roleBadgeLabel}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-1" title={`Murat Gençer (${roleBadgeLabel})`}>
              <div className="w-8 h-8 rounded-xl bg-brand-primary/10 text-brand-primary dark:text-brand-accent flex items-center justify-center font-bold text-xs">
                MG
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden md:flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={isSidebarCollapsed ? 'Menüyü Genişlet' : 'Menüyü Daralt'}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Menüyü Daralt</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
