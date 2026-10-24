import React from 'react';
import type { Booking, TourItem, DriverItem, VehicleItem, SupplierItem, PassengerItem } from '../../../data/adminInitialData';
import type { ConflictData } from '../ConflictResolutionModal';
import { buildDailyPickups } from '../../../lib/adminFilters';
import { fmtMoney } from '../../../lib/moneyFormat';
import type { NavItem, AdminTab } from '../adminNav';

// Lazy-loaded modals
const BoardingPassModal = React.lazy(() => import('../../shared/BoardingPassModal'));
const WhatsAppTemplatesModal = React.lazy(() => import('../../shared/WhatsAppTemplatesModal'));
const MarinePoliceManifestModal = React.lazy(() => import('../../shared/MarinePoliceManifestModal'));
const QrScannerModal = React.lazy(() => import('../../shared/QrScannerModal'));
const CommandPaletteModal = React.lazy(() => import('../CommandPaletteModal'));
const BulkRescheduleModal = React.lazy(() => import('../BulkRescheduleModal'));
const LostFoundModal = React.lazy(() => import('../LostFoundModal'));
const DietaryManifestModal = React.lazy(() => import('../DietaryManifestModal'));
const FieldCashierModal = React.lazy(() => import('../FieldCashierModal'));
const FlightRadarModal = React.lazy(() => import('../FlightRadarModal'));
const DriverExpenseModal = React.lazy(() => import('../DriverExpenseModal'));
const GuideExpenseModal = React.lazy(() => import('../GuideExpenseModal'));
const WelcomeBoardModal = React.lazy(() => import('../WelcomeBoardModal'));
const TourMediaModal = React.lazy(() => import('../TourMediaModal'));
const LuggageExpressModal = React.lazy(() => import('../LuggageExpressModal'));
const PierManifestModal = React.lazy(() => import('../PierManifestModal'));
const SupplierDispatchModal = React.lazy(() => import('../SupplierDispatchModal'));
const PromptPayQrModal = React.lazy(() => import('../../shared/PromptPayQrModal'));
const CuratedProposalModal = React.lazy(() => import('../CuratedProposalModal'));
const CaptainOfflineDrawer = React.lazy(() => import('../CaptainOfflineDrawer'));
const BookingWorkflowModal = React.lazy(() => import('../BookingWorkflowModal'));
const ConflictResolutionModal = React.lazy(() => import('../ConflictResolutionModal'));
import AdminConfirmModal from '../shared/AdminConfirmModal';

