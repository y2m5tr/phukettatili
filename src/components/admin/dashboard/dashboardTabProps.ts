import type React from 'react';
import type {
  Booking,
  TourItem,
  VehicleItem,
  DriverItem,
  PartnerAgent,
  SupplierItem,
  TourCostItem,
  PaymentRecord,
  BlogItem,
  ServiceItem,
  FaqItem,
  TestimonialItem,
  MediaItem,
} from '../../../data/adminInitialData';
import type { CategoryItem } from '../../../data/adminTypes';
import type { AdminTab } from '../adminNav';
import type { SiteSettingsState } from '../SettingsTab';
import type { OptionKind, OptionLibrary } from '../../../lib/inclusionLibrary';

export interface DashboardTabsRendererProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  stats: any;
  bookings: Booking[];
  filteredBookings: Booking[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  dateFilter: string;
  setDateFilter: (d: string) => void;
  manifestDate?: string;
  setManifestDate?: (d: string) => void;
  tours: TourItem[];
  filteredTours: TourItem[];
  services: ServiceItem[];
  blogs: BlogItem[];
  faqs: FaqItem[];
  testimonials: TestimonialItem[];
  mediaList: MediaItem[];
  filteredMedia: MediaItem[];
  vehicles: VehicleItem[];
  drivers: DriverItem[];
  agents: PartnerAgent[];
  suppliers: SupplierItem[];
  tourCosts: TourCostItem[];
  payments: PaymentRecord[];
  categories: CategoryItem[];
  tourCategoryOptions: string[];
  tourSearchQuery: string;
  setTourSearchQuery: (q: string) => void;
  tourCategoryFilter: string;
  setTourCategoryFilter: (c: string) => void;
  siteSettings: SiteSettingsState;
  homeSettings: any;
  setHomeSettings: React.Dispatch<React.SetStateAction<any>>;
  perms: any;
  pendingBookingIds: Set<string>;
  showToast: (msg: string) => void;
  sync: {
    isOnline: boolean;
    isCloudConnected: boolean;
    isSyncing: boolean;
    pendingSyncCount: number;
    failedSyncItems: any[];
    lastSyncedAt: Date | null;
  };
  onOpenCreateBooking?: () => void;
  onOpenEditBooking: (b: Booking) => void;
  onDeleteBooking: (id: string, name: string) => void;
  onOpenQrScanner: () => void;
  onOpenPoliceManifest: () => void;
  onOpenBulkReschedule?: () => void;
  onOpenWorkflow: (b: Booking) => void;
  onOpenVoucher: (b: Booking) => void;
  onOpenWhatsApp: (b: Booking) => void;
  onOpenCuratedProposal: (data: any) => void;
  onOpenFieldCashierBooking: (b?: Booking) => void;
  onOpenWelcomeBoardBooking: (b?: Booking) => void;
  onOpenPromptPayBooking: (b: Booking) => void;
  onOpenTourMediaBooking: (b: Booking) => void;
  onOpenSupplierDispatchBooking: (b: Booking) => void;
  onOpenFlightRadar?: (flight?: string, guest?: string) => void;
  onOpenDietaryManifest?: () => void;
  onOpenLostFound?: () => void;
  onOpenDriverExpense?: () => void;
  onOpenGuideExpense?: () => void;
  onOpenLuggageExpress?: () => void;
  onOpenCaptainVault?: () => void;
  onUpdatePickupStatus: (bookingId: string, tourIndex: number, status: any) => void;
  onAssignVehicle: (bookingId: string, tourIndex: number, vehicle: string) => void;
  onAssignDriver: (bookingId: string, tourIndex: number, driverId: string) => void;
  onUpdatePickupTime: (bookingId: string, tourIndex: number, newTime: string) => Promise<void> | void;
  onUpdateSingleBooking: (b: Booking, successMsg?: string) => void;
  onExportCSV: () => void;
  onExportSiteData: () => void;
  /** Ayarlar sekmesindeki merkezi dahil/hariç havuzu yönetimi. */
  inclusionLibrary?: OptionLibrary | null;
  onRememberOption?: (kind: OptionKind, item: string) => void;
  onForgetOption?: (kind: OptionKind, item: string) => void;
  onOpenCreateTour: () => void;
  onOpenEditTour: (t: TourItem) => void;
  onDeleteTour: (id: string, title: string) => void;
  onToggleTourFeatured: (id: string) => void;
  onBulkUpdateTours?: (updatedTours: TourItem[]) => void;
  onOpenMultiTourProposal?: (tours: TourItem[]) => void;
  onOpenCategoryModal: () => void;
  onOpenCreateBlog: () => void;
  onOpenEditBlog: (b: BlogItem) => void;
  onDeleteBlog: (id: string, title: string) => void;
  onOpenEditService: (s: ServiceItem) => void;
  onOpenCreateFaq: () => void;
  onOpenEditFaq: (f: FaqItem) => void;
  onDeleteFaq: (id: string) => void;
  onOpenCreateTesti: () => void;
  onOpenEditTesti: (t: TestimonialItem) => void;
  onDeleteTesti: (id: string, name: string) => void;
  onOpenAddMedia: () => void;
  onSelectLightboxMedia: (m: MediaItem | null) => void;
  onAssignMedia: (m: MediaItem | null) => void;
  onDeleteMedia: (id: string, title: string) => void;
  onCopyMediaUrl: (url: string) => void;
  onUpdateMedia?: (id: string, patch: Partial<MediaItem>) => void;
  onFileUpload: (file: File, cb?: (url: string) => void) => void;
  getImageUrl: (img?: string) => string;
  allImageOptions: string[];
  mediaSearchQuery: string;
  setMediaSearchQuery: (q: string) => void;
  mediaTypeFilter: any;
  setMediaTypeFilter: (t: any) => void;
  saveVehicles: (v: VehicleItem[]) => void;
  saveDrivers: (d: DriverItem[]) => void;
  saveAgents: (a: PartnerAgent[]) => void;
  saveSuppliers: (s: SupplierItem[]) => void;
  saveTourCosts: (tc: TourCostItem[]) => void;
  onAddPayment: (record: Omit<PaymentRecord, 'id' | 'collectedAt'>) => void;
  setSiteSettings: (s: SiteSettingsState) => void;
  onSaveSiteSettings: (e: React.SyntheticEvent) => void;
  settingsSaved: boolean;
  onSaveHomeSettings: (settings: any) => void;
  onConvertProposalToBooking: (bookingData: any) => void;
  viewerRole?: any;
}
