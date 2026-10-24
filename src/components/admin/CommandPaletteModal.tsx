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

interface PaletteAction {
  id: string;
  type: 'action' | 'navigation' | 'booking';
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  icon: React.ComponentType<{ className?: string }>;
  handler: () => void;
  isRecent?: boolean;
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
    const q = query.trim().toLowerCase();
    const results: PaletteAction[] = [];

    // 1. Temel Hızlı Eylemler (Arama boşken veya eşleşince)
    const quickActions: PaletteAction[] = [
      {
        id: 'act-workflow-first',
        type: 'action',
        title: 'Saha İş Akışı & Operasyon Stepper',
        subtitle: 'Rezervasyon → Araç/Rehber → WhatsApp → Check-in → Tahsilat',
        icon: Zap,
        badge: 'Saha Stepper',
        badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
        handler: wrapHandler('act-workflow-first', () => {
          onClose();
          const target = bookings.find((b) => b.status === 'confirmed') || bookings[0];
          if (target && onOpenWorkflow) {
            onOpenWorkflow(target);
          } else {
            onSelectTab('overview');
          }
        }),
      },
      {
        id: 'act-new-booking',
        type: 'action',
        title: 'Yeni Rezervasyon Ekle',
        subtitle: 'Hızlı misafir ve tur kaydı oluştur',
        icon: Plus,
        badge: 'Hızlı Kayıt',
        badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
        handler: wrapHandler('act-new-booking', () => {
          onClose();
          onOpenCreateBooking();
        }),
      },
      {
        id: 'act-qr-scan',
        type: 'action',
        title: 'Bilet QR Tara & Check-in',
        subtitle: 'Kamera ile misafir biniş doğrulaması yap',
        icon: Camera,
        badge: 'Saha / Giriş',
        badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
        handler: wrapHandler('act-qr-scan', () => {
          onClose();
          onOpenQrScanner();
        }),
      },
      {
        id: 'act-police-manifest',
        type: 'action',
        title: 'Deniz Polisi & Sigorta Manifestosu',
        subtitle: 'Günün liman pasaport listesini hazırla ve yazdır',
        icon: FileText,
        badge: 'Manifesto',
        badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
        handler: wrapHandler('act-police-manifest', () => {
          onClose();
          onOpenPoliceManifest();
        }),
      },
      {
        id: 'act-switch-ops',
        type: 'action',
        title: 'Operasyon Masasına Geç',
        subtitle: 'Rezervasyon, kasa, transfer ve tedarikçi ekranı',
        icon: Zap,
        badge: 'ERP Modu',
        badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
        handler: wrapHandler('act-switch-ops', () => {
          onSetNavMode('operations');
          onSelectTab('overview');
          onClose();
        }),
      },
      {
        id: 'act-switch-cms',
        type: 'action',
        title: 'Web & İçerik Masasına Geç',
        subtitle: 'Turlar, medya, blog, SSS ve site ayarları',
        icon: Globe,
        badge: 'CMS Modu',
        badgeColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30',
        handler: wrapHandler('act-switch-cms', () => {
          onSetNavMode('cms');
          onSelectTab('tours');
          onClose();
        }),
      },
      {
        id: 'act-weather-reschedule',
        type: 'action',
        title: 'Hava Muhalefeti & Toplu Tur Erteleme',
        subtitle: 'Fırtına veya liman kısıtlamasında turları yeni tarihe kaydır',
        icon: Waves,
        badge: 'Operasyon & Güvenlik',
        badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
        handler: wrapHandler('act-weather-reschedule', () => {
          onClose();
          if (onOpenBulkReschedule) onOpenBulkReschedule();
        }),
      },
      {
        id: 'act-lost-found',
        type: 'action',
        title: 'Kayıp Eşya Masası (Lost & Found)',
        subtitle: 'Araçta ve teknede unutulan eşyalar, şoför/otel koordinasyonu',
        icon: Package,
        badge: 'Saha Takip',
        badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
        handler: wrapHandler('act-lost-found', () => {
          onClose();
          if (onOpenLostFound) onOpenLostFound();
        }),
      },
      {
        id: 'act-dietary-manifest',
        type: 'action',
        title: 'Misafir Diyet & Medikal Emniyet Manifestosu',
        subtitle: 'Hamilelik, deniz ürünü alerjisi ve tekne helal yemek brifingi',
        icon: ShieldAlert,
        badge: 'Emniyet & Sağlık',
        badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
        handler: wrapHandler('act-dietary-manifest', () => {
          onClose();
          if (onOpenDietaryManifest) onOpenDietaryManifest();
        }),
      },
      {
        id: 'act-field-cashier',
        type: 'action',
        title: 'Saha Çoklu Döviz & Para Üstü Kasa Hesaplayıcı',
        subtitle: 'USD, EUR, TRY nakit tahsilat, kur hesaplama ve WhatsApp makbuzu',
        icon: Coins,
        badge: 'Kasa & Döviz',
        badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
        handler: wrapHandler('act-field-cashier', () => {
          onClose();
          if (onOpenFieldCashier) onOpenFieldCashier();
        }),
      },
      {
        id: 'act-today-transfers',
        type: 'action',
        title: 'Bugünkü Transferler & Alınış Listesi',
        subtitle: 'Şoför manifestosu, otel lobisi alınışları ve rota sıralaması',
        icon: Car,
        badge: 'Saha Transfer',
        badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
        handler: wrapHandler('act-today-transfers', () => {
          onClose();
          onSelectTab('transfers');
        }),
      },
      {
        id: 'act-pending-collections',
        type: 'action',
        title: 'Geciken & Bekleyen Tahsilatlar',
        subtitle: 'Turda veya otelde tahsil edilecek kalan nakit bakiyeler',
        icon: CreditCard,
        badge: 'Finans',
        badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
        handler: wrapHandler('act-pending-collections', () => {
          onClose();
          onSelectTab('finance');
        }),
      },
      {
        id: 'act-lobby-pending',
        type: 'action',
        title: 'Lobide Bekleyen Misafirler & Alınış Durumu',
        subtitle: 'Bugünkü transferlerde henüz binmeyen misafirleri listele',
        icon: Clock,
        badge: 'Operasyon Masası',
        badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
        handler: wrapHandler('act-lobby-pending', () => {
          onClose();
          onSelectTab('overview');
        }),
      },
    ];

