import type { Booking, ExpenseRecord } from '../data/adminInitialData';

export interface FinancialBreakdown {
  totalRevenueThb: number;
  totalSupplierCostThb: number;
  totalCommissionThb: number;
  totalOperatingExpensesThb: number;
  grossProfitThb: number;
  netOperatingProfitThb: number;
  profitMarginPercent: number;
  expensesByCategory: Record<string, number>;
}

/**
 * Belirli bir tarih aralığı veya tüm operasyon için net finansal kârlılık tablosu üretir.
 */
export function calculateFinancialBreakdown(
  bookings: Booking[],
  expenses: ExpenseRecord[]
): FinancialBreakdown {
  const confirmedBookings = bookings.filter((b) => b.status !== 'cancelled');

  const totalRevenueThb = confirmedBookings.reduce((sum, b) => sum + (b.totalPriceThb || 0), 0);
  const totalCommissionThb = confirmedBookings.reduce(
    (sum, b) => sum + (b.agentCommissionThb || 0),
    0
  );

  // Tedarikçi maliyeti hesabı (booking.costThb veya booking.tours içindeki costThb)
  const totalSupplierCostThb = confirmedBookings.reduce((sum, b) => {
    if (b.costThb && b.costThb > 0) return sum + b.costThb;
    const tourCost = (b.tours || []).reduce((tSum, t) => tSum + (t.costThb || 0), 0);
    return sum + (tourCost > 0 ? tourCost : Math.round((b.totalPriceThb || 0) * 0.55));
  }, 0);

  const totalOperatingExpensesThb = expenses.reduce((sum, e) => sum + (e.amountThb || 0), 0);

  const expensesByCategory: Record<string, number> = {};
  expenses.forEach((e) => {
    expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + e.amountThb;
  });

  const grossProfitThb = totalRevenueThb - totalSupplierCostThb;
  const netOperatingProfitThb = grossProfitThb - totalCommissionThb - totalOperatingExpensesThb;
  const profitMarginPercent =
    totalRevenueThb > 0 ? Number(((netOperatingProfitThb / totalRevenueThb) * 100).toFixed(1)) : 0;

  return {
    totalRevenueThb,
    totalSupplierCostThb,
    totalCommissionThb,
    totalOperatingExpensesThb,
    grossProfitThb,
    netOperatingProfitThb,
    profitMarginPercent,
    expensesByCategory,
  };
}

/**
 * Belirli bir turun veya aracın harcamalarını ve net katkısını filtreler.
 */
export function filterExpensesByTourOrVehicle(
  expenses: ExpenseRecord[],
  filter: { tourTitle?: string; vehicle?: string }
): ExpenseRecord[] {
  return expenses.filter((e) => {
    if (filter.tourTitle) {
      if (!e.assignedTour || !e.assignedTour.toLowerCase().includes(filter.tourTitle.toLowerCase())) {
        return false;
      }
    }
    if (filter.vehicle) {
      if (!e.assignedVehicle || !e.assignedVehicle.toLowerCase().includes(filter.vehicle.toLowerCase())) {
        return false;
      }
    }
    return true;
  });
}
