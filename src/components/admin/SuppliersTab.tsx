import { useState, useMemo } from 'react';
import { DollarSign, Plus, Ship } from 'lucide-react';
import {
  type SupplierItem,
  type TourCostItem,
  type TourItem,
} from '../../data/adminInitialData';
import SuppliersKpiCards from './suppliers/SuppliersKpiCards';
import CostMatrixTable from './suppliers/CostMatrixTable';
import SuppliersTable from './suppliers/SuppliersTable';
import SupplierFormModal from './suppliers/SupplierFormModal';
import CostFormModal from './suppliers/CostFormModal';

// 500 satır kuralı: KPI kartları, maliyet matrisi, tedarikçi tablosu ve iki
// modal ./suppliers/ klasörüne taşındı. Bu kabuk state, filtreler ve
// kaydetme/silme mantığını tutar — davranış birebir aynı.
// SUPPLIER_CATEGORY_LABELS dışa açık yüzeyi korumak için yeniden export edilir.
export { SUPPLIER_CATEGORY_LABELS } from './suppliers/categoryLabels';

interface SuppliersTabProps {
  suppliers: SupplierItem[];
  tourCosts: TourCostItem[];
  tours: TourItem[];
  onSaveSuppliers: (suppliers: SupplierItem[]) => void;
  onSaveTourCosts: (costs: TourCostItem[]) => void;
  showToast: (msg: string) => void;
}

// Yeni tedarikçi / yeni maliyet modalları için varsayılan başlangıç değerleri
// (eski kabuktaki "+ Yeni" buton davranışının birebir karşılığı).
const NEW_SUPPLIER_FORM: Partial<SupplierItem> = {
  category: 'speedboat',
  paymentTerms: 'weekly_friday',
  rating: 5,
  active: true,
};

