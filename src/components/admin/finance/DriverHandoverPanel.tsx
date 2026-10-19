import { Car, CheckCircle2, Clock, Wallet, ShieldCheck } from 'lucide-react';
import type { PaymentRecord } from '../../../data/adminInitialData';

export interface DriverCashGroup {
  driverName: string;
  totalAmountThb: number;
  payments: PaymentRecord[];
}

interface DriverHandoverPanelProps {
  driverCashGroups: DriverCashGroup[];
  settledDrivers: string[];
  setSettledDrivers: React.Dispatch<React.SetStateAction<string[]>>;
  onAddPayment: (record: Omit<PaymentRecord, 'id' | 'collectedAt'>) => void;
  showToast: (msg: string) => void;
}

export default function DriverHandoverPanel({
  driverCashGroups,
  settledDrivers,
  setSettledDrivers,
  onAddPayment,
  showToast,
}: DriverHandoverPanelProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-surface-2 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Car className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span>Şoför & Saha Kasa Kapatma (Z-Raporu)</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Şoför ve rehberlerin otel lobilerinden elden topladığı nakitleri ofis kasasına teslim alın ve devir kaydını kapatın.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Toplam Saha Tahsilatçısı:</span>
          <span className="px-2.5 py-1 rounded-xl bg-purple-500/10 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-500/20">
            {driverCashGroups.length} Kişi
          </span>
        </div>
      </div>

      {driverCashGroups.length === 0 ? (
        <div className="bg-white dark:bg-surface-2 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center text-slate-400">
          <Car className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-semibold">Henüz elden nakit tahsilat kaydedilmiş şoför kaydı bulunmuyor.</p>
          <p className="text-xs text-slate-500 mt-1">
            Lobiden tahsilat yapıldığında veya rezervasyona tahsilat makbuzu girildiğinde burada listelenir.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {driverCashGroups.map((g) => {
            const isSettled = settledDrivers.includes(g.driverName);
            return (
              <div
                key={g.driverName}
                className={`p-5 rounded-3xl border transition-all ${
                  isSettled
                    ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-75'
                    : 'bg-white dark:bg-surface-2 border-purple-500/30 shadow-md ring-1 ring-purple-500/10'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                      Saha Tahsilatçısı
                    </span>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                      {g.driverName}
                    </h4>
                  </div>

                  {isSettled ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Kasaya Teslim Alındı</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Eldeki Nakit</span>
                    </span>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-1.5 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Toplanan Nakit Tutar:</span>
                    <span className="font-extrabold text-base font-mono text-emerald-600 dark:text-emerald-400">
                      {g.totalAmountThb.toLocaleString()} THB
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Makbuz Sayısı:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {g.payments.length} Tahsilat
                    </span>
                  </div>
                </div>

                {!isSettled ? (
                  <button
                    type="button"
                    onClick={() => {
                      const receiptNo = `DEVIR-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Math.floor(100 + Math.random() * 900))}`;
                      onAddPayment({
                        bookingId: 'OFIS-DEVIR',
                        customerName: `Kasa Teslimatı (${g.driverName})`,
                        tourTitle: 'Gün Sonu Z-Raporu & Teslimat',
                        amountThb: g.totalAmountThb,
                        method: 'cash_thb',
                        collectedBy: 'Ofis Ana Kasası',
                        collectionLocation: 'office',
                        note: `${g.driverName} tarafından teslim edilen gün sonu nakit toplamı`,
                        receiptNo,
                      });
                      setSettledDrivers((prev) => [...prev, g.driverName]);
                      showToast(`✅ ${g.driverName} gün sonu nakit teslimatı (${g.totalAmountThb.toLocaleString()} THB) ana kasaya aktarıldı ve kapatıldı!`);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    <span>💰 Kasaya Teslim Al & Kapat ({g.totalAmountThb.toLocaleString()} THB)</span>
                  </button>
                ) : (
                  <div className="text-center py-2 text-xs text-slate-400 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Bu tutar ana kasaya devredilmiştir.</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
