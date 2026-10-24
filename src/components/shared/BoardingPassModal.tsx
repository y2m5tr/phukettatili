import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Printer,
  Share2,
  Clock,
  MapPin,
  AlertTriangle,
  Compass,
  Phone,
  Bus,
  Sparkles,
} from 'lucide-react';
import type { Booking } from '../../data/adminInitialData';
import { detectHotelZone, COLLECTION_LOCATION_LABELS } from '../../data/adminInitialData';
import { fmtMoney } from '../../lib/moneyFormat';

interface Props {
  booking: Booking | null;
  tourIndex?: number;
  onClose: () => void;
  managerPhone?: string;
}

export default function BoardingPassModal({
  booking,
  tourIndex = 0,
  onClose,
  managerPhone = '66828950665',
}: Props) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  if (!booking) return null;

  // Hangi tur gösteriliyor? Çoklu tursa seçilen indeks, değilse tekil tur
  const activeTour =
    booking.tours && booking.tours.length > 0 && booking.tours[tourIndex]
      ? booking.tours[tourIndex]
      : {
          tourTitle: booking.tourTitle,
          tourDate: booking.tourDate,
          pickupTime: booking.pickupTime || '07:30',
          priceThb: booking.totalPriceThb,
          nationalParkFeeIncluded: booking.nationalParkFeeIncluded,
          assignedVehicle: booking.assignedVehicle,
          assignedDriver: booking.assignedDriver,
        };

  const hotelZone = booking.hotelZone || detectHotelZone(booking.hotel);
  const vehicle = activeTour.assignedVehicle || booking.assignedVehicle || `Minibüs (${hotelZone})`;

  // QR Kod payload'ı: PT-VOUCHER:BOOKING_ID:TOUR_INDEX
  const qrPayload = `PT-VOUCHER:${booking.id}:${tourIndex}`;

  useEffect(() => {
    QRCode.toDataURL(qrPayload, {
      width: 260,
      margin: 1.5,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR Kod üretme hatası:', err));
  }, [qrPayload]);

  // Resmi A4 Antetli Seyahat Voucher'ı Yazdırma / PDF
  const handlePrint = () => {
    const newWin = window.open('', '_blank');
    if (!newWin) {
      window.print();
      return;
    }

    const todayStr = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const pickupWindow = activeTour.pickupTime || '07:30';

    newWin.document.write(`<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>VOUCHER-${booking.id} · ${booking.customerName} · Phuket Tatili</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; background: #fff !important; }
      .no-print { display: none !important; }
      .a4-voucher { box-shadow: none !important; border: 1px solid #cbd5e1 !important; margin: 0 auto !important; width: 100% !important; max-width: none !important; }
    }
    body { background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
  </style>
</head>
<body class="p-3 sm:p-8 flex flex-col items-center min-h-screen">
  <!-- Üst Eylem Barı -->
  <div class="no-print w-full max-w-[800px] mb-5 p-3.5 bg-slate-900 text-white rounded-2xl border border-slate-700 shadow-xl flex items-center justify-between gap-3">
    <div class="flex items-center gap-2 text-xs">
      <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
      <span class="font-bold">Resmi Seyahat Voucher'ı</span>
      <span class="text-slate-400">·</span>
      <span class="font-mono text-amber-400 font-bold">${booking.id}</span>
    </div>
    <div class="flex items-center gap-2">
      <button onclick="window.print()" style="cursor:pointer;" class="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition flex items-center gap-1.5 shadow-md">
        🖨️ A4 PDF İndir / Yazdır
      </button>
      <button onclick="window.close()" style="cursor:pointer;" class="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition">
        Kapat
      </button>
    </div>
  </div>

  <!-- A4 Belge Gövdesi -->
  <div class="a4-voucher w-full max-w-[800px] bg-white p-8 sm:p-10 rounded-3xl shadow-2xl border border-slate-200 text-slate-900 relative">
    <!-- Antet & Logo -->
    <div class="flex items-center justify-between border-b-2 border-slate-900 pb-6 mb-6">
      <div class="flex items-center gap-3">
        <img src="/assets/logo-main-transparent.png" alt="Phuket Tatili" class="h-14 w-auto object-contain" />
        <div>
          <h1 class="text-2xl font-serif font-black tracking-tight text-slate-950">PHUKET TATİLİ</h1>
          <p class="text-[11px] font-bold uppercase tracking-wider text-amber-700">Lüks Seyahat & VIP Tur Operasyonu · Tayland</p>
        </div>
      </div>
      <div class="text-right">
        <span class="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-xs font-black uppercase mb-1">
          ✓ ONAYLANDI (CONFIRMED)
        </span>
        <p class="text-xs text-slate-500 font-mono">Ref No: <strong>${booking.id}</strong></p>
        <p class="text-[11px] text-slate-400">Düzenlenme: ${todayStr}</p>
      </div>
    </div>

    <!-- Başlık -->
    <div class="text-center mb-6">
      <h2 class="text-xl font-bold tracking-tight uppercase text-slate-900">RESMİ TUR VE TRANSFER BİNİŞ BELGESİ</h2>
      <p class="text-xs text-slate-500">OFFICIAL SERVICE VOUCHER & BOARDING PASS</p>
    </div>

    <!-- Bilgi Izgarası -->
    <div class="grid grid-cols-2 gap-4 mb-6 text-xs">
      <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Misafir & İletişim Bilgileri</span>
        <p class="text-sm font-bold text-slate-900">${booking.customerName}</p>
        <p class="text-slate-600">👥 Kişi Sayısı: <strong>${booking.adultCount} Yetişkin${booking.childCount ? `, ${booking.childCount} Çocuk` : ''}</strong></p>
        <p class="text-slate-600">📱 Telefon: <strong>${booking.phone}</strong></p>
        <p class="text-slate-600">🏨 Otel: <strong>${booking.hotel}</strong> ${booking.roomNumber ? `(Oda: ${booking.roomNumber})` : ''}</p>
        <p class="text-slate-500 text-[11px]">Bölge: ${hotelZone}</p>
      </div>

      <div class="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1.5">
        <span class="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">Tur & Zamanlama Bilgileri</span>
        <p class="text-sm font-bold text-slate-950">${activeTour.tourTitle}</p>
        <p class="text-slate-700">📅 Tur Tarihi: <strong>${activeTour.tourDate}</strong></p>
        <p class="text-emerald-700 font-bold">⏰ Lobi Alınış Saati: <span class="text-base">${pickupWindow}</span></p>
        <p class="text-slate-600">🚐 Transfer Aracı: <strong>${vehicle}</strong></p>
        <p class="text-slate-500 text-[11px]">Rehberlik: Türkçe & İngilizce Destekli</p>
      </div>
    </div>

    <!-- Ödeme Durumu & Fiyatlandırma -->
    <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6 flex items-center justify-between text-xs">
      <div>
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Finansal Durum</span>
        <p class="text-sm font-bold text-slate-900">Toplam Tur Tutarı: ${fmtMoney(booking.totalPriceThb)} THB</p>
      </div>
      <div class="text-right">
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Kalan Tahsilat (Rehbere)</span>
        <p class="text-sm font-bold ${booking.remainingAmountThb > 0 ? 'text-amber-700' : 'text-emerald-600'}">
          ${booking.remainingAmountThb > 0 ? `${fmtMoney(booking.remainingAmountThb)} THB` : 'ÖDENDİ (0 THB)'}
        </p>
      </div>
    </div>

    <!-- Saha ve Lobi Kuralları -->
    <div class="p-4 rounded-xl border border-slate-200 space-y-2 mb-6 text-xs text-slate-700 bg-white">
      <h4 class="font-bold text-slate-900 text-xs uppercase flex items-center gap-1.5">
        <span>⚠️</span> Misafir Bilgilendirme ve Lobi Alınış Kuralları
      </h4>
      <ul class="space-y-1 text-[11px] list-disc list-inside leading-relaxed text-slate-600">
        <li><strong>Lobi Karşılama:</strong> Lütfen belirtilen saatte otelinizin ana lobisinde hazır bulununuz. Şoförümüz lobide isminizi veya rezervasyon numaranızı anons edecektir.</li>
        <li><strong>Trafik Toleransı:</strong> Phuket trafiğine bağlı olarak araç alış saatinde &plusmn;10-15 dakikalık esneklik olabilir.</li>
        <li><strong>Yanınızda Bulundurmanız Gerekenler:</strong> Mayo, havlu, güneş kremi, su geçirmez telefon kılıfı ve şapka bulundurmanız önerilir.</li>
        ${activeTour.nationalParkFeeIncluded === false ? '<li class="text-amber-800 font-bold">Milli park harcı fiyata dahil değildir; limanda kişi başı nakit (Baht) ödenir.</li>' : ''}
      </ul>
    </div>

    <!-- QR Kod ve Acente İletişim / Damga -->
    <div class="flex items-center justify-between pt-4 border-t border-slate-200">
      <div class="flex items-center gap-3">
        ${qrDataUrl ? `<img src="${qrDataUrl}" alt="QR Kod" class="w-20 h-20 border border-slate-200 rounded-lg p-1" />` : ''}
        <div class="text-[11px] text-slate-500">
          <p class="font-bold text-slate-800">Dijital Doğrulama QR</p>
          <p>Saha rehberi ve transfer denetimi için geçerlidir.</p>
          <p class="font-mono text-[10px] text-slate-400">${booking.id}</p>
        </div>
      </div>

      <div class="text-right text-[11px] text-slate-600">
        <p class="font-bold text-slate-900 text-xs">Phuket Tatili 7/24 Destek Hattı</p>
        <p>WhatsApp: <strong>+${managerPhone}</strong></p>
        <p>E-posta: <strong>info@phukettatili.com</strong></p>
        <p class="text-[10px] text-slate-400 mt-1">www.phukettatili.com</p>
      </div>
    </div>
  </div>
</body>
</html>`);
    newWin.document.close();
  };

  // WhatsApp ile Gönderme
  const handleSendWhatsApp = () => {
    const cleanPhone = booking.phone.replace(/[^0-9]/g, '');
    const nationalParkWarning =
      activeTour.nationalParkFeeIncluded === false
        ? `\n⚠️ *Önemli:* Millî Park Giriş Ücreti fiyata dahil değildir. Lütfen limanda ödenmek üzere nakit Baht (THB) hazır bulundurunuz.`
        : '';

    const text =
      `🎫 *PHUKET TATİLİ — RESMİ TUR BİNİŞ KARTI*\n` +
      `--------------------------------\n` +
      `📋 Rezervasyon No: *${booking.id}*\n` +
      `👤 Misafir: *${booking.customerName}* (${booking.adultCount} Yetişkin${booking.childCount ? `, ${booking.childCount} Çocuk` : ''})\n\n` +
      `🏝️ Tur: *${activeTour.tourTitle}*\n` +
      `📅 Tarih: *${activeTour.tourDate}*\n` +
      `⏰ Otelden Alınış Saati: *${activeTour.pickupTime}*\n` +
      `🏨 Otel: *${booking.hotel}* ${booking.roomNumber ? `(Oda: ${booking.roomNumber})` : ''}\n` +
      `🚐 Transfer Hattı: *${vehicle}*\n\n` +
      `💰 Toplam Tutar: *${fmtMoney(booking.totalPriceThb)} THB*\n` +
      `💵 Kalan Ödeme: *${booking.remainingAmountThb > 0 ? `${fmtMoney(booking.remainingAmountThb)} THB (Rehbere nakit teslim edilebilir)` : 'Ödendi (0 THB)'}*\n` +
      nationalParkWarning +
      `\n\n📌 *Lütfen Belirtilen Saatte Otelinizin Ana Lobisinde Hazır Bulununuz.* Şoförümüz lobide sizi karşılayacaktır. Harika bir tur dileriz! 🌴🇹🇭`;

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Modal Kutusu */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto animate-in zoom-in-95 duration-200 print:border-none print:shadow-none print:m-0 print:p-0">
        {/* Üst Aksiyon Çubuğu (Yazdırırken Gizlenir) */}
        <div className="print:hidden flex items-center justify-between px-6 py-4 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Dijital Tur Biniş Kartı & Voucher</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSendWhatsApp}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
              title="Misafire WhatsApp ile İlet"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp'a Gönder</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
              title="Yazdır veya PDF Kaydet"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Yazdır / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BİNİŞ KARTI GÖVDESİ (A4/Baskı Uyumlu Tasarım) */}
        {/* ========================================================================= */}
        <div id="printable-boarding-pass" className="p-6 sm:p-8 space-y-6">
          {/* Antet / Header */}
          <div className="flex items-start justify-between border-b-2 border-amber-500/30 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center font-bold text-slate-950 shadow-md">
                <Compass className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-slate-900 dark:text-white">
                  Phuket Tatili
                </h2>
                <p className="text-[11px] uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold">
                  Resmi Tur Biniş Kartı & Voucher
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono font-bold text-sm border border-amber-500/30">
                {booking.id}
              </span>
              <p className="text-[11px] text-slate-500 mt-1">
                Tarih: {activeTour.tourDate}
              </p>
            </div>
          </div>

          {/* Ana Bilgi Tablosu */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
            {/* Sol Kolon: Yolcu ve Transfer Detayları (2 Kolon Genişliğinde) */}
            <div className="sm:col-span-2 space-y-4">
              {/* Misafir Adı */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Misafir / Yolcu</span>
                <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {booking.customerName}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-3">
                  <span>👥 {booking.adultCount} Yetişkin{booking.childCount > 0 ? `, ${booking.childCount} Çocuk` : ''}</span>
                  <span>📞 {booking.phone}</span>
                </div>
              </div>

              {/* Tur ve Alınış Saati */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-amber-500/15 dark:bg-amber-500/20 border-2 border-amber-500/40 p-4 rounded-2xl shadow-sm">
                  <span className="text-[10px] text-amber-800 dark:text-amber-300 uppercase font-black tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-500" />
                    Lobi Alınış Penceresi
                  </span>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-amber-600 dark:text-amber-400 mt-1">
                    {activeTour.pickupTime}
                  </div>
                  <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 mt-1.5 leading-snug">
                    📍 Lütfen kahvaltınızı tamamlayıp otel ana lobisinde hazır bekleyiniz. Şoförümüz resepsiyonda isminizle çağrı yapacaktır.
                  </p>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    (Ada trafiğine bağlı ±10-15 dk esneme payı olabilir)
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 p-4 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                      <Bus className="w-3.5 h-3.5 text-sky-400" />
                      Transfer Hattı
                    </span>
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1 truncate">
                      {vehicle}
                    </div>
                    <span className="text-[10px] text-sky-500 font-semibold">{hotelZone} Bölgesi</span>
                  </div>
                  <div className="text-[10px] text-slate-400 border-t border-slate-200/60 dark:border-slate-700/60 pt-2 mt-2">
                    Klima ve sigortalı VIP transfer aracı.
                  </div>
                </div>
              </div>

              {/* Otel & Tur Bilgisi */}
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Alınış Oteli</span>
                    <p className="font-bold text-slate-900 dark:text-white">{booking.hotel}</p>
                    {booking.roomNumber && (
                      <p className="text-slate-500 text-[11px]">Oda Numarası: {booking.roomNumber}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  <Compass className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Tur Programı</span>
                    <p className="font-bold text-slate-900 dark:text-white">{activeTour.tourTitle}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sağ Kolon: QR Kod ve Ödeme Özeti */}
            <div className="space-y-4 flex flex-col items-center sm:items-stretch">
              {/* QR Kod Kutusu */}
              <div className="bg-white p-4 rounded-2xl border-2 border-slate-900/10 shadow-lg flex flex-col items-center text-center">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`Biniş QR Kodu - ${booking.id}`}
                    className="w-44 h-44 object-contain rounded-xl"
                  />
                ) : (
                  <div className="w-44 h-44 flex items-center justify-center text-xs text-slate-400 bg-slate-100 rounded-xl">
                    QR Üretiliyor...
                  </div>
                )}
                <span className="text-[11px] font-bold text-slate-900 mt-2">
                  Şoföre / Rehbere Gösteriniz
                </span>
                <span className="text-[9px] text-slate-500 font-mono">
                  {qrPayload}
                </span>
              </div>

              {/* Ödeme Özeti */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 text-xs space-y-1.5 w-full">
                <div className="flex justify-between">
                  <span className="text-slate-500">Toplam Tutar:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {fmtMoney(booking.totalPriceThb)} THB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ödenen Kapora:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {fmtMoney(booking.paidAmountThb)} THB
                  </span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-slate-200 dark:border-slate-700 font-bold">
                  <span className="text-slate-700 dark:text-slate-300">Kalan Bakiye:</span>
                  <span className={booking.remainingAmountThb > 0 ? 'text-rose-500' : 'text-emerald-500'}>
                    {booking.remainingAmountThb > 0
                      ? `${fmtMoney(booking.remainingAmountThb)} THB`
                      : '0 THB (Ödendi)'}
                  </span>
                </div>
                {booking.remainingAmountThb > 0 && (
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold pt-1 border-t border-dashed border-slate-200 dark:border-slate-700">
                    ⚠️ {booking.collectionLocation && booking.collectionLocation in COLLECTION_LOCATION_LABELS
                      ? COLLECTION_LOCATION_LABELS[booking.collectionLocation]
                      : 'Otel lobisinde transfer anında nakit ödenecektir.'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Önemli Uyarılar ve Yanınızda Bulunması Gerekenler */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Önemli Hatırlatmalar & Yanınıza Almanız Gerekenler</span>
            </div>
            <ul className="text-slate-600 dark:text-slate-300 space-y-1 list-disc list-inside text-[11px] leading-relaxed">
              <li>Lütfen belirtilen saatten 10 dakika önce otelinizin ana lobisinde hazır bulununuz.</li>
              <li>Yanınızda havlu, güneş kremi, deniz gözlüğü, yedek kıyafet ve su geçirmez kılıf bulundurmanız önerilir.</li>
              {activeTour.nationalParkFeeIncluded === false && (
                <li className="font-bold text-amber-600 dark:text-amber-400">
                  Millî Park Giriş Ücreti limanda nakit ödenir (Kişi başı yaklaşık 400 THB nakit Baht hazır ediniz).
                </li>
              )}
              {booking.specialNotes && (
                <li className="italic text-slate-500 dark:text-slate-400">
                  Özel Not: {booking.specialNotes}
                </li>
              )}
            </ul>
          </div>

          {/* Alt İletişim Bandı */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-emerald-500" />
              <span>7/24 Türkçe Destek & Acil Operasyon: +{managerPhone}</span>
            </div>
            <span className="font-serif italic text-amber-600 dark:text-amber-400">
              Phuket'te Unutulmaz Anılar Dileriz! 🌴
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
