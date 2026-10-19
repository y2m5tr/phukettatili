import type { PickupItem } from './adminFilters';

export type DispatchMessageType = 'pre_tour_reminder' | 'driver_arrived' | 'balance_reminder';

export interface DispatchOptions {
  managerPhone?: string;
  customNote?: string;
}

/**
 * Günlük alınış listesindeki misafir için kişiselleştirilmiş WhatsApp operasyon mesajı üretir.
 */
export function generateGuestReminderMessage(
  item: PickupItem,
  type: DispatchMessageType = 'pre_tour_reminder',
  options?: DispatchOptions
): string {
  const managerPhone = options?.managerPhone || '66828950665';
  const displayPhone = managerPhone.startsWith('+') ? managerPhone : `+${managerPhone}`;
  const paxStr = `${item.adultCount} Yetişkin${item.childCount > 0 ? ` + ${item.childCount} Çocuk` : ''}`;
  const pickupTime = item.pickupTime || '07:30';
  const roomStr = item.roomNumber ? ` (Oda: ${item.roomNumber})` : '';

  if (type === 'driver_arrived') {
    return `🚐 *PHUKET TATİLİ — ARACINIZ OTEL LOBİSİNDE BEKLİYOR* 🚐

Sayın *${item.customerName}*, günaydın!

*${item.assignedVehicle && item.assignedVehicle !== 'Atanmadı' ? item.assignedVehicle : 'VIP Transfer'}* aracımız ve görevlimiz şu an *${item.hotel}* ana lobisine ulaşmıştır ve sizi beklemektedir.

🎫 *Canlı Biletiniz & Alınış Takibi:*
https://phukettatili.com/bilet/${item.bookingId}

Lütfen otel ana lobisine geçiş yaparak aracımıza binebilirsiniz.
Şoförümüzle buluşmada sorun yaşarsanız bize hemen yazabilirsiniz: ${displayPhone}

Keyifli turlar dileriz! 🌴🌊`;
  }

  if (type === 'balance_reminder') {
    return `💰 *PHUKET TATİLİ — TUR SABAHI BAKİYE BİLGİLENDİRMESİ* 💰

Sayın *${item.customerName}*,

*${item.tourTitle}* turunuz için tur sabahı ödenecek kalan tutarınız:
💵 *Kalan Bakiye:* ${item.remainingAmountThb.toLocaleString('en-US')} THB

Lütfen bu tutarı yarın sabah sizi otelinizden alacak şoförümüze veya limandaki Türkçe rehberimize *nakit Baht (THB)* olarak teslim ediniz.

🎫 *Bilet Detayınız:* https://phukettatili.com/bilet/${item.bookingId}
İletişim: ${displayPhone}
Teşekkür eder, iyi tatiller dileriz! 🇹🇭`;
  }

  // pre_tour_reminder (varsayılan)
  return `🌴 *PHUKET TATİLİ — YARINKİ TUR & TRANSFER HATIRLATMASI* 🌴

Sayın *${item.customerName}*, iyi akşamlar!

Yarın katılacağınız *${item.tourTitle}* turumuz için otel transfer detaylarınız aşağıdadır:

📅 *Tarih:* ${item.tourDate}
⏰ *Otel Lobi Alınış Saati:* ${pickupTime}
📍 *Alınış Noktası:* ${item.hotel}${roomStr}
🚐 *Tahsis Edilen Hat:* ${item.assignedVehicle && item.assignedVehicle !== 'Atanmadı' ? item.assignedVehicle : 'VIP Minibüs Transferi'}
👥 *Kişi Sayısı:* ${paxStr}
${
  item.remainingAmountThb > 0
    ? `💵 *Tur Sabahı Ödenecek Kalan Bakiye:* ${item.remainingAmountThb.toLocaleString('en-US')} THB (Nakit Baht)`
    : '✓ *Ödeme Durumu:* Tamamı Ödenmiştir'
}
🎫 *Canlı Biletiniz & Alınış Takibi:* https://phukettatili.com/bilet/${item.bookingId}

⚠️ *Önemli Hatırlatmalar:*
• Lütfen sabah belirtilen saatte otelinizin *ana lobisinde* hazır bulununuz.
• Yanınızda plaj havlusu, güneş kremi, güneş gözlüğü, mayo ve su geçirmez telefon kılıfı bulundurmanız tavsiye edilir.
${options?.customNote ? `• Not: ${options.customNote}\n` : ''}
📞 *7/24 Türkçe Saha Operasyon:* ${displayPhone}
Harika bir gün dileriz! 🇹🇭✨`;
}

/**
 * Misafirin WhatsApp'ına doğrudan gönderme URL'i üretir.
 */
export function getGuestReminderWhatsAppUrl(
  item: PickupItem,
  type: DispatchMessageType = 'pre_tour_reminder',
  options?: DispatchOptions
): string {
  const cleanPhone = (item.phone || '').replace(/[^0-9]/g, '');
  const message = generateGuestReminderMessage(item, type, options);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
