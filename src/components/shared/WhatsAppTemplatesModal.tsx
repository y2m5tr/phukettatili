import { useState } from 'react';
import {
  X,
  MessageCircle,
  Copy,
  Check,
  Send,
} from 'lucide-react';
import { type Booking, generateSupplierBookingOrder } from '../../data/adminInitialData';
import {
  generateEveningBreakfastReminder,
  generateVehicleInZoneAlert,
} from '../../lib/guestConcierge';
import { generate1830ReviewInviteMessage } from '../../lib/reviewBooster';

export type TemplateId =
  | 'concierge_evening_breakfast'
  | 'concierge_vehicle_in_zone'
  | 'pre_tour_reminder'
  | 'driver_arrived'
  | 'balance_reminder'
  | 'post_tour_review'
  | 'park_fee_notice'
  | 'checkin_request'
  | 'supplier_order'
  | 'weather_reschedule'
  | 'cross_sell_discount';

interface Props {
  booking: Booking;
  managerPhone?: string;
  defaultTemplate?: TemplateId;
  onClose: () => void;
}

export default function WhatsAppTemplatesModal({
  booking,
  managerPhone = '66828950665',
  defaultTemplate = 'pre_tour_reminder',
  onClose,
}: Props) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>(defaultTemplate);
  const [copied, setCopied] = useState<boolean>(false);

  // Dinamik Metin Üretimi
  const generateTemplateText = (tpl: TemplateId): string => {
    const paxStr = `${booking.adultCount} Yetişkin${
      booking.childCount > 0 ? ` + ${booking.childCount} Çocuk` : ''
    }`;
    const pickupTime = booking.pickupTime || '07:30';

    const displayPhone = managerPhone.startsWith('+') ? managerPhone : `+${managerPhone}`;

    switch (tpl) {
      case 'concierge_evening_breakfast':
        return generateEveningBreakfastReminder(booking, { managerPhone });

      case 'concierge_vehicle_in_zone':
        return generateVehicleInZoneAlert(booking, booking.hotelZone || 'bölgeniz', 8, { managerPhone });

      case 'pre_tour_reminder':
        return `🌴 *PHUKET TATİLİ — TUR & TRANSFER HATIRLATMASI* 🌴

Sayın *${booking.customerName}*, iyi akşamlar!

Yarın katılacağınız *${booking.tourTitle}* turumuz için transfer detaylarınız aşağıdadır:

📅 *Tarih:* ${booking.tourDate}
⏰ *Otel Lobi Alınış Saati:* ${pickupTime}
📍 *Alınış Noktası:* ${booking.hotel}${booking.roomNumber ? ` (Oda: ${booking.roomNumber})` : ''}
🚐 *Tahsis Edilen Hat:* ${booking.assignedVehicle || 'VIP Minibüs'}
👥 *Kişi Sayısı:* ${paxStr}
${booking.remainingAmountThb > 0 ? `💵 *Tur Sabahı Ödenecek Kalan Bakiye:* ${booking.remainingAmountThb.toLocaleString()} THB (Nakit Baht)` : '✓ *Ödeme Durumu:* Tamamı Ödenmiştir'}
🎫 *Canlı Biletiniz & Alınış Takibi:* https://phukettatili.com/bilet/${booking.id}

⚠️ *Önemli Hatırlatmalar:*
• Lütfen sabah belirtilen saatte otelinizin *ana lobisinde* hazır bulununuz.
• Yanınızda havlu, güneş kremi, güneş gözlüğü, mayo ve su geçirmez telefon kılıfı bulundurmanız tavsiye edilir.
${booking.nationalParkFeeIncluded === false ? '• Millî Park giriş harcı limanda resmi gişeye ödenmek üzere nakit Baht gerektirir.\n' : ''}
📞 *7/24 Türkçe Saha Operasyon:* ${displayPhone}
Harika bir gün dileriz! 🇹🇭✨`;

      case 'driver_arrived':
        return `🚐 *PHUKET TATİLİ — ARACINIZ OTEL LOBİSİNDE BEKLİYOR* 🚐

Sayın *${booking.customerName}*, günaydın!

*${booking.assignedVehicle || 'VIP Transfer'}* aracımız ve görevlimiz şu an *${booking.hotel}* ana lobisine ulaşmıştır ve sizi beklemektedir.

🎫 *Dijital Biniş Kartınız:* https://phukettatili.com/bilet/${booking.id}
Lütfen otel ana lobisine geçiş yaparak aracımıza binebilirsiniz.
Şoförümüzle buluşmada sorun yaşarsanız bize hemen yazabilirsiniz: ${displayPhone}

Keyifli turlar dileriz! 🌴🌊`;

      case 'balance_reminder':
        return `💰 *PHUKET TATİLİ — BAKİYE BİLGİLENDİRMESİ* 💰

Sayın *${booking.customerName}*,

*${booking.tourTitle}* turunuz için kalan ödemeniz:
💵 *Kalan Tutar:* ${booking.remainingAmountThb.toLocaleString()} THB

Lütfen bu tutarı tur sabahı şoförümüze veya limandaki Türkçe rehberimize *nakit Baht (THB)* olarak teslim ediniz.

Teşekkür eder, iyi tatiller dileriz! 🇹🇭`;

      case 'park_fee_notice':
        return `🏞️ *PHUKET TATİLİ — MİLLÎ PARK HARCI BİLGİLENDİRMESİ* 🏞️

Sayın *${booking.customerName}*,

Katılacağınız *${booking.tourTitle}* turu Tayland Kraliyeti Deniz Millî Parkı sınırları içerisindedir.
Fiyata dahil olmayan millî park giriş ücreti limanda resmi görevlilere ödenmek üzere kişi başı nakit alınmaktadır.

Lütfen yanınızda kişi başı nakit Baht (THB) hazır bulundurmayı unutmayınız.
Keyifli bir gün dileriz! 🌊`;

      case 'post_tour_review':
        return generate1830ReviewInviteMessage(booking, { managerPhone });

      case 'checkin_request':
        return `🛂 *PHUKET TATİLİ — TAYLAND DENİZ POLİSİ & LİMAN CHECK-IN* 🛂

Sayın *${booking.customerName}*, merhaba!

*${booking.tourTitle}* turunuz için Tayland Kraliyeti Deniz Liman Başkanlığı zorunlu yolcu sigorta manifestosu hazırlanmaktadır.

Tur sabahı limanda pasaport sırası beklememek ve doğrudan teknenize geçebilmek için lütfen aşağıdaki güvenli bilet portalınızdan pasaport bilgilerinizi doldurunuz:

🎫 *Online Check-In & Bilet Linkiniz:*
https://phukettatili.com/bilet/${booking.id}

(Formda ad-soyad, pasaport no ve vejetaryen/özel yemek tercihlerinizi 1 dakikada kaydedebilirsiniz.)

Herhangi bir sorunuz olursa buradayız: ${displayPhone}
İyi tatiller dileriz! 🌴🌊`;

      case 'supplier_order':
        return generateSupplierBookingOrder(booking);

      case 'weather_reschedule':
        return `🌊 *PHUKET TATİLİ — HAVA DURUMU & TUR ERTELEME BİLGİLENDİRMESİ* 🌊

Sayın *${booking.customerName}*,

Bugün için planlanan *${booking.tourTitle}* turumuz, Andaman Denizi'ndeki olumsuz hava koşulları ve Tayland Deniz Liman Başkanlığı fırtına uyarısı nedeniyle misafirlerimizin güvenliği için geçici olarak ertelenmiştir.

🎫 *Güncel Biletiniz & Yeni Alınış Takibi:*
https://phukettatili.com/bilet/${booking.id}

Yeni tur tarihinizi belirlemek, alternatif tur seçmek veya kesintisiz iade almak için lütfen bize buradan yazınız.

Güvenliğiniz bizim için her şeyden önemlidir. Anlayışınız için teşekkür ederiz! 🙏🇹🇭`;

      case 'cross_sell_discount':
        return `🎁 *PHUKET TATİLİ — %10 İKİNCİ TUR & VIP MASAJ İNDİRİMİ* 🎁

Sayın *${booking.customerName}*, iyi akşamlar!

Bugünkü turumuzun ardından Phuket tatilinizin devamında değerlendirebileceğiniz *%10 özel misafir indirimi* tanımladık!

🔥 *Öne Çıkan Diğer Deneyimlerimiz:*
• James Bond Adası & Kano Safarisi
• Fil Besleme & Etik Koruma Alanı
• Özel Sürat Teknesi & VIP Katamaran Kiralama
• Havalimanı VIP Transfer Hizmeti

Tarihlerinizi planlamak için bize WhatsApp'tan dilediğiniz zaman yazabilirsiniz: ${displayPhone}
Keyifli bir tatil geçirmenizi dileriz! ✨🇹🇭`;

      default:
        return '';
    }
  };

  const [customText, setCustomText] = useState<string>(generateTemplateText(defaultTemplate));

  const handleSelectTemplate = (tpl: TemplateId) => {
    setSelectedTemplate(tpl);
    setCustomText(generateTemplateText(tpl));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(customText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendWhatsApp = () => {
    const cleanPhone = booking.phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(customText)}`, '_blank');
  };

  const templatesList: { id: TemplateId; label: string; icon: string; desc: string }[] = [
    {
      id: 'concierge_evening_breakfast',
      label: '🌙 Akşam 20:00 Hatırlatması & Kahvaltı Kutusu',
      icon: '🥪',
      desc: '2 ayrı saat satırlı (Alınış Penceresi + Lobide Olma Saati) ve resepsiyondan kahvaltı kutusu (breakfast box) uyarısı.',
    },
    {
      id: 'concierge_vehicle_in_zone',
      label: '🚐 Minivan Bölgeye Girdi (Lobiye Geçiniz)',
      icon: '⚡',
      desc: 'Minivan bölgeye ulaştığında 2 saat satırlı acil lobi çağrısı gönderir.',
    },
    {
      id: 'pre_tour_reminder',
      label: '1 Gün Önce Alınış Hatırlatması',
      icon: '📅',
      desc: 'Saat 20:00 civarı misafire tur saati, otel lobisi ve yanına alması gerekenleri hatırlatır.',
    },
    {
      id: 'checkin_request',
      label: 'Pasaport & Online Check-In İsteği',
      icon: '🛂',
      desc: 'Deniz Polisi liman manifestosu için pasaport ve yemek tercihi doldurma linki.',
    },
    {
      id: 'supplier_order',
      label: 'Tedarikçi Tur Siparişi (İngilizce)',
      icon: '🚢',
      desc: 'Tekne firmasına resmi İngilizce Pax, Otel, Alış Saati ve Ref rezervasyon formatı.',
    },
    {
      id: 'weather_reschedule',
      label: 'Hava Muhalefeti & Erteleme Uyarısı',
      icon: '🌊',
      desc: 'Fırtına veya liman kapanmasında tur erteleme ve bilet linki bildirimi.',
    },
    {
      id: 'driver_arrived',
      label: 'Şoför Lobide Bekliyor Bildirimi',
      icon: '🚐',
      desc: 'Tur sabahı araç otele vardığında misafire lobide hazır bulunmasını bildirir.',
    },
    {
      id: 'balance_reminder',
      label: 'Nakit Bakiye Hatırlatması',
      icon: '💵',
      desc: 'Tur sabahı nakit Baht hazırlaması için kalan tutarı belirtir.',
    },
    {
      id: 'park_fee_notice',
      label: 'Millî Park Harç Uyarısı',
      icon: '🏞️',
      desc: 'Milli park gişesi için nakit Baht hatırlatması yapar.',
    },
    {
      id: 'post_tour_review',
      label: 'Tur Sonu Teşekkür & Google Yorumu',
      icon: '⭐',
      desc: 'Tur sonrası memnuniyet teyidi ve Google Maps yorum daveti.',
    },
    {
      id: 'cross_sell_discount',
      label: 'İkinci Tur %10 İndirim Teklifi',
      icon: '🎁',
      desc: 'Tatilin devamı için yeni turlara ve VIP transferlere çapraz satış teklifi.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Başlık Çubuğu */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">
                WhatsApp Otomasyonu & Şablon Motoru
              </h3>
              <p className="text-[11px] text-emerald-100 font-medium">
                Misafir: <span className="font-bold text-white">{booking.customerName}</span> ({booking.phone})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-100 hover:text-white rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gövde */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Şablon Seçici Haplar */}
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 block">
              Gönderilecek Mesaj Şablonu:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {templatesList.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleSelectTemplate(tpl.id)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    selectedTemplate === tpl.id
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <span>{tpl.icon}</span>
                    <span>{tpl.label}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    {tpl.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Düzenlenebilir Mesaj Alanı */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
                Mesaj Önizleme (Göndermeden Önce Düzenleyebilirsiniz):
              </label>
              <span className="text-[10px] font-mono text-slate-400">
                {customText.length} karakter
              </span>
            </div>
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              rows={11}
              className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 leading-relaxed resize-none"
            />
          </div>
        </div>

        {/* Alt Aksiyon Çubuğu */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors shadow-2xs"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-600">Panoya Kopyalandı!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-500" />
                <span>Metni Kopyala</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-xs font-bold"
            >
              Vazgeç
            </button>
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-98 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>WhatsApp ile Gönder ({booking.phone})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
