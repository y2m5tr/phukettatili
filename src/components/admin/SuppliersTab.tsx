import React, { useState, useMemo } from 'react';
import {
  Ship,
  DollarSign,
  TrendingUp,
  Plus,
  Search,
  Phone,
  Edit2,
  Trash2,
  X,
  MapPin,
} from 'lucide-react';
import {
  type SupplierItem,
  type TourCostItem,
  type TourItem,
  type SupplierCategory,
} from '../../data/adminInitialData';
import { fmtMoney } from '../../lib/moneyFormat';

interface SuppliersTabProps {
  suppliers: SupplierItem[];
  tourCosts: TourCostItem[];
  tours: TourItem[];
  onSaveSuppliers: (suppliers: SupplierItem[]) => void;
  onSaveTourCosts: (costs: TourCostItem[]) => void;
  showToast: (msg: string) => void;
}

export const SUPPLIER_CATEGORY_LABELS: Record<SupplierCategory, { label: string; icon: string }> = {
  speedboat: { label: 'Sürat Teknesi', icon: '🚤' },
  catamaran: { label: 'Katamaran', icon: '⛵' },
  yacht: { label: 'VIP Yat', icon: '🛥️' },
  adventure: { label: 'Zipline & Macera', icon: '🧗' },
  show: { label: 'Şov & Tema Parkı', icon: '🎭' },
  safari: { label: 'Fil & Safari', icon: '🐘' },
  transfer: { label: 'Kara Transferi', icon: '🚐' },
  other: { label: 'Diğer Hizmet', icon: '🌴' },
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
  const [supplierForm, setSupplierForm] = useState<Partial<SupplierItem>>({});

  // Modal: Tur Maliyeti Ekle / Düzenle
  const [isCostModalOpen, setIsCostModalOpen] = useState(false);
  const [editingCost, setEditingCost] = useState<TourCostItem | null>(null);
  const [costForm, setCostForm] = useState<Partial<TourCostItem>>({});

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

  // Tedarikçi Kaydet
  const handleSaveSupplier = (e: React.SyntheticEvent) => {
    e.preventDefault();
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
    setSupplierForm({});
  };

  // Tedarikçi Sil
  const handleDeleteSupplier = (id: string, name: string) => {
    if (!confirm(`"${name}" tedarikçisini silmek istediğinizden emin misiniz?`)) return;
    const updated = suppliers.filter((s) => s.id !== id);
    onSaveSuppliers(updated);
    showToast(`🗑️ "${name}" silindi.`);
  };

  // Tur Net Maliyeti Kaydet
  const handleSaveCost = (e: React.SyntheticEvent) => {
    e.preventDefault();
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
    setCostForm({});
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
      {/* ==================================================== */}
      {/* 1. ÜST KPI KARTLARI */}
      {/* ==================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Tedarikçi Sayısı */}
        <div className="bg-white dark:bg-surface-2 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Anlaşmalı Tedarikçiler
            </span>
            <div className="w-8 h-8 rounded-xl bg-brand-primary/10 text-brand-primary dark:text-brand-accent flex items-center justify-center font-bold">
              <Ship className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-serif">
            {suppliers.length}{' '}
            <span className="text-xs font-sans text-slate-400 font-semibold">Firma</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Tekne, macera, şov ve safari operatörleri
          </div>
        </div>

        {/* KPI 2: Fiyat Kataloğu Kalem Sayısı */}
        <div className="bg-white dark:bg-surface-2 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Net Alış Kataloğu
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-serif">
            {tourCosts.length}{' '}
            <span className="text-xs font-sans text-slate-400 font-semibold">Tur Maliyeti</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Rezervasyonlarda otomatik kâr hesaplar
          </div>
        </div>

        {/* KPI 3: Ortalama Yetişkin Net Alışı */}
        <div className="bg-white dark:bg-surface-2 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Ort. Net Tur Alışı
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-sky-600 dark:text-sky-400 font-serif">
            {tourCosts.length > 0
              ?fmtMoney( Math.round(
                  tourCosts.reduce((acc, c) => acc + c.netCostAdultThb, 0) / tourCosts.length
                ))
              : 0}{' '}
            <span className="text-xs font-sans text-slate-400 font-semibold">THB</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Kişi başı ortalama acenta maliyeti
          </div>
        </div>

        {/* KPI 4: Çıkış İskeleleri */}
        <div className="bg-white dark:bg-surface-2 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Aktif İskele & Marinalar
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-serif">
            {new Set(suppliers.map((s) => s.pierOrLocation)).size}{' '}
            <span className="text-xs font-sans text-slate-400 font-semibold">Nokta</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Rassada, Ao Po, Chalong vb.
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 2. KONTROL ÇUBUĞU & ALT SEKMELER */}
      {/* ==================================================== */}
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
                setCostForm({
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
                setSupplierForm({
                  category: 'speedboat',
                  paymentTerms: 'weekly_friday',
                  rating: 5,
                  active: true,
                });
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

      {/* ==================================================== */}
      {/* 3. GÖRÜNÜM A: NET ALIŞ FİYAT KATALOĞU (COST MATRIX) */}
      {/* ==================================================== */}
      {subTab === 'costs' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tur adı veya tedarikçi firma ara..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-surface-2 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="bg-white dark:bg-surface-2 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/40 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-4">Tur Adı</th>
                    <th className="py-3.5 px-4">Tedarikçi Firma</th>
                    <th className="py-3.5 px-4">Net Alış (Yetişkin)</th>
                    <th className="py-3.5 px-4">Net Alış (Çocuk)</th>
                    <th className="py-3.5 px-4">Satış Liste Fiyatı</th>
                    <th className="py-3.5 px-4">Tahmini Net Marj</th>
                    <th className="py-3.5 px-4 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredCosts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        Net alış maliyeti bulunamadı. Üstteki butonla yeni ekleyebilirsiniz.
                      </td>
                    </tr>
                  ) : (
                    filteredCosts.map((c) => {
                      const matchedTour = tours.find(
                        (t) => t.id === c.tourId || t.title === c.tourTitle
                      );
                      const salePrice = matchedTour?.priceThb || 0;
                      const profitPerAdult = Math.max(0, salePrice - c.netCostAdultThb);
                      const marginPercent =
                        salePrice > 0 ? Math.round((profitPerAdult / salePrice) * 100) : 0;

                      return (
                        <tr
                          key={c.id}
                          className="hover:bg-slate-50/60 dark:hover:bg-slate-900/30 transition-colors"
                        >
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {c.tourTitle}
                            </span>
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              {c.nationalParkFeeIncluded ? '✅ Milli Park Dahil' : '⚠️ Milli Park Hariç'}
                              {c.notes ? ` · ${c.notes}` : ''}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                              <Ship className="w-3.5 h-3.5 text-sky-500" />
                              <span>{c.supplierName}</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-4 font-mono font-bold text-rose-600 dark:text-rose-400">
                            {fmtMoney(c.netCostAdultThb)} THB
                          </td>

                          <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                            {fmtMoney(c.netCostChildThb)} THB
                          </td>

                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                            {salePrice > 0 ? `${fmtMoney(salePrice)} THB` : '—'}
                          </td>

                          <td className="py-3.5 px-4">
                            {salePrice > 0 ? (
                              <div>
                                <span className="font-bold text-emerald-600 dark:text-emerald-400 block font-mono">
                                  +{fmtMoney(profitPerAdult)} THB
                                </span>
                                <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                                  %{marginPercent} Kâr Marjı
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCost(c);
                                  setCostForm(c);
                                  setIsCostModalOpen(true);
                                }}
                                title="Düzenle"
                                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCost(c.id, c.tourTitle)}
                                title="Sil"
                                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500 hover:border-rose-300 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 4. GÖRÜNÜM B: TEDARİKÇİ FİRMALAR */}
      {/* ==================================================== */}
      {subTab === 'suppliers' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Firma adı, iskele, yetkili veya telefon ara..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-surface-2 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-surface-2 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">Tüm Kategoriler ({suppliers.length})</option>
              {Object.entries(SUPPLIER_CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.icon} {v.label}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white dark:bg-surface-2 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/40 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-4">Tedarikçi Firma</th>
                    <th className="py-3.5 px-4">Kategori & İskele</th>
                    <th className="py-3.5 px-4">İletişim & WhatsApp</th>
                    <th className="py-3.5 px-4">Ödeme Koşulları</th>
                    <th className="py-3.5 px-4">Banka / PromptPay</th>
                    <th className="py-3.5 px-4 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredSuppliers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        Arama kriterlerine uygun tedarikçi firma bulunamadı.
                      </td>
                    </tr>
                  ) : (
                    filteredSuppliers.map((s) => {
                      const cat = SUPPLIER_CATEGORY_LABELS[s.category] || {
                        label: s.category,
                        icon: '🌴',
                      };

                      return (
                        <tr
                          key={s.id}
                          className="hover:bg-slate-50/60 dark:hover:bg-slate-900/30 transition-colors"
                        >
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {s.name}
                            </span>
                            {s.notes && (
                              <span className="text-[11px] text-slate-400 block truncate max-w-xs">
                                {s.notes}
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                              <span>{cat.icon}</span>
                              <span>{cat.label}</span>
                            </span>
                            <span className="text-xs text-slate-600 dark:text-slate-300 block mt-1">
                              📍 {s.pierOrLocation}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            {s.contactPerson && (
                              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                                {s.contactPerson}
                              </span>
                            )}
                            <a
                              href={`https://wa.me/${s.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 mt-0.5"
                            >
                              <Phone className="w-3 h-3" /> {s.phone}
                            </a>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                              {s.paymentTerms === 'weekly_friday'
                                ? 'Haftalık Cuma Mutabakatı'
                                : s.paymentTerms === 'monthly_invoice'
                                ? 'Aylık Fatura'
                                : s.paymentTerms === 'cash_at_pier'
                                ? 'İskelede Peşin'
                                : 'Tur Bazında'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="text-xs text-slate-600 dark:text-slate-400 font-mono block">
                              {s.bankDetails || '—'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingSupplier(s);
                                  setSupplierForm(s);
                                  setIsSupplierModalOpen(true);
                                }}
                                title="Düzenle"
                                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteSupplier(s.id, s.name)}
                                title="Sil"
                                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500 hover:border-rose-300 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 5. MODAL: YENİ / DÜZENLE TEDARİKÇİ */}
      {/* ==================================================== */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-2 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-7 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingSupplier ? 'Tedarikçi Firmayı Düzenle' : 'Yeni Tedarikçi Firma Ekle'}
              </h3>
              <button
                type="button"
                onClick={() => setIsSupplierModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Firma Adı *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Andaman Wave Master"
                    value={supplierForm.name || ''}
                    onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Kategori
                  </label>
                  <select
                    value={supplierForm.category || 'speedboat'}
                    onChange={(e) =>
                      setSupplierForm({ ...supplierForm, category: e.target.value as SupplierCategory })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none"
                  >
                    {Object.entries(SUPPLIER_CATEGORY_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.icon} {v.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    İskele / Çıkış Noktası *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Rassada Pier veya Ao Po"
                    value={supplierForm.pierOrLocation || ''}
                    onChange={(e) =>
                      setSupplierForm({ ...supplierForm, pierOrLocation: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Telefon / WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+66 76 281 234"
                    value={supplierForm.phone || ''}
                    onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Yetkili Kişi
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: K. Somkiat"
                    value={supplierForm.contactPerson || ''}
                    onChange={(e) =>
                      setSupplierForm({ ...supplierForm, contactPerson: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Ödeme Koşulları
                  </label>
                  <select
                    value={supplierForm.paymentTerms || 'weekly_friday'}
                    onChange={(e) =>
                      setSupplierForm({ ...supplierForm, paymentTerms: e.target.value as any })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="weekly_friday">Haftalık Cuma Mutabakatı</option>
                    <option value="monthly_invoice">Aylık Fatura</option>
                    <option value="cash_at_pier">İskelede Peşin</option>
                    <option value="per_booking">Tur / Rezervasyon Bazında</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Banka / PromptPay Hesap Detayı
                </label>
                <input
                  type="text"
                  placeholder="Örn: Kasikorn Bank (K-Bank): 720-2-33445-1"
                  value={supplierForm.bankDetails || ''}
                  onChange={(e) =>
                    setSupplierForm({ ...supplierForm, bankDetails: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold shadow-md"
                >
                  ✓ {editingSupplier ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 6. MODAL: YENİ / DÜZENLE TUR NET ALIŞ MALİYETİ */}
      {/* ==================================================== */}
      {isCostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-2 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-7 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingCost ? 'Net Alış Fiyatını Düzenle' : 'Yeni Tur Net Alış Fiyatı Tanımla'}
              </h3>
              <button
                type="button"
                onClick={() => setIsCostModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCost} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Tur Adı *
                </label>
                <select
                  value={costForm.tourTitle || ''}
                  onChange={(e) => {
                    const sel = e.target.value;
                    const matched = tours.find((t) => t.title === sel);
                    setCostForm({
                      ...costForm,
                      tourTitle: sel,
                      tourId: matched?.id || costForm.tourId,
                    });
                  }}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="">— Tur Seçin —</option>
                  {tours.map((t) => (
                    <option key={t.id} value={t.title}>
                      {t.title} ({t.priceThb != null ? `${fmtMoney(t.priceThb)} ฿ Satış` : '— Satış'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Tedarikçi Firma *
                </label>
                <select
                  value={costForm.supplierName || ''}
                  onChange={(e) => {
                    const sel = e.target.value;
                    const matched = suppliers.find((s) => s.name === sel);
                    setCostForm({
                      ...costForm,
                      supplierName: sel,
                      supplierId: matched?.id || costForm.supplierId,
                    });
                  }}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="">— Tedarikçi Firma Seçin —</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.pierOrLocation})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Net Yetişkin Alışı (THB) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="1800"
                    value={costForm.netCostAdultThb || ''}
                    onChange={(e) =>
                      setCostForm({
                        ...costForm,
                        netCostAdultThb: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-rose-200 dark:border-rose-800 text-sm font-black text-rose-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Net Çocuk Alışı (THB)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="1200"
                    value={costForm.netCostChildThb || ''}
                    onChange={(e) =>
                      setCostForm({
                        ...costForm,
                        netCostChildThb: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-black text-slate-700 dark:text-slate-300 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="npIncludedCheck"
                  checked={costForm.nationalParkFeeIncluded ?? false}
                  onChange={(e) =>
                    setCostForm({ ...costForm, nationalParkFeeIncluded: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-brand-primary"
                />
                <label htmlFor="npIncludedCheck" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Milli Park Ücreti Net Alış Fiyatına Dahil
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Maliyet Notu (Dahil / Hariç Hizmetler)
                </label>
                <input
                  type="text"
                  placeholder="Örn: Açık büfe öğle yemeği ve şnorkel ekipmanı dahil"
                  value={costForm.notes || ''}
                  onChange={(e) => setCostForm({ ...costForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCostModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20"
                >
                  ✓ {editingCost ? 'Maliyeti Güncelle' : 'Kataloğa Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
