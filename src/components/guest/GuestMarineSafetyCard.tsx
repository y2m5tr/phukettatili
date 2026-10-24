import React from 'react';
import type { MarineSafetyInfo } from './guestPortalTypes';

interface GuestMarineSafetyCardProps {
  marineSafety: MarineSafetyInfo;
}

export const GuestMarineSafetyCard: React.FC<GuestMarineSafetyCardProps> = ({ marineSafety }) => {
  return (
    <div
      className={`p-4 rounded-3xl border shadow-xl space-y-2.5 transition-all ${
        marineSafety.level === 'severe'
          ? 'bg-rose-950/30 border-rose-800 text-rose-200'
          : marineSafety.level === 'moderate'
          ? 'bg-amber-950/30 border-amber-800 text-amber-200'
          : 'bg-gradient-to-br from-emerald-950/35 via-slate-900 to-slate-900 border-emerald-800/60 text-emerald-100'
      }`}
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌊</span>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              Andaman Denizi Canlı Güvenlik & Seyir Durumu
            </h3>
            <span className="text-[10px] text-slate-400 font-mono block">
              Phuket Operasyon & Liman Başkanlığı Canlı Verisi
            </span>
          </div>
        </div>
        <span
          className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border ${
            marineSafety.level === 'severe'
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              : marineSafety.level === 'moderate'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
          }`}
        >
          {marineSafety.level === 'severe'
            ? '⚠️ Yüksek Dalga Uyarısı'
            : marineSafety.level === 'moderate'
            ? '⚡ Orta Dalga'
            : '🟢 Deniz Sakin · Güvenli Seyir'}
        </span>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed font-medium">
        {marineSafety.summary} {marineSafety.warningNote}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center font-mono text-xs">
        <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800">
          <span className="text-[9px] text-slate-400 uppercase block font-sans">Dalga Boyu</span>
          <strong className="text-white text-xs">{marineSafety.waveHeightMeters}m</strong>
        </div>
        <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800">
          <span className="text-[9px] text-slate-400 uppercase block font-sans">Rüzgar</span>
          <strong className="text-white text-xs">{marineSafety.windSpeedKnots} kn</strong>
        </div>
        <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800">
          <span className="text-[9px] text-slate-400 uppercase block font-sans">Phi Phi</span>
          <strong className="text-emerald-400 text-xs">Açık / Güvenli</strong>
        </div>
        <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800">
          <span className="text-[9px] text-slate-400 uppercase block font-sans">Phang Nga</span>
          <strong className="text-emerald-400 text-xs">Durgun / Korumalı</strong>
        </div>
      </div>
    </div>
  );
};
