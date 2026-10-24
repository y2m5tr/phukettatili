
import { Share2 } from 'lucide-react';
import { fmtMoney } from '../../lib/moneyFormat';
import { formatDateDisplay, type FieldScheduleItem } from './fieldTypes';

export interface FieldCashTabProps {
  selectedDate: string;
  scheduleItems: FieldScheduleItem[];
  totalCashToCollect: number;
  onSendDayEndReport: () => void;
}

export function FieldCashTab({
  selectedDate,
  scheduleItems,
  totalCashToCollect,
  onSendDayEndReport,
}: FieldCashTabProps) {
  const totalPaid = scheduleItems.reduce((acc, i) => acc + (i.paidAmountThb || 0), 0);
  const paidCount = scheduleItems.filter((i) => i.paidAmountThb > 0).length;

  return (
    <main className="flex-1 px-4 py-4 space-y-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl text-center">
        <span className="text-xs text-slate-400 uppercase font-semibold">Günün Kasa Durumu</span>
        <div className="text-3xl font-extrabold text-amber-400 font-mono mt-1">
          {fmtMoney(totalPaid)} ฿
        </div>
        <p className="text-xs text-slate-400 mt-1">
          {formatDateDisplay(selectedDate)} · Kayıtlı Tahsilat
        </p>

        <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 gap-3 text-left">
          <div>
            <span className="text-[10px] text-slate-500 uppercase">Tahsil Edilenler</span>
            <p className="text-sm font-bold text-emerald-400">{paidCount} Misafir</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase">Bekleyen Bakiye</span>
            <p className="text-sm font-bold text-rose-400">{fmtMoney(totalCashToCollect)} ฿</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>Tahsilat Detayları</span>
          <button
            onClick={onSendDayEndReport}
            className="text-amber-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Ofise WhatsApp Raporu At</span>
          </button>
        </div>

        <div className="space-y-2">
          {scheduleItems.map((item) => (
            <div
              key={item.key}
              className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between"
            >
              <div>
                <h4 className="text-sm font-bold text-white">{item.customerName}</h4>
                <p className="text-[11px] text-slate-400">{item.hotel}</p>
                <span className="text-[10px] text-slate-500">{item.tourTitle}</span>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-emerald-400 font-mono">
                  {fmtMoney(item.paidAmountThb)} ฿ Alındı
                </div>
                {item.remainingAmountThb > 0 ? (
                  <span className="text-[10px] font-bold text-rose-400">
                    Kalan: {fmtMoney(item.remainingAmountThb)} ฿
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-slate-500">Kalan Yok</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
