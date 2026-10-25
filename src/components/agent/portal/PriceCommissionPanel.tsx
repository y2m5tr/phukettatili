import { AlertCircle, CheckCircle2 } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import type { PartnerAgent } from '../../../data/adminInitialData';
import { convertThbToForeign, type SupportedCurrency } from '../../../lib/exchangeRates';
import { fmtMoney } from '../../../lib/moneyFormat';
import type { DisplayCurrency, PaymentPreference } from './types';

export interface PriceCommissionPanelProps {
  agent: PartnerAgent;
  adultCount: number;
  childCount: number;
  pricePerAdult: number;
  pricePerChild: number;
  totalPriceThb: number;
  myCommissionThb: number;
  netPayableThb: number;
  displayCurrency: DisplayCurrency;
  setDisplayCurrency: Dispatch<SetStateAction<DisplayCurrency>>;
  exchangeRates: Record<SupportedCurrency, number>;
  paymentPreference: PaymentPreference;
  setPaymentPreference: Dispatch<SetStateAction<PaymentPreference>>;
  errorMsg: string;
  isSubmitting: boolean;
}

// Sağ kolon: Canlı Fiyatlandırma & Komisyon Paneli + tahsilat tercihi +
// gönderim butonu (AgentPortalApp'ten birebir taşındı). Submit butonu
// parent <form> içinde olduğu için type="submit" çalışmaya devam eder.
export default function PriceCommissionPanel({
  agent,
  adultCount,
  childCount,
  pricePerAdult,
  pricePerChild,
  totalPriceThb,
  myCommissionThb,
  netPayableThb,
  displayCurrency,
  setDisplayCurrency,
  exchangeRates,
  paymentPreference,
  setPaymentPreference,
  errorMsg,
  isSubmitting,
}: PriceCommissionPanelProps) {
  return (
    <div className="lg:col-span-4 space-y-6">
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 sticky top-20 space-y-5">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Finansal Özet & Cari Hakediş
            </span>
            {/* Currency Selector */}
            <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
              {(['THB', 'TRY', 'USD', 'EUR'] as const).map((curr) => (
                <button
                  key={curr}
                  type="button"
                  onClick={() => setDisplayCurrency(curr)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono transition ${
                    displayCurrency === curr
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>
          <h3 className="text-lg font-bold text-white font-serif">
            Fiyat & Komisyon Dağılımı
          </h3>
        </div>

        <div className="space-y-3 text-xs border-y border-slate-800 py-4">
          <div className="flex justify-between items-center text-slate-400">
            <span>Yetişkin ({adultCount} x {fmtMoney(pricePerAdult)} THB)</span>
            <span className="text-white font-mono font-semibold">{fmtMoney((adultCount * pricePerAdult))} THB</span>
          </div>

          {childCount > 0 && (
            <div className="flex justify-between items-center text-slate-400">
              <span>Çocuk ({childCount} x {fmtMoney(pricePerChild)} THB)</span>
              <span className="text-white font-mono font-semibold">{fmtMoney((childCount * pricePerChild))} THB</span>
            </div>
          )}

          <div className="flex justify-between items-center text-slate-300 font-bold pt-2 border-t border-slate-800/60">
            <span>Toplam Satış Bedeli</span>
            <div className="text-right">
              <span className="text-white font-mono text-sm block">{fmtMoney(totalPriceThb)} THB</span>
              {displayCurrency !== 'THB' && (
                <span className="text-[11px] text-amber-400 font-mono font-semibold">
                  ≈ {fmtMoney(convertThbToForeign(totalPriceThb, displayCurrency, exchangeRates))} {displayCurrency}
                </span>
              )}
            </div>
          </div>

          {/* Acenta Komisyonu Vurgusu */}
          <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-300 flex items-center justify-between">
            <div>
              <span className="font-bold block text-xs">Acenta Komisyonunuz:</span>
              <span className="text-[10px] text-amber-400/80">
                {agent.commissionType === 'percentage' ? `%${agent.commissionRate} oranında` : 'Kişi başı sabit'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-base font-black font-mono block">
                +{fmtMoney(myCommissionThb)} THB
              </span>
              {displayCurrency !== 'THB' && (
                <span className="text-[10px] text-amber-400/90 font-mono font-semibold">
                  ≈ {fmtMoney(convertThbToForeign(myCommissionThb, displayCurrency, exchangeRates))} {displayCurrency}
                </span>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center text-slate-400 pt-1">
            <span>Phuket Tatili Net Hakediş:</span>
            <div className="text-right">
              <span className="text-slate-200 font-mono font-semibold block">{fmtMoney(netPayableThb)} THB</span>
              {displayCurrency !== 'THB' && (
                <span className="text-[10px] text-slate-400 font-mono">
                  ≈ {fmtMoney(convertThbToForeign(netPayableThb, displayCurrency, exchangeRates))} {displayCurrency}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Ödeme / Tahsilat Tercihi */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase text-slate-400 block">
            Tahsilat Yöntemi Tercihi *
          </label>

          <label className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer text-xs transition-all ${
            paymentPreference === 'office_cash_on_pickup'
              ? 'bg-brand-primary/10 border-brand-accent text-white'
              : 'bg-slate-950 border-slate-800 text-slate-400'
          }`}>
            <input
              type="radio"
              name="payment"
              value="office_cash_on_pickup"
              checked={paymentPreference === 'office_cash_on_pickup'}
              onChange={() => setPaymentPreference('office_cash_on_pickup')}
              className="mt-0.5"
            />
            <div>
              <span className="font-bold block">Rehber Otelde Nakit Alsın</span>
              <span className="text-[11px] text-slate-400">Şoför lobide {fmtMoney(totalPriceThb)} THB nakit toplar; komisyonunuz cari hesabınıza yazılır.</span>
            </div>
          </label>

          <label className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer text-xs transition-all ${
            paymentPreference === 'agent_collected'
              ? 'bg-brand-primary/10 border-brand-accent text-white'
              : 'bg-slate-950 border-slate-800 text-slate-400'
          }`}>
            <input
              type="radio"
              name="payment"
              value="agent_collected"
              checked={paymentPreference === 'agent_collected'}
              onChange={() => setPaymentPreference('agent_collected')}
              className="mt-0.5"
            />
            <div>
              <span className="font-bold block">Tahsilatı Ben Yaptım (Ödendi)</span>
              <span className="text-[11px] text-slate-400">Misafirden tahsilatı siz aldınız; Phuket Tatili'ne net {fmtMoney(netPayableThb)} THB havale edeceksiniz.</span>
            </div>
          </label>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-600/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-2xl bg-brand-primary hover:bg-brand-primary/90 text-white font-bold text-sm shadow-xl shadow-brand-primary/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <span>Rezervasyon Kaydediliyor...</span>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 text-brand-accent" />
              <span>Rezervasyonu Onayla ve Bilet Kes</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
