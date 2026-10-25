import type { Booking } from '../../../data/adminInitialData';
import { formatDayMonthYear } from '../../../lib/whatsappEngine';
import { fmtMoney } from '../../../lib/moneyFormat';

// Acentanın misafire WhatsApp üzerinden bilet/ voucher göndermesi.
// AgentPortalApp'ten birebir taşındı; hem onay kartı hem rezervasyon
// tablosu aynı metni kullanır.
export function shareWhatsAppVoucher(booking: Booking, agentName: string): void {
  const cleanPhone = booking.phone.replace(/[^0-9]/g, '');
  const text =
    `🌴 *PHUKET TATİLİ & ${agentName.toUpperCase()} — TUR BİLETİNİZ HAZIR*\n` +
    `───────────────────────────────\n` +
    `Sayın *${booking.customerName}*,\n` +
    `Acentemiz aracılığıyla rezerve edilen tur detaylarınız onaylanmıştır:\n\n` +
    `🏝️ *Tur:* ${booking.tourTitle}\n` +
    `📅 *Tarih:* ${formatDayMonthYear(booking.tourDate)}\n` +
    `⏰ *Otelden Alınış Saati:* ${booking.pickupTime || '07:30'}\n` +
    `🏨 *Alınış Yeri:* ${booking.hotel} ${booking.roomNumber ? `(Oda: ${booking.roomNumber})` : ''}\n` +
    `👥 *Kişi Sayısı:* ${booking.adultCount} Yetişkin${booking.childCount > 0 ? ` + ${booking.childCount} Çocuk` : ''}\n` +
    `💰 *Toplam Tutar:* ${fmtMoney(booking.totalPriceThb)} THB\n` +
    `💵 *Kalan Ödeme:* ${booking.remainingAmountThb > 0 ? `${fmtMoney(booking.remainingAmountThb)} THB (Sabah lobide şoföre nakit)` : '✓ Ödendi'}\n` +
    `───────────────────────────────\n` +
    `🎫 *Canlı Bilet & Biniş Kartı Takip Linkiniz:*\n` +
    `${window.location.origin}/bilet/${booking.id}\n\n` +
    `Harika bir tur dileriz! 🇹🇭✨`;

  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}
