import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { SupplierCategory, SupplierItem } from '../../../data/adminInitialData';
import { SUPPLIER_CATEGORY_LABELS } from './categoryLabels';

export interface SupplierFormModalProps {
  editingSupplier: SupplierItem | null;
  initialForm: Partial<SupplierItem>;
  onClose: () => void;
  onSave: (form: Partial<SupplierItem>) => void;
}

// MODAL: YENİ / DÜZENLE TEDARİKÇİ — SuppliersTab'den birebir taşındı.
// Form durumu bu bileşende tutulur: modal koşullu render edildiği için her
// açılışta yeniden monte olur; kabukta başlangıç değerleri initialForm ile
// geçirilir (eski davranışla birebir aynı).
export default function SupplierFormModal({
  editingSupplier,
  initialForm,
  onClose,
  onSave,
}: SupplierFormModalProps) {
  const [supplierForm, setSupplierForm] = useState<Partial<SupplierItem>>(
    editingSupplier ? { ...editingSupplier } : initialForm
  );

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    onSave(supplierForm);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-surface-2 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-7 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {editingSupplier ? 'Tedarikçi Firmayı Düzenle' : 'Yeni Tedarikçi Firma Ekle'}
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
              onClick={onClose}
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
  );
}
