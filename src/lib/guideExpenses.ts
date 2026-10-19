import { fmtMoney } from './moneyFormat';
/**
 * Phuket Tatili - Saha Rehber Masraf Masası (Tour Guide Field Expense Desk)
 * Rehberlerin gün içinde yaptığı taksi/Grab/Bolt (misafir karşılama & otele gitme),
 * yemek/kumanya, misafir ikramı ve acil saha harcamalarının takibi ve
 * gün sonu merkez kasa teslimatından otomatik mahsuplaşma motoru.
 */

export type GuideExpenseCategory =
  | 'taxi_grab_bolt'
  | 'meals_food'
  | 'guest_hospitality'
  | 'telecom_sim'
  | 'first_aid_pharmacy'
  | 'pier_entry_ticket'
  | 'other';

export interface GuideExpenseCategoryMeta {
  label: string;
  shortLabel: string;
  icon: string;
  defaultThb?: number;
}

export const GUIDE_EXPENSE_CATEGORIES: Record<GuideExpenseCategory, GuideExpenseCategoryMeta> = {
  taxi_grab_bolt: {
    label: 'Taksi / Grab / Bolt / Tuk-Tuk (Misafir Karşılama & Otele Gitme)',
    shortLabel: 'Taksi / Grab / Bolt',
    icon: '🚕',
    defaultThb: 350,
  },
  meals_food: {
    label: 'Rehber Yemek & Kumanya Masrafı',
    shortLabel: 'Yemek & Kumanya',
    icon: '🍜',
    defaultThb: 200,
  },
  guest_hospitality: {
    label: 'Misafir İkramı & Telafi (Meyve, İçecek, Su vb.)',
    shortLabel: 'Misafir İkramı',
    icon: '🥥',
    defaultThb: 150,
  },
  telecom_sim: {
    label: 'İletişim & SIM / İnternet Paketi',
    shortLabel: 'SIM & İnternet',
    icon: '📶',
    defaultThb: 100,
  },
  first_aid_pharmacy: {
    label: 'Acil Eczane / Deniz Tutması İlacı (Dramamine)',
    shortLabel: 'Eczane & İlk Yardım',
    icon: '💊',
    defaultThb: 120,
  },
  pier_entry_ticket: {
    label: 'Liman / İskele & Görevli Giriş Harcı',
    shortLabel: 'İskele / Giriş Harcı',
    icon: '⚓',
    defaultThb: 100,
  },
  other: {
    label: 'Diğer Saha Masrafı',
    shortLabel: 'Diğer Masraf',
    icon: '📦',
  },
};

export interface GuideExpenseItem {
  id: string;
  date: string;
  guideId: string;
  guideName: string;
  category: GuideExpenseCategory;
  amountThb: number;
  description: string;
  receiptNumber?: string;
  reimbursementStatus: 'pending' | 'settled_from_cash' | 'deducted_from_handover';
  recordedAt: string;
}

export const INITIAL_GUIDE_EXPENSES: GuideExpenseItem[] = [
  {
    id: 'GEXP-201',
    date: '2026-10-16',
    guideId: 'gui-narin',
    guideName: 'Narin "Noi" Saelim',
    category: 'taxi_grab_bolt',
    amountThb: 350,
    description: 'Grab Taxi Patong -> Kata Hotel (Otele misafir karşılamaya geçiş)',
    receiptNumber: 'GRB-9102',
    reimbursementStatus: 'deducted_from_handover',
    recordedAt: '2026-10-16T07:15:00Z',
  },
  {
    id: 'GEXP-202',
    date: '2026-10-16',
    guideId: 'gui-narin',
    guideName: 'Narin "Noi" Saelim',
    category: 'meals_food',
    amountThb: 200,
    description: 'Rassada Pier İskele Tur Öncesi Kumanya & İçecek',
    receiptNumber: 'FOOD-441',
    reimbursementStatus: 'deducted_from_handover',
    recordedAt: '2026-10-16T12:30:00Z',
  },
  {
    id: 'GEXP-203',
    date: '2026-10-15',
    guideId: 'gui-somkiat',
    guideName: 'Somkiat Chen',
    category: 'guest_hospitality',
    amountThb: 150,
    description: 'Phi Phi sürat teknesinde misafirlere taze ananas & karpuz ikramı',
    receiptNumber: 'FRT-882',
    reimbursementStatus: 'settled_from_cash',
    recordedAt: '2026-10-15T15:00:00Z',
  },
];

