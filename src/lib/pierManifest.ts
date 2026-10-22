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

/**
 * İskele ve tur manifestosunu A4 formatında temiz, resmi ve yazdırılabilir/PDF bir pencereye döker.
 */
export function printPierManifestA4(report: PierManifestReport): void {
  if (typeof window === 'undefined') return;

  const dateParts = report.date.split('-');
  const formattedDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : report.date;

  const rows = report.items
    .map((item, idx) => {
      const parkStatus = item.nationalParkFeeIncluded ? '<span style="color:#059669;font-weight:bold;">Dahil</span>' : '<span style="color:#dc2626;font-weight:bold;">Ödenecek</span>';
      const balance = item.remainingAmountThb > 0 ? `<strong>${item.remainingAmountThb.toLocaleString()} THB</strong>` : '<span style="color:#059669;">Ödendi</span>';
      const notes = [
        item.specialNotes || '',
        item.passengersList.filter(p => p.dietaryPreference && p.dietaryPreference !== 'standard').map(p => `${p.name}: ${p.dietaryPreference}`).join(', ')
      ].filter(Boolean).join(' | ');

      return `
        <tr>
          <td style="text-align:center;font-weight:bold;">${idx + 1}</td>
          <td style="text-align:center;font-weight:bold;font-size:13px;">${item.pickupTime || '07:30'}</td>
          <td><strong>${item.customerName}</strong><br><small style="color:#4b5563;">${item.phone || '-'}</small></td>
          <td>${item.hotel}${item.roomNumber ? ` (Oda: ${item.roomNumber})` : ''}</td>
          <td><span style="font-size:12px;">${item.tourTitle}</span></td>
          <td style="text-align:center;font-weight:bold;">${item.totalPax} <span style="font-size:11px;color:#6b7280;font-weight:normal;">(${item.adultCount}Y+${item.childCount}Ç)</span></td>
          <td style="text-align:center;font-size:12px;">${item.assignedVehicle || '-'}</td>
          <td style="text-align:right;">${balance}</td>
          <td style="text-align:center;font-size:11px;">${parkStatus}</td>
          <td style="font-size:11px;color:#374151;">${notes || '-'}</td>
          <td style="width:60px;border-bottom:1px solid #9ca3af;"></td>
        </tr>
      `;
    })
    .join('');

  const html = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <title>Manifesto - ${report.pier.name} - ${formattedDate}</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 10mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      margin: 0;
      padding: 10px;
      color: #111827;
      background: #fff;
      font-size: 12px;
      line-height: 1.3;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0a192f;
      padding-bottom: 8px;
      margin-bottom: 12px;
    }
    .logo-title {
      font-size: 18px;
      font-weight: 800;
      color: #0a192f;
      letter-spacing: 0.5px;
    }
    .sub-title {
      font-size: 13px;
      font-weight: bold;
      color: #4b5563;
      margin-top: 2px;
    }
    .meta-box {
      text-align: right;
      font-size: 11px;
    }
    .meta-pill {
      display: inline-block;
      background: #f3f4f6;
      border: 1px solid #d1d5db;
      padding: 3px 8px;
      border-radius: 6px;
      font-weight: bold;
      margin-left: 4px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 6px;
    }
    th {
      background-color: #f8fafc;
      border: 1px solid #cbd5e1;
      padding: 6px 4px;
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 700;
      color: #1e293b;
    }
    td {
      border: 1px solid #cbd5e1;
      padding: 5px 6px;
      vertical-align: middle;
    }
    tr:nth-child(even) {
      background-color: #fbfcfe;
    }
    .summary-bar {
      margin-top: 12px;
      display: flex;
      justify-content: space-between;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 12px;
      font-weight: bold;
    }
    .signatures {
      margin-top: 20px;
      display: flex;
      justify-content: space-between;
      padding: 0 40px;
      font-size: 11px;
    }
    .sig-box {
      text-align: center;
      width: 200px;
      border-top: 1px solid #6b7280;
      padding-top: 4px;
    }
    @media print {
      button { display: none !important; }
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div style="margin-bottom: 8px; text-align: right;">
    <button onclick="window.print()" style="padding: 6px 14px; background: #0a192f; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">🖨️ Yazdır / PDF Kaydet</button>
  </div>
  
  <div class="header">
    <div>
      <div class="logo-title">🌴 PHUKET TATİLİ — SAHA & İSKELE YOLCU MANİFESTOSU</div>
      <div class="sub-title">📍 ${report.pier.name} (${report.pier.thaiName}) &bull; ${report.pier.zone}</div>
    </div>
    <div class="meta-box">
      <div><strong>Tarih:</strong> <span class="meta-pill">${formattedDate}</span></div>
      <div style="margin-top: 4px;"><strong>Yolcu:</strong> <span class="meta-pill">${report.totalPax} Kişi (${report.totalAdults}Y + ${report.totalChildren}Ç)</span></div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:25px;">#</th>
        <th style="width:50px;">Lobi</th>
        <th>Misafir & İletişim</th>
        <th>Otel & Oda</th>
        <th>Tur Rota</th>
        <th style="width:65px;">Pax</th>
        <th style="width:75px;">Araç</th>
        <th style="width:80px;">Kalan (THB)</th>
        <th style="width:65px;">Millî Park</th>
        <th>Özel Not / Diyet</th>
        <th style="width:60px;">İmza</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>

  <div class="summary-bar">
    <span>📋 Toplam Rezervasyon: ${report.totalBookings} Kayıt</span>
    <span>👥 Toplam Misafir: ${report.totalPax} Kişi</span>
    <span>💵 Limanda Tahsil Edilecek Toplam: ${report.totalRemainingThb.toLocaleString()} THB</span>
    <span>📞 7/24 Saha Destek: +66 82 895 0665</span>
  </div>

  <div class="signatures">
    <div class="sig-box">İskele Koordinatörü İmzası</div>
    <div class="sig-box">Kaptan / Baş Rehber İmzası</div>
  </div>

  <script>
    window.onload = function() {
      // Otomatik yazdırma penceresini aç
      setTimeout(function() { window.print(); }, 350);
    };
  </script>
</body>
</html>`;

  const printWindow = window.open('', '_blank', 'width=1100,height=750');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  }
}
