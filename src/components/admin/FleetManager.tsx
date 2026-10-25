import { useState } from 'react';
import { Car, Users, Plus } from 'lucide-react';
import {
  HOTEL_ZONES,
  type VehicleItem,
  type DriverItem,
  type VehicleKind,
} from '../../data/adminInitialData';
import { newFleetId } from './fleet/fleetTypes';
import { VehicleEditModal } from './fleet/VehicleEditModal';
import { DriverEditModal } from './fleet/DriverEditModal';
import { VehiclesSection } from './fleet/VehiclesSection';
import { DriversSection } from './fleet/DriversSection';

interface Props {
  vehicles: VehicleItem[];
  drivers: DriverItem[];
  onSaveVehicles: (next: VehicleItem[]) => void;
  onSaveDrivers: (next: DriverItem[]) => void;
  showToast: (msg: string) => void;
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
        id: newFleetId('veh'),
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
    if (
      !window.confirm(
        `"${v.label}" silinsin mi?${linked ? `\n${linked} kadro kaydının araç bağlantısı kaldırılacak.` : ''}`
      )
    ) {
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
        id: newFleetId('drv'),
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

  const handleToggleVehicleActive = (v: VehicleItem) => {
    const next = vehicles.map((x) => (x.id === v.id ? { ...x, active: !x.active } : x));
    onSaveVehicles(next);
    showToast(v.active ? '⏸️ Araç pasife alındı.' : '▶️ Araç aktifleştirildi.');
  };

  const handleToggleDriverActive = (d: DriverItem) => {
    const next = drivers.map((x) => (x.id === d.id ? { ...x, active: !x.active } : x));
    onSaveDrivers(next);
    showToast(d.active ? '⏸️ Kadro pasife alındı.' : '▶️ Kadro aktifleştirildi.');
  };

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
            className="px-3.5 py-2 rounded-xl bg-brand-primary text-white font-bold text-xs shadow-xs hover:bg-brand-primary/90 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Araç Ekle
          </button>
          <button
            type="button"
            onClick={() => openDriverModal('new')}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs hover:bg-emerald-500 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" /> Kadro Ekle
          </button>
        </div>
      </div>

      {/* Vehicles Section */}
      <VehiclesSection
        vehicles={vehicles}
        drivers={drivers}
        activeVehicles={activeVehicles}
        onToggleActive={handleToggleVehicleActive}
        onEdit={(v) => openVehicleModal(v)}
        onDelete={handleDeleteVehicle}
      />

      {/* Drivers Section */}
      <DriversSection
        drivers={drivers}
        vehicles={vehicles}
        activeDrivers={activeDrivers}
        onToggleActive={handleToggleDriverActive}
        onEdit={(d) => openDriverModal(d)}
        onDelete={handleDeleteDriver}
      />

      {/* Vehicle Modal */}
      {vehicleModal && (
        <VehicleEditModal
          vehicleModal={vehicleModal}
          vForm={vForm}
          setVForm={setVForm}
          onClose={() => setVehicleModal(null)}
          onSave={handleSaveVehicle}
        />
      )}

      {/* Driver Modal */}
      {driverModal && (
        <DriverEditModal
          driverModal={driverModal}
          dForm={dForm}
          setDForm={setDForm}
          activeVehicles={activeVehicles}
          onClose={() => setDriverModal(null)}
          onSave={handleSaveDriver}
        />
      )}
    </div>
  );
}
