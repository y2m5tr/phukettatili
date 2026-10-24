import { useState, useEffect } from 'react';
import {
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Phone,
  MessageCircle,
  Printer,
  Compass,
  Bus,
  Check,
  Luggage,
  Sun,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Utensils,
  User,
  QrCode,
  Star,
  Heart,
} from 'lucide-react';
import { getSingleHotelMapUrl, detectDeparturePier } from '../../lib/maps';
import { DEFAULT_GOOGLE_REVIEW_URL } from '../../lib/reviewBooster';
import { formatDayMonthYear } from '../../lib/whatsappEngine';
import PromptPayQrModal from '../shared/PromptPayQrModal';
import { fmtMoney } from '../../lib/moneyFormat';

/**
 * Misafir portalının ÇİZECEĞİ asgari rezervasyon görünümü.
 *
 * Bu bileşen halka açık /bilet/[code] sayfasında client:load ile çalışır;
 * Astro her prop'u HTML içine JSON olarak serileştirir. Bu yüzden tam
 * `Booking` yerine yalnızca burada kullanılan alanlar geçilir — maliyet,
 * tedarikçi, kapora, telefon, e-posta, özel not ve pasaport verisi
 * sayfa kaynağına asla inmez.
 *
 * Yeni bir alan çizmek gerekirse önce bu tipe eklenmeli; tip burada
 * olmayan bir alanın yanlışlıkla sızmasını derleme zamanında engeller.
 */
