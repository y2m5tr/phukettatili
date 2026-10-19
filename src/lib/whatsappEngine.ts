/**
 * Akıllı Otomasyon & WhatsApp Tetikleme Motoru (Aşama 5)
 *
 * Phuket turizm operasyonlarında misafir iletişimini ve saha koordinasyonunu
 * otomatikleştiren motor:
 * 1. T-24h Hatırlatma: Turdan 1 gün önce akşam 19:00 - 21:00 arası otelden alınış,
 *    bilet bağlantısı ve yanına alması gerekenlerin otomatik hatırlatılması.
 * 2. Lobi & Araç Bildirimi: Şoför otele vardığında tek tıkla "Aracınız Lobide Bekliyor".
 * 3. Review Booster (Google / TripAdvisor): Tur bitiminde 5 yıldızlı değerlendirme daveti.
 * 4. Kalan Bakiye & Millî Park Hatırlatması: Tur sabahı nakit Baht gereksinimi.
 */

import type { Booking } from '../data/adminInitialData';
import { DEFAULT_GOOGLE_REVIEW_URL } from './reviewBooster';
import { fmtMoney } from './moneyFormat';

export type WhatsAppTriggerType =
  | 't24_reminder'
  | 'driver_arrived'
  | 'driver_assigned'
  | 'review_booster'
  | 'balance_alert';

export interface WhatsAppNotification {
  id: string;
  bookingId: string;
  customerName: string;
  phone: string;
  cleanPhone: string;
  type: WhatsAppTriggerType;
  title: string;
  tourTitle: string;
  tourDate: string;
  pickupTime: string;
  message: string;
  waUrl: string;
  priority: 'high' | 'normal';
}

export interface WhatsAppEngineOptions {
  managerPhone?: string;
  googleReviewUrl?: string;
}

const DEFAULT_MANAGER_PHONE = '66828950665';

/**
 * Telefon numarasını uluslararası WhatsApp formatına (yalnızca rakamlar) dönüştürür.
 * Başındaki + veya 00 karakterlerini temizler; yerel 0 ile başlıyorsa Türkiye (+90) varsayar.
 */
export function formatWhatsAppPhone(rawPhone: string): string {
  let cleaned = (rawPhone || '').replace(/[^0-9]/g, '');
  if (cleaned.startsWith('00')) {
    cleaned = cleaned.slice(2);
  }
  // Türkiye yerel formatı: 0532xxxxxxx -> 90532xxxxxxx
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = '90' + cleaned.slice(1);
  }
  return cleaned;
}

/**
 * Temiz telefon ve URL-encoded metin ile doğrudan wa.me bağlantısı oluşturur.
 */
export function buildWhatsAppDeepLink(phone: string, text: string): string {
  const clean = formatWhatsAppPhone(phone);
  return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
}

/**
 * Belirtilen tetikleme türüne göre dinamik, profesyonel Türkçe WhatsApp mesajı üretir.
 */
