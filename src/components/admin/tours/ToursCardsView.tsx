import React from 'react';
import {
  Star,
  Clock,
  Edit2,
  Eye,
  Trash2,
  FileText,
  CheckSquare,
  Square,
} from 'lucide-react';
import type { TourItem } from '../../../data/adminTypes';
import { fmtMoney } from '../../../lib/moneyFormat';

export interface ToursCardsViewProps {
  filteredTours: TourItem[];
  selectedTourIds: string[];
  toggleSelectTour: (id: string) => void;
  getImageUrl: (img?: string) => string;
  onToggleFeatured: (id: string) => void;
  onOpenEdit: (t: TourItem) => void;
  onDelete: (id: string, title: string) => void;
  onOpenQuotePdf?: (t: TourItem) => void;
}

export function ToursCardsView({
  filteredTours,
  selectedTourIds,
  toggleSelectTour,
  getImageUrl,
  onToggleFeatured,
  onOpenEdit,
  onDelete,
  onOpenQuotePdf,
}: ToursCardsViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {filteredTours.map((t) => {
        const isSelected = selectedTourIds.includes(t.id);
        return (
          <div
            key={t.id}
            className={`bg-white dark:bg-surface-2 rounded-3xl border overflow-hidden shadow-sm flex flex-col transition-all ${
              isSelected
                ? 'border-brand-accent ring-2 ring-brand-accent/20'
                : 'border-slate-200/80 dark:border-slate-800 hover:border-brand-accent/50'
            }`}
          >
            <div className="h-44 relative bg-slate-100 dark:bg-slate-900">
              <img
                src={getImageUrl(t.image)}
                alt={t.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/phuket_hero.webp';
                }}
              />
              {/* Seçim onay kutusu (Çoklu paket oluşturma) */}
              <button
                type="button"
                onClick={() => toggleSelectTour(t.id)}
                className="absolute top-3 left-3 p-1.5 rounded-xl bg-black/60 backdrop-blur-md text-white border border-white/20 hover:bg-brand-accent transition-all cursor-pointer"
                title={isSelected ? 'Seçimi Kaldır' : 'Teklif Paketine Ekle'}
              >
                {isSelected ? (
                  <CheckSquare className="w-4 h-4 text-brand-accent fill-current" />
                ) : (
                  <Square className="w-4 h-4 text-white" />
                )}
              </button>

              <div className="absolute top-3 left-12 flex items-center gap-1.5">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/20">
                  {t.categoryLabel || t.category}
                </span>
                <span
                  className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/90 backdrop-blur-md text-slate-950 font-mono shadow-xs"
                  title="Listeleme Sıra Numarası (Order)"
                >
                  #{t.order ?? 10}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onToggleFeatured(t.id)}
                className={`absolute top-3 right-3 p-1.5 rounded-full text-xs font-bold transition-all ${
                  t.featured ? 'bg-amber-500 text-white shadow-md' : 'bg-black/50 text-slate-300 hover:text-white'
                }`}
                title={t.featured ? 'Öne Çıkarılan' : 'Öne Çıkar'}
              >
                <Star className="w-3.5 h-3.5 fill-current" />
              </button>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-1">
                  {t.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{t.duration || 'Tam Gün'}</span>
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[10px]">Kişi Başı Ücret:</span>
                  <span className="font-extrabold text-base text-brand-primary dark:text-white">
                    {t.priceThb > 0 ? `${fmtMoney(t.priceThb)} THB` : 'Teklif Alın'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {onOpenQuotePdf && (
                    <button
                      type="button"
                      onClick={() => onOpenQuotePdf(t)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 transition-colors"
                      title="Teklif PDF / WhatsApp Paylaş"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onOpenEdit(t)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                    title="Düzenle"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <a
                    href={`/turlar/${t.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                    title="Sitede Gör"
                  >
                    <Eye className="w-4 h-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => onDelete(t.id, t.title)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-950/40 text-slate-400 hover:text-red-500 transition-colors"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
