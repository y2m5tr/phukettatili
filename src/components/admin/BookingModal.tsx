import React, { useState } from 'react';
import {
  Building,
  Briefcase,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Users,
  Hotel,
  Luggage,
  Send,
  MessageCircle,
  AlertTriangle,
  Copy,
  Check,
  Compass,
  Sparkles,
} from 'lucide-react';
import { parseWhatsAppBookingText } from '../../lib/whatsappParser';
import {
  type Booking,
  type PassengerItem,
  type BookingHotelStay,
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
import { getSmartPickupRecommendation } from '../../lib/smartPickupIntelligence';
import {
  generateDriverPickupJobThai,
  generateGuestPickupReminderTurkish,
} from '../../lib/whatsappEngine';

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
  const [selectedTourIndex, setSelectedTourIndex] = useState<number>(0);
  const [isQuickPasteOpen, setIsQuickPasteOpen] = useState<boolean>(false);
  const [quickPasteText, setQuickPasteText] = useState<string>('');

  if (!isOpen) return null;

  const toursList =
    formData.tours && formData.tours.length > 0
      ? formData.tours
      : [
          {
            tourTitle: formData.tourTitle || tours[0]?.title || 'Phuket Turu',
            tourDate: formData.tourDate || new Date().toISOString().split('T')[0],
            pickupTime: formData.pickupTime || '07:30 - 07:45',
            priceThb: formData.totalPriceThb || 2200,
          },
        ];

  const activeTourIndex = Math.min(
    selectedTourIndex,
    Math.max(0, toursList.length - 1)
  );
  const activeTour = toursList[activeTourIndex] || toursList[0];
  const activeTourDate =
    activeTour?.tourDate || formData.tourDate || new Date().toISOString().split('T')[0];
  const activeTourPickup =
    activeTour?.pickupTime || (activeTourIndex === 0 ? formData.pickupTime : '') || '07:30 - 07:45';

  const currentRange = parsePickupRange(activeTourPickup);

  const applyTimeRange = (start: string, end: string) => {
    const rangeStr = `${start.trim()} - ${end.trim()}`;
    const curTours =
      formData.tours && formData.tours.length > 0
        ? [...formData.tours]
        : [
            {
              tourTitle: formData.tourTitle || tours[0]?.title || 'Phuket Turu',
              tourDate: formData.tourDate || new Date().toISOString().split('T')[0],
              pickupTime: rangeStr,
              priceThb: formData.totalPriceThb || 2200,
            },
          ];

    const updatedTours = curTours.map((t, idx) =>
      idx === activeTourIndex ? { ...t, pickupTime: rangeStr } : t
    );

    setFormData((prev) => ({
      ...prev,
      pickupTime: activeTourIndex === 0 ? rangeStr : prev.pickupTime,
      tours: updatedTours,
    }));
  };

  const handlePickupDateChange = (newDate: string) => {
    const curTours =
      formData.tours && formData.tours.length > 0
        ? [...formData.tours]
        : [
            {
              tourTitle: formData.tourTitle || tours[0]?.title || 'Phuket Turu',
              tourDate: newDate,
              pickupTime: formData.pickupTime || '07:30 - 07:45',
              priceThb: formData.totalPriceThb || 2200,
            },
          ];

    const updatedTours = curTours.map((t, idx) =>
      idx === activeTourIndex ? { ...t, tourDate: newDate } : t
    );

    setFormData((prev) => ({
      ...prev,
      tourDate: activeTourIndex === 0 ? newDate : prev.tourDate,
      tours: updatedTours,
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

  const activeTourTitle = activeTour?.tourTitle || formData.tourTitle || '';
  const smartPickup = getSmartPickupRecommendation(
    activeZone,
    activeTourTitle,
    activeTourPickup
  );

  const [copiedType, setCopiedType] = useState<string | null>(null);

  const handleCopyDriverCard = (openWhatsApp: boolean = false) => {
    const job = generateDriverPickupJobThai(formData as Booking, activeTourIndex);
    navigator.clipboard.writeText(job.message);
    setCopiedType('driver');
    if (showToast) showToast('🇹🇭 Şoför görev kartı (Tayca/İngilizce) panoya kopyalandı!');
    setTimeout(() => setCopiedType(null), 2500);
    if (openWhatsApp) {
      window.open(job.waUrl, '_blank');
    }
  };

  const handleCopyGuestReminder = (openWhatsApp: boolean = false) => {
    const reminder = generateGuestPickupReminderTurkish(formData as Booking, activeTourIndex);
    navigator.clipboard.writeText(reminder.message);
    setCopiedType('guest');
    if (showToast) showToast('🇹🇷 Misafir lobi alınış hatırlatması panoya kopyalandı!');
    setTimeout(() => setCopiedType(null), 2500);
    if (openWhatsApp) {
      window.open(reminder.waUrl, '_blank');
    }
  };

  const remainingBalance = Math.max(
    0,
    Number(formData.totalPriceThb || 0) - Number(formData.paidAmountThb || 0)
  );

  const hasB2bOrSupplier =
    Boolean(formData.agentId) ||
    Boolean(formData.supplier) ||
    Boolean(formData.supplierRefCode);

  // 👥 Birlikte Gelen Diğer Müşteriler / Aile Bireyleri Yönetimi
  const passengers = formData.passengers || [];

  const handleAddPassenger = () => {
    const newPax: PassengerItem = {
      id: `pax-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      fullName: '',
      passportNo: '',
      passportNumber: '',
      isChild: false,
    };
    const nextPassengers = [...passengers, newPax];
    setFormData((prev) => ({
      ...prev,
      passengers: nextPassengers,
    }));
  };

  const handleUpdatePassenger = (
    index: number,
    field: keyof PassengerItem,
    value: any
  ) => {
    const nextPassengers = [...passengers];
    nextPassengers[index] = { ...nextPassengers[index], [field]: value };
    if (field === 'passportNo') {
      nextPassengers[index].passportNumber = value;
    }
    setFormData((prev) => ({
      ...prev,
      passengers: nextPassengers,
    }));
  };

  const handleRemovePassenger = (index: number) => {
    const nextPassengers = passengers.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      passengers: nextPassengers,
    }));
  };

  const handleAutoSyncPaxCount = () => {
    // 1 ana müşteri (yetişkin) + ek yolcular
    const childCount = passengers.filter((p) => p.isChild).length;
    const adultCount = Math.max(1, 1 + passengers.filter((p) => !p.isChild).length);
    const curTours = formData.tours || [];
    const calculatedTotal =
      curTours.reduce((acc, t) => acc + (t.priceThb || 0), 0) * adultCount +
      Math.round(curTours.reduce((acc, t) => acc + (t.priceThb || 0), 0) * 0.7 * childCount);
    setFormData((prev) => ({
      ...prev,
      adultCount,
      childCount,
      totalPriceThb: calculatedTotal > 0 ? calculatedTotal : prev.totalPriceThb,
    }));
    if (showToast) {
      showToast(`⚡ Pax sayısı eşitlendi: ${adultCount} Yetişkin, ${childCount} Çocuk`);
    }
  };

  // 🏨 Birden Fazla Konaklama Oteli Yönetimi
  const bookingHotels: BookingHotelStay[] = formData.hotels || [];

  const handleAddBookingHotel = () => {
    const newId = `hotel-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newHotel: BookingHotelStay = {
      id: newId,
      hotelName: '',
      hotelZone: 'Patong & Kalim',
      roomNumber: '',
      checkInDate: '',
      checkOutDate: '',
      notes: '',
    };
    setFormData((prev) => ({
      ...prev,
      hotels: [...(prev.hotels || []), newHotel],
    }));
  };

  const handleUpdateBookingHotel = (
    index: number,
    field: keyof BookingHotelStay,
    value: any
  ) => {
    const nextHotels = [...bookingHotels];
    nextHotels[index] = { ...nextHotels[index], [field]: value };
    if (field === 'hotelName') {
      const detected = detectHotelZone(value);
      if (detected) {
        nextHotels[index].hotelZone = detected;
      }
    }
    setFormData((prev) => ({
      ...prev,
      hotels: nextHotels,
    }));
  };

  const handleRemoveBookingHotel = (index: number) => {
    const nextHotels = bookingHotels.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      hotels: nextHotels,
    }));
  };

  const handleApplyWhatsAppPaste = () => {
    if (!quickPasteText.trim()) return;
    const parsed = parseWhatsAppBookingText(quickPasteText, tours);

    setFormData((prev) => {
      const updated = { ...prev };
      if (parsed.customerName) updated.customerName = parsed.customerName;
      if (parsed.phone) updated.phone = parsed.phone;
      if (parsed.adultCount !== undefined) updated.adultCount = parsed.adultCount;
      if (parsed.childCount !== undefined) updated.childCount = parsed.childCount;
      if (parsed.hotel) {
        updated.hotel = parsed.hotel;
        const detectedZone = detectHotelZone(parsed.hotel);
        if (detectedZone) updated.hotelZone = detectedZone;
      }
      if (parsed.roomNumber) updated.roomNumber = parsed.roomNumber;
      if (parsed.priceThb !== undefined) updated.totalPriceThb = parsed.priceThb;
      if (parsed.tourTitle) updated.tourTitle = parsed.tourTitle;
      if (parsed.tourDate) updated.tourDate = parsed.tourDate;

      // sync tours array
      const curTours =
        updated.tours && updated.tours.length > 0
          ? [...updated.tours]
          : [
              {
                tourTitle: parsed.tourTitle || updated.tourTitle || tours[0]?.title || 'Phuket Turu',
                tourDate: parsed.tourDate || updated.tourDate || new Date().toISOString().split('T')[0],
                pickupTime: updated.pickupTime || '07:30 - 07:45',
                priceThb: parsed.priceThb !== undefined ? parsed.priceThb : updated.totalPriceThb || 2200,
              },
            ];

      curTours[0] = {
        ...curTours[0],
        tourTitle: parsed.tourTitle || curTours[0].tourTitle,
        tourDate: parsed.tourDate || curTours[0].tourDate,
        priceThb: parsed.priceThb !== undefined ? parsed.priceThb : curTours[0].priceThb,
        hotel: parsed.hotel || curTours[0].hotel,
        roomNumber: parsed.roomNumber || curTours[0].roomNumber,
      };

      updated.tours = curTours;

      // lead passenger sync
      if (parsed.customerName) {
        const curPax = updated.passengers ? [...updated.passengers] : [];
        if (curPax.length > 0) {
          curPax[0] = { ...curPax[0], fullName: parsed.customerName };
          updated.passengers = curPax;
        }
      }

      return updated;
    });

    const filled: string[] = [];
    if (parsed.customerName) filled.push('İsim');
    if (parsed.phone) filled.push('Telefon');
    if (parsed.adultCount !== undefined) filled.push(`${parsed.adultCount} Yetişkin`);
    if (parsed.childCount !== undefined) filled.push(`${parsed.childCount} Çocuk`);
    if (parsed.tourDate) filled.push('Tarih');
    if (parsed.hotel) filled.push('Otel');
    if (parsed.roomNumber) filled.push('Oda');
    if (parsed.tourTitle) filled.push('Tur');
    if (parsed.priceThb !== undefined) filled.push(`${parsed.priceThb} ฿`);

    if (filled.length > 0) {
      showToast(`✅ WhatsApp mesajından aktarıldı: ${filled.join(', ')}`);
    } else {
      showToast('⚠️ Metinde belirgin rezervasyon detayı algılanamadı.');
    }

    setQuickPasteText('');
    setIsQuickPasteOpen(false);
  };

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
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsQuickPasteOpen(!isQuickPasteOpen)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                  isQuickPasteOpen
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
                }`}
                title="Müşterinin WhatsApp mesajını yapıştırarak formu anında doldurun"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">WhatsApp'tan</span>
                <span>Hızlı Doldur</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>

          {isQuickPasteOpen && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/30 space-y-2.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                  <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Akıllı WhatsApp Rezervasyon Ayrıştırıcı</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsQuickPasteOpen(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  ✕ Kapat
                </button>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Müşterinin WhatsApp konuşmasını buraya yapıştırın. Sistem; misafir adını, kişi sayısını, tarihi, oteli, oda numarasını, telefonunu ve turu otomatik tespit edip formu doldurur.
              </p>
              <textarea
                value={quickPasteText}
                onChange={(e) => setQuickPasteText(e.target.value)}
                rows={3}
                placeholder="Örn: Merhaba, biz 2 yetişkin 1 çocuk, 24 Ekim Phi Phi turu istiyoruz. Otelimiz Centara Grand, oda no: 304. Tel: 0532 123 4567, fiyat 7200 Baht..."
                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-500/30 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  💡 Türkçe veya serbest mesaj kalıplarını destekler.
                </span>
                <button
                  type="button"
                  onClick={handleApplyWhatsAppPaste}
                  disabled={!quickPasteText.trim()}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Metni Çöz & Formu Doldur</span>
                </button>
              </div>
            </div>
          )}

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
              {/* Müşteri Adı, Pasaport No (Opsiyonel) ve Telefon */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                <div className="sm:col-span-5">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                      👤 Müşteri Adı & Soyadı *
                    </label>
                    <button
                      type="button"
                      onClick={handleAddPassenger}
                      className="text-[11px] text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      title="Ailesi veya arkadaş grubuyla gelen diğer kişileri ekleyin"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Başka Müşteri Ekle</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Mehmet Can"
                    value={formData.customerName || ''}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/40 font-medium"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    🛂 Pasaport No (Opsiyonel)
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: U12345678"
                    value={
                      formData.passengers && formData.passengers.length > 0 && formData.passengers[0]?.passportNo
                        ? formData.passengers[0].passportNo
                        : ''
                    }
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      const currentPax = formData.passengers || [];
                      if (currentPax.length === 0) {
                        setFormData({
                          ...formData,
                          passengers: [
                            {
                              id: 'lead-pax',
                              fullName: formData.customerName || '',
                              passportNo: val,
                              passportNumber: val,
                              isChild: false,
                            },
                          ],
                        });
                      } else {
                        const updated = [...currentPax];
                        updated[0] = {
                          ...updated[0],
                          passportNo: val,
                          passportNumber: val,
                        };
                        setFormData({ ...formData, passengers: updated });
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono uppercase text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-accent/40"
                  />
                </div>

                <div className="sm:col-span-4">
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

              {/* 👥 BİRLİKTE GELEN DİĞER MÜŞTERİLER / AİLE & ARKADAŞ GRUBU */}
              {passengers.length > 0 && (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/5 border border-amber-500/20 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-amber-500" />
                        <span>Birlikte Gelen Diğer Müşteriler / Aile Bireyleri ({passengers.length} Kişi)</span>
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold">
                        {passengers.filter((p) => p.isChild).length} Çocuk ·{' '}
                        {passengers.filter((p) => !p.isChild).length} Yetişkin
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAutoSyncPaxCount}
                        className="text-[11px] text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        title="Eklenen kişileri otomatik olarak yetişkin ve çocuk sayılarına aktarır"
                      >
                        <span>⚡ Pax Sayısını Eşitle</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleAddPassenger}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Kişi Ekle</span>
                      </button>
                    </div>
                  </div>

                  {/* Her Bir Ek Yolcu Satırı */}
                  <div className="space-y-2">
                    {passengers.map((pax, idx) => (
                      <div
                        key={pax.id || idx}
                        className="p-2.5 sm:p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
                      >
                        <span className="text-xs font-bold text-slate-400 w-5 text-center shrink-0">
                          #{idx + 1}
                        </span>

                        {/* Yolcu Adı Soyadı */}
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            placeholder={`Yolcu #${idx + 1} Adı Soyadı (Örn: Ayşe Can)`}
                            value={pax.fullName || ''}
                            onChange={(e) => handleUpdatePassenger(idx, 'fullName', e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </div>

                        {/* Pasaport No (Opsiyonel) */}
                        <div className="w-full sm:w-44 shrink-0">
                          <input
                            type="text"
                            placeholder="Pasaport No (Opsiyonel)"
                            value={pax.passportNo || pax.passportNumber || ''}
                            onChange={(e) => handleUpdatePassenger(idx, 'passportNo', e.target.value.toUpperCase())}
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono uppercase text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </div>

                        {/* Çocuk mu? Tik Kutusu */}
                        <label
                          className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 cursor-pointer select-none transition-colors shrink-0 ${
                            pax.isChild
                              ? 'bg-pink-500/15 border-pink-500/30 text-pink-600 dark:text-pink-400'
                              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={Boolean(pax.isChild)}
                            onChange={(e) => handleUpdatePassenger(idx, 'isChild', e.target.checked)}
                            className="rounded border-slate-300 text-pink-600 focus:ring-pink-500 w-3.5 h-3.5 cursor-pointer"
                          />
                          <span>{pax.isChild ? '👶 Çocuk' : '👤 Yetişkin'}</span>
                        </label>

                        {/* Satırı Sil */}
                        <button
                          type="button"
                          onClick={() => handleRemovePassenger(idx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors shrink-0 cursor-pointer self-end sm:self-center"
                          title="Bu yolcuyu kaldır"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* 1. ÇOKLU TUR PROGRAMI & TARİHLERİ (PAKET) DESTEĞİ */}
              {/* ========================================================= */}
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

              {/* ========================================================= */}
              {/* 2. KONAKLAMA OTELİ & ⏰ LOBİ ALINIŞ TARİHİ VE SAAT ARALIĞI */}
              {/* (Tur Programının Altında Konumlandırılmıştır) */}
              {/* ========================================================= */}
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
                    <button
                      type="button"
                      onClick={() => applyTimeRange(recStart, recEnd)}
                      className="text-[11px] text-amber-700 dark:text-amber-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                      title="Bölge için önerilen standart aralığı doldur"
                    >
                      <span>⚡ Standart ({activeZone}): {recStart} - {recEnd}</span>
                    </button>
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

                {/* 🧳 Otel Değişimi & Valiz/Bagaj Takibi */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
                  <div className="p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/25 border border-purple-200 dark:border-purple-800/60 space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <label className="text-xs font-bold text-purple-950 dark:text-purple-200 flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={Boolean(formData.isHotelHop || formData.hasLuggage || bookingHotels.length > 0)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setFormData((prev) => ({
                              ...prev,
                              isHotelHop: checked,
                              hasLuggage: checked,
                              luggageCount: checked ? (prev.luggageCount || prev.adultCount || 2) : 0,
                            }));
                          }}
                          className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span className="flex items-center gap-1.5">
                          <Luggage className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <span>🧳 Otel Değişimi & Tur Aracında Valiz/Bagaj Taşıma (Hotel Hop)</span>
                        </span>
                      </label>

                      {(formData.isHotelHop || formData.hasLuggage || bookingHotels.length > 0) && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-600 text-white shadow-2xs self-start sm:self-auto">
                          Minibüste Valiz Alanı Ayrılacak
                        </span>
                      )}
                    </div>

                    {(formData.isHotelHop || formData.hasLuggage || bookingHotels.length > 0) && (
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-1 text-xs">
                        <div className="sm:col-span-4">
                          <label className="block text-[10px] font-bold uppercase text-purple-800 dark:text-purple-300 mb-1">
                            Valiz / Çanta Adedi
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={formData.luggageCount || formData.adultCount || 2}
                            onChange={(e) => setFormData({ ...formData, luggageCount: Number(e.target.value) || 1 })}
                            className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-700 text-xs font-bold text-purple-950 dark:text-purple-200"
                          />
                        </div>
                        <div className="sm:col-span-8">
                          <label className="block text-[10px] font-bold uppercase text-purple-800 dark:text-purple-300 mb-1">
                            Bagaj / Otel Geçiş Notu (Şoför Manifestosu)
                          </label>
                          <input
                            type="text"
                            placeholder="Örn: Patong otelden check-out yapılacak, tur sonrası Kata otele geçilecek"
                            value={formData.luggageNotes || ''}
                            onChange={(e) => setFormData({ ...formData, luggageNotes: e.target.value })}
                            className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-700 text-xs text-purple-950 dark:text-purple-200"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 📲 Hızlı Operasyonel WhatsApp Kartları (Şoföre Tayca, Misafire Türkçe) */}
                <div className="pt-2.5 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <MessageCircle className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-bold">Saha WhatsApp Görev & Hatırlatma Kartları:</span>
                  </div>

                  <div className="flex items-center flex-wrap gap-2">
                    {/* 🇹🇭 ŞOFÖR KARTI */}
                    <div className="inline-flex rounded-xl shadow-2xs overflow-hidden border border-slate-200 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() => handleCopyDriverCard(false)}
                        className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                        title="Şoför için Tayca & İngilizce çift dilli iş kartını panoya kopyala"
                      >
                        {copiedType === 'driver' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                        <span>🇹🇭 Şoför Kartı {copiedType === 'driver' ? '(Kopyalandı)' : ''}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyDriverCard(true)}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                        title="Şoför kartını doğrudan WhatsApp'ta aç"
                      >
                        <Send className="w-3 h-3" />
                        <span>WA Gönder</span>
                      </button>
                    </div>

                    {/* 🇹🇷 MİSAFİR HATIRLATMASI */}
                    <div className="inline-flex rounded-xl shadow-2xs overflow-hidden border border-slate-200 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() => handleCopyGuestReminder(false)}
                        className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                        title="Misafir için Türkçe lobi alınış hatırlatmasını panoya kopyala"
                      >
                        {copiedType === 'guest' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                        <span>🇹🇷 Misafir Hatırlatması {copiedType === 'guest' ? '(Kopyalandı)' : ''}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyGuestReminder(true)}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                        title="Misafir hatırlatmasını doğrudan WhatsApp'ta aç"
                      >
                        <Send className="w-3 h-3" />
                        <span>WA Gönder</span>
                      </button>
                    </div>
                  </div>
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
