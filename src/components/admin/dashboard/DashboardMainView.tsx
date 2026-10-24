import React from 'react';
import type { CategoryItem } from '../../../data/adminTypes';
import type { BlogItem, ServiceItem, FaqItem, TestimonialItem } from '../../../data/adminInitialData';
import { saveCmsCollection } from '../../../lib/cmsSync';
import { DashboardTabsRenderer } from './DashboardTabsRenderer';
import { DashboardCmsModalsHost } from './DashboardCmsModalsHost';
import { DashboardModalsHost } from './DashboardModalsHost';

export interface DashboardMainViewProps {
  nav: any;
  modals: any;
  coll: any;
  bk: any;
  availableImages: string[];
  viewerRole: any;
  showToast: (msg: string) => void;
  onOpenCreateBooking: () => void;
  onOpenEditBooking: (b: any) => void;
  onDeleteBooking: (id: string, name: string) => void;
  onSubmitBooking: (e: React.FormEvent) => void;
  onOpenCreateTour: () => void;
  onOpenEditTour: (t: any) => void;
  onDeleteTour: (id: string, title: string) => void;
  onSubmitTour: (e: React.FormEvent) => void;
  onExportCSV: () => void;
  onExportSiteData: () => void;
}

export function DashboardMainView({
  nav,
  modals,
  coll,
  bk,
  availableImages,
  viewerRole,
  showToast,
  onOpenCreateBooking,
  onOpenEditBooking,
  onDeleteBooking,
  onSubmitBooking,
  onOpenCreateTour,
  onOpenEditTour,
  onDeleteTour,
  onSubmitTour,
  onExportCSV,
  onExportSiteData,
}: DashboardMainViewProps) {
  return (
    <>
      <DashboardTabsRenderer
        activeTab={nav.activeTab}
        setActiveTab={nav.setActiveTab}
        stats={bk.stats}
        bookings={bk.bookings}
        filteredBookings={bk.filteredBookings}
        searchQuery={bk.searchQuery}
        setSearchQuery={bk.setSearchQuery}
        statusFilter={bk.statusFilter}
        setStatusFilter={bk.setStatusFilter}
        dateFilter={bk.dateFilter}
        setDateFilter={bk.setDateFilter}
        tours={coll.tours}
        services={coll.services}
        blogs={coll.blogs}
        faqs={coll.faqs}
        testimonials={coll.testimonials}
        mediaList={coll.mediaList}
        vehicles={coll.vehicles}
        drivers={coll.drivers}
        agents={coll.agents}
        suppliers={coll.suppliers}
        tourCosts={coll.tourCosts}
        payments={coll.payments}
        categories={coll.categories}
        tourCategoryOptions={coll.tourCategoryOptions}
        tourSearchQuery={coll.tourSearchQuery}
        setTourSearchQuery={coll.setTourSearchQuery}
        tourCategoryFilter={coll.tourCategoryFilter}
        setTourCategoryFilter={coll.setTourCategoryFilter}
        siteSettings={coll.siteSettings}
        homeSettings={coll.homeSettings}
        setHomeSettings={coll.setHomeSettings}
        perms={nav.perms}
        pendingBookingIds={bk.pendingBookingIds}
        showToast={showToast}
        sync={{
          isOnline: bk.isOnline ?? true,
          isCloudConnected: bk.isCloudConnected ?? false,
          isSyncing: bk.isSyncing ?? false,
          pendingSyncCount: bk.pendingSyncCount ?? 0,
          failedSyncItems: bk.failedSyncItems ?? [],
          lastSyncedAt: bk.lastSyncedAt ?? null,
        }}
        onOpenCreateBooking={nav.perms.canCreateBookings ? onOpenCreateBooking : undefined}
        onOpenEditBooking={onOpenEditBooking}
        onDeleteBooking={onDeleteBooking}
        onOpenQrScanner={() => modals.setIsQrScannerOpen(true)}
        onOpenPoliceManifest={() => modals.setIsPoliceManifestOpen(true)}
        onOpenBulkReschedule={nav.perms.canAssignTransfers ? () => modals.setIsBulkRescheduleOpen(true) : undefined}
        onOpenWorkflow={(b) => modals.setWorkflowBooking(b)}
        onOpenVoucher={(b) => modals.setVoucherBooking(b)}
        onOpenWhatsApp={(b) => modals.setWhatsAppModalBooking(b)}
        onOpenCuratedProposal={(d) => modals.setCuratedProposalData(d)}
        onOpenFieldCashierBooking={(b) => {
          modals.setCashierBooking(b);
          modals.setIsFieldCashierOpen(true);
        }}
        onOpenWelcomeBoardBooking={(b) => {
          modals.setWelcomeBoardBooking(b);
          modals.setIsWelcomeBoardOpen(true);
        }}
        onOpenPromptPayBooking={(b) => {
          modals.setPromptPayQrBooking(b);
          modals.setIsPromptPayQrOpen(true);
        }}
        onOpenTourMediaBooking={(b) => {
          modals.setTourMediaBooking(b);
          modals.setIsTourMediaOpen(true);
        }}
        onOpenSupplierDispatchBooking={(b) => {
          modals.setSupplierDispatchBooking(b);
          modals.setIsSupplierDispatchOpen(true);
        }}
        onUpdatePickupStatus={bk.handleUpdatePickupStatus}
        onAssignVehicle={bk.handleAssignVehicleToBooking}
        onAssignDriver={bk.handleAssignDriverToBooking}
        onUpdatePickupTime={bk.handleUpdatePickupTime}
        onExportCSV={onExportCSV}
        onExportSiteData={onExportSiteData}
        onOpenCreateTour={onOpenCreateTour}
        onOpenEditTour={onOpenEditTour}
        onDeleteTour={onDeleteTour}
        onToggleTourFeatured={(id) => {
          coll.saveTours(coll.tours.map((t: any) => (t.id === id ? { ...t, featured: !t.featured } : t)));
        }}
        onOpenCreateCategory={() => {
          modals.setEditingCategory(null);
          modals.setCategoryFormData({ label_tr: '', slug: '', active: true });
          modals.setIsCategoryModalOpen(true);
        }}
        onOpenEditCategory={(c) => {
          modals.setEditingCategory(c);
          modals.setCategoryFormData(c);
          modals.setIsCategoryModalOpen(true);
        }}
        onDeleteCategory={(id) => {
          coll.saveCategories(coll.categories.filter((c: any) => c.id !== id));
        }}
        onOpenCreateBlog={() => {
          modals.setEditingBlog(null);
          modals.setBlogFormData({ title: '', excerpt: '', date: new Date().toISOString().split('T')[0] });
          modals.setIsBlogModalOpen(true);
        }}
        onOpenEditBlog={(b) => {
          modals.setEditingBlog(b);
          modals.setBlogFormData(b);
          modals.setIsBlogModalOpen(true);
        }}
        onDeleteBlog={(id) => coll.saveBlogs(coll.blogs.filter((b: any) => b.id !== id))}
        onOpenEditService={(s) => {
          modals.setEditingService(s);
          modals.setServiceFormData(s);
          modals.setIsServiceModalOpen(true);
        }}
        onOpenCreateFaq={() => {
          modals.setEditingFaq(null);
          modals.setFaqFormData({ question: '', answer: '' });
          modals.setIsFaqModalOpen(true);
        }}
        onOpenEditFaq={(f) => {
          modals.setEditingFaq(f);
          modals.setFaqFormData(f);
          modals.setIsFaqModalOpen(true);
        }}
        onDeleteFaq={(id) => coll.saveFaqs(coll.faqs.filter((f: any) => f.id !== id))}
        onOpenCreateTesti={() => {
          modals.setEditingTesti(null);
          modals.setTestiFormData({ name: '', text: '', stars: 5 });
          modals.setIsTestiModalOpen(true);
        }}
        onOpenEditTesti={(t) => {
          modals.setEditingTesti(t);
          modals.setTestiFormData(t);
          modals.setIsTestiModalOpen(true);
        }}
        onDeleteTesti={(id) => coll.saveTestimonials(coll.testimonials.filter((t: any) => t.id !== id))}
        onOpenAddMedia={() => modals.setIsAddMediaModalOpen(true)}
        onSelectLightboxMedia={(m) => modals.setSelectedLightboxMedia(m)}
        onAssignMedia={(m) => modals.setAssignMediaModal(m)}
        onDeleteMedia={(id) => coll.saveMediaList(coll.mediaList.filter((m: any) => m.id !== id))}
        onFileUpload={coll.handleFileUpload}
        mediaSearchQuery={coll.mediaSearchQuery}
        setMediaSearchQuery={coll.setMediaSearchQuery}
        mediaTypeFilter={coll.mediaTypeFilter}
        setMediaTypeFilter={coll.setMediaTypeFilter}
        saveVehicles={coll.saveVehicles}
        saveDrivers={coll.saveDrivers}
        saveAgents={coll.saveAgents}
        saveSuppliers={coll.saveSuppliers}
        saveTourCosts={coll.saveTourCosts}
        savePayments={coll.savePayments}
        setSiteSettings={coll.setSiteSettings}
        onSaveSiteSettings={coll.handleSaveSettings}
        settingsSaved={coll.settingsSaved}
        onSaveHomeSettings={(e) => {
          e.preventDefault();
          saveCmsCollection('home-settings', coll.homeSettings, showToast);
        }}
        onConvertProposalToBooking={(bookingData) => {
          modals.setCuratedProposalData(null);
          modals.setEditingBooking(null);
          modals.setFormData(bookingData);
          modals.setIsModalOpen(true);
          showToast('🎉 Teklif başarıyla yeni rezervasyon formuna aktarıldı!');
        }}
        viewerRole={viewerRole}
      />

      <DashboardCmsModalsHost
        isModalOpen={modals.isModalOpen}
        setIsModalOpen={modals.setIsModalOpen}
        editingBooking={modals.editingBooking}
        formData={modals.formData}
        setFormData={modals.setFormData}
        onSubmitBooking={onSubmitBooking}
        tours={coll.tours}
        vehicles={coll.vehicles}
        drivers={coll.drivers}
        onOpenCreateTour={onOpenCreateTour}
        isTourModalOpen={modals.isTourModalOpen}
        setIsTourModalOpen={modals.setIsTourModalOpen}
        editingTour={modals.editingTour}
        tourFormData={modals.tourFormData}
        setTourFormData={modals.setTourFormData}
        onSubmitTour={onSubmitTour}
        categories={coll.categories}
        inclusionLibrary={coll.inclusionLibrary}
        onRememberOption={coll.rememberLibraryOption}
        onForgetOption={coll.forgetLibraryOption}
        availableImages={availableImages}
        isCategoryModalOpen={modals.isCategoryModalOpen}
        setIsCategoryModalOpen={modals.setIsCategoryModalOpen}
        editingCategory={modals.editingCategory}
        categoryFormData={modals.categoryFormData}
        setCategoryFormData={modals.setCategoryFormData}
        onSubmitCategory={(e) => {
          e.preventDefault();
          if (!modals.categoryFormData.label_tr) return;
          if (modals.editingCategory) {
            coll.saveCategories(
              coll.categories.map((c: any) =>
                c.id === modals.editingCategory?.id ? ({ ...c, ...modals.categoryFormData } as CategoryItem) : c
              )
            );
          } else {
            const slug = modals.categoryFormData.slug || modals.categoryFormData.label_tr.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            coll.saveCategories([...coll.categories, { id: slug, slug, label_tr: modals.categoryFormData.label_tr, active: true }]);
          }
          modals.setIsCategoryModalOpen(false);
        }}
        isBlogModalOpen={modals.isBlogModalOpen}
        setIsBlogModalOpen={modals.setIsBlogModalOpen}
        editingBlog={modals.editingBlog}
        blogFormData={modals.blogFormData}
        setBlogFormData={modals.setBlogFormData}
        onSubmitBlog={(e) => {
          e.preventDefault();
          if (!modals.blogFormData.title) return;
          if (modals.editingBlog) {
            coll.saveBlogs(coll.blogs.map((b: any) => (b.id === modals.editingBlog?.id ? ({ ...b, ...modals.blogFormData } as BlogItem) : b)));
          } else {
            const slug = modals.blogFormData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            coll.saveBlogs([...coll.blogs, { id: slug, title: modals.blogFormData.title, date: new Date().toISOString().split('T')[0] }]);
          }
          modals.setIsBlogModalOpen(false);
        }}
        isServiceModalOpen={modals.isServiceModalOpen}
        setIsServiceModalOpen={modals.setIsServiceModalOpen}
        editingService={modals.editingService}
        serviceFormData={modals.serviceFormData}
        setServiceFormData={modals.setServiceFormData}
        onSubmitService={(e) => {
          e.preventDefault();
          if (!modals.editingService) return;
          coll.saveServices(coll.services.map((s: any) => (s.slug === modals.editingService?.slug ? ({ ...s, ...modals.serviceFormData } as ServiceItem) : s)));
          modals.setIsServiceModalOpen(false);
        }}
        isFaqModalOpen={modals.isFaqModalOpen}
        setIsFaqModalOpen={modals.setIsFaqModalOpen}
        editingFaq={modals.editingFaq}
        faqFormData={modals.faqFormData}
        setFaqFormData={modals.setFaqFormData}
        onSubmitFaq={(e) => {
          e.preventDefault();
          if (!modals.faqFormData.question) return;
          if (modals.editingFaq) {
            coll.saveFaqs(coll.faqs.map((f: any) => (f.id === modals.editingFaq?.id ? ({ ...f, ...modals.faqFormData } as FaqItem) : f)));
          } else {
            coll.saveFaqs([...coll.faqs, { id: `faq-${Date.now()}`, question: modals.faqFormData.question, answer: modals.faqFormData.answer || '' }]);
          }
          modals.setIsFaqModalOpen(false);
        }}
        isTestiModalOpen={modals.isTestiModalOpen}
        setIsTestiModalOpen={modals.setIsTestiModalOpen}
        editingTesti={modals.editingTesti}
        testiFormData={modals.testiFormData}
        setTestiFormData={modals.setTestiFormData}
        onSubmitTesti={(e) => {
          e.preventDefault();
          if (!modals.testiFormData.name) return;
          if (modals.editingTesti) {
            coll.saveTestimonials(coll.testimonials.map((t: any) => (t.id === modals.editingTesti?.id ? ({ ...t, ...modals.testiFormData } as TestimonialItem) : t)));
          } else {
            coll.saveTestimonials([...coll.testimonials, { id: `testi-${Date.now()}`, name: modals.testiFormData.name, text: modals.testiFormData.text || '', stars: modals.testiFormData.stars || 5 }]);
          }
          modals.setIsTestiModalOpen(false);
        }}
        isAddMediaModalOpen={modals.isAddMediaModalOpen}
        setIsAddMediaModalOpen={modals.setIsAddMediaModalOpen}
        mediaUploadMode="file"
        setMediaUploadMode={() => {}}
        newMediaTitle=""
        setNewMediaTitle={() => {}}
        newMediaUrl=""
        setNewMediaUrl={() => {}}
        onAddMediaSubmit={() => {}}
        onFileUpload={coll.handleFileUpload}
        selectedLightboxMedia={modals.lightboxMedia}
        setSelectedLightboxMedia={modals.setLightboxMedia}
        onCopyMediaUrl={(url) => {
          navigator.clipboard.writeText(url);
          showToast('Görsel bağlantısı panoya kopyalandı! 📋');
        }}
        assignMediaModal={modals.assignMediaModal}
        setAssignMediaModal={modals.setAssignMediaModal}
        onAddMediaToTourGallery={(url, tourId) => {
          coll.saveTours(coll.tours.map((t: any) => (t.id === tourId ? { ...t, gallery: [...(t.gallery || []), url] } : t)));
          modals.setAssignMediaModal(null);
          showToast('Görsel tura eklendi!');
        }}
        onAssignMediaAsTourCover={(url, tourId) => {
          coll.saveTours(coll.tours.map((t: any) => (t.id === tourId ? { ...t, image: url } : t)));
          modals.setAssignMediaModal(null);
          showToast('Görsel tur kapağı yapıldı!');
        }}
      />

      <DashboardModalsHost
        voucherBooking={modals.voucherBooking}
        setVoucherBooking={modals.setVoucherBooking}
        whatsappNumber={coll.siteSettings.whatsappNumber}
        whatsAppModalBooking={modals.whatsAppModalBooking}
        setWhatsAppModalBooking={modals.setWhatsAppModalBooking}
        isPoliceManifestOpen={modals.isPoliceManifestOpen}
        setIsPoliceManifestOpen={modals.setIsPoliceManifestOpen}
        manifestDate={bk.manifestDate}
        bookings={bk.bookings}
        onUpdateBookingPassengers={bk.handleUpdateBookingPassengers}
        isQrScannerOpen={modals.isQrScannerOpen}
        setIsQrScannerOpen={modals.setIsQrScannerOpen}
        onQrScanResult={bk.handleQrScanResult}
        isCommandPaletteOpen={modals.isCommandPaletteOpen}
        setIsCommandPaletteOpen={modals.setIsCommandPaletteOpen}
        visibleNavItems={nav.visibleNavItems}
        onSelectTab={nav.handleTabSelect}
        onOpenCreateBooking={onOpenCreateBooking}
        onOpenBulkReschedule={nav.perms.canAssignTransfers ? () => modals.setIsBulkRescheduleOpen(true) : () => {}}
        onOpenLostFound={() => modals.setIsLostFoundOpen(true)}
        onOpenDietaryManifest={() => modals.setIsDietaryManifestOpen(true)}
        onOpenFieldCashier={() => {
          modals.setCashierBooking(null);
          modals.setIsFieldCashierOpen(true);
        }}
        onSelectBooking={onOpenEditBooking}
        tours={coll.tours}
        onSelectTour={onOpenEditTour}
        onOpenWorkflow={(b) => modals.setWorkflowBooking(b)}
        onSetNavMode={(mode) => nav.handleSelectCategory(mode)}
        isBulkRescheduleOpen={modals.isBulkRescheduleOpen}
        setIsBulkRescheduleOpen={modals.setIsBulkRescheduleOpen}
        onBulkReschedule={bk.handleBulkReschedule}
        isLostFoundOpen={modals.isLostFoundOpen}
        setIsLostFoundOpen={modals.setIsLostFoundOpen}
        showToast={showToast}
        isDietaryManifestOpen={modals.isDietaryManifestOpen}
        setIsDietaryManifestOpen={modals.setIsDietaryManifestOpen}
        isFieldCashierOpen={modals.isFieldCashierOpen}
        setIsFieldCashierOpen={modals.setIsFieldCashierOpen}
        cashierBooking={modals.cashierBooking}
        setCashierBooking={modals.setCashierBooking}
        onRecordPayment={(payment) => {
          coll.handleAddPayment({
            bookingId: payment.bookingId || modals.cashierBooking?.id || '',
            amountThb: payment.amountThb,
            method: 'cash_thb',
            collectedBy: 'Saha Kasa / Şoför',
            note: payment.note,
          });
        }}
        isFlightRadarOpen={modals.isFlightRadarOpen}
        setIsFlightRadarOpen={modals.setIsFlightRadarOpen}
        flightRadarFlight={modals.flightRadarFlight}
        flightRadarGuest={modals.flightRadarGuest}
        isDriverExpenseOpen={modals.isDriverExpenseOpen}
        setIsDriverExpenseOpen={modals.setIsDriverExpenseOpen}
        drivers={coll.drivers}
        vehicles={coll.vehicles}
        isGuideExpenseOpen={modals.isGuideExpenseOpen}
        setIsGuideExpenseOpen={modals.setIsGuideExpenseOpen}
        isWelcomeBoardOpen={modals.isWelcomeBoardOpen}
        setIsWelcomeBoardOpen={modals.setIsWelcomeBoardOpen}
        welcomeBoardBooking={modals.welcomeBoardBooking}
        isTourMediaOpen={modals.isTourMediaOpen}
        setIsTourMediaOpen={modals.setIsTourMediaOpen}
        tourMediaBooking={modals.tourMediaBooking}
        isLuggageExpressOpen={modals.isLuggageExpressOpen}
        setIsLuggageExpressOpen={modals.setIsLuggageExpressOpen}
        isPierManifestOpen={modals.isPierManifestOpen}
        setIsPierManifestOpen={modals.setIsPierManifestOpen}
        isSupplierDispatchOpen={modals.isSupplierDispatchOpen}
        setIsSupplierDispatchOpen={modals.setIsSupplierDispatchOpen}
        supplierDispatchBooking={modals.supplierDispatchBooking}
        setSupplierDispatchBooking={modals.setSupplierDispatchBooking}
        suppliers={coll.suppliers}
        onUpdateSupplierStatus={bk.handleUpdateSupplierStatus}
        isPromptPayQrOpen={modals.isPromptPayQrOpen}
        setIsPromptPayQrOpen={modals.setIsPromptPayQrOpen}
        promptPayQrBooking={modals.promptPayQrBooking}
        setPromptPayQrBooking={modals.setPromptPayQrBooking}
        curatedProposalData={modals.curatedProposalData}
        setCuratedProposalData={modals.setCuratedProposalData}
        onConvertProposalToBooking={(bookingData) => {
          modals.setCuratedProposalData(null);
          modals.setEditingBooking(null);
          modals.setFormData(bookingData);
          modals.setIsModalOpen(true);
          showToast('🎉 Teklif başarıyla yeni rezervasyon formuna aktarıldı!');
        }}
        isCaptainDrawerOpen={modals.isCaptainDrawerOpen}
        setIsCaptainDrawerOpen={modals.setIsCaptainDrawerOpen}
        workflowBooking={modals.workflowBooking}
        setWorkflowBooking={modals.setWorkflowBooking}
        onUpdateSingleBooking={bk.handleUpdateSingleBooking}
        conflictBooking={modals.conflictBooking}
        setConflictBooking={modals.setConflictBooking}
        onAcceptServerConflict={bk.handleAcceptServerConflict}
        onForceOverwriteConflict={bk.handleForceOverwriteConflict}
        confirmModal={modals.confirmModal}
        setConfirmModal={modals.setConfirmModal}
      />
    </>
  );
}
