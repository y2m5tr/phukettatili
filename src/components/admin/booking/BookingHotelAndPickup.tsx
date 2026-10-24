import React from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Hotel,
  AlertTriangle,
  Compass,
} from 'lucide-react';
import {
  type Booking,
  type BookingHotelStay,
  HOTEL_ZONES,
  detectHotelZone,
} from '../../../data/adminInitialData';
import { BookingLuggageAndWhatsApp } from './BookingLuggageAndWhatsApp';

export interface BookingHotelAndPickupProps {
  formData: Partial<Booking>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Booking>>>;
  activeTour: any;
  activeZone: string;
  activeTourIndex: number;
  setSelectedTourIndex: (idx: number) => void;
  activeTourDate: string;
  currentRange: { start: string; end: string };
  activeTourPickup: string;
  smartPickup: any;
  applyTimeRange: (start: string, end: string) => void;
  handlePickupDateChange: (newDate: string) => void;
  handleStartChange: (val: string) => void;
  handleEndChange: (val: string) => void;
  bookingHotels: BookingHotelStay[];
  handleAddBookingHotel: () => void;
  handleUpdateBookingHotel: (index: number, field: keyof BookingHotelStay, value: any) => void;
  handleRemoveBookingHotel: (index: number) => void;
  copiedType: string | null;
  handleCopyDriverCard: (openWhatsApp?: boolean) => void;
  handleCopyGuestReminder: (openWhatsApp?: boolean) => void;
}