/**
 * Rehberin günlük misafir nakit tahsilatından saha masraflarını düşerek net ofis teslimatını hesaplar
 */
export function calculateGuideDailySettlement(params: {
  guideId: string;
  date: string;
  collectedCashThb: number;
  expenses: GuideExpenseItem[];
}): {
  collectedCashThb: number;
  totalExpensesThb: number;
  netHandoverToOfficeThb: number;
  reimbursementDueThb: number;
  guideExpenses: GuideExpenseItem[];
} {
  const { guideId, date, collectedCashThb, expenses } = params;

  const relevantExpenses = expenses.filter(
    (e) => (guideId === 'all' || e.guideId === guideId) && (!date || e.date === date)
  );

  const totalExpensesThb = relevantExpenses.reduce((sum, e) => sum + e.amountThb, 0);
  const netHandoverToOfficeThb = Math.max(0, collectedCashThb - totalExpensesThb);
  const reimbursementDueThb = Math.max(0, totalExpensesThb - collectedCashThb);

  return {
    collectedCashThb,
    totalExpensesThb,
    netHandoverToOfficeThb,
    reimbursementDueThb,
    guideExpenses: relevantExpenses,
  };
}

/**
 * Rehbere gün sonu nakit mahsuplaşma ve kasa teslimat özetini ileten iki dilli WhatsApp mesajı
 */
export function generateGuideDayEndSettlementWhatsApp(params: {
  guideName: string;
  date: string;
  collectedCashThb: number;
  expenses: GuideExpenseItem[];
}): string {
  const { guideName, date, collectedCashThb, expenses } = params;
  const settlement = calculateGuideDailySettlement({
    guideId: 'all',
    date,
    collectedCashThb,
    expenses,
  });

  let expenseLines = '';
  if (settlement.guideExpenses.length > 0) {
    expenseLines = settlement.guideExpenses
      .map(
        (e) =>
          `• ${GUIDE_EXPENSE_CATEGORIES[e.category].icon} ${GUIDE_EXPENSE_CATEGORIES[e.category].shortLabel}: *${fmtMoney(e.amountThb)} THB* (${e.description})`
      )
      .join('\n');
  } else {
    expenseLines = '• Masraf kaydı yok (0 THB)';
  }

  const finalBalanceSection =
    settlement.reimbursementDueThb > 0
      ? `💰 OFFICE REIMBURSEMENT TO GUIDE / ออฟฟิศจ่ายคืนให้ไกด์:
👉 *+ ${fmtMoney(settlement.reimbursementDueThb)} THB* (Rehber cebinden ödeme yaptı)`
      : `💰 NET CASH HANDOVER TO OFFICE / ยอดเงินสุทธินำส่งออฟฟิศ:
👉 *${fmtMoney(settlement.netHandoverToOfficeThb)} THB*`;

  return `Sawadee khrup Khun ${guideName} 🙏 (Phuket Tatili Operations)

📋 TOUR GUIDE DAILY EXPENSE & HANDOVER / สรุปยอดเงินและค่าใช้จ่ายไกด์
📅 Date / วันที่: ${date}

══════════════════════════════════════
💵 Collected From Guests / เงินเก็บจากลูกค้า:
👉 *${fmtMoney(collectedCashThb)} THB*

🗣️ Deducted Field Expenses / หักค่าใช้จ่ายภาคสนาม (Grab, Yemek, İkram):
${expenseLines}
📊 Total Expenses / รวมค่าใช้จ่าย: *- ${fmtMoney(settlement.totalExpensesThb)} THB*

══════════════════════════════════════
${finalBalanceSection}
══════════════════════════════════════

Lütfen fişleri ve net nakiti Patong ofis finans masasına teslim ediniz.
กรุณาส่งใบเสร็จ (Grab / ค่าอาหาร / ค่าเข้า) พร้อมเงินสดที่ออฟฟิศป่าตองครับ
🙏 ขอบคุณสำหรับการดูแลลูกค้าเป็นอย่างดีในวันนี้ครับ! (Thank you for great guiding today!)`;
}

/**
 * WhatsApp URL yardımcısı
 */
export function getGuideExpenseWhatsAppUrl(phone?: string, text?: string): string {
  if (!text) return '#';
  const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
  const encodedText = encodeURIComponent(text);
  return cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodedText}` : `https://wa.me/?text=${encodedText}`;
}
