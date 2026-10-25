import React from 'react';
import { UserCheck, Trash2 } from 'lucide-react';
import {
  GUIDE_EXPENSE_CATEGORIES,
  type GuideDailySettlement,
  type GuideExpenseItem,
} from '../../../lib/guideExpenses';
import type { DriverItem } from '../../../data/adminInitialData';
import { fmtMoney } from '../../../lib/moneyFormat';

export interface GuideExpenseTableProps {
  activeGuide: DriverItem;
  selectedDate: string;
  settlement: GuideDailySettlement;
  handleDeleteExpense: (id: string) => void;
}

export function GuideExpenseTable({
  activeGuide,
  selectedDate,
  settlement,
  handleDeleteExpense,
}: GuideExpenseTableProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <UserCheck className="w-4 h-4 text-teal-500" />
          <span>
            {activeGuide.fullName} — {selectedDate} Masraf Kayıtları ({settlement.guideExpenses.length})
          </span>
        </h4>
      </div>

      {settlement.guideExpenses.length === 0 ? (
        <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-400 text-xs">
          Bu tarihte bu rehbere ait henüz bir masraf kaydı bulunmuyor. Yukarıdan taksi, yemek veya ikram fişi ekleyebilirsiniz.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Kategori</th>
                <th className="p-3">Açıklama</th>
                <th className="p-3">Fiş No</th>
                <th className="p-3 text-right">Tutar (THB)</th>
                <th className="p-3 text-center">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-surface-2 font-medium">
              {settlement.guideExpenses.map((exp: GuideExpenseItem) => {
                const catMeta = GUIDE_EXPENSE_CATEGORIES[exp.category];
                return (
                  <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-800 dark:text-teal-300 font-bold text-[11px]">
                        <span>{catMeta.icon}</span>
                        <span>{catMeta.shortLabel}</span>
                      </span>
                    </td>
                    <td className="p-3 text-slate-800 dark:text-slate-200">
                      {exp.description}
                    </td>
                    <td className="p-3">
                      {exp.receiptNumber ? (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[10px]">
                          {exp.receiptNumber}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">—</span>
                      )}
                    </td>
                    <td className="p-3 text-right font-black text-rose-600 dark:text-rose-400">
                      - {fmtMoney(exp.amountThb)} THB
                    </td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                        title="Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
