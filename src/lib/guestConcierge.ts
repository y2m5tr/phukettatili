import type { Booking } from '../data/adminInitialData';
import { buildWhatsAppDeepLink } from './whatsappEngine';

export interface ConciergeOptions {
  managerPhone?: string;
  officeName?: string;
  siteUrl?: string;
}

const DEFAULT_MANAGER_PHONE = '66828950665';
const DEFAULT_SITE_URL = 'https://phukettatili.com';

/**
 * Alınış saatini başlangıç ve bitiş olarak 2 net zamana ayırır.
 * Örn: "07:30 - 07:45" -> { start: "07:30", end: "07:45", display: "07:30 - 07:45" }
 * Tek saat girilmişse: "07:30" -> { start: "07:30", end: "07:45", display: "07:30 - 07:45" }
 */
export function parsePickupWindow(rawTime?: string): {
  start: string;
  end: string;
  display: string;
} {
  const fallback = { start: '07:30', end: '07:45', display: '07:30 - 07:45' };
  if (!rawTime) return fallback;

  const parts = rawTime.split('-').map((s) => s.trim());
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return {
      start: parts[0],
      end: parts[1],
      display: `${parts[0]} - ${parts[1]}`,
    };
  }

  // Tek saat ise +15 dakika ekle
  const single = parts[0] || '07:30';
  const timeRegex = /^(\d{1,2}):(\d{2})$/;
  const match = single.match(timeRegex);
  if (!match) return fallback;

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const totalMinutes = hours * 60 + minutes + 15;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMinutes = totalMinutes % 60;
  const endFormatted = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;

  return {
    start: single,
    end: endFormatted,
    display: `${single} - ${endFormatted}`,
  };
}

/**
 * Turdan önceki akşam saat 20:00'de gönderilen Akıllı Lobi & Kahvaltı Kutusu Hatırlatma Mesajı.
 * 2 ayrı saat satırı içerir:
 * 1. Otel Lobi Alınış Aralığı
 * 2. En Geç Lobide Olma Saati
 */
export function generateEveningBreakfastReminder(
  booking: Booking,
  options?: ConciergeOptions
): string {
  const managerPhone = options?.managerPhone || DEFAULT_MANAGER_PHONE;
  const displayPhone = managerPhone.startsWith('+') ? managerPhone : `+${managerPhone}`;
  const siteUrl = options?.siteUrl || DEFAULT_SITE_URL;

  const window = parsePickupWindow(booking.pickupTime);
  const ticketUrl = `${siteUrl}/bilet/${booking.ticketCode || booking.id}`;
  const paxStr = `${booking.adultCount} Yetişkin${
    booking.childCount > 0 ? ` + ${booking.childCount} Çocuk` : ''
  }`;

  return `🌴 *PHUKET TATİLİ — AKŞAM 20:00 TUR & TRANSFER HATIRLATMASI* 🌴

Sayın *${booking.customerName}*, iyi akşamlar!

Yarın katılacağınız *${booking.tourTitle}* turumuz için otel transfer ve buluşma planınız aşağıdadır:

⏰ *1. OTEL LOBİ ALINIŞ ARALIĞI:* *${window.display}*
⏱️ *2. EN GEÇ LOBİDE BULUŞMA SAATİ:* *${window.start}*
*(Minivanımız oteller arasında ring yaptığı için lütfen saat tam ${window.start}'da ana lobide hazır bulununuz.)*

📍 *Alınış Oteli:* ${booking.hotel}${booking.roomNumber ? ` (Oda: ${booking.roomNumber})` : ''}
🚐 *Transfer Aracı:* ${booking.assignedVehicle || 'VIP Klimalı Tur Minibüsü'}
👥 *Kişi Sayısı:* ${paxStr}

🥪 *ÖNEMLİ KAHVALTI KUTUSU (BREAKFAST BOX) HATIRLATMASI:*
Sabah tur transferimiz otel kahvaltı salonu açılmadan önce başladığından, lütfen bu akşam otel resepsiyonunuza uğrayıp veya telefonla arayarak:
👉 *"Yarın sabah için Paket Kahvaltı Kutusu (Breakfast Box)"* hazırlatınız.
Sabah lobiden çıkarken resepsiyondan kahvaltınızı ücretsiz teslim alabilirsiniz.

${
  booking.remainingAmountThb > 0
    ? `💵 *Tur Sabahı Ödenecek Kalan Bakiye:* ${booking.remainingAmountThb.toLocaleString('en-US')} THB (Nakit Baht)\n`
    : '✓ *Ödeme Durumu:* Tur bedeli tamamı ödenmiştir.\n'
}${
  booking.nationalParkFeeIncluded === false
    ? '🏞️ *Millî Park Harcı:* Tayland Kraliyeti liman gişesinde ödenecek kişi başı resmi harç için lütfen yanınızda nakit Baht bulundurunuz.\n'
    : ''
}🎒 *Tura Çıkarken Yanınıza Alınacaklar:*
• Otel plaj havlusu (lobiden isteyebilirsiniz)
• Mayo / şort (üzerinizde giyili gelmeniz önerilir)
• Güneş kremi, şapka & güneş gözlüğü
• Su geçirmez telefon kılıfı
• Pasaport fotoğraflarınız (telefonda olması yeterlidir)

🎫 *Canlı Biletiniz & Alınış Takibi:*
${ticketUrl}

Her türlü sorunuzda 7/24 Türkçe saha ekibimize yazabilirsiniz:
📞 *WhatsApp Saha Destek:* ${displayPhone}

Keyifli ve dinlendirici bir akşam dileriz! 🇹🇭✨`;
}

