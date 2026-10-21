/**
 * WhatsApp Metin Ayrıştırıcı (Smart WhatsApp Booking Parser)
 *
 * Misafirlerin WhatsApp üzerinden gönderdiği serbest metinli rezervasyon
 * mesajlarını otomatik olarak algılar ve form alanlarına dönüştürür.
 *
 * ÖRNEK MESAJ:
 * "Merhaba, biz 2 yetişkin 1 çocuk, 24 Ekim Phi Phi sürat teknesi turu istiyoruz.
 *  Otelimiz Centara Grand Beach Resort, oda 304. Tel: 0532 123 4567, fiyat 7.200 Baht."
 */

export interface ParsedWhatsAppBooking {
  customerName?: string;
  adultCount?: number;
  childCount?: number;
  tourDate?: string;
  hotel?: string;
  roomNumber?: string;
  phone?: string;
  tourTitle?: string;
  priceThb?: number;
  specialNotes?: string;
}

const MONTH_MAP: Record<string, string> = {
  ocak: '01',
  şubat: '02',
  subat: '02',
  mart: '03',
  nisan: '04',
  mayıs: '05',
  mayis: '05',
  haziran: '06',
  temmuz: '07',
  ağustos: '08',
  agustos: '08',
  eylül: '09',
  eylul: '09',
  ekim: '10',
  kasım: '11',
  kasim: '11',
  aralık: '12',
  aralik: '12',
  january: '01',
  february: '02',
  march: '03',
  april: '04',
  may: '05',
  june: '06',
  july: '07',
  august: '08',
  september: '09',
  october: '10',
  november: '11',
  december: '12',
};

const MONTH_REGEX_PART = Object.keys(MONTH_MAP).join('|');

const COMMON_HOTELS = [
  'Centara Grand',
  'Amari Phuket',
  'The Shore at Katathani',
  'Katathani',
  'Hilton Phuket',
  'Pullman Phuket',
  'Banyan Tree',
  'Marriott',
  'Le Meridien',
  'JW Marriott',
  'Anantara',
  'Mandarava',
  'Grand Mercure',
  'Holiday Inn',
  'Novotel',
  'Crest Resort',
  'SAii Laguna',
  'Dusit Thani',
  'Rosewood',
  'The Slate',
  'Keemala',
  'Trisara',
  'Marina Phuket',
  'Beyond Resort',
  'Diamond Cliff',
];

/**
 * Serbest WhatsApp metnini analiz edip rezervasyon nesnesi üretir.
 */
