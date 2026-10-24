import React from 'react';
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
import OverviewTab from '../OverviewTab';
import BookingsTab from '../BookingsTab';
import TransfersTab from '../TransfersTab';

// Lazy Tabs
const FinanceTab = React.lazy(() => import('../FinanceTab'));
const FleetManager = React.lazy(() => import('../FleetManager'));
const SupplierSettlementManager = React.lazy(() => import('../SupplierSettlementManager'));
const SettingsTab = React.lazy(() => import('../SettingsTab'));
const UsersTab = React.lazy(() => import('../UsersTab'));
const WhatsAppTab = React.lazy(() => import('../WhatsAppTab'));
const TestimonialsTab = React.lazy(() => import('../TestimonialsTab'));
const FaqsTab = React.lazy(() => import('../FaqsTab'));
const BlogsTab = React.lazy(() => import('../BlogsTab'));
const ServicesTab = React.lazy(() => import('../ServicesTab'));
const MediaTab = React.lazy(() => import('../MediaTab'));
const ToursTab = React.lazy(() => import('../ToursTab'));
const HomeEditorTab = React.lazy(() => import('../HomeEditorTab'));
const PartnersTab = React.lazy(() => import('../PartnersTab'));
const SuppliersTab = React.lazy(() => import('../SuppliersTab'));
const CuratedProposalModal = React.lazy(() => import('../CuratedProposalModal'));

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
  tours: TourItem[];
  services: ServiceItem[];
  blogs: BlogItem[];
  faqs: FaqItem[];
  testimonials: TestimonialItem[];
  mediaList: MediaItem[];
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
  setHomeSettings: (val: any) => void;
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
  onOpenFieldCashierBooking: (b: Booking) => void;
  onOpenWelcomeBoardBooking: (b: Booking) => void;
  onOpenPromptPayBooking: (b: Booking) => void;
  onOpenTourMediaBooking: (b: Booking) => void;
  onOpenSupplierDispatchBooking: (b: Booking) => void;
  onUpdatePickupStatus: (bookingId: string, tourIndex: number, status: any) => void;
  onAssignVehicle: (bookingId: string, tourIndex: number, vehicle: string) => void;
  onAssignDriver: (bookingId: string, tourIndex: number, driverId: string) => void;
  onUpdatePickupTime: (bookingId: string, tourIndex: number, newTime: string) => void;
  onExportCSV: () => void;
  onExportSiteData: () => void;
  onOpenCreateTour: () => void;
  onOpenEditTour: (t: TourItem) => void;
  onDeleteTour: (id: string, title: string) => void;
  onToggleTourFeatured: (id: string) => void;
  onOpenCreateCategory: () => void;
  onOpenEditCategory: (c: CategoryItem) => void;
  onDeleteCategory: (id: string, name: string) => void;
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
  onSelectLightboxMedia: (m: MediaItem) => void;
  onAssignMedia: (m: MediaItem) => void;
  onDeleteMedia: (id: string, title: string) => void;
  onFileUpload: (file: File) => void;
  mediaSearchQuery: string;
  setMediaSearchQuery: (q: string) => void;
  mediaTypeFilter: any;
  setMediaTypeFilter: (t: any) => void;
  saveVehicles: (v: VehicleItem[]) => void;
  saveDrivers: (d: DriverItem[]) => void;
  saveAgents: (a: PartnerAgent[]) => void;
  saveSuppliers: (s: SupplierItem[]) => void;
  saveTourCosts: (tc: TourCostItem[]) => void;
  savePayments: (p: PaymentRecord[]) => void;
  setSiteSettings: (s: SiteSettingsState) => void;
  onSaveSiteSettings: (e: React.FormEvent) => void;
  settingsSaved: boolean;
  onSaveHomeSettings: (e: React.FormEvent) => void;
  onConvertProposalToBooking: (bookingData: any) => void;
  viewerRole?: any;
}

