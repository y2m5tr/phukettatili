import { useState } from 'react';
import {
  Plus,
  Star,
  Clock,
  Edit2,
  Eye,
  Trash2,
  FileText,
  Table,
  LayoutGrid,
  Save,
  CheckSquare,
  Square,
  Sparkles,
  FolderPlus,
} from 'lucide-react';
import type { TourItem, CategoryItem } from '../../data/adminTypes';

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
  onBulkUpdateTours?: (updatedTours: TourItem[]) => void;
  onOpenMultiTourProposal?: (selectedTours: TourItem[]) => void;
  categories?: CategoryItem[];
  onOpenCategoryModal?: () => void;
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
  onBulkUpdateTours,
  onOpenMultiTourProposal,
  categories = [],
  onOpenCategoryModal,
}: ToursTabProps) {
  const [viewMode, setViewMode] = useState<'cards' | 'grid'>('cards');
  const [selectedTourIds, setSelectedTourIds] = useState<string[]>([]);
  const [editedPrices, setEditedPrices] = useState<Record<string, number>>({});
  const [editedDurations, setEditedDurations] = useState<Record<string, string>>({});
  const [editedOrders, setEditedOrders] = useState<Record<string, number>>({});
  const [hasUnsavedGridChanges, setHasUnsavedGridChanges] = useState<boolean>(false);

  const toggleSelectTour = (id: string) => {
    setSelectedTourIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllTours = () => {
    if (selectedTourIds.length === filteredTours.length) {
      setSelectedTourIds([]);
    } else {
      setSelectedTourIds(filteredTours.map((t) => t.id));
    }
  };

  const handlePriceChange = (tourId: string, value: number) => {
    setEditedPrices((prev) => ({ ...prev, [tourId]: value }));
    setHasUnsavedGridChanges(true);
  };

  const handleDurationChange = (tourId: string, value: string) => {
    setEditedDurations((prev) => ({ ...prev, [tourId]: value }));
    setHasUnsavedGridChanges(true);
  };

  const handleOrderChange = (tourId: string, value: number) => {
    setEditedOrders((prev) => ({ ...prev, [tourId]: value }));
    setHasUnsavedGridChanges(true);
  };

  const handleSaveGridChanges = () => {
    if (!onBulkUpdateTours) return;
    const updated = tours.map((t) => {
      let mod = { ...t };
      if (editedPrices[t.id] !== undefined) {
        mod.priceThb = editedPrices[t.id];
      }
      if (editedDurations[t.id] !== undefined) {
        mod.duration = editedDurations[t.id];
      }
      if (editedOrders[t.id] !== undefined) {
        mod.order = editedOrders[t.id];
      }
      return mod;
    });
    onBulkUpdateTours(updated);
    setEditedPrices({});
    setEditedDurations({});
    setEditedOrders({});
    setHasUnsavedGridChanges(false);
  };

  const handleCreateMultiProposal = () => {
    if (!onOpenMultiTourProposal) return;
    const selected = tours.filter((t) => selectedTourIds.includes(t.id));
    if (selected.length > 0) {
      onOpenMultiTourProposal(selected);
    }
  };

  return (
    <div className="space-y-6">
      {/* Üst Yönetim Barı */}
      <div className="bg-white dark:bg-surface-2 p-4 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
              Turlar & Fiyat Yönetimi ({tours.length})
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              Canlı Katalog
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Fiyatları kart veya Excel tipi hızlı matrisle güncelleyin, tur ekleyin veya paket teklifi oluşturun.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Görünüm Değiştirici: Kartlar vs Matris */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-slate-800 text-brand-primary dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Kart Görünümü"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Kartlar</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-800 text-brand-primary dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Excel Tipi Hızlı Fiyat Matrisi"
            >
              <Table className="w-4 h-4" />
              <span className="hidden sm:inline">Hızlı Matris</span>
            </button>
          </div>

          <input
            type="text"
            value={tourSearchQuery}
            onChange={(e) => setTourSearchQuery(e.target.value)}
            placeholder="Tur ara..."
            className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none"
          />

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

          {onOpenCategoryModal && (
            <button
              type="button"
              onClick={onOpenCategoryModal}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              title="Kategorileri Düzenle / Yeni Kategori Ekle"
            >
              <FolderPlus className="w-4 h-4 text-brand-accent" />
              <span>Kategoriler {categories.length > 0 ? `(${categories.length})` : ''}</span>
            </button>
          )}

          <button
            onClick={onOpenCreate}
            className="px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs sm:text-sm font-bold shadow-md shadow-brand-primary/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Tur</span>
          </button>
        </div>
      </div>

      {/* Çoklu Seçim Barı (Paket Teklifi Üretici) */}
      {selectedTourIds.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
              {selectedTourIds.length}
            </span>
            <span className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200">
              Tur seçildi. Bu turları birleştirerek misafire anında özel paket teklifi sunabilirsiniz.
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onOpenMultiTourProposal && (
              <button
                type="button"
                onClick={handleCreateMultiProposal}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-white font-bold text-xs shadow-md shadow-brand-accent/20 flex items-center justify-center gap-1.5 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Özel Paket Teklifi Oluştur (WhatsApp / PDF)</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setSelectedTourIds([])}
              className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-700"
            >
              Seçimi Temizle
            </button>
          </div>
        </div>
      )}

      {/* Matris Değişiklik Kaydetme Uyarısı */}
      {hasUnsavedGridChanges && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-200">
              Matriste henüz kaydedilmemiş fiyat/süre değişiklikleri bulunuyor.
            </span>
          </div>
          <button
            type="button"
            onClick={handleSaveGridChanges}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Tüm Fiyat Değişikliklerini Kaydet</span>
          </button>
        </div>
      )}

      {/* GÖRÜNÜM 1: KARTLAR */}
      {viewMode === 'cards' && (
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
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/90 backdrop-blur-md text-slate-950 font-mono shadow-xs" title="Listeleme Sıra Numarası (Order)">
                      #{t.order ?? 10}
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
                          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                          title="Bu Tur İçin Kurumsal Teklif PDF / WhatsApp Paylaşımı Oluştur"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => onOpenEdit(t)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-brand-primary hover:text-white transition-colors cursor-pointer"
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
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                        title="Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* GÖRÜNÜM 2: EXCEL TİPİ HIZLI FİYAT & KONTENJAN MATRİSİ */}
      {viewMode === 'grid' && (
        <div className="bg-white dark:bg-surface-2 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4 w-12 text-center">
                    <button
                      type="button"
                      onClick={selectAllTours}
                      className="hover:text-brand-accent"
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
                  const currentDuration = editedDurations[t.id] !== undefined ? editedDurations[t.id] : (t.duration || 'Tam Gün');
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
                            t.featured ? 'text-amber-500 hover:text-amber-600' : 'text-slate-300 dark:text-slate-600 hover:text-slate-400'
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
      )}
    </div>
  );
}
