import React from 'react';
import { Compass, ShieldCheck, AlertTriangle, ArrowRight } from 'lucide-react';

export interface FieldShiftScreenProps {
  crewName: string;
  setCrewName: (name: string) => void;
  identityError: string;
  setIdentityError: (err: string) => void;
  onStartShift: (e: React.SyntheticEvent) => void;
  onLogout: () => void;
}

export function FieldShiftScreen({
  crewName,
  setCrewName,
  identityError,
  setIdentityError,
  onStartShift,
  onLogout,
}: FieldShiftScreenProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Logo & Başlık */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-amber-300 shadow-2xl shadow-amber-500/20 mb-4 border border-amber-300/30">
            <Compass className="w-10 h-10 text-slate-950" />
          </div>
          <h1 className="text-2xl font-bold font-serif text-white tracking-wide">
            Phuket Tatili
          </h1>
          <p className="text-amber-400 font-medium text-xs uppercase tracking-widest mt-1">
            Saha & Rehber Operasyon
          </p>
        </div>

        {/* Vardiya Formu */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Oturum Doğrulandı
            </span>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              PWA Mobil
            </span>
          </div>

          <form onSubmit={onStartShift} className="space-y-4">
            <div>
              <label htmlFor="crew-name" className="block text-xs text-slate-300 mb-1.5 font-medium">
                Rehber / Şoför Adı
              </label>
              <input
                id="crew-name"
                type="text"
                value={crewName}
                onChange={(e) => {
                  setCrewName(e.target.value);
                  setIdentityError('');
                }}
                placeholder="Örn: Rehber Deniz"
                autoFocus
                className="w-full px-4 py-3 rounded-2xl bg-slate-950/70 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all placeholder-slate-500"
              />
              <p className="mt-1.5 text-[11px] text-slate-500">
                Bu ad manifestoda ve ofise giden WhatsApp raporlarında görünür.
              </p>
            </div>

            {identityError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{identityError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Vardiyayı Başlat</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <button
              type="button"
              onClick={onLogout}
              className="text-xs text-slate-400 hover:text-slate-200 underline transition-colors"
            >
              Oturumu Kapat (Çıkış Yap)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
