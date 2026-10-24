import React from 'react';
import { Plus, Trash2, Users } from 'lucide-react';
import type { Booking, PassengerItem } from '../../../data/adminInitialData';

export interface BookingCustomerPassengersProps {
  formData: Partial<Booking>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Booking>>>;
  passengers: PassengerItem[];
  handleAddPassenger: () => void;
  handleUpdatePassenger: (index: number, field: keyof PassengerItem, value: any) => void;
  handleRemovePassenger: (index: number) => void;
  handleAutoSyncPaxCount: () => void;
}

export function BookingCustomerPassengers({
  formData,
  setFormData,
  passengers,
  handleAddPassenger,
  handleUpdatePassenger,
  handleRemovePassenger,
  handleAutoSyncPaxCount,
}: BookingCustomerPassengersProps) {
  return (
    <div className="space-y-4">
      {/* Müşteri Adı, Pasaport No (Opsiyonel) ve Telefon */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
        <div className="sm:col-span-5">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
              👤 Müşteri Adı & Soyadı *
            </label>
            <button
              type="button"
              onClick={handleAddPassenger}
              className="text-[11px] text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              title="Ailesi veya arkadaş grubuyla gelen diğer kişileri ekleyin"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Başka Müşteri Ekle</span>
            </button>
          </div>
          <input
            type="text"
            required
            placeholder="Örn: Mehmet Can"
            value={formData.customerName || ''}
            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/40 font-medium"
          />
        </div>

        <div className="sm:col-span-3">
          <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
            🛂 Pasaport No (Opsiyonel)
          </label>
          <input
            type="text"
            placeholder="Örn: U12345678"
            value={
              formData.passengers && formData.passengers.length > 0 && formData.passengers[0]?.passportNo
                ? formData.passengers[0].passportNo
                : ''
            }
            onChange={(e) => {
              const val = e.target.value.toUpperCase();
              const currentPax = formData.passengers || [];
              if (currentPax.length === 0) {
                setFormData({
                  ...formData,
                  passengers: [
                    {
                      id: 'lead-pax',
                      fullName: formData.customerName || '',
                      passportNo: val,
                      passportNumber: val,
                      isChild: false,
                    },
                  ],
                });
              } else {
                const updated = [...currentPax];
                updated[0] = {
                  ...updated[0],
                  passportNo: val,
                  passportNumber: val,
                };
                setFormData({ ...formData, passengers: updated });
              }
            }}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono uppercase text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-accent/40"
          />
        </div>

        <div className="sm:col-span-4">
          <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
            📞 Telefon / WhatsApp No *
          </label>
          <input
            type="text"
            required
            placeholder="Örn: +90 532 123 45 67"
            value={formData.phone || ''}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/40 font-medium"
          />
        </div>
      </div>

      {/* 👥 BİRLİKTE GELEN DİĞER MÜŞTERİLER / AİLE & ARKADAŞ GRUBU */}
      {passengers.length > 0 && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/5 border border-amber-500/20 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-500" />
                <span>Birlikte Gelen Diğer Müşteriler / Aile Bireyleri ({passengers.length} Kişi)</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold">
                {passengers.filter((p) => p.isChild).length} Çocuk ·{' '}
                {passengers.filter((p) => !p.isChild).length} Yetişkin
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAutoSyncPaxCount}
                className="text-[11px] text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                title="Eklenen kişileri otomatik olarak yetişkin ve çocuk sayılarına aktarır"
              >
                <span>⚡ Pax Sayısını Eşitle</span>
              </button>
              <button
                type="button"
                onClick={handleAddPassenger}
                className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Kişi Ekle</span>
              </button>
            </div>
          </div>

          {/* Her Bir Ek Yolcu Satırı */}
          <div className="space-y-2">
            {passengers.map((pax, idx) => (
              <div
                key={pax.id || idx}
                className="p-2.5 sm:p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
              >
                <span className="text-xs font-bold text-slate-400 w-5 text-center shrink-0">
                  #{idx + 1}
                </span>

                {/* Yolcu Adı Soyadı */}
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    placeholder={`Yolcu #${idx + 1} Adı Soyadı (Örn: Ayşe Can)`}
                    value={pax.fullName || ''}
                    onChange={(e) => handleUpdatePassenger(idx, 'fullName', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                {/* Pasaport No (Opsiyonel) */}
                <div className="w-full sm:w-44 shrink-0">
                  <input
                    type="text"
                    placeholder="Pasaport No (Opsiyonel)"
                    value={pax.passportNo || pax.passportNumber || ''}
                    onChange={(e) => handleUpdatePassenger(idx, 'passportNo', e.target.value.toUpperCase())}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono uppercase text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                {/* Çocuk mu? Tik Kutusu */}
                <label
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 cursor-pointer select-none transition-colors shrink-0 ${
                    pax.isChild
                      ? 'bg-pink-500/15 border-pink-500/30 text-pink-600 dark:text-pink-400'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(pax.isChild)}
                    onChange={(e) => handleUpdatePassenger(idx, 'isChild', e.target.checked)}
                    className="rounded border-slate-300 text-pink-600 focus:ring-pink-500 w-3.5 h-3.5 cursor-pointer"
                  />
                  <span>{pax.isChild ? '👶 Çocuk' : '👤 Yetişkin'}</span>
                </label>

                {/* Satırı Sil */}
                <button
                  type="button"
                  onClick={() => handleRemovePassenger(idx)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors shrink-0 cursor-pointer self-end sm:self-center"
                  title="Bu yolcuyu kaldır"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
