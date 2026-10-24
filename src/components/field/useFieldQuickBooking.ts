import React, { useState, useEffect } from 'react';
import type { Booking, TourItem } from '../../data/adminInitialData';
import { detectHotelZone } from '../../data/adminInitialData';
import { generateTicketCode } from '../../lib/ticketCodes';
import { getPhuketToday, LOCAL_BOOKINGS_KEY } from './fieldTypes';

export interface UseFieldQuickBookingArgs {
  initialTours: TourItem[];
  crewName: string;
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  setSelectedDate: (d: string) => void;
  setActiveTab: (tab: 'schedule' | 'new_booking' | 'cash' | 'settings') => void;
  showToast: (msg: string) => void;
  startTransition: React.TransitionStartFunction;
}

export function useFieldQuickBooking({
  initialTours,
  crewName,
  setBookings,
  setSelectedDate,
  setActiveTab,
  showToast,
  startTransition,
}: UseFieldQuickBookingArgs) {
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('+90 ');
  const [newCustHotel, setNewCustHotel] = useState('');
  const [newCustZone, setNewCustZone] = useState('Patong & Kalim');
  const [newCustRoom, setNewCustRoom] = useState('');
  const [newTourId, setNewTourId] = useState(initialTours[0]?.id || 'phi-phi-maya-ve-bamboo-adasi');
  const [newTourDate, setNewTourDate] = useState(getPhuketToday());
  const [newPickupTime, setNewPickupTime] = useState('07:30');
  const [newAdultCount, setNewAdultCount] = useState<number>(2);
  const [newChildCount, setNewChildCount] = useState<number>(0);
  const [newPriceThb, setNewPriceThb] = useState<number>(0);
  const [newDepositThb, setNewDepositThb] = useState<number>(0);
  const [newNatPark, setNewNatPark] = useState<boolean>(false);
  const [newNotes, setNewNotes] = useState('');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  useEffect(() => {
    const tour = initialTours.find((t) => t.id === newTourId);
    if (tour) {
      const pricePerPerson = tour.priceThb || 2500;
      setNewPriceThb(pricePerPerson * newAdultCount + (pricePerPerson * 0.7) * newChildCount);
    }
  }, [newTourId, newAdultCount, newChildCount, initialTours]);

  const handleCreateQuickBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim() || !newCustPhone.trim() || !newCustHotel.trim()) {
      alert('Lütfen Misafir Adı, Telefon ve Otel alanlarını doldurunuz.');
      return;
    }

    setIsSubmittingBooking(true);
    const selectedTour = initialTours.find((t) => t.id === newTourId);
    const tourTitle = selectedTour?.title || 'Özel Phuket Turu';
    const remaining = Math.max(0, newPriceThb - newDepositThb);

    const newBooking: Booking = {
      id: `BK-${Math.floor(100000 + Math.random() * 900000)}`,
      ticketCode: generateTicketCode(),
      customerName: newCustName.trim(),
      phone: newCustPhone.trim(),
      hotel: newCustHotel.trim(),
      hotelZone: newCustZone || detectHotelZone(newCustHotel.trim()),
      roomNumber: newCustRoom.trim() || undefined,
      tourId: newTourId,
      tourTitle,
      tourDate: newTourDate,
      pickupTime: newPickupTime,
      tours: [
        {
          tourId: newTourId,
          tourTitle,
          tourDate: newTourDate,
          pickupTime: newPickupTime,
          priceThb: newPriceThb,
          nationalParkFeeIncluded: newNatPark,
          pickupStatus: 'pending',
        },
      ],
      adultCount: newAdultCount,
      childCount: newChildCount,
      totalPriceThb: newPriceThb,
      paidAmountThb: newDepositThb,
      remainingAmountThb: remaining,
      nationalParkFeeIncluded: newNatPark,
      status: 'confirmed',
      paymentStatus: remaining === 0 ? 'paid' : newDepositThb > 0 ? 'partial' : 'unpaid',
      specialNotes: `[Saha Kaydı: ${crewName}] ${newNotes.trim()}`.trim(),
      createdAt: getPhuketToday(),
    };

    startTransition(() => {
      setBookings((prev) => {
        const next = [newBooking, ...prev];
        try {
          localStorage.setItem(LOCAL_BOOKINGS_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    });

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBooking),
      });
      if (!res.ok) console.warn('Bulut ekleme hatası:', res.status);
    } catch (err) {
      console.warn('Bulut ekleme hatası:', err);
    }

    setIsSubmittingBooking(false);
    showToast(`🎉 ${newBooking.customerName} için rezervasyon açıldı!`);
    setNewCustName('');
    setNewCustPhone('+90 ');
    setNewCustHotel('');
    setNewCustRoom('');
    setNewNotes('');
    setNewDepositThb(0);
    setSelectedDate(newTourDate);
    setActiveTab('schedule');
  };

  return {
    newCustName,
    setNewCustName,
    newCustPhone,
    setNewCustPhone,
    newCustHotel,
    setNewCustHotel,
    newCustZone,
    setNewCustZone,
    newCustRoom,
    setNewCustRoom,
    newTourId,
    setNewTourId,
    newTourDate,
    setNewTourDate,
    newPickupTime,
    setNewPickupTime,
    newAdultCount,
    setNewAdultCount,
    newChildCount,
    setNewChildCount,
    newPriceThb,
    setNewPriceThb,
    newDepositThb,
    setNewDepositThb,
    newNatPark,
    setNewNatPark,
    newNotes,
    setNewNotes,
    isSubmittingBooking,
    handleCreateQuickBooking,
  };
}
