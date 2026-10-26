
import type { SupportedCurrency } from '../../../lib/exchangeRates';
import { fmtMoney } from '../../../lib/moneyFormat';
import type { FieldCashierCalculation } from './FieldCashierResultsBoard';

export interface FieldCashierInputsProps {
  guestName: string;
  setGuestName: (v: string) => void;
  guestPhone: string;
  setGuestPhone: (v: string) => void;
  collectorName: string;
  setCollectorName: (v: string) => void;
  dueAmountThb: number;
  setDueAmountThb: (v: number) => void;
  paidCurrency: SupportedCurrency | 'THB';
  setPaidCurrency: (v: SupportedCurrency | 'THB') => void;
  paidAmount: number;
  setPaidAmount: (v: number) => void;
  customRate: number;
  setCustomRate: (v: number) => void;
  activeRate: number;
  calculation: FieldCashierCalculation;
}

export function FieldCashierInputs({
  guestName,
  setGuestName,
  guestPhone,
  setGuestPhone,
  collectorName,
  setCollectorName,
  dueAmountThb,
  setDueAmountThb,
  paidCurrency,
  setPaidCurrency,
  paidAmount,
  setPaidAmount,
  customRate,
  setCustomRate,
  activeRate,
  calculation,
}: FieldCashierInputsProps) {
  return (
    <>
      {/* Guest and Service Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Misafir Adı</label>
          <input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Örn: Ahmet Yılmaz"
            className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Misafir Tel (WhatsApp)</label>
          <input
            type="tel"
            value={guestPhone}
            onChange={(e) => setGuestPhone(e.target.value)}
            placeholder="+90 532..."
            className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Tahsil Eden Şoför / Personel</label>
          <input
            type="text"
            value={collectorName}
            onChange={(e) => setCollectorName(e.target.value)}
            placeholder="Şoför Somchai / Merkez"
            className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
          />
        </div>
      </div>

      {/* Calculator Section */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Left: Due Amount in THB */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
              1. Hizmet / Tur Bedeli (THB) *
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                value={dueAmountThb || ''}
                onChange={(e) => setDueAmountThb(Number(e.target.value) || 0)}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-base font-black text-slate-900 dark:text-white focus:outline-none"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-400">
                THB (฿)
              </span>
            </div>
          </div>

          {/* Right: Paid Currency & Amount */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
              2. Alınan Para Birimi & Tutar *
            </label>
            <div className="flex gap-2">
              <select
                value={paidCurrency}
                onChange={(e) => {
                  setPaidCurrency(e.target.value as any);
                  setCustomRate(0);
                }}
                className="w-1/3 px-2 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="USD">🇺🇸 USD ($)</option>
                <option value="EUR">🇪🇺 EUR (€)</option>
                <option value="TRY">🇹🇷 TRY (₺)</option>
                <option value="GBP">🇬🇧 GBP (£)</option>
                <option value="THB">🇹🇭 THB (฿)</option>
              </select>

              <input
                type="number"
                min="1"
                value={paidAmount || ''}
                onChange={(e) => setPaidAmount(Number(e.target.value) || 0)}
                className="w-2/3 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-base font-black text-emerald-600 dark:text-emerald-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Quick Denomination Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] uppercase font-bold text-slate-400">Hızlı Tutar Seçimi:</span>
          {paidCurrency === 'USD' && (
            <>
              {[20, 50, 100, 200].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setPaidAmount(amt)}
                  className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer"
                >
                  ${amt}
                </button>
              ))}
            </>
          )}
          {paidCurrency === 'EUR' && (
            <>
              {[20, 50, 100, 200].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setPaidAmount(amt)}
                  className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer"
                >
                  €{amt}
                </button>
              ))}
            </>
          )}
          {paidCurrency === 'THB' && (
            <>
              {[1000, 1500, 2000, 3000, 5000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setPaidAmount(amt)}
                  className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer"
                >
                  {fmtMoney(amt)}฿
                </button>
              ))}
            </>
          )}
        </div>

        {/* Exchange Rate Adjustment (Optional override) */}
        {paidCurrency !== 'THB' && (
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
            <span className="text-slate-500">
              Uygulanan Kur: <strong>1 {paidCurrency} = {calculation.effectiveRate} THB</strong>
            </span>
            <div className="flex items-center gap-1.5">
              <label htmlFor="custom-fx-rate-input" className="text-[10px] text-slate-400">Özel Kur Girişi:</label>
              <input
                id="custom-fx-rate-input"
                type="number"
                step="0.05"
                placeholder={String(activeRate)}
                value={customRate || ''}
                onChange={(e) => setCustomRate(Number(e.target.value) || 0)}
                className="w-20 px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold"
              />
              {customRate > 0 && (
                <button
                  type="button"
                  onClick={() => setCustomRate(0)}
                  className="text-[10px] text-red-500 hover:underline cursor-pointer"
                >
                  Sıfırla
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
