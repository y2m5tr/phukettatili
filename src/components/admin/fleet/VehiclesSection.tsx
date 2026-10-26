
import { Bus, MapPin, Edit2, Trash2 } from 'lucide-react';
import type { VehicleItem, DriverItem } from '../../../data/adminInitialData';
import { KIND_META } from './fleetTypes';

export interface VehiclesSectionProps {
  vehicles: VehicleItem[];
  drivers: DriverItem[];
  activeVehicles: VehicleItem[];
  onToggleActive: (v: VehicleItem) => void;
  onEdit: (v: VehicleItem) => void;
  onDelete: (v: VehicleItem) => void;
}

export function VehiclesSection({
  vehicles,
  drivers,
  activeVehicles,
  onToggleActive,
  onEdit,
  onDelete,
}: VehiclesSectionProps) {
  return (
    <section className="bg-white dark:bg-surface-2 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
      <header className="px-5 sm:px-6 py-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Bus className="w-4 h-4 text-sky-500" /> Araçlar
          <span className="text-xs font-semibold text-slate-500">
            ({activeVehicles.length}/{vehicles.length} aktif)
          </span>
        </h3>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900/50 text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
            <tr>
              <th className="text-left py-3 px-5 font-semibold">Araç</th>
              <th className="text-left py-3 px-5 font-semibold">Tür</th>
              <th className="text-left py-3 px-5 font-semibold">Bölge / Hat</th>
              <th className="text-center py-3 px-5 font-semibold">Kapasite</th>
              <th className="text-left py-3 px-5 font-semibold">Kadro</th>
              <th className="text-right py-3 px-5 font-semibold">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {vehicles.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-slate-500">
                  Henüz araç eklenmedi. "Araç Ekle" ile başlayın.
                </td>
              </tr>
            )}
            {vehicles.map((v) => {
              const meta = KIND_META[v.kind];
              const Icon = meta.icon;
              const assigned = drivers.filter((d) => d.vehicleId === v.id && d.active);
              return (
                <tr key={v.id} className={v.active ? '' : 'opacity-50'}>
                  <td className="py-4 px-5">
                    <span className="font-bold text-slate-900 dark:text-white block">{v.label}</span>
                    {v.plateNo && (
                      <span className="text-[11px] text-slate-500 font-mono">{v.plateNo}</span>
                    )}
                  </td>
                  <td className="py-4 px-5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${meta.accent}`}>
                      <Icon className="w-3 h-3" /> {meta.label}
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <span className="text-xs text-sky-600 dark:text-sky-400 font-semibold inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {v.zone || 'Genel'}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-center font-bold text-slate-900 dark:text-white">
                    {v.capacity}
                  </td>
                  <td className="py-4 px-5">
                    {assigned.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {assigned.map((d) => (
                          <span
                            key={d.id}
                            className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                          >
                            {d.fullName}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400">Atanmadı</span>
                    )}
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onToggleActive(v)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-[11px] font-bold cursor-pointer"
                      >
                        {v.active ? 'Pasif' : 'Aktif'}
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(v)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-brand-primary hover:text-white transition-colors cursor-pointer"
                        title="Düzenle"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(v)}
                        className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
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
    </section>
  );
}
