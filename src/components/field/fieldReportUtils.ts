import { fmtMoney } from '../../lib/moneyFormat';
import { formatDateDisplay, type FieldScheduleItem } from './fieldTypes';
import type { ScheduleStats } from './fieldScheduleBuilder';

export function sendDayEndReportToManager(
  managerPhone: string,
  selectedDate: string,
  crewName: string,
  scheduleItems: FieldScheduleItem[],
  stats: ScheduleStats
): void {
  const cleanPhone = managerPhone.replace(/[^0-9]/g, '');
  const totalCollectedToday = scheduleItems.reduce((acc, i) => acc + (i.fullBooking.paidAmountThb || 0), 0);

  const reportMsg =
    `📊 *PHUKET TATİLİ - GÜN SONU SAHA RAPORU*\n` +
    `📅 Tarih: *${formatDateDisplay(selectedDate)}*\n` +
    `👤 Görevli: *${crewName}*\n` +
    `--------------------------------\n` +
    `👥 Toplam Yolcu: *${stats.totalPax} Kişi* (${stats.pickedUpCount}/${stats.totalTransfers} Alındı)\n` +
    `💰 Toplam Kasa/Tahsilat: *${fmtMoney(totalCollectedToday)} THB*\n` +
    `⚠️ Kalan Tahsil Edilmemiş: *${fmtMoney(stats.totalCashToCollect)} THB*\n\n` +
    `*Yolcu Listesi & Durum:*\n` +
    scheduleItems
      .map(
        (item, idx) =>
          `${idx + 1}. *${item.customerName}* (${item.adultCount} Yetişkin) - ${item.pickupTime}\n` +
          `   🏨 ${item.hotel}\n` +
          `   Durum: ${item.pickupStatus === 'picked_up' ? '✅ Alındı' : item.pickupStatus === 'no_show' ? '❌ No-Show' : '⏳ Bekliyor'}\n` +
          `   Ödeme: ${item.remainingAmountThb === 0 ? 'Ödendi' : `Kalan: ${fmtMoney(item.remainingAmountThb)} THB`}`
      )
      .join('\n\n') +
    `\n\nOperasyon başarıyla tamamlanmıştır. 🇹🇭`;

  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(reportMsg)}`;
  window.open(url, '_blank');
}
