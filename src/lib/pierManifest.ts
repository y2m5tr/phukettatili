/**
 * İskele & Marina Bazlı Kaptan ve Saha Operasyon Manifestosu (Pier Manifest Engine)
 *
 * Phuket'te ada turları sabah saatlerinde farklı iskelelerden (Rassada, Chalong,
 * Ao Po, Royal Phuket Marina, Visit Panwa, Thap Lamu vb.) hareket eder.
 *
 * Bu modül:
 * 1. Turların kalkış iskelesini otomatik tespit eder.
 * 2. Belirli bir iskele ve tarih için check-in görevlileri ve tekne kaptanları
 *    için resmi yolcu manifestosu oluşturur.
 * 3. A4 yazdırma, PDF indirme ve kaptana tek tıkla WhatsApp gönderme desteği sunar.
 */

import type { Booking } from '../data/adminInitialData';

export interface PhuketPier {
  id: string;
  name: string;
  thaiName: string;
  zone: string;
  description: string;
  primaryTours: string[];
}

export const PHUKET_PIERS: PhuketPier[] = [
  {
    id: 'rassada',
    name: 'Rassada Pier',
    thaiName: 'ท่าเรือรัษฎา',
    zone: 'Phuket Town (Doğu)',
    description: 'Phi Phi sürat tekneleri, Maya Bay, büyük feribotlar ve Koh Lanta geçişleri',
    primaryTours: ['phi-phi', 'maya', 'bamboo', 'feribot', 'lanta'],
  },
  {
    id: 'chalong',
    name: 'Chalong Pier',
    thaiName: 'ท่าเรือฉลอง',
    zone: 'Chalong (Güney)',
    description: 'Coral Adası (Banana Beach), Racha Yai, gün batımı katamaranları ve balıkçılık',
    primaryTours: ['coral', 'banana', 'racha', 'raya', 'sunset', 'katamaran', 'fishing', 'balık'],
  },
  {
    id: 'ao-po',
    name: 'Ao Po Grand Marina',
    thaiName: 'อ่าวปอ แกรนด์ มารีน่า',
    zone: 'Pa Klok (Kuzeydoğu)',
    description: 'James Bond Adası, Phang Nga Bay deniz kanosu ve Hong by Starlight turları',
    primaryTours: ['james-bond', 'phang-nga', 'hong', 'kano', 'starlight'],
  },
  {
    id: 'royal-phuket-marina',
    name: 'Royal Phuket Marina',
    thaiName: 'รอยัล ภูเก็ต มารีน่า',
    zone: 'Koh Kaew (Merkez Doğu)',
    description: 'Lüks VIP sürat tekneleri, Moonlight katamaran ve özel yat kiralamaları',
    primaryTours: ['moonlight', 'luks', 'vip', 'yacht', 'charter'],
  },
  {
    id: 'visit-panwa',
    name: 'Visit Panwa Pier',
    thaiName: 'ท่าเรือวิสิท พันวา',
    zone: 'Cape Panwa (Güneydoğu)',
    description: 'Maiton Adası yunus izleme, Khai Adaları ve özel katamaran kalkışları',
    primaryTours: ['maiton', 'panwa', 'khai'],
  },
  {
    id: 'thap-lamu',
    name: 'Thap Lamu Pier (Khao Lak)',
    thaiName: 'ท่าเรือทับละมุ (เขาหลัก)',
    zone: 'Phang Nga / Khao Lak (Kuzey)',
    description: 'Similan Adaları ve Surin Adaları erken çıkışlı sürat tekneleri',
    primaryTours: ['similan', 'surin'],
  },
];

/**
 * Tur başlığına veya tedarikçi konumuna göre kalkış iskelesini tespit eder.
 */
