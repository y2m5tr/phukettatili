import React from 'react';
import { Wallet, Building, Briefcase } from 'lucide-react';
import {
  type Booking,
  type TourItem,
  type PartnerAgent,
  type SupplierItem,
  type TourCostItem,
  HOTEL_ZONES,
  detectHotelZone,
  getRecommendedPickupTime,
  getPhuketSeason,
  calculateAgentCommission,
  lookupTourCost,
} from '../../data/adminInitialData';
import { calculateTourOccupancy, getTourCapacity } from '../../lib/allotment';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingBooking: Booking | null;
  formData: Partial<Booking>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Booking>>>;
  onSubmit: (e: React.FormEvent) => void;
  tours: TourItem[];
  bookings: Booking[];
  agents: PartnerAgent[];
  suppliers: SupplierItem[];
  tourCosts: TourCostItem[];
  showToast: (msg: string) => void;
}

export default function BookingModal({
  isOpen,
  onClose,
  editingBooking,
  formData,
  setFormData,
  onSubmit,
  tours,
  bookings,
  agents,
  suppliers,
  tourCosts,
  showToast,
}: BookingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-surface-2 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto p-6 sm:p-8">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
            {editingBooking ? 'Rezervasyonu Düzenle' : 'Yeni Rezervasyon Ekle'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Müşteri Adı *
              </label>
              <input
                type="text"
                required
                value={formData.customerName || ''}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Telefon / WhatsApp *
              </label>
              <input
                type="text"
                required
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
              />
            </div>
          </div>

          {/* Otel, Bölge, Alış Saati ve Oda No */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
              {/* 🏨 Otel Adı */}
              <div className="sm:col-span-8">
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  🏨 Otel Adı *
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
                      const recTime = getRecommendedPickupTime(nextZone);
                      // Sadece henüz saat girilmediyse önerileni başlangıç değeri yap
                      const shouldFillRecTime = !prev.pickupTime;
                      const nextTime = shouldFillRecTime ? recTime : prev.pickupTime;
                      const updatedTours = (prev.tours || []).map((t, idx) =>
                        idx === 0 && shouldFillRecTime ? { ...t, pickupTime: nextTime } : t
                      );
                      return {
                        ...prev,
                        hotel: val,
                        hotelZone: nextZone,
                        pickupTime: nextTime,
                        tours: updatedTours.length > 0 ? updatedTours : prev.tours,
                      };
                    });
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/40 text-slate-900 dark:text-white"
                />
              </div>

              {/* 🚪 Oda Numarası */}
              <div className="sm:col-span-4">
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  🚪 Oda Numarası
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

            {/* 📍 Bölge / Hat & ⏰ Alış Saati (Manuel Değiştirilebilir) */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 pt-0.5">
              {/* Bölge Seçimi */}
              <div className="sm:col-span-6">
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  📍 Bölge / Hat *
                </label>
                <select
                  value={
                    formData.hotelZone ||
                    (formData.hotel ? detectHotelZone(formData.hotel) : 'Patong & Kalim')
                  }
                  onChange={(e) => {
                    const zone = e.target.value;
                    const recTime = getRecommendedPickupTime(zone);
                    setFormData((prev) => {
                      const shouldUpdatePickup = !prev.pickupTime;
                      const updatedPickup = shouldUpdatePickup ? recTime : prev.pickupTime;
                      const updatedTours = (prev.tours || []).map((t, idx) =>
                        idx === 0 && shouldUpdatePickup ? { ...t, pickupTime: updatedPickup } : t
                      );
                      return {
                        ...prev,
                        hotelZone: zone,
                        pickupTime: updatedPickup,
                        tours: updatedTours.length > 0 ? updatedTours : prev.tours,
                      };
                    });
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/40 text-slate-900 dark:text-white font-medium"
                >
                  {HOTEL_ZONES.map((zone) => (
                    <option key={zone} value={zone}>
                      {zone} (Standart: {getRecommendedPickupTime(zone)})
                    </option>
                  ))}
                </select>
              </div>

              {/* ⏰ Otelden Lobi Alış Saati (Manuel Giriş) */}
              <div className="sm:col-span-6">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <span>⏰</span> Otelden Alış Saati *
                  </label>
                  {(() => {
                    const activeZone =
                      formData.hotelZone ||
                      (formData.hotel ? detectHotelZone(formData.hotel) : 'Patong & Kalim');
                    const rec = getRecommendedPickupTime(activeZone);
                    return (
                      <button
                        type="button"
                        onClick={() => {
                          const updatedTours = (formData.tours || []).map((t, idx) =>
                            idx === 0 ? { ...t, pickupTime: rec } : t
                          );
                          setFormData({
                            ...formData,
                            pickupTime: rec,
                            tours: updatedTours.length > 0 ? updatedTours : formData.tours,
                          });
                        }}
                        className="text-[10px] text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer"
                        title="Bu bölgenin standart önerilen saatini doldur"
                      >
                        ⚡ Önerilen: {rec}
                      </button>
                    );
                  })()}
                </div>

                <div>
                  <input
                    type="text"
                    required
                    placeholder="Örn: 07:15 veya 08:30"
                    value={formData.pickupTime || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      const updatedTours = (formData.tours || []).map((t, idx) =>
                        idx === 0 ? { ...t, pickupTime: val } : t
                      );
                      setFormData({
                        ...formData,
                        pickupTime: val,
                        tours: updatedTours.length > 0 ? updatedTours : formData.tours,
                      });
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border-2 border-amber-500/40 focus:border-amber-500 dark:border-amber-500/50 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>

                {/* Hızlı Seçim Saat Rozetleri */}
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-semibold">Hızlı:</span>
                  {['06:45', '07:00', '07:15', '07:30', '07:45', '08:00', '08:30'].map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => {
                        const updatedTours = (formData.tours || []).map((t, idx) =>
                          idx === 0 ? { ...t, pickupTime: time } : t
                        );
                        setFormData({
                          ...formData,
                          pickupTime: time,
                          tours: updatedTours.length > 0 ? updatedTours : formData.tours,
                        });
                      }}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold transition-all cursor-pointer ${
                        formData.pickupTime === time
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Çoklu Tur Programı (Paket) Desteği */}
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
                  const recTime = getRecommendedPickupTime(
                    formData.hotelZone || detectHotelZone(formData.hotel || '')
                  );

                  const nextTours = [
                    ...currentTours,
                    {
                      tourTitle: defaultTour,
                      tourDate: nextDate,
                      pickupTime: recTime,
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
                  className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-2.5 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-brand-primary text-white">
                      #{idx + 1} Tur Programı
                    </span>

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
                          setFormData({ ...formData, tours: updated });
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none font-semibold"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                        Alınış Saati
                      </label>
                      <input
                        type="text"
                        placeholder="07:30"
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
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                        Fiyat (Kişi Başı THB)
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

                  {/* Canlı Kontenjan & Overbooking Barı */}
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
                          className={`p-2.5 rounded-xl text-xs flex flex-wrap items-center justify-between gap-2 border ${
                            isOverbooking
                              ? 'bg-red-50 text-red-800 border-red-300 dark:bg-red-950/60 dark:text-red-200 dark:border-red-800 font-bold'
                              : occ.remainingSeats <= 5
                              ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-800'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-800'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span>⛵ Kontenjan Durumu:</span>
                            <strong>
                              {occ.bookedPax} / {occ.capacity} Koltuk Dolu (%{occ.occupancyPercent})
                            </strong>
                          </div>

                          {isOverbooking ? (
                            <span className="text-red-700 dark:text-red-300 font-bold">
                              ⚠️ OVERBOOKING RİSKİ! {curPax} kişi eklendiğinde kapasite{' '}
                              {Math.abs(remainingAfterThis)} kişi aşılacak!
                            </span>
                          ) : (
                            <span>
                              Bu Rezervasyon Sonrası Kalan: <strong>{remainingAfterThis} Boş Koltuk</strong>
                            </span>
                          )}
                        </div>
                      );
                    })()}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Yetişkin Sayısı
              </label>
              <input
                type="number"
                min="1"
                value={formData.adultCount || 1}
                onChange={(e) => {
                  const count = Number(e.target.value) || 1;
                  const curTours = formData.tours || [];
                  const calculatedTotal =
                    curTours.reduce((acc, t) => acc + (t.priceThb || 0), 0) * count;
                  setFormData({
                    ...formData,
                    adultCount: count,
                    totalPriceThb: calculatedTotal > 0 ? calculatedTotal : formData.totalPriceThb,
                  });
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Çocuk Sayısı
              </label>
              <input
                type="number"
                min="0"
                value={formData.childCount || 0}
                onChange={(e) => setFormData({ ...formData, childCount: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Toplam Satış Tutarı (THB)
              </label>
              <input
                type="number"
                value={formData.totalPriceThb || 0}
                onChange={(e) => setFormData({ ...formData, totalPriceThb: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Alınan Kapora (THB)
              </label>
              <input
                type="number"
                value={formData.paidAmountThb || 0}
                onChange={(e) => setFormData({ ...formData, paidAmountThb: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none text-emerald-600 font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Durum
              </label>
              <select
                value={formData.status || 'confirmed'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Booking['status'] })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none font-semibold"
              >
                <option value="inquiry">🟡 Teklif</option>
                <option value="confirmed">🟢 Onaylandı</option>
                <option value="completed">🔵 Tamamlandı</option>
                <option value="cancelled">🔴 İptal</option>
              </select>
            </div>
          </div>

          {/* Tahsilat & Kasa Planı */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5" />
                Kasa & Tahsilat Planı
              </span>
              <span className="text-xs font-extrabold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-md">
                Kalan Bakiye:{' '}
                {Math.max(
                  0,
                  Number(formData.totalPriceThb || 0) - Number(formData.paidAmountThb || 0)
                ).toLocaleString()}{' '}
                THB
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Kapora Ödeme Yöntemi
                </label>
                <select
                  value={formData.depositMethod || 'tr_bank_transfer'}
                  onChange={(e) => setFormData({ ...formData, depositMethod: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 text-xs focus:outline-none font-medium"
                >
                  <option value="tr_bank_transfer">🇹🇷 TR Banka Havale / EFT</option>
                  <option value="promptpay">📱 PromptPay (K-Bank QR)</option>
                  <option value="cash_thb">💵 Nakit THB (El Kasası)</option>
                  <option value="credit_card">💳 Kredi Kartı / Online</option>
                  <option value="kbank_transfer">🏦 Tayland Banka Havalesi</option>
                  <option value="cash_usd">💵 Nakit USD</option>
                  <option value="cash_eur">💶 Nakit EUR</option>
                  <option value="wise">🌐 Wise / Uluslararası</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Bakiye Tahsilat Noktası
                </label>
                <select
                  value={formData.collectionLocation || 'hotel_lobby'}
                  onChange={(e) => setFormData({ ...formData, collectionLocation: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 text-xs focus:outline-none font-medium"
                >
                  <option value="hotel_lobby">🏨 Otel Lobisi (Alış Anında)</option>
                  <option value="pier_marina">⚓ İskele / Marina Girişi</option>
                  <option value="office">🏢 Acenta Ofisi</option>
                  <option value="bank_online">💻 Önceden Havale / Online</option>
                  <option value="other">📍 Diğer Nokta</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Bakiyeyi Alacak Kişi
                </label>
                <input
                  type="text"
                  placeholder="Örn: Somchai (Şoför) veya Ofis"
                  value={formData.balanceCollector || ''}
                  onChange={(e) => setFormData({ ...formData, balanceCollector: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* B2B Partner / Acenta & Komisyon Paneli */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5" />
                B2B Partner & Alt Acenta Komisyonu
              </span>
              {formData.agentId && (Number(formData.agentCommissionThb) || 0) > 0 && (
                <span className="text-xs font-extrabold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                  Komisyon: {(Number(formData.agentCommissionThb) || 0).toLocaleString()} THB (
                  {formData.agentCommissionStatus === 'settled'
                    ? 'Ödendi / Kapatıldı'
                    : formData.agentCommissionStatus === 'cancelled'
                    ? 'İptal'
                    : 'Ödeme Bekliyor'}
                  )
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Yönlendiren Acenta / Partner
                </label>
                <select
                  value={formData.agentId || ''}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    if (!selectedId) {
                      setFormData({
                        ...formData,
                        agentId: undefined,
                        agentName: undefined,
                        agentCommissionThb: 0,
                        agentCommissionStatus: 'pending',
                      });
                      return;
                    }
                    const selectedAgent = agents.find((a) => a.id === selectedId);
                    if (selectedAgent) {
                      const comm = calculateAgentCommission(
                        selectedAgent,
                        Number(formData.totalPriceThb) || 0,
                        Number(formData.adultCount) || 1,
                        Number(formData.childCount) || 0
                      );
                      setFormData({
                        ...formData,
                        agentId: selectedAgent.id,
                        agentName: selectedAgent.name,
                        agentCommissionThb: comm,
                        agentCommissionStatus: formData.agentCommissionStatus || 'pending',
                      });
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-xs focus:outline-none font-medium"
                >
                  <option value="">Doğrudan Satış / Acenta Yok</option>
                  {agents.map((ag) => (
                    <option key={ag.id} value={ag.id}>
                      {ag.name} (
                      {ag.commissionType === 'percentage'
                        ? `%${ag.commissionRate}`
                        : `${ag.commissionRate} THB/Pax`}
                      )
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Hesaplanan Komisyon (THB)
                </label>
                <input
                  type="number"
                  value={formData.agentCommissionThb || 0}
                  onChange={(e) =>
                    setFormData({ ...formData, agentCommissionThb: Number(e.target.value) })
                  }
                  disabled={!formData.agentId}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-700 dark:text-indigo-300 focus:outline-none disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Komisyon Durumu
                </label>
                <select
                  value={formData.agentCommissionStatus || 'pending'}
                  onChange={(e) =>
                    setFormData({ ...formData, agentCommissionStatus: e.target.value as any })
                  }
                  disabled={!formData.agentId}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-xs focus:outline-none font-medium disabled:opacity-50"
                >
                  <option value="pending">⏳ Beklemede (Ödenecek)</option>
                  <option value="settled">✅ Ödendi / Mutabakat Yapıldı</option>
                  <option value="cancelled">❌ İptal Edildi</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cost & Supplier & Profit Row */}
          <div className="p-4 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" />
                Tedarikçi Maliyeti & Kârlılık Hesabı
              </span>
              {Number(formData.totalPriceThb || 0) > 0 && (
                <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                  Net Kâr:{' '}
                  {Math.max(
                    0,
                    Number(formData.totalPriceThb || 0) -
                      Number(formData.costThb || 0) -
                      (Number(formData.agentCommissionThb) || 0)
                  ).toLocaleString()}{' '}
                  THB
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400">
                    Tedarikçi Firma / Tekne Sahibi
                  </label>
                  {formData.supplier && (
                    <span className="text-[10px] text-brand-primary dark:text-brand-accent font-semibold">
                      Kayıtlı Tedarikçiler
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  list="registered-suppliers-list"
                  placeholder="Örn: Andaman Wave Master, Royal Phuket Marina vb."
                  value={formData.supplier || ''}
                  onChange={(e) => {
                    const sName = e.target.value;
                    const primaryTour = formData.tours?.[0]?.tourTitle || formData.tourTitle;
                    let newCost = formData.costThb;
                    if (primaryTour && sName) {
                      const costRule = lookupTourCost(tourCosts, primaryTour, sName);
                      if (costRule) {
                        const aCount = Number(formData.adultCount) || 1;
                        const cCount = Number(formData.childCount) || 0;
                        newCost = costRule.netCostAdultThb * aCount + costRule.netCostChildThb * cCount;
                      }
                    }
                    setFormData({ ...formData, supplier: sName, costThb: newCost });
                  }}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 text-xs focus:outline-none"
                />
                <datalist id="registered-suppliers-list">
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.name} />
                  ))}
                </datalist>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400">
                    Toplam Alış / Maliyet Gideri (THB)
                  </label>
                  {(() => {
                    const primaryTour = formData.tours?.[0]?.tourTitle || formData.tourTitle;
                    const match =
                      primaryTour && formData.supplier
                        ? lookupTourCost(tourCosts, primaryTour, formData.supplier)
                        : null;
                    if (!match) return null;
                    return (
                      <button
                        type="button"
                        onClick={() => {
                          const aCount = Number(formData.adultCount) || 1;
                          const cCount = Number(formData.childCount) || 0;
                          const calc =
                            match.netCostAdultThb * aCount + match.netCostChildThb * cCount;
                          setFormData({ ...formData, costThb: calc });
                          showToast(`Matris uygulandı: ${calc.toLocaleString()} THB`);
                        }}
                        className="text-[10px] text-rose-600 hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                      >
                        ⚡ Matristen Doldur ({match.netCostAdultThb} THB/Pax)
                      </button>
                    );
                  })()}
                </div>
                <input
                  type="number"
                  placeholder="Tekneye ödenecek toplam tutar"
                  value={formData.costThb || 0}
                  onChange={(e) => setFormData({ ...formData, costThb: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Tedarikçi Konfirmasyon No (Ref)
                </label>
                <input
                  type="text"
                  placeholder="Örn: AWM-8492"
                  value={formData.supplierRefCode || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, supplierRefCode: e.target.value.toUpperCase() })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 text-xs font-mono uppercase focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Tedarikçi Onay Durumu
                </label>
                <select
                  value={formData.supplierStatus || 'pending'}
                  onChange={(e) =>
                    setFormData({ ...formData, supplierStatus: e.target.value as any })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 text-xs font-semibold focus:outline-none"
                >
                  <option value="pending">⏳ Sipariş İletildi / Teyit Bekliyor</option>
                  <option value="confirmed">✅ Tedarikçi Onayladı</option>
                  <option value="cancelled">❌ Tekne Dolu / İptal</option>
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-rose-200/60 dark:border-rose-900/30">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.nationalParkFeeIncluded ?? false}
                  onChange={(e) =>
                    setFormData({ ...formData, nationalParkFeeIncluded: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-brand-accent focus:ring-brand-accent"
                />
                <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                  Millî Park Giriş Harcı Fiyata DAHİLDİR (İşaretlenmezse WhatsApp ve kuponda misafire
                  limanda nakit hazırlaması hatırlatılır)
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
              Özel Notlar
            </label>
            <textarea
              rows={2}
              value={formData.specialNotes || ''}
              onChange={(e) => setFormData({ ...formData, specialNotes: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-bold shadow-md hover:bg-brand-primary/90 transition-all cursor-pointer"
            >
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
