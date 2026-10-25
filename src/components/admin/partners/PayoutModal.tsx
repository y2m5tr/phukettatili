import React, { useState } from 'react';
import { DollarSign, X } from 'lucide-react';
import type { PartnerAgent } from '../../../data/adminInitialData';

export interface PayoutModalProps {
  payoutAgent: PartnerAgent;
  initialAmount: number;
  initialNote: string;
  onClose: () => void;
  onConfirm: (amount: number, note: string) => void;
}

// MODAL: KOMİSYON ÖDEMESİ YAP (PAYOUT) — PartnersTab'ten birebir taşındı.
export default function PayoutModal({
  payoutAgent,
  initialAmount,
  initialNote,
  onClose,
  onConfirm,
}: PayoutModalProps) {
  const [payoutAmount, setPayoutAmount] = useState<number>(initialAmount);
  const [payoutNote, setPayoutNote] = useState<string>(initialNote);

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (payoutAmount <= 0) return;
    onConfirm(payoutAmount, payoutNote);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-surface-2 w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Komisyon Ödemesi Kaydet
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500">
          <strong className="text-slate-900 dark:text-white">{payoutAgent.name}</strong> acentasına yaptığınız komisyon ödemesini cariden düşün.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
              Ödenen Tutar (THB) *
            </label>
            <input
              type="number"
              required
              min="1"
              value={payoutAmount || ''}
              onChange={(e) => setPayoutAmount(Number(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-black text-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
              Ödeme Açıklaması / Dekont Notu
            </label>
            <input
              type="text"
              value={payoutNote}
              onChange={(e) => setPayoutNote(e.target.value)}
              placeholder="Örn: Ekim ayı hakediş havalesi (İş Bankası)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md"
            >
              ✓ Ödemeyi Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
