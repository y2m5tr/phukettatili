import { useState, useEffect } from 'react';
import type React from 'react';
import {
  Phone,
  MessageCircle,
  Printer,
  Check,
  Luggage,
  Sun,
} from 'lucide-react';
import { detectDeparturePier } from '../../lib/maps';
import PromptPayQrModal from '../shared/PromptPayQrModal';
import type {
  GuestBookingView,
  CheckinPassenger,
  MarineSafetyInfo,
  ChecklistItem,
} from './guestPortalTypes';
import { GuestLobbyCountdownCard } from './GuestLobbyCountdownCard';
import { GuestHotelTransferCard } from './GuestHotelTransferCard';
import { GuestCheckinForm } from './GuestCheckinForm';
import { GuestBoardingPassCard } from './GuestBoardingPassCard';
import { GuestPaymentCard } from './GuestPaymentCard';
import { GuestReviewBoosterCard } from './GuestReviewBoosterCard';
import { GuestMarineSafetyCard } from './GuestMarineSafetyCard';

export type { GuestBookingView };

interface Props {
  booking: GuestBookingView;
  managerPhone?: string;
}

export default function GuestTicketPortal({
  booking,
  managerPhone = '66828950665',
}: Props) {
  // Geri Sayım Hesaplayıcı (Lobi Alınışına Kalan Süre)
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
    isToday: boolean;
  }>({ hours: 0, minutes: 0, seconds: 0, isPast: false, isToday: false });

  // İnteraktif Hazırlık Kontrol Listesi (Checklist)
  const defaultChecklist: ChecklistItem[] = [
    { id: 'towel', text: 'Otel Plaj Havlusu (Otel lobisinden ücretsiz isteyebilirsiniz)', checked: false },
    { id: 'swimwear', text: 'Mayo / Şort (Sabah üzerinize giyerek gelmeniz tavsiye edilir)', checked: true },
    { id: 'sunscreen', text: 'Yüksek Faktörlü Güneş Kremi & Şapka', checked: false },
    { id: 'waterproof', text: 'Su Geçirmez Telefon Kılıfı & Güneş Gözlüğü', checked: false },
    { id: 'cash', text: 'Nakit Baht (Millî park gişesi ve ada içi harcamalar için)', checked: false },
    { id: 'passport', text: 'Pasaport Fotoğrafı (Telefonda fotoğrafı olması yeterlidir)', checked: true },
  ];

  const [checklist, setChecklist] = useState<ChecklistItem[]>(defaultChecklist);

  const totalPax = (booking.adultCount || 1) + (booking.childCount || 0);

  // 🛂 Tayland Deniz Polisi & Online Check-In State
  const [isCheckinOpen, setIsCheckinOpen] = useState<boolean>(false);
  const [passengersList, setPassengersList] = useState<CheckinPassenger[]>(() => {
    if (booking.passengerNames && booking.passengerNames.length > 0) {
      return booking.passengerNames.map((name) => ({
        fullName: name,
        passportNo: '',
        nationality: 'TR',
        birthDate: '',
        gender: 'M',
        dietaryPreference: 'standard',
      }));
    }
    return Array.from({ length: totalPax }, (_, i) => ({
      fullName: i === 0 ? booking.customerName : '',
      passportNo: '',
      nationality: 'TR',
      birthDate: '',
      gender: 'M',
      dietaryPreference: 'standard',
    }));
  });
  const [checkinSaved, setCheckinSaved] = useState<boolean>(false);
  const [isSubmittingCheckin, setIsSubmittingCheckin] = useState<boolean>(false);
  const [checkinMessage, setCheckinMessage] = useState<string>('');
  const [isPromptPayOpen, setIsPromptPayOpen] = useState<boolean>(false);

  // 🙋‍♂️ Lobi Hazırlık Durumu (Misafir Butonu)
  const [isLobbyReady, setIsLobbyReady] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(`ptt_lobby_ready_${booking.id}`) === 'true';
  });
  const [lobbyReadyTime, setLobbyReadyTime] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(`ptt_lobby_ready_time_${booking.id}`) || '';
  });
  const [isSubmittingLobbyReady, setIsSubmittingLobbyReady] = useState<boolean>(false);

  const handleToggleLobbyReady = async () => {
    const nextState = !isLobbyReady;
    const nowTime = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    setIsSubmittingLobbyReady(true);
    setIsLobbyReady(nextState);
    if (nextState) {
      setLobbyReadyTime(nowTime);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`ptt_lobby_ready_${booking.id}`, 'true');
        localStorage.setItem(`ptt_lobby_ready_time_${booking.id}`, nowTime);
      }
    } else {
      setLobbyReadyTime('');
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`ptt_lobby_ready_${booking.id}`);
        localStorage.removeItem(`ptt_lobby_ready_time_${booking.id}`);
      }
    }

    try {
      await fetch('/api/guest-lobby-ready', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: booking.id,
          ready: nextState,
          time: nextState ? nowTime : null,
          hotel: booking.hotel,
          customerName: booking.customerName,
        }),
      });
    } catch (err) {
      console.warn('Lobi hazır bildirimi gönderilirken hata:', err);
    } finally {
      setIsSubmittingLobbyReady(false);
    }
  };

  // 🌊 Andaman Denizi Canlı Güvenlik & Hava Durumu
  const [marineSafety, setMarineSafety] = useState<MarineSafetyInfo | null>(null);

  useEffect(() => {
    fetch('/api/marine-safety')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && data.ok) {
          setMarineSafety(data);
        }
      })
      .catch(() => {});
  }, []);

  // ⭐ Tur Sonu Akıllı Değerlendirme & İtibar Filtresi (Smart Sentiment Gate)
  const [reviewRating, setReviewRating] = useState<number | null>(null);
  const [reviewFeedback, setReviewFeedback] = useState<string>('');

  const handleUpdatePassenger = (
    index: number,
    field: string,
    value: string
  ) => {
    setPassengersList((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value } as CheckinPassenger;
      return copy;
    });
  };

  const handleSaveCheckin = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsSubmittingCheckin(true);
    setCheckinMessage('');

    try {
      const res = await fetch('/api/guest-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: booking.id,
          passengers: passengersList,
        }),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        setCheckinSaved(true);
        setCheckinMessage('✅ Pasaport ve yolcu bilgileriniz kaydedildi! Tayland Deniz Polisi liman manifestonuza işlendi.');
      } else {
        setCheckinMessage(`⚠️ ${data.message || 'Kayıt sırasında bir hata oluştu.'}`);
      }
    } catch {
      setCheckinMessage('⚠️ Bağlantı hatası oluştu. Lütfen tekrar deneyiniz.');
    } finally {
      setIsSubmittingCheckin(false);
    }
  };

  useEffect(() => {
    const calculateCountdown = () => {
      try {
        const pickupStr = booking.pickupTime || '07:30';
        const [pTime] = pickupStr.split('-');
        const [pHour, pMin] = (pTime || '07:30').trim().split(':');

        const [tYear, tMonth, tDay] = (booking.tourDate || '').split('-');
        if (!tYear || !tMonth || !tDay) return;

        const targetDate = new Date(
          Number(tYear),
          Number(tMonth) - 1,
          Number(tDay),
          Number(pHour) || 7,
          Number(pMin) || 30,
          0
        );

        const now = new Date();
        const diffMs = targetDate.getTime() - now.getTime();

        const isToday =
          now.getFullYear() === Number(tYear) &&
          now.getMonth() === Number(tMonth) - 1 &&
          now.getDate() === Number(tDay);

        if (diffMs <= 0) {
          setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isPast: true, isToday });
          return;
        }

        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

        setTimeLeft({ hours, minutes, seconds, isPast: false, isToday });
      } catch (e) {
        console.error('Geri sayım hatası:', e);
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, [booking.pickupTime, booking.tourDate]);

  const toggleChecklistItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const checkedCount = checklist.filter((c) => c.checked).length;
  const departurePier = detectDeparturePier(booking.tourTitle);

  // Doğrudan WhatsApp Destek Bağlantısı
  const cleanManagerPhone = managerPhone.replace(/\D/g, '');
  const supportWhatsAppUrl = `https://wa.me/${cleanManagerPhone}?text=${encodeURIComponent(
    `Merhaba, ${booking.id} numaralı "${booking.tourTitle}" rezervasyonumla ilgili desteğe ihtiyacım var. (Misafir: ${booking.customerName})`
  )}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 selection:bg-amber-500 selection:text-slate-950">
      {/* ÜST MARKA VE DURUM ÇUBUĞU */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3.5 print:hidden">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-serif font-black text-base shadow-md shadow-amber-500/20">
              PT
            </span>
            <div>
              <span className="font-serif font-bold text-sm tracking-tight text-white block">
                Phuket Tatili
              </span>
              <span className="text-[10px] text-amber-400 font-medium block -mt-0.5">
                Canlı Misafir & Biniş Portalı
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Bileti Yazdır veya PDF Kaydet"
            >
              <Printer className="w-4 h-4" />
            </button>
            <a
              href={supportWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Türkçe Destek</span>
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-6 space-y-5">
        {/* REZERVASYON BAŞLIK & GERİ SAYIM KARTI */}
        <GuestLobbyCountdownCard
          booking={booking}
          timeLeft={timeLeft}
          isLobbyReady={isLobbyReady}
          lobbyReadyTime={lobbyReadyTime}
          isSubmittingLobbyReady={isSubmittingLobbyReady}
          onToggleLobbyReady={handleToggleLobbyReady}
        />

        {/* 🌊 ANDAMAN DENİZİ CANLI GÜVENLİK & SEYİR RADARI */}
        {marineSafety && <GuestMarineSafetyCard marineSafety={marineSafety} />}

        {/* ALINIŞ & TRANSFER DETAYLARI KARTI */}
        <GuestHotelTransferCard
          booking={booking}
          totalPax={totalPax}
          departurePier={departurePier}
        />

        {/* DİJİTAL BİNİŞ KARTI (QR BOARDING PASS) */}
        <GuestBoardingPassCard
          booking={booking}
          totalPax={totalPax}
          departurePier={departurePier}
        />

        {/* ÖDEME & BAKİYE DURUMU KARTI */}
        <GuestPaymentCard
          booking={booking}
          onOpenPromptPay={() => setIsPromptPayOpen(true)}
        />

        {/* 🛂 TAYLAND DENİZ POLİSİ & LİMAN ONLINE CHECK-IN */}
        <GuestCheckinForm
          passengersList={passengersList}
          isCheckinOpen={isCheckinOpen}
          setIsCheckinOpen={setIsCheckinOpen}
          checkinSaved={checkinSaved}
          isSubmittingCheckin={isSubmittingCheckin}
          checkinMessage={checkinMessage}
          onUpdatePassenger={handleUpdatePassenger}
          onSaveCheckin={handleSaveCheckin}
        />

        {/* TURA GİDERKEN YANINIZA ALINACAKLAR (CHECKLIST) */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Luggage className="w-4 h-4" />
              <span>Tura Giderken Yanınıza Alınacaklar</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {checkedCount} / {checklist.length} Hazır
            </span>
          </div>

          <div className="space-y-2">
            {checklist.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleChecklistItem(item.id)}
                className={`w-full p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                  item.checked
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    item.checked
                      ? 'bg-emerald-600 text-white'
                      : 'border border-slate-700 bg-slate-900'
                  }`}
                >
                  {item.checked && <Check className="w-3.5 h-3.5" />}
                </div>
                <span className={`text-xs ${item.checked ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                  {item.text}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ⭐ TUR SONU AKILLI DEĞERLENDİRME & GOOGLE YORUM BOOSTER (SMART SENTIMENT GATE) */}
        <GuestReviewBoosterCard
          booking={booking}
          cleanManagerPhone={cleanManagerPhone}
          reviewRating={reviewRating}
          setReviewRating={setReviewRating}
          reviewFeedback={reviewFeedback}
          setReviewFeedback={setReviewFeedback}
        />

        {/* CANLI HAVA VE DENİZ GÜVENLİK BAROMETRESİ */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <Sun className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">Phuket Hava & Deniz Durumu</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Yeşil Bayrak (Sakin Deniz)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Bugün Andaman Denizi'nde dalga boyu güvenli seviyededir. Tur rotaları ve şnorkel noktaları açıktır.
            </p>
          </div>
        </div>

        {/* DESTEK VE İLETİŞİM ALANI */}
        <div className="text-center pt-4 pb-8 space-y-3">
          <p className="text-xs text-slate-400">
            Transferiniz, rehberiniz veya tur programınızla ilgili her türlü soruda yanınızdayız:
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={supportWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-98"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp'tan Yazın (+{cleanManagerPhone})</span>
            </a>
            <a
              href={`tel:+${cleanManagerPhone}`}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <Phone className="w-4 h-4 text-amber-400" />
              <span>Acil Arama Hattı</span>
            </a>
          </div>

          <p className="text-[10px] text-slate-600 pt-3">
            Phuket Tatili Co., Ltd. · Licensed Inbound Tour Operator · TAT No: 34/02819 · Thailand
          </p>
        </div>
      </main>

      {isPromptPayOpen && (
        <PromptPayQrModal
          isOpen={isPromptPayOpen}
          onClose={() => setIsPromptPayOpen(false)}
          bookingRef={booking.id}
          customerName={booking.customerName}
          initialAmountThb={booking.remainingAmountThb}
          promptPayTarget={managerPhone}
          showToast={(msg) => alert(msg)}
        />
      )}
      {/* Yazdırma / PDF Stilleri: Yalnızca Biniş Kartını Beyaz Zeminle Basar */}
      <style>{`
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          header, footer, nav, .print\\:hidden, button, a[href*="wa.me"], a[href*="tel:"] {
            display: none !important;
          }
          #boarding-pass-print-area {
            box-shadow: none !important;
            border: 2px solid #000000 !important;
            margin: 0 auto !important;
            max-width: 100% !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>
    </div>
  );
}
