import { AlertCircle, Ticket, Phone, CheckCircle2 } from 'lucide-react';
import type { Booking } from '../../../data/adminInitialData';

interface OutstandingPanelProps {
  outstandingBookings: Booking[];
  totalOutstanding: number;
  onOpenCollect: (booking: Booking) => void;
  setVoucherBooking: (b: Booking) => void;
}

export default function OutstandingPanel({
  outstandingBookings,
  totalOutstanding,
  onOpenCollect,
  setVoucherBooking,
}: OutstandingPanelProps) {
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
              Açık Kalan Otel Tahsilatları ({outstandingBookings.length} Rezervasyon)
            </h4>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Şoför veya rehber tur sabahı otel lobisinde veya iskelede bu bakiyeleri nakit olarak tahsil etmelidir.
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block">
            Toplam Tahsil Edilecek
          </span>
          <span className="text-lg font-black text-amber-900 dark:text-amber-100 font-serif">
            {totalOutstanding.toLocaleString()} THB
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-2 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/40 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Tur Tarihi</th>
                <th className="py-3.5 px-4">Misafir & İletişim</th>
                <th className="py-3.5 px-4">Otel & Oda</th>
                <th className="py-3.5 px-4">Tur Bilgisi</th>
                <th className="py-3.5 px-4">Ciro / Kapora</th>
                <th className="py-3.5 px-4">Kalan Bakiye</th>
                <th className="py-3.5 px-4 text-right">Hızlı İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {outstandingBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    🎉 Tebrikler! Bekleyen açık bakiye bulunmuyor, tüm rezervasyonlar tahsil edildi.
                  </td>
                </tr>
              ) : (
                outstandingBookings.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-900/30 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        📅 {b.tourDate}
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        ⏰ {b.pickupTime || '07:30'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {b.customerName}
                        </span>
                        <button
                          type="button"
                          onClick={() => setVoucherBooking(b)}
                          title="Dijital Biniş Kartı / Voucher Önizle"
                          className="p-1 rounded-md text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-950/60 transition-colors cursor-pointer"
                        >
                          <Ticket className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <a
                        href={`https://wa.me/${b.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `Merhaba Sayın ${b.customerName}, Phuket Tatili turunuz için kalan bakiyeniz: ${b.remainingAmountThb.toLocaleString()} THB. Sabah otel lobisinde şoförümüze nakit olarak ödeyebilirsiniz.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 mt-0.5"
                      >
                        <Phone className="w-3 h-3" /> {b.phone}
                      </a>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                        📍 {b.hotel}
                      </span>
                      {b.roomNumber && (
                        <span className="text-xs text-slate-500 block">
                          Oda: {b.roomNumber}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-900 dark:text-white block truncate max-w-xs">
                        {b.tourTitle}
                      </span>
                      <span className="text-xs text-slate-400 block">
                        👥 {b.adultCount} Yetişkin {b.childCount > 0 ? `+ ${b.childCount} Ç.` : ''}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                        Toplam: {b.totalPriceThb.toLocaleString()} THB
                      </span>
                      <span className="text-xs text-emerald-600 block">
                        Alınan: {(b.paidAmountThb || 0).toLocaleString()} THB
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-sm font-black text-amber-600 dark:text-amber-400 block font-mono">
                        {b.remainingAmountThb.toLocaleString()} THB
                      </span>
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded">
                        Otel Lobisinde Nakit
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onOpenCollect(b)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Tahsilat Al</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
