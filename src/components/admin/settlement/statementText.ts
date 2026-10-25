import { fmtMoney } from '../../../lib/moneyFormat';
import type { SettlementItem } from './types';

// Tedarikçiye WhatsApp mutabakat mesajı metni (İngilizce / Tayca format) —
// SupplierSettlementManager'dan birebir taşındı.
export function buildSupplierStatementText(params: {
  statementSupplier: string;
  statementItems: SettlementItem[];
  statementTotalPax: number;
  statementTotalCost: number;
  dateFilter: string;
  startDate: string;
  endDate: string;
  managerPhone: string;
}): string {
  const {
    statementSupplier,
    statementItems,
    statementTotalPax,
    statementTotalCost,
    dateFilter,
    startDate,
    endDate,
    managerPhone,
  } = params;

  const dateRangeStr =
    dateFilter === 'today'
      ? new Date().toISOString().split('T')[0]
      : `${startDate} - ${endDate}`;

  let text = `🇹🇭 *PHUKET TATILI — SUPPLIER SETTLEMENT STATEMENT*\n`;
  text += `🏢 *Company / Supplier:* ${statementSupplier}\n`;
  text += `📅 *Billing Period:* ${dateRangeStr}\n`;
  text += `👥 *Total Guests:* ${statementTotalPax} PAX (${statementItems.length} Tours)\n`;
  text += `───────────────────────────────\n`;

  statementItems.forEach((it, idx) => {
    text += `${idx + 1}. [${it.tourDate}] *${it.customerName}* (${it.totalPax} PAX)\n`;
    text += `   🏝️ Tour: ${it.tourTitle}\n`;
    text += `   💵 Cost Due: *${fmtMoney(it.costThb)} THB*\n\n`;
  });

  text += `───────────────────────────────\n`;
  text += `💰 *TOTAL PAYOUT AMOUNT:* *${fmtMoney(statementTotalCost)} THB*\n`;
  text += `📄 Ref No: PT-SETTLE-${new Date().getTime().toString().slice(-6)}\n`;
  text += `Operated by: Phuket Tatili Co., Ltd. (TAT License: 34/02819)\n`;
  text += `Hotline: +${managerPhone.replace(/[^0-9]/g, '')}\n`;
  text += `Khop khun khrup! 🙏🇹🇭`;

  return text;
}