export function detectTourPier(tourTitle: string, supplierLocation?: string): PhuketPier {
  const t = (tourTitle || '').toLowerCase();
  const s = (supplierLocation || '').toLowerCase();

  // 1. Similan ve Surin
  if (t.includes('similan') || t.includes('surin')) {
    return PHUKET_PIERS.find((p) => p.id === 'thap-lamu')!;
  }
  // 2. James Bond ve Phang Nga
  if (t.includes('james bond') || t.includes('phang nga') || t.includes('hong by')) {
    return PHUKET_PIERS.find((p) => p.id === 'ao-po')!;
  }
  // 3. Coral, Racha, Balıkçılık
  if (t.includes('coral') || t.includes('banana') || t.includes('racha') || t.includes('raya') || t.includes('balık')) {
    return PHUKET_PIERS.find((p) => p.id === 'chalong')!;
  }
  // 4. Moonlight, VIP Yat
  if (t.includes('moonlight') || t.includes('yat') || t.includes('yacht')) {
    return PHUKET_PIERS.find((p) => p.id === 'royal-phuket-marina')!;
  }
  // 5. Tedarikçi iskele bilgisi eşleşmesi
  if (s.includes('chalong')) return PHUKET_PIERS.find((p) => p.id === 'chalong')!;
  if (s.includes('ao po')) return PHUKET_PIERS.find((p) => p.id === 'ao-po')!;
  if (s.includes('thap lamu')) return PHUKET_PIERS.find((p) => p.id === 'thap-lamu')!;
  if (s.includes('royal')) return PHUKET_PIERS.find((p) => p.id === 'royal-phuket-marina')!;
  if (s.includes('panwa')) return PHUKET_PIERS.find((p) => p.id === 'visit-panwa')!;

  // Varsayılan: Rassada Pier (Phuket'in en yoğun ana iskelesi)
  return PHUKET_PIERS.find((p) => p.id === 'rassada')!;
}

export interface PierManifestItem {
  bookingId: string;
  ticketCode: string;
  customerName: string;
  phone: string;
  hotel: string;
  roomNumber?: string;
  tourTitle: string;
  tourDate: string;
  adultCount: number;
  childCount: number;
  totalPax: number;
  assignedVehicle?: string;
  assignedDriver?: string;
  pickupTime?: string;
  paymentStatus: string;
  remainingAmountThb: number;
  nationalParkFeeIncluded: boolean;
  specialNotes?: string;
  supplier?: string;
  passengersList: {
    name: string;
    passportNo: string;
    nationality: string;
    dietaryPreference?: string;
  }[];
}

export interface PierManifestReport {
  pier: PhuketPier;
  date: string;
  items: PierManifestItem[];
  totalBookings: number;
  totalPax: number;
  totalAdults: number;
  totalChildren: number;
  totalRemainingThb: number;
  dietaryCounts: Record<string, number>;
}

/**
 * Belirli bir iskele ve tarih için manifestoyu derler.
 */
