/**
 * Tedarikçi Otomatik WhatsApp Sipariş Motoru (Supplier Auto-Dispatch Engine)
 *
 * Phuket'te ada turları ve aktiviteler yerel tekne ve tur tedarikçileri
 * (Andaman Wave Master, Phang Nga Discovery, Seastar Andaman, Hanuman World vb.)
 * üzerinden yürütülür.
 *
 * Bu motor, acenta operasyon görevlisinin tek tıkla tedarikçiye Tayca veya
 * İngilizce formatında resmi tur rezervasyon siparişi (Booking Order / Voucher)
 * iletmesini ve onay kodunu takip etmesini sağlar.
 */

import type { Booking, SupplierItem } from '../data/adminInitialData';

export interface SupplierDispatchOptions {
  booking: Booking;
  supplier?: SupplierItem | null;
  supplierName?: string;
  tourDate?: string;
  tourTitle?: string;
  language?: 'en' | 'th';
  customNotes?: string;
}

/**
 * Telefon numarasını uluslararası WhatsApp formatına temizler.
 * Örneğin: "+66 82 895 0665" -> "66828950665"
 *          "081 234 5678" -> "66812345678"
 */
export function cleanSupplierPhone(phone: string): string {
  if (!phone) return '';
  let cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  } else if (cleaned.startsWith('0')) {
    cleaned = '66' + cleaned.substring(1);
  }
  return cleaned;
}

/**
 * Tedarikçiye iletilecek resmi WhatsApp rezervasyon sipariş metnini üretir.
 */
export function generateSupplierOrderMessage({
  booking,
  supplier,
  supplierName,
  tourDate,
  tourTitle,
  language = 'en',
  customNotes,
}: SupplierDispatchOptions): string {
  const targetSupplierName = supplier?.name || supplierName || booking.supplier || 'Tour Operator';
  const targetDate = tourDate || booking.tourDate;
  const targetTour = tourTitle || booking.tourTitle;
  const totalPax = (booking.adultCount || 1) + (booking.childCount || 0);

  // Yolcu listesi oluştur
  let passengerLines = '';
  if (booking.passengers && booking.passengers.length > 0) {
    passengerLines = booking.passengers
      .map((p, idx) => {
        const pass = p.passportNo || p.passportNumber ? ` (Pass: ${p.passportNo || p.passportNumber})` : '';
        const nat = p.nationality ? ` [${p.nationality}]` : '';
        const diet = p.dietaryPreference && p.dietaryPreference !== 'standard' ? ` - Diet: ${p.dietaryPreference}` : '';
        return `  ${idx + 1}. ${p.fullName}${pass}${nat}${diet}`;
      })
      .join('\n');
  } else {
    passengerLines = `  1. ${booking.customerName} (${booking.adultCount || 1} Adult${(booking.adultCount || 1) > 1 ? 's' : ''}${booking.childCount ? `, ${booking.childCount} Child` : ''})`;
  }

  const parkFeeText = booking.nationalParkFeeIncluded
    ? '✅ Included in agency invoice'
    : '⚠️ Not included (Guests will pay cash at pier)';

  const notesText = [booking.specialNotes, customNotes].filter(Boolean).join(' | ') || 'None';

  if (language === 'th') {
    return (
      `สวัสดีครับ / เรียน ทีมงาน *${targetSupplierName}*\n` +
      `📋 *ใบสั่งจองทัวร์ใหม่ (NEW BOOKING ORDER)*\n` +
      `จาก: *Phuket Tatili Co., Ltd.* (Acenta)\n` +
      `───────────────────────\n` +
      `🔖 *รหัสจอง (Booking Ref):* ${booking.ticketCode || booking.id}\n` +
      `🚢 *โปรแกรมทัวร์ (Tour):* *${targetTour}*\n` +
      `📅 *วันที่เดินทาง (Travel Date):* *${targetDate}*\n` +
      `⏰ *เวลารับโรงแรม (Pickup Time):* ${booking.pickupTime || '07:15 - 07:30 AM'}\n` +
      `🏨 *โรงแรม (Hotel):* *${booking.hotel}*${booking.roomNumber ? ` (ห้อง: ${booking.roomNumber})` : ''}\n` +
      `📍 *โซนโรงแรม (Zone):* ${booking.hotelZone || 'Phuket'}\n` +
      `👥 *จำนวนผู้โดยสาร (Total Pax):* *${totalPax} ท่าน* (${booking.adultCount || 1} ผู้ใหญ่, ${booking.childCount || 0} เด็ก)\n\n` +
      `📝 *รายชื่อผู้โดยสาร (Passenger List):*\n` +
      `${passengerLines}\n\n` +
      `🏞️ *ค่าธรรมเนียมอุทยาน (National Park Fee):* ${parkFeeText}\n` +
      `📌 *หมายเหตุพิเศษ (Special Notes):* ${notesText}\n` +
      `📞 *เบอร์ติดต่อลูกค้า (Guest Phone):* ${booking.phone}\n` +
      `───────────────────────\n` +
      `รบกวนยืนยันการจองและแจ้ง *Supplier Confirmation No.* กลับทางนี้ด้วยนะครับ\n` +
      `ขอบคุณมากครับ 🙏\n` +
      `*Phuket Tatili Operations Team* | Hotline: +66 82 895 0665`
    );
  }

  // Varsayılan: İngilizce
  return (
    `Sawadee krub / Hello *${targetSupplierName}* Reservations Team,\n\n` +
    `📋 *OFFICIAL TOUR BOOKING ORDER*\n` +
    `From: *Phuket Tatili Travel & Tourism* (Agency)\n` +
    `───────────────────────\n` +
    `🔖 *Booking Ref Code:* *${booking.ticketCode || booking.id}*\n` +
    `🚢 *Tour Program:* *${targetTour}*\n` +
    `📅 *Tour Date:* *${targetDate}*\n` +
    `⏰ *Requested Pickup Time:* *${booking.pickupTime || '07:15 - 07:30 AM'}*\n` +
    `🏨 *Pickup Hotel:* *${booking.hotel}*${booking.roomNumber ? ` (Room: ${booking.roomNumber})` : ''}\n` +
    `📍 *Hotel Zone:* ${booking.hotelZone || 'Phuket'}\n` +
    `👥 *Total Guests:* *${totalPax} Pax* (${booking.adultCount || 1} Adult${(booking.adultCount || 1) > 1 ? 's' : ''}, ${booking.childCount || 0} Child)\n\n` +
    `📋 *Passenger Manifest (Insurance & Boarding):*\n` +
    `${passengerLines}\n\n` +
    `🏞️ *National Park Fee Status:* ${parkFeeText}\n` +
    `⚠️ *Special Requests / Diet:* ${notesText}\n` +
    `📱 *Guest Contact Phone:* ${booking.phone}\n` +
    `───────────────────────\n` +
    `Please kindly confirm this booking and send us your *Confirmation Number / Boat Assignment*.\n` +
    `Thank you for your cooperation! 🙏\n\n` +
    `*Phuket Tatili Operations Desk*\n` +
    `WhatsApp / Phone: +66 82 895 0665\n` +
    `Email: ops@phukettatili.com`
  );
}

/**
 * Tedarikçi WhatsApp doğrudan mesaj gönderme URL'si üretir.
 */
export function getSupplierOrderWhatsAppUrl(
  supplierPhone: string,
  message: string
): string {
  const cleanPhone = cleanSupplierPhone(supplierPhone);
  const encoded = encodeURIComponent(message);
  return cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`;
}
