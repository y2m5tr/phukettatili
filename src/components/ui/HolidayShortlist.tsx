import { useState, useEffect } from 'react';
import { Heart, X, MessageCircle, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import { resolveAssetUrl } from '../../lib/assets';

export interface ShortlistTourItem {
  id: string;
  title: string;
  image?: string;
  duration?: string;
  category?: string;
  priceThb?: number;
}

const STORAGE_KEY = 'ptt_holiday_shortlist';

export function getShortlistFromStorage(): ShortlistTourItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveShortlistToStorage(items: ShortlistTourItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('ptt:shortlist:updated', { detail: { items } }));
  } catch {}
}

export function toggleShortlistTour(tour: ShortlistTourItem): boolean {
  const current = getShortlistFromStorage();
  const exists = current.some((t) => t.id === tour.id);
  let next: ShortlistTourItem[];
  if (exists) {
    next = current.filter((t) => t.id !== tour.id);
  } else {
    next = [...current, tour];
  }
  saveShortlistToStorage(next);
  return !exists;
}

interface HolidayShortlistProps {
  whatsappNumber?: string;
}

export default function HolidayShortlist({ whatsappNumber = '66828950665' }: HolidayShortlistProps) {
  const [items, setItems] = useState<ShortlistTourItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    // İlk yüklemede oku
    setItems(getShortlistFromStorage());

    // Window global fonksiyonlarını ata
    (window as any).getPttShortlist = getShortlistFromStorage;
    (window as any).togglePttShortlist = (tour: ShortlistTourItem) => {
      const added = toggleShortlistTour(tour);
      if (added) {
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 2000);
      }
      return added;
    };

    // Event dinleyicisi
    const handleUpdate = (e: any) => {
      if (e.detail?.items) {
        setItems(e.detail.items);
        updateHeartButtonsOnPage(e.detail.items);
      }
    };

    window.addEventListener('ptt:shortlist:updated', handleUpdate);
    window.addEventListener('storage', () => {
      const updated = getShortlistFromStorage();
      setItems(updated);
      updateHeartButtonsOnPage(updated);
    });

    // Sayfa geçişlerinde (Astro View Transitions) butonları güncelle
    const onPageLoad = () => {
      updateHeartButtonsOnPage(getShortlistFromStorage());
    };
    document.addEventListener('astro:page-load', onPageLoad);
    updateHeartButtonsOnPage(getShortlistFromStorage());

    return () => {
      window.removeEventListener('ptt:shortlist:updated', handleUpdate);
      document.removeEventListener('astro:page-load', onPageLoad);
    };
  }, []);

  const updateHeartButtonsOnPage = (currentItems: ShortlistTourItem[]) => {
    if (typeof document === 'undefined') return;
    const itemIds = new Set(currentItems.map((i) => i.id));
    const buttons = document.querySelectorAll<HTMLElement>('.ptt-wishlist-btn');
    buttons.forEach((btn) => {
      const tourId = btn.dataset.tourId;
      if (!tourId) return;
      const isFav = itemIds.has(tourId);
      if (isFav) {
        btn.classList.add('is-favorite');
        btn.setAttribute('aria-pressed', 'true');
        btn.setAttribute('title', 'Favorilerimden Çıkar');
      } else {
        btn.classList.remove('is-favorite');
        btn.setAttribute('aria-pressed', 'false');
        btn.setAttribute('title', 'Tatil Planıma Ekle');
      }
    });
  };

  const removeItem = (id: string) => {
    const next = items.filter((t) => t.id !== id);
    setItems(next);
    saveShortlistToStorage(next);
  };

  const clearAll = () => {
    setItems([]);
    saveShortlistToStorage([]);
  };

  const generateWhatsAppMessage = () => {
    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
    let msg = `Merhaba Phuket Tatili, web sitenizden incelediğim aşağıdaki turlar için paket uygunluğu ve fiyat teklifi almak istiyorum:\n\n`;
    items.forEach((item, idx) => {
      msg += `${idx + 1}. *${item.title}*${item.duration ? ` (${item.duration})` : ''}\n`;
    });
    msg += `\n🌴 Toplam Seçilen Tur: ${items.length} Adet\n`;
    msg += `🗓️ Tahmini Tatil Tarihimiz: \n`;
    msg += `👥 Kişi Sayısı: 2 Yetişkin\n\n`;
    msg += `Yardımcı olabilir misiniz? Teşekkürler!`;

    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`;
  };

  if (items.length === 0 && !isOpen) {
    return null;
  }

  return (
    <>
      {/* Yüzen Tatil Sepeti Rozeti (Sağ Alt) */}
      <div className="fixed bottom-24 right-4 z-40 sm:bottom-6 sm:right-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-2xl transition-all duration-300 cursor-pointer border ${
            justAdded
              ? 'bg-rose-600 text-white border-rose-500 scale-105 ring-4 ring-rose-500/30'
              : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white border-slate-200 dark:border-slate-800 hover:border-rose-400 hover:shadow-rose-500/20'
          }`}
          aria-label="Tatil Planımı Görüntüle"
        >
          <div className="relative">
            <Heart className={`w-5 h-5 ${justAdded ? 'fill-white text-white animate-bounce' : 'fill-rose-500 text-rose-500'}`} />
            <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px] font-black min-w-[18px] text-center shadow-xs">
              {items.length}
            </span>
          </div>
          <span className="text-xs font-bold whitespace-nowrap hidden sm:inline">
            Tatil Planım
          </span>
          <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full whitespace-nowrap">
            {items.length} Tur
          </span>
        </button>
      </div>

      {/* Slide-over / Modal Çekmecesi */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-md h-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300 border-l border-slate-200 dark:border-slate-800"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <Heart className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                    Tatil Planım & Favoriler
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Seçtiğiniz turlarla tek tıkla özel paket teklifi alın
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tur Listesi */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {items.length === 0 ? (
                <div className="text-center py-16 px-4 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-400 flex items-center justify-center mx-auto">
                    <Heart className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">
                    Listeniz Boş
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                    Turlarımızı incelerken kartlardaki kalp simgesine (❤️) tıklayarak beğendiğiniz rotaları buraya toplayabilirsiniz.
                  </p>
                </div>
              ) : (
                items.map((tour, idx) => (
                  <div
                    key={tour.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3 group relative transition-all hover:border-rose-300 dark:hover:border-rose-900/60"
                  >
                    <div className="w-16 h-14 rounded-xl overflow-hidden shrink-0 bg-slate-200 dark:bg-slate-700">
                      <img
                        src={resolveAssetUrl(tour.image, '/assets/phuket_hero.webp')}
                        alt={tour.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="w-4 h-4 rounded-full bg-brand-primary/10 text-brand-primary dark:text-brand-accent text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        {tour.category && (
                          <span className="text-[10px] uppercase font-bold text-brand-accent tracking-wider truncate">
                            {tour.category}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">
                        {tour.title}
                      </h4>
                      {tour.duration && (
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          ⏳ {tour.duration}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(tour.id)}
                      className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                      title="Listeden Kaldır"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer / WhatsApp CTA */}
            {items.length > 0 && (
              <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3 shrink-0">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">
                    Seçilen Paket:
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {items.length} Farklı Tur Rotası
                  </span>
                </div>

                <a
                  href={generateWhatsAppMessage()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>WhatsApp ile Paket Teklifi Al</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={clearAll}
                    className="text-[11px] font-semibold text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    Tümünü Temizle
                  </button>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    Özel Grup / Çoklu Tur İndirimi
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
