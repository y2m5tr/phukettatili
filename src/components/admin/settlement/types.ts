import type { Booking } from '../../../data/adminInitialData';

// Tedarikçi hakediş kalemi — SupplierSettlementManager'dan birebir taşındı.
export interface SettlementItem {
  bookingId: string;
  tourIndex: number;
  customerName: string;
  phone: string;
  tourTitle: string;
  tourDate: string;
  pickupTime: string;
  supplier: string;
  adultCount: number;
  childCount: number;
  totalPax: number;
  revenueThb: number;
  costThb: number;
  profitThb: number;
  marginPercent: number;
  isCustomCost: boolean;
  fullBooking: Booking;
}

// Tedarikçi bazında grup özeti
export interface SupplierGroup {
  supplier: string;
  pax: number;
  toursCount: number;
  totalRev: number;
  totalCost: number;
  netProfit: number;
  marginPct: number;
}

// Finansal KPI toplamları
export interface SettlementTotals {
  totalRev: number;
  totalCost: number;
  totalNetProfit: number;
  marginPct: number;
  totalPax: number;
  avgProfitPerPax: number;
  itemCount: number;
}
