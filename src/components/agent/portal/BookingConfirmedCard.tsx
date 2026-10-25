import { CheckCircle2, ExternalLink, Share2 } from 'lucide-react';
import { fmtMoney } from '../../../lib/moneyFormat';
import type { ConfirmedBookingPayload } from './types';

export interface BookingConfirmedCardProps {
  confirmedBooking: ConfirmedBookingPayload;
  onClose: () => void;
  onShareWhatsApp: () => void;
}

// Onay Bildirimi Kartı (Başarılı Gönderim Sonrası) — AgentPortalApp'ten
// birebir taşındı.
export default function BookingConfirmedCard({
  confirmedBooking,
  onClose,
  onShareWhatsApp,
}: BookingConfirmedCardProps) {
  return (
    <div className="p-6 rounded-3xl bg-emerald-950/60 border border-emerald-500/40 text-white space-y-4 animate-in fade-in duration-300">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-emerald-300">
              Rezervasyon Başarıyla Onaylandı!
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Rezervasyon No: <strong className="font-mono text-white">{confirmedBooking.booking.id}</strong> ·
              Merkez operasyon sistemine iletildi.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-white text-xs font-bold"
        >
          Kapat ✕
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-black/40 border border-white/10 text-xs">
        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-bold">Misafir & Tur</span>
          <strong className="text-white text-sm">{confirmedBooking.booking.customerName}</strong>
          <p className="text-slate-400">{confirmedBooking.booking.tourTitle}</p>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-bold">Tarih & Alınış</span>
          <strong className="text-white">{confirmedBooking.booking.tourDate}</strong>
          <p className="text-slate-400">⏰ {confirmedBooking.booking.pickupTime} ({confirmedBooking.booking.hotel})</p>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-bold">Acente Komisyonunuz</span>
          <strong className="text-amber-400 text-sm font-mono">
            +{fmtMoney(confirmedBooking.commission.amountThb)} THB
          </strong>
          <p className="text-slate-400">Cari hesabınıza alacak işlendi</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button
          type="button"
          onClick={onShareWhatsApp}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
          <span>Misafire WhatsApp Biletini Gönder</span>
        </button>

        <a
          href={`/bilet/${confirmedBooking.booking.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Canlı Biniş Kartını Aç</span>
        </a>
      </div>
    </div>
  );
}
