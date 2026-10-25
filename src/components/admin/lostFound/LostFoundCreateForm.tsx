import React from 'react';
import { Plus, CheckCircle2 } from 'lucide-react';
import {
  type LostFoundItemType,
  ITEM_TYPE_LABELS,
} from '../../../lib/lostAndFound';

export interface LostFoundCreateFormProps {
  isAddFormOpen: boolean;
  setIsAddFormOpen: (v: boolean) => void;
  onSubmit: (e: React.SyntheticEvent) => void;
  newItemType: LostFoundItemType;
  setNewItemType: (v: LostFoundItemType) => void;
  newTitle: string;
  setNewTitle: (v: string) => void;
  newVehicle: string;
  setNewVehicle: (v: string) => void;
  newDriver: string;
  setNewDriver: (v: string) => void;
  newDriverPhone: string;
  setNewDriverPhone: (v: string) => void;
  newGuestName: string;
  setNewGuestName: (v: string) => void;
  newGuestPhone: string;
  setNewGuestPhone: (v: string) => void;
  newHotelName: string;
  setNewHotelName: (v: string) => void;
  newDescription: string;
  setNewDescription: (v: string) => void;
  newLocation: string;
  setNewLocation: (v: string) => void;
}

export function LostFoundCreateForm({
  isAddFormOpen,
  setIsAddFormOpen,
  onSubmit,
  newItemType,
  setNewItemType,
  newTitle,
  setNewTitle,
  newVehicle,
  setNewVehicle,
  newDriver,
  setNewDriver,
  newDriverPhone,
  setNewDriverPhone,
  newGuestName,
  setNewGuestName,
  newGuestPhone,
  setNewGuestPhone,
  newHotelName,
  setNewHotelName,
  newDescription,
  setNewDescription,
  newLocation,
  setNewLocation,
}: LostFoundCreateFormProps) {
  if (!isAddFormOpen) return null;

  return (
    <form
      onSubmit={onSubmit}
      className="p-5 border-b border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/20 space-y-3.5 animate-in slide-in-from-top duration-200"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black uppercase text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
          <Plus className="w-4 h-4" />
          <span>Yeni Kayıp / Unutulan Eşya Kaydı</span>
        </h3>
        <button
          type="button"
          onClick={() => setIsAddFormOpen(false)}
          className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
        >
          Vazgeç
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Eşya Türü</label>
          <select
            value={newItemType}
            onChange={(e) => setNewItemType(e.target.value as LostFoundItemType)}
            className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
          >
            {Object.entries(ITEM_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.icon} {v.label}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
            Eşya Başlığı / Marka Model *
          </label>
          <input
            type="text"
            required
            placeholder="Örn: Siyah Ray-Ban Güneş Gözlüğü, iPhone 15 Pro, Mavi Plaj Çantası"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Araç / Tekne / Tur</label>
          <input
            type="text"
            placeholder="Örn: VIP Van 35-1249 veya Phi Phi Speedboat"
            value={newVehicle}
            onChange={(e) => setNewVehicle(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Şoför / Rehber & Tel</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Şoför Adı (Örn: Somchai)"
              value={newDriver}
              onChange={(e) => setNewDriver(e.target.value)}
              className="w-2/3 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
            />
            <input
              type="tel"
              placeholder="+66..."
              value={newDriverPhone}
              onChange={(e) => setNewDriverPhone(e.target.value)}
              className="w-1/3 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Misafir Adı</label>
          <input
            type="text"
            placeholder="Misafir Ad Soyad"
            value={newGuestName}
            onChange={(e) => setNewGuestName(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Misafir Tel (WhatsApp)</label>
          <input
            type="tel"
            placeholder="+90 532..."
            value={newGuestPhone}
            onChange={(e) => setNewGuestPhone(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Otel & Oda No</label>
          <input
            type="text"
            placeholder="Örn: Amari Patong (Oda 412)"
            value={newHotelName}
            onChange={(e) => setNewHotelName(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Eşya Detayı / Nerede Bulundu</label>
          <input
            type="text"
            placeholder="Örn: Arka koltuk cebinde unutulmuş, çizik yok"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Muhafaza Konumu</label>
          <input
            type="text"
            placeholder="Örn: Araç Torpido Gözü / Patong Ofis Kasa"
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Eşyayı Sisteme Kaydet</span>
        </button>
      </div>
    </form>
  );
}
