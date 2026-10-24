import React from 'react';
import { DollarSign, X, Check } from 'lucide-react';
import type { FieldScheduleItem } from './fieldTypes';

export interface FieldCashModalProps {
  cashModalItem: FieldScheduleItem | null;
  collectedAmountInput: string;
  setCollectedAmountInput: (val: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export function FieldCashModal({
  cashModalItem,
  collectedAmountInput,
  setCollectedAmountInput,
  onClose,
  onConfirm,
}: FieldCashModalProps) {
  if (!cashModalItem) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Nakit Tahsilat</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-3">
          <div>
            <p className="text-xs text-slate-400">Misafir</p>
            <p className="text-sm font-bold text-white">{cashModalItem.customerName}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Otel</p>
            <p className="text-xs font-medium text-slate-300">{cashModalItem.hotel}</p>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Tahsil Edilecek Tutar (THB)
            </label>
            <input
              type="number"
              value={collectedAmountInput}
              onChange={(e) => setCollectedAmountInput(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-xl font-bold font-mono text-amber-400 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-slate-800 text-slate-300 font-semibold text-xs active:scale-95"
          >
            Vazgeç
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Tahsil Edildi</span>
          </button>
        </div>
      </div>
    </div>
  );
}
