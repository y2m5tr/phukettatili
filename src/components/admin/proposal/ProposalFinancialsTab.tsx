import React from 'react';
import { Globe, CreditCard, ShieldCheck } from 'lucide-react';
import {
  CURRENCY_SYMBOLS,
  type CuratedProposalData,
  type CurrencyCode,
} from '../../../lib/curatedProposal';

export interface ProposalFinancialsTabProps {
  proposal: CuratedProposalData;
  setProposal: React.Dispatch<React.SetStateAction<CuratedProposalData>>;
}

export function ProposalFinancialsTab({ proposal, setProposal }: ProposalFinancialsTabProps) {
  return (
    <div className="space-y-4 text-xs">
      {/* Para Birimi Seçimi */}
      <div>
        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-amber-500" />
          <span>Teklifte Gösterilecek Ana Para Birimi:</span>
        </label>
        <div className="grid grid-cols-5 gap-1.5">
          {(['THB', 'TRY', 'USD', 'EUR', 'GBP'] as CurrencyCode[]).map((code) => {
            const isSel = proposal.currency === code;
            return (
              <button
                key={code}
                type="button"
                onClick={() => setProposal({ ...proposal, currency: code })}
                className={`py-1.5 px-2 rounded-xl text-center font-bold text-xs transition-all cursor-pointer ${
                  isSel
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {code} ({CURRENCY_SYMBOLS[code]})
              </button>
            );
          })}
        </div>
      </div>

      {/* İndirim ve Kapora Oranı */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
        <div>
          <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
            Özel Paket İndirimi (%):
          </label>
          <input
            type="number"
            min={0}
            max={50}
            value={proposal.discountPercent}
            onChange={(e) => setProposal({ ...proposal, discountPercent: Math.max(0, parseInt(e.target.value) || 0) })}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
          />
          <div className="flex gap-1 mt-1">
            {[0, 5, 10, 12, 15, 20].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setProposal({ ...proposal, discountPercent: p })}
                className={`text-[10px] px-1.5 py-0.5 rounded font-bold cursor-pointer ${
                  proposal.discountPercent === p
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600'
                }`}
              >
                %{p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
            Rezervasyon Kaporası (%):
          </label>
          <input
            type="number"
            min={10}
            max={100}
            value={proposal.depositPercent}
            onChange={(e) => setProposal({ ...proposal, depositPercent: Math.max(10, parseInt(e.target.value) || 30) })}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
          />
          <div className="flex gap-1 mt-1">
            {[20, 30, 50, 100].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setProposal({ ...proposal, depositPercent: p })}
                className={`text-[10px] px-1.5 py-0.5 rounded font-bold cursor-pointer ${
                  proposal.depositPercent === p
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600'
                }`}
              >
                %{p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ödeme Yöntemleri & Banka Notu */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
          <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
          <span>Ödeme Yöntemleri & Banka Bilgisi:</span>
        </label>
        <textarea
          rows={2}
          value={proposal.paymentMethodsNote || ''}
          onChange={(e) => setProposal({ ...proposal, paymentMethodsNote: e.target.value })}
          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
        />
      </div>

      {/* Güvence ve İptal Şartları */}
      <div>
        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
          <span>Fiyat Garantisi & Güvence Notu:</span>
        </label>
        <textarea
          rows={2}
          value={proposal.customNotes}
          onChange={(e) => setProposal({ ...proposal, customNotes: e.target.value })}
          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
        />
      </div>
    </div>
  );
}
