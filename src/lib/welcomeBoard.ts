/**
 * VIP Karşılama Tabela Stüdyosu (Welcome Nameboard Studio)
 * Havalimanı (HKT) ve iskele karşılama görevlileri için dijital tablet / baskı isimlik üreticisi.
 */

export type WelcomeBoardTheme = 'luxury_dark' | 'bright_airport' | 'gold_vip' | 'tropical_cyan';

export interface WelcomeBoardConfig {
  guestName: string;
  flightNumber?: string;
  destinationHotel?: string;
  passengerCount?: number;
  driverName?: string;
  theme?: WelcomeBoardTheme;
  greetingLanguage?: 'tr' | 'en' | 'th';
  customNotes?: string;
}

export interface WelcomeBoardThemeDetails {
  id: WelcomeBoardTheme;
  name: string;
  bgClass: string;
  textClass: string;
  accentClass: string;
  borderClass: string;
  badgeClass: string;
}

export const WELCOME_BOARD_THEMES: Record<WelcomeBoardTheme, WelcomeBoardThemeDetails> = {
  luxury_dark: {
    id: 'luxury_dark',
    name: 'Gece Lüksü (Dark Mode)',
    bgClass: 'bg-slate-950 text-white',
    textClass: 'text-white',
    accentClass: 'text-amber-400',
    borderClass: 'border-amber-500/30',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  },
  bright_airport: {
    id: 'bright_airport',
    name: 'Havalimanı Yüksek Görünürlük (Neon Sarı/Siyah)',
    bgClass: 'bg-amber-400 text-slate-950',
    textClass: 'text-slate-950',
    accentClass: 'text-slate-900',
    borderClass: 'border-slate-900/30',
    badgeClass: 'bg-slate-950 text-white border-slate-900',
  },
  gold_vip: {
    id: 'gold_vip',
    name: 'Royal Gold VIP',
    bgClass: 'bg-gradient-to-b from-slate-900 via-slate-950 to-amber-950 text-amber-100',
    textClass: 'text-amber-100',
    accentClass: 'text-amber-300',
    borderClass: 'border-amber-400/50',
    badgeClass: 'bg-amber-400/20 text-amber-200 border-amber-400/50',
  },
  tropical_cyan: {
    id: 'tropical_cyan',
    name: 'Phuket Turkuazı (Tropical Cyan)',
    bgClass: 'bg-slate-950 text-cyan-50',
    textClass: 'text-cyan-50',
    accentClass: 'text-cyan-400',
    borderClass: 'border-cyan-500/40',
    badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
  },
};

export const GREETINGS = {
  tr: {
    title: "Phuket'e Hoş Geldiniz",
    subtitle: 'VIP Transfer & Karşılama Hizmeti',
    flight: 'Uçuş',
    hotel: 'Otel',
    guests: 'Kişi',
    driver: 'Karşılama Görevlisi',
  },
  en: {
    title: 'Welcome to Phuket',
    subtitle: 'VIP Airport Concierge & Transfer',
    flight: 'Flight',
    hotel: 'Hotel',
    guests: 'Guests',
    driver: 'Your Driver',
  },
  th: {
    title: 'ยินดีต้อนรับสู่ภูเก็ต',
    subtitle: 'บริการรับส่งวีไอพี',
    flight: 'เที่ยวบิน',
    hotel: 'โรงแรม',
    guests: 'ผู้โดยสาร',
    driver: 'พนักงานขับรถ',
  },
};

/**
 * İsmi tabela formatında düzenler (büyük harf ve temizleme).
 */
export function formatNameboardGuestName(rawName: string): string {
  const clean = (rawName || '').trim();
  if (!clean) return 'DEĞERLİ MİSAFİRİMİZ';
  return clean.toLocaleUpperCase('tr-TR');
}

/**
 * Karşılama tabelası doğrudan linkini üretir.
 */
export function generateWelcomeBoardUrl(codeOrId: string, theme: WelcomeBoardTheme = 'luxury_dark'): string {
  return `/tabela/${encodeURIComponent(codeOrId)}?theme=${theme}`;
}

/**
 * Şoföre karşılama linkini ileten WhatsApp mesaj metni üretir.
 */
export function generateDriverNameboardWhatsApp(
  driverName: string,
  guestName: string,
  flightNumber: string,
  boardUrl: string
): string {
  const name = formatNameboardGuestName(guestName);
  return (
    `🚐 *PHUKET TATİLİ - VIP HAVALİMANI KARŞILAMA TABELASI*\n\n` +
    `Sawadee krub ${driverName || 'Driver'},\n` +
    `Lütfen havalimanı çıkış kapısında misafirimizi aşağıdaki dijital tabela ile karşılayınız:\n\n` +
    `👤 *Misafir:* ${name}\n` +
    `✈️ *Uçuş:* ${flightNumber || 'TK 172'}\n\n` +
    `📱 *Canlı Tablet/Telefon İsimlik Ekranı:*\n` +
    `https://phukettatili.com${boardUrl}\n\n` +
    `İyi karşılamalar dileriz! 🌴🇹🇭`
  );
}

/**
 * WhatsApp paylaşım URL'i döndürür.
 */
export function getDriverNameboardWhatsAppUrl(
  phone: string,
  driverName: string,
  guestName: string,
  flightNumber: string,
  boardUrl: string
): string {
  const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
  const text = encodeURIComponent(generateDriverNameboardWhatsApp(driverName, guestName, flightNumber, boardUrl));
  return cleanPhone ? `https://wa.me/${cleanPhone}?text=${text}` : `https://wa.me/?text=${text}`;
}
