import React from 'react';
import {
  ShieldCheck,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  User,
  Utensils,
} from 'lucide-react';
import type { CheckinPassenger } from './guestPortalTypes';

interface GuestCheckinFormProps {
  passengersList: CheckinPassenger[];
  isCheckinOpen: boolean;
  setIsCheckinOpen: React.Dispatch<React.SetStateAction<boolean>>;
  checkinSaved: boolean;
  isSubmittingCheckin: boolean;
  checkinMessage: string;
  onUpdatePassenger: (index: number, field: string, value: string) => void;
  onSaveCheckin: (e: React.SyntheticEvent) => void;
}

export const GuestCheckinForm: React.FC<GuestCheckinFormProps> = ({
  passengersList,
  isCheckinOpen,
  setIsCheckinOpen,
  checkinSaved,
  isSubmittingCheckin,
  checkinMessage,
  onUpdatePassenger,
  onSaveCheckin,
}) => {
  return (
    <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Deniz Polisi & Online Check-In</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Liman Manifestosu
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Tayland Kraliyeti liman sigortası ve deniz polisi için zorunludur.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsCheckinOpen((prev) => !prev)}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 transition-colors"
        >
          <span>{isCheckinOpen ? 'Kapat' : checkinSaved ? 'Düzenle' : 'Bilgileri Gir'}</span>
          {isCheckinOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Durum Özeti */}
      {checkinSaved ? (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">✓ Pasaport Bilgileriniz Sisteme Kaydedildi</span>
            <span className="text-[11px] text-slate-300">
              Liman manifestsosuna aktarıldı. Tur sabahı iskelede form doldurmakla zaman kaybetmeden doğrudan teknenize binebilirsiniz.
            </span>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
          <span className="text-slate-400">
            Kayıtlı Yolcu: <strong className="text-white font-mono">{passengersList.length} Kişi</strong>
          </span>
          <button
            type="button"
            onClick={() => setIsCheckinOpen(true)}
            className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
          >
            <span>Hızlıca Doldur (1 Dk)</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Açılır Form */}
      {isCheckinOpen && (
        <form onSubmit={onSaveCheckin} className="space-y-4 pt-2 border-t border-slate-800/80">
          {passengersList.map((p, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3"
            >
              <div className="flex items-center justify-between text-xs font-bold pb-2 border-b border-slate-800">
                <span className="text-purple-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>{idx + 1}. Yolcu Bilgileri</span>
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  {idx === 0 ? 'Ana İletişim Kişisi' : 'Misafir'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Ad Soyad (Pasaporttaki Gibi) *
                  </label>
                  <input
                    type="text"
                    value={p.fullName}
                    onChange={(e) => onUpdatePassenger(idx, 'fullName', e.target.value)}
                    placeholder="Örn: Ahmet Yılmaz"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Pasaport Numarası *
                  </label>
                  <input
                    type="text"
                    value={p.passportNo}
                    onChange={(e) => onUpdatePassenger(idx, 'passportNo', e.target.value.toUpperCase())}
                    placeholder="Örn: U12345678"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono uppercase focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Uyruk (Ülke) *
                    </label>
                    <input
                      type="text"
                      value={p.nationality}
                      onChange={(e) => onUpdatePassenger(idx, 'nationality', e.target.value.toUpperCase())}
                      placeholder="TR"
                      maxLength={4}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-center uppercase focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Cinsiyet
                    </label>
                    <select
                      value={p.gender}
                      onChange={(e) => onUpdatePassenger(idx, 'gender', e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="M">Erkek (M)</option>
                      <option value="F">Kadın (F)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Doğum Tarihi
                    </label>
                    <input
                      type="date"
                      value={p.birthDate}
                      onChange={(e) => onUpdatePassenger(idx, 'birthDate', e.target.value)}
                      className="w-full px-2 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-[11px] focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1 flex items-center gap-1">
                      <Utensils className="w-3 h-3 text-amber-400" />
                      <span>Yemek Tercihi</span>
                    </label>
                    <select
                      value={p.dietaryPreference}
                      onChange={(e) => onUpdatePassenger(idx, 'dietaryPreference', e.target.value)}
                      className="w-full px-2 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-[11px] focus:outline-none focus:border-purple-500"
                    >
                      <option value="standard">Standart</option>
                      <option value="vegetarian">Vejetaryen</option>
                      <option value="halal">Helal Menü</option>
                      <option value="vegan">Vegan</option>
                      <option value="seafood_allergy">Deniz Ürünü Alerjisi</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {checkinMessage && (
            <div
              className={`p-3 rounded-xl text-xs font-bold ${
                checkinMessage.startsWith('✅')
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              }`}
            >
              {checkinMessage}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setIsCheckinOpen(false)}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
            >
              Vazgeç
            </button>

            <button
              type="submit"
              disabled={isSubmittingCheckin}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-600/20 transition-all active:scale-98"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSubmittingCheckin ? 'Kaydediliyor...' : 'Bilgileri Kaydet & Doğrula'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
