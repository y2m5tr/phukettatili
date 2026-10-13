import { useState } from 'react';
import {
  Car,
  Users,
  Plus,
  Edit2,
  Trash2,
  X,
  Bus,
  Crown,
  Ship,
  MapPin,
  Phone,
} from 'lucide-react';
import {
  HOTEL_ZONES,
  type VehicleItem,
  type DriverItem,
  type VehicleKind,
} from '../../data/adminInitialData';

interface Props {
  vehicles: VehicleItem[];
  drivers: DriverItem[];
  onSaveVehicles: (next: VehicleItem[]) => void;
  onSaveDrivers: (next: DriverItem[]) => void;
  showToast: (msg: string) => void;
}

const KIND_META: Record<VehicleKind, { label: string; icon: typeof Car; accent: string }> = {
  minibus: { label: 'Minibüs', icon: Bus, accent: 'text-sky-500 bg-sky-50 dark:bg-sky-950/50' },
  vip: { label: 'VIP', icon: Crown, accent: 'text-amber-500 bg-amber-50 dark:bg-amber-950/50' },
  speedboat: { label: 'Sürat Teknesi', icon: Ship, accent: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/50' },
  other: { label: 'Diğer', icon: Car, accent: 'text-slate-500 bg-slate-100 dark:bg-slate-800' },
};

const ROLE_LABEL: Record<DriverItem['role'], string> = {
  driver: 'Şoför',
  guide: 'Rehber',
  both: 'Şoför + Rehber',
};

function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Araç filosu ve şoför/rehber kadrosu yönetimi.
 * Eskiden transfer sekmesindeki <select> içinde sabit yazılı olan liste
 * buradan yönetiliyor; yeni araç/kadro eklemek için kod değişikliği gerekmez.
 */
export default function FleetManager({
  vehicles,
  drivers,
  onSaveVehicles,
  onSaveDrivers,
  showToast,
}: Props) {
  const [vehicleModal, setVehicleModal] = useState<VehicleItem | 'new' | null>(null);
  const [driverModal, setDriverModal] = useState<DriverItem | 'new' | null>(null);
  const [vForm, setVForm] = useState<Partial<VehicleItem>>({});
  const [dForm, setDForm] = useState<Partial<DriverItem>>({});

  const activeVehicles = vehicles.filter((v) => v.active);
  const activeDrivers = drivers.filter((d) => d.active);
  const totalCapacity = activeVehicles.reduce((sum, v) => sum + (v.capacity || 0), 0);

  const openVehicleModal = (item: VehicleItem | 'new') => {
    setVehicleModal(item);
    setVForm(
      item === 'new'
        ? { kind: 'minibus', capacity: 10, active: true, zone: HOTEL_ZONES[0] }
        : { ...item },
    );
  };

  const handleSaveVehicle = () => {
    const label = (vForm.label || '').trim();
    if (label.length < 2) {
      showToast('⚠️ Araç adı en az 2 karakter olmalı.');
      return;
    }
    const capacity = Number(vForm.capacity) || 0;
    if (capacity < 1) {
      showToast('⚠️ Koltuk kapasitesi en az 1 olmalı.');
      return;
    }

    if (vehicleModal === 'new') {
      const created: VehicleItem = {
        id: newId('veh'),
        label,
        zone: vForm.zone,
        plateNo: (vForm.plateNo || '').trim() || undefined,
        capacity,
        kind: (vForm.kind as VehicleKind) || 'minibus',
        active: vForm.active ?? true,
      };
      onSaveVehicles([...vehicles, created]);
      showToast('✅ Araç eklendi.');
    } else if (vehicleModal) {
      const updated: VehicleItem = {
        ...vehicleModal,
        label,
        zone: vForm.zone,
        plateNo: (vForm.plateNo || '').trim() || undefined,
        capacity,
        kind: (vForm.kind as VehicleKind) || vehicleModal.kind,
        active: vForm.active ?? true,
      };
      onSaveVehicles(vehicles.map((v) => (v.id === updated.id ? updated : v)));
      showToast('✅ Araç güncellendi.');
    }
    setVehicleModal(null);
  };

  const handleDeleteVehicle = (v: VehicleItem) => {
    const linked = drivers.filter((d) => d.vehicleId === v.id).length;
    if (!window.confirm(`"${v.label}" silinsin mi?${linked ? `\n${linked} kadro kaydının araç bağlantısı kaldırılacak.` : ''}`)) {
      return;
    }
    onSaveVehicles(vehicles.filter((x) => x.id !== v.id));
    if (linked) {
      onSaveDrivers(drivers.map((d) => (d.vehicleId === v.id ? { ...d, vehicleId: undefined } : d)));
    }
    showToast('🗑️ Araç silindi.');
  };

  const openDriverModal = (item: DriverItem | 'new') => {
    setDriverModal(item);
    setDForm(item === 'new' ? { role: 'driver', active: true } : { ...item });
  };

  const handleSaveDriver = () => {
    const fullName = (dForm.fullName || '').trim();
    if (fullName.length < 2) {
      showToast('⚠️ Ad soyad en az 2 karakter olmalı.');
      return;
    }

    if (driverModal === 'new') {
      const created: DriverItem = {
        id: newId('drv'),
        fullName,
        phone: (dForm.phone || '').trim() || undefined,
        role: (dForm.role as DriverItem['role']) || 'driver',
        licenseNo: (dForm.licenseNo || '').trim() || undefined,
        vehicleId: dForm.vehicleId || undefined,
        active: dForm.active ?? true,
        notes: (dForm.notes || '').trim() || undefined,
      };
      onSaveDrivers([...drivers, created]);
      showToast('✅ Kadro kaydı eklendi.');
    } else if (driverModal) {
      const updated: DriverItem = {
        ...driverModal,
        fullName,
        phone: (dForm.phone || '').trim() || undefined,
        role: (dForm.role as DriverItem['role']) || driverModal.role,
        licenseNo: (dForm.licenseNo || '').trim() || undefined,
        vehicleId: dForm.vehicleId || undefined,
        active: dForm.active ?? true,
        notes: (dForm.notes || '').trim() || undefined,
      };
      onSaveDrivers(drivers.map((d) => (d.id === updated.id ? updated : d)));
      showToast('✅ Kadro kaydı güncellendi.');
    }
    setDriverModal(null);
  };

  const handleDeleteDriver = (d: DriverItem) => {
    if (!window.confirm(`"${d.fullName}" kadrodan silinsin mi?`)) return;
    onSaveDrivers(drivers.filter((x) => x.id !== d.id));
    showToast('🗑️ Kadro kaydı silindi.');
  };

  const vehicleLabel = (id?: string) => vehicles.find((v) => v.id === id)?.label || '—';

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white dark:bg-surface-2 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300">
              <Car className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
              Filo & Kadro Yönetimi
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Araç hatlarını ve şoför/rehber kadrosunu buradan yönetin. Transfer sekmesindeki
            atama listeleri bu kayıtlardan beslenir.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right pr-4 border-r border-slate-200 dark:border-slate-700">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Aktif Kapasite</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              {totalCapacity} <span className="text-xs font-medium text-slate-500">kişi</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => openVehicleModal('new')}
            className="px-3.5 py-2 rounded-xl bg-brand-primary text-white font-bold text-xs shadow-xs hover:bg-brand-primary/90 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Araç Ekle
          </button>
          <button
            type="button"
            onClick={() => openDriverModal('new')}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs hover:bg-emerald-500 transition-all flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5" /> Kadro Ekle
          </button>
        </div>
      </div>

      {/* Vehicles */}
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
                          onClick={() => {
                            const next = vehicles.map((x) => (x.id === v.id ? { ...x, active: !x.active } : x));
                            onSaveVehicles(next);
                            showToast(v.active ? '⏸️ Araç pasife alındı.' : '▶️ Araç aktifleştirildi.');
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-[11px] font-bold"
                        >
                          {v.active ? 'Pasif' : 'Aktif'}
                        </button>
                        <button
                          type="button"
                          onClick={() => openVehicleModal(v)}
                          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-brand-primary hover:text-white transition-colors"
                          title="Düzenle"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteVehicle(v)}
                          className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-colors"
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

      {/* Drivers */}
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
                        onClick={() => {
                          const next = drivers.map((x) => (x.id === d.id ? { ...x, active: !x.active } : x));
                          onSaveDrivers(next);
                          showToast(d.active ? '⏸️ Kadro pasife alındı.' : '▶️ Kadro aktifleştirildi.');
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-[11px] font-bold"
                      >
                        {d.active ? 'Pasif' : 'Aktif'}
                      </button>
                      <button
                        type="button"
                        onClick={() => openDriverModal(d)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-brand-primary hover:text-white transition-colors"
                        title="Düzenle"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDriver(d)}
                        className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-colors"
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

      {/* Vehicle Modal */}
      {vehicleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-2 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <header className="sticky top-0 bg-white dark:bg-surface-2 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white">
                {vehicleModal === 'new' ? 'Yeni Araç' : 'Aracı Düzenle'}
              </h3>
              <button
                type="button"
                onClick={() => setVehicleModal(null)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
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
                onClick={() => setVehicleModal(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-200 transition-colors"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleSaveVehicle}
                className="px-5 py-2.5 rounded-xl bg-brand-primary text-white font-bold text-sm shadow-xs hover:bg-brand-primary/90 transition-all"
              >
                Kaydet
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* Driver Modal */}
      {driverModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-2 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <header className="sticky top-0 bg-white dark:bg-surface-2 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white">
                {driverModal === 'new' ? 'Yeni Kadro Kaydı' : 'Kadroyu Düzenle'}
              </h3>
              <button
                type="button"
                onClick={() => setDriverModal(null)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
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
                onClick={() => setDriverModal(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-200 transition-colors"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleSaveDriver}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-xs hover:bg-emerald-500 transition-all"
              >
                Kaydet
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
