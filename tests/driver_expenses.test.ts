import { describe, it, expect } from 'vitest';
import {
  calculateDriverDailySettlement,
  generateDriverDayEndSettlementWhatsApp,
  getDriverExpenseWhatsAppUrl,
  INITIAL_DRIVER_EXPENSES,
  type DriverExpenseItem,
} from '../src/lib/driverExpenses';

describe('Driver Mini-Expense Desk & Handover Settlements', () => {
  it('should accurately deduct fuel and parking from daily collected cash', () => {
    // Somchai collected 5,000 THB cash.
    // Expenses: 1,200 THB Diesel + 100 THB Parking = 1,300 THB
    // Net Handover = 3,700 THB
    const expenses: DriverExpenseItem[] = [
      {
        id: 'E-1',
        date: '2026-10-16',
        driverId: 'drv-somchai',
        driverName: 'Somchai',
        vehiclePlate: 'Van 35-1249',
        category: 'fuel_diesel',
        amountThb: 1200,
        description: 'Diesel',
        reimbursementStatus: 'deducted_from_handover',
        recordedAt: '2026-10-16T10:00:00Z',
      },
      {
        id: 'E-2',
        date: '2026-10-16',
        driverId: 'drv-somchai',
        driverName: 'Somchai',
        vehiclePlate: 'Van 35-1249',
        category: 'parking_airport',
        amountThb: 100,
        description: 'HKT Parking',
        reimbursementStatus: 'deducted_from_handover',
        recordedAt: '2026-10-16T14:00:00Z',
      },
    ];

    const result = calculateDriverDailySettlement({
      driverId: 'drv-somchai',
      date: '2026-10-16',
      collectedCashThb: 5000,
      expenses,
    });

    expect(result.collectedCashThb).toBe(5000);
    expect(result.totalExpensesThb).toBe(1300);
    expect(result.netHandoverToOfficeThb).toBe(3700);
    expect(result.driverExpenses.length).toBe(2);
  });

  it('should generate bilingual Thai and English day-end settlement WhatsApp message', () => {
    const expenses: DriverExpenseItem[] = INITIAL_DRIVER_EXPENSES.filter(
      (e) => e.driverId === 'drv-somchai'
    );
    const msg = generateDriverDayEndSettlementWhatsApp({
      driverName: 'Somchai',
      vehiclePlate: 'Van 35-1249',
      date: '2026-10-16',
      collectedCashThb: 5000,
      expenses,
    });

    expect(msg).toContain('Sawadee khrup Khun Somchai');
    expect(msg).toContain('DRIVER DAILY HANDOVER SUMMARY');
    expect(msg).toContain('5,000 THB');
    expect(msg).toContain('NET CASH HANDOVER TO OFFICE');
    expect(msg).toContain('3,700 THB');
    expect(msg).toContain('Diesel');

    const url = getDriverExpenseWhatsAppUrl('+66812345678', msg);
    expect(url).toContain('https://wa.me/66812345678?text=');
  });
});
