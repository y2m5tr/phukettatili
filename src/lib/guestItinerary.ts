/**
 * Phuket Tatili - Misafir Dijital Tatil Takvimi & Gün Gün Tur Rotası (Smart Itinerary)
 * Misafirin tüm transfer ve turlarını gün gün planlayan, hazırlık kontrol listesi sunan motor.
 */

import type { Booking, } from '../data/adminInitialData';

export interface ItineraryDayItem {
  dayIndex: number;
  date: string;
  dayNameTr: string;
  tourTitle: string;
  pickupTime: string;
  returnTimeEstimated: string;
  hotel: string;
  roomNumber?: string;
  whatToBring: string[];
  importantNotes: string[];
}

export interface GuestItinerary {
  bookingId: string;
  guestName: string;
  phone: string;
  hotel: string;
  roomNumber?: string;
  totalDays: number;
  days: ItineraryDayItem[];
  publicUrl: string;
}

const TURKISH_DAYS = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

/**
 * Tur adına göre yanına alınması gerekenler listesi üretir
 */
export function getTourPackingChecklist(tourTitle: string): string[] {
  const t = tourTitle.toLowerCase();

  if (
    t.includes('phi phi') ||
    t.includes('james bond') ||
    t.includes('similan') ||
    t.includes('coral') ||
    t.includes('surin') ||
    t.includes('tekne') ||
    t.includes('yat') ||
    t.includes('boat')
  ) {
    return [
      'Plaj Havlusu (Otel resepsiyonundan ücretsiz talep edebilirsiniz)',
      'Güneş Gözlüğü & Yüksek Faktörlü Güneş Kremi',
      'Su Geçirmez Telefon Kılıfı & Plaj Çantası',
      'Milli Park Giriş Ücreti için Nakit Baht (Kişi başı 400฿)',
      'Yedek Kuru Kıyafet & Terlik',
    ];
  }

  if (t.includes('fil') || t.includes('elephant')) {
    return [
      'Yedek Kıyafet & İç Çamaşırı (Çamur banyosu ve duş için)',
      'Sivrisinek Kovucu Sprey',
      'Rahat Sandalet veya Su Ayakkabısı',
      'Güneş Şapkası & Havlu',
    ];
  }

  if (t.includes('zipline') || t.includes('hanuman') || t.includes('atv') || t.includes('rafting')) {
    return [
      'Bağcıklı Spor Ayakkabı (Terlikle katılım güvenlik gereği yasaktır!)',
      'Rahat Spor Şort ve Tişört',
      'Sivrisinek Koruyucu Sprey',
      'Aksiyon Kamerası / GoPro (Kask bağlantılı)',
    ];
  }

  if (
    t.includes('carnival magic') ||
    t.includes('fantasea') ||
    t.includes('siam niramit') ||
    t.includes('simon cabaret')
  ) {
    return [
      'Akşam Kıyafeti (Klimalı gösteri salonu için ince hırka/şal önerilir)',
      'Açık Büfe Akşam Yemeği Kuponu (Rehberinizden teslim alınız)',
      'Fotoğraf Makinesi (Tiyatro salonu içinde çekim kurallarına dikkat ediniz)',
    ];
  }

  return [
    'Rahat Yürüyüş Ayakkabısı',
    'Güneş Şapkası & Güneş Gözlüğü',
    'Pasaport Görseli (Telefonda fotoğrafı yeterlidir)',
  ];
}

/**
 * Tur adına göre önemli operasyonel ipuçları
 */
export function getTourImportantNotes(tourTitle: string): string[] {
  const t = tourTitle.toLowerCase();

  if (t.includes('phi phi') || t.includes('similan') || t.includes('tekne')) {
    return [
      'Lütfen alınış saatinden 5 dakika önce otel lobisinde hazır bulununuz.',
      'Sürat teknesinde can yeleği takılması Tayland deniz kanunlarınca zorunludur.',
      'İskelede ücretsiz çay, kahve ve hafif atıştırmalık servisi mevcuttur.',
    ];
  }

  if (t.includes('fil') || t.includes('elephant')) {
    return [
      'Barınakta fillere binilmemekte, etik ortamda besleme ve yıkanma deneyimi sunulmaktadır.',
      'Tesis içinde duş ve soyunma kabinleri bulunmaktadır.',
    ];
  }

  return ['Şoförümüz otel lobisinde adınızın yazılı olduğu tabela ile sizi karşılayacaktır.'];
}