export function buildPierManifest(
  bookings: Booking[],
  targetDate: string,
  pierId?: string // Boşsa tüm iskeleleri kapsar
): PierManifestReport {
  const targetPier = pierId
    ? PHUKET_PIERS.find((p) => p.id === pierId) || PHUKET_PIERS[0]
    : PHUKET_PIERS[0];

  const items: PierManifestItem[] = [];
  const dietaryCounts: Record<string, number> = {};

  bookings.forEach((b) => {
    if (b.status === 'cancelled') return;

    // Çoklu tur kontrolü
    if (b.tours && b.tours.length > 0) {
      b.tours.forEach((t) => {
        if (t.tourDate === targetDate) {
          const pier = detectTourPier(t.tourTitle, t.supplier);
          if (!pierId || pier.id === pierId) {
            addItem(b, t.tourTitle, t.tourDate, t.pickupTime, t.assignedVehicle, t.assignedDriver, t.supplier);
          }
        }
      });
    } else if (b.tourDate === targetDate) {
      const pier = detectTourPier(b.tourTitle, b.supplier);
      if (!pierId || pier.id === pierId) {
        addItem(b, b.tourTitle, b.tourDate, b.pickupTime, b.assignedVehicle, b.assignedDriver, b.supplier);
      }
    }
  });

  function addItem(
    b: Booking,
    tourTitle: string,
    tourDate: string,
    pickupTime?: string,
    assignedVehicle?: string,
    assignedDriver?: string,
    supplier?: string
  ) {
    const totalPax = (b.adultCount || 1) + (b.childCount || 0);

    const passengersList = (b.passengers || []).map((p) => {
      const diet = p.dietaryPreference || 'standard';
      if (diet !== 'standard') {
        dietaryCounts[diet] = (dietaryCounts[diet] || 0) + 1;
      }
      return {
        name: p.fullName,
        passportNo: p.passportNo || p.passportNumber || 'GİRİLMEDİ',
        nationality: p.nationality || 'TR',
        dietaryPreference: p.dietaryPreference,
      };
    });

    items.push({
      bookingId: b.id,
      ticketCode: b.ticketCode || b.id,
      customerName: b.customerName,
      phone: b.phone,
      hotel: b.hotel,
      roomNumber: b.roomNumber,
      tourTitle,
      tourDate,
      adultCount: b.adultCount || 1,
      childCount: b.childCount || 0,
      totalPax,
      assignedVehicle,
      assignedDriver,
      pickupTime: pickupTime || b.pickupTime || '07:30',
      paymentStatus: b.paymentStatus,
      remainingAmountThb: b.remainingAmountThb || 0,
      nationalParkFeeIncluded: b.nationalParkFeeIncluded ?? false,
      specialNotes: b.specialNotes,
      supplier: supplier || b.supplier,
      passengersList,
    });
  }

  // Alınış saatine göre sırala
  items.sort((a, b) => (a.pickupTime || '').localeCompare(b.pickupTime || ''));

  const totalAdults = items.reduce((s, i) => s + i.adultCount, 0);
  const totalChildren = items.reduce((s, i) => s + i.childCount, 0);
  const totalPax = totalAdults + totalChildren;
  const totalRemainingThb = items.reduce((s, i) => s + i.remainingAmountThb, 0);

  return {
    pier: targetPier,
    date: targetDate,
    items,
    totalBookings: items.length,
    totalPax,
    totalAdults,
    totalChildren,
    totalRemainingThb,
    dietaryCounts,
  };
}

/**
 * Kaptana veya iskele şefine tek tıkla gönderilebilecek özet WhatsApp mesajı üretir.
 */
export function generatePierManifestWhatsApp(report: PierManifestReport): string {
  const lines = report.items.map((item, idx) => {
    const park = item.nationalParkFeeIncluded ? '✅ Millî Park Dahil' : '⚠️ Harç Ödenecek';
    const diet = item.passengersList
      .filter((p) => p.dietaryPreference && p.dietaryPreference !== 'standard')
      .map((p) => `${p.name}: ${p.dietaryPreference}`)
      .join(', ');
    const dietStr = diet ? ` | 🥗 ${diet}` : '';
    return `${idx + 1}. *${item.customerName}* (${item.totalPax} Pax - ${item.adultCount}A+${item.childCount}C)
   🏨 ${item.hotel}${item.roomNumber ? ` (Oda: ${item.roomNumber})` : ''} | 🚐 ${item.assignedVehicle || 'Araç Atanmadı'}
   🔖 Ref: ${item.ticketCode} | ${park}${dietStr}`;
  });

  return (
    `⚓ *İSKELE GÜNLÜK YOLCU MANİFESTOSU*\n` +
    `📍 *İskele:* ${report.pier.name} (${report.pier.thaiName})\n` +
    `📅 *Tarih:* ${report.date}\n` +
    `👥 *Toplam Misafir:* *${report.totalPax} Kişi* (${report.totalAdults} Yetişkin, ${report.totalChildren} Çocuk - ${report.totalBookings} Rezervasyon)\n` +
    `───────────────────────\n` +
    `${lines.join('\n\n')}\n` +
    `───────────────────────\n` +
    `Phuket Tatili Operasyon Masası | Tel: +66 82 895 0665`
  );
}
