import React from 'react';
import { Bus, Compass, MapPin } from 'lucide-react';
import { getSingleHotelMapUrl } from '../../lib/maps';
import { formatDayMonthYear } from '../../lib/whatsappEngine';
import type { GuestBookingView } from './guestPortalTypes';

interface GuestHotelTransferCardProps {
  booking: GuestBookingView;
  totalPax: number;
  departurePier: string;
}

export const GuestHotelTransferCard: React.FC<GuestHotelTransferCardProps> = ({
  booking,
  totalPax,
  departurePier,
}) => {
  return (
    <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-4 shadow-lg">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-amber-400 font-bold text-sm">
        <Bus className="w-4 h-4" />
        <span>Otel Alınış & Transfer Bilgileri</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
        {/* Alınış Saati */}
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Lobi Alınış Saati</span>
          <div className="text-xl font-black font-mono text-amber-400 mt-0.5">
            {booking.pickupTime || '07:30'}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Lütfen belirtilen saatte otelinizin ana lobisinde hazır bulununuz.
          </span>
        </div>

        {/* Tur Tarihi */}
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Tur Tarihi</span>
          <div className="text-base font-bold text-white mt-0.5 font-mono">
            {formatDayMonthYear(booking.tourDate)}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {booking.adultCount} Yetişkin{booking.childCount > 0 ? ` + ${booking.childCount} Çocuk` : ''} ({totalPax} Kişi)
          </span>
        </div>

        {/* Otel & Oda */}
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 sm:col-span-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Alınış Oteli & Oda</span>
              <div className="text-sm font-bold text-white mt-0.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{booking.hotel}</span>
              </div>
              {booking.roomNumber && (
                <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-slate-800 text-[11px] font-bold text-amber-300">
                  Oda No: {booking.roomNumber}
                </span>
              )}
            </div>

            <a
              href={getSingleHotelMapUrl(booking.hotel)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1 transition-colors shrink-0"
            >
              <Compass className="w-3.5 h-3.5 text-sky-400" />
              <span>Harita</span>
            </a>
          </div>
        </div>

        {/* Minibüs / Hat */}
        <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80">
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Tahsis Edilen Araç</span>
          <div className="text-xs font-bold text-sky-400 mt-0.5">
            {booking.assignedVehicle || 'VIP Minibüs Transferi'}
          </div>
        </div>

        {/* Kalkış Limanı / İskelesi */}
        <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80">
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Kalkış İskelesi / Marina</span>
          <div className="text-xs font-bold text-slate-200 mt-0.5">
            {departurePier.split(',')[0]}
          </div>
        </div>
      </div>
    </div>
  );
};
