import React from 'react';
import { Bus, CheckCircle2 } from 'lucide-react';
import type { GuestBookingView } from './guestPortalTypes';

interface GuestLobbyCountdownCardProps {
  booking: GuestBookingView;
  timeLeft: {
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
    isToday: boolean;
  };
  isLobbyReady: boolean;
  lobbyReadyTime: string;
  isSubmittingLobbyReady: boolean;
  onToggleLobbyReady: () => void;
}

export const GuestLobbyCountdownCard: React.FC<GuestLobbyCountdownCardProps> = ({
  booking,
  timeLeft,
  isLobbyReady,
  lobbyReadyTime,
  isSubmittingLobbyReady,
  onToggleLobbyReady,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-855 border border-slate-800 p-5 sm:p-6 shadow-2xl">
      <div className="absolute -right-8 -top-8 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono font-bold text-xs tracking-wider">
              {booking.id}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Onaylandı</span>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-serif text-white mt-3 leading-tight">
            {booking.tourTitle}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Sayın <span className="font-bold text-slate-200">{booking.customerName}</span>, tur ve transfer detaylarınız aşağıdadır.
          </p>
        </div>
      </div>

      {/* CANLI GERİ SAYIM SAYACI */}
      <div className="mt-5 pt-4 border-t border-slate-800/80">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
          ⏰ Otel Lobisinden Alınış Durumu:
        </span>

        {timeLeft.isPast ? (
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-emerald-300">
                Tur Saatiniz Başladı / Aracınız Yolda
              </div>
              <p className="text-[11px] text-slate-400">
                Şoförümüzle buluşamadıysanız lütfen 7/24 Türkçe destek hattımıza yazınız.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-950/80 border border-slate-800/80 p-3 rounded-2xl">
              <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400">
                {String(timeLeft.hours).padStart(2, '0')}
              </div>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Saat</span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800/80 p-3 rounded-2xl">
              <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400">
                {String(timeLeft.minutes).padStart(2, '0')}
              </div>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Dakika</span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800/80 p-3 rounded-2xl">
              <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400">
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Saniye</span>
            </div>
          </div>
        )}

        {/* LOBİDEYİM HAZIRIM BUTONU & DURUMU */}
        <div className="mt-4 pt-3.5 border-t border-slate-800/80">
          {isLobbyReady ? (
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 shadow-lg space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <span className="font-bold text-sm text-emerald-300">
                    Lobidesiniz & Hazırsınız {lobbyReadyTime ? `(${lobbyReadyTime})` : ''}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onToggleLobbyReady}
                  disabled={isSubmittingLobbyReady}
                  className="text-[11px] text-slate-400 hover:text-slate-200 underline cursor-pointer"
                >
                  Geri Al
                </button>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                ✨ Hazır olduğunuz operasyon ekibimize ve transfer aracınıza iletildi. Şoförümüz lobide sizi isminizle karşılayacaktır.
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={onToggleLobbyReady}
              disabled={isSubmittingLobbyReady}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] text-white font-extrabold text-sm shadow-xl shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer border border-emerald-400/30"
            >
              <span className="text-lg">🙋‍♂️</span>
              <span>Lobideyim, Hazırım! (Şoföre Bildir)</span>
            </button>
          )}
        </div>

        {/* ATANAN ARAÇ / HAT BİLGİSİ */}
        <div className="mt-3 flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-xs">
          <span className="text-slate-400 flex items-center gap-2 font-medium">
            <Bus className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Atanan Hat / Araç:</span>
          </span>
          <span className="font-mono font-bold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
            {booking.assignedVehicle || 'VIP Tur Minibüsü'}
          </span>
        </div>
      </div>
    </div>
  );
};