export function BookingHotelAndPickup({
  formData,
  setFormData,
  activeTour,
  activeZone,
  activeTourIndex,
  setSelectedTourIndex,
  activeTourDate,
  currentRange,
  activeTourPickup,
  smartPickup,
  applyTimeRange,
  handlePickupDateChange,
  handleStartChange,
  handleEndChange,
  bookingHotels,
  handleAddBookingHotel,
  handleUpdateBookingHotel,
  handleRemoveBookingHotel,
  copiedType,
  handleCopyDriverCard,
  handleCopyGuestReminder,
}: BookingHotelAndPickupProps) {
  return (
    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3.5">
      <div className="flex items-center justify-between pb-1 border-b border-slate-200/60 dark:border-slate-800">
        <div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <Hotel className="w-4 h-4 text-amber-500" />
            <span>🏨 Konaklama Oteli & ⏰ Alınış Detayları</span>
          </h3>
          <p className="text-[11px] text-slate-500">
            Tur lobi alınışı için otel, alınış tarihi ve saat aralığını belirleyin.
          </p>
        </div>
        {activeTour && (
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400 text-[10px] font-bold">
            <span>🎯 Düzenlenen Tur:</span>
            <strong className="truncate max-w-[140px]">{activeTour.tourTitle}</strong>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
        {/* Otel Adı */}
        <div className="sm:col-span-8">
          <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
            🏨 Ana Konaklama Oteli *
          </label>
          <input
            type="text"
            required
            placeholder="Örn: Millennium Resort Patong"
            value={formData.hotel || ''}
            onChange={(e) => {
              const val = e.target.value;
              const detected = detectHotelZone(val);
              setFormData((prev) => {
                const currentZone = prev.hotelZone || 'Patong & Kalim';
                const shouldAutoZone =
                  !prev.hotelZone ||
                  prev.hotelZone === 'Patong & Kalim' ||
                  prev.hotelZone === 'Genel Phuket';
                const nextZone = shouldAutoZone && detected ? detected : currentZone;
                return {
                  ...prev,
                  hotel: val,
                  hotelZone: nextZone,
                };
              });
            }}
            className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/40 text-slate-900 dark:text-white"
          />
        </div>

        {/* Oda No */}
        <div className="sm:col-span-4">
          <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
            🚪 Oda No
          </label>
          <input
            type="text"
            placeholder="Örn: 402"
            value={formData.roomNumber || ''}
            onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/40 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Bölge Seçimi */}
      <div>
        <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
          📍 Otel Bölgesi / Servis Hattı *
        </label>
        <select
          value={activeZone}
          onChange={(e) => setFormData({ ...formData, hotelZone: e.target.value })}
          className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-brand-accent/40 text-slate-900 dark:text-white font-medium"
        >
          {HOTEL_ZONES.map((zone) => (
            <option key={zone} value={zone}>
              {zone}
            </option>
          ))}
        </select>
      </div>

      {/* ⏰ ALINIŞ TARİHİ VE SAAT ARALIĞI KUTUSU */}
      <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-xs font-bold uppercase text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>⏰ Alınış Tarihi & Saat Aralığı *</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400">
              💡 Önerilen Arasistem:
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-900 dark:text-amber-300 font-mono text-xs font-bold">
              {smartPickup.recommendedWindow}
            </span>
          </div>
        </div>

        {/* 📍 Akıllı İskele & Sürüş Mesafesi Zekası (Smart Pickup Matrix) */}
        <div
          className={`p-3 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all ${
            smartPickup.isDistanceWarning
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 shadow-sm'
              : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {smartPickup.isDistanceWarning ? (
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5 animate-bounce" />
            ) : (
              <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-xs">
                  {smartPickup.isDistanceWarning ? '⚠️ Gecikme & Mesafe Uyarısı' : '📍 Akıllı İskele Mesafesi'}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/90 dark:bg-slate-900/90 border border-current">
                  ⚓ {smartPickup.pierName} · ~{smartPickup.estimatedDriveMinutes} dk
                </span>
                <span className="text-[10px] font-bold opacity-80">
                  ({smartPickup.zoneDistanceCategory === 'extreme_far' ? 'Çok Uzak Bölge' : smartPickup.zoneDistanceCategory === 'far' ? 'Uzak Bölge' : 'Uygun Bölge'})
                </span>
              </div>
              <p className="text-[11px] mt-1 leading-relaxed opacity-95 font-medium">
                {smartPickup.isDistanceWarning ? smartPickup.warningMessage : smartPickup.adviceNote}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => applyTimeRange(smartPickup.recommendedStart, smartPickup.recommendedEnd)}
            className={`px-3 py-1.5 rounded-lg text-xs font-black shrink-0 transition-all cursor-pointer shadow-xs flex items-center gap-1.5 ${
              smartPickup.isDistanceWarning
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 ring-2 ring-rose-400'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
            title={`Tura ve iskeleye özel önerilen saati (${smartPickup.recommendedWindow}) uygula`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>⚡ Önerilen Saati Uygula ({smartPickup.recommendedWindow})</span>
          </button>
        </div>

        {/* Çoklu Tur Varsa Seçici Sekmeler */}
        {(formData.tours || []).length > 1 && (
          <div className="space-y-1.5 pt-0.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">
              🎯 Hangi turun lobi alınışı belirleniyor? (Tura tıklayarak seçin):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(formData.tours || []).map((t, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedTourIndex(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTourIndex === idx
                      ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-amber-400'
                  }`}
                >
                  <span>#{idx + 1}</span>
                  <span className="truncate max-w-[140px]">{t.tourTitle}</span>
                  <span className="font-mono text-[10px] opacity-75">
                    ({t.tourDate || 'Tarihsiz'})
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tarih ve 2'li Saat Kutuları Yan Yana */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* 📅 ALINIŞ TARİHİ */}
          <div className="sm:col-span-5">
            <label className="block text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span>Alınış Tarihi *</span>
            </label>
            <input
              type="date"
              required
              value={activeTourDate}
              onChange={(e) => handlePickupDateChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border-2 border-amber-500/40 focus:border-amber-500 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          {/* ⏰ 2'Lİ SAAT KUTULARI */}
          <div className="sm:col-span-7">
            <label className="block text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
              Saat Aralığı (Lobi Bekleme) *
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400 uppercase">
                  Başla
                </span>
                <input
                  type="text"
                  required
                  placeholder="08:30"
                  value={currentRange.start}
                  onChange={(e) => handleStartChange(e.target.value)}
                  className="w-full pl-12 pr-2 py-2 rounded-xl bg-white dark:bg-slate-800 border-2 border-amber-500/40 focus:border-amber-500 text-xs font-bold text-slate-900 dark:text-white text-center focus:outline-none"
                />
              </div>

              <span className="text-slate-400 font-bold text-xs shrink-0">➔</span>

              <div className="flex-1 relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400 uppercase">
                  Bitiş
                </span>
                <input
                  type="text"
                  required
                  placeholder="09:00"
                  value={currentRange.end}
                  onChange={(e) => handleEndChange(e.target.value)}
                  className="w-full pl-12 pr-2 py-2 rounded-xl bg-white dark:bg-slate-800 border-2 border-amber-500/40 focus:border-amber-500 text-xs font-bold text-slate-900 dark:text-white text-center focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Hızlı 2'li Aralık Butonları */}
        <div className="flex items-center gap-1 flex-wrap pt-0.5">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Hızlı Saat:</span>
          {[
            '07:00 - 07:15',
            '07:15 - 07:30',
            '07:30 - 07:45',
            '07:45 - 08:00',
            '08:00 - 08:30',
            '08:30 - 09:00',
            '09:00 - 09:15',
            '11:30 - 12:00',
            '12:30 - 13:00',
          ].map((range) => {
            const isSelected =
              (activeTourPickup || '').replace(/\s+/g, '') === range.replace(/\s+/g, '');
            return (
              <button
                key={range}
                type="button"
                onClick={() => {
                  const [s, e] = range.split('-').map((t) => t.trim());
                  applyTimeRange(s, e);
                }}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {range}
              </button>
            );
          })}
        </div>
      </div>

      {/* 🏨 Ek Konaklama Otelleri (Farklı Otelde Kalış) */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Hotel className="w-3.5 h-3.5 text-amber-500" />
            <span>Ek Konaklama Otelleri {bookingHotels.length > 0 ? `(${bookingHotels.length} Ek Otel)` : ''}</span>
          </span>
          <button
            type="button"
            onClick={handleAddBookingHotel}
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Başka Otel Ekle (Farklı Otelde Kalış)</span>
          </button>
        </div>

        {bookingHotels.length > 0 && (
          <div className="space-y-2.5 pt-1">
            {bookingHotels.map((h, hIdx) => (
              <div
                key={h.id || hIdx}
                className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400">
                    #{hIdx + 2}. Konaklama Oteli
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveBookingHotel(hIdx)}
                    className="text-slate-400 hover:text-rose-500 p-1 text-xs transition cursor-pointer"
                    title="Bu oteli kaldır"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  <div className="sm:col-span-8">
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">
                      Otel Adı *
                    </label>
                    <input
                      type="text"
                      placeholder="Örn: SAii Laguna Phuket"
                      value={h.hotelName}
                      onChange={(e) => handleUpdateBookingHotel(hIdx, 'hotelName', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">
                      Oda No
                    </label>
                    <input
                      type="text"
                      placeholder="Örn: 204"
                      value={h.roomNumber || ''}
                      onChange={(e) => handleUpdateBookingHotel(hIdx, 'roomNumber', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 text-xs">
                  <div className="sm:col-span-5">
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">
                      Bölge *
                    </label>
                    <select
                      value={h.hotelZone || 'Patong & Kalim'}
                      onChange={(e) => handleUpdateBookingHotel(hIdx, 'hotelZone', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                    >
                      {HOTEL_ZONES.map((zone) => (
                        <option key={zone} value={zone}>
                          {zone}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-7">
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">
                      Konaklama Tarih Aralığı / Not:
                    </label>
                    <input
                      type="text"
                      placeholder="Örn: 23-26 Ekim (Laguna etabı)"
                      value={h.notes || ''}
                      onChange={(e) => handleUpdateBookingHotel(hIdx, 'notes', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🧳 Valiz/Bagaj & 📲 WhatsApp Kartları */}
      <BookingLuggageAndWhatsApp
        formData={formData}
        setFormData={setFormData}
        bookingHotels={bookingHotels}
        copiedType={copiedType}
        handleCopyDriverCard={handleCopyDriverCard}
        handleCopyGuestReminder={handleCopyGuestReminder}
      />
    </div>
  );
}