export function generateTriggerMessage(
  type: WhatsAppTriggerType,
  booking: Booking,
  options?: WhatsAppEngineOptions
): string {
  const managerPhone = options?.managerPhone || DEFAULT_MANAGER_PHONE;
  const displayPhone = managerPhone.startsWith('+') ? managerPhone : `+${managerPhone}`;
  const googleReviewUrl = options?.googleReviewUrl || DEFAULT_GOOGLE_REVIEW_URL;

  const paxStr = `${booking.adultCount} Yetişkin${
    booking.childCount > 0 ? ` + ${booking.childCount} Çocuk` : ''
  }`;
  const pickupTime = booking.pickupTime || '07:30';
  const ticketUrl = `https://phukettatili.com/bilet/${booking.ticketCode || booking.id}`;

  switch (type) {
    case 't24_reminder':
      return `🌴 *PHUKET TATİLİ — YARINKİ TUR & TRANSFER HATIRLATMASI* 🌴

Sayın *${booking.customerName}*, iyi akşamlar!

Yarın katılacağınız *${booking.tourTitle}* turumuz için transfer detaylarınız aşağıdadır:

📅 *Tarih:* ${booking.tourDate}
⏰ *Otel Lobi Alınış Saati:* ${pickupTime}
📍 *Alınış Noktası:* ${booking.hotel}${booking.roomNumber ? ` (Oda: ${booking.roomNumber})` : ''}
🚐 *Tahsis Edilen Araç:* ${booking.assignedVehicle || 'VIP Minibüs'}
👥 *Kişi Sayısı:* ${paxStr}
${
  booking.remainingAmountThb > 0
    ? `💵 *Tur Sabahı Ödenecek Bakiye:* ${fmtMoney(booking.remainingAmountThb)} THB (Nakit Baht)`
    : '✓ *Ödeme Durumu:* Tamamı Ödenmiştir'
}
🎫 *Canlı Biletiniz & Alınış Takibi:* ${ticketUrl}

⚠️ *Önemli Hatırlatmalar:*
• Lütfen sabah belirtilen saatte otelinizin *ana lobisinde* hazır bulununuz.
• Yanınızda havlu, güneş kremi, güneş gözlüğü, mayo ve su geçirmez telefon kılıfı bulundurunuz.
${booking.nationalParkFeeIncluded === false ? '• Millî Park giriş harcı limanda resmi gişeye ödenmek üzere nakit Baht gerektirir.\n' : ''}
📞 *7/24 Türkçe Saha Destek:* ${displayPhone}
Harika bir gün dileriz! 🇹🇭✨`;

    case 'driver_arrived':
      return `🚐 *PHUKET TATİLİ — ARACINIZ OTEL LOBİSİNDE BEKLİYOR* 🚐

Sayın *${booking.customerName}*, günaydın!

*${booking.assignedVehicle || 'VIP Transfer'}* aracımız ve görevlimiz şu an *${booking.hotel}* ana lobisine ulaşmıştır ve sizi beklemektedir.

🎫 *Dijital Biniş Kartınız:* ${ticketUrl}
Lütfen otel ana lobisine geçiş yaparak aracımıza binebilirsiniz.
Şoförümüzle buluşmada sorun yaşarsanız bize hemen yazabilirsiniz: ${displayPhone}

Keyifli turlar dileriz! 🌴🌊`;

    case 'driver_assigned':
      return `🚗 *PHUKET TATİLİ — ARAÇ & ŞOFÖR ATAMASI YAPILDI* 🚗

Sayın *${booking.customerName}*,

*${booking.tourDate}* tarihindeki *${booking.tourTitle}* turunuz için saha transfer detayları belirlenmiştir:

🚐 *Araç:* ${booking.assignedVehicle || 'VIP Minibüs'}
👤 *Şoför / Rehber:* ${booking.assignedDriver || 'Saha Görevlisi'}
⏰ *Lobi Alınış Saati:* ${pickupTime}
🎫 *Bilet & Alınış Takibi:* ${ticketUrl}

Herhangi bir sorunuz olursa bize her zaman yazabilirsiniz: ${displayPhone}
İyi tatiller dileriz! 🇹🇭`;

    case 'review_booster':
      return `✨ *PHUKET TATİLİ — GÜNÜNÜZ NASIL GEÇTİ?* ✨

Sayın *${booking.customerName}*, merhaba!

Bugün katıldığınız *${booking.tourTitle}* turumuzun harika geçtiğini umuyoruz. Phuket'teki tatil anılarınıza güzel bir gün ekleyebildiysek ne mutlu bize! 🌴🌊📸

Ekibimizi ve hizmetimizi 1 dakikanızı ayırarak Google Haritalar profilimizde 5 yıldızla değerlendirmek ister misiniz? Yorumunuz hem ekibimize moral olacak hem de yeni gelecek gezginlere ışık tutacaktır:

⭐ *Google 5-Yıldızlı Yorum Bağlantısı:*
${googleReviewUrl}

Phuket'teki sonraki günleriniz için her türlü restoran, transfer veya tur tavsiyesinde bize dilediğiniz zaman yazabilirsiniz:
📞 *WhatsApp:* ${displayPhone}

Harika bir tatil dileriz! 🇹🇭✨`;

    case 'balance_alert':
      return `💰 *PHUKET TATİLİ — BAKİYE BİLGİLENDİRMESİ* 💰

Sayın *${booking.customerName}*,

*${booking.tourTitle}* turunuz için kalan ödemeniz:
💵 *Kalan Tutar:* ${fmtMoney(booking.remainingAmountThb)} THB

Lütfen bu tutarı tur sabahı şoförümüze veya limandaki Türkçe rehberimize *nakit Baht (THB)* olarak teslim ediniz.

Teşekkür eder, keyifli bir gün dileriz! 🇹🇭`;
  }
}

