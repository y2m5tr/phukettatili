import React, { useState } from 'react';
import {
  Wallet,
  Building,
  Briefcase,
  Calendar,
  Clock,
  User,
  Phone,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Info,
} from 'lucide-react';
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

/**
 * 2'li saat aralığını (Örn: "08:30 - 09:00" veya "07:30") başlangıç ve bitiş olarak ayrıştırır.
 */
function parsePickupRange(val?: string): { start: string; end: string } {
  if (!val) return { start: '07:30', end: '07:45' };
  const clean = val.trim();
  if (clean.includes('-')) {
    const parts = clean.split('-').map((s) => s.trim());
    return {
      start: parts[0] || '07:30',
      end: parts[1] || '07:45',
    };
  }
  return {
    start: clean,
    end: addMinutesToTime(clean, 15),
  };
}

function addMinutesToTime(timeStr: string, mins: number): string {
  if (!timeStr || !timeStr.includes(':')) return '07:45';
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isNaN(h) || isNaN(m)) return '07:45';
  const total = (h * 60 + m + mins) % (24 * 60);
  const newH = Math.floor(total / 60).toString().padStart(2, '0');
  const newM = (total % 60).toString().padStart(2, '0');
  return `${newH}:${newM}`;
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
  const [activeTab, setActiveTab] = useState<'main' | 'finance' | 'supplier_b2b'>('main');

  if (!isOpen) return null;

  const currentRange = parsePickupRange(formData.pickupTime);

  const applyTimeRange = (start: string, end: string) => {
    const rangeStr = `${start.trim()} - ${end.trim()}`;
    const updatedTours = (formData.tours || []).map((t, idx) =>
      idx === 0 ? { ...t, pickupTime: rangeStr } : t
    );
    setFormData((prev) => ({
      ...prev,
      pickupTime: rangeStr,
      tours: updatedTours.length > 0 ? updatedTours : prev.tours,
    }));
  };

  const handleStartChange = (val: string) => {
    applyTimeRange(val, currentRange.end);
  };

  const handleEndChange = (val: string) => {
    applyTimeRange(currentRange.start, val);
  };

  const activeZone =
    formData.hotelZone || (formData.hotel ? detectHotelZone(formData.hotel) : 'Patong & Kalim');
  const recStart = getRecommendedPickupTime(activeZone);
  const recEnd = addMinutesToTime(recStart, 15);

  const remainingBalance = Math.max(
    0,
    Number(formData.totalPriceThb || 0) - Number(formData.paidAmountThb || 0)
  );

  const hasB2bOrSupplier =
    Boolean(formData.agentId) ||
    Boolean(formData.supplier) ||
    Boolean(formData.supplierRefCode);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-surface-2 w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Üst Başlık & Sekmeler */}
        <div className="p-5 sm:p-6 pb-0 border-b border-slate-100 dark:border-slate-800 shrink-0 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white flex items-center gap-2">
                <span>{editingBooking ? '✏️ Rezervasyonu Düzenle' : '✨ Yeni Rezervasyon Ekle'}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Misafir, otel ve 2'li lobi alınış saati aralığını kolayca yönetin.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Ergonomik Sekme Çubuğu */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab('main')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === 'main'
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <span>📋 1. Rezervasyon & Otel</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('finance')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === 'finance'
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <span>💰 2. Kasa & Tahsilat</span>
              {remainingBalance > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-600 dark:text-amber-400 font-mono">
                  {remainingBalance.toLocaleString()} ฿
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('supplier_b2b')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === 'supplier_b2b'
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <span>🤝 3. Acenta & Tedarikçi</span>
              {hasB2bOrSupplier && (
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              )}
            </button>
          </div>
        </div>

        {/* Form Alanı (Kaydırılabilir İçerik) */}
        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* ========================================================================= */}
          {/* SEKME 1: REZERVASYON & OTEL (ANA EKRAN) */}
          {/* ========================================================================= */}
          {activeTab === 'main' && (
            <div className="space-y-4">
              {/* Müşteri Adı ve Telefon */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    👤 Müşteri Adı & Soyadı *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Mehmet Can / Can Ailesi"
                    value={formData.customerName || ''}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/40 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    📞 Telefon / WhatsApp No *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: +90 532 123 45 67"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/40 font-medium"
                  />
                </div>
              </div>

              {/* Konaklama & 2'li Alış Saati Kartı */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                  {/* Otel Adı */}
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

                {/* Bölge ve 2'li Alış Saati Aralığı */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 pt-0.5">
                  {/* Bölge Seçimi */}
                  <div className="sm:col-span-5">
                    <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                      📍 Bölge / Hat *
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

                  {/* ⏰ 2'Lİ ALIŞ SAATİ ARALIĞI (08:30 - 09:00 GİBİ) */}
                  <div className="sm:col-span-7 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <span>⏰</span> Alınış Saati Aralığı *
                      </label>
                      <button
                        type="button"
                        onClick={() => applyTimeRange(recStart, recEnd)}
                        className="text-[10px] text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer"
                        title="Bölge için önerilen standart aralığı doldur"
                      >
                        ⚡ Önerilen: {recStart} - {recEnd}
                      </button>
                    </div>

                    {/* 2'li Saat Kutuları */}
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

                    {/* Hızlı 2'li Aralık Butonları */}
                    <div className="flex items-center gap-1 flex-wrap pt-0.5">
                      <span className="text-[10px] text-slate-400 font-semibold">Hızlı:</span>
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
                          (formData.pickupTime || '').replace(/\s+/g, '') === range.replace(/\s+/g, '');
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
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-slate-700'
                            }`}
                          >
                            {range}
                          </button>
                        );
                      })}
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

              {/* Yolcu Sayıları, Satış Tutarı, Kapora ve Durum */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-semibold focus:outline-none"
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-semibold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Toplam Satış (THB)
                  </label>
                  <input
                    type="number"
                    value={formData.totalPriceThb || 0}
                    onChange={(e) =>
                      setFormData({ ...formData, totalPriceThb: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none font-bold text-brand-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Alınan Kapora (THB)
                  </label>
                  <input
                    type="number"
                    value={formData.paidAmountThb || 0}
                    onChange={(e) =>
                      setFormData({ ...formData, paidAmountThb: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none text-emerald-600 font-bold"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Durum
                  </label>
                  <select
                    value={formData.status || 'confirmed'}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as Booking['status'] })
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none font-bold"
                  >
                    <option value="inquiry">🟡 Teklif</option>
                    <option value="confirmed">🟢 Onaylandı</option>
                    <option value="completed">🔵 Tamamlandı</option>
                    <option value="cancelled">🔴 İptal</option>
                  </select>
                </div>
              </div>

              {/* Özel Notlar */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  📝 Özel Notlar / İstekler
                </label>
                <textarea
                  rows={2}
                  placeholder="Vejetaryen yemek tercihi, balayı kutlaması, bebek arabası vb."
                  value={formData.specialNotes || ''}
                  onChange={(e) => setFormData({ ...formData, specialNotes: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SEKME 2: KASA & TAHSİLAT PLANI */}
          {/* ========================================================================= */}
          {activeTab === 'finance' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 font-semibold uppercase">Tahsilat Durumu</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    Toplam: {(Number(formData.totalPriceThb) || 0).toLocaleString()} THB · Kapora:{' '}
                    {(Number(formData.paidAmountThb) || 0).toLocaleString()} THB
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-amber-600 uppercase">Kalan Tahsilat:</span>
                  <div className="text-lg font-black font-mono text-amber-600 dark:text-amber-400">
                    {remainingBalance.toLocaleString()} THB
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Kapora Ödeme Yöntemi
                  </label>
                  <select
                    value={formData.depositMethod || 'tr_bank_transfer'}
                    onChange={(e) => setFormData({ ...formData, depositMethod: e.target.value as any })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none font-medium"
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
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Bakiye Tahsilat Noktası
                  </label>
                  <select
                    value={formData.collectionLocation || 'hotel_lobby'}
                    onChange={(e) =>
                      setFormData({ ...formData, collectionLocation: e.target.value as any })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none font-medium"
                  >
                    <option value="hotel_lobby">🏨 Otel Lobisi (Alış Anında)</option>
                    <option value="pier_marina">⚓ İskele / Marina Girişi</option>
                    <option value="office">🏢 Acenta Ofisi</option>
                    <option value="bank_online">💻 Önceden Havale / Online</option>
                    <option value="other">📍 Diğer Nokta</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Bakiyeyi Alacak Görevli / Şoför
                </label>
                <input
                  type="text"
                  placeholder="Örn: Somchai (Şoför) veya Ofis Kasası"
                  value={formData.balanceCollector || ''}
                  onChange={(e) => setFormData({ ...formData, balanceCollector: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SEKME 3: ACENTA & TEDARİKÇİ YÖNETİMİ */}
          {/* ========================================================================= */}
          {activeTab === 'supplier_b2b' && (
            <div className="space-y-4">
              {/* B2B Partner / Acenta */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5" />
                    B2B Partner & Alt Acenta Komisyonu
                  </span>
                  {formData.agentId && (Number(formData.agentCommissionThb) || 0) > 0 && (
                    <span className="text-xs font-extrabold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                      Komisyon: {(Number(formData.agentCommissionThb) || 0).toLocaleString()} THB
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Yönlendiren Acenta
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
                          {ag.name} ({ag.commissionType === 'percentage' ? `%${ag.commissionRate}` : `${ag.commissionRate} THB/Pax`})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Komisyon Tutarı (THB)
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
                      <option value="pending">⏳ Beklemede</option>
                      <option value="settled">✅ Ödendi / Kapatıldı</option>
                      <option value="cancelled">❌ İptal Edildi</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Tedarikçi & Maliyet */}
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
                    <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Tedarikçi Firma / Tekne Sahibi
                    </label>
                    <input
                      type="text"
                      list="registered-suppliers-list"
                      placeholder="Örn: Andaman Wave Master, Seastar vb."
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
                        Maliyet Gideri (THB)
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
                            className="text-[10px] text-rose-600 hover:underline font-bold cursor-pointer"
                          >
                            ⚡ Matristen Doldur
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
                      Millî Park Giriş Harcı Fiyata DAHİLDİR
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SABİT ALT BUTONLAR & CANLI ÖZET BİLGİSİ */}
          {/* ========================================================================= */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span>Toplam: <strong className="text-slate-900 dark:text-white font-mono">{(Number(formData.totalPriceThb) || 0).toLocaleString()} ฿</strong></span>
              <span>·</span>
              <span>Kapora: <strong className="text-emerald-600 font-mono">{(Number(formData.paidAmountThb) || 0).toLocaleString()} ฿</strong></span>
              <span>·</span>
              <span>Kalan: <strong className="text-amber-600 font-mono">{remainingBalance.toLocaleString()} ฿</strong></span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
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
                {editingBooking ? 'Değişiklikleri Kaydet' : 'Rezervasyonu Kaydet'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