export function parseWhatsAppBookingText(
  rawText: string,
  availableTours: Array<{ id: string; title: string; priceThb?: number }> = []
): ParsedWhatsAppBooking {
  if (!rawText || typeof rawText !== 'string') return {};

  const text = rawText.trim();
  const lower = text.toLowerCase();
  const result: ParsedWhatsAppBooking = {};

  // 1. Telefon Numarası Tespiti (TR +90, TH +66 veya standart 10-12 hane)
  const phoneMatch = text.match(/(?:\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}|\b05\d{2}[\s-]?\d{3}[\s-]?\d{4}\b|\b\+?66[\s-]?\d{2}[\s-]?\d{3}[\s-]?\d{3,4}\b/);
  if (phoneMatch) {
    result.phone = phoneMatch[0].replace(/[\s-()]/g, '');
  }

  // 2. Kişi Sayısı: Yetişkin ve Çocuk
  // Örn: "2 yetişkin 1 çocuk", "2 yetiskin", "3 kişi", "2 pax", "2 adults 1 child"
  const adultMatch = lower.match(/(\d+)\s*(?:yetişkin|yetiskin|yet|kisi|kişi|adults?|pax|yolcu)/);
  if (adultMatch) {
    result.adultCount = parseInt(adultMatch[1], 10);
  } else {
    // Sadece "X kişi" geçiyorsa
    const personMatch = lower.match(/(\d+)\s*(?:kişi|kisi)/);
    if (personMatch) {
      result.adultCount = parseInt(personMatch[1], 10);
    }
  }

  const childMatch = lower.match(/(\d+)\s*(?:çocuk|cocuk|child(?:ren)?|chd|bebek)/);
  if (childMatch) {
    result.childCount = parseInt(childMatch[1], 10);
  }

  // 3. Tarih Tespiti
  // Örn: "24 Ekim", "24.10.2026", "24/10/2026", "2026-10-24"
  const currentYear = new Date().getFullYear();

  // A) ISO: YYYY-MM-DD
  const isoMatch = text.match(/\b(202\d)-(0[1-9]|1[0-2])-([0-2][0-9]|3[01])\b/);
  if (isoMatch) {
    result.tourDate = isoMatch[0];
  } else {
    // B) Gün AyAdı (Örn: "24 Ekim" veya "24 ekim 2026")
    const monthDateRegex = new RegExp(`\\b([1-9]|[12][0-9]|3[01])\\s+(${MONTH_REGEX_PART})(?:\\s+(202\\d))?\\b`, 'i');
    const textDateMatch = lower.match(monthDateRegex);
    if (textDateMatch && MONTH_MAP[textDateMatch[2]]) {
      const day = textDateMatch[1].padStart(2, '0');
      const month = MONTH_MAP[textDateMatch[2]];
      const year = textDateMatch[3] || String(currentYear);
      result.tourDate = `${year}-${month}-${day}`;
    } else {
      // C) GG.AA.YYYY veya GG/AA/YYYY
      const numericDateMatch = text.match(/\b([0-2]?[0-9]|3[01])[./-](0?[1-9]|1[0-2])[./-]?(202\d)?\b/);
      if (numericDateMatch) {
        const day = numericDateMatch[1].padStart(2, '0');
        const month = numericDateMatch[2].padStart(2, '0');
        const year = numericDateMatch[3] || String(currentYear);
        result.tourDate = `${year}-${month}-${day}`;
      } else if (lower.includes('yarın') || lower.includes('yarin') || lower.includes('tomorrow')) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        result.tourDate = tomorrow.toISOString().split('T')[0];
      } else if (lower.includes('bugün') || lower.includes('bugun') || lower.includes('today')) {
        result.tourDate = new Date().toISOString().split('T')[0];
      }
    }
  }

  // 4. Oda Numarası Tespiti
  // Örn: "oda 304", "oda: 1202", "room 405", "oda no: 204"
  const roomMatch = lower.match(/(?:oda|room)(?:\s*no)?[s:\s-]*([a-z0-9-]+)/i);
  if (roomMatch && roomMatch[1].length <= 8) {
    result.roomNumber = roomMatch[1].toUpperCase();
  }

  // 5. Otel Tespiti
  // A) Bilinen popüler Phuket otelleri
  for (const hotel of COMMON_HOTELS) {
    if (lower.includes(hotel.toLowerCase())) {
      result.hotel = hotel;
      break;
    }
  }

  // B) "otel: X" veya "hotel: X" veya "otelimiz X" kalıpları
  if (!result.hotel) {
    const hotelPattern = text.match(/(?:otelimiz|otel|hotel)[\s:]+([A-Za-zÇĞİÖŞÜçğıöşü0-9 &'-]{3,40})(?:[,\.\r\n]|oda|room|$)/i);
    if (hotelPattern && hotelPattern[1]) {
      result.hotel = hotelPattern[1].trim();
    }
  }

  // 6. Tur Eşleştirme
  if (availableTours.length > 0) {
    for (const tour of availableTours) {
      const titleLower = tour.title.toLowerCase();
      // Anahtar kelimeler (örn: phi phi, james bond, similan, fil, elephant, atv, city, raxa, racha)
      const keywords = titleLower.split(/[\s-]+/).filter((w) => w.length > 3);
      const isMatch =
        lower.includes(titleLower) ||
        keywords.some((k) => lower.includes(k) && !['turu', 'gunluk', 'tam'].includes(k));

      if (isMatch) {
        result.tourTitle = tour.title;
        if (tour.priceThb && !result.priceThb) {
          result.priceThb = tour.priceThb;
        }
        break;
      }
    }
  }

  // Genel anahtar kelime eşleştirmesi (Tur listesi boşsa bile)
  if (!result.tourTitle) {
    if (lower.includes('phi phi') || lower.includes('maya')) {
      result.tourTitle = 'Phi Phi & Maya Bay Sürat Teknesi Turu';
    } else if (lower.includes('james bond') || lower.includes('phang nga')) {
      result.tourTitle = 'James Bond Adası & Phang Nga Kano Turu';
    } else if (lower.includes('fil') || lower.includes('elephant')) {
      result.tourTitle = 'Etik Fil Barınağı & Doğal Yaşam Deneyimi';
    } else if (lower.includes('similan')) {
      result.tourTitle = 'Similan Adaları Erken Çıkış Şnorkel Turu';
    } else if (lower.includes('racha') || lower.includes('coral')) {
      result.tourTitle = 'Racha & Coral Adaları Katamaran Turu';
    }
  }

  // 7. Fiyat / THB Tespiti
  // Örn: "7.200 baht", "7000 thb", "8500 ฿", "fiyat: 9000"
  const priceMatch = lower.match(/(?:fiyat[s:\s]*|toplam[s:\s]*)?([\d.,]+)\s*(?:baht|thb|tl|₺|b\b)/);
  if (priceMatch) {
    const cleanNum = priceMatch[1].replace(/[.,]/g, '');
    const num = parseInt(cleanNum, 10);
    if (num > 100 && num < 1000000) {
      result.priceThb = num;
    }
  }

  // 8. İsim Tespiti
  // "İsim: Ahmet Yılmaz", "Ad: Mehmet Kaya", veya ilk satırdaki 2-3 kelimeli isim
  const nameExplicitMatch = text.match(/(?:[iİıI]sim|ad(?:[ıi])?|misafir|m[üu]şteri|musteri|name)[\s:]+([A-Za-zÇĞİÖŞÜçğıöşü ]{2,35})(?:[,\.\r\n]|$)/iu);
  if (nameExplicitMatch && nameExplicitMatch[1]) {
    result.customerName = nameExplicitMatch[1].trim();
  } else {
    // "Selamlar ben Ahmet Yılmaz" veya "Merhaba ben Caner..."
    const introName = text.match(/(?:ben|ismim|adım)\s+([A-Za-zÇĞİÖŞÜçğıöşü]+[ \t]+[A-Za-zÇĞİÖŞÜçğıöşü]+)/iu);
    if (introName && introName[1]) {
      result.customerName = introName[1].trim();
    }
  }

  return result;
}
