import React from 'react';
import { Compass, Printer } from 'lucide-react';
import type { GuestBookingView } from './guestPortalTypes';

interface GuestBoardingPassCardProps {
  booking: GuestBookingView;
  totalPax: number;
  departurePier: string;
}

export const GuestBoardingPassCard: React.FC<GuestBoardingPassCardProps> = ({
  booking,
  totalPax,
  departurePier,
}) => {
  return (
    <div id="boarding-pass-print-area" className="rounded-3xl bg-white text-slate-900 overflow-hidden shadow-2xl border border-slate-200">
      <div className="p-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 flex items-center justify-between">
        <div className="flex items-center gap-2 font-black text-sm uppercase tracking-wider">
          <span>🎟️ OFFICIAL DIGITAL BOARDING PASS</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-2.5 py-1 rounded-lg bg-slate-950 text-white text-[11px] font-bold flex items-center gap-1.5 hover:bg-slate-800 transition-colors cursor-pointer print:hidden shadow-xs"
            title="Biniş Kartını A4 / PDF Olarak Kaydet"
          >
            <Printer className="w-3 h-3" />
            <span>Yazdır / PDF</span>
          </button>
          <span className="text-[11px] font-mono font-bold bg-slate-950/15 px-2 py-0.5 rounded">
            TAT: 34/02819
          </span>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5 pb-5 border-b border-dashed border-slate-300">
          {/* Sol Yolcu Bilgileri */}
          <div className="space-y-3 w-full sm:w-auto">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Ana Yolcu / Lead Passenger
              </span>
              <div className="text-lg font-black text-slate-950">
                {booking.customerName.toUpperCase()}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <span className="text-[10px] font-sans text-slate-400 block font-bold">REZ KODU</span>
                <span className="font-bold text-slate-900">{booking.id}</span>
              </div>
              <div>
                <span className="text-[10px] font-sans text-slate-400 block font-bold">KİŞİ SAYISI</span>
                <span className="font-bold text-slate-900">{totalPax} PAX</span>
              </div>
            </div>

            {/* Yolcu İsimleri Listesi (varsa) — pasaport bilgisi GÖSTERİLMEZ */}
            {booking.passengerNames.length > 0 && (
              <div className="pt-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Kayıtlı Yolcular:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {booking.passengerNames.map((name, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sağ QR Kod */}
          <div className="flex flex-col items-center shrink-0 p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <svg
              className="w-28 h-28 text-slate-950"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="2" y="2" width="8" height="8" rx="1" fill="currentColor" fillOpacity="0.15" />
              <rect x="14" y="2" width="8" height="8" rx="1" fill="currentColor" fillOpacity="0.15" />
              <rect x="2" y="14" width="8" height="8" rx="1" fill="currentColor" fillOpacity="0.15" />
              <rect x="5" y="5" width="2" height="2" fill="currentColor" />
              <rect x="17" y="5" width="2" height="2" fill="currentColor" />
              <rect x="5" y="17" width="2" height="2" fill="currentColor" />
              <path d="M14 14h2v2h-2z" fill="currentColor" />
              <path d="M18 14h4v4h-4z" fill="currentColor" />
              <path d="M14 18h2v4h-2z" fill="currentColor" />
              <path d="M18 20h4v2h-4z" fill="currentColor" />
            </svg>
            <span className="font-mono text-[10px] font-bold text-slate-500 mt-1">
              {booking.id}-PASS
            </span>
            <span className="text-[9px] text-slate-400">İskelede Okutunuz</span>
          </div>
        </div>

        {/* İskele ve Tur Özeti */}
        <div className="flex items-center justify-between text-xs pt-1">
          <div>
            <span className="text-[10px] text-slate-400 block font-bold">KALKIŞ İSKELESİ</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">{departurePier}</span>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(departurePier.split(',')[0] + ' Pier Phuket')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-sky-600 hover:text-sky-700 font-bold print:hidden"
                title="İskele Haritasını Aç"
              >
                <Compass className="w-3 h-3" />
                <span>Harita</span>
              </a>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-bold">OPERATÖR</span>
            <span className="font-bold text-amber-600">Phuket Tatili DMC</span>
          </div>
        </div>
      </div>
    </div>
  );
};
