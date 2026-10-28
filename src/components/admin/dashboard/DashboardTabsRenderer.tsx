import React from 'react';
import type { DashboardTabsRendererProps } from './dashboardTabProps';

// Lazy Tabs — ilk açılışta yalnızca sidebar+header+aktif tab indirilir.
// Veriler store'dan geldiği için yükleme anı neredeyse hissedilmez.
// TransfersTab de lazy: admin?tab=transfers ile gelinmedikçe indirilmez.
const OverviewTab = React.lazy(() => import('../OverviewTab'));
const BookingsTab = React.lazy(() => import('../BookingsTab'));
const TransfersTab = React.lazy(() => import('../TransfersTab'));
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
const AuditLogTab = React.lazy(() => import('../AuditLogTab'));

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
  manifestDate,
  setManifestDate,
  tours,
  filteredTours,
  services,
  blogs,
  faqs,
  testimonials,
  mediaList,
  filteredMedia,
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
  onOpenFlightRadar,
  onOpenDietaryManifest,
  onOpenLostFound,
  onOpenDriverExpense,
  onOpenGuideExpense,
  onOpenLuggageExpress,
  onOpenCaptainVault,
  onUpdatePickupStatus,
  onAssignVehicle,
  onAssignDriver,
  onUpdatePickupTime,
  onUpdateSingleBooking,
  onExportCSV,
  onExportSiteData,
  inclusionLibrary,
  onRememberOption,
  onForgetOption,
  onOpenCreateTour,
  onOpenEditTour,
  onDeleteTour,
  onToggleTourFeatured,
  onBulkUpdateTours,
  onOpenMultiTourProposal,
  onOpenCategoryModal,
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
  onCopyMediaUrl,
  onUpdateMedia,
  onFileUpload,
  getImageUrl,
  allImageOptions,
  mediaSearchQuery,
  setMediaSearchQuery,
  mediaTypeFilter,
  setMediaTypeFilter,
  saveVehicles,
  saveDrivers,
  saveAgents,
  saveSuppliers,
  saveTourCosts,
  onAddPayment,
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
          canDelete={perms.canDeleteBookings}
          pendingBookingIds={pendingBookingIds}
          allBookings={bookings}
          showToast={showToast}
          googleReviewUrl={siteSettings.googleReviewUrl}
          onOpenCreate={onOpenCreateBooking || (() => {})}
          onOpenEdit={onOpenEditBooking}
          onDelete={onDeleteBooking}
          setVoucherBooking={onOpenVoucher}
          setWhatsAppModalBooking={onOpenWhatsApp}
          onQuickCollect={(_b) => setActiveTab('finance')}
          onOpenQuotePdf={onOpenCuratedProposal}
          onOpenDietaryManifest={onOpenDietaryManifest}
          onOpenFieldCashier={onOpenFieldCashierBooking}
          onOpenFlightRadar={onOpenFlightRadar}
          onOpenWelcomeBoard={onOpenWelcomeBoardBooking}
          onOpenTourMedia={onOpenTourMediaBooking}
          onOpenSupplierDispatch={onOpenSupplierDispatchBooking}
          onOpenPromptPayQr={onOpenPromptPayBooking}
          onOpenWorkflow={onOpenWorkflow}
          onExportCSV={onExportCSV}
          onUpdateStatus={(b, nextStatus) => {
            onUpdateSingleBooking({ ...b, status: nextStatus }, `Durum güncellendi: ${nextStatus}`);
          }}
        />
      )}

      {activeTab === 'transfers' && (
        <TransfersTab
          bookings={bookings}
          manifestDate={manifestDate || new Date().toISOString().split('T')[0]}
          setManifestDate={setManifestDate || (() => {})}
          vehicles={vehicles}
          drivers={drivers}
          googleReviewUrl={siteSettings.googleReviewUrl}
          showToast={showToast}
          handleAssignVehicleToBooking={onAssignVehicle}
          handleAssignDriverToBooking={onAssignDriver}
          handleUpdatePickupStatus={onUpdatePickupStatus}
          handleUpdatePickupTime={onUpdatePickupTime}
          setWhatsAppModalBooking={onOpenWhatsApp}
          setVoucherBooking={onOpenVoucher}
          onOpenPoliceManifest={onOpenPoliceManifest}
          onOpenQrScanner={onOpenQrScanner}
          onOpenLostFound={onOpenLostFound}
          onOpenDietaryManifest={onOpenDietaryManifest}
          onOpenFieldCashier={onOpenFieldCashierBooking ? () => onOpenFieldCashierBooking() : undefined}
          onOpenFlightRadar={onOpenFlightRadar ? () => onOpenFlightRadar() : undefined}
          onOpenDriverExpense={onOpenDriverExpense}
          onOpenGuideExpense={onOpenGuideExpense}
          onOpenWelcomeBoard={onOpenWelcomeBoardBooking}
          onOpenLuggageExpress={onOpenLuggageExpress}
          onOpenCaptainVault={onOpenCaptainVault}
          onOpenCuratedProposal={onOpenCuratedProposal}
          onOpenWorkflow={onOpenWorkflow}
          pendingBookingIds={pendingBookingIds}
        />
      )}

      {activeTab === 'settlements' && perms.canViewFinancialMargins && (
        <SupplierSettlementManager
          bookings={bookings}
          onUpdateBooking={onUpdateSingleBooking}
          managerPhone={siteSettings.whatsappNumber}
        />
      )}

      {activeTab === 'finance' && perms.allowedTabs.includes('finance') && (
        <FinanceTab
          bookings={bookings}
          payments={payments}
          onAddPayment={onAddPayment}
          onUpdateBooking={onUpdateSingleBooking}
          showToast={showToast}
          setVoucherBooking={onOpenVoucher}
        />
      )}

      {activeTab === 'fleet' && (
        <FleetManager
          vehicles={vehicles}
          drivers={drivers}
          onSaveVehicles={saveVehicles}
          onSaveDrivers={saveDrivers}
          showToast={showToast}
        />
      )}

      {activeTab === 'partners' && (
        <PartnersTab
          agents={agents}
          bookings={bookings}
          onSaveAgents={saveAgents}
          showToast={showToast}
          managerPhone={siteSettings.whatsappNumber}
        />
      )}

      {activeTab === 'suppliers' && (
        <SuppliersTab
          suppliers={suppliers}
          tourCosts={tourCosts}
          tours={tours}
          onSaveSuppliers={saveSuppliers}
          onSaveTourCosts={saveTourCosts}
          showToast={showToast}
        />
      )}

      {activeTab === 'tours' && (
        <ToursTab
          tours={tours}
          filteredTours={filteredTours}
          tourSearchQuery={tourSearchQuery}
          setTourSearchQuery={setTourSearchQuery}
          tourCategoryFilter={tourCategoryFilter}
          setTourCategoryFilter={setTourCategoryFilter}
          tourCategoryOptions={tourCategoryOptions}
          categories={categories}
          onOpenCategoryModal={onOpenCategoryModal}
          getImageUrl={getImageUrl}
          onOpenCreate={onOpenCreateTour}
          onOpenEdit={onOpenEditTour}
          onToggleFeatured={onToggleTourFeatured}
          onDelete={onDeleteTour}
          onBulkUpdateTours={onBulkUpdateTours}
          onOpenMultiTourProposal={onOpenMultiTourProposal}
        />
      )}

      {activeTab === 'homepage' && (
        <HomeEditorTab
          homeSettings={homeSettings}
          setHomeSettings={setHomeSettings}
          onSave={onSaveHomeSettings}
          getImageUrl={getImageUrl}
          handleFileUpload={onFileUpload}
          allImageOptions={allImageOptions}
          mediaList={mediaList}
          showToast={showToast}
        />
      )}

      {activeTab === 'blogs' && (
        <BlogsTab
          blogs={blogs}
          onOpenCreate={onOpenCreateBlog}
          onOpenEdit={onOpenEditBlog}
          onDelete={onDeleteBlog}
        />
      )}

      {activeTab === 'services' && (
        <ServicesTab
          services={services}
          onOpenEdit={onOpenEditService}
        />
      )}

      {activeTab === 'faqs' && (
        <FaqsTab
          faqs={faqs}
          onOpenCreate={onOpenCreateFaq}
          onOpenEdit={onOpenEditFaq}
          onDelete={onDeleteFaq}
        />
      )}

      {activeTab === 'testimonials' && (
        <TestimonialsTab
          testimonials={testimonials}
          onOpenCreate={onOpenCreateTesti}
          onOpenEdit={onOpenEditTesti}
          onDelete={onDeleteTesti}
        />
      )}

      {activeTab === 'media' && (
        <MediaTab
          mediaSearchQuery={mediaSearchQuery}
          setMediaSearchQuery={setMediaSearchQuery}
          mediaTypeFilter={mediaTypeFilter}
          setMediaTypeFilter={setMediaTypeFilter}
          filteredMedia={filteredMedia}
          getImageUrl={getImageUrl}
          handleFileUpload={onFileUpload}
          onOpenUrlModal={onOpenAddMedia}
          setSelectedLightboxMedia={onSelectLightboxMedia}
          setAssignMediaModal={onAssignMedia}
          handleCopyMediaUrl={onCopyMediaUrl}
          handleDeleteMedia={onDeleteMedia}
          onUpdateMedia={onUpdateMedia}
        />
      )}

      {activeTab === 'whatsapp' && (
        <WhatsAppTab
          bookings={bookings}
          onUpdateBooking={onUpdateSingleBooking}
          showToast={showToast}
        />
      )}

      {activeTab === 'audit' && perms.canManageSettings && (
        <AuditLogTab showToast={showToast} />
      )}

      {activeTab === 'settings' && perms.canManageSettings && (
        <SettingsTab
          siteSettings={siteSettings}
          setSiteSettings={setSiteSettings}
          settingsSaved={settingsSaved}
          onSave={onSaveSiteSettings}
          getImageUrl={getImageUrl}
          handleFileUpload={onFileUpload}
          allImageOptions={allImageOptions}
          mediaList={mediaList}
          viewerRole={viewerRole}
          showToast={showToast}
          onExportSiteData={onExportSiteData}
          inclusionLibrary={inclusionLibrary}
          onRememberOption={onRememberOption}
          onForgetOption={onForgetOption}
        />
      )}

      {activeTab === 'users' && perms.canManageUsers && <UsersTab showToast={showToast} />}

      {activeTab === 'proposals' && (
        <div className="w-full">
          <CuratedProposalModal
            isOpen={true}
            isEmbedded={true}
            onClose={() => setActiveTab('transfers')}
            showToast={showToast}
            initialCustomerName="Begüm & Canberk Özkan"
            initialHotel="The Shore at Katathani"
            initialZone="Kata & Karon"
            onConvertToBooking={onConvertProposalToBooking}
          />
        </div>
      )}
    </>
  );
}
export type { DashboardTabsRendererProps } from './dashboardTabProps';
