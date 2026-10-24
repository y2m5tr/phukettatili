import React from 'react';
import type { Booking } from '../../../data/adminInitialData';
import { fmtMoney } from '../../../lib/moneyFormat';

export interface BookingFinanceTabProps {
  formData: Partial<Booking>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Booking>>>;
  remainingBalance: number;
}

export function BookingFinanceTab({
  formData,
  setFormData,
  remainingBalance,
}: BookingFinanceTabProps) {
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-500 font-semibold uppercase">Tahsilat Durumu</div>
          <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
            Toplam: {fmtMoney(Number(formData.totalPriceThb) || 0)} THB · Kapora:{' '}
            {fmtMoney(Number(formData.paidAmountThb) || 0)} THB
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-amber-600 uppercase">Kalan Tahsilat:</span>
          <div className="text-lg font-black font-mono text-amber-600 dark:text-amber-400">
            {fmtMoney(remainingBalance)} THB
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
            Kapora Ödeme Yöntemi
          </label>
          <select
            value={formData.depositMethod || 'tr_bank_transfer'}
            onChange={(e) => setFormData({ ...formData, depositMethod: e.target.value as any })}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none font-medium"
          >
            <option value="tr_bank_transfer">🇹🇷 TR Banka Havale / EFT</option>
            <option value="promptpay">📱 PromptPay (K-Bank QR)</option>
            <option value="cash_thb">💵 Nakit THB (El Kasası)</option>
            <option value="credit_card">💳 Kredi Kartı / Online</option>
            <option value="kbank_transfer">🏦 Tayland Banka Havalesi</option>
            <option value="cash_usd">💵 Nakit USD</option>
            <option value="cash_eur">💶 Nakit EUR</option>
            <option value="wise">🌐 Wise / Uluslararası</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
            Bakiye Tahsilat Noktası
          </label>
          <select
            value={formData.collectionLocation || 'hotel_lobby'}
            onChange={(e) =>
              setFormData({ ...formData, collectionLocation: e.target.value as any })
            }
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none font-medium"
          >
            <option value="hotel_lobby">🏨 Otel Lobisi (Alış Anında)</option>
            <option value="pier_marina">⚓ İskele / Marina Girişi</option>
            <option value="office">🏢 Acenta Ofisi</option>
            <option value="bank_online">💻 Önceden Havale / Online</option>
            <option value="other">📍 Diğer Nokta</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
          Bakiyeyi Alacak Görevli / Şoför
        </label>
        <input
          type="text"
          placeholder="Örn: Somchai (Şoför) veya Ofis Kasası"
          value={formData.balanceCollector || ''}
          onChange={(e) => setFormData({ ...formData, balanceCollector: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
        />
      </div>
    </div>
  );
}
