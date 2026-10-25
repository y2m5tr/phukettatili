import React from 'react';
import { X } from 'lucide-react';
import type { DriverItem, VehicleItem } from '../../../data/adminInitialData';
import { ROLE_LABEL } from './fleetTypes';

export interface DriverEditModalProps {
  driverModal: DriverItem | 'new';
  dForm: Partial<DriverItem>;
  setDForm: React.Dispatch<React.SetStateAction<Partial<DriverItem>>>;
  activeVehicles: VehicleItem[];
  onClose: () => void;
  onSave: () => void;
}

export function DriverEditModal({
  driverModal,
  dForm,
  setDForm,
  activeVehicles,
  onClose,
  onSave,
}: DriverEditModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-surface-2 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <header className="sticky top-0 bg-white dark:bg-surface-2 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white">
            {driverModal === 'new' ? 'Yeni Kadro Kaydı' : 'Kadroyu Düzenle'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-1.5">
                Ad Soyad *
              </label>
              <input
                type="text"
                value={dForm.fullName || ''}
                onChange={(e) => setDForm({ ...dForm, fullName: e.target.value })}
                placeholder="Örn: Deniz Yılmaz"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-1.5">
                Görev
              </label>
              <select
                value={dForm.role || 'driver'}
                onChange={(e) => setDForm({ ...dForm, role: e.target.value as DriverItem['role'] })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none"
              >
                {(Object.keys(ROLE_LABEL) as DriverItem['role'][]).map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABEL[r]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-1.5">
                Telefon (WhatsApp)
              </label>
              <input
                type="tel"
                value={dForm.phone || ''}
                onChange={(e) => setDForm({ ...dForm, phone: e.target.value })}
                placeholder="+66 ..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-1.5">
                Ehliyet No
              </label>
              <input
                type="text"
                value={dForm.licenseNo || ''}
                onChange={(e) => setDForm({ ...dForm, licenseNo: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-1.5">
              Bağlı Araç
            </label>
            <select
              value={dForm.vehicleId || ''}
              onChange={(e) => setDForm({ ...dForm, vehicleId: e.target.value || undefined })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="">— Araç atanmadı —</option>
              {activeVehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-1.5">
              Notlar
            </label>
            <textarea
              value={dForm.notes || ''}
              onChange={(e) => setDForm({ ...dForm, notes: e.target.value })}
              rows={3}
              placeholder="Dil bilgisi, çalışma günleri, özel durumlar..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-accent/50 resize-none"
            />
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={dForm.active ?? true}
              onChange={(e) => setDForm({ ...dForm, active: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 text-brand-accent focus:ring-brand-accent"
            />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Aktif (görevlendirilebilir)
            </span>
          </label>
        </div>

        <footer className="sticky bottom-0 bg-white dark:bg-surface-2 px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={onSave}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-xs hover:bg-emerald-500 transition-all cursor-pointer"
          >
            Kaydet
          </button>
        </footer>
      </div>
    </div>
  );
}
