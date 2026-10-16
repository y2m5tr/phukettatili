/**
 * Phuket Tatili - Havalimanı Canlı Uçuş Radarı & Rötar Kalkanı (Flight Sentinel)
 * Phuket Uluslararası Havalimanı (HKT) uçuş sorgulama, rötar takibi ve
 * şoför/misafir otomatik WhatsApp koordinasyonu.
 */

export type FlightStatus = 'on_time' | 'delayed' | 'landed' | 'scheduled' | 'cancelled';

export interface FlightInfo {
  flightNumber: string; // e.g. "TK 172"
  airline: string; // e.g. "Türk Hava Yolları"
  originCity: string; // e.g. "İstanbul (IST)"
  scheduledArrival: string; // e.g. "14:30"
  estimatedArrival: string; // e.g. "15:15"
  delayMinutes: number; // e.g. 45
  status: FlightStatus;
  gate: string; // e.g. "Dış Hatlar Kapı 3 (Gate 3)"
  baggageBelt: string; // e.g. "Bant 4"
  aircraftType?: string; // e.g. "Airbus A350-900"
  lastUpdated: string;
}

// Phuket (HKT) Ana Dış Hat Uçuş Bilgi Tabanı
export const HKT_COMMON_FLIGHTS: Record<string, Partial<FlightInfo>> = {
  'TK 172': {
    airline: 'Türk Hava Yolları (Turkish Airlines)',
    originCity: 'İstanbul (IST)',
    scheduledArrival: '14:30',
    gate: 'Dış Hatlar Gate 3 / 4 (Meeting Point)',
    baggageBelt: 'Bant 3',
    aircraftType: 'Airbus A350-900',
  },
  'TK 173': {
    airline: 'Türk Hava Yolları (Turkish Airlines)',
    originCity: 'İstanbul (IST)',
    scheduledArrival: '18:45',
    gate: 'Dış Hatlar Gate 3',
    baggageBelt: 'Bant 2',
    aircraftType: 'Boeing 787-9',
  },
  'EK 396': {
    airline: 'Emirates',
    originCity: 'Dubai (DXB)',
    scheduledArrival: '12:50',
    gate: 'Dış Hatlar Gate 4',
    baggageBelt: 'Bant 4',
    aircraftType: 'Boeing 777-300ER',
  },
  'QR 840': {
    airline: 'Qatar Airways',
    originCity: 'Doha (DOH)',
    scheduledArrival: '17:10',
    gate: 'Dış Hatlar Gate 3',
    baggageBelt: 'Bant 5',
    aircraftType: 'Boeing 787-8 Dreamliner',
  },
  'TG 921': {
    airline: 'Thai Airways',
    originCity: 'Frankfurt (FRA)',
    scheduledArrival: '07:20',
    gate: 'Dış Hatlar Gate 2',
    baggageBelt: 'Bant 1',
    aircraftType: 'Boeing 777-300',
  },
  'SU 274': {
    airline: 'Aeroflot',
    originCity: 'Moskova (SVO)',
    scheduledArrival: '10:15',
    gate: 'Dış Hatlar Gate 3',
    baggageBelt: 'Bant 4',
    aircraftType: 'Boeing 777-300ER',
  },
  'FD 3025': {
    airline: 'AirAsia (Domestic)',
    originCity: 'Bangkok (DMK)',
    scheduledArrival: '11:40',
    gate: 'İç Hatlar Gate 1',
    baggageBelt: 'İç Hatlar Bant 2',
    aircraftType: 'Airbus A320',
  },
};

/**
 * Uçuş kodunu standart formata getirir (örn: "tk172" -> "TK 172")
 */
export function normalizeFlightNumber(input: string): string {
  if (!input) return '';
  const trimmed = input.toUpperCase().trim();
  const spacedMatch = trimmed.match(/^([A-Z0-9]{2,3})\s+([0-9]{1,4})$/);
  if (spacedMatch) {
    return `${spacedMatch[1]} ${spacedMatch[2]}`;
  }
  const cleaned = trimmed.replace(/[^A-Z0-9]/g, '');
  const match =
    cleaned.match(/^([A-Z]{2,3})([0-9]{1,4})$/) ||
    cleaned.match(/^([A-Z0-9]{2})([0-9]{1,4})$/);
  if (match) {
    return `${match[1]} ${match[2]}`;
  }
  return trimmed;
}

/**
 * Uçuş durumunu getirir (Canlı / Veritabanı simülasyonu)
 */
