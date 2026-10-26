
import { Wallet } from 'lucide-react';
import { fmtMoney } from '../../../lib/moneyFormat';
import type { GuideDailySettlement } from '../../../lib/guideExpenses';

export interface GuideExpenseKpiCardsProps {
  settlement: GuideDailySettlement;
}

export function GuideExpenseKpiCards({ settlement }: GuideExpenseKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-950 dark:text-emerald-200">
        <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
          <Wallet className="w-3.5 h-3.5" />
          <span>Toplanan Nakit</span>
        </p>
        <p className="text-xl sm:text-2xl font-black mt-1 text-emerald-700 dark:text-emerald-300">
          {fmtMoney(settlement.collectedCashThb)} <span className="text-xs font-normal">THB</span>
        </p>
        <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">Misafirlerden tahsil edilen</p>
      </div>

      <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-950 dark:text-rose-200">
        <p className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1">
          <span>🗣️</span>
          <span>Toplam Rehber Masrafı</span>
        </p>
        <p className="text-xl sm:text-2xl font-black mt-1 text-rose-700 dark:text-rose-300">
          - {fmtMoney(settlement.totalExpensesThb)} <span className="text-xs font-normal">THB</span>
        </p>
        <p className="text-[10px] text-rose-600/80 dark:text-rose-400/80 mt-0.5">
          {settlement.guideExpenses.length} adet fiş/harcama
        </p>
      </div>

      <div
        className={`p-4 rounded-2xl border ${
          settlement.reimbursementDueThb > 0
            ? 'bg-amber-500/10 border-amber-500/20 text-amber-950 dark:text-amber-200'
            : 'bg-teal-500/10 border-teal-500/20 text-teal-950 dark:text-teal-200'
        }`}
      >
        <p className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
          <span>{settlement.reimbursementDueThb > 0 ? '💸' : '💰'}</span>
          <span>
            {settlement.reimbursementDueThb > 0 ? 'Ofisten Rehbere Ödenecek' : 'Ofise Teslim Edilecek Net'}
          </span>
        </p>
        <p
          className={`text-xl sm:text-2xl font-black mt-1 ${
            settlement.reimbursementDueThb > 0
              ? 'text-amber-700 dark:text-amber-300'
              : 'text-teal-700 dark:text-teal-300'
          }`}
        >
          {settlement.reimbursementDueThb > 0
            ? `+ ${fmtMoney(settlement.reimbursementDueThb)}`
            : fmtMoney(settlement.netHandoverToOfficeThb)}{' '}
          <span className="text-xs font-normal">THB</span>
        </p>
        <p className="text-[10px] opacity-80 mt-0.5">
          {settlement.reimbursementDueThb > 0 ? 'Rehber cebinden fazla harcadı' : 'Nakit kasa teslimatı'}
        </p>
      </div>
    </div>
  );
}
