import { useState } from 'react';
import {
  X,
  Printer,
  Share2,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import type { Booking, TourItem } from '../../data/adminInitialData';

interface TourQuotePdfModalProps {
  /** Rezervasyondan açılıyorsa booking verisi */
  booking?: Booking | null;
  /** Tur kataloğundan açılıyorsa tour verisi */
  tour?: TourItem | null;
  onClose: () => void;
  showToast: (msg: string) => void;
  whatsappNumber?: string;
}

export default function TourQuotePdfModal({
  booking,
  tour,
  onClose,
  showToast,
  whatsappNumber = '66828950665',
}: TourQuotePdfModalProps) {
  // İlk değerleri booking veya tour'dan al
  const initialTitle = booking
    ? booking.tourTitle
    : tour?.title || 'Phuket Premium Ada Turu';

  const initialDate = booking
    ? booking.tourDate
    : new Date().toISOString().split('T')[0];

  const initialAdult = booking ? booking.adultCount : 2;
  const initialChild = booking ? booking.childCount : 0;
  const initialCustomer = booking ? booking.customerName : 'Değerli Misafirimiz / Acente';
  const initialHotel = booking ? booking.hotel : 'Otel Belirtilmedi (Patong / Kata / Karon)';
  const initialPhone = booking ? booking.phone : '';

  const basePricePerAdult = tour?.priceThb || (booking ? Math.round(booking.totalPriceThb / (booking.adultCount || 1)) : 2800);
  const basePricePerChild = Math.round(basePricePerAdult * 0.7);

  // Form State
  const [recipientName, setRecipientName] = useState(initialCustomer);
  const [recipientPhone, setRecipientPhone] = useState(initialPhone);
  const [hotelName, setHotelName] = useState(initialHotel);
  const [tourTitle] = useState(initialTitle);
  const [tourDate] = useState(initialDate);
  const [adultCount, setAdultCount] = useState(initialAdult);
  const [childCount, setChildCount] = useState(initialChild);
  const [adultPriceThb, setAdultPriceThb] = useState(basePricePerAdult);
  const [childPriceThb] = useState(basePricePerChild);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [includeNationalPark, setIncludeNationalPark] = useState<boolean>(
    booking?.nationalParkFeeIncluded ?? false
  );
  const [customNotes] = useState<string>(
    'Teklifimiz rezervasyon onay tarihinden itibaren 7 gün boyunca geçerlidir. Hava muhalefeti durumunda liman başkanlığı kararıyla ücretsiz tarih değişimi veya %100 tam iade garantisi bulunmaktadır.'
  );

  // Fiyat Hesaplama
  const subtotalThb = adultCount * adultPriceThb + childCount * childPriceThb;
  const discountAmountThb = Math.round((subtotalThb * discountPercent) / 100);
  const totalThb = Math.max(0, subtotalThb - discountAmountThb);

  // Yaklaşık döviz kurları (gösterim amaçlı)
  const totalUsd = Math.round(totalThb / 36);
  const totalEur = Math.round(totalThb / 39);
  const totalTry = Math.round(totalThb * 0.95);

  const quoteNo = `QT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyWhatsApp = () => {
    const text =
      `📄 *KURUMSAL TUR FİYAT TEKLİFİ & PROGRAMI*\n` +
      `🏢 *PhuketTatili.com / Siam Horizon Co., Ltd.* (TAT: 34/02847)\n` +
      `📋 *Teklif No:* ${quoteNo}\n` +
      `📅 *Tarih:* ${tourDate}\n` +
      `───────────────────────────────\n` +
      `👤 *Sayın:* ${recipientName}\n` +
      `🏨 *Alınış Noktası:* ${hotelName}\n` +
      `🏝️ *Tur:* ${tourTitle}\n` +
      `👥 *Kişi Sayısı:* ${adultCount} Yetişkin${childCount > 0 ? ` + ${childCount} Çocuk` : ''}\n` +
      `───────────────────────────────\n` +
      `💰 *FİYAT DETAYI:*\n` +
      `• Yetişkin: ${adultCount} x ${adultPriceThb.toLocaleString()} THB\n` +
      (childCount > 0 ? `• Çocuk: ${childCount} x ${childPriceThb.toLocaleString()} THB\n` : '') +
      (discountPercent > 0 ? `• İndirim: %${discountPercent} (-${discountAmountThb.toLocaleString()} THB)\n` : '') +
      `💎 *NET TOPLAM:* *${totalThb.toLocaleString()} THB* (~${totalUsd} USD / ~${totalEur} EUR)\n` +
      `───────────────────────────────\n` +
      `✅ *FİYATA DAHİL OLANLAR:*\n` +
      `• Otel gidiş-dönüş VIP klimalı transferi\n` +
      `• Açık büfe öğle yemeği & taze tropikal meyveler\n` +
      `• Şnorkel maskesi & can yeleği ekipmanı\n` +
      `• TAT Lisanslı Seyahat Sağlık Sigortası\n` +
      `• Profesyonel Türkçe / İngilizce rehberlik\n\n` +
      `⚠️ *FİYATA DAHİL OLMAYANLAR:*\n` +
      `• Millî Park Giriş Harcı (Liman ödemeli nakit 400 THB/Kişi)\n` +
      `• Kişisel harcamalar ve bahşişler\n` +
      `───────────────────────────────\n` +
      `💬 Sorularınız veya kesin rezervasyon için bizimle WhatsApp üzerinden iletişime geçebilirsiniz. İyi tatiller dileriz! 🌴🇹🇭`;

    navigator.clipboard.writeText(text);
    showToast('Teklif metni WhatsApp formatında panoya kopyalandı! 📋');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      {/* Modal Container */}
      <div className="bg-white dark:bg-surface-2 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-4 max-h-[92vh] flex flex-col">
        {/* Header - No-print */}
        <div className="print:hidden p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-brand-primary/20 text-brand-primary flex items-center justify-center">
              <FileText className="w-5 h-5 text-brand-accent" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-serif">
                Kurumsal Fiyat Teklifi & B2B Voucher Motoru
              </h2>
              <p className="text-xs text-slate-400">
                Acente veya misafir için resmi TAT logolu PDF proforma ve teklif çıktısı alın.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyWhatsApp}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp Metnini Kopyala</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Yazdır / PDF Kaydet</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Interactive Editor Controls - No-print */}
        <div className="print:hidden p-4 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-xs">
          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2 uppercase tracking-wider text-[11px]">
            ⚡ Hızlı Teklif Parametrelerini Düzenle:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Müşteri & Telefon:</label>
              <div className="flex gap-1">
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="flex-1 px-2 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                  placeholder="İsim"
                />
                <input
                  type="text"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="w-24 px-2 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px]"
                  placeholder="Telefon"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Otel / Alınış Bölgesi:</label>
              <input
                type="text"
                value={hotelName}
                onChange={(e) => setHotelName(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Yetişkin Pax & Fiyat:</label>
              <div className="flex gap-1">
                <input
                  type="number"
                  min="1"
                  value={adultCount}
                  onChange={(e) => setAdultCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-14 px-2 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-center"
                />
                <input
                  type="number"
                  step="100"
                  value={adultPriceThb}
                  onChange={(e) => setAdultPriceThb(parseInt(e.target.value) || 0)}
                  className="flex-1 px-2 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-right"
                  placeholder="THB"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">İndirim & Millî Park:</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Math.min(50, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-16 px-2 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-center"
                  placeholder="%"
                />
                <label className="flex items-center gap-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeNationalPark}
                    onChange={(e) => setIncludeNationalPark(e.target.checked)}
                    className="rounded text-brand-primary"
                  />
                  <span>Park Dahil</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Printable Paper Canvas - Styled for standard A4 sheet */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-white text-slate-900 print:p-0 print:m-0 print:overflow-visible">
          {/* Print Letterhead / Header */}
          <div className="border-b-2 border-slate-900 pb-5 mb-6 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-slate-950 font-serif">
                  PHUKET<span className="text-amber-500">TATİLİ</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-slate-950 text-white uppercase">
                  DMC THAILAND
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-600 mt-1">
                Siam Horizon Travel Co., Ltd.
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                🇹🇭 TAT Tourism License: <strong>34/02847</strong> (Ministry of Tourism & Sports)
              </p>
              <p className="text-[11px] text-slate-500">
                88/12 Moo 2, Koh Kaew, Muang, Phuket 83000 Thailand
              </p>
            </div>

            <div className="text-right">
              <div className="inline-block bg-slate-100 rounded-xl px-3 py-1.5 border border-slate-300">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Resmi Teklif No</span>
                <span className="text-sm font-black font-mono text-slate-900">{quoteNo}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Düzenlenme: {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <p className="text-[11px] text-slate-500">
                Geçerlilik: 7 Gün
              </p>
            </div>
          </div>

          {/* Recipient & Tour Meta Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Teklif Sunulan Misafir / Acente:</span>
              <p className="font-bold text-sm text-slate-900">{recipientName}</p>
              <p className="text-slate-600 mt-0.5">🏨 Otel: {hotelName}</p>
              {recipientPhone && <p className="text-slate-600">📞 İletişim: {recipientPhone}</p>}
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Tur & Tarih Bilgisi:</span>
              <p className="font-bold text-sm text-slate-900">{tourTitle}</p>
              <p className="text-slate-600 mt-0.5">📅 Planlanan Tur Tarihi: <strong>{tourDate}</strong></p>
              <p className="text-slate-600">
                👥 Toplam Katılımcı: <strong>{adultCount} Yetişkin{childCount > 0 ? ` + ${childCount} Çocuk` : ''}</strong>
              </p>
            </div>
          </div>

          {/* Tour Schedule & Highlights Table */}
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-brand-primary" />
              <span>Tur İntikal & Program Akışı</span>
            </h4>
            <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 w-28">Saat</th>
                    <th className="py-2.5 px-3">Aşama & Program Detayı</th>
                    <th className="py-2.5 px-3 w-40">Konum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2 px-3 font-mono font-bold text-slate-700">07:15 - 07:45</td>
                    <td className="py-2 px-3">Otel lobisinden klimalı VIP transfer aracı ile alınış</td>
                    <td className="py-2 px-3 text-slate-500">{hotelName}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-mono font-bold text-slate-700">08:30 - 09:00</td>
                    <td className="py-2 px-3">Marina iskelesine varış, çay/kahve ikramı & güvenlik brifingi</td>
                    <td className="py-2 px-3 text-slate-500">Royal Phuket Marina</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-mono font-bold text-slate-700">09:15 - 12:30</td>
                    <td className="py-2 px-3">Adalara hareket, kristal koylarda şnorkel & yüzme molaları, lagün keşfi</td>
                    <td className="py-2 px-3 text-slate-500">Milli Park Adaları</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-mono font-bold text-slate-700">12:30 - 13:45</td>
                    <td className="py-2 px-3">Ada sahil restoranında açık büfe öğle yemeği ve serbest zaman</td>
                    <td className="py-2 px-3 text-slate-500">Sahil Restoranı</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-mono font-bold text-slate-700">14:00 - 16:00</td>
                    <td className="py-2 px-3">İkinci yüzme/şnorkel koyu veya kano gezisi, tropikal meyve ikramı</td>
                    <td className="py-2 px-3 text-slate-500">Mercan Resifleri</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-mono font-bold text-slate-700">17:00 - 17:45</td>
                    <td className="py-2 px-3">Phuket iskelesine dönüş ve misafirlerin otellerine transferi</td>
                    <td className="py-2 px-3 text-slate-500">Otel Dönüş</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing & Inclusions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Inclusions & Exclusions */}
            <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50/50 text-xs flex flex-col justify-between">
              <div>
                <span className="font-bold text-emerald-800 block mb-2 flex items-center gap-1.5 text-xs uppercase tracking-wide">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Fiyata Dahil Olan Hizmetler
                </span>
                <ul className="space-y-1.5 text-slate-700">
                  <li className="flex items-center gap-2">✓ Klimalı VIP araçla otel gidiş-dönüş transferi</li>
                  <li className="flex items-center gap-2">✓ Açık büfe öğle yemeği & sınırsız meşrubat / taze meyve</li>
                  <li className="flex items-center gap-2">✓ Şnorkel maskesi, şnorkel tüpü & can yeleği</li>
                  <li className="flex items-center gap-2">✓ Lisanslı Türkçe veya İngilizce profesyonel rehber</li>
                  <li className="flex items-center gap-2">✓ Tayland Turizm Bakanlığı (TAT) onaylı seyahat sigortası</li>
                  {includeNationalPark && (
                    <li className="flex items-center gap-2 font-semibold text-emerald-800">✓ Millî Park Giriş Harcı (Dahildir)</li>
                  )}
                </ul>

                <span className="font-bold text-rose-800 block mt-4 mb-2 flex items-center gap-1.5 text-xs uppercase tracking-wide">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  Fiyata Dahil Olmayanlar
                </span>
                <ul className="space-y-1.5 text-slate-700">
                  {!includeNationalPark && (
                    <li className="flex items-center gap-2">✗ Millî Park Giriş Harcı (Kişi başı 400 THB - limanda ödenir)</li>
                  )}
                  <li className="flex items-center gap-2">✗ Kişisel harcamalar & hatıra alışverişleri</li>
                  <li className="flex items-center gap-2">✗ Mürettebat ve şoför bahşişleri (İsteğe bağlı)</li>
                </ul>
              </div>
            </div>

            {/* Price Table Breakdown */}
            <div className="rounded-2xl border-2 border-slate-900 p-4 bg-slate-50 text-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  Fiyatlandırma Özeti (THB)
                </span>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-1 border-b border-slate-200">
                    <span className="text-slate-600">Yetişkin ({adultCount} Kişi x {adultPriceThb.toLocaleString()} THB)</span>
                    <span className="font-semibold text-slate-900">{(adultCount * adultPriceThb).toLocaleString()} THB</span>
                  </div>

                  {childCount > 0 && (
                    <div className="flex justify-between items-center py-1 border-b border-slate-200">
                      <span className="text-slate-600">Çocuk ({childCount} Kişi x {childPriceThb.toLocaleString()} THB)</span>
                      <span className="font-semibold text-slate-900">{(childCount * childPriceThb).toLocaleString()} THB</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-1 text-slate-500">
                    <span>Ara Toplam</span>
                    <span className="font-medium">{subtotalThb.toLocaleString()} THB</span>
                  </div>

                  {discountPercent > 0 && (
                    <div className="flex justify-between items-center py-1 text-emerald-600 font-semibold">
                      <span>Özel Kampanya İndirimi (%{discountPercent})</span>
                      <span>-{discountAmountThb.toLocaleString()} THB</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Grand Total Highlight */}
              <div className="mt-4 pt-3 border-t-2 border-slate-900 flex items-end justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Ödenecek Net Tutar</span>
                  <div className="text-2xl font-black text-slate-950 font-serif">
                    {totalThb.toLocaleString()} <span className="text-sm font-sans font-bold">THB</span>
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-500 font-mono">
                  <div>≈ {totalUsd.toLocaleString()} USD</div>
                  <div>≈ {totalEur.toLocaleString()} EUR</div>
                  <div>≈ {totalTry.toLocaleString()} TL</div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes & Guarantee Footer */}
          <div className="border-t border-slate-200 pt-4 text-[11px] text-slate-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="max-w-xl">
              <p className="font-semibold text-slate-700">🇹🇭 Güvence ve Rezervasyon Notu:</p>
              <p className="mt-0.5">{customNotes}</p>
            </div>

            <div className="text-right shrink-0">
              <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs justify-end">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>TAT Lisanslı Resmi Acente</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Phuket Tatili Operasyon Merkezi</p>
              <p className="text-[10px] text-slate-400 font-mono">WhatsApp: +{whatsappNumber}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
