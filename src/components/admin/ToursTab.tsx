import { useState } from 'react';
import {
  Plus,
  Table,
  LayoutGrid,
  Save,
  Sparkles,
  FolderPlus,
} from 'lucide-react';
import type { TourItem, CategoryItem } from '../../data/adminTypes';
import { ToursCardsView } from './tours/ToursCardsView';
import { ToursGridView } from './tours/ToursGridView';

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
        <ToursCardsView
          filteredTours={filteredTours}
          selectedTourIds={selectedTourIds}
          toggleSelectTour={toggleSelectTour}
          getImageUrl={getImageUrl}
          onToggleFeatured={onToggleFeatured}
          onOpenEdit={onOpenEdit}
          onDelete={onDelete}
          onOpenQuotePdf={onOpenQuotePdf}
        />
      )}

      {/* GÖRÜNÜM 2: EXCEL TİPİ HIZLI FİYAT & KONTENJAN MATRİSİ */}
      {viewMode === 'grid' && (
        <ToursGridView
          filteredTours={filteredTours}
          selectedTourIds={selectedTourIds}
          selectAllTours={selectAllTours}
          toggleSelectTour={toggleSelectTour}
          editedOrders={editedOrders}
          handleOrderChange={handleOrderChange}
          editedDurations={editedDurations}
          handleDurationChange={handleDurationChange}
          editedPrices={editedPrices}
          handlePriceChange={handlePriceChange}
          getImageUrl={getImageUrl}
          onToggleFeatured={onToggleFeatured}
          onOpenQuotePdf={onOpenQuotePdf}
          onOpenEdit={onOpenEdit}
          onDelete={onDelete}
        />
      )}
    </div>
  );
}