export function getFlightStatusInfo(flightInput: string, mockDelayMinutes = 0): FlightInfo {
  const norm = normalizeFlightNumber(flightInput);
  const known = HKT_COMMON_FLIGHTS[norm];

  const airline = known?.airline || 'Uluslararası Havayolu';
  const originCity = known?.originCity || 'Phuket Varış (HKT)';
  const scheduledArrival = known?.scheduledArrival || '14:00';
  const gate = known?.gate || 'Dış Hatlar Çıkış Kapısı 3 (Gate 3)';
  const baggageBelt = known?.baggageBelt || 'Bant 3';
  const aircraftType = known?.aircraftType || 'Geniş Gövde Yolcu Uçağı';

  const delayMinutes = mockDelayMinutes;

  let estimatedArrival = scheduledArrival;
  let status: FlightStatus = 'on_time';

  if (delayMinutes > 15) {
    status = 'delayed';
    // Basit saat hesaplama
    const [hStr, mStr] = scheduledArrival.split(':');
    let h = parseInt(hStr, 10);
    let m = parseInt(mStr, 10) + delayMinutes;
    while (m >= 60) {
      m -= 60;
      h = (h + 1) % 24;
    }
    estimatedArrival = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  } else if (delayMinutes < 0) {
    status = 'on_time';
  }

  return {
    flightNumber: norm,
    airline,
    originCity,
    scheduledArrival,
    estimatedArrival,
    delayMinutes,
    status,
    gate,
    baggageBelt,
    aircraftType,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Taylandlı şoföre rötar ve güncellenmiş karşılama saati WhatsApp mesajı
 */
export function generateDriverFlightDelayWhatsApp(params: {
  flight: FlightInfo;
  driverName: string;
  guestName: string;
  vehicleCode: string;
}): string {
  const { flight, driverName, guestName, vehicleCode } = params;

  return `Sawadee khrup Khun ${driverName} 🙏 (Phuket Tatili Operations)

✈️ FLIGHT STATUS UPDATE / แจ้งเตือนเที่ยวบิน:
• Flight No: ${flight.flightNumber} (${flight.airline})
• Guest: ${guestName}
• Vehicle: ${vehicleCode}

${
  flight.delayMinutes > 0
    ? `⚠️ DELAYED / เที่ยวบินล่าช้า: +${flight.delayMinutes} mins!
⏰ Scheduled: ${flight.scheduledArrival}
👉 NEW ESTIMATED ARRIVAL: *${flight.estimatedArrival}*
📍 Meeting Point: ${flight.gate}

กรุณาปรับเวลาไปรับที่สนามบินตามเวลาใหม่ ${flight.estimatedArrival} ครับ (ไม่ต้องรีบไปรอเร็วเกินไป)`
    : `✅ ON TIME / ตรงเวลา
⏰ Arrival: ${flight.scheduledArrival}
📍 Meeting Point: ${flight.gate}`
}

🙏 ขอบคุณมากครับ (Thank you!)`;
}

/**
 * Misafire iniş kapısı ve şoför karşılama WhatsApp mesajı
 */
export function generateGuestLandingWelcomeWhatsApp(params: {
  flight: FlightInfo;
  guestName: string;
  driverName: string;
  driverPhone: string;
  vehiclePlate: string;
  hotelName: string;
}): string {
  const { flight, guestName, driverName, driverPhone, vehiclePlate, hotelName } = params;

  return `Merhaba ${guestName}, Phuket Tatili'ne hoş geldiniz! 🌴🌊

Phuket Uluslararası Havalimanı'na (${flight.flightNumber}) inişiniz için VIP transfer aracımız ve şoförümüz hazırlandı.

📍 Karşılama Noktamız:
Havalimanı bagaj alımından sonra çıkış yapacağınız:
👉 *${flight.gate}* (Dış Hatlar Çıkışı)
👨‍✈️ Şoförünüz: *${driverName}* (${vehiclePlate})
📞 Şoför Tel: ${driverPhone}
🏨 Gideceğiniz Otel: ${hotelName}

Şoförümüz kapıda elinde adınızın yazılı olduğu *"Phuket Tatili - ${guestName}"* tabelası ile sizi tebessümle bekliyor olacaktır.

Bagajınızı alıp çıkışa ulaştığınızda şoförümüzü göremezseniz lütfen bu numaraya yazınız veya şoförünüzü doğrudan arayınız. 
Keyifli bir Phuket tatili dileriz! ✨`;
}

/**
 * WhatsApp URL yardımcısı
 */
export function getFlightWhatsAppUrl(phone?: string, text?: string): string {
  if (!text) return '#';
  const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
  const encodedText = encodeURIComponent(text);
  return cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodedText}` : `https://wa.me/?text=${encodedText}`;
}
