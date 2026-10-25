import { CheckCircle2, Clock } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import type { TourItem } from '../../../data/adminInitialData';
import { HOTEL_ZONES, detectHotelZone } from '../../../data/adminInitialData';
import type { SeasonInfo } from '../../../lib/publicRefs';
import { fmtMoney } from '../../../lib/moneyFormat';

export interface BookingFormFieldsProps {
  tours: TourItem[];
  selectedTour: TourItem;
  setSelectedTour: Dispatch<SetStateAction<TourItem>>;
  tourDate: string;
  setTourDate: Dispatch<SetStateAction<string>>;
  adultCount: number;
  setAdultCount: Dispatch<SetStateAction<number>>;
  childCount: number;
  setChildCount: Dispatch<SetStateAction<number>>;
  customerName: string;
  setCustomerName: Dispatch<SetStateAction<string>>;
  customerPhone: string;
  setCustomerPhone: Dispatch<SetStateAction<string>>;
  hotelZone: string;
  setHotelZone: Dispatch<SetStateAction<string>>;
  hotel: string;
  setHotel: Dispatch<SetStateAction<string>>;
  roomNumber: string;
  setRoomNumber: Dispatch<SetStateAction<string>>;
  specialNotes: string;
  setSpecialNotes: Dispatch<SetStateAction<string>>;
  customPickupTime: string;
  setCustomPickupTime: Dispatch<SetStateAction<string>>;
  recommendedPickup: string;
  season: SeasonInfo;
  pricePerAdult: number;
  pricePerChild: number;
}

