/**
 * Phuket Tatili - Misafir Özel İhtiyaç & Medikal Hatırlatıcı (Allergy & Diet Sentinel)
 * Tekne turları ve transferlerde alerji, helal yemek, hamilelik ve özel medikal durumların
 * tekne kaptanı ve yemek tedarikçisine brifing olarak iletilmesi protokolü.
 */

import type { Booking, } from '../data/adminInitialData';

export type DietaryCategory =
  | 'halal'
  | 'vegetarian'
  | 'vegan'
  | 'seafood_allergy'
  | 'nut_allergy'
  | 'pregnant'
  | 'motion_sickness'
  | 'mobility'
  | 'child_infant'
  | 'other';

export interface CategoryMeta {
  label: string;
  shortLabel: string;
  icon: string;
  badgeClass: string;
  safetyNote?: string;
}

export const DIETARY_CATEGORIES: Record<DietaryCategory, CategoryMeta> = {
  halal: {
    label: 'Helal Menü (حلال)',
    shortLabel: 'Helal',
    icon: '☪️',
    badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20',
    safetyNote: 'Yemek kutusunda helal sertifikalı tavuk/sebze talep ediliyor.',
  },
  seafood_allergy: {
    label: 'Deniz Ürünü Alerjisi',
    shortLabel: 'Deniz Ürünü Alerji',
    icon: '🦐⚠️',
    badgeClass: 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20 font-bold',
    safetyNote: 'KESİNLİKLE karides, kalamar, balık sosu (nam pla) temas ettirilmemelidir!',
  },
  pregnant: {
    label: 'Hamile Misafir (Özel Koltuk)',
    shortLabel: 'Hamile (Pruva Yasağı)',
    icon: '🤰⚠️',
    badgeClass: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 font-extrabold',
    safetyNote: 'HAYATİ EMNİYET: Sürat teknesinde kesinlikle burun (pruva) koltuğuna oturtulamaz! Yalnızca arka korumalı oturma grubuna alınmalıdır.',
  },
  nut_allergy: {
    label: 'Fıstık / Kuruyemiş Alerjisi',
    shortLabel: 'Fıstık Alerji',
    icon: '🥜⚠️',
    badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-bold',
    safetyNote: 'Fıstık, yer fıstığı yağı ve ezmesi içeren soslardan kaçınılmalıdır.',
  },
  motion_sickness: {
    label: 'Deniz Tutması / Mide Hassasiyeti',
    shortLabel: 'Deniz Tutması',
    icon: '🌊🤢',
    badgeClass: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20',
    safetyNote: 'Teknede orta veya arka bölüme oturtulmalı; hareket hapı önerilmelidir.',
  },
  vegetarian: {
    label: 'Vejetaryen Menü',
    shortLabel: 'Vejetaryen',
    icon: '🌱',
    badgeClass: 'bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20',
    safetyNote: 'Et ve tavuksuz, tofu/sebze ağırlıklı menü.',
  },
  vegan: {
    label: 'Vegan Menü',
    shortLabel: 'Vegan',
    icon: '🥗',
    badgeClass: 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/20',
    safetyNote: 'Hiçbir hayvansal ürün (yumurta, süt, balık sosu dahil) içermeyen menü.',
  },
  mobility: {
    label: 'Hareket Kısıtı / Tekerlekli Sandalye',
    shortLabel: 'Engelli Desteği',
    icon: '♿',
    badgeClass: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20',
    safetyNote: 'İskele iniş-binişlerinde rampa ve personel refakati gereklidir.',
  },
  child_infant: {
    label: 'Bebek / Küçük Çocuk',
    shortLabel: 'Bebek/Çocuk',
    icon: '👶',
    badgeClass: 'bg-pink-500/10 text-pink-700 dark:text-pink-400 border border-pink-500/20',
    safetyNote: 'Çocuk boy can yeleği tahsis edilmelidir.',
  },
  other: {
    label: 'Özel Not / Talep',
    shortLabel: 'Özel Talep',
    icon: '📝',
    badgeClass: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border border-slate-500/20',
    safetyNote: 'Misafirin özel notu incelenmelidir.',
  },
};

