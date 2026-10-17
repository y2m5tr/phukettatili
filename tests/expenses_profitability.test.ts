import { describe, it, expect } from 'vitest';
import {
  calculateFinancialBreakdown,
  filterExpensesByTourOrVehicle,
} from '../src/lib/profitability';
import { initialExpenses, type Booking, } from '../src/data/adminInitialData';

describe('Expense & Profitability Engine', () => {
  const sampleBookings: Booking[] = [
    {
      id: 'PT-PROF-1',
      customerName: 'Cem Kaya',
      phone: '+90 532 000 11 22',
      hotel: 'Amari Phuket',
      tourTitle: 'Phi Phi & Maya Bay Sürat Teknesi',
      tourDate: '2026-10-14',
      adultCount: 2,
      childCount: 0,
      totalPriceThb: 6400,
      costThb: 3600,
      paidAmountThb: 6400,
      remainingAmountThb: 0,
      status: 'confirmed',
      paymentStatus: 'paid',
      agentCommissionThb: 800,
      createdAt: '2026-10-14T08:00:00Z',
    },
    {
      id: 'PT-PROF-2',
      customerName: 'Selin Demir',
      phone: '+90 533 111 22 33',
      hotel: 'Hilton Phuket Arcadia',
      tourTitle: 'James Bond & Phang Nga',
      tourDate: '2026-10-14',
      adultCount: 2,
      childCount: 1,
      totalPriceThb: 7500,
      costThb: 4200,
      paidAmountThb: 7500,
      remainingAmountThb: 0,
      status: 'confirmed',
      paymentStatus: 'paid',
      agentCommissionThb: 0,
      createdAt: '2026-10-14T09:00:00Z',
    },
  ];

  it('should calculate gross and net operating profit correctly', () => {
    // Toplam ciro = 6400 + 7500 = 13900 THB
    // Tedarikçi maliyet = 3600 + 4200 = 7800 THB
    // Brüt kâr = 13900 - 7800 = 6100 THB
    // Komisyon = 800 THB
    // Operasyonel giderler = EXP-101(1800) + EXP-102(2500) + EXP-103(600) = 4900 THB
    // Net Kâr = 6100 - 800 - 4900 = 400 THB
    const breakdown = calculateFinancialBreakdown(sampleBookings, initialExpenses);

    expect(breakdown.totalRevenueThb).toBe(13900);
    expect(breakdown.totalSupplierCostThb).toBe(7800);
    expect(breakdown.grossProfitThb).toBe(6100);
    expect(breakdown.totalCommissionThb).toBe(800);
    expect(breakdown.totalOperatingExpensesThb).toBe(4900);
    expect(breakdown.netOperatingProfitThb).toBe(400);
    expect(breakdown.profitMarginPercent).toBe(2.9);
  });

  it('should group expenses by category accurately', () => {
    const breakdown = calculateFinancialBreakdown(sampleBookings, initialExpenses);
    expect(breakdown.expensesByCategory['fuel']).toBe(1800);
    expect(breakdown.expensesByCategory['guide_wage']).toBe(2500);
    expect(breakdown.expensesByCategory['pier_fee']).toBe(600);
  });

  it('should filter expenses by tour or vehicle assignment', () => {
    const phiPhiExpenses = filterExpensesByTourOrVehicle(initialExpenses, {
      tourTitle: 'Phi Phi',
    });
    expect(phiPhiExpenses.length).toBe(2); // EXP-102 (guide) and EXP-103 (pier)

    const vehicle1Expenses = filterExpensesByTourOrVehicle(initialExpenses, {
      vehicle: '1 Nolu Hat',
    });
    expect(vehicle1Expenses.length).toBe(1); // EXP-101 (fuel)
    expect(vehicle1Expenses[0].category).toBe('fuel');
  });
});