/**
 * Tüm rezervasyonları analiz ederek şu anda gönderilmesi gereken
 * akıllı WhatsApp tetikleme bildirimlerini listeler.
 */
export function getPendingAutomationTriggers(
  bookings: Booking[],
  now: Date = new Date(),
  options?: WhatsAppEngineOptions
): WhatsAppNotification[] {
  const notifications: WhatsAppNotification[] = [];

  const todayStr = now.toISOString().split('T')[0];
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  for (const booking of bookings) {
    if (booking.status === 'cancelled') continue;
    if (!booking.phone) continue;

    const tourDate = booking.tourDate || '';

    // 1. T-24h Hatırlatması (Yarınki turlar ve henüz T-24 gönderilmemiş olanlar)
    if (tourDate === tomorrowStr && !booking.whatsAppReminderSent) {
      const msg = generateTriggerMessage('t24_reminder', booking, options);
      notifications.push({
        id: `t24-${booking.id}`,
        bookingId: booking.id,
        customerName: booking.customerName,
        phone: booking.phone,
        cleanPhone: formatWhatsAppPhone(booking.phone),
        type: 't24_reminder',
        title: 'T-24h Tur & Alınış Hatırlatması',
        tourTitle: booking.tourTitle,
        tourDate: booking.tourDate,
        pickupTime: booking.pickupTime || '07:30',
        message: msg,
        waUrl: buildWhatsAppDeepLink(booking.phone, msg),
        priority: 'high',
      });
    }

    // 2. Bugünkü Turlar — Lobi & Alınış Bildirimi
    if (tourDate === todayStr && booking.pickupStatus !== 'completed') {
      const msg = generateTriggerMessage('driver_arrived', booking, options);
      notifications.push({
        id: `arrived-${booking.id}`,
        bookingId: booking.id,
        customerName: booking.customerName,
        phone: booking.phone,
        cleanPhone: formatWhatsAppPhone(booking.phone),
        type: 'driver_arrived',
        title: 'Aracınız Lobide Bekliyor',
        tourTitle: booking.tourTitle,
        tourDate: booking.tourDate,
        pickupTime: booking.pickupTime || '07:30',
        message: msg,
        waUrl: buildWhatsAppDeepLink(booking.phone, msg),
        priority: booking.pickupStatus === 'picked_up' ? 'normal' : 'high',
      });
    }

    // 3. Review Booster (Bugün veya dün tamamlanan turlar ve henüz yorum istenmemiş olanlar)
    const isCompleted =
      booking.pickupStatus === 'completed' || booking.status === 'completed';
    const isRecent = tourDate === todayStr || tourDate === yesterdayStr;

    if (isCompleted && isRecent && !booking.whatsAppReviewSent) {
      const msg = generateTriggerMessage('review_booster', booking, options);
      notifications.push({
        id: `review-${booking.id}`,
        bookingId: booking.id,
        customerName: booking.customerName,
        phone: booking.phone,
        cleanPhone: formatWhatsAppPhone(booking.phone),
        type: 'review_booster',
        title: 'Google & TripAdvisor 5★ Yorum Daveti',
        tourTitle: booking.tourTitle,
        tourDate: booking.tourDate,
        pickupTime: booking.pickupTime || '07:30',
        message: msg,
        waUrl: buildWhatsAppDeepLink(booking.phone, msg),
        priority: 'normal',
      });
    }

    // 4. Bakiye Uyarısı (Tur tarihi bugün veya yarın olup kalan bakiyesi olanlar)
    if (
      (tourDate === todayStr || tourDate === tomorrowStr) &&
      booking.remainingAmountThb > 0 &&
      booking.paymentStatus !== 'paid'
    ) {
      const msg = generateTriggerMessage('balance_alert', booking, options);
      notifications.push({
        id: `balance-${booking.id}`,
        bookingId: booking.id,
        customerName: booking.customerName,
        phone: booking.phone,
        cleanPhone: formatWhatsAppPhone(booking.phone),
        type: 'balance_alert',
        title: `Kalan Bakiye Uyarısı (${fmtMoney(booking.remainingAmountThb)} THB)`,
        tourTitle: booking.tourTitle,
        tourDate: booking.tourDate,
        pickupTime: booking.pickupTime || '07:30',
        message: msg,
        waUrl: buildWhatsAppDeepLink(booking.phone, msg),
        priority: 'normal',
      });
    }
  }

  // Yüksek önceliklileri önce sırala
  return notifications.sort((a, _b) => (a.priority === 'high' ? -1 : 1));
}