/**
 * Minivan bölgeye girdiğinde gönderilen "Lobiye Geçiniz" acil bildirim mesajı.
 * 2 saat satırı içerir:
 * 1. Planlanan Alınış Penceresi
 * 2. Tahmini Araç Varış Süresi (~5-10 dk)
 */
export function generateVehicleInZoneAlert(
  booking: Booking,
  zoneName?: string,
  minutesAway: number = 7,
  options?: ConciergeOptions
): string {
  const managerPhone = options?.managerPhone || DEFAULT_MANAGER_PHONE;
  const displayPhone = managerPhone.startsWith('+') ? managerPhone : `+${managerPhone}`;
  const siteUrl = options?.siteUrl || DEFAULT_SITE_URL;

  const window = parsePickupWindow(booking.pickupTime);
  const zone = zoneName || booking.hotelZone || 'bölgeniz';
  const ticketUrl = `${siteUrl}/bilet/${booking.ticketCode || booking.id}`;

  return `🚐 *PHUKET TATİLİ — MİNİVAN BÖLGENİZE GİRDİ / LOBİYE GEÇİNİZ* 🚐

Sayın *${booking.customerName}*, günaydın!

*${booking.assignedVehicle || 'VIP Tur'}* transfer aracımız şu an *${zone}* bölgesine ulaşmıştır.

⏰ *1. Planlanan Alınış Aralığınız:* *${window.display}*
⏱️ *2. Tahmini Lobiye Varış Süresi:* *Yaklaşık ${minutesAway} - 10 Dakika İçinde*

📍 *Buluşma Noktası:* *${booking.hotel}* Ana Lobisi
🥪 Kahvaltı kutunuzu resepsiyondan teslim alarak lütfen ana lobi oturma alanına geçiş yapınız.
Şoförümüz veya rehberimiz elinde isim listeniz ile lobide adınızı anons edecektir.

🎫 *Canlı Biniş Kartınız:* ${ticketUrl}
İletişim & Acil Destek: ${displayPhone}

İyi yolculuklar dileriz! 🌴🌊`;
}

/**
 * Minivan doğrudan otel lobisine yanaştığında gönderilen "Aracınız Lobide Bekliyor" çağrı mesajı.
 */
export function generateLobbyArrivalAlert(
  booking: Booking,
  options?: ConciergeOptions
): string {
  const managerPhone = options?.managerPhone || DEFAULT_MANAGER_PHONE;
  const displayPhone = managerPhone.startsWith('+') ? managerPhone : `+${managerPhone}`;
  const siteUrl = options?.siteUrl || DEFAULT_SITE_URL;

  const window = parsePickupWindow(booking.pickupTime);
  const ticketUrl = `${siteUrl}/bilet/${booking.ticketCode || booking.id}`;

  return `🏨 *PHUKET TATİLİ — ARACINIZ ŞU AN OTEL LOBİSİNDE* 🏨

Sayın *${booking.customerName}*,

*${booking.assignedVehicle || 'VIP Minibüs'}* aracımız şu an *${booking.hotel}* ana kapısında sizi beklemektedir.

⏰ *1. Lobi Alınış Aralığı:* *${window.display}*
⏱️ *2. Hareket Durumu:* *Araç Lobide Hazır Bekliyor*

Diğer misafirlerin transfer saatlerinin ve tekne kalkışının aksamaması için lütfen hemen ana lobiye geçiniz.

🎫 *Biniş Kartı:* ${ticketUrl}
📞 *Hızlı Saha İrtibat:* ${displayPhone}

Görüşmek üzere! 🇹🇭`;
}

/**
 * Misafire concierge mesajını doğrudan wa.me bağlantısı olarak üretir.
 */
export function getConciergeWhatsAppUrl(
  type: 'evening_breakfast' | 'vehicle_in_zone' | 'lobby_arrival',
  booking: Booking,
  zoneName?: string,
  minutesAway?: number,
  options?: ConciergeOptions
): string {
  let text = '';
  switch (type) {
    case 'evening_breakfast':
      text = generateEveningBreakfastReminder(booking, options);
      break;
    case 'vehicle_in_zone':
      text = generateVehicleInZoneAlert(booking, zoneName, minutesAway, options);
      break;
    case 'lobby_arrival':
      text = generateLobbyArrivalAlert(booking, options);
      break;
  }
  return buildWhatsAppDeepLink(booking.phone, text);
}
