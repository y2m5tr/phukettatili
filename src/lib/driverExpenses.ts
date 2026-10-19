import { fmtMoney } from './moneyFormat';
/**
 * Phuket Tatili - Şoför Saha Yakıt, Otopark & Harç Masraf Masası (Driver Mini-Expense Desk)
 * Şoförlerin gün içinde yaptığı yakıt, otopark, milli park harçlarının takibi ve
 * gün sonu merkez kasa teslimatından otomatik mahsuplaşma motoru.
 */

export type DriverExpenseCategory =
  | 'fuel_diesel'
  | 'fuel_gasohol'
  | 'parking_airport'
  | 'toll_expressway'
  | 'national_park_entry'
  | 'van_carwash'
  | 'other';

export interface DriverExpenseCategoryMeta {
  label: string;
  shortLabel: string;
  icon: string;
  defaultThb?: number;
}

export const DRIVER_EXPENSE_CATEGORIES: Record<DriverExpenseCategory, DriverExpenseCategoryMeta> = {
  fuel_diesel: {
    label: 'Motorin / Diesel Yakıt (PTT / Shell)',
    shortLabel: 'Diesel Yakıt',
    icon: '⛽',
    defaultThb: 1200,
  },
  fuel_gasohol: {
    label: 'Gasohol 95 / Benzin',
    shortLabel: 'Benzin',
    icon: '⛽',
    defaultThb: 1000,
  },
  parking_airport: {
    label: 'Phuket Havalimanı (HKT) Otopark Ücreti',
    shortLabel: 'Havalimanı Otopark',
    icon: '🅿️',
    defaultThb: 100,
  },
  toll_expressway: {
    label: 'Köprü / Otoyol Geçiş Ücreti',
    shortLabel: 'Otoyol / Harç',
    icon: '🛣️',
    defaultThb: 50,
  },
  national_park_entry: {
    label: 'Milli Park Araç Giriş Harcı',
    shortLabel: 'Milli Park Giriş',
    icon: '🏞️',
    defaultThb: 100,
  },
  van_carwash: {
    label: 'VIP Minibüs İç-Dış Yıkama & Temizlik',
    shortLabel: 'Araç Yıkama',
    icon: '🧼',
    defaultThb: 250,
  },
  other: {
    label: 'Diğer Saha Masrafı',
    shortLabel: 'Diğer',
    icon: '📦',
  },
};

export interface DriverExpenseItem {
  id: string;
  date: string;
  driverId: string;
  driverName: string;
  vehiclePlate: string;
  category: DriverExpenseCategory;
  amountThb: number;
  description: string;
  receiptNumber?: string;
  reimbursementStatus: 'pending' | 'settled_from_cash' | 'deducted_from_handover';
  recordedAt: string;
}

export const INITIAL_DRIVER_EXPENSES: DriverExpenseItem[] = [
  {
    id: 'DEXP-101',
    date: '2026-10-16',
    driverId: 'drv-somchai',
    driverName: 'Somchai Prasert',
    vehiclePlate: 'Van 35-1249',
    category: 'fuel_diesel',
    amountThb: 1200,
    description: 'PTT Gas Station Thalang - 38 Litre Diesel',
    receiptNumber: 'PTT-88219',
    reimbursementStatus: 'deducted_from_handover',
    recordedAt: '2026-10-16T11:30:00Z',
  },
  {
    id: 'DEXP-102',
    date: '2026-10-16',
    driverId: 'drv-somchai',
    driverName: 'Somchai Prasert',
    vehiclePlate: 'Van 35-1249',
    category: 'parking_airport',
    amountThb: 100,
    description: 'HKT Airport International Terminal Otopark (2 saat bekleyiş)',
    receiptNumber: 'HKT-P-4401',
    reimbursementStatus: 'deducted_from_handover',
    recordedAt: '2026-10-16T15:00:00Z',
  },
  {
    id: 'DEXP-103',
    date: '2026-10-15',
    driverId: 'drv-anan',
    driverName: 'Anan Sukhumvit',
    vehiclePlate: 'Van 30-8841',
    category: 'van_carwash',
    amountThb: 250,
    description: 'Chalong VIP Minibüs İç-Dış Detaylı Temizlik',
    receiptNumber: 'CW-192',
    reimbursementStatus: 'settled_from_cash',
    recordedAt: '2026-10-15T18:00:00Z',
  },
];

