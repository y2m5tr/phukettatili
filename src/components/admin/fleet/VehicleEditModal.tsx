import React from 'react';
import { X } from 'lucide-react';
import { HOTEL_ZONES, type VehicleItem, type VehicleKind } from '../../../data/adminInitialData';
import { KIND_META } from './fleetTypes';

export interface VehicleEditModalProps {
  vehicleModal: VehicleItem | 'new';
  vForm: Partial<VehicleItem>;
  setVForm: React.Dispatch<React.SetStateAction<Partial<VehicleItem>>>;
  onClose: () => void;
  onSave: () => void;
}

export function VehicleEditModal({
  vehicleModal,
  vForm,
  setVForm,
  onClose,
  onSave,
}: VehicleEditModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-surface-2 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <header className="sticky top-0 bg-white dark:bg-surface-2 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white">
            {vehicleModal === 'new' ? 'Yeni Araç' : 'Aracı Düzenle'}
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
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-1.5">
              Araç Adı *
            </label>
            <input
              type="text"
              value={vForm.label || ''}
              onChange={(e) => setVForm({ ...vForm, label: e.target.value })}
              placeholder="Örn: Minibüs 4 (Kata & Karon)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-1.5">
                Tür
              </label>
              <select
                value={vForm.kind || 'minibus'}
                onChange={(e) => setVForm({ ...vForm, kind: e.target.value as VehicleKind })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none"
              >
                {(Object.keys(KIND_META) as VehicleKind[]).map((k) => (
                  <option key={k} value={k}>
                    {KIND_META[k].label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-1.5">
                Koltuk Kapasitesi *
              </label>
              <input
                type="number"
                min={1}
                value={vForm.capacity ?? ''}
                onChange={(e) => setVForm({ ...vForm, capacity: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-1.5">
                Bölge / Hat
              </label>
              <select
                value={vForm.zone || ''}
                onChange={(e) => setVForm({ ...vForm, zone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none"
              >
                {HOTEL_ZONES.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-1.5">
                Plaka
              </label>
              <input
                type="text"
                value={vForm.plateNo || ''}
                onChange={(e) => setVForm({ ...vForm, plateNo: e.target.value })}
                placeholder="Örn: กข 1234"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
              />
            </div>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={vForm.active ?? true}
              onChange={(e) => setVForm({ ...vForm, active: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 text-brand-accent focus:ring-brand-accent"
            />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Aktif (atama listelerinde görünsün)
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
            className="px-5 py-2.5 rounded-xl bg-brand-primary text-white font-bold text-sm shadow-xs hover:bg-brand-primary/90 transition-all cursor-pointer"
          >
            Kaydet
          </button>
        </footer>
      </div>
    </div>
  );
}