    quickActions.forEach((qa) => {
      if (!q || qa.title.toLowerCase().includes(q) || (qa.subtitle && qa.subtitle.toLowerCase().includes(q))) {
        results.push(qa);
      }
    });

    // 2. Sekmeler & Modüller
    navItems.forEach((nav) => {
      const matchesShort = nav.shortLabel ? nav.shortLabel.toLowerCase().includes(q) : false;
      const matchesDesc = nav.description ? nav.description.toLowerCase().includes(q) : false;
      if (!q || nav.label.toLowerCase().includes(q) || matchesShort || matchesDesc) {
        results.push({
          id: `nav-${nav.id}`,
          type: 'navigation',
          title: `${nav.label} Sekmesi`,
          subtitle: nav.description,
          icon: nav.icon,
          badge: nav.category === 'operations' ? 'Operasyon' : nav.category === 'content' ? 'Web CMS' : 'Sistem',
          badgeColor: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
          handler: wrapHandler(`nav-${nav.id}`, () => {
            onClose();
            onSelectTab(nav.id);
          }),
        });
      }
    });

    // 3. Rezervasyonlar / Misafirler (Arama yapıldığında)
    if (q) {
      const matchedBookings = bookings
        .filter((b) => {
          return (
            b.customerName.toLowerCase().includes(q) ||
            b.phone.includes(q) ||
            b.hotel.toLowerCase().includes(q) ||
            b.id.toLowerCase().includes(q) ||
            (b.ticketCode && b.ticketCode.toLowerCase().includes(q)) ||
            b.tourTitle.toLowerCase().includes(q)
          );
        })
        .slice(0, 10);

      matchedBookings.forEach((b) => {
        const remaining = Number(b.remainingAmountThb) || 0;
        results.push({
          id: `book-${b.id}`,
          type: 'booking',
          title: `${b.customerName} (${b.id})`,
          subtitle: `${b.tourTitle} · ${b.hotel} ${b.roomNumber ? 'Oda ' + b.roomNumber : ''}`,
          badge: remaining > 0 ? `Kalan: ${fmtMoney(remaining)} THB` : 'Ödendi',
          badgeColor: remaining > 0 ? 'bg-amber-500/10 text-amber-600 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
          icon: Users,
          handler: wrapHandler(`book-${b.id}`, () => {
            onClose();
            onSelectBooking(b);
          }),
        });
      });
    }

    // 4. Turlar (Tour Catalog Search)
    if (q && tours && tours.length > 0) {
      const matchedTours = tours
        .filter((t) => {
          return (
            t.title.toLowerCase().includes(q) ||
            (t.categoryLabel && t.categoryLabel.toLowerCase().includes(q)) ||
            (t.category && t.category.toLowerCase().includes(q)) ||
            t.id.toLowerCase().includes(q)
          );
        })
        .slice(0, 6);

      matchedTours.forEach((t) => {
        results.push({
          id: `tour-${t.id}`,
          type: 'action',
          title: t.title,
          subtitle: `${t.categoryLabel || t.category} · ${t.duration || 'Tam Gün'} ${t.priceThb ? `· ${fmtMoney(t.priceThb)} THB` : ''}`,
          badge: 'Tur Kataloğu',
          badgeColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30',
          icon: Compass,
          handler: wrapHandler(`tour-${t.id}`, () => {
            onClose();
            if (onSelectTour) {
              onSelectTour(t);
            } else {
              onSelectTab('tours');
            }
          }),
        });
      });
    }

    // Son Kullanılanları (Recents) Başa Al (Arama boşken)
    if (!q && recentActionIds.length > 0) {
      const recents: PaletteAction[] = [];
      const others: PaletteAction[] = [];
      const map = new Map(results.map((r) => [r.id, r]));

      recentActionIds.forEach((id) => {
        const item = map.get(id);
        if (item) {
          recents.push({
            ...item,
            id: `recent-${item.id}`,
            badge: '🕒 Son Kullanılan',
            badgeColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
            isRecent: true,
          });
        }
      });

      results.forEach((r) => {
        others.push(r);
      });

      return [...recents, ...others];
    }

    return results;
  }, [query, bookings, navItems, tours, onClose, onOpenCreateBooking, onOpenQrScanner, onOpenPoliceManifest, onSelectTab, onSelectBooking, onSelectTour, onSetNavMode, onOpenWorkflow, wrapHandler, recentActionIds]);

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
