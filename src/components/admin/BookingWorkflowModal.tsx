import { useState } from 'react';
import {
  X,
  CheckCircle2,
  MessageCircle,
  CreditCard,
  Send,
  Loader2,
} from 'lucide-react';
import type { Booking } from '../../data/adminInitialData';
import { generateGuestPickupReminderTurkish } from '../../lib/whatsappEngine';
import { fmtMoney } from '../../lib/moneyFormat';

interface BookingWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onUpdateBooking?: (updated: Booking, successMsg?: string) => void;
  vehicles?: Array<{ id: string; label: string }>;
  drivers?: Array<{ id: string; fullName: string }>;
  showToast?: (msg: string) => void;
}

export default function BookingWorkflowModal({
  isOpen,
  onClose,
  booking,
  onUpdateBooking,
  vehicles = [],
  drivers = [],
  showToast,
}: BookingWorkflowModalProps) {
  if (!isOpen || !booking) return null;

  const [selectedVehicle, setSelectedVehicle] = useState(booking.assignedVehicle || '');
  const [selectedDriver, setSelectedDriver] = useState(booking.assignedDriver || '');
  const [isSendingCloudWa, setIsSendingCloudWa] = useState(false);

  // Step 1: Confirmed
  const isConfirmed = booking.status === 'confirmed' || booking.status === 'completed';
  // Step 2: Fleet Assigned
  const isFleetAssigned = Boolean(booking.assignedVehicle || booking.assignedDriver);
  // Step 3: Guest Notified
  const isNotified = Boolean(booking.whatsAppReminderSent || booking.lastWhatsAppNotifiedAt);
  // Step 4: Picked Up
  const isPickedUp = booking.pickupStatus === 'picked_up' || booking.pickupStatus === 'completed' || booking.pickupStatus === 'on_tour';
  // Step 5: Payment Settled
  const isPaid = booking.paymentStatus === 'paid' || (Number(booking.remainingAmountThb) || 0) <= 0;

  const handleSetStatus = (newStatus: 'confirmed' | 'completed' | 'cancelled') => {
    if (!onUpdateBooking) return;
    const updated = { ...booking, status: newStatus };
    onUpdateBooking(updated, `Rezervasyon durumu güncellendi: ${newStatus}`);
  };

  const handleSaveFleet = () => {
    if (!onUpdateBooking) return;
    const updated = {
      ...booking,
      assignedVehicle: selectedVehicle || undefined,
      assignedDriver: selectedDriver || undefined,
    };
    onUpdateBooking(updated, 'Araç ve şoför ataması kaydedildi! 🚐');
    if (showToast) showToast('Araç/şoför güncellendi.');
  };

  const handleMarkNotified = () => {
    if (!onUpdateBooking) return;
    const updated = {
      ...booking,
      whatsAppReminderSent: true,
      lastWhatsAppNotifiedAt: new Date().toISOString(),
    };
    onUpdateBooking(updated, 'Misafir bilgilendirildi olarak işaretlendi! 📱');
  };

  const handleSendViaCloudApi = async () => {
    setIsSendingCloudWa(true);
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 't24_reminder',
          bookingId: booking.id,
          booking,
        }),
      });
      const data = await res.json();
      if (res.ok && data?.ok) {
        handleMarkNotified();
        showToast?.('✅ WhatsApp hatırlatması Cloud API ile otomatik gönderildi!');
      } else {
        showToast?.(`⚠️ ${data?.error || 'Gönderilemedi, manuel butonu deneyiniz.'}`);
      }
    } catch {
      showToast?.('⚠️ Bağlantı hatası, manuel butonu deneyiniz.');
    } finally {
      setIsSendingCloudWa(false);
    }
  };

  const handleSetPickup = (pickupStatus: 'pending' | 'picked_up' | 'no_show') => {
    if (!onUpdateBooking) return;
    const updated = {
      ...booking,
      pickupStatus,
      pickedUpAt: pickupStatus === 'picked_up' ? new Date().toISOString() : undefined,
    };
    onUpdateBooking(updated, `Biniş durumu güncellendi: ${pickupStatus}`);
  };

  const handleQuickSettlePayment = () => {
    if (!onUpdateBooking) return;
    const updated = {
      ...booking,
      paidAmountThb: booking.totalPriceThb,
      remainingAmountThb: 0,
      paymentStatus: 'paid' as const,
    };
    onUpdateBooking(updated, 'Kalan bakiye tahsil edildi ve kapatıldı! 💳');
  };

  const waReminder = generateGuestPickupReminderTurkish(booking);
  const waReminderUrl = waReminder?.waUrl || `https://wa.me/${(booking.phone || '').replace(/[^0-9]/g, '')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-surface-2 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl overflow-hidden my-8">
        {/* Modal Başlığı */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-accent text-slate-950 font-mono">
                İŞ AKIŞI REHBERİ
              </span>
              <span className="text-xs text-slate-300 font-mono">
                {booking.ticketCode || booking.id}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold font-serif text-white mt-1">
              {booking.customerName}
            </h3>
            <p className="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
              <span>🏝️ {booking.tourTitle}</span>
              <span>·</span>
              <span>🏨 {booking.hotel}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 5 Aşamalı Görev Hattı */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Adım 1: Talep & Onay */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isConfirmed
              ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60'
              : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                  isConfirmed ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}>
                  {isConfirmed ? <CheckCircle2 className="w-4 h-4" /> : '1'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    1. Rezervasyon Teyidi
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Durum: <span className="font-semibold">{booking.status}</span> · {booking.adultCount} Yetişkin {booking.childCount > 0 ? `+ ${booking.childCount} Çocuk` : ''}
                  </p>
                </div>
              </div>

              {!isConfirmed ? (
                <button
                  type="button"
                  onClick={() => handleSetStatus('confirmed')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs"
                >
                  Onayla
                </button>
              ) : (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Onaylandı
                </span>
              )}
            </div>
          </div>

          {/* Adım 2: Araç & Şoför Ataması */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isFleetAssigned
              ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60'
              : 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                  isFleetAssigned ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                }`}>
                  {isFleetAssigned ? <CheckCircle2 className="w-4 h-4" /> : '2'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    2. Araç & Şoför Görevlendirme
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {booking.assignedVehicle || 'Araç atanmadı'} · {booking.assignedDriver || 'Şoför atanmadı'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="">Araç Seçiniz...</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.label}>{v.label}</option>
                ))}
              </select>

              <div className="flex items-center gap-2">
                <select
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
                >
                  <option value="">Şoför / Rehber Seçiniz...</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.fullName}>{d.fullName}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleSaveFleet}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all shrink-0 cursor-pointer"
                >
                  Kaydet
                </button>
              </div>
            </div>
          </div>

          {/* Adım 3: Misafir Bilgilendirme */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isNotified
              ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60'
              : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                  isNotified ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}>
                  {isNotified ? <CheckCircle2 className="w-4 h-4" /> : '3'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    3. Misafire Alınış Saati Bildirimi
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isNotified ? 'WhatsApp saat bildirimi gönderildi' : 'Alınış saati henüz misafire iletilmedi'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                <button
                  type="button"
                  onClick={handleSendViaCloudApi}
                  disabled={isSendingCloudWa}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  title="Meta WhatsApp Cloud API üzerinden arka planda otomatik gönder"
                >
                  {isSendingCloudWa ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>{isSendingCloudWa ? 'Gönderiliyor...' : 'Otomatik Gönder (Cloud API)'}</span>
                </button>

                <a
                  href={waReminderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleMarkNotified}
                  className="px-2.5 py-1.5 rounded-lg bg-whatsapp hover:bg-whatsapp-dark text-white text-xs font-bold flex items-center gap-1 transition-all shadow-xs"
                  title="WhatsApp Web / Uygulamasını açarak manuel gönder"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Manuel Aç</span>
                </a>
              </div>
            </div>
          </div>

          {/* Adım 4: Lobide Karşılama & Biniş */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isPickedUp
              ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60'
              : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                  isPickedUp ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}>
                  {isPickedUp ? <CheckCircle2 className="w-4 h-4" /> : '4'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    4. Lobide Biniş / Check-in
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Alınış Saati: <span className="font-semibold text-brand-primary">{booking.pickupTime || '07:30'}</span> · Durum: <span className="font-semibold">{booking.pickupStatus || 'pending'}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {!isPickedUp ? (
                  <button
                    type="button"
                    onClick={() => handleSetPickup('picked_up')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    Bindi
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSetPickup('pending')}
                    className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium"
                  >
                    Geri Al
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Adım 5: Tahsilat & Bakiye Kapatma */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isPaid
              ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60'
              : 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                  isPaid ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                }`}>
                  {isPaid ? <CheckCircle2 className="w-4 h-4" /> : '5'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    5. Ödeme & Kalan Tahsilat
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Toplam: {fmtMoney(booking.totalPriceThb)} THB · Ödenen: {fmtMoney(booking.paidAmountThb)} THB · Kalan: <span className="font-bold text-amber-600">{fmtMoney(Number(booking.remainingAmountThb))} THB</span>
                  </p>
                </div>
              </div>

              {!isPaid && Number(booking.remainingAmountThb) > 0 ? (
                <button
                  type="button"
                  onClick={handleQuickSettlePayment}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Kalanı Kapat</span>
                </button>
              ) : (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Bakiye Kapalı
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Modal Alt Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Tüm adımlar tamamlandığında rezervasyon saha döngüsü kapanır.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
