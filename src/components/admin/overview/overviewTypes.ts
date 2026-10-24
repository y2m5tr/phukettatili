import type { AdminTab } from '../AdminDashboard';
import type { Booking, TourItem } from '../../../data/adminInitialData';

export interface OverviewStats {
  totalBookings: number;
  confirmedCount: number;
  pendingCount: number;
  totalRevenueThb: number;
  collectedRevenueThb: number;
  pendingCollectionThb: number;
  totalGuests: number;
  totalCostThb: number;
  netProfitThb: number;
  profitMarginPercent: number;
}

export interface TodayDispatchItem {
  bookingId: string;
  customerName: string;
  tourTitle: string;
  pickupTime: string;
  hotel: string;
  hotelZone?: string;
  pickupStatus: string;
  remainingAmountThb: number;
}

export interface TodayDispatchSummary {
  totalGuests: number;
  toursCount: number;
  pickedUpCount: number;
  pendingCount: number;
  noShowCount: number;
  cashToCollectThb: number;
  assignedVehicles: string[];
  completionRate: number;
  todayItems: TodayDispatchItem[];
}

export interface OverviewTabProps {
  stats: OverviewStats;
  bookings?: Booking[];
  tours?: TourItem[];
  bookingsCount: number;
  toursCount: number;
  servicesCount: number;
  blogsCount: number;
  faqsCount: number;
  testimonialsCount: number;
  canViewFinancialMargins?: boolean;
  setActiveTab: (tab: AdminTab) => void;
  onOpenCreateBooking?: () => void;
  onOpenQrScanner?: () => void;
  onOpenPoliceManifest?: () => void;
  onOpenBulkReschedule?: () => void;
  onOpenWorkflow?: (b: Booking) => void;
  showToast?: (msg: string) => void;
  pendingBookingIds?: Set<string>;
  sync?: {
    isOnline: boolean;
    isCloudConnected: boolean;
    isSyncing: boolean;
    pendingSyncCount: number;
    failedSyncItems: Array<{ id: string; error: string; bookingId?: string }>;
    lastSyncedAt: Date | null;
  };
}
