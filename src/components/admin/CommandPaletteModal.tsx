import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Search,
  Plus,
  Camera,
  FileText,
  Users,
  ArrowRight,
  X,
  Zap,
  Globe,
  Waves,
  Package,
  ShieldAlert,
  Coins,
  Compass,
  Car,
  CreditCard,
  Clock,
} from 'lucide-react';
import type { Booking, TourItem } from '../../data/adminInitialData';
import type { AdminTab, NavItem } from './AdminDashboard';
import { safeGet, safeSet } from '../../lib/safeStorage';
import { fmtMoney } from '../../lib/moneyFormat';
import {
  type PaletteAction,
  buildPaletteItems,
} from './commandPalette/paletteActionBuilders';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: Booking[];
  navItems: NavItem[];
  onSelectTab: (tab: AdminTab) => void;
  onOpenCreateBooking: () => void;
  onOpenQrScanner: () => void;
  onOpenPoliceManifest: () => void;
  onOpenBulkReschedule?: () => void;
  onOpenLostFound?: () => void;
  onOpenDietaryManifest?: () => void;
  onOpenFieldCashier?: () => void;
  onSelectBooking: (b: Booking) => void;
  onSetNavMode: (mode: 'operations' | 'cms') => void;
  tours?: TourItem[];
  onSelectTour?: (tour: TourItem) => void;
  onOpenWorkflow?: (b: Booking) => void;
}

const RECENT_PALETTE_KEY = 'ptt_recent_palette_actions';

export default function CommandPaletteModal({
  isOpen,
  onClose,
  bookings,
  navItems,
  onSelectTab,
  onOpenCreateBooking,
  onOpenQrScanner,
  onOpenPoliceManifest,
  onOpenBulkReschedule,
  onOpenLostFound,
  onOpenDietaryManifest,
  onOpenFieldCashier,
  onSelectBooking,
  onSetNavMode,
  tours = [],
  onSelectTour,
  onOpenWorkflow,
}: CommandPaletteModalProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const [recentActionIds, setRecentActionIds] = useState<string[]>(() => {
    return safeGet<string[]>(RECENT_PALETTE_KEY, []);
  });

  const recordRecentAction = useCallback((actionId: string) => {
    try {
      const current = safeGet<string[]>(RECENT_PALETTE_KEY, []);
      const next = [actionId, ...current.filter((id) => id !== actionId)].slice(0, 6);
      safeSet(RECENT_PALETTE_KEY, next);
      setRecentActionIds(next);
    } catch {
      // safeStorage handles quota & parse safely
    }
  }, []);

  const wrapHandler = useCallback(
    (actionId: string, fn: () => void) => () => {
      recordRecentAction(actionId);
      fn();
    },
    [recordRecentAction]
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setRecentActionIds(safeGet<string[]>(RECENT_PALETTE_KEY, []));
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const items = useMemo<PaletteAction[]>(() => {
    return buildPaletteItems({
      q: query.trim().toLowerCase(),
      bookings,
      navItems,
      tours,
      recentActionIds,
      onClose,
      onSelectTab,
      onOpenCreateBooking,
      onOpenQrScanner,
      onOpenPoliceManifest,
      onOpenBulkReschedule,
      onOpenLostFound,
      onOpenDietaryManifest,
      onOpenFieldCashier,
      onSelectBooking,
      onSetNavMode,
      onSelectTour,
      onOpenWorkflow,
      wrapHandler,
    });
  }, [
    query,
    bookings,
    navItems,
    tours,
    recentActionIds,
    onClose,
    onSelectTab,
    onOpenCreateBooking,
    onOpenQrScanner,
    onOpenPoliceManifest,
    onOpenBulkReschedule,
    onOpenLostFound,
    onOpenDietaryManifest,
    onOpenFieldCashier,
    onSelectBooking,
    onSetNavMode,
    onSelectTour,
    onOpenWorkflow,
    wrapHandler,
  ]);

  // Klavye Kontrolleri: Up, Down, Enter, Esc
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, items.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + items.length) % Math.max(1, items.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const current = items[selectedIndex];
        if (current) current.handler();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, items, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Komut Paleti ve Hızlı Arama"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        className="bg-white dark:bg-surface-2 w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Arama Input Alanı */}
        <div className="relative border-b border-slate-100 dark:border-slate-800 px-4 py-3 sm:px-5 sm:py-4 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={items.length > 0}
            aria-controls="palette-results-list"
            aria-autocomplete="list"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Misafir adı, telefon, otel, tur veya sekme ara... (Örn: Ahmet, Patong, Kasa)"
            className="flex-1 bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              aria-label="Aramayı Temizle"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Sonuç Listesi */}
        <div
          id="palette-results-list"
          role="listbox"
          aria-label="Arama Sonuçları"
          className="flex-1 overflow-y-auto p-2 sm:p-3 divide-y divide-slate-100/50 dark:divide-slate-800/50"
        >
          {items.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">"{query}" ile eşleşen bir kayıt veya eylem bulunamadı.</p>
              <p className="text-xs text-slate-500 mt-1">Farklı bir müşteri adı, telefon veya modül deneyebilirsiniz.</p>
            </div>
          ) : (
            items.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  role="option"
                  aria-selected={isSelected}
                  onClick={item.handler}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between gap-3 p-3 sm:p-3.5 min-h-[48px] sm:min-h-[52px] rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-brand-primary text-white shadow-sm'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? 'bg-white/20 border-white/30 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-bold truncate ${isSelected ? 'text-white' : ''}`}>
                          {item.title}
                        </span>
                        {item.badge && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              isSelected
                                ? 'bg-white/20 text-white border-white/30'
                                : item.badgeColor || 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.subtitle && (
                        <p
                          className={`text-xs truncate mt-0.5 ${
                            isSelected ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <ArrowRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isSelected ? 'translate-x-1 text-white' : 'text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100'
                    }`}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Alt Kısayol Bilgilendirmesi */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>↑↓ Gezin</span>
            <span>↵ Seç</span>
            <span>ESC Kapat</span>
          </div>
          <span className="font-mono text-[10px]">Phuket Tatili ERP Spotlight</span>
        </div>
      </div>
    </div>
  );
}