export default function SuppliersTab({
  suppliers,
  tourCosts,
  tours,
  onSaveSuppliers,
  onSaveTourCosts,
  showToast,
}: SuppliersTabProps) {
  const [subTab, setSubTab] = useState<'costs' | 'suppliers'>('costs');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modal: Tedarikçi Ekle / Düzenle
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierItem | null>(null);

  // Modal: Tur Maliyeti Ekle / Düzenle
  const [isCostModalOpen, setIsCostModalOpen] = useState(false);
  const [editingCost, setEditingCost] = useState<TourCostItem | null>(null);
  const [newCostInitialForm, setNewCostInitialForm] = useState<Partial<TourCostItem>>({});

  // Filtrelenmiş Maliyet Kayıtları
  const filteredCosts = useMemo(() => {
    return tourCosts.filter((c) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.tourTitle.toLowerCase().includes(q) ||
        c.supplierName.toLowerCase().includes(q) ||
        (c.notes || '').toLowerCase().includes(q)
      );
    });
  }, [tourCosts, searchQuery]);

  // Filtrelenmiş Tedarikçiler
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      if (categoryFilter !== 'all' && s.category !== categoryFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.pierOrLocation.toLowerCase().includes(q) ||
        (s.contactPerson || '').toLowerCase().includes(q) ||
        s.phone.includes(q)
      );
    });
  }, [suppliers, searchQuery, categoryFilter]);

  // Tedarikçi Kaydet (form durumu artık modalda)
  const handleSaveSupplier = (supplierForm: Partial<SupplierItem>) => {
    if (!supplierForm.name || !supplierForm.pierOrLocation) {
      showToast('⚠️ Firma adı ve iskele/konum zorunludur.');
      return;
    }

    if (editingSupplier) {
      const updated = suppliers.map((s) =>
        s.id === editingSupplier.id ? ({ ...s, ...supplierForm } as SupplierItem) : s
      );
      onSaveSuppliers(updated);
      showToast(`✅ "${supplierForm.name}" güncellendi.`);
    } else {
      const newSupplier: SupplierItem = {
        id: `sup-${Date.now().toString().slice(-6)}`,
        name: supplierForm.name.trim(),
        category: supplierForm.category || 'speedboat',
        contactPerson: supplierForm.contactPerson?.trim() || undefined,
        phone: supplierForm.phone?.trim() || '',
        email: supplierForm.email?.trim() || undefined,
        pierOrLocation: supplierForm.pierOrLocation.trim(),
        paymentTerms: supplierForm.paymentTerms || 'weekly_friday',
        bankDetails: supplierForm.bankDetails?.trim() || undefined,
        rating: Number(supplierForm.rating) || 5,
        active: true,
        notes: supplierForm.notes?.trim() || undefined,
      };
      onSaveSuppliers([...suppliers, newSupplier]);
      showToast(`🎉 Yeni tedarikçi "${newSupplier.name}" eklendi.`);
    }

    setIsSupplierModalOpen(false);
    setEditingSupplier(null);
  };

  // Tedarikçi Sil
  const handleDeleteSupplier = (id: string, name: string) => {
    if (!confirm(`"${name}" tedarikçisini silmek istediğinizden emin misiniz?`)) return;
    const updated = suppliers.filter((s) => s.id !== id);
    onSaveSuppliers(updated);
    showToast(`🗑️ "${name}" silindi.`);
  };

  // Tur Net Maliyeti Kaydet (form durumu artık modalda)
  const handleSaveCost = (costForm: Partial<TourCostItem>) => {
    if (!costForm.tourTitle || !costForm.supplierName || !costForm.netCostAdultThb) {
      showToast('⚠️ Tur, tedarikçi ve yetişkin net alış fiyatı zorunludur.');
      return;
    }

    const matchedTour = tours.find((t) => t.title === costForm.tourTitle || t.id === costForm.tourId);
    const matchedSupplier = suppliers.find((s) => s.name === costForm.supplierName);

    if (editingCost) {
      const updated = tourCosts.map((c) =>
        c.id === editingCost.id ? ({ ...c, ...costForm } as TourCostItem) : c
      );
      onSaveTourCosts(updated);
      showToast(`✅ "${costForm.tourTitle}" net alış fiyatı güncellendi.`);
    } else {
      const newCost: TourCostItem = {
        id: `cost-${Date.now().toString().slice(-6)}`,
        tourId: matchedTour?.id || 'genel-tur',
        tourTitle: costForm.tourTitle.trim(),
        supplierId: matchedSupplier?.id || 'genel-tedarikci',
        supplierName: costForm.supplierName.trim(),
        netCostAdultThb: Number(costForm.netCostAdultThb) || 0,
        netCostChildThb: Number(costForm.netCostChildThb) || Math.round(Number(costForm.netCostAdultThb) * 0.7),
        nationalParkFeeIncluded: costForm.nationalParkFeeIncluded ?? false,
        notes: costForm.notes?.trim() || undefined,
      };
      onSaveTourCosts([...tourCosts, newCost]);
      showToast(`🎉 "${newCost.tourTitle}" için net alış maliyeti kataloğa eklendi.`);
    }

    setIsCostModalOpen(false);
    setEditingCost(null);
  };

  // Tur Net Maliyeti Sil
  const handleDeleteCost = (id: string, title: string) => {
    if (!confirm(`"${title}" net maliyet kaydını silmek istediğinizden emin misiniz?`)) return;
    const updated = tourCosts.filter((c) => c.id !== id);
    onSaveTourCosts(updated);
    showToast(`🗑️ "${title}" net maliyeti silindi.`);
  };

  return (
    <div className="space-y-6">
      {/* 1. ÜST KPI KARTLARI */}
      <SuppliersKpiCards suppliers={suppliers} tourCosts={tourCosts} />

      {/* 2. KONTROL ÇUBUĞU & ALT SEKMELER */}
      <div className="bg-white dark:bg-surface-2 p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Alt Sekme Seçici */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setSubTab('costs')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'costs'
                ? 'bg-white dark:bg-surface-1 text-slate-900 dark:text-white shadow-2xs font-extrabold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
            <span>Net Alış Fiyat Kataloğu ({tourCosts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('suppliers')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'suppliers'
                ? 'bg-white dark:bg-surface-1 text-slate-900 dark:text-white shadow-2xs font-extrabold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Ship className="w-3.5 h-3.5 text-sky-500" />
            <span>Tedarikçi Firmalar ({suppliers.length})</span>
          </button>
        </div>

        {/* Eylem Butonları */}
        <div className="flex items-center gap-2.5">
          {subTab === 'costs' ? (
            <button
              type="button"
              onClick={() => {
                setEditingCost(null);
                setNewCostInitialForm({
                  tourTitle: tours[0]?.title || '',
                  supplierName: suppliers[0]?.name || '',
                  netCostAdultThb: 1800,
                  netCostChildThb: 1200,
                  nationalParkFeeIncluded: false,
                });
                setIsCostModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tur Net Alış Fiyatı Tanımla</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setEditingSupplier(null);
                setIsSupplierModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-brand-primary text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Yeni Tedarikçi Firma Ekle</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. GÖRÜNÜM A: NET ALIŞ FİYAT KATALOĞU (COST MATRIX) */}
      {subTab === 'costs' && (
        <CostMatrixTable
          filteredCosts={filteredCosts}
          tours={tours}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onEditCost={(c) => {
            setEditingCost(c);
            setIsCostModalOpen(true);
          }}
          onDeleteCost={handleDeleteCost}
        />
      )}

      {/* 4. GÖRÜNÜM B: TEDARİKÇİ FİRMALAR */}
      {subTab === 'suppliers' && (
        <SuppliersTable
          suppliers={suppliers}
          filteredSuppliers={filteredSuppliers}
          searchQuery={searchQuery}
          categoryFilter={categoryFilter}
          onSearchChange={setSearchQuery}
          onCategoryChange={setCategoryFilter}
          onEditSupplier={(s) => {
            setEditingSupplier(s);
            setIsSupplierModalOpen(true);
          }}
          onDeleteSupplier={handleDeleteSupplier}
        />
      )}

      {/* 5. MODAL: YENİ / DÜZENLE TEDARİKÇİ */}
      {isSupplierModalOpen && (
        <SupplierFormModal
          editingSupplier={editingSupplier}
          initialForm={NEW_SUPPLIER_FORM}
          onClose={() => {
            setIsSupplierModalOpen(false);
            setEditingSupplier(null);
          }}
          onSave={handleSaveSupplier}
        />
      )}

      {/* 6. MODAL: YENİ / DÜZENLE TUR NET ALIŞ MALİYETİ */}
      {isCostModalOpen && (
        <CostFormModal
          editingCost={editingCost}
          initialForm={newCostInitialForm}
          tours={tours}
          suppliers={suppliers}
          onClose={() => {
            setIsCostModalOpen(false);
            setEditingCost(null);
          }}
          onSave={handleSaveCost}
        />
      )}
    </div>
  );
}