/**
 * Şoförün günlük nakit tahsilatından saha masraflarını düşerek net ofis teslimatını hesaplar
 */
export function calculateDriverDailySettlement(params: {
  driverId: string;
  date: string;
  collectedCashThb: number;
  expenses: DriverExpenseItem[];
}): {
  collectedCashThb: number;
  totalExpensesThb: number;
  netHandoverToOfficeThb: number;
  driverExpenses: DriverExpenseItem[];
} {
  const { driverId, date, collectedCashThb, expenses } = params;

  const relevantExpenses = expenses.filter(
    (e) => (driverId === 'all' || e.driverId === driverId) && (!date || e.date === date)
  );

  const totalExpensesThb = relevantExpenses.reduce((sum, e) => sum + e.amountThb, 0);
  const netHandoverToOfficeThb = Math.max(0, collectedCashThb - totalExpensesThb);

  return {
    collectedCashThb,
    totalExpensesThb,
    netHandoverToOfficeThb,
    driverExpenses: relevantExpenses,
  };
}

/**
 * Şoföre gün sonu nakit mahsuplaşma ve kasa teslimat özetini ileten iki dilli WhatsApp mesajı
 */
export function generateDriverDayEndSettlementWhatsApp(params: {
  driverName: string;
  vehiclePlate: string;
  date: string;
  collectedCashThb: number;
  expenses: DriverExpenseItem[];
}): string {
  const { driverName, vehiclePlate, date, collectedCashThb, expenses } = params;
  const settlement = calculateDriverDailySettlement({
    driverId: 'all',
    date,
    collectedCashThb,
    expenses,
  });

  let expenseLines = '';
  if (settlement.driverExpenses.length > 0) {
    expenseLines = settlement.driverExpenses
      .map(
        (e) =>
          `• ${DRIVER_EXPENSE_CATEGORIES[e.category].icon} ${DRIVER_EXPENSE_CATEGORIES[e.category].shortLabel}: *${fmtMoney(e.amountThb)} THB* (${e.description})`
      )
      .join('\n');
  } else {
    expenseLines = '• Masraf kaydı yok (0 THB)';
  }

  return `Sawadee khrup Khun ${driverName} 🙏 (Phuket Tatili Operations)

📋 DRIVER DAILY HANDOVER SUMMARY / สรุปยอดส่งเงินคนขับประจำวัน
🚗 Vehicle / ทะเบียนรถ: ${vehiclePlate}
📅 Date / วันที่: ${date}

══════════════════════════════════════
💵 Collected From Guests / เงินเก็บจากลูกค้า:
👉 *${fmtMoney(collectedCashThb)} THB*

⛽ Deducted Field Expenses / หักค่าใช้จ่ายภาคสนาม:
${expenseLines}
📊 Total Expenses / รวมค่าใช้จ่าย: *- ${fmtMoney(settlement.totalExpensesThb)} THB*

══════════════════════════════════════
💰 NET CASH HANDOVER TO OFFICE / ยอดเงินสุทธินำส่งออฟฟิศ:
👉 *${fmtMoney(settlement.netHandoverToOfficeThb)} THB*
══════════════════════════════════════

กรุณานำเงินสดสุทธิ ${fmtMoney(settlement.netHandoverToOfficeThb)} THB พร้อมใบเสร็จน้ำมัน/ที่จอดรถ มาส่งที่เคาน์เตอร์การเงินออฟฟิศป่าตองครับ
🙏 ขอบคุณสำหรับการทำงานอย่างปลอดภัยในวันนี้ครับ! (Thank you!)`;
}

/**
 * WhatsApp URL yardımcısı
 */
export function getDriverExpenseWhatsAppUrl(phone?: string, text?: string): string {
  if (!text) return '#';
  const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
  const encodedText = encodeURIComponent(text);
  return cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodedText}` : `https://wa.me/?text=${encodedText}`;
}
