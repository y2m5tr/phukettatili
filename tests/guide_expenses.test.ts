import { describe, it, expect } from 'vitest';
import {
  calculateGuideDailySettlement,
  generateGuideDayEndSettlementWhatsApp,
  getGuideExpenseWhatsAppUrl,
  GUIDE_EXPENSE_CATEGORIES,
  INITIAL_GUIDE_EXPENSES,
  type GuideExpenseItem,
} from '../src/lib/guideExpenses';

describe('Tour Guide Field Expense Desk & Settlements', () => {
  it('should have predefined categories with icons and reasonable defaults', () => {
    expect(GUIDE_EXPENSE_CATEGORIES.taxi_grab_bolt.icon).toBe('🚕');
    expect(GUIDE_EXPENSE_CATEGORIES.taxi_grab_bolt.defaultThb).toBe(350);
    expect(GUIDE_EXPENSE_CATEGORIES.meals_food.icon).toBe('🍜');
    expect(GUIDE_EXPENSE_CATEGORIES.meals_food.defaultThb).toBe(200);
    expect(GUIDE_EXPENSE_CATEGORIES.guest_hospitality.icon).toBe('🥥');
    expect(GUIDE_EXPENSE_CATEGORIES.telecom_sim.icon).toBe('📶');
    expect(GUIDE_EXPENSE_CATEGORIES.first_aid_pharmacy.icon).toBe('💊');
    expect(GUIDE_EXPENSE_CATEGORIES.pier_entry_ticket.icon).toBe('⚓');
  });

  it('should accurately deduct taxi, meals and field expenses from collected guest cash', () => {
    // Guide collected 4,000 THB cash from guest.
    // Expenses: 350 THB Grab Taxi + 200 THB Meal = 550 THB
    // Net Handover to Office = 3,450 THB
    const expenses: GuideExpenseItem[] = [
      {
        id: 'G-1',
        date: '2026-10-16',
        guideId: 'gui-narin',
        guideName: 'Narin "Noi"',
        category: 'taxi_grab_bolt',
        amountThb: 350,
        description: 'Grab Taxi to Hotel',
        reimbursementStatus: 'deducted_from_handover',
        recordedAt: '2026-10-16T08:00:00Z',
      },
      {
        id: 'G-2',
        date: '2026-10-16',
        guideId: 'gui-narin',
        guideName: 'Narin "Noi"',
        category: 'meals_food',
        amountThb: 200,
        description: 'Lunch and drink',
        reimbursementStatus: 'deducted_from_handover',
        recordedAt: '2026-10-16T12:00:00Z',
      },
    ];

    const result = calculateGuideDailySettlement({
      guideId: 'gui-narin',
      date: '2026-10-16',
      collectedCashThb: 4000,
      expenses,
    });

    expect(result.collectedCashThb).toBe(4000);
    expect(result.totalExpensesThb).toBe(550);
    expect(result.netHandoverToOfficeThb).toBe(3450);
    expect(result.reimbursementDueThb).toBe(0);
    expect(result.guideExpenses.length).toBe(2);
  });

  it('should calculate reimbursement due when guide spent out-of-pocket more than collected cash', () => {
    // Guide collected 0 THB (all guests paid online)
    // Guide spent 500 THB for Grab taxi and emergency medication
    const expenses: GuideExpenseItem[] = [
      {
        id: 'G-1',
        date: '2026-10-16',
        guideId: 'gui-narin',
        guideName: 'Narin "Noi"',
        category: 'taxi_grab_bolt',
        amountThb: 350,
        description: 'Grab Taxi to Hotel',
        reimbursementStatus: 'pending',
        recordedAt: '2026-10-16T08:00:00Z',
      },
      {
        id: 'G-2',
        date: '2026-10-16',
        guideId: 'gui-narin',
        guideName: 'Narin "Noi"',
        category: 'first_aid_pharmacy',
        amountThb: 150,
        description: 'Dramamine for seasick guest',
        reimbursementStatus: 'pending',
        recordedAt: '2026-10-16T09:30:00Z',
      },
    ];

    const result = calculateGuideDailySettlement({
      guideId: 'gui-narin',
      date: '2026-10-16',
      collectedCashThb: 0,
      expenses,
    });

    expect(result.collectedCashThb).toBe(0);
    expect(result.totalExpensesThb).toBe(500);
    expect(result.netHandoverToOfficeThb).toBe(0);
    expect(result.reimbursementDueThb).toBe(500);
  });

  it('should generate informative WhatsApp settlement report for guide', () => {
    const expenses: GuideExpenseItem[] = INITIAL_GUIDE_EXPENSES.filter(
      (e) => e.guideId === 'gui-narin'
    );
    const msg = generateGuideDayEndSettlementWhatsApp({
      guideName: 'Narin "Noi"',
      date: '2026-10-16',
      collectedCashThb: 3000,
      expenses,
    });

    expect(msg).toContain('Sawadee khrup Khun Narin "Noi"');
    expect(msg).toContain('TOUR GUIDE DAILY EXPENSE & HANDOVER');
    expect(msg).toContain('3,000 THB');
    expect(msg).toContain('Grab');
    expect(msg).toContain('NET CASH HANDOVER TO OFFICE');
    expect(msg).toContain('2,450 THB');

    const url = getGuideExpenseWhatsAppUrl('+66898765432', msg);
    expect(url).toContain('https://wa.me/66898765432?text=');
  });

  it('should handle reimbursement message when expenses exceed cash', () => {
    const msg = generateGuideDayEndSettlementWhatsApp({
      guideName: 'Narin',
      date: '2026-10-16',
      collectedCashThb: 200,
      expenses: [
        {
          id: 'G-1',
          date: '2026-10-16',
          guideId: 'gui-narin',
          guideName: 'Narin',
          category: 'taxi_grab_bolt',
          amountThb: 400,
          description: 'Grab Taxi to Hotel',
          reimbursementStatus: 'pending',
          recordedAt: '2026-10-16T08:00:00Z',
        },
      ],
    });

    expect(msg).toContain('OFFICE REIMBURSEMENT TO GUIDE');
    expect(msg).toContain('+ 200 THB');
  });
});
