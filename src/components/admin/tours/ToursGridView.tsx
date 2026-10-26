
import {
  Star,
  Edit2,
  Eye,
  Trash2,
  FileText,
  CheckSquare,
  Square,
} from 'lucide-react';
import type { TourItem } from '../../../data/adminTypes';

export interface ToursGridViewProps {
  filteredTours: TourItem[];
  selectedTourIds: string[];
  selectAllTours: () => void;
  toggleSelectTour: (id: string) => void;
  editedOrders: Record<string, number>;
  handleOrderChange: (tourId: string, value: number) => void;
  editedDurations: Record<string, string>;
  handleDurationChange: (tourId: string, value: string) => void;
  editedPrices: Record<string, number>;
  handlePriceChange: (tourId: string, value: number) => void;
  getImageUrl: (img?: string) => string;
  onToggleFeatured: (id: string) => void;
  onOpenQuotePdf?: (t: TourItem) => void;
  onOpenEdit: (t: TourItem) => void;
  onDelete: (id: string, title: string) => void;
}

export function ToursGridView({
  filteredTours,
  selectedTourIds,
  selectAllTours,
  toggleSelectTour,
  editedOrders,
  handleOrderChange,
  editedDurations,
  handleDurationChange,
  editedPrices,
  handlePriceChange,
  getImageUrl,
  onToggleFeatured,
  onOpenQuotePdf,
  onOpenEdit,
  onDelete,
}: ToursGridViewProps) {
  return (
    <div className="bg-white dark:bg-surface-2 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
              <th className="py-3 px-4 w-12 text-center">
                <button
                  type="button"
                  onClick={selectAllTours}
                  className="hover:text-brand-accent cursor-pointer"
                  title="Tümünü Seç / Kaldır"
                >
                  {selectedTourIds.length === filteredTours.length && filteredTours.length > 0 ? (
                    <CheckSquare className="w-4 h-4 text-brand-accent" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="py-3 px-4 w-20 text-center">Sıra No</th>
              <th className="py-3 px-4">Tur Adı & Kategori</th>
              <th className="py-3 px-4 w-36">Süre / Saat</th>
              <th className="py-3 px-4 w-44">Yetişkin Fiyatı (THB)</th>
              <th className="py-3 px-4 w-28 text-center">Öne Çıkan</th>
              <th className="py-3 px-4 w-36 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredTours.map((t) => {
              const isSelected = selectedTourIds.includes(t.id);
              const currentPrice = editedPrices[t.id] !== undefined ? editedPrices[t.id] : t.priceThb;
              const currentDuration =
                editedDurations[t.id] !== undefined ? editedDurations[t.id] : (t.duration || 'Tam Gün');
              const isPriceModified = editedPrices[t.id] !== undefined && editedPrices[t.id] !== t.priceThb;

              return (
                <tr
                  key={t.id}
                  className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                    isSelected ? 'bg-amber-500/5 dark:bg-amber-500/10' : ''
                  }`}
                >
                  {/* Seçim kutusu */}
                  <td className="py-3 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectTour(t.id)}
                      className="w-4 h-4 rounded text-brand-accent focus:ring-brand-accent cursor-pointer"
                    />
                  </td>

                  {/* Sıra No Düzenleme */}
                  <td className="py-3 px-4 text-center">
                    <input
                      type="number"
                      min="1"
                      value={editedOrders[t.id] !== undefined ? editedOrders[t.id] : (t.order ?? 10)}
                      onChange={(e) => handleOrderChange(t.id, Number(e.target.value))}
                      className={`w-16 px-2 py-1.5 rounded-lg text-center font-bold text-xs bg-slate-50 dark:bg-slate-900 border ${
                        editedOrders[t.id] !== undefined
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                          : 'border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                      } focus:outline-none focus:border-brand-accent`}
                      title="Listelenme Sıra Numarası (1 en üstte)"
                    />
                  </td>

                  {/* Tur Adı + Görsel */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={getImageUrl(t.image)}
                        alt=""
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/phuket_hero.webp';
                        }}
                      />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block line-clamp-1">
                          {t.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {t.categoryLabel || t.category} · ID: {t.id}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Süre Düzenleme */}
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={currentDuration}
                      onChange={(e) => handleDurationChange(t.id, e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-brand-accent"
                      placeholder="Örn: Tam Gün"
                    />
                  </td>

                  {/* Fiyat Düzenleme (THB) */}
                  <td className="py-3 px-4">
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="50"
                        value={currentPrice || ''}
                        onChange={(e) => handlePriceChange(t.id, Number(e.target.value))}
                        placeholder="0 (Teklif)"
                        className={`w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-brand-accent pr-12 ${
                          isPriceModified
                            ? 'border-amber-500 bg-amber-500/10 dark:bg-amber-500/10'
                            : 'border-slate-200 dark:border-slate-700'
                        }`}
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 font-bold">
                        THB
                      </span>
                    </div>
                  </td>

                  {/* Öne Çıkarılan */}
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => onToggleFeatured(t.id)}
                      className={`p-1.5 rounded-full text-xs transition-colors cursor-pointer ${
                        t.featured
                          ? 'text-amber-500 hover:text-amber-600'
                          : 'text-slate-300 dark:text-slate-600 hover:text-slate-400'
                      }`}
                      title={t.featured ? 'Öne Çıkarılan' : 'Öne Çıkar'}
                    >
                      <Star className={`w-4 h-4 ${t.featured ? 'fill-current' : ''}`} />
                    </button>
                  </td>

                  {/* İşlem Butonları */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {onOpenQuotePdf && (
                        <button
                          type="button"
                          onClick={() => onOpenQuotePdf(t)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-blue-600 dark:text-blue-400 transition-colors"
                          title="Teklif PDF / WhatsApp"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onOpenEdit(t)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                        title="Düzenle"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href={`/turlar/${t.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                        title="Sitede Gör"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => onDelete(t.id, t.title)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500 transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
