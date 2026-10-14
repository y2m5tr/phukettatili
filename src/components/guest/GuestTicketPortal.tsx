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
} from 'lucide-react';
import type { Booking } from '../../data/adminInitialData';
import { getSingleHotelMapUrl, detectDeparturePier } from '../../lib/maps';

interface Props {
  booking: Booking;
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

  const totalPax = (booking.adultCount || 1) + (booking.childCount || 0);

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
          </div>
        </div>

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
                {booking.tourDate}
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
        <div className="rounded-3xl bg-white text-slate-900 overflow-hidden shadow-2xl border border-slate-200">
          <div className="p-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 flex items-center justify-between">
            <div className="flex items-center gap-2 font-black text-sm uppercase tracking-wider">
              <span>🎟️ OFFICIAL DIGITAL BOARDING PASS</span>
            </div>
            <span className="text-[11px] font-mono font-bold bg-slate-950/15 px-2 py-0.5 rounded">
              TAT: 34/02819
            </span>
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

                {/* Yolcu İsimleri Listesi (varsa) */}
                {booking.passengers && booking.passengers.length > 0 && (
                  <div className="pt-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                      Kayıtlı Yolcular:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {booking.passengers.map((p, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold"
                        >
                          {p.fullName}
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
                <span className="font-bold text-slate-900">{departurePier}</span>
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
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-amber-200">Tur Sabahı Ödenecek Kalan:</span>
                <span className="text-xl font-black font-mono text-amber-400">
                  {booking.remainingAmountThb.toLocaleString()} THB
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                💵 Lütfen bu tutarı tur sabahı aracımıza binerken şoförümüze veya limandaki Türkçe rehberimize *nakit Baht* olarak teslim ediniz.
              </p>
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
    </div>
  );
}
