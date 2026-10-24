import React from 'react';
import { Hotel } from 'lucide-react';
import {
  type Booking,
  type TourItem,
  type BookingHotelStay,
  getPhuketSeason,
  detectHotelZone,
} from '../../../data/adminInitialData';
import { calculateTourOccupancy, getTourCapacity } from '../../../lib/allotment';

export interface BookingToursListProps {
  formData: Partial<Booking>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Booking>>>;
  tours: TourItem[];
  bookings: Booking[];
  editingBooking: Booking | null;
  activeTourIndex: number;
  setSelectedTourIndex: (idx: number) => void;
  recStart: string;
  recEnd: string;
  bookingHotels: BookingHotelStay[];
}

export function BookingToursList({
  formData,
  setFormData,
  tours,
  bookings,
  editingBooking,
  activeTourIndex,
  setSelectedTourIndex,
  recStart,
  recEnd,
  bookingHotels,
}: BookingToursListProps) {
  return (
    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
          <span>🌴</span> Tur Programı & Tarihleri (Paket)
        </span>
        <button
          type="button"
          onClick={() => {
            const defaultTour = tours[0]?.title || 'Phi Phi Adaları Turu';
            const matchedTour = tours.find((t) => t.title === defaultTour);
            const currentTours = formData.tours || [];
            const lastDate =
              currentTours[currentTours.length - 1]?.tourDate ||
              new Date().toISOString().split('T')[0];
            const d = new Date(lastDate);
            d.setDate(d.getDate() + 1);
            const nextDate = d.toISOString().split('T')[0];

            const nextTours = [
              ...currentTours,
              {
                tourTitle: defaultTour,
                tourDate: nextDate,
                pickupTime: formData.pickupTime || `${recStart} - ${recEnd}`,
                priceThb: matchedTour?.priceThb || 2200,
              },
            ];
            const adults = Number(formData.adultCount) || 1;
            const calculatedTotal =
              nextTours.reduce((acc, t) => acc + (t.priceThb || 0), 0) * adults;
            setFormData({
              ...formData,
              tours: nextTours,
              totalPriceThb: calculatedTotal > 0 ? calculatedTotal : formData.totalPriceThb,
            });
            setSelectedTourIndex(nextTours.length - 1);
          }}
          className="px-2.5 py-1 rounded-lg bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary/90 transition-all shadow-xs flex items-center gap-1 cursor-pointer"
        >
          <span>+ Paketine Tur Ekle</span>
        </button>
      </div>

      <div className="space-y-3 pt-1">
        {(formData.tours || []).map((tourSchedule, idx) => (
          <div
            key={idx}
            className={`p-3.5 rounded-xl bg-white dark:bg-slate-800 border transition-all shadow-2xs space-y-2.5 relative ${
              activeTourIndex === idx
                ? 'border-amber-500/80 ring-1 ring-amber-500/30'
                : 'border-slate-200 dark:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTourIndex(idx)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase cursor-pointer transition-colors ${
                    activeTourIndex === idx
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-brand-primary text-white'
                  }`}
                  title="Bu turun alınış detaylarını alttaki panelde görüntüle ve düzenle"
                >
                  #{idx + 1} Tur Programı {activeTourIndex === idx ? '· Seçili' : ''}
                </button>
                {tourSchedule.tourDate && (
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                    📅 {tourSchedule.tourDate}
                  </span>
                )}
              </div>

              {(formData.tours || []).length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const updated = (formData.tours || []).filter((_, i) => i !== idx);
                    const adults = Number(formData.adultCount) || 1;
                    const calculatedTotal =
                      updated.reduce((acc, t) => acc + (t.priceThb || 0), 0) * adults;
                    setFormData({
                      ...formData,
                      tours: updated,
                      totalPriceThb:
                        calculatedTotal > 0 ? calculatedTotal : formData.totalPriceThb,
                    });
                    if (activeTourIndex >= updated.length) {
                      setSelectedTourIndex(Math.max(0, updated.length - 1));
                    }
                  }}
                  className="text-slate-400 hover:text-red-500 p-1 text-xs font-bold transition-colors cursor-pointer"
                  title="Bu turu kaldır"
                >
                  ✕ Turu Kaldır
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <div className="sm:col-span-5">
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Tur Adı *
                </label>
                <select
                  value={tourSchedule.tourTitle}
                  onChange={(e) => {
                    const selectedTitle = e.target.value;
                    const matchedTour = tours.find((t) => t.title === selectedTitle);
                    const updated = (formData.tours || []).map((item, i) =>
                      i === idx
                        ? {
                            ...item,
                            tourTitle: selectedTitle,
                            priceThb: matchedTour?.priceThb || item.priceThb,
                          }
                        : item
                    );
                    const adults = Number(formData.adultCount) || 1;
                    const calculatedTotal =
                      updated.reduce((acc, t) => acc + (t.priceThb || 0), 0) * adults;
                    setFormData({
                      ...formData,
                      tours: updated,
                      totalPriceThb:
                        calculatedTotal > 0 ? calculatedTotal : formData.totalPriceThb,
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none font-medium"
                >
                  {tours.map((t) => (
                    <option key={t.id} value={t.title}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 flex items-center justify-between">
                  <span>Tur Tarihi *</span>
                  {tourSchedule.tourDate &&
                    (() => {
                      const s = getPhuketSeason(tourSchedule.tourDate);
                      return (
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold border ${s.badgeColor}`}
                        >
                          {s.season === 'peak'
                            ? '⚡ Peak'
                            : s.season === 'low'
                            ? '🌴 Low'
                            : '☀️ High'}
                        </span>
                      );
                    })()}
                </label>
                <input
                  type="date"
                  required
                  value={tourSchedule.tourDate}
                  onChange={(e) => {
                    const updated = (formData.tours || []).map((item, i) =>
                      i === idx ? { ...item, tourDate: e.target.value } : item
                    );
                    setFormData({
                      ...formData,
                      tourDate: idx === 0 ? e.target.value : formData.tourDate,
                      tours: updated,
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none font-semibold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Alış Aralığı
                </label>
                <input
                  type="text"
                  placeholder="08:30 - 09:00"
                  value={tourSchedule.pickupTime || (idx === 0 ? formData.pickupTime || '' : '')}
                  onChange={(e) => {
                    const val = e.target.value;
                    const updated = (formData.tours || []).map((item, i) =>
                      i === idx ? { ...item, pickupTime: val } : item
                    );
                    setFormData({
                      ...formData,
                      pickupTime: idx === 0 ? val : formData.pickupTime,
                      tours: updated,
                    });
                  }}
                  className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Kişi Başı (THB)
                </label>
                <input
                  type="number"
                  value={tourSchedule.priceThb || 0}
                  onChange={(e) => {
                    const val = Number(e.target.value) || 0;
                    const updated = (formData.tours || []).map((item, i) =>
                      i === idx ? { ...item, priceThb: val } : item
                    );
                    const adults = Number(formData.adultCount) || 1;
                    const calculatedTotal =
                      updated.reduce((acc, t) => acc + (t.priceThb || 0), 0) * adults;
                    setFormData({
                      ...formData,
                      tours: updated,
                      totalPriceThb:
                        calculatedTotal > 0 ? calculatedTotal : formData.totalPriceThb,
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none"
                />
              </div>
            </div>

            {/* Tur Bazında Alınış Oteli (Birden fazla otel girildiyse) */}
            {bookingHotels.length > 0 && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500 shrink-0 flex items-center gap-1">
                    <Hotel className="w-3 h-3 text-amber-500" />
                    <span>Alınış Oteli:</span>
                  </span>
                  <select
                    value={tourSchedule.hotel || formData.hotel || ''}
                    onChange={(e) => {
                      const chosen = e.target.value;
                      let zone = formData.hotelZone || 'Patong & Kalim';
                      let room = formData.roomNumber || '';
                      if (chosen === formData.hotel) {
                        zone = formData.hotelZone || detectHotelZone(chosen);
                        room = formData.roomNumber || '';
                      } else {
                        const found = bookingHotels.find((h) => h.hotelName === chosen);
                        if (found) {
                          zone = found.hotelZone || detectHotelZone(chosen);
                          room = found.roomNumber || '';
                        } else {
                          zone = detectHotelZone(chosen);
                        }
                      }
                      const updated = (formData.tours || []).map((item, i) =>
                        i === idx
                          ? {
                              ...item,
                              hotel: chosen,
                              hotelZone: zone,
                              roomNumber: room,
                            }
                          : item
                      );
                      setFormData({ ...formData, tours: updated });
                    }}
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    <option value={formData.hotel || ''}>
                      #1 Otel (Ana): {formData.hotel || 'Belirtilmedi'} ({formData.hotelZone || 'Bölge'})
                    </option>
                    {bookingHotels.map((bh, bhIdx) => (
                      <option key={bh.id || bhIdx} value={bh.hotelName}>
                        #{bhIdx + 2} Otel: {bh.hotelName || `Ek Otel ${bhIdx + 1}`} ({bh.hotelZone || 'Bölge'})
                      </option>
                    ))}
                  </select>
                </div>

                {tourSchedule.hotel && tourSchedule.hotel !== formData.hotel && (
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-300 dark:border-amber-700 shrink-0">
                    📍 Farklı Otelden Alınış
                  </span>
                )}
              </div>
            )}

            {/* Kontenjan Durumu */}
            {tourSchedule.tourTitle &&
              tourSchedule.tourDate &&
              (() => {
                const curPax =
                  (Number(formData.adultCount) || 1) + (Number(formData.childCount) || 0);
                const matchedTour = tours.find((t) => t.title === tourSchedule.tourTitle);
                const capacity =
                  matchedTour?.maxCapacity ||
                  getTourCapacity(tourSchedule.tourTitle, matchedTour);
                const occ = calculateTourOccupancy(
                  tourSchedule.tourTitle,
                  tourSchedule.tourDate,
                  bookings.filter((b) => b.id !== editingBooking?.id),
                  capacity
                );
                const remainingAfterThis = occ.remainingSeats - curPax;
                const isOverbooking = remainingAfterThis < 0;

                return (
                  <div
                    className={`p-2 rounded-lg text-xs flex items-center justify-between border ${
                      isOverbooking
                        ? 'bg-red-50 text-red-800 border-red-300 dark:bg-red-950/60 dark:text-red-200 dark:border-red-800 font-bold'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-800'
                    }`}
                  >
                    <span>
                      ⛵ Kontenjan: {occ.bookedPax} / {occ.capacity} Dolu (%{occ.occupancyPercent})
                    </span>
                    <span>
                      Kalan Boş Koltuk: <strong>{remainingAfterThis}</strong>
                    </span>
                  </div>
                );
              })()}
          </div>
        ))}
      </div>
    </div>
  );
}
