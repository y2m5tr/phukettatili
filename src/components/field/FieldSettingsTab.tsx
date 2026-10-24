import React from 'react';
import { Compass, CheckCircle2, Building, ChevronRight, LogOut } from 'lucide-react';

export interface FieldSettingsTabProps {
  crewName: string;
  isCloudConnected: boolean;
  totalBookingsCount: number;
  viewerRole: 'owner' | 'manager' | 'guide' | 'driver' | null;
  canAccessAdmin: boolean;
  currentPassword: string;
  setCurrentPassword: (val: string) => void;
  newPassword: string;
  setNewPassword: (val: string) => void;
  isChangingPassword: boolean;
  onChangeOwnPassword: (e: React.FormEvent) => void;
  onLogout: () => void;
}

export function FieldSettingsTab({
  crewName,
  isCloudConnected,
  totalBookingsCount,
  viewerRole,
  canAccessAdmin,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  isChangingPassword,
  onChangeOwnPassword,
  onLogout,
}: FieldSettingsTabProps) {
  return (
    <main className="flex-1 px-4 py-4 space-y-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold text-lg">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{crewName}</h3>
            <p className="text-xs text-slate-400">Saha Operasyon Görevlisi</p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
          <div className="flex justify-between py-1.5 border-b border-slate-800/60">
            <span className="text-slate-400">Bulut Senkronizasyonu</span>
            <span className="font-semibold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isCloudConnected ? 'Supabase Canlı' : 'Yerel Hafıza'}
            </span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-800/60">
            <span className="text-slate-400">Toplam Kayıtlı Rezervasyon</span>
            <span className="font-bold text-white">{totalBookingsCount}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-800/60">
            <span className="text-slate-400">Saat Dilimi</span>
            <span className="font-medium text-slate-300">Phuket (GMT+7)</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-slate-400">PWA Modu</span>
            <span className="font-medium text-amber-400">Tam Ekran Mobil Uygulama</span>
          </div>
        </div>
      </div>

      {viewerRole && (
        <form
          onSubmit={onChangeOwnPassword}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3"
        >
          <h4 className="text-sm font-bold text-white">Şifre Değiştir</h4>
          <input
            type="password"
            required
            placeholder="Mevcut şifreniz"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
          <input
            type="password"
            required
            placeholder="Yeni şifre (en az 10 karakter, harf + rakam)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
          <button
            type="submit"
            disabled={isChangingPassword}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            {isChangingPassword ? 'Güncelleniyor…' : 'Şifreyi Güncelle'}
          </button>
        </form>
      )}

      {/* Hızlı Kısayollar */}
      <div className="space-y-2">
        {canAccessAdmin && (
          <a
            href="/admin"
            className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-between hover:bg-slate-800 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Building className="w-4 h-4 text-amber-400" />
              <span>Masaüstü Yönetici CRM Paneline Geç</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </a>
        )}

        <button
          onClick={onLogout}
          className="w-full p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-rose-500/20 active:scale-98 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Oturumu Kapat (Çıkış Yap)</span>
        </button>
      </div>
    </main>
  );
}