export function DashboardTabsRenderer({
  activeTab,
  setActiveTab,
  stats,
  bookings,
  filteredBookings,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  dateFilter,
  setDateFilter,
  tours,
  services,
  blogs,
  faqs,
  testimonials,
  mediaList,
  vehicles,
  drivers,
  agents,
  suppliers,
  tourCosts,
  payments,
  categories,
  tourCategoryOptions,
  tourSearchQuery,
  setTourSearchQuery,
  tourCategoryFilter,
  setTourCategoryFilter,
  siteSettings,
  homeSettings,
  setHomeSettings,
  perms,
  pendingBookingIds,
  showToast,
  sync,
  onOpenCreateBooking,
  onOpenEditBooking,
  onDeleteBooking,
  onOpenQrScanner,
  onOpenPoliceManifest,
  onOpenBulkReschedule,
  onOpenWorkflow,
  onOpenVoucher,
  onOpenWhatsApp,
  onOpenCuratedProposal,
  onOpenFieldCashierBooking,
  onOpenWelcomeBoardBooking,
  onOpenPromptPayBooking,
  onOpenTourMediaBooking,
  onOpenSupplierDispatchBooking,
  onUpdatePickupStatus,
  onAssignVehicle,
  onAssignDriver,
  onUpdatePickupTime,
  onExportCSV,
  onExportSiteData,
  onOpenCreateTour,
  onOpenEditTour,
  onDeleteTour,
  onToggleTourFeatured,
  onOpenCreateCategory,
  onOpenEditCategory,
  onDeleteCategory,
  onOpenCreateBlog,
  onOpenEditBlog,
  onDeleteBlog,
  onOpenEditService,
  onOpenCreateFaq,
  onOpenEditFaq,
  onDeleteFaq,
  onOpenCreateTesti,
  onOpenEditTesti,
  onDeleteTesti,
  onOpenAddMedia,
  onSelectLightboxMedia,
  onAssignMedia,
  onDeleteMedia,
  onFileUpload,
  mediaSearchQuery,
  setMediaSearchQuery,
  mediaTypeFilter,
  setMediaTypeFilter,
  saveVehicles,
  saveDrivers,
  saveAgents,
  saveSuppliers,
  saveTourCosts,
  savePayments,
  setSiteSettings,
  onSaveSiteSettings,
  settingsSaved,
  onSaveHomeSettings,
  onConvertProposalToBooking,
  viewerRole,
}: DashboardTabsRendererProps) {
  return (
    <>
      {activeTab === 'overview' && (
        <OverviewTab
          stats={stats}
          bookings={bookings}
          tours={tours}
          bookingsCount={bookings.length}
          toursCount={tours.length}
          servicesCount={services.length}
          blogsCount={blogs.length}
          faqsCount={faqs.length}
          testimonialsCount={testimonials.length}
          canViewFinancialMargins={perms.canViewFinancialMargins}
          setActiveTab={setActiveTab}
          onOpenCreateBooking={onOpenCreateBooking}
          onOpenQrScanner={onOpenQrScanner}
          onOpenPoliceManifest={onOpenPoliceManifest}
          onOpenBulkReschedule={onOpenBulkReschedule}
          onOpenWorkflow={onOpenWorkflow}
          pendingBookingIds={pendingBookingIds}
          showToast={showToast}
          sync={sync}
        />
      )}

      {activeTab === 'bookings' && (
        <BookingsTab
          filteredBookings={filteredBookings}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          canCreateBookings={perms.canCreateBookings}
          canDeleteBookings={perms.canDeleteBookings}
          canViewFinancialMargins={perms.canViewFinancialMargins}
          pendingBookingIds={pendingBookingIds}
          onOpenCreateBooking={onOpenCreateBooking || (() => {})}
          onOpenEditBooking={onOpenEditBooking}
          onDeleteBooking={onDeleteBooking}
          onOpenVoucher={onOpenVoucher}
          onOpenWhatsApp={onOpenWhatsApp}
          onOpenCuratedProposal={onOpenCuratedProposal}
          onOpenFieldCashierBooking={onOpenFieldCashierBooking}
          onOpenWelcomeBoardBooking={onOpenWelcomeBoardBooking}
          onOpenPromptPayBooking={onOpenPromptPayBooking}
          onOpenTourMediaBooking={onOpenTourMediaBooking}
          onOpenSupplierDispatchBooking={onOpenSupplierDispatchBooking}
          onExportCSV={onExportCSV}
          onOpenWorkflow={onOpenWorkflow}
        />
      )}

      {activeTab === 'transfers' && (
        <TransfersTab
          bookings={bookings}
          vehicles={vehicles}
          drivers={drivers}
          onUpdatePickupStatus={onUpdatePickupStatus}
          onAssignVehicle={onAssignVehicle}
          onAssignDriver={onAssignDriver}
          onUpdatePickupTime={onUpdatePickupTime}
          showToast={showToast}
          managerPhone={siteSettings.whatsappNumber}
        />
      )}

      {activeTab === 'settlements' && (
        <SupplierSettlementManager
          bookings={bookings}
          suppliers={suppliers}
          tourCosts={tourCosts}
          showToast={showToast}
        />
      )}

      {activeTab === 'finance' && (
        <FinanceTab
          bookings={bookings}
          payments={payments}
          savePayments={savePayments}
          tours={tours}
          suppliers={suppliers}
          tourCosts={tourCosts}
          agents={agents}
          canViewFinancialMargins={perms.canViewFinancialMargins}
          showToast={showToast}
        />
      )}

      {activeTab === 'fleet' && (
        <FleetManager
          vehicles={vehicles}
          drivers={drivers}
          bookings={bookings}
          saveVehicles={saveVehicles}
          saveDrivers={saveDrivers}
          showToast={showToast}
        />
      )}

      {activeTab === 'partners' && (
        <PartnersTab
          agents={agents}
          saveAgents={saveAgents}
          bookings={bookings}
          showToast={showToast}
        />
      )}

      {activeTab === 'suppliers' && (
        <SuppliersTab
          suppliers={suppliers}
          saveSuppliers={saveSuppliers}
          tourCosts={tourCosts}
          saveTourCosts={saveTourCosts}
          tours={tours}
          bookings={bookings}
          showToast={showToast}
        />
      )}

      {activeTab === 'tours' && (
        <ToursTab
          tours={tours}
          categories={categories}
          categoryOptions={tourCategoryOptions}
          tourSearchQuery={tourSearchQuery}
          setTourSearchQuery={setTourSearchQuery}
          tourCategoryFilter={tourCategoryFilter}
          setTourCategoryFilter={setTourCategoryFilter}
          onOpenCreateTour={onOpenCreateTour}
          onOpenEditTour={onOpenEditTour}
          onDeleteTour={onDeleteTour}
          onToggleTourFeatured={onToggleTourFeatured}
          onOpenCreateCategory={onOpenCreateCategory}
          onOpenEditCategory={onOpenEditCategory}
          onDeleteCategory={onDeleteCategory}
        />
      )}

      {activeTab === 'home' && (
        <HomeEditorTab
          homeSettings={homeSettings}
          setHomeSettings={setHomeSettings}
          onSave={onSaveHomeSettings}
          onFileUpload={onFileUpload}
          availableImages={mediaList.map((m) => m.url)}
          showToast={showToast}
        />
      )}

      {activeTab === 'blogs' && (
        <BlogsTab
          blogs={blogs}
          onOpenCreateBlog={onOpenCreateBlog}
          onOpenEditBlog={onOpenEditBlog}
          onDeleteBlog={onDeleteBlog}
        />
      )}

      {activeTab === 'services' && (
        <ServicesTab
          services={services}
          onOpenEditService={onOpenEditService}
        />
      )}

      {activeTab === 'faqs' && (
        <FaqsTab
          faqs={faqs}
          onOpenCreateFaq={onOpenCreateFaq}
          onOpenEditFaq={onOpenEditFaq}
          onDeleteFaq={onDeleteFaq}
        />
      )}

      {activeTab === 'testimonials' && (
        <TestimonialsTab
          testimonials={testimonials}
          onOpenCreateTesti={onOpenCreateTesti}
          onOpenEditTesti={onOpenEditTesti}
          onDeleteTesti={onDeleteTesti}
        />
      )}

      {activeTab === 'media' && (
        <MediaTab
          mediaList={mediaList}
          searchQuery={mediaSearchQuery}
          setSearchQuery={setMediaSearchQuery}
          typeFilter={mediaTypeFilter}
          setTypeFilter={setMediaTypeFilter}
          onOpenAddModal={onOpenAddMedia}
          onOpenLightbox={onSelectLightboxMedia}
          onOpenAssignModal={onAssignMedia}
          onDeleteMedia={onDeleteMedia}
          onFileUpload={onFileUpload}
        />
      )}

      {activeTab === 'whatsapp' && (
        <WhatsAppTab
          siteSettings={siteSettings}
          setSiteSettings={setSiteSettings}
          onSaveSettings={onSaveSiteSettings}
          settingsSaved={settingsSaved}
        />
      )}

      {activeTab === 'settings' && (
        <SettingsTab
          siteSettings={siteSettings}
          setSiteSettings={setSiteSettings}
          onSaveSettings={onSaveSiteSettings}
          settingsSaved={settingsSaved}
          onExportData={onExportSiteData}
          onFileUpload={onFileUpload}
          viewerRole={viewerRole}
          showToast={showToast}
        />
      )}

      {activeTab === 'users' && <UsersTab />}

      {activeTab === 'proposals' && (
        <CuratedProposalModal
          isOpen={true}
          onClose={() => setActiveTab('bookings')}
          showToast={showToast}
          onConvertToBooking={onConvertProposalToBooking}
        />
      )}
    </>
  );
}