export interface GuestDietaryAlert {
  bookingId: string;
  customerName: string;
  phone: string;
  tourTitle: string;
  tourDate: string;
  hotel: string;
  roomNumber?: string;
  adultCount: number;
  childCount: number;
  categories: DietaryCategory[];
  notesSummary: string;
  safetyInstructions: string[];
}

/**
 * Rezervasyonu tarayarak özel medikal ve diyet uyarılarını tespit eder
 */
export function analyzeBookingDietaryAndMedical(booking: Booking): GuestDietaryAlert | null {
  const categories: DietaryCategory[] = [];
  const safetyInstructions: string[] = [];
  const rawNotes = [
    booking.specialNotes || '',
    ...(booking.passengers || []).map((p) => `${p.fullName || ''} ${p.dietaryPreference || ''}`),
  ]
    .join(' ')
    .toLowerCase();

  // 1. Yolcu bazlı diyet tercihleri
  if (booking.passengers && booking.passengers.length > 0) {
    for (const p of booking.passengers) {
      if (p.dietaryPreference === 'halal' && !categories.includes('halal')) {
        categories.push('halal');
        safetyInstructions.push(`${p.fullName}: Helal Menü`);
      }
      if (p.dietaryPreference === 'vegetarian' && !categories.includes('vegetarian')) {
        categories.push('vegetarian');
        safetyInstructions.push(`${p.fullName}: Vejetaryen Menü`);
      }
      if (p.dietaryPreference === 'vegan' && !categories.includes('vegan')) {
        categories.push('vegan');
        safetyInstructions.push(`${p.fullName}: Vegan Menü`);
      }
      if (p.dietaryPreference === 'seafood_allergy' && !categories.includes('seafood_allergy')) {
        categories.push('seafood_allergy');
        safetyInstructions.push(`${p.fullName}: 🦐 KESİNLİKLE DENİZ ÜRÜNÜ OLMASIN`);
      }
    }
  }

  // 2. Metin bazlı anahtar kelime taraması (Özel notlar)
  // Alerjiler
  if (
    (rawNotes.includes('karides') ||
      rawNotes.includes('deniz ürünü') ||
      rawNotes.includes('seafood') ||
      rawNotes.includes('balık alerji')) &&
    !categories.includes('seafood_allergy')
  ) {
    categories.push('seafood_allergy');
    safetyInstructions.push(DIETARY_CATEGORIES.seafood_allergy.safetyNote!);
  }

  if (
    (rawNotes.includes('fıstık') ||
      rawNotes.includes('yer fıstığı') ||
      rawNotes.includes('peanut') ||
      rawNotes.includes('fındık')) &&
    !categories.includes('nut_allergy')
  ) {
    categories.push('nut_allergy');
    safetyInstructions.push(DIETARY_CATEGORIES.nut_allergy.safetyNote!);
  }

  // Hamilelik (Hayati Güvenlik!)
  if (
    rawNotes.includes('hamile') ||
    rawNotes.includes('gebe') ||
    rawNotes.includes('pregnant') ||
    rawNotes.includes('pregnancy')
  ) {
    if (!categories.includes('pregnant')) {
      categories.push('pregnant');
      safetyInstructions.push(DIETARY_CATEGORIES.pregnant.safetyNote!);
    }
  }

  // Deniz tutması
  if (
    rawNotes.includes('deniz tut') ||
    rawNotes.includes('mide') ||
    rawNotes.includes('bulantı') ||
    rawNotes.includes('seasick') ||
    rawNotes.includes('motion sick')
  ) {
    if (!categories.includes('motion_sickness')) {
      categories.push('motion_sickness');
      safetyInstructions.push(DIETARY_CATEGORIES.motion_sickness.safetyNote!);
    }
  }

  // Helal yemek
  if (
    (rawNotes.includes('helal') || rawNotes.includes('halal') || rawNotes.includes('muslim')) &&
    !categories.includes('halal')
  ) {
    categories.push('halal');
    safetyInstructions.push(DIETARY_CATEGORIES.halal.safetyNote!);
  }

  // Vejetaryen / Vegan
  if (
    (rawNotes.includes('vejetaryen') ||
      rawNotes.includes('vejeteryan') ||
      rawNotes.includes('vegetarian') ||
      rawNotes.includes('etsiz')) &&
    !categories.includes('vegetarian')
  ) {
    categories.push('vegetarian');
    safetyInstructions.push(DIETARY_CATEGORIES.vegetarian.safetyNote!);
  }
  if (rawNotes.includes('vegan') && !categories.includes('vegan')) {
    categories.push('vegan');
    safetyInstructions.push(DIETARY_CATEGORIES.vegan.safetyNote!);
  }

  // Engelli / Hareket Kısıtı
  if (
    rawNotes.includes('engelli') ||
    rawNotes.includes('tekerlekli sandalye') ||
    rawNotes.includes('wheelchair') ||
    rawNotes.includes('baston')
  ) {
    if (!categories.includes('mobility')) {
      categories.push('mobility');
      safetyInstructions.push(DIETARY_CATEGORIES.mobility.safetyNote!);
    }
  }

  // Bebek / Küçük Çocuk
  if (booking.childCount > 0 || rawNotes.includes('bebek') || rawNotes.includes('infant')) {
    if (!categories.includes('child_infant')) {
      categories.push('child_infant');
    }
  }

  if (categories.length === 0) {
    // Özel not varsa ve kategoriye girmemişse 'other' olarak al
    if (booking.specialNotes && booking.specialNotes.trim().length > 3) {
      categories.push('other');
      safetyInstructions.push(`Özel Not: ${booking.specialNotes.trim()}`);
    } else {
      return null;
    }
  }

  return {
    bookingId: booking.id,
    customerName: booking.customerName,
    phone: booking.phone,
    tourTitle: booking.tourTitle,
    tourDate: booking.tourDate,
    hotel: booking.hotel,
    roomNumber: booking.roomNumber,
    adultCount: booking.adultCount,
    childCount: booking.childCount,
    categories,
    notesSummary: booking.specialNotes || 'Özel talep mevcut',
    safetyInstructions,
  };
}