export interface DashboardModalsHostProps {
  voucherBooking: Booking | null;
  setVoucherBooking: (b: Booking | null) => void;
  whatsappNumber?: string;
  whatsAppModalBooking: Booking | null;
  setWhatsAppModalBooking: (b: Booking | null) => void;
  isPoliceManifestOpen: boolean;
  setIsPoliceManifestOpen: (v: boolean) => void;
  manifestDate: string;
  bookings: Booking[];
  onUpdateBookingPassengers: (bookingId: string, passengers: PassengerItem[]) => void;
  isQrScannerOpen: boolean;
  setIsQrScannerOpen: (v: boolean) => void;
  onQrScanResult: (code: string, tourIndex: number) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (v: boolean) => void;
  visibleNavItems: NavItem[];
  onSelectTab: (tabId: AdminTab) => void;
  onOpenCreateBooking: () => void;
  onOpenBulkReschedule: () => void;
  onOpenLostFound: () => void;
  onOpenDietaryManifest: () => void;
  onOpenFieldCashier: () => void;
  onSelectBooking: (b: Booking) => void;
  tours: TourItem[];
  onSelectTour: (t: TourItem) => void;
  onOpenWorkflow: (b: Booking) => void;
  onSetNavMode: (mode: 'operations' | 'cms') => void;
  isBulkRescheduleOpen: boolean;
  setIsBulkRescheduleOpen: (v: boolean) => void;
  onBulkReschedule: (ids: string[], date: string, reason: string) => Promise<void>;
  isLostFoundOpen: boolean;
  setIsLostFoundOpen: (v: boolean) => void;
  showToast: (msg: string) => void;
  isDietaryManifestOpen: boolean;
  setIsDietaryManifestOpen: (v: boolean) => void;
  isFieldCashierOpen: boolean;
  setIsFieldCashierOpen: (v: boolean) => void;
  cashierBooking: Booking | null;
  setCashierBooking: (b: Booking | null) => void;
  onRecordPayment: (payment: { bookingId?: string; amountThb: number; note?: string }) => void;
  isFlightRadarOpen: boolean;
  setIsFlightRadarOpen: (v: boolean) => void;
  flightRadarFlight: string;
  flightRadarGuest: string;
  isDriverExpenseOpen: boolean;
  setIsDriverExpenseOpen: (v: boolean) => void;
  drivers: DriverItem[];
  vehicles: VehicleItem[];
  isGuideExpenseOpen: boolean;
  setIsGuideExpenseOpen: (v: boolean) => void;
  isWelcomeBoardOpen: boolean;
  setIsWelcomeBoardOpen: (v: boolean) => void;
  welcomeBoardBooking: Booking | null;
  isTourMediaOpen: boolean;
  setIsTourMediaOpen: (v: boolean) => void;
  tourMediaBooking: Booking | null;
  isLuggageExpressOpen: boolean;
  setIsLuggageExpressOpen: (v: boolean) => void;
  isPierManifestOpen: boolean;
  setIsPierManifestOpen: (v: boolean) => void;
  isSupplierDispatchOpen: boolean;
  setIsSupplierDispatchOpen: (v: boolean) => void;
  supplierDispatchBooking: Booking | null;
  setSupplierDispatchBooking: (b: Booking | null) => void;
  suppliers: SupplierItem[];
  onUpdateSupplierStatus: (bookingId: string, status: 'pending' | 'confirmed' | 'cancelled', refCode?: string) => void;
  isPromptPayQrOpen: boolean;
  setIsPromptPayQrOpen: (v: boolean) => void;
  promptPayQrBooking: Booking | null;
  setPromptPayQrBooking: (b: Booking | null) => void;
  curatedProposalData: any;
  setCuratedProposalData: (data: any) => void;
  onConvertProposalToBooking: (bookingData: any) => void;
  isCaptainDrawerOpen: boolean;
  setIsCaptainDrawerOpen: (v: boolean) => void;
  workflowBooking: Booking | null;
  setWorkflowBooking: (b: Booking | null) => void;
  onUpdateSingleBooking: (b: Booking) => Promise<boolean>;
  conflictBooking: ConflictData | null;
  setConflictBooking: (c: ConflictData | null) => void;
  onAcceptServerConflict: () => void;
  onForceOverwriteConflict: (b: Booking) => void;
  confirmModal: {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  } | null;
  setConfirmModal: (modal: any) => void;
}

