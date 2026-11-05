import React from 'react';
import {
  User,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  MessageCircle,
  Clock,
} from 'lucide-react';
import type { Booking, TourItem } from '../../../data/adminInitialData';
import { fmtMoney } from '../../../lib/moneyFormat';
import { generateGuestPickupReminderTurkish } from '../../../lib/whatsappEngine';

export interface QuickBookingFormProps {
  formData: Partial<Booking>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Booking>>>;
  tours: TourItem[];
  onSubmit: (e: React.SyntheticEvent) => void;
  onClose: () => void;
  editingBooking: Booking | null;
}

export function QuickBookingForm({
  formData,
  setFormData,
  tours,
  onSubmit,
  onClose,
  editingBooking,
}: QuickBookingFormProps) {
  const adultCount = Number(formData.adultCount) || 1;
  const childCount = Number(formData.childCount) || 0;
  const totalPrice = Number(formData.totalPriceThb) || 0;
  const paidAmount = Number(formData.paidAmountThb) || 0;
  const remaining = Math.max(0, totalPrice - paidAmount);

  // Tur seçildiğinde otomatik fiyat ve başlık eşleştirme
  const handleTourSelect = (tourId: string) => {
    const selectedTour = tours.find((t) => t.id === tourId);
    if (!selectedTour) return;

    // Fiyat tahmini: yetişkin * yetişkinFiyatı (varsa)
    const baseAdultPrice = 2800; // Standart ortalama tur bedeli
    const calculatedTotal = baseAdultPrice * adultCount;

    setFormData((prev) => ({
      ...prev,
      tourId: selectedTour.id,
      tourTitle: selectedTour.title,
      totalPriceThb: prev.totalPriceThb || calculatedTotal,
      pickupTime: prev.pickupTime || '07:30 - 07:45',
    }));
  };

  const handlePaxChange = (adults: number, children: number) => {
    const newAdults = Math.max(1, adults);
    const newChildren = Math.max(0, children);
    setFormData((prev) => ({
      ...prev,
      adultCount: newAdults,
      childCount: newChildren,
    }));
  };

  const handlePaymentQuickPreset = (type: 'paid' | 'partial' | 'unpaid') => {
    if (type === 'paid') {
      setFormData((prev) => ({
        ...prev,
        paidAmountThb: totalPrice,
        paymentStatus: 'paid',
      }));
    } else if (type === 'partial') {
      const half = Math.round(totalPrice / 2);
      setFormData((prev) => ({
        ...prev,
        paidAmountThb: half,
        paymentStatus: 'partial',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        paidAmountThb: 0,
        paymentStatus: 'unpaid',
      }));
    }
  };

  const handleSaveAndSend = (channel: 'whatsapp' | 'line') => {
    const fakeEvent = { preventDefault: () => {} } as unknown as React.SyntheticEvent;
    onSubmit(fakeEvent);

    const fakeBooking = {
      ...formData,
      id: formData.id || 'BK-NEW',
      customerName: formData.customerName || 'Misafir',
      phone: formData.phone || '',
      lineId: formData.lineId || '',
      hotel: formData.hotel || 'Belirtilmedi',
      roomNumber: formData.roomNumber || '',
      tourTitle: formData.tourTitle || 'Phuket Turu',
      tourDate: formData.tourDate || new Date().toISOString().split('T')[0],
      pickupTime: formData.pickupTime || '07:30',
      totalPriceThb: totalPrice,
      paidAmountThb: paidAmount,
      remainingAmountThb: remaining,
    } as Booking;

    const reminder = generateGuestPickupReminderTurkish(fakeBooking);
    if (channel === 'whatsapp' && fakeBooking.phone) {
      window.open(reminder.waUrl, '_blank', 'noopener,noreferrer');
    } else if (channel === 'line') {
      const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(reminder.message)}`;
      window.open(lineUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. Müşteri & Temsilci Bilgileri */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-2.5">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
            <User className="w-4 h-4 text-brand-primary" />
            1. Müşteri & Temsilci Bilgileri
          </span>
          <span className="text-[11px] text-slate-400">Temel İletişim</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Müşteri Adı Soyadı *
            </label>
            <input
              type="text"
              required
              placeholder="Örn: Ahmet Yılmaz"
              value={formData.customerName || ''}
              onChange={(e) => setFormData((p) => ({ ...p, customerName: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium focus:ring-2 focus:ring-brand-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-emerald-500" />
              WhatsApp Telefon Numarası *
            </label>
            <input
              type="text"
              required
              placeholder="Örn: +90 532 123 4567 veya 0532..."
              value={formData.phone || ''}
              onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <span className="font-extrabold text-[10px] bg-[#06C755] text-white px-1 py-0.2 rounded">LINE</span>
              Müşteri LINE ID (Opsiyonel)
            </label>
            <input
              type="text"
              placeholder="Örn: ahmet_phuket veya @ahmet"
              value={formData.lineId || ''}
              onChange={(e) => setFormData((p) => ({ ...p, lineId: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium focus:ring-2 focus:ring-[#06C755] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <span>💼</span>
              Satış Temsilcisi Adı
            </label>
            <input
              type="text"
              placeholder="Örn: Canan Demir"
              value={formData.salesRep || ''}
              onChange={(e) => setFormData((p) => ({ ...p, salesRep: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium focus:ring-2 focus:ring-brand-primary focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 2. Tur, Tarih & Kişi Sayısı */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-2.5">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
            <Calendar className="w-4 h-4 text-brand-primary" />
            2. Tur, Tarih & Kişi Bilgisi
          </span>
          <span className="text-[11px] text-slate-400">Program & Katılımcı</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Tur Seçimi *
            </label>
            <select
              required
              value={formData.tourId || ''}
              onChange={(e) => handleTourSelect(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium focus:ring-2 focus:ring-brand-primary focus:outline-none"
            >
              <option value="">-- Tur Seçiniz --</option>
              {tours.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
            {formData.tourTitle && !formData.tourId && (
              <input
                type="text"
                placeholder="Özel Tur Başlığı"
                value={formData.tourTitle}
                onChange={(e) => setFormData((p) => ({ ...p, tourTitle: e.target.value }))}
                className="mt-2 w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium"
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Tur Tarihi *
            </label>
            <input
              type="date"
              required
              value={formData.tourDate || ''}
              onChange={(e) => setFormData((p) => ({ ...p, tourDate: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium focus:ring-2 focus:ring-brand-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              Lobi Alınış Saati
            </label>
            <input
              type="text"
              placeholder="Örn: 07:30 - 07:45"
              value={formData.pickupTime || ''}
              onChange={(e) => setFormData((p) => ({ ...p, pickupTime: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Yetişkin Sayısı
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handlePaxChange(adultCount - 1, childCount)}
                className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-base hover:bg-slate-100 transition-colors"
              >
                -
              </button>
              <input
                type="number"
                min={1}
                value={adultCount}
                onChange={(e) => handlePaxChange(parseInt(e.target.value) || 1, childCount)}
                className="w-16 text-center py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-bold"
              />
              <button
                type="button"
                onClick={() => handlePaxChange(adultCount + 1, childCount)}
                className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-base hover:bg-slate-100 transition-colors"
              >
                +
              </button>
              <span className="text-xs text-slate-500 ml-1">Kişi</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Çocuk Sayısı (4-11 Yaş)
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handlePaxChange(adultCount, childCount - 1)}
                className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-base hover:bg-slate-100 transition-colors"
              >
                -
              </button>
              <input
                type="number"
                min={0}
                value={childCount}
                onChange={(e) => handlePaxChange(adultCount, parseInt(e.target.value) || 0)}
                className="w-16 text-center py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-bold"
              />
              <button
                type="button"
                onClick={() => handlePaxChange(adultCount, childCount + 1)}
                className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-base hover:bg-slate-100 transition-colors"
              >
                +
              </button>
              <span className="text-xs text-slate-500 ml-1">Çocuk</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Konaklama / Otel & Oda */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-2.5">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-brand-primary" />
            3. Alınış Oteli & Oda
          </span>
          <span className="text-[11px] text-slate-400">Transfer & Şoför</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Otel Adı *
            </label>
            <input
              type="text"
              required
              placeholder="Örn: Centara Grand Beach Resort Phuket"
              value={formData.hotel || ''}
              onChange={(e) => setFormData((p) => ({ ...p, hotel: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium focus:ring-2 focus:ring-brand-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Oda No
            </label>
            <input
              type="text"
              placeholder="Örn: 402"
              value={formData.roomNumber || ''}
              onChange={(e) => setFormData((p) => ({ ...p, roomNumber: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium focus:ring-2 focus:ring-brand-primary focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 4. Satış Tutarı & Tahsilat Durumu */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/20 space-y-4">
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-2.5">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
            <CreditCard className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            4. Satış Tutarı & Tahsilat
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handlePaymentQuickPreset('paid')}
              className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500 hover:text-white transition-all cursor-pointer"
            >
              Tamamı Ödendi
            </button>
            <button
              type="button"
              onClick={() => handlePaymentQuickPreset('partial')}
              className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 hover:bg-amber-500 hover:text-white transition-all cursor-pointer"
            >
              Yarı Kapora
            </button>
            <button
              type="button"
              onClick={() => handlePaymentQuickPreset('unpaid')}
              className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/20 text-rose-700 dark:text-rose-300 hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
            >
              Tur Günü Ödeme
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Toplam Satış Fiyatı (THB) *
            </label>
            <input
              type="number"
              min={0}
              required
              placeholder="Örn: 6000"
              value={formData.totalPriceThb ?? ''}
              onChange={(e) =>
                setFormData((p) => ({ ...p, totalPriceThb: parseFloat(e.target.value) || 0 }))
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-base font-extrabold font-mono focus:ring-2 focus:ring-brand-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Alınan Tutar / Kapora (THB)
            </label>
            <input
              type="number"
              min={0}
              placeholder="Örn: 2000"
              value={formData.paidAmountThb ?? ''}
              onChange={(e) =>
                setFormData((p) => ({ ...p, paidAmountThb: parseFloat(e.target.value) || 0 }))
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-base font-extrabold font-mono text-emerald-600 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Kalan Bakiye (Tur Günü)
            </label>
            <div className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-base font-extrabold font-mono text-amber-600">
              {fmtMoney(remaining)} ฿
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Özel Notlar (Alerji, Doğum Günü, Özel Talepler)
          </label>
          <textarea
            rows={2}
            placeholder="Örn: Balayı çifti, teknede meyve tabağı rica edildi. Vejetaryen öğle yemeği..."
            value={formData.specialNotes || ''}
            onChange={(e) => setFormData((p) => ({ ...p, specialNotes: e.target.value }))}
            className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>
      </div>

      {/* 5. Hızlı Kaydetme & Paylaşım Butonları */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={onClose}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
        >
          Vazgeç
        </button>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          <button
            type="button"
            onClick={() => handleSaveAndSend('whatsapp')}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            title="Rezervasyonu sisteme kaydet ve müşteriye WhatsApp bilet mesajını aç"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Kaydet & WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={() => handleSaveAndSend('line')}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            title="Rezervasyonu kaydet ve LINE üzerinden bilet detaylarını paylaş"
          >
            <span className="font-extrabold text-[10px] bg-white text-[#06C755] px-1 py-0.2 rounded">LINE</span>
            <span>Kaydet & LINE</span>
          </button>

          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            {editingBooking ? '💾 Güncelle' : '💾 Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
}