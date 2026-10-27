import { useState } from 'react';
import type {
  Booking,
  PassengerItem,
  BookingHotelStay,
  TourItem,
} from '../../../data/adminInitialData';
import { detectHotelZone, getRecommendedPickupTime } from '../../../data/adminInitialData';
import { getSmartPickupRecommendation } from '../../../lib/smartPickupIntelligence';
import {
  generateDriverPickupJobThai,
  generateGuestPickupReminderTurkish,
} from '../../../lib/whatsappEngine';
import { parseWhatsAppBookingText } from '../../../lib/whatsappParser';
import { parsePickupRange, addMinutesToTime } from './bookingHelpers';

export interface UseBookingFormStateArgs {
  formData: Partial<Booking>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Booking>>>;
  tours: TourItem[];
  showToast?: (msg: string) => void;
}

export function useBookingFormState({
  formData,
  setFormData,
  tours,
  showToast,
}: UseBookingFormStateArgs) {
  const [activeTab, setActiveTab] = useState<'main' | 'finance' | 'supplier_b2b'>('main');
  const [selectedTourIndex, setSelectedTourIndex] = useState<number>(0);
  const [isQuickPasteOpen, setIsQuickPasteOpen] = useState<boolean>(false);
  const [quickPasteText, setQuickPasteText] = useState<string>('');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const toursList =
    formData.tours && formData.tours.length > 0
      ? formData.tours
      : [
          {
            tourTitle: formData.tourTitle || tours[0]?.title || 'Phuket Turu',
            tourDate: formData.tourDate || new Date().toISOString().split('T')[0],
            pickupTime: formData.pickupTime || '07:30 - 07:45',
            priceThb: formData.totalPriceThb || 2200,
          },
        ];

  const activeTourIndex = Math.min(
    selectedTourIndex,
    Math.max(0, toursList.length - 1)
  );
  const activeTour = toursList[activeTourIndex] || toursList[0];
  const activeTourDate =
    activeTour?.tourDate || formData.tourDate || new Date().toISOString().split('T')[0];
  const activeTourPickup =
    activeTour?.pickupTime || (activeTourIndex === 0 ? formData.pickupTime : '') || '07:30 - 07:45';

  const currentRange = parsePickupRange(activeTourPickup);

  const applyTimeRange = (start: string, end: string) => {
    const rangeStr = `${start.trim()} - ${end.trim()}`;
    const curTours =
      formData.tours && formData.tours.length > 0
        ? [...formData.tours]
        : [
            {
              tourTitle: formData.tourTitle || tours[0]?.title || 'Phuket Turu',
              tourDate: formData.tourDate || new Date().toISOString().split('T')[0],
              pickupTime: rangeStr,
              priceThb: formData.totalPriceThb || 2200,
            },
          ];

    const updatedTours = curTours.map((t, idx) =>
      idx === activeTourIndex ? { ...t, pickupTime: rangeStr } : t
    );

    setFormData((prev) => ({
      ...prev,
      pickupTime: activeTourIndex === 0 ? rangeStr : prev.pickupTime,
      tours: updatedTours,
    }));
  };

  const handlePickupDateChange = (newDate: string) => {
    const curTours =
      formData.tours && formData.tours.length > 0
        ? [...formData.tours]
        : [
            {
              tourTitle: formData.tourTitle || tours[0]?.title || 'Phuket Turu',
              tourDate: newDate,
              pickupTime: formData.pickupTime || '07:30 - 07:45',
              priceThb: formData.totalPriceThb || 2200,
            },
          ];

    const updatedTours = curTours.map((t, idx) =>
      idx === activeTourIndex ? { ...t, tourDate: newDate } : t
    );

    setFormData((prev) => ({
      ...prev,
      tourDate: activeTourIndex === 0 ? newDate : prev.tourDate,
      tours: updatedTours,
    }));
  };

  const handleStartChange = (val: string) => {
    applyTimeRange(val, currentRange.end);
  };

  const handleEndChange = (val: string) => {
    applyTimeRange(currentRange.start, val);
  };

  const activeZone =
    formData.hotelZone || (formData.hotel ? detectHotelZone(formData.hotel) : 'Patong & Kalim');
  const recStart = getRecommendedPickupTime(activeZone);
  const recEnd = addMinutesToTime(recStart, 15);

  const activeTourTitle = activeTour?.tourTitle || formData.tourTitle || '';
  const smartPickup = getSmartPickupRecommendation(
    activeZone,
    activeTourTitle,
    activeTourPickup
  );

  const handleCopyDriverCard = (openWhatsApp: boolean = false) => {
    const job = generateDriverPickupJobThai(formData as Booking, activeTourIndex);
    navigator.clipboard.writeText(job.message);
    setCopiedType('driver');
    if (showToast) showToast('🇹🇭 Şoför görev kartı (Tayca/İngilizce) panoya kopyalandı!');
    setTimeout(() => setCopiedType(null), 2500);
    if (openWhatsApp) {
      window.open(job.waUrl, '_blank');
    }
  };

  const handleCopyGuestReminder = (openWhatsApp: boolean = false) => {
    const reminder = generateGuestPickupReminderTurkish(formData as Booking, activeTourIndex);
    navigator.clipboard.writeText(reminder.message);
    setCopiedType('guest');
    if (showToast) showToast('🇹🇷 Misafir lobi alınış hatırlatması panoya kopyalandı!');
    setTimeout(() => setCopiedType(null), 2500);
    if (openWhatsApp) {
      window.open(reminder.waUrl, '_blank');
    }
  };

  const remainingBalance = Math.max(
    0,
    Number(formData.totalPriceThb || 0) - Number(formData.paidAmountThb || 0)
  );

  const hasB2bOrSupplier =
    Boolean(formData.agentId) ||
    Boolean(formData.supplier) ||
    Boolean(formData.supplierRefCode);

  const passengers = formData.passengers || [];

  const handleAddPassenger = () => {
    const newPax: PassengerItem = {
      id: `pax-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      fullName: '',
      passportNo: '',
      passportNumber: '',
      isChild: false,
    };
    const nextPassengers = [...passengers, newPax];
    setFormData((prev) => ({
      ...prev,
      passengers: nextPassengers,
    }));
  };

  const handleUpdatePassenger = (
    index: number,
    field: keyof PassengerItem,
    value: any
  ) => {
    const nextPassengers = [...passengers];
    nextPassengers[index] = { ...nextPassengers[index], [field]: value };
    if (field === 'passportNo') {
      nextPassengers[index].passportNumber = value;
    }
    setFormData((prev) => ({
      ...prev,
      passengers: nextPassengers,
    }));
  };

  const handleRemovePassenger = (index: number) => {
    const nextPassengers = passengers.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      passengers: nextPassengers,
    }));
  };

  const handleAutoSyncPaxCount = () => {
    const childCount = passengers.filter((p) => p.isChild).length;
    const adultCount = Math.max(1, 1 + passengers.filter((p) => !p.isChild).length);
    const curTours = formData.tours || [];
    const calculatedTotal =
      curTours.reduce((acc, t) => acc + (t.priceThb || 0), 0) * adultCount +
      Math.round(curTours.reduce((acc, t) => acc + (t.priceThb || 0), 0) * 0.7 * childCount);
    setFormData((prev) => ({
      ...prev,
      adultCount,
      childCount,
      totalPriceThb: calculatedTotal > 0 ? calculatedTotal : prev.totalPriceThb,
    }));
    if (showToast) {
      showToast(`⚡ Pax sayısı eşitlendi: ${adultCount} Yetişkin, ${childCount} Çocuk`);
    }
  };

  const bookingHotels: BookingHotelStay[] = formData.hotels || [];

  const handleAddBookingHotel = () => {
    const newId = `hotel-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newHotel: BookingHotelStay = {
      id: newId,
      hotelName: '',
      hotelZone: 'Patong & Kalim',
      roomNumber: '',
      checkInDate: '',
      checkOutDate: '',
      notes: '',
    };
    setFormData((prev) => ({
      ...prev,
      hotels: [...(prev.hotels || []), newHotel],
    }));
  };

  const handleUpdateBookingHotel = (
    index: number,
    field: keyof BookingHotelStay,
    value: any
  ) => {
    const nextHotels = [...bookingHotels];
    nextHotels[index] = { ...nextHotels[index], [field]: value };
    if (field === 'hotelName') {
      const detected = detectHotelZone(value);
      if (detected) {
        nextHotels[index].hotelZone = detected;
      }
    }
    setFormData((prev) => ({
      ...prev,
      hotels: nextHotels,
    }));
  };

  const handleRemoveBookingHotel = (index: number) => {
    const nextHotels = bookingHotels.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      hotels: nextHotels,
    }));
  };

  const handleApplyWhatsAppPaste = () => {
    if (!quickPasteText.trim()) return;
    const parsed = parseWhatsAppBookingText(quickPasteText, tours);

    setFormData((prev) => {
      const updated = { ...prev };
      if (parsed.customerName) updated.customerName = parsed.customerName;
      if (parsed.phone) updated.phone = parsed.phone;
      if (parsed.adultCount !== undefined) updated.adultCount = parsed.adultCount;
      if (parsed.childCount !== undefined) updated.childCount = parsed.childCount;
      if (parsed.hotel) {
        updated.hotel = parsed.hotel;
        const detectedZone = detectHotelZone(parsed.hotel);
        if (detectedZone) updated.hotelZone = detectedZone;
      }
      if (parsed.roomNumber) updated.roomNumber = parsed.roomNumber;
      if (parsed.priceThb !== undefined) updated.totalPriceThb = parsed.priceThb;
      if (parsed.tourTitle) updated.tourTitle = parsed.tourTitle;
      if (parsed.tourDate) updated.tourDate = parsed.tourDate;

      const curTours =
        updated.tours && updated.tours.length > 0
          ? [...updated.tours]
          : [
              {
                tourTitle: parsed.tourTitle || updated.tourTitle || tours[0]?.title || 'Phuket Turu',
                tourDate: parsed.tourDate || updated.tourDate || new Date().toISOString().split('T')[0],
                pickupTime: updated.pickupTime || '07:30 - 07:45',
                priceThb: parsed.priceThb !== undefined ? parsed.priceThb : updated.totalPriceThb || 2200,
              },
            ];

      curTours[0] = {
        ...curTours[0],
        tourTitle: parsed.tourTitle || curTours[0].tourTitle,
        tourDate: parsed.tourDate || curTours[0].tourDate,
        priceThb: parsed.priceThb !== undefined ? parsed.priceThb : curTours[0].priceThb,
        hotel: parsed.hotel || curTours[0].hotel,
        roomNumber: parsed.roomNumber || curTours[0].roomNumber,
      };

      updated.tours = curTours;

      if (parsed.customerName) {
        const curPax = updated.passengers ? [...updated.passengers] : [];
        if (curPax.length > 0) {
          curPax[0] = { ...curPax[0], fullName: parsed.customerName };
          updated.passengers = curPax;
        }
      }

      return updated;
    });

    const filled: string[] = [];
    if (parsed.customerName) filled.push('İsim');
    if (parsed.phone) filled.push('Telefon');
    if (parsed.adultCount !== undefined) filled.push(`${parsed.adultCount} Yetişkin`);
    if (parsed.childCount !== undefined) filled.push(`${parsed.childCount} Çocuk`);
    if (parsed.tourDate) filled.push('Tarih');
    if (parsed.hotel) filled.push('Otel');
    if (parsed.roomNumber) filled.push('Oda');
    if (parsed.tourTitle) filled.push('Tur');
    if (parsed.priceThb !== undefined) filled.push(`${parsed.priceThb} ฿`);

    if (filled.length > 0) {
      if (showToast) showToast(`✅ WhatsApp mesajından aktarıldı: ${filled.join(', ')}`);
    } else {
      if (showToast) showToast('⚠️ Metinde belirgin rezervasyon detayı algılanamadı.');
    }

    setQuickPasteText('');
    setIsQuickPasteOpen(false);
  };

  return {
    activeTab,
    setActiveTab,
    selectedTourIndex,
    setSelectedTourIndex,
    isQuickPasteOpen,
    setIsQuickPasteOpen,
    quickPasteText,
    setQuickPasteText,
    copiedType,
    toursList,
    activeTourIndex,
    activeTour,
    activeTourDate,
    activeTourPickup,
    currentRange,
    applyTimeRange,
    handlePickupDateChange,
    handleStartChange,
    handleEndChange,
    activeZone,
    recStart,
    recEnd,
    smartPickup,
    handleCopyDriverCard,
    handleCopyGuestReminder,
    remainingBalance,
    hasB2bOrSupplier,
    passengers,
    handleAddPassenger,
    handleUpdatePassenger,
    handleRemovePassenger,
    handleAutoSyncPaxCount,
    bookingHotels,
    handleAddBookingHotel,
    handleUpdateBookingHotel,
    handleRemoveBookingHotel,
    handleApplyWhatsAppPaste,
  };
}
