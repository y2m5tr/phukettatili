import React from 'react';
import type { Booking } from '../../../data/adminInitialData';
import { fmtMoney } from '../../../lib/moneyFormat';

export interface BookingModalFooterProps {
  formData: Partial<Booking>;
  remainingBalance: number;
  editingBooking: Booking | null;
  onClose: () => void;
}

export function BookingModalFooter({
  formData,
  remainingBalance,
  editingBooking,
  onClose,
}: BookingModalFooterProps) {
  return (
    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <span>
          Toplam:{' '}
          <strong className="text-slate-900 dark:text-white font-mono">
            {fmtMoney(Number(formData.totalPriceThb) || 0)} ฿
          </strong>
        </span>
        <span>·</span>
        <span>
          Kapora:{' '}
          <strong className="text-emerald-600 font-mono">
            {fmtMoney(Number(formData.paidAmountThb) || 0)} ฿
          </strong>
        </span>
        <span>·</span>
        <span>
          Kalan:{' '}
          <strong className="text-amber-600 font-mono">
            {fmtMoney(remainingBalance)} ฿
          </strong>
        </span>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          Vazgeç
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-bold shadow-md hover:bg-brand-primary/90 transition-all cursor-pointer"
        >
          {editingBooking ? 'Değişiklikleri Kaydet' : 'Rezervasyonu Kaydet'}
        </button>
      </div>
    </div>
  );
}
