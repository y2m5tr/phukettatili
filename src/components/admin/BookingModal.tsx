import React from 'react';
import type {
  Booking,
  TourItem,
  PartnerAgent,
  SupplierItem,
  TourCostItem,
} from '../../data/adminInitialData';
import { BookingModalHeader } from './booking/BookingModalHeader';
import { BookingCustomerPassengers } from './booking/BookingCustomerPassengers';
import { BookingToursList } from './booking/BookingToursList';
import { BookingHotelAndPickup } from './booking/BookingHotelAndPickup';
import { BookingSummaryInputs } from './booking/BookingSummaryInputs';
import { BookingFinanceTab } from './booking/BookingFinanceTab';
import { BookingSupplierTab } from './booking/BookingSupplierTab';
import { BookingModalFooter } from './booking/BookingModalFooter';
import { useBookingFormState } from './booking/useBookingFormState';
import { parsePickupRange, addMinutesToTime } from './booking/bookingHelpers';

export { parsePickupRange, addMinutesToTime };

export interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingBooking: Booking | null;
  formData: Partial<Booking>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Booking>>>;
  onSubmit: (e: React.FormEvent) => void;
  tours: TourItem[];
  bookings: Booking[];
  agents: PartnerAgent[];
  suppliers: SupplierItem[];
  tourCosts: TourCostItem[];
  showToast: (msg: string) => void;
}

export default function BookingModal({
  isOpen,
  onClose,
  editingBooking,
  formData,
  setFormData,
  onSubmit,
  tours,
  bookings,
  agents,
  suppliers,
  tourCosts,
  showToast,
}: BookingModalProps) {
  const formState = useBookingFormState({
    formData,
    setFormData,
    tours,
    showToast,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-surface-2 w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Üst Başlık & Sekmeler */}
        <BookingModalHeader
          editingBooking={editingBooking}
          activeTab={formState.activeTab}
          setActiveTab={formState.setActiveTab}
          isQuickPasteOpen={formState.isQuickPasteOpen}
          setIsQuickPasteOpen={formState.setIsQuickPasteOpen}
          quickPasteText={formState.quickPasteText}
          setQuickPasteText={formState.setQuickPasteText}
          onApplyWhatsAppPaste={formState.handleApplyWhatsAppPaste}
          onClose={onClose}
          remainingBalance={formState.remainingBalance}
          hasB2bOrSupplier={formState.hasB2bOrSupplier}
        />

        {/* Form Alanı (Kaydırılabilir İçerik) */}
        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* SEKME 1: REZERVASYON & OTEL (ANA EKRAN) */}
          {formState.activeTab === 'main' && (
            <div className="space-y-4">
              <BookingCustomerPassengers
                formData={formData}
                setFormData={setFormData}
                passengers={formState.passengers}
                handleAddPassenger={formState.handleAddPassenger}
                handleUpdatePassenger={formState.handleUpdatePassenger}
                handleRemovePassenger={formState.handleRemovePassenger}
                handleAutoSyncPaxCount={formState.handleAutoSyncPaxCount}
              />

              <BookingToursList
                formData={formData}
                setFormData={setFormData}
                tours={tours}
                bookings={bookings}
                editingBooking={editingBooking}
                activeTourIndex={formState.activeTourIndex}
                setSelectedTourIndex={formState.setSelectedTourIndex}
                recStart={formState.recStart}
                recEnd={formState.recEnd}
                bookingHotels={formState.bookingHotels}
              />

              <BookingHotelAndPickup
                formData={formData}
                setFormData={setFormData}
                activeTour={formState.activeTour}
                activeZone={formState.activeZone}
                activeTourIndex={formState.activeTourIndex}
                setSelectedTourIndex={formState.setSelectedTourIndex}
                activeTourDate={formState.activeTourDate}
                currentRange={formState.currentRange}
                activeTourPickup={formState.activeTourPickup}
                smartPickup={formState.smartPickup}
                applyTimeRange={formState.applyTimeRange}
                handlePickupDateChange={formState.handlePickupDateChange}
                handleStartChange={formState.handleStartChange}
                handleEndChange={formState.handleEndChange}
                bookingHotels={formState.bookingHotels}
                handleAddBookingHotel={formState.handleAddBookingHotel}
                handleUpdateBookingHotel={formState.handleUpdateBookingHotel}
                handleRemoveBookingHotel={formState.handleRemoveBookingHotel}
                copiedType={formState.copiedType}
                handleCopyDriverCard={formState.handleCopyDriverCard}
                handleCopyGuestReminder={formState.handleCopyGuestReminder}
              />

              <BookingSummaryInputs
                formData={formData}
                setFormData={setFormData}
              />
            </div>
          )}

          {/* SEKME 2: KASA & TAHSİLAT */}
          {formState.activeTab === 'finance' && (
            <BookingFinanceTab
              formData={formData}
              setFormData={setFormData}
              remainingBalance={formState.remainingBalance}
            />
          )}

          {/* SEKME 3: ACENTA & TEDARİKÇİ YÖNETİMİ */}
          {formState.activeTab === 'supplier_b2b' && (
            <BookingSupplierTab
              formData={formData}
              setFormData={setFormData}
              agents={agents}
              suppliers={suppliers}
              tourCosts={tourCosts}
              showToast={showToast}
            />
          )}

          {/* SABİT ALT BUTONLAR & CANLI ÖZET BİLGİSİ */}
          <BookingModalFooter
            formData={formData}
            remainingBalance={formState.remainingBalance}
            editingBooking={editingBooking}
            onClose={onClose}
          />
        </form>
      </div>
    </div>
  );
}
