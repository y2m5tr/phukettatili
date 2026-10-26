
import { Users, Phone, Edit2, Trash2 } from 'lucide-react';
import type { DriverItem, VehicleItem } from '../../../data/adminInitialData';
import { ROLE_LABEL } from './fleetTypes';

export interface DriversSectionProps {
  drivers: DriverItem[];
  vehicles: VehicleItem[];
  activeDrivers: DriverItem[];
  onToggleActive: (d: DriverItem) => void;
  onEdit: (d: DriverItem) => void;
  onDelete: (d: DriverItem) => void;
}

export function DriversSection({
  drivers,
  vehicles,
  activeDrivers,
  onToggleActive,
  onEdit,
  onDelete,
}: DriversSectionProps) {
  const vehicleLabel = (id?: string) => vehicles.find((v) => v.id === id)?.label || '—';

  return (
    <section className="bg-white dark:bg-surface-2 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
      <header className="px-5 sm:px-6 py-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-500" /> Şoför & Rehber Kadrosu
          <span className="text-xs font-semibold text-slate-500">
            ({activeDrivers.length}/{drivers.length} aktif)
          </span>
        </h3>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900/50 text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
            <tr>
              <th className="text-left py-3 px-5 font-semibold">Ad Soyad</th>
              <th className="text-left py-3 px-5 font-semibold">Görev</th>
              <th className="text-left py-3 px-5 font-semibold">İletişim</th>
              <th className="text-left py-3 px-5 font-semibold">Araç</th>
              <th className="text-right py-3 px-5 font-semibold">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {drivers.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-sm text-slate-500">
                  Henüz kadro kaydı yok. "Kadro Ekle" ile başlayın.
                </td>
              </tr>
            )}
            {drivers.map((d) => (
              <tr key={d.id} className={d.active ? '' : 'opacity-50'}>
                <td className="py-4 px-5">
                  <span className="font-bold text-slate-900 dark:text-white block">{d.fullName}</span>
                  {d.licenseNo && (
                    <span className="text-[11px] text-slate-500 font-mono">Ehliyet: {d.licenseNo}</span>
                  )}
                </td>
                <td className="py-4 px-5">
                  <span className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold">
                    {ROLE_LABEL[d.role]}
                  </span>
                </td>
                <td className="py-4 px-5">
                  {d.phone ? (
                    <a
                      href={`https://wa.me/${d.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-600 hover:underline inline-flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" /> {d.phone}
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-400">—</span>
                  )}
                </td>
                <td className="py-4 px-5 text-xs text-slate-700 dark:text-slate-300 font-semibold">
                  {vehicleLabel(d.vehicleId)}
                </td>
                <td className="py-4 px-5">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => onToggleActive(d)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-[11px] font-bold cursor-pointer"
                    >
                      {d.active ? 'Pasif' : 'Aktif'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(d)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-brand-primary hover:text-white transition-colors cursor-pointer"
                      title="Düzenle"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(d)}
                      className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                      title="Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
