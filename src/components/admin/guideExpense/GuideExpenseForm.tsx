import React from 'react';
import { Plus, Receipt } from 'lucide-react';
import {
  type GuideExpenseCategory,
  GUIDE_EXPENSE_CATEGORIES,
} from '../../../lib/guideExpenses';

export interface GuideExpenseFormProps {
  category: GuideExpenseCategory;
  handleSelectCategory: (cat: GuideExpenseCategory) => void;
  amount: number;
  setAmount: (v: number) => void;
  description: string;
  setDescription: (v: string) => void;
  receiptNo: string;
  setReceiptNo: (v: string) => void;
  handleAddExpense: (e: React.SyntheticEvent) => void;
}

export function GuideExpenseForm({
  category,
  handleSelectCategory,
  amount,
  setAmount,
  description,
  setDescription,
  receiptNo,
  setReceiptNo,
  handleAddExpense,
}: GuideExpenseFormProps) {
  return (
    <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-teal-500" />
          <span>Yeni Rehber Harcaması / Fiş Ekle</span>
        </h4>
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          Taksi / Grab, Otel Karşılama, Yemek ve İkram Masrafları
        </span>
      </div>

      {/* Quick Category Chips */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(GUIDE_EXPENSE_CATEGORIES) as GuideExpenseCategory[]).map((catKey) => {
          const meta = GUIDE_EXPENSE_CATEGORIES[catKey];
          const isSelected = category === catKey;
          return (
            <button
              key={catKey}
              type="button"
              onClick={() => handleSelectCategory(catKey)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-teal-600 text-white shadow-sm ring-2 ring-teal-400/40'
                  : 'bg-white dark:bg-surface-3 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-teal-400'
              }`}
            >
              <span>{meta.icon}</span>
              <span>{meta.shortLabel}</span>
              {meta.defaultThb && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isSelected ? 'bg-teal-700/60 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  ~{meta.defaultThb}฿
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Form Fields */}
      <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
        <div className="sm:col-span-3">
          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
            Masraf Tutarı (THB)
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              step="10"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
              required
              className="w-full pl-3 pr-10 py-2 rounded-xl bg-white dark:bg-surface-3 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/30"
            />
            <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">THB</span>
          </div>
        </div>

        <div className="sm:col-span-5">
          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
            Açıklama / Güzergâh / Not
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Örn: Grab Taxi Patong -> Kata misafir karşılama"
            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-surface-3 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/30"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
            <Receipt className="w-3 h-3 text-slate-400" />
            <span>Fiş / Makbuz No</span>
          </label>
          <input
            type="text"
            value={receiptNo}
            onChange={(e) => setReceiptNo(e.target.value)}
            placeholder="GRB-1234"
            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-surface-3 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/30"
          />
        </div>

        <div className="sm:col-span-2 flex items-end">
          <button
            type="submit"
            className="w-full py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-teal-600/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Fişi Kaydet</span>
          </button>
        </div>
      </form>
    </div>
  );
}
