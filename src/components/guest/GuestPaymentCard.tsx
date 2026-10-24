import React from 'react';
import { AlertTriangle, Check, QrCode } from 'lucide-react';
import { fmtMoney } from '../../lib/moneyFormat';
import type { GuestBookingView } from './guestPortalTypes';

interface GuestPaymentCardProps {
  booking: GuestBookingView;
  onOpenPromptPay: () => void;
}

export const GuestPaymentCard: React.FC<GuestPaymentCardProps> = ({
  booking,
  onOpenPromptPay,
}) => {
  return (
    <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Ödeme & Bakiye Durumu
        </span>
        {booking.remainingAmountThb > 0 ? (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Kalan Bakiye Mevcut
          </span>
        ) : (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            ✓ Tamamı Ödendi
          </span>
        )}
      </div>

      {booking.remainingAmountThb > 0 ? (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-amber-200">Tur Sabahı Ödenecek Kalan:</span>
            <span className="text-xl font-black font-mono text-amber-400">
              {fmtMoney(booking.remainingAmountThb)} THB
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            💵 Bu tutarı tur sabahı şoförümüze nakit teslim edebilir veya aşağıdaki butondan PromptPay QR ile online ödeyebilirsiniz.
          </p>
          <button
            type="button"
            onClick={onOpenPromptPay}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            <span>PromptPay QR Kodu ile Hemen Öde ({fmtMoney(booking.remainingAmountThb)} THB)</span>
          </button>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Tur ücretinizin tamamı ödenmiştir. Herhangi bir bakiye borcunuz bulunmamaktadır.</span>
        </div>
      )}

      {/* Millî Park Harç Uyarısı (Eğer hariç ise) */}
      {booking.nationalParkFeeIncluded === false && (
        <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
          <div>
            <span className="font-bold block">Tayland Millî Park Harcı Gişede Ödenir</span>
            <span className="text-[11px] text-slate-400">
              Bu tur Tayland Kraliyeti Deniz Millî Parkı kapsamındadır. Kişi başı 400 THB millî park giriş ücreti limanda resmi devlet gişesine nakit ödenir.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