// Rezervasyon formunun sol kolonu: tur seçimi, tarih/yolcu sayısı ve
// misafir & otel alınış bilgileri (AgentPortalApp'ten birebir taşındı).
export default function BookingFormFields({
  tours,
  selectedTour,
  setSelectedTour,
  tourDate,
  setTourDate,
  adultCount,
  setAdultCount,
  childCount,
  setChildCount,
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  hotelZone,
  setHotelZone,
  hotel,
  setHotel,
  roomNumber,
  setRoomNumber,
  specialNotes,
  setSpecialNotes,
  customPickupTime,
  setCustomPickupTime,
  recommendedPickup,
  season,
  pricePerAdult,
  pricePerChild,
}: BookingFormFieldsProps) {
  return (
    <div className="lg:col-span-8 space-y-6">
      {/* 1. Tur Seçimi */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-brand-primary text-white flex items-center justify-center text-[10px]">1</span>
            Tur Programı Seçiniz
          </label>
          <span className="text-[11px] text-slate-400">
            Aktif {tours.length} Tur
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
          {tours.map((t) => (
            <div
              key={t.id}
              onClick={() => setSelectedTour(t)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                selectedTour.id === t.id
                  ? 'bg-brand-primary/10 border-brand-accent shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-bold text-xs text-white line-clamp-1">{t.title}</h4>
                {selectedTour.id === t.id && (
                  <CheckCircle2 className="w-4 h-4 text-brand-accent shrink-0" />
                )}
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">{t.duration || 'Tam Gün'}</span>
                <span className="font-bold text-white font-mono">
                  {t.priceThb > 0 ? `${fmtMoney(t.priceThb)} THB` : '2,800 THB'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Tarih ve Kişi Sayısı */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-brand-primary text-white flex items-center justify-center text-[10px]">2</span>
          Tarih & Yolcu Sayısı
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1 flex items-center justify-between">
              <span>Tur Tarihi *</span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold border ${season.badgeColor}`}>
                {season.season === 'peak' ? 'Peak' : season.season === 'low' ? 'Low' : 'High'}
              </span>
            </label>
            <input
              type="date"
              required
              value={tourDate}
              onChange={(e) => setTourDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:border-brand-accent"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
              Yetişkin ({fmtMoney(pricePerAdult)} THB) *
            </label>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setAdultCount((c) => Math.max(1, c - 1))}
                className="w-10 h-10 rounded-l-xl bg-slate-800 hover:bg-slate-700 font-bold"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max="50"
                value={adultCount}
                onChange={(e) => setAdultCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full h-10 text-center bg-slate-950 border-y border-slate-700 text-xs font-bold text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setAdultCount((c) => c + 1)}
                className="w-10 h-10 rounded-r-xl bg-slate-800 hover:bg-slate-700 font-bold"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
              Çocuk 4-11 Yaş ({fmtMoney(pricePerChild)} THB)
            </label>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setChildCount((c) => Math.max(0, c - 1))}
                className="w-10 h-10 rounded-l-xl bg-slate-800 hover:bg-slate-700 font-bold"
              >
                -
              </button>
              <input
                type="number"
                min="0"
                max="30"
                value={childCount}
                onChange={(e) => setChildCount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full h-10 text-center bg-slate-950 border-y border-slate-700 text-xs font-bold text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setChildCount((c) => c + 1)}
                className="w-10 h-10 rounded-r-xl bg-slate-800 hover:bg-slate-700 font-bold"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Misafir & Otel Alınış Bilgileri */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-brand-primary text-white flex items-center justify-center text-[10px]">3</span>
          Misafir İletişim & Otel Transfer Noktası
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
              Misafir Adı ve Soyadı *
            </label>
            <input
              type="text"
              required
              placeholder="Örn: Hakan Öztürk"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-accent"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
              Telefon / WhatsApp Numarası *
            </label>
            <input
              type="tel"
              required
              placeholder="Örn: +90 532 123 45 67"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-accent"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
              Otel Bölgesi (Zone) *
            </label>
            <select
              value={hotelZone}
              onChange={(e) => setHotelZone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:border-brand-accent"
            >
              {HOTEL_ZONES.map((z) => (
                <option key={z} value={z}>
                  📍 {z}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                Otel Adı *
              </label>
              <input
                type="text"
                required
                placeholder="Örn: Amari Phuket Resort"
                value={hotel}
                onChange={(e) => {
                  setHotel(e.target.value);
                  const detected = detectHotelZone(e.target.value);
                  if (detected && detected !== 'Diğer') setHotelZone(detected);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-accent"
              />
            </div>

            <div className="w-24">
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                Oda No
              </label>
              <input
                type="text"
                placeholder="304"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-accent text-center"
              />
            </div>
          </div>
        </div>

        {/* Otelden Alınış Saati (Manuel Giriş & Hızlı Butonlar) */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold uppercase text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>⏰ Otelden Alış Saati</span>
            </label>
            <button
              type="button"
              onClick={() => setCustomPickupTime(recommendedPickup)}
              className="text-[10px] text-amber-400 font-bold hover:underline cursor-pointer"
              title="Bölge için standart önerilen saati uygula"
            >
              ⚡ Önerilen: {recommendedPickup}
            </button>
          </div>
          <input
            type="text"
            placeholder={`Örn: ${recommendedPickup} - 08:00`}
            value={customPickupTime !== '' ? customPickupTime : `${recommendedPickup} - 08:00`}
            onChange={(e) => setCustomPickupTime(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-brand-accent"
          />
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            <span className="text-[10px] text-slate-500">Hızlı Aralık:</span>
            {['07:15 - 07:30', '07:30 - 07:45', '07:45 - 08:00', '08:00 - 08:30', '08:30 - 09:00', '09:00 - 09:15'].map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => setCustomPickupTime(time)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                  (customPickupTime !== '' ? customPickupTime : `${recommendedPickup} - 08:00`) === time
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
            Özel Notlar (İsteğe bağlı)
          </label>
          <input
            type="text"
            placeholder="Vejetaryen yemek tercihi, balayı çifti vb."
            value={specialNotes}
            onChange={(e) => setSpecialNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-accent"
          />
        </div>
      </div>
    </div>
  );
}
