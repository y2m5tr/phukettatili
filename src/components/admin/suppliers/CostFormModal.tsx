import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { SupplierItem, TourCostItem, TourItem } from '../../../data/adminInitialData';
import { fmtMoney } from '../../../lib/moneyFormat';

export interface CostFormModalProps {
  editingCost: TourCostItem | null;
  initialForm: Partial<TourCostItem>;
  tours: TourItem[];
  suppliers: SupplierItem[];
  onClose: () => void;
  onSave: (form: Partial<TourCostItem>) => void;
}

// MODAL: YENİ / DÜZENLE TUR NET ALIŞ MALİYETİ — SuppliersTab'den birebir
// taşındı. Form durumu bu bileşende tutulur: modal koşullu render edildiği
// için her açılışta yeniden monte olur; başlangıç değerleri initialForm ile
// geçirilir (eski davranışla birebir aynı).
export default function CostFormModal({
  editingCost,
  initialForm,
  tours,
  suppliers,
  onClose,
  onSave,
}: CostFormModalProps) {
  const [costForm, setCostForm] = useState<Partial<TourCostItem>>(
    editingCost ? { ...editingCost } : initialForm
  );

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    onSave(costForm);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-surface-2 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-7 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {editingCost ? 'Net Alış Fiyatını Düzenle' : 'Yeni Tur Net Alış Fiyatı Tanımla'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
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
              onClick={onClose}
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
  );
}