export function DashboardModalsHost({
  voucherBooking,
  setVoucherBooking,
  whatsappNumber,
  whatsAppModalBooking,
  setWhatsAppModalBooking,
  isPoliceManifestOpen,
  setIsPoliceManifestOpen,
  manifestDate,
  bookings,
  onUpdateBookingPassengers,
  isQrScannerOpen,
  setIsQrScannerOpen,
  onQrScanResult,
  isCommandPaletteOpen,
  setIsCommandPaletteOpen,
  visibleNavItems,
  onSelectTab,
  onOpenCreateBooking,
  onOpenBulkReschedule,
  onOpenLostFound,
  onOpenDietaryManifest,
  onOpenFieldCashier,
  onSelectBooking,
  tours,
  onSelectTour,
  onOpenWorkflow,
  onSetNavMode,
  isBulkRescheduleOpen,
  setIsBulkRescheduleOpen,
  onBulkReschedule,
  isLostFoundOpen,
  setIsLostFoundOpen,
  showToast,
  isDietaryManifestOpen,
  setIsDietaryManifestOpen,
  isFieldCashierOpen,
  setIsFieldCashierOpen,
  cashierBooking,
  setCashierBooking,
  onRecordPayment,
  isFlightRadarOpen,
  setIsFlightRadarOpen,
  flightRadarFlight,
  flightRadarGuest,
  isDriverExpenseOpen,
  setIsDriverExpenseOpen,
  drivers,
  vehicles,
  isGuideExpenseOpen,
  setIsGuideExpenseOpen,
  isWelcomeBoardOpen,
  setIsWelcomeBoardOpen,
  welcomeBoardBooking,
  isTourMediaOpen,
  setIsTourMediaOpen,
  tourMediaBooking,
  isLuggageExpressOpen,
  setIsLuggageExpressOpen,
  isPierManifestOpen,
  setIsPierManifestOpen,
  isSupplierDispatchOpen,
  setIsSupplierDispatchOpen,
  supplierDispatchBooking,
  setSupplierDispatchBooking,
  suppliers,
  onUpdateSupplierStatus,
  isPromptPayQrOpen,
  setIsPromptPayQrOpen,
  promptPayQrBooking,
  setPromptPayQrBooking,
  curatedProposalData,
  setCuratedProposalData,
  onConvertProposalToBooking,
  isCaptainDrawerOpen,
  setIsCaptainDrawerOpen,
  workflowBooking,
  setWorkflowBooking,
  onUpdateSingleBooking,
  conflictBooking,
  setConflictBooking,
  onAcceptServerConflict,
  onForceOverwriteConflict,
  confirmModal,
  setConfirmModal,
}: DashboardModalsHostProps) {
  return (
    <>
      {voucherBooking && (
        <BoardingPassModal
          booking={voucherBooking}
          tourIndex={0}
          managerPhone={whatsappNumber}
          onClose={() => setVoucherBooking(null)}
        />
      )}

      {whatsAppModalBooking && (
        <WhatsAppTemplatesModal
          booking={whatsAppModalBooking}
          managerPhone={whatsappNumber}
          onClose={() => setWhatsAppModalBooking(null)}
        />
      )}

      {isPoliceManifestOpen && (
        <MarinePoliceManifestModal
          date={manifestDate}
          bookings={bookings.filter(
            (b) =>
              b.tourDate === manifestDate ||
              b.tours?.some((t) => t.tourDate === manifestDate)
          )}
          onUpdatePassengers={onUpdateBookingPassengers}
          onClose={() => setIsPoliceManifestOpen(false)}
        />
      )}

      {isQrScannerOpen && (
        <QrScannerModal
          isOpen={isQrScannerOpen}
          onClose={() => setIsQrScannerOpen(false)}
          onScanResult={onQrScanResult}
        />
      )}

      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        bookings={bookings}
        navItems={visibleNavItems}
        onSelectTab={onSelectTab}
        onOpenCreateBooking={onOpenCreateBooking}
        onOpenQrScanner={() => setIsQrScannerOpen(true)}
        onOpenPoliceManifest={() => setIsPoliceManifestOpen(true)}
        onOpenBulkReschedule={onOpenBulkReschedule}
        onOpenLostFound={onOpenLostFound}
        onOpenDietaryManifest={onOpenDietaryManifest}
        onOpenFieldCashier={onOpenFieldCashier}
        onSelectBooking={onSelectBooking}
        tours={tours}
        onSelectTour={onSelectTour}
        onOpenWorkflow={onOpenWorkflow}
        onSetNavMode={onSetNavMode}
      />

      {isBulkRescheduleOpen && (
        <BulkRescheduleModal
          isOpen={isBulkRescheduleOpen}
          onClose={() => setIsBulkRescheduleOpen(false)}
          bookings={bookings}
          onBulkReschedule={onBulkReschedule}
          managerPhone={whatsappNumber}
        />
      )}

      {isLostFoundOpen && (
        <LostFoundModal
          isOpen={isLostFoundOpen}
          onClose={() => setIsLostFoundOpen(false)}
          showToast={showToast}
        />
      )}

      {isDietaryManifestOpen && (
        <DietaryManifestModal
          isOpen={isDietaryManifestOpen}
          onClose={() => setIsDietaryManifestOpen(false)}
          bookings={bookings}
          showToast={showToast}
          defaultDate={manifestDate}
        />
      )}

      {isFieldCashierOpen && (
        <FieldCashierModal
          isOpen={isFieldCashierOpen}
          onClose={() => {
            setIsFieldCashierOpen(false);
            setCashierBooking(null);
          }}
          bookings={bookings}
          initialBooking={cashierBooking}
          showToast={showToast}
          onRecordPayment={onRecordPayment}
        />
      )}

      {isFlightRadarOpen && (
        <FlightRadarModal
          isOpen={isFlightRadarOpen}
          onClose={() => setIsFlightRadarOpen(false)}
          bookings={bookings}
          initialFlight={flightRadarFlight}
          initialGuestName={flightRadarGuest}
          showToast={showToast}
        />
      )}

      {isDriverExpenseOpen && (
        <DriverExpenseModal
          isOpen={isDriverExpenseOpen}
          onClose={() => setIsDriverExpenseOpen(false)}
          drivers={drivers}
          vehicles={vehicles}
          showToast={showToast}
        />
      )}

      {isGuideExpenseOpen && (
        <GuideExpenseModal
          isOpen={isGuideExpenseOpen}
          onClose={() => setIsGuideExpenseOpen(false)}
          drivers={drivers}
          showToast={showToast}
        />
      )}

      {isWelcomeBoardOpen && (
        <WelcomeBoardModal
          isOpen={isWelcomeBoardOpen}
          onClose={() => setIsWelcomeBoardOpen(false)}
          bookings={bookings}
          drivers={drivers}
          initialBooking={welcomeBoardBooking}
          showToast={showToast}
        />
      )}

      {isTourMediaOpen && (
        <TourMediaModal
          isOpen={isTourMediaOpen}
          onClose={() => setIsTourMediaOpen(false)}
          bookings={bookings}
          initialBooking={tourMediaBooking}
          showToast={showToast}
        />
      )}

      {isLuggageExpressOpen && (
        <LuggageExpressModal
          isOpen={isLuggageExpressOpen}
          onClose={() => setIsLuggageExpressOpen(false)}
          bookings={bookings}
          drivers={drivers}
          showToast={showToast}
        />
      )}

      {isPierManifestOpen && (
        <PierManifestModal
          isOpen={isPierManifestOpen}
          onClose={() => setIsPierManifestOpen(false)}
          bookings={bookings}
          showToast={showToast}
        />
      )}

      {isSupplierDispatchOpen && supplierDispatchBooking && (
        <SupplierDispatchModal
          isOpen={isSupplierDispatchOpen}
          onClose={() => {
            setIsSupplierDispatchOpen(false);
            setSupplierDispatchBooking(null);
          }}
          booking={supplierDispatchBooking}
          suppliers={suppliers}
          onUpdateBookingSupplierStatus={onUpdateSupplierStatus}
          showToast={showToast}
        />
      )}

      {isPromptPayQrOpen && promptPayQrBooking && (
        <PromptPayQrModal
          isOpen={isPromptPayQrOpen}
          onClose={() => {
            setIsPromptPayQrOpen(false);
            setPromptPayQrBooking(null);
          }}
          bookingRef={promptPayQrBooking.ticketCode || promptPayQrBooking.id}
          customerName={promptPayQrBooking.customerName}
          initialAmountThb={
            (promptPayQrBooking.remainingAmountThb || 0) > 0
              ? promptPayQrBooking.remainingAmountThb
              : promptPayQrBooking.totalPriceThb
          }
          promptPayTarget={whatsappNumber}
          onMarkPaid={(amt) => {
            onRecordPayment({
              bookingId: promptPayQrBooking.id,
              amountThb: amt,
              note: `PromptPay ile tahsil edildi (${promptPayQrBooking.customerName})`,
            });
            showToast(`✅ ${fmtMoney(amt)} THB PromptPay tahsilatı işlendi!`);
          }}
          showToast={showToast}
        />
      )}

      {curatedProposalData && (
        <CuratedProposalModal
          isOpen={Boolean(curatedProposalData)}
          onClose={() => setCuratedProposalData(null)}
          showToast={showToast}
          initialCustomerName={curatedProposalData.customerName}
          initialHotel={curatedProposalData.hotel}
          initialZone={curatedProposalData.zone}
          initialPhone={curatedProposalData.phone}
          initialProposalType={curatedProposalData.proposalType}
          initialTourTitle={curatedProposalData.tourTitle}
          initialTourDate={curatedProposalData.tourDate}
          initialAdultCount={curatedProposalData.adultCount}
          initialChildCount={curatedProposalData.childCount}
          onConvertToBooking={onConvertProposalToBooking}
        />
      )}

      {isCaptainDrawerOpen && (
        <CaptainOfflineDrawer
          isOpen={isCaptainDrawerOpen}
          onClose={() => setIsCaptainDrawerOpen(false)}
          currentDate={manifestDate || new Date().toISOString().split('T')[0]}
          pickups={buildDailyPickups(bookings || [], manifestDate || new Date().toISOString().split('T')[0])}
          showToast={showToast}
        />
      )}

      {workflowBooking && (
        <BookingWorkflowModal
          isOpen={Boolean(workflowBooking)}
          onClose={() => setWorkflowBooking(null)}
          booking={workflowBooking}
          onUpdateBooking={onUpdateSingleBooking}
          vehicles={vehicles}
          drivers={drivers}
          showToast={showToast}
        />
      )}

      <ConflictResolutionModal
        isOpen={Boolean(conflictBooking)}
        conflict={conflictBooking}
        onAcceptServer={onAcceptServerConflict}
        onForceOverwrite={onForceOverwriteConflict}
        onClose={() => setConflictBooking(null)}
      />

      <AdminConfirmModal
        isOpen={Boolean(confirmModal?.isOpen)}
        title={confirmModal?.title || 'İşlemi Onayla'}
        message={confirmModal?.message || 'Bu işlem kalıcı olabilir.'}
        confirmText={confirmModal?.confirmText}
        isDestructive={confirmModal?.isDestructive}
        onConfirm={() => confirmModal?.onConfirm()}
        onClose={() => setConfirmModal(null)}
      />
    </>
  );
}