/**
 * Belirli tarih veya tur için rezervasyonları tarar ve tüm uyarıları toplar
 */
export function extractManifestAlerts(
  bookings: Booking[],
  dateFilter?: string,
  tourTitleFilter?: string
): GuestDietaryAlert[] {
  const alerts: GuestDietaryAlert[] = [];

  for (const b of bookings) {
    if (dateFilter && b.tourDate !== dateFilter) continue;
    if (
      tourTitleFilter &&
      tourTitleFilter !== 'all' &&
      !b.tourTitle.toLowerCase().includes(tourTitleFilter.toLowerCase())
    ) {
      continue;
    }

    const alert = analyzeBookingDietaryAndMedical(b);
    if (alert) {
      alerts.push(alert);
    }
  }

  return alerts;
}

/**
 * Taylandlı Tekne Kaptanı & Mutfak Şefine iletilecek İngilizce + Tayca Resmi Brifing Manifestosu
 */
export function generateBoatKitchenManifest(
  alerts: GuestDietaryAlert[],
  tourTitle: string,
  tourDate: string
): string {
  const totalAlertPax = alerts.reduce((acc, a) => acc + a.adultCount + a.childCount, 0);

  // Kategori sayıları
  const pregnantAlerts = alerts.filter((a) => a.categories.includes('pregnant'));
  const allergyAlerts = alerts.filter(
    (a) => a.categories.includes('seafood_allergy') || a.categories.includes('nut_allergy')
  );
  const halalAlerts = alerts.filter((a) => a.categories.includes('halal'));
  const vegAlerts = alerts.filter(
    (a) => a.categories.includes('vegetarian') || a.categories.includes('vegan')
  );

  let output = `📋 PHUKET TATILI - DAILY BOAT & CATERING SPECIAL MANIFEST
══════════════════════════════════════
🚤 Tour: ${tourTitle || 'Daily Island Tour'}
📅 Date: ${tourDate || new Date().toISOString().split('T')[0]}
👥 Flagged Bookings: ${alerts.length} (${totalAlertPax} Passengers)
══════════════════════════════════════\n\n`;

  // 1. Hayati Emniyet (Hamilelik & Pruva Koltuk Yasağı)
  if (pregnantAlerts.length > 0) {
    output += `🔴 URGENT SAFETY / BOAT SEATING ALERT (สำคัญมาก - ที่นั่งเรือ):
`;
    pregnantAlerts.forEach((a) => {
      output += `• 🤰 PREGNANT GUEST: ${a.customerName} (${a.adultCount} Pax)
  Hotel: ${a.hotel}${a.roomNumber ? ` / Room: ${a.roomNumber}` : ''}
  ⚠️ BOAT RULE (ข้อบังคับความปลอดภัย):
  - MUST SIT AT REAR / STERN (ต้องนั่งท้ายเรือเท่านั้น)
  - STRICTLY FORBIDDEN AT BOAT BOW (ห้ามนั่งหัวเรือเด็ดขาด!)\n`;
    });
    output += `\n`;
  }

  // 2. Alerji Uyarıları (Mutfak & Rehber için)
  if (allergyAlerts.length > 0) {
    output += `⚠️ FOOD ALLERGY ALERT (แจ้งครัว & ไกด์เรือ - แพ้อาหาร):
`;
    allergyAlerts.forEach((a) => {
      const isSeafood = a.categories.includes('seafood_allergy');
      const isNut = a.categories.includes('nut_allergy');
      const tags = [isSeafood ? '🦐 SEVERE SEAFOOD / FISH SAUCE ALLERGY' : '', isNut ? '🥜 NUT ALLERGY' : '']
        .filter(Boolean)
        .join(' & ');

      output += `• ${a.customerName} (${a.hotel}): ${tags}
  🇹🇭 คำเตือนครัว: กรุณาเตรียมกล่องอาหารแยก ห้ามใส่น้ำปลา กุ้ง หรืออาหารทะเลโดยเด็ดขาด!\n`;
    });
    output += `\n`;
  }

  // 3. Diyet Talepleri (Helal & Vejetaryen)
  if (halalAlerts.length > 0 || vegAlerts.length > 0) {
    output += `🍽️ DIETARY REQUIREMENTS (อาหารพิเศษ):
`;
    if (halalAlerts.length > 0) {
      const halalCount = halalAlerts.reduce((sum, a) => sum + a.adultCount + a.childCount, 0);
      output += `• ☪️ HALAL MEALS (อาหารฮาลาล): ${halalCount} Box(es)\n`;
      halalAlerts.forEach((a) => {
        output += `   - ${a.customerName} (${a.adultCount + a.childCount} Pax) [${a.hotel}]\n`;
      });
    }
    if (vegAlerts.length > 0) {
      const vegCount = vegAlerts.reduce((sum, a) => sum + a.adultCount + a.childCount, 0);
      output += `• 🌱 VEGETARIAN / VEGAN (อาหารเจ/มังสวิรัติ): ${vegCount} Box(es)\n`;
      vegAlerts.forEach((a) => {
        output += `   - ${a.customerName} (${a.adultCount + a.childCount} Pax) [${a.hotel}]\n`;
      });
    }
    output += `\n`;
  }

  output += `══════════════════════════════════════
🙏 Captain & Tour Leader: Please cross-check during boat boarding.
📞 Phuket Tatili 24/7 Operations Desk`;

  return output;
}

/**
 * WhatsApp URL oluşturucu
 */
export function getBoatManifestWhatsAppUrl(captainPhone?: string, manifestText?: string): string {
  if (!manifestText) return '#';
  const cleanPhone = captainPhone ? captainPhone.replace(/[^0-9]/g, '') : '';
  const encodedText = encodeURIComponent(manifestText);
  return cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodedText}` : `https://wa.me/?text=${encodedText}`;
}
