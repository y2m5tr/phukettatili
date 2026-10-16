/**
 * Turlar & Fiyatlar sekmesi — AdminDashboard'tan ayrıldı.
 *
 * Not: Diğer CMS sekmeleri gibi YEREL kaydeder (localStorage);
 * canlıya yansıtma ayrı bir iş maddesidir (Keystatic entegrasyonu).
 */
import { Plus, Star, Clock, Edit2, Eye, Trash2, FileText } from 'lucide-react';
import type { TourItem } from '../../data/adminInitialData';

interface ToursTabProps {
  tours: TourItem[];
  /** Arama + kategori filtresinden geçmiş liste — parent'taki useMemo sonucu. */
  filteredTours: TourItem[];
  tourSearchQuery: string;
  setTourSearchQuery: (q: string) => void;
  tourCategoryFilter: string;
  setTourCategoryFilter: (c: string) => void;
  /** Mevcut kategoriler (parent'ta turlar'dan türetilir). */
  tourCategoryOptions: string[];
  /** Görsel URL çözümleyici — AdminDashboard ile aynı davranış. */
  getImageUrl: (img?: string) => string;
  onOpenCreate: () => void;
  onOpenEdit: (t: TourItem) => void;
  onToggleFeatured: (id: string) => void;
  onDelete: (id: string, title: string) => void;
  onOpenQuotePdf?: (t: TourItem) => void;
}

export default function ToursTab({
  tours,
  filteredTours,
  tourSearchQuery,
  setTourSearchQuery,
  tourCategoryFilter,
  setTourCategoryFilter,
  tourCategoryOptions,
  getImageUrl,
  onOpenCreate,
  onOpenEdit,
  onToggleFeatured,
  onDelete,
  onOpenQuotePdf,
}: ToursTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-surface-2 p-4 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
            Turlar & Fiyat Yönetimi ({tours.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Tur ekleyin, kapak görselini seçin, fiyatları güncelleyin veya silin.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={tourSearchQuery}
            onChange={(e) => setTourSearchQuery(e.target.value)}
            placeholder="Tur ara..."
            className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none"
          />
          {/* Kategori filtresi — tourCategoryFilter state'i eskiden ölüydü.
              Turlar categories alanıyla geliyor; mevcut kategoriler dinamik türetilir. */}
          <select
            value={tourCategoryFilter}
            onChange={(e) => setTourCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">Tüm Kategoriler</option>
            {tourCategoryOptions.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button
            onClick={onOpenCreate}
            className="px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs sm:text-sm font-bold shadow-md shadow-brand-primary/20 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Tur Ekle</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTours.map((t) => (
          <div
            key={t.id}
            className="bg-white dark:bg-surface-2 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col hover:border-brand-accent/50 transition-colors"
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
              <div className="absolute top-3 left-3">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/20">
                  {t.categoryLabel || t.category}
                </span>
              </div>
              <button
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
                    {t.priceThb > 0 ? `${t.priceThb.toLocaleString()} THB` : 'Teklif Alın'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {onOpenQuotePdf && (
                    <button
                      type="button"
                      onClick={() => onOpenQuotePdf(t)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-colors"
                      title="Bu Tur İçin Kurumsal Teklif PDF Oluştur"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => onOpenEdit(t)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-brand-primary hover:text-white transition-colors"
                    title="Tüm Ayrıntılarıyla Düzenle"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href={`/turlar/${t.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-brand-accent hover:text-white transition-colors"
                    title="Sitede Gör"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => onDelete(t.id, t.title)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-red-500 hover:text-white transition-colors"
                    title="Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
