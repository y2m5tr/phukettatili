import React from 'react';
import type { Booking } from '../../../data/adminInitialData';

export interface BookingSummaryInputsProps {
  formData: Partial<Booking>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Booking>>>;
}

export function BookingSummaryInputs({ formData, setFormData }: BookingSummaryInputsProps) {
  return (
    <div className="space-y-4">
      {/* Yolcu Sayıları, Satış Tutarı, Kapora ve Durum */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
        <div>
          <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
            Yetişkin Sayısı
          </label>
          <input
            type="number"
            min="1"
            value={formData.adultCount || 1}
            onChange={(e) => {
              const count = Number(e.target.value) || 1;
              const curTours = formData.tours || [];
              const calculatedTotal =
                curTours.reduce((acc, t) => acc + (t.priceThb || 0), 0) * count;
              setFormData({
                ...formData,
                adultCount: count,
                totalPriceThb: calculatedTotal > 0 ? calculatedTotal : formData.totalPriceThb,
              });
            }}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-semibold focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
            Çocuk Sayısı
          </label>
          <input
            type="number"
            min="0"
            value={formData.childCount || 0}
            onChange={(e) => setFormData({ ...formData, childCount: Number(e.target.value) })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-semibold focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
            Toplam Satış (THB)
          </label>
          <input
            type="number"
            value={formData.totalPriceThb || 0}
            onChange={(e) =>
              setFormData({ ...formData, totalPriceThb: Number(e.target.value) })
            }
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none font-bold text-brand-primary"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
            Alınan Kapora (THB)
          </label>
          <input
            type="number"
            value={formData.paidAmountThb || 0}
            onChange={(e) =>
              setFormData({ ...formData, paidAmountThb: Number(e.target.value) })
            }
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none text-emerald-600 font-bold"
          />
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
            Durum
          </label>
          <select
            value={formData.status || 'confirmed'}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value as Booking['status'] })
            }
            className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none font-bold"
          >
            <option value="inquiry">🟡 Teklif</option>
            <option value="confirmed">🟢 Onaylandı</option>
            <option value="completed">🔵 Tamamlandı</option>
            <option value="cancelled">🔴 İptal</option>
          </select>
        </div>
      </div>

      {/* Özel Notlar */}
      <div>
        <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
          📝 Özel Notlar / İstekler
        </label>
        <textarea
          rows={2}
          placeholder="Vejetaryen yemek tercihi, çocuk koltuğu, lobi bekleme özel talimatı vb."
          value={formData.specialNotes || ''}
          onChange={(e) => setFormData({ ...formData, specialNotes: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
        />
      </div>
    </div>
  );
}
