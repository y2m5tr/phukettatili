import React from 'react';
import {
  Users,
  Compass,
  Car,
  BookOpen,
  HelpCircle,
  MessageSquareQuote,
} from 'lucide-react';
import type { AdminTab } from '../AdminDashboard';
import type { TourItem } from '../../../data/adminInitialData';
import { fmtMoney } from '../../../lib/moneyFormat';

interface TourOccupancyItem {
  tourTitle: string;
  bookedPax: number;
  capacity: number;
  occupancyPercent: number;
  remainingSeats: number;
  isOverbooked: boolean;
  isFull: boolean;
  status: string;
  statusLabel: string;
}

interface TopViewedTour extends TourItem {
  viewCount: number;
}

interface OverviewOccupancyViewsCardsProps {
  tourOccupancies: TourOccupancyItem[];
  topViewedTours: TopViewedTour[];
  bookingsCount: number;
  toursCount: number;
  servicesCount: number;
  blogsCount: number;
  faqsCount: number;
  testimonialsCount: number;
  setActiveTab: (tab: AdminTab) => void;
}

export const OverviewOccupancyViewsCards: React.FC<OverviewOccupancyViewsCardsProps> = ({
  tourOccupancies,
  topViewedTours,
  bookingsCount,
  toursCount,
  servicesCount,
  blogsCount,
  faqsCount,
  testimonialsCount,
  setActiveTab,
}) => {
  return (
    <div className="space-y-8">
      {/* TUR KONTENJAN & TEKNE DOLULUK BAROMETRESİ */}
      <div className="bg-white dark:bg-surface-2 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-lg">
              ⛵
            </span>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Tur Kontenjan & Tekne Doluluk Barometresi
              </h3>
              <p className="text-xs text-slate-500">
                Bugünün turlarındaki canlı koltuk doluluğu ve overbooking koruması.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('tours')}
            className="text-xs font-bold text-brand-primary dark:text-brand-accent hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            Tüm Tur Kataloğunu İncele →
          </button>
        </div>

        {tourOccupancies.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Bugün için planlanmış tekne turu bulunmuyor.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tourOccupancies.map((occ) => (
              <div
                key={occ.tourTitle}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                      {occ.tourTitle}
                    </h4>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold border shrink-0 ${
                        occ.isOverbooked
                          ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800 animate-pulse'
                          : occ.isFull
                          ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                          : occ.status === 'critical'
                          ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                      }`}
                    >
                      {occ.statusLabel}
                    </span>
                  </div>

                  <div className="mt-3 flex items-baseline justify-between">
                    <div className="text-xl font-extrabold text-slate-900 dark:text-white">
                      {occ.bookedPax} <span className="text-xs font-normal text-slate-400">/ {occ.capacity} Koltuk</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                      %{occ.occupancyPercent}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        occ.isOverbooked
                          ? 'bg-red-500'
                          : occ.isFull
                          ? 'bg-rose-500'
                          : occ.occupancyPercent >= 80
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, occ.occupancyPercent)}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Kalan Boş Yer:</span>
                  <span className={`font-bold ${occ.remainingSeats <= 3 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {Math.max(0, occ.remainingSeats)} Koltuk
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EN ÇOK İNCELENEN TURLAR & ZİYARETÇİ İLGİ RADARI */}
      <div className="bg-white dark:bg-surface-2 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-lg">
              🔥
            </span>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                En Çok İncelenen Turlar & Ziyaretçi İlgi Radarı
              </h3>
              <p className="text-xs text-slate-500">
                Web sitesi ziyaretçilerinin en çok gezdiği rotalar — popülerlik ve fiyatlandırma kararlarınız için canlı veri.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('tours')}
            className="text-xs font-bold text-brand-primary dark:text-brand-accent hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            Tüm Turları Yönet →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {topViewedTours.map((t, idx) => (
            <div
              key={t.id}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between group hover:border-brand-accent transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center ${
                    idx === 0 ? 'bg-amber-500 text-white shadow-xs' :
                    idx === 1 ? 'bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-white' :
                    idx === 2 ? 'bg-amber-700 text-white' :
                    'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}>
                    #{idx + 1}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-accent bg-brand-accent/10 px-2 py-0.5 rounded-full">
                    {t.viewCount} Ziyaret
                  </span>
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-2 group-hover:text-brand-accent transition-colors">
                  {t.title}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  {t.categoryLabel || t.category || 'Günübirlik Tur'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t.priceThb && t.priceThb > 0 ? `${fmtMoney(t.priceThb)} THB` : 'Teklif Alın'}
                </span>
                <a
                  href={`/turlar/${t.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-brand-primary dark:text-brand-accent hover:underline flex items-center gap-0.5"
                >
                  Görüntüle ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Content Navigation Cards */}
      <div>
        <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white mb-4">
          İçerik & Modül Kısayolları
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <button
            onClick={() => setActiveTab('bookings')}
            className="p-5 rounded-2xl bg-white dark:bg-surface-2 border border-slate-200/80 dark:border-slate-800 hover:border-brand-accent transition-all text-left group"
          >
            <Users className="w-6 h-6 text-brand-primary group-hover:scale-110 transition-transform mb-2" />
            <div className="font-bold text-sm text-slate-900 dark:text-white">Müşteriler</div>
            <div className="text-xs text-slate-400">{bookingsCount} Kayıt</div>
          </button>

          <button
            onClick={() => setActiveTab('tours')}
            className="p-5 rounded-2xl bg-white dark:bg-surface-2 border border-slate-200/80 dark:border-slate-800 hover:border-brand-accent transition-all text-left group"
          >
            <Compass className="w-6 h-6 text-emerald-500 group-hover:scale-110 transition-transform mb-2" />
            <div className="font-bold text-sm text-slate-900 dark:text-white">Turlar</div>
            <div className="text-xs text-slate-400">{toursCount} Tur</div>
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className="p-5 rounded-2xl bg-white dark:bg-surface-2 border border-slate-200/80 dark:border-slate-800 hover:border-brand-accent transition-all text-left group"
          >
            <Car className="w-6 h-6 text-blue-500 group-hover:scale-110 transition-transform mb-2" />
            <div className="font-bold text-sm text-slate-900 dark:text-white">Hizmetler</div>
            <div className="text-xs text-slate-400">{servicesCount} Sayfa</div>
          </button>

          <button
            onClick={() => setActiveTab('blogs')}
            className="p-5 rounded-2xl bg-white dark:bg-surface-2 border border-slate-200/80 dark:border-slate-800 hover:border-brand-accent transition-all text-left group"
          >
            <BookOpen className="w-6 h-6 text-purple-500 group-hover:scale-110 transition-transform mb-2" />
            <div className="font-bold text-sm text-slate-900 dark:text-white">Blog & Rehber</div>
            <div className="text-xs text-slate-400">{blogsCount} Yazı</div>
          </button>

          <button
            onClick={() => setActiveTab('faqs')}
            className="p-5 rounded-2xl bg-white dark:bg-surface-2 border border-slate-200/80 dark:border-slate-800 hover:border-brand-accent transition-all text-left group"
          >
            <HelpCircle className="w-6 h-6 text-amber-500 group-hover:scale-110 transition-transform mb-2" />
            <div className="font-bold text-sm text-slate-900 dark:text-white">SSS Soruları</div>
            <div className="text-xs text-slate-400">{faqsCount} Soru</div>
          </button>

          <button
            onClick={() => setActiveTab('testimonials')}
            className="p-5 rounded-2xl bg-white dark:bg-surface-2 border border-slate-200/80 dark:border-slate-800 hover:border-brand-accent transition-all text-left group"
          >
            <MessageSquareQuote className="w-6 h-6 text-pink-500 group-hover:scale-110 transition-transform mb-2" />
            <div className="font-bold text-sm text-slate-900 dark:text-white">Yorumlar</div>
            <div className="text-xs text-slate-400">{testimonialsCount} Yorum</div>
          </button>
        </div>
      </div>
    </div>
  );
};
