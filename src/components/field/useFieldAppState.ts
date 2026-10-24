import React, { useState, useEffect, useMemo, useTransition, useCallback } from 'react';
import { isSupabaseConfigured, subscribeBookingsSignal } from '../../lib/supabase';
import {
  initialBookings,
  type Booking,
  type PassengerItem,
  detectHotelZone,
} from '../../data/adminInitialData';
import { fmtMoney } from '../../lib/moneyFormat';
import {
  CREW_NAME_STORAGE_KEY,
  LOCAL_BOOKINGS_KEY,
  getPhuketToday,
  type FieldScheduleItem,
  type FieldAppProps,
} from './fieldTypes';
import {
  buildScheduleItems,
  filterScheduleItems,
  computeScheduleStats,
  extractAvailableVehicles,
} from './fieldScheduleBuilder';
import { sendDayEndReportToManager as sendDayEndReportHelper } from './fieldReportUtils';
import { useFieldQuickBooking } from './useFieldQuickBooking';

export function useFieldAppState({
  initialTours = [],
  managerPhone = '66828950665',
  viewerRole = null,
}: FieldAppProps) {
  const isDriverOnly = viewerRole === 'driver';
  const canAccessAdmin = viewerRole === 'owner' || viewerRole === 'manager' || viewerRole === null;

  // 1. Kimlik
  const [isShiftStarted, setIsShiftStarted] = useState<boolean>(false);
  const [identityError, setIdentityError] = useState('');
  const [crewName, setCrewName] = useState<string>(isDriverOnly ? 'Şoför Ekibi' : 'Rehber Ekibi');

  // 2. Navigasyon & Filtreler
  const [activeTab, setActiveTab] = useState<'schedule' | 'new_booking' | 'cash' | 'settings'>('schedule');
  const [selectedDate, setSelectedDate] = useState<string>(getPhuketToday());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [vehicleFilter, setVehicleFilter] = useState<string>('all');

  // Modallar
  const [isQrScannerOpen, setIsQrScannerOpen] = useState<boolean>(false);
  const [boardingPassModalItem, setBoardingPassModalItem] = useState<{ booking: Booking; tourIndex: number } | null>(null);
  const [whatsAppModalItem, setWhatsAppModalItem] = useState<Booking | null>(null);
  const [isPoliceManifestOpen, setIsPoliceManifestOpen] = useState<boolean>(false);

  // 3. Veri & Çevrimiçi Durum
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [, startTransition] = useTransition();

  // 4. Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 5. Tahsilat Modalı
  const [cashModalItem, setCashModalItem] = useState<FieldScheduleItem | null>(null);
  const [collectedAmountInput, setCollectedAmountInput] = useState<string>('');

  // Şifre Değiştirme
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  // Hızlı Satış / Rezervasyon
  const quickBooking = useFieldQuickBooking({
    initialTours,
    crewName,
    setBookings,
    setSelectedDate,
    setActiveTab,
    showToast,
    startTransition,
  });

  // Başlangıç: localStorage + oturum bilgisi
  useEffect(() => {
    let hasSavedCrew = false;
    try {
      const savedCrew = localStorage.getItem(CREW_NAME_STORAGE_KEY);
      if (savedCrew) {
        setCrewName(savedCrew);
        hasSavedCrew = true;
      }
      const cached = localStorage.getItem(LOCAL_BOOKINGS_KEY);
      if (cached) {
        setBookings(JSON.parse(cached));
      }
    } catch {
      // ignore
    }

    if (viewerRole && !hasSavedCrew) {
      void fetch('/api/auth/session')
        .then((res) => (res.ok ? res.json() : null))
        .then((data: { user?: { fullName?: string } } | null) => {
          if (data?.user?.fullName) {
            setCrewName(data.user.fullName);
          }
        })
        .catch(() => {});
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [viewerRole]);

  const fetchBookingsFromServer = useCallback(async (): Promise<void> => {
    try {
      const res = await fetch('/api/bookings');
      if (!res.ok) {
        setIsCloudConnected(false);
        return;
      }
      const payload = (await res.json()) as { bookings?: Booking[] };
      if (Array.isArray(payload.bookings) && payload.bookings.length > 0) {
        setBookings(payload.bookings);
        setIsCloudConnected(true);
        try {
          localStorage.setItem(LOCAL_BOOKINGS_KEY, JSON.stringify(payload.bookings));
        } catch {
          // ignore
        }
      } else {
        setIsCloudConnected(true);
      }
    } catch {
      setIsCloudConnected(false);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      console.log('Saha modu: Supabase bağlı değil, yerel veriyle çalışılıyor.');
      return;
    }
    void fetchBookingsFromServer();
    const unsubscribe = subscribeBookingsSignal(() => {
      void fetchBookingsFromServer();
    });
    return unsubscribe;
  }, [fetchBookingsFromServer]);

  const handleStartShift = (e: React.FormEvent) => {
    e.preventDefault();
    const name = crewName.trim();
    if (name.length < 2) {
      setIdentityError('Lütfen manifestoda görünecek adınızı yazın (en az 2 karakter).');
      return;
    }
    setIdentityError('');
    try {
      localStorage.setItem(CREW_NAME_STORAGE_KEY, name);
    } catch {
      // ignore
    }
    setIsShiftStarted(true);
    showToast(`🇹🇭 Vardiya açıldı — ${name}`);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/ops-login', { method: 'DELETE' });
    } catch {
      // ignore
    }
    window.location.href = '/ops-login?next=/ekip';
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (isSupabaseConfigured) {
      await fetchBookingsFromServer();
      if (isCloudConnected) {
        showToast('✅ Veriler bulut ile senkronize edildi');
      } else {
        showToast('⚠️ İnternet bağlantısı zayıf, yerel veriler korunuyor');
      }
    } else {
      showToast('✅ Yerel önbellek güncel');
    }
    setIsRefreshing(false);
  };

  const todayStr = useMemo(() => getPhuketToday(), []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const phuketStr = d.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' });
    const pd = new Date(phuketStr);
    return `${pd.getFullYear()}-${String(pd.getMonth() + 1).padStart(2, '0')}-${String(pd.getDate()).padStart(2, '0')}`;
  }, []);
  const yesterdayStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const phuketStr = d.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' });
    const pd = new Date(phuketStr);
    return `${pd.getFullYear()}-${String(pd.getMonth() + 1).padStart(2, '0')}-${String(pd.getDate()).padStart(2, '0')}`;
  }, []);

  const scheduleItems = useMemo<FieldScheduleItem[]>(
    () => buildScheduleItems(bookings, selectedDate),
    [bookings, selectedDate]
  );

  const filteredSchedule = useMemo(
    () => filterScheduleItems(scheduleItems, searchQuery, statusFilter, vehicleFilter),
    [scheduleItems, searchQuery, statusFilter, vehicleFilter]
  );

  const stats = useMemo(
    () => computeScheduleStats(scheduleItems),
    [scheduleItems]
  );

  const availableVehicles = useMemo(
    () => extractAvailableVehicles(scheduleItems),
    [scheduleItems]
  );

  const updateBookingRecord = async (updatedBooking: Booking) => {
    startTransition(() => {
      setBookings((prev) => {
        const next = prev.map((b) => (b.id === updatedBooking.id ? updatedBooking : b));
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
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBooking),
      });
      if (!res.ok) console.warn('Bulut güncelleme hatası:', res.status);
    } catch (err) {
      console.warn('Bulut güncelleme hatası:', err);
    }
  };

  const handleUpdateBookingPassengers = (bookingId: string, passengers: PassengerItem[]) => {
    const target = bookings.find((b) => b.id === bookingId);
    if (!target) return;
    const updated = { ...target, passengers };
    updateBookingRecord(updated);
    showToast('✅ Yolcu pasaport bilgileri kaydedildi.');
  };

  const handleSetPickupStatus = async (
    item: FieldScheduleItem,
    newStatus: 'pending' | 'picked_up' | 'on_tour' | 'completed' | 'no_show'
  ) => {
    const nowTime = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    const full = { ...item.fullBooking };

    if (item.tourIndex >= 0 && full.tours && full.tours[item.tourIndex]) {
      const updatedTours = [...full.tours];
      updatedTours[item.tourIndex] = {
        ...updatedTours[item.tourIndex],
        pickupStatus: newStatus,
        pickedUpAt: newStatus === 'picked_up' ? nowTime : undefined,
      };
      full.tours = updatedTours;
    } else {
      full.pickupStatus = newStatus;
      full.pickedUpAt = newStatus === 'picked_up' ? nowTime : undefined;
    }

    if (newStatus === 'completed') {
      full.status = 'completed';
    }

    await updateBookingRecord(full);

    if (newStatus === 'picked_up') {
      showToast(`🚐 ${item.customerName} otelden alındı (${nowTime})`);
    } else if (newStatus === 'no_show') {
      showToast(`⚠️ ${item.customerName} NO-SHOW işaretlendi`);
    } else {
      showToast(`Durum güncellendi: ${newStatus}`);
    }
  };

  const handleQrScanSuccess = (scannedBookingId: string, tourIndex: number) => {
    const cleanId = scannedBookingId.trim().toUpperCase();
    const found = bookings.find((b) => b.id.toUpperCase() === cleanId || b.id.toUpperCase().includes(cleanId));
    if (!found) {
      showToast(`⚠️ Rezervasyon bulunamadı: ${cleanId}`);
      return;
    }

    const nowTime = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    const full = { ...found };

    if (full.tours && full.tours[tourIndex]) {
      const nextTours = [...full.tours];
      nextTours[tourIndex] = {
        ...nextTours[tourIndex],
        pickupStatus: 'picked_up',
        pickedUpAt: nowTime,
      };
      full.tours = nextTours;
    } else {
      full.pickupStatus = 'picked_up';
      full.pickedUpAt = nowTime;
    }

    updateBookingRecord(full);
    showToast(`🎉 QR Binişi Onaylandı: ${full.customerName} (${nowTime})`);

    if (full.remainingAmountThb > 0) {
      setTimeout(() => {
        const scheduleItem: FieldScheduleItem = {
          key: `${full.id}-qr`,
          bookingId: full.id,
          customerName: full.customerName,
          phone: full.phone,
          hotel: full.hotel,
          roomNumber: full.roomNumber,
          tourTitle: full.tourTitle,
          tourId: full.tourId || '',
          tourDate: full.tourDate,
          pickupTime: full.pickupTime || '07:30',
          tourIndex,
          adultCount: full.adultCount,
          childCount: full.childCount,
          totalPriceThb: full.totalPriceThb,
          paidAmountThb: full.paidAmountThb,
          remainingAmountThb: full.remainingAmountThb,
          paymentStatus: full.paymentStatus,
          nationalParkFeeIncluded: full.nationalParkFeeIncluded ?? false,
          specialNotes: full.specialNotes,
          pickupStatus: 'picked_up',
          pickedUpAt: nowTime,
          assignedVehicle: full.assignedVehicle,
          assignedDriver: full.assignedDriver,
          hotelZone: full.hotelZone || detectHotelZone(full.hotel),
          fullBooking: full,
        };
        setCashModalItem(scheduleItem);
        setCollectedAmountInput(String(full.remainingAmountThb));
      }, 700);
    }
  };

  const handleConfirmCashCollection = async () => {
    if (!cashModalItem) return;
    const amount = Number(collectedAmountInput) || cashModalItem.remainingAmountThb;
    const full = { ...cashModalItem.fullBooking };

    const newPaid = full.paidAmountThb + amount;
    const newRemaining = Math.max(0, full.remainingAmountThb - amount);

    full.paidAmountThb = newPaid;
    full.remainingAmountThb = newRemaining;
    full.paymentStatus = newRemaining === 0 ? 'paid' : 'partial';

    await updateBookingRecord(full);
    showToast(`💰 ${fmtMoney(amount)} THB tahsilat kaydedildi!`);
    setCashModalItem(null);
    setCollectedAmountInput('');
  };

  const sendDayEndReportToManager = () => {
    sendDayEndReportHelper(managerPhone, selectedDate, crewName, scheduleItems, stats);
  };

  const handleChangeOwnPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    setIsChangingPassword(true);
    try {
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        showToast(`⚠️ ${data.error || 'Şifre güncellenemedi.'}`);
        return;
      }
      setCurrentPassword('');
      setNewPassword('');
      showToast('✅ Şifreniz güncellendi.');
    } catch {
      showToast('⚠️ Ağ hatası — şifre güncellenemedi.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return {
    isDriverOnly,
    canAccessAdmin,
    isShiftStarted,
    identityError,
    setIdentityError,
    crewName,
    setCrewName,
    activeTab,
    setActiveTab,
    selectedDate,
    setSelectedDate,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    vehicleFilter,
    setVehicleFilter,
    isQrScannerOpen,
    setIsQrScannerOpen,
    boardingPassModalItem,
    setBoardingPassModalItem,
    whatsAppModalItem,
    setWhatsAppModalItem,
    isPoliceManifestOpen,
    setIsPoliceManifestOpen,
    bookings,
    isCloudConnected,
    isOnline,
    isRefreshing,
    toastMessage,
    showToast,
    cashModalItem,
    setCashModalItem,
    collectedAmountInput,
    setCollectedAmountInput,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    isChangingPassword,
    handleChangeOwnPassword,
    ...quickBooking,
    handleStartShift,
    handleLogout,
    handleRefresh,
    todayStr,
    tomorrowStr,
    yesterdayStr,
    scheduleItems,
    filteredSchedule,
    stats,
    availableVehicles,
    updateBookingRecord,
    handleUpdateBookingPassengers,
    handleSetPickupStatus,
    handleQrScanSuccess,
    handleConfirmCashCollection,
    sendDayEndReportToManager,
  };
}