export interface GuestBookingView {
  id: string;
  customerName: string;
  hotel: string;
  roomNumber?: string;
  tourTitle: string;
  tourDate: string;
  pickupTime?: string;
  adultCount: number;
  childCount: number;
  remainingAmountThb: number;
  nationalParkFeeIncluded: boolean;
  assignedVehicle?: string;
  /** Pasaport/uyruk/doğum tarihi YOK — yalnızca isimler. */
  passengerNames: string[];
}

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
  const defaultChecklist = [
    { id: 'towel', text: 'Otel Plaj Havlusu (Otel lobisinden ücretsiz isteyebilirsiniz)', checked: false },
    { id: 'swimwear', text: 'Mayo / Şort (Sabah üzerinize giyerek gelmeniz tavsiye edilir)', checked: true },
    { id: 'sunscreen', text: 'Yüksek Faktörlü Güneş Kremi & Şapka', checked: false },
    { id: 'waterproof', text: 'Su Geçirmez Telefon Kılıfı & Güneş Gözlüğü', checked: false },
    { id: 'cash', text: 'Nakit Baht (Millî park gişesi ve ada içi harcamalar için)', checked: false },
    { id: 'passport', text: 'Pasaport Fotoğrafı (Telefonda fotoğrafı olması yeterlidir)', checked: true },
  ];

  const [checklist, setChecklist] = useState(defaultChecklist);

  const totalPax = (booking.adultCount || 1) + (booking.childCount || 0);

  // 🛂 Tayland Deniz Polisi & Online Check-In State
  const [isCheckinOpen, setIsCheckinOpen] = useState<boolean>(false);
  const [passengersList, setPassengersList] = useState<Array<{
    fullName: string;
    passportNo: string;
    nationality: string;
    birthDate: string;
    gender: 'M' | 'F';
    dietaryPreference: 'standard' | 'vegetarian' | 'halal' | 'vegan' | 'seafood_allergy';
  }>>(() => {
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
          isReady: nextState,
          customerName: booking.customerName,
          hotel: booking.hotel,
          roomNumber: booking.roomNumber,
          tourTitle: booking.tourTitle,
          time: nowTime,
        }),
      });
    } catch (err) {
      console.warn('Lobi hazır bildirimi gönderilirken hata:', err);
    } finally {
      setIsSubmittingLobbyReady(false);
    }
  };

  // 🌊 Andaman Denizi Canlı Güvenlik & Hava Durumu
  const [marineSafety, setMarineSafety] = useState<{
    level: 'calm' | 'moderate' | 'severe';
    waveHeightMeters: number;
    windSpeedKnots: number;
    summary: string;
    warningNote: string;
  } | null>(null);

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
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSaveCheckin = async (e: React.FormEvent) => {
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

        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const isToday = booking.tourDate === todayStr;

        if (diffMs <= 0) {
          setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isPast: true, isToday });
        } else {
          const totalSec = Math.floor(diffMs / 1000);
          const hours = Math.floor(totalSec / 3600);
          const minutes = Math.floor((totalSec % 3600) / 60);
          const seconds = totalSec % 60;
          setTimeLeft({ hours, minutes, seconds, isPast: false, isToday });
        }
      } catch {
        // ignore
      }
    };

    calculateCountdown();
    const timer = setInterval(calculateCountdown, 1000);
    return () => clearInterval(timer);
  }, [booking]);

  const toggleChecklistItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const checkedCount = checklist.filter((c) => c.checked).length;
  const departurePier = detectDeparturePier(booking.tourTitle);
  const cleanManagerPhone = managerPhone.replace(/[^0-9]/g, '');

  // Doğrudan WhatsApp Destek Bağlantısı
  const supportWhatsAppUrl = `https://wa.me/${cleanManagerPhone}?text=${encodeURIComponent(
    `Merhaba Phuket Tatili ekibi! 🌴 Rezervasyon Kodum: ${booking.id} (${booking.customerName}). ${booking.tourTitle} turum hakkında bilgi almak istiyorum.`
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
        {/* REZERVASYON BAŞLIK KARTI */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-850 border border-slate-800 p-5 sm:p-6 shadow-2xl">
          <div className="absolute -right-8 -top-8 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono font-bold text-xs tracking-wider">
                  {booking.id}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Onaylandı</span>
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold font-serif text-white mt-3 leading-tight">
                {booking.tourTitle}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Sayın <span className="font-bold text-slate-200">{booking.customerName}</span>, tur ve transfer detaylarınız aşağıdadır.
              </p>
            </div>
          </div>

          {/* CANLI GERİ SAYIM SAYACI */}
          <div className="mt-5 pt-4 border-t border-slate-800/80">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              ⏰ Otel Lobisinden Alınış Durumu:
            </span>

            {timeLeft.isPast ? (
              <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                  <Bus className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-emerald-300">
                    Tur Saatiniz Başladı / Aracınız Yolda
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Şoförümüzle buluşamadıysanız lütfen 7/24 Türkçe destek hattımıza yazınız.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-950/80 border border-slate-800/80 p-3 rounded-2xl">
                  <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Saat</span>
                </div>
                <div className="bg-slate-950/80 border border-slate-800/80 p-3 rounded-2xl">
                  <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Dakika</span>
                </div>
                <div className="bg-slate-950/80 border border-slate-800/80 p-3 rounded-2xl">
                  <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Saniye</span>
                </div>
              </div>
            )}

            {/* LOBİDEYİM HAZIRIM BUTONU & DURUMU */}
            <div className="mt-4 pt-3.5 border-t border-slate-800/80">
              {isLobbyReady ? (
                <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 shadow-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                      </span>
                      <span className="font-bold text-sm text-emerald-300">
                        Lobidesiniz & Hazırsınız {lobbyReadyTime ? `(${lobbyReadyTime})` : ''}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleToggleLobbyReady}
                      disabled={isSubmittingLobbyReady}
                      className="text-[11px] text-slate-400 hover:text-slate-200 underline cursor-pointer"
                    >
                      Geri Al
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    ✨ Hazır olduğunuz operasyon ekibimize ve transfer aracınıza iletildi. Şoförümüz lobide sizi isminizle karşılayacaktır.
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleToggleLobbyReady}
                  disabled={isSubmittingLobbyReady}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] text-white font-extrabold text-sm shadow-xl shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer border border-emerald-400/30"
                >
                  <span className="text-lg">🙋‍♂️</span>
                  <span>Lobideyim, Hazırım! (Şoföre Bildir)</span>
                </button>
              )}
            </div>

            {/* ATANAN ARAÇ / HAT BİLGİSİ */}
            <div className="mt-3 flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-xs">
              <span className="text-slate-400 flex items-center gap-2 font-medium">
                <Bus className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Atanan Hat / Araç:</span>
              </span>
              <span className="font-mono font-bold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                {booking.assignedVehicle || 'VIP Tur Minibüsü'}
              </span>
            </div>
          </div>
        </div>

        {/* 🌊 ANDAMAN DENİZİ CANLI GÜVENLİK & SEYİR RADARI */}
        {marineSafety && (
          <div
            className={`p-4 rounded-3xl border shadow-xl space-y-2.5 transition-all ${
              marineSafety.level === 'severe'
                ? 'bg-rose-950/30 border-rose-800 text-rose-200'
                : marineSafety.level === 'moderate'
                ? 'bg-amber-950/30 border-amber-800 text-amber-200'
                : 'bg-gradient-to-br from-emerald-950/35 via-slate-900 to-slate-900 border-emerald-800/60 text-emerald-100'
            }`}
          >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xl">🌊</span>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">
                    Andaman Denizi Canlı Güvenlik & Seyir Durumu
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    Phuket Operasyon & Liman Başkanlığı Canlı Verisi
                  </span>
                </div>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border ${
                  marineSafety.level === 'severe'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : marineSafety.level === 'moderate'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}
              >
                {marineSafety.level === 'severe'
                  ? '⚠️ Yüksek Dalga Uyarısı'
                  : marineSafety.level === 'moderate'
                  ? '⚡ Orta Dalga'
                  : '🟢 Deniz Sakin · Güvenli Seyir'}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              {marineSafety.summary} {marineSafety.warningNote}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center font-mono text-xs">
              <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[9px] text-slate-400 uppercase block font-sans">Dalga Boyu</span>
                <strong className="text-white text-xs">{marineSafety.waveHeightMeters}m</strong>
              </div>
              <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[9px] text-slate-400 uppercase block font-sans">Rüzgar</span>
                <strong className="text-white text-xs">{marineSafety.windSpeedKnots} kn</strong>
              </div>
              <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[9px] text-slate-400 uppercase block font-sans">Phi Phi</span>
                <strong className="text-emerald-400 text-xs">Açık / Güvenli</strong>
              </div>
              <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[9px] text-slate-400 uppercase block font-sans">Phang Nga</span>
                <strong className="text-emerald-400 text-xs">Durgun / Korumalı</strong>
              </div>
            </div>
          </div>
        )}

        {/* ALINIŞ & TRANSFER DETAYLARI KARTI */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-4 shadow-lg">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-amber-400 font-bold text-sm">
            <Bus className="w-4 h-4" />
            <span>Otel Alınış & Transfer Bilgileri</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            {/* Alınış Saati */}
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Lobi Alınış Saati</span>
              <div className="text-xl font-black font-mono text-amber-400 mt-0.5">
                {booking.pickupTime || '07:30'}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Lütfen belirtilen saatte otelinizin ana lobisinde hazır bulununuz.
              </span>
            </div>

            {/* Tur Tarihi */}
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Tur Tarihi</span>
              <div className="text-base font-bold text-white mt-0.5 font-mono">
                {formatDayMonthYear(booking.tourDate)}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {booking.adultCount} Yetişkin{booking.childCount > 0 ? ` + ${booking.childCount} Çocuk` : ''} ({totalPax} Kişi)
              </span>
            </div>

            {/* Otel & Oda */}
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 sm:col-span-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Alınış Oteli & Oda</span>
                  <div className="text-sm font-bold text-white mt-0.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{booking.hotel}</span>
                  </div>
                  {booking.roomNumber && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-slate-800 text-[11px] font-bold text-amber-300">
                      Oda No: {booking.roomNumber}
                    </span>
                  )}
                </div>

                <a
                  href={getSingleHotelMapUrl(booking.hotel)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1 transition-colors shrink-0"
                >
                  <Compass className="w-3.5 h-3.5 text-sky-400" />
                  <span>Harita</span>
                </a>
              </div>
            </div>

            {/* Minibüs / Hat */}
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Tahsis Edilen Araç</span>
              <div className="text-xs font-bold text-sky-400 mt-0.5">
                {booking.assignedVehicle || 'VIP Minibüs Transferi'}
              </div>
            </div>

            {/* Kalkış Limanı / İskelesi */}
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Kalkış İskelesi / Marina</span>
              <div className="text-xs font-bold text-slate-200 mt-0.5">
                {departurePier.split(',')[0]}
              </div>
            </div>
          </div>
        </div>

        {/* DİJİTAL BİNİŞ KARTI (QR BOARDING PASS) */}
        <div id="boarding-pass-print-area" className="rounded-3xl bg-white text-slate-900 overflow-hidden shadow-2xl border border-slate-200">
          <div className="p-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 flex items-center justify-between">
            <div className="flex items-center gap-2 font-black text-sm uppercase tracking-wider">
              <span>🎟️ OFFICIAL DIGITAL BOARDING PASS</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-2.5 py-1 rounded-lg bg-slate-950 text-white text-[11px] font-bold flex items-center gap-1.5 hover:bg-slate-800 transition-colors cursor-pointer print:hidden shadow-xs"
                title="Biniş Kartını A4 / PDF Olarak Kaydet"
              >
                <Printer className="w-3 h-3" />
                <span>Yazdır / PDF</span>
              </button>
              <span className="text-[11px] font-mono font-bold bg-slate-950/15 px-2 py-0.5 rounded">
                TAT: 34/02819
              </span>
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-5 pb-5 border-b border-dashed border-slate-300">
              {/* Sol Yolcu Bilgileri */}
              <div className="space-y-3 w-full sm:w-auto">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Ana Yolcu / Lead Passenger
                  </span>
                  <div className="text-lg font-black text-slate-950">
                    {booking.customerName.toUpperCase()}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-[10px] font-sans text-slate-400 block font-bold">REZ KODU</span>
                    <span className="font-bold text-slate-900">{booking.id}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-sans text-slate-400 block font-bold">KİŞİ SAYISI</span>
                    <span className="font-bold text-slate-900">{totalPax} PAX</span>
                  </div>
                </div>

                {/* Yolcu İsimleri Listesi (varsa) — pasaport bilgisi GÖSTERİLMEZ */}
                {booking.passengerNames.length > 0 && (
                  <div className="pt-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                      Kayıtlı Yolcular:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {booking.passengerNames.map((name, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sağ QR Kod */}
              <div className="flex flex-col items-center shrink-0 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <svg
                  className="w-28 h-28 text-slate-950"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <rect x="2" y="2" width="8" height="8" rx="1" fill="currentColor" fillOpacity="0.15" />
                  <rect x="14" y="2" width="8" height="8" rx="1" fill="currentColor" fillOpacity="0.15" />
                  <rect x="2" y="14" width="8" height="8" rx="1" fill="currentColor" fillOpacity="0.15" />
                  <rect x="5" y="5" width="2" height="2" fill="currentColor" />
                  <rect x="17" y="5" width="2" height="2" fill="currentColor" />
                  <rect x="5" y="17" width="2" height="2" fill="currentColor" />
                  <path d="M14 14h2v2h-2z" fill="currentColor" />
                  <path d="M18 14h4v4h-4z" fill="currentColor" />
                  <path d="M14 18h2v4h-2z" fill="currentColor" />
                  <path d="M18 20h4v2h-4z" fill="currentColor" />
                </svg>
                <span className="font-mono text-[10px] font-bold text-slate-500 mt-1">
                  {booking.id}-PASS
                </span>
                <span className="text-[9px] text-slate-400">İskelede Okutunuz</span>
              </div>
            </div>

            {/* İskele ve Tur Özeti */}
            <div className="flex items-center justify-between text-xs pt-1">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">KALKIŞ İSKELESİ</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{departurePier}</span>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(departurePier.split(',')[0] + ' Pier Phuket')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-sky-600 hover:text-sky-700 font-bold print:hidden"
                    title="İskele Haritasını Aç"
                  >
                    <Compass className="w-3 h-3" />
                    <span>Harita</span>
                  </a>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-bold">OPERATÖR</span>
                <span className="font-bold text-amber-600">Phuket Tatili DMC</span>
              </div>
            </div>
          </div>
        </div>

        {/* ÖDEME & BAKİYE DURUMU KARTI */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Ödeme & Bakiye Durumu
            </span>
            {booking.remainingAmountThb > 0 ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Kalan Bakiye Mevcut
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ✓ Tamamı Ödendi
              </span>
            )}
          </div>

          {booking.remainingAmountThb > 0 ? (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-amber-200">Tur Sabahı Ödenecek Kalan:</span>
                <span className="text-xl font-black font-mono text-amber-400">
                  {fmtMoney(booking.remainingAmountThb)} THB
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                💵 Bu tutarı tur sabahı şoförümüze nakit teslim edebilir veya aşağıdaki butondan PromptPay QR ile online ödeyebilirsiniz.
              </p>
              <button
                type="button"
                onClick={() => setIsPromptPayOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                <span>PromptPay QR Kodu ile Hemen Öde ({fmtMoney(booking.remainingAmountThb)} THB)</span>
              </button>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Tur ücretinizin tamamı ödenmiştir. Herhangi bir bakiye borcunuz bulunmamaktadır.</span>
            </div>
          )}

          {/* Millî Park Harç Uyarısı (Eğer hariç ise) */}
          {booking.nationalParkFeeIncluded === false && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div>
                <span className="font-bold block">Tayland Millî Park Harcı Gişede Ödenir</span>
                <span className="text-[11px] text-slate-400">
                  Bu tur Tayland Kraliyeti Deniz Millî Parkı kapsamındadır. Kişi başı 400 THB millî park giriş ücreti limanda resmi devlet gişesine nakit ödenir.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ==================================================== */}
        {/* 🛂 TAYLAND DENİZ POLİSİ & LİMAN ONLINE CHECK-IN */}
        {/* ==================================================== */}
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
            <form onSubmit={handleSaveCheckin} className="space-y-4 pt-2 border-t border-slate-800/80">
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
                        onChange={(e) => handleUpdatePassenger(idx, 'fullName', e.target.value)}
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
                        onChange={(e) => handleUpdatePassenger(idx, 'passportNo', e.target.value.toUpperCase())}
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
                          onChange={(e) => handleUpdatePassenger(idx, 'nationality', e.target.value.toUpperCase())}
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
                          onChange={(e) => handleUpdatePassenger(idx, 'gender', e.target.value)}
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
                          onChange={(e) => handleUpdatePassenger(idx, 'birthDate', e.target.value)}
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
                          onChange={(e) => handleUpdatePassenger(idx, 'dietaryPreference', e.target.value)}
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
                <div className={`p-3 rounded-xl text-xs font-bold ${
                  checkinMessage.startsWith('✅')
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                }`}>
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
        <div id="degerlendir" className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 scroll-mt-6">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <span>Gününüz Nasıl Geçti? (Tur Değerlendirmesi)</span>
          </div>

          <p className="text-xs text-slate-300">
            {booking.tourTitle} turumuzun ve saha ekibimizin hizmetini değerlendirin:
          </p>

          {/* 1 - 5 Yıldız Seçimi */}
          <div className="flex items-center justify-center gap-3 py-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setReviewRating(star)}
                className={`p-2 sm:p-3 rounded-2xl transition-all transform active:scale-90 ${
                  reviewRating !== null && reviewRating >= star
                    ? 'bg-amber-400/20 text-amber-400 scale-105'
                    : 'bg-slate-950 text-slate-600 hover:text-slate-400 hover:bg-slate-800'
                }`}
                title={`${star} Yıldız`}
              >
                <Star
                  className={`w-7 h-7 sm:w-8 sm:h-8 ${
                    reviewRating !== null && reviewRating >= star ? 'fill-amber-400' : ''
                  }`}
                />
              </button>
            ))}
          </div>

          {/* 4 veya 5 Yıldız: Doğrudan Google Haritalara Yönlendir */}
          {reviewRating !== null && reviewRating >= 4 && (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center space-y-3 animate-fadeIn">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 mb-1">
                <Heart className="w-5 h-5 fill-emerald-400" />
              </div>
              <h4 className="text-sm font-bold text-white">Harika Bir Gün Geçirmenize Çok Sevindik! 🎉</h4>
              <p className="text-xs text-slate-300">
                Ekibimize ve rehberlerimize moral olması, yeni gelecek Türk gezginlere rehberlik etmesi için 1 dakikanızı ayırıp Google Haritalar profilimizde 5 yıldızla değerlendirmek ister misiniz?
              </p>
              <a
                href={DEFAULT_GOOGLE_REVIEW_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 transition-all cursor-pointer"
              >
                <Star className="w-4 h-4 fill-slate-950" />
                <span>Google'da 5 Yıldızla Değerlendir (Tek Tıkla)</span>
              </a>
            </div>
          )}

          {/* 1, 2 veya 3 Yıldız: İtibar Filtresi — Google Yerine Ofis Yöneticisine Yönlendir */}
          {reviewRating !== null && reviewRating < 4 && (
            <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                <AlertTriangle className="w-4 h-4" />
                <span>Bir Aksaklık Yaşadığınız İçin Çok Üzgünüz</span>
              </div>
              <p className="text-xs text-slate-300">
                Memnuniyetiniz bizim için her şeyden önemli. Yaşadığınız sorunu lütfen aşağıya yazınız; Genel Koordinatörümüz derhal sizinle iletişime geçip telafi edecektir:
              </p>
              <textarea
                value={reviewFeedback}
                onChange={(e) => setReviewFeedback(e.target.value)}
                rows={2}
                placeholder="Örn: Transfer aracı gecikti / teknede yemek yetersizdi..."
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
              <a
                href={`https://wa.me/${cleanManagerPhone}?text=${encodeURIComponent(
                  `🚨 *MİSAFİR GERİ BİLDİRİMİ / ŞİKAYET* 🚨\n\n👤 Misafir: ${booking.customerName}\n🏨 Otel: ${booking.hotel}\n🏝️ Tur: ${booking.tourTitle}\n⭐ Puan: ${reviewRating}/5 Yıldız\n\n📝 Geri Bildirim: "${reviewFeedback || 'Açıklama belirtilmedi'}"\n\nLütfen en kısa sürede iletişime geçiniz.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Genel Koordinatöre Özel WhatsApp Gönder</span>
              </a>
            </div>
          )}
        </div>

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
