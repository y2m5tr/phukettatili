
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { fmtMoney } from '../../../lib/moneyFormat';

export interface FieldCashierCalculation {
  paidInThb: number;
  changeDueThb: number;
  remainingDebtThb: number;
  effectiveRate: number;
  changeBreakdown: {
    bill1000: number;
    bill500: number;
    bill100: number;
    bill50: number;
    bill20: number;
    coins: number;
  };
}

export interface FieldCashierResultsBoardProps {
  calculation: FieldCashierCalculation;
}

export function FieldCashierResultsBoard({ calculation }: FieldCashierResultsBoardProps) {
  return (
    <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Alınan Döviz Karşılığı:
          </span>
          <div className="text-xl font-mono font-black text-white">
            {fmtMoney(calculation.paidInThb)} THB
          </div>
        </div>

        {/* Status & Change Result */}
        <div>
          {calculation.changeDueThb > 0 ? (
            <div className="sm:text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1 sm:justify-end">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verilecek Para Üstü:</span>
              </span>
              <div className="text-2xl font-mono font-black text-emerald-400">
                +{fmtMoney(calculation.changeDueThb)} THB
              </div>
            </div>
          ) : calculation.remainingDebtThb > 0 ? (
            <div className="sm:text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 flex items-center gap-1 sm:justify-end">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Kalan Eksik Bakiye:</span>
              </span>
              <div className="text-2xl font-mono font-black text-red-400">
                -{fmtMoney(calculation.remainingDebtThb)} THB
              </div>
            </div>
          ) : (
            <div className="sm:text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                Durum:
              </span>
              <div className="text-xl font-bold text-sky-400">
                ✅ Tam Tutar Alındı
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Banknote breakdown (Only if change is due) */}
      {calculation.changeDueThb > 0 && (
        <div className="pt-1">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1.5">
            💵 Tayland Bahtı Para Üstü Banknot Dağılımı:
          </span>
          <div className="flex flex-wrap gap-2 text-xs">
            {calculation.changeBreakdown.bill1000 > 0 && (
              <span className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 font-mono font-bold text-amber-300">
                {calculation.changeBreakdown.bill1000}x 1,000฿
              </span>
            )}
            {calculation.changeBreakdown.bill500 > 0 && (
              <span className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 font-mono font-bold text-purple-300">
                {calculation.changeBreakdown.bill500}x 500฿
              </span>
            )}
            {calculation.changeBreakdown.bill100 > 0 && (
              <span className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 font-mono font-bold text-red-300">
                {calculation.changeBreakdown.bill100}x 100฿
              </span>
            )}
            {calculation.changeBreakdown.bill50 > 0 && (
              <span className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 font-mono font-bold text-blue-300">
                {calculation.changeBreakdown.bill50}x 50฿
              </span>
            )}
            {calculation.changeBreakdown.bill20 > 0 && (
              <span className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 font-mono font-bold text-emerald-300">
                {calculation.changeBreakdown.bill20}x 20฿
              </span>
            )}
            {calculation.changeBreakdown.coins > 0 && (
              <span className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 font-mono font-bold text-slate-300">
                {calculation.changeBreakdown.coins}฿ Madeni
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