/**
 * Bir bildirimin WhatsApp üzerinden gönderildiğini rezervasyona işler.
 */
export function markNotificationSent(
  booking: Booking,
  type: WhatsAppTriggerType
): Booking {
  const updated = { ...booking };
  updated.lastWhatsAppNotifiedAt = new Date().toISOString();

  if (type === 't24_reminder') {
    updated.whatsAppReminderSent = true;
  } else if (type === 'review_booster') {
    updated.whatsAppReviewSent = true;
  }

  return updated;
}

/**
 * Şoför / Saha Operasyonu için Tayca & İngilizce çift dilli hazır görev kartı üretir.
 */
export function generateDriverPickupJobThai(
  booking: Booking,
  tourIndex?: number,
  driverName?: string
): { message: string; waUrl: string } {
  const activeTour =
    typeof tourIndex === 'number' && booking.tours && booking.tours[tourIndex]
      ? booking.tours[tourIndex]
      : {
          tourTitle: booking.tourTitle,
          tourDate: booking.tourDate,
          pickupTime: booking.pickupTime || '07:30',
          hotel: booking.hotel,
          roomNumber: booking.roomNumber,
        };

  const hotelName = activeTour.hotel || booking.hotel;
  const room = activeTour.roomNumber || booking.roomNumber || '-';
  const pickup = activeTour.pickupTime || booking.pickupTime || '07:30';
  const date = activeTour.tourDate || booking.tourDate;
  const tourName = activeTour.tourTitle || booking.tourTitle;
  const pax = `${booking.adultCount} Adult(s)${booking.childCount > 0 ? ` + ${booking.childCount} Child(ren)` : ''}`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotelName + ', Phuket, Thailand')}`;

  const hasLuggage = booking.hasLuggage || booking.isHotelHop;
  const luggageStr = hasLuggage
    ? `⚠️ มีกระเป๋าเดินทาง (${booking.luggageCount || 2} ใบ / Valiz Var - Luggage in Van)`
    : `ไม่มีสัมภาระใหญ่ (No big luggage)`;

  const msg = `🇹🇭 *ใบงานรับส่งลูกค้า (PHUKET TATILI PICKUP JOB)* 🇹🇭
━━━━━━━━━━━━━━━━━━━━
📅 *วันที่ (Date):* ${date}
⏰ *เวลารับ (Pickup Time):* *${pickup}*
🏨 *โรงแรม (Hotel):* ${hotelName}
🚪 *ห้อง (Room):* ${room}
📍 *พิกัด Google Maps:* ${mapsUrl}
👥 *จำนวน (Pax):* ${pax}
👤 *ชื่อลูกค้า (Guest Name):* ${booking.customerName}
📞 *เบอร์ลูกค้า (Guest Phone):* ${booking.phone || '-'}
🏝️ *ทัวร์ (Tour Program):* ${tourName}
🧳 *สัมภาระ (Luggage):* ${luggageStr}
${driverName ? `🚗 *คนขับ (Driver):* ${driverName}\n` : ''}${booking.specialNotes ? `📝 *หมายเหตุ (Notes):* ${booking.specialNotes}\n` : ''}━━━━━━━━━━━━━━━━━━━━
🚨 *เบอร์ประสานงานฉุกเฉิน (Hotline Ops):* +66 82 895 0665 (WhatsApp / Line)
กรุณาแจ้งศูนย์ทันทีเมื่อถึงล็อบบี้โรงแรม ขอบคุณครับ 🙏`;

  const cleanDriverPhone = booking.assignedDriver ? formatWhatsAppPhone(booking.assignedDriver) : '';
  const waUrl = cleanDriverPhone ? buildWhatsAppDeepLink(cleanDriverPhone, msg) : `https://wa.me/?text=${encodeURIComponent(msg)}`;

  return { message: msg, waUrl };
}

