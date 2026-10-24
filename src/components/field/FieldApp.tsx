import React from 'react';
import { Sparkles } from 'lucide-react';
import type { FieldAppProps } from './fieldTypes';
import { useFieldAppState } from './useFieldAppState';
import { FieldShiftScreen } from './FieldShiftScreen';
import { FieldHeader } from './FieldHeader';
import { FieldScheduleTab } from './FieldScheduleTab';
import NewBookingTab from './NewBookingTab';
import { FieldCashTab } from './FieldCashTab';
import { FieldSettingsTab } from './FieldSettingsTab';
import { FieldCashModal } from './FieldCashModal';
import { FieldBottomNav } from './FieldBottomNav';
import { FieldModalsHost } from './FieldModalsHost';

export type { FieldAppProps };

export default function FieldApp({
  initialTours = [],
  managerPhone = '66828950665',
  viewerRole = null,
}: FieldAppProps) {
  const state = useFieldAppState({
    initialTours,
    managerPhone,
    viewerRole,
  });

  // -------------------------------------------------------------------------------------------
  // VARDİYA BAŞLATMA EKRANI
  // -------------------------------------------------------------------------------------------
  if (!state.isShiftStarted) {
    return (
      <FieldShiftScreen
        crewName={state.crewName}
        setCrewName={state.setCrewName}
        identityError={state.identityError}
        setIdentityError={state.setIdentityError}
        onStartShift={state.handleStartShift}
        onLogout={state.handleLogout}
      />
    );
  }

  // -------------------------------------------------------------------------------------------
  // SAHA UYGULAMASI ANA GÖRÜNÜMÜ
  // -------------------------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col max-w-md mx-auto shadow-2xl relative border-x border-slate-800/60 pb-24">
      {/* Toast Bildirimi */}
      {state.toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm bg-slate-900 border border-amber-400/40 text-amber-300 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
          <p className="text-xs font-semibold leading-tight">{state.toastMessage}</p>
        </div>
      )}

      {/* ÜST BAR (Header) */}
      <FieldHeader
        crewName={state.crewName}
        activeTab={state.activeTab}
        isOnline={state.isOnline}
        isCloudConnected={state.isCloudConnected}
        isRefreshing={state.isRefreshing}
        selectedDate={state.selectedDate}
        setSelectedDate={state.setSelectedDate}
        yesterdayStr={state.yesterdayStr}
        todayStr={state.todayStr}
        tomorrowStr={state.tomorrowStr}
        onOpenQrScanner={() => state.setIsQrScannerOpen(true)}
        onRefresh={state.handleRefresh}
      />

      {/* TAB 1: MANİFESTO (GÜNLÜK SAHA OPERASYONU) */}
      {state.activeTab === 'schedule' && (
        <FieldScheduleTab
          selectedDate={state.selectedDate}
          todayStr={state.todayStr}
          isDriverOnly={state.isDriverOnly}
          scheduleItems={state.scheduleItems}
          filteredSchedule={state.filteredSchedule}
          stats={state.stats}
          searchQuery={state.searchQuery}
          setSearchQuery={state.setSearchQuery}
          statusFilter={state.statusFilter}
          setStatusFilter={state.setStatusFilter}
          vehicleFilter={state.vehicleFilter}
          setVehicleFilter={state.setVehicleFilter}
          availableVehicles={state.availableVehicles}
          onOpenPoliceManifest={() => state.setIsPoliceManifestOpen(true)}
          onSendDayEndReport={state.sendDayEndReportToManager}
          onOpenCashModal={(item) => {
            state.setCashModalItem(item);
            state.setCollectedAmountInput(String(item.remainingAmountThb));
          }}
          onOpenWhatsAppModal={(booking) => state.setWhatsAppModalItem(booking)}
          onOpenBoardingPass={(booking, tourIndex) =>
            state.setBoardingPassModalItem({ booking, tourIndex })
          }
          onSetPickupStatus={state.handleSetPickupStatus}
          onNavigateToNewBooking={() => state.setActiveTab('new_booking')}
        />
      )}

      {/* TAB 2: HIZLI SATIŞ & YENİ REZERVASYON (Sahada Yeni Misafir) */}
      {state.activeTab === 'new_booking' && (
        <NewBookingTab
          newCustName={state.newCustName}
          setNewCustName={state.setNewCustName}
          newCustPhone={state.newCustPhone}
          setNewCustPhone={state.setNewCustPhone}
          newCustHotel={state.newCustHotel}
          setNewCustHotel={state.setNewCustHotel}
          newCustZone={state.newCustZone}
          setNewCustZone={state.setNewCustZone}
          newCustRoom={state.newCustRoom}
          setNewCustRoom={state.setNewCustRoom}
          newTourId={state.newTourId}
          setNewTourId={state.setNewTourId}
          newTourDate={state.newTourDate}
          setNewTourDate={state.setNewTourDate}
          newPickupTime={state.newPickupTime}
          setNewPickupTime={state.setNewPickupTime}
          newAdultCount={state.newAdultCount}
          setNewAdultCount={state.setNewAdultCount}
          newChildCount={state.newChildCount}
          setNewChildCount={state.setNewChildCount}
          newPriceThb={state.newPriceThb}
          setNewPriceThb={state.setNewPriceThb}
          newDepositThb={state.newDepositThb}
          setNewDepositThb={state.setNewDepositThb}
          newNatPark={state.newNatPark}
          setNewNatPark={state.setNewNatPark}
          newNotes={state.newNotes}
          setNewNotes={state.setNewNotes}
          isSubmittingBooking={state.isSubmittingBooking}
          onSubmit={state.handleCreateQuickBooking}
          tours={initialTours}
        />
      )}

      {/* TAB 3: KASA & TAHSİLAT RAPORU */}
      {state.activeTab === 'cash' && (
        <FieldCashTab
          selectedDate={state.selectedDate}
          scheduleItems={state.scheduleItems}
          totalCashToCollect={state.stats.totalCashToCollect}
          onSendDayEndReport={state.sendDayEndReportToManager}
        />
      )}

      {/* TAB 4: AYARLAR & PROFİL */}
      {state.activeTab === 'settings' && (
        <FieldSettingsTab
          crewName={state.crewName}
          isCloudConnected={state.isCloudConnected}
          totalBookingsCount={state.bookings.length}
          viewerRole={viewerRole}
          canAccessAdmin={state.canAccessAdmin}
          currentPassword={state.currentPassword}
          setCurrentPassword={state.setCurrentPassword}
          newPassword={state.newPassword}
          setNewPassword={state.setNewPassword}
          isChangingPassword={state.isChangingPassword}
          onChangeOwnPassword={state.handleChangeOwnPassword}
          onLogout={state.handleLogout}
        />
      )}

      {/* TAHSİLAT MODALI */}
      <FieldCashModal
        cashModalItem={state.cashModalItem}
        collectedAmountInput={state.collectedAmountInput}
        setCollectedAmountInput={state.setCollectedAmountInput}
        onClose={() => state.setCashModalItem(null)}
        onConfirm={state.handleConfirmCashCollection}
      />

      {/* ALT GEZİNTİ ÇUBUĞU */}
      <FieldBottomNav
        activeTab={state.activeTab}
        setActiveTab={state.setActiveTab}
        isDriverOnly={state.isDriverOnly}
      />

      {/* HOST MODALLAR */}
      <FieldModalsHost
        isQrScannerOpen={state.isQrScannerOpen}
        onCloseQrScanner={() => state.setIsQrScannerOpen(false)}
        onQrScanSuccess={state.handleQrScanSuccess}
        boardingPassModalItem={state.boardingPassModalItem}
        onCloseBoardingPassModal={() => state.setBoardingPassModalItem(null)}
        managerPhone={managerPhone}
        whatsAppModalItem={state.whatsAppModalItem}
        onCloseWhatsAppModal={() => state.setWhatsAppModalItem(null)}
        isPoliceManifestOpen={state.isPoliceManifestOpen}
        onClosePoliceManifest={() => state.setIsPoliceManifestOpen(false)}
        selectedDate={state.selectedDate}
        bookings={state.bookings}
        onUpdatePassengers={state.handleUpdateBookingPassengers}
      />
    </div>
  );
}