/**
 * Rezervasyondan gün gün tatil ajandasını oluşturur
 */
export function buildGuestItinerary(booking: Booking, baseUrl = 'https://phukettatili.com'): GuestItinerary {
  const rawDays: {
    date: string;
    tourTitle: string;
    pickupTime?: string;
  }[] = [];

  if (booking.tours && booking.tours.length > 0) {
    booking.tours.forEach((t) => {
      rawDays.push({
        date: t.tourDate,
        tourTitle: t.tourTitle,
        pickupTime: t.pickupTime,
      });
    });
  } else {
    rawDays.push({
      date: booking.tourDate,
      tourTitle: booking.tourTitle,
      pickupTime: booking.pickupTime,
    });
  }

  // Tarihe göre sırala
  rawDays.sort((a, b) => (a.date > b.date ? 1 : -1));

  const days: ItineraryDayItem[] = rawDays.map((item, idx) => {
    const d = new Date(item.date);
    const dayNameTr = !isNaN(d.getTime()) ? TURKISH_DAYS[d.getDay()] : 'Günü';

    return {
      dayIndex: idx + 1,
      date: item.date,
      dayNameTr,
      tourTitle: item.tourTitle,
      pickupTime: item.pickupTime || '07:30 - 08:00',
      returnTimeEstimated: '16:30 - 17:30',
      hotel: booking.hotel,
      roomNumber: booking.roomNumber,
      whatToBring: getTourPackingChecklist(item.tourTitle),
      importantNotes: getTourImportantNotes(item.tourTitle),
    };
  });

  return {
    bookingId: booking.id,
    guestName: booking.customerName,
    phone: booking.phone,
    hotel: booking.hotel,
    roomNumber: booking.roomNumber,
    totalDays: days.length,
    days,
    publicUrl: `${baseUrl}/gezi/${booking.id}`,
  };
}

/**
 * Misafire gün gün tatil programını özetleyen WhatsApp mesajı
 */
export function generateItineraryWhatsAppSummary(itinerary: GuestItinerary): string {
  let text = `Merhaba Sayın ${itinerary.guestName},

Phuket tatilinizin tüm tur ve transfer takvimi hazırlandı! 🌴✨

🏨 Konaklama: ${itinerary.hotel}${itinerary.roomNumber ? ` (Oda: ${itinerary.roomNumber})` : ''}
🗓️ Toplam Program: ${itinerary.totalDays} Günlük Gezi Rotası

══════════════════════════════════════
📅 GÜN GÜN TATİL AJANDANIZ:
`;

  itinerary.days.forEach((day) => {
    text += `\n${day.dayIndex}️⃣ *${day.date} (${day.dayNameTr})*
🏝️ *${day.tourTitle}*
⏰ Lobi Alınış: *${day.pickupTime}*
🎒 Yanınıza Alınız: ${day.whatToBring.slice(0, 2).join(', ')}...
`;
  });

  text += `══════════════════════════════════════
📱 *Dijital Gezi Takviminiz & Hazırlık Listesi:*
👉 ${itinerary.publicUrl}

(Turlara özel detaylı hazırlık rehberi, yanınıza almanız gerekenler ve anlık destek bu linkte yer almaktadır).

Harika ve unutulmaz bir Phuket tatili dileriz! 🌊🐠
Phuket Tatili Operasyon Ekibi`;

  return text;
}

/**
 * WhatsApp linki
 */
export function getItineraryWhatsAppUrl(phone?: string, text?: string): string {
  if (!text) return '#';
  const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
  const encodedText = encodeURIComponent(text);
  return cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodedText}` : `https://wa.me/?text=${encodedText}`;
}