/**
 * Misafir için Türkçe profesyonel lobi bekleme ve tur hatırlatması üretir.
 */
export function generateGuestPickupReminderTurkish(
  booking: Booking,
  tourIndex?: number
): { message: string; waUrl: string } {
  const activeTour =
    typeof tourIndex === 'number' && booking.tours && booking.tours[tourIndex]
      ? booking.tours[tourIndex]
      : {
          tourTitle: booking.tourTitle,
          tourDate: booking.tourDate,
          pickupTime: booking.pickupTime || '07:30',
          hotel: booking.hotel,
          roomNumber: booking.roomNumber,
        };

  const hotelName = activeTour.hotel || booking.hotel;
  const room = activeTour.roomNumber || booking.roomNumber;
  const pickup = activeTour.pickupTime || booking.pickupTime || '07:30';
  const date = activeTour.tourDate || booking.tourDate;
  const tourName = activeTour.tourTitle || booking.tourTitle;
  const pax = `${booking.adultCount} Yetişkin${booking.childCount > 0 ? ` + ${booking.childCount} Çocuk` : ''}`;
  const ticketUrl = `https://phukettatili.com/gezi/${booking.ticketCode || booking.id}`;

  const hasLuggage = booking.hasLuggage || booking.isHotelHop;

  const msg = `🌴 *PHUKET TATİLİ — TUR ALINIŞ BİLGİLENDİRMESİ* 🌴
━━━━━━━━━━━━━━━━━━━━━━━━━━
Sayın *${booking.customerName}*, merhaba!

*${date}* tarihindeki *${tourName}* turunuz için otel alınış detaylarınız kesinleşmiştir:

⏰ *Lobi Bekleme Saati:* *${pickup}*
🏨 *Alınış Oteli:* ${hotelName}${room ? ` (Oda: ${room})` : ''}
👥 *Misafir Sayısı:* ${pax}
${hasLuggage ? `🧳 *Bagaj Durumu:* Otel Değişimi / Araçta Valiz Alanınız Ayrılmıştır (${booking.luggageCount || 2} Valiz)\n` : ''}${
  booking.remainingAmountThb > 0
    ? `💵 *Tur Sabahı Ödenecek Kalan Bakiye:* ${fmtMoney(booking.remainingAmountThb)} THB (Nakit Baht)\n`
    : ''
}
💡 *Önemli Hatırlatmalarımız:*
• Lütfen belirtilen saat aralığında otelinizin *ana lobisinde* hazır bulununuz.
• Transfer şoförümüz veya rehberimiz elinde *"Phuket Tatili"* tabelası veya isminiz ile lobiye gelecektir.
• Havlu, mayo, güneş kremi, şapka ve su geçirmez telefon kılıfınızı yanınıza almayı unutmayınız.
${booking.nationalParkFeeIncluded === false ? '• Millî park koruma harcı için yanınızda nakit Baht bulundurunuz.\n' : ''}
📱 *Canlı Gezi Ajandanız & Biniş Kartınız:*
${ticketUrl}

Harika ve unutulmaz bir gün geçirmenizi dileriz! 🌺🌊
📞 *7/24 Türkçe Operasyon Destek:* +66 82 895 0665`;

  const waUrl = buildWhatsAppDeepLink(booking.phone, msg);
  return { message: msg, waUrl };
}

