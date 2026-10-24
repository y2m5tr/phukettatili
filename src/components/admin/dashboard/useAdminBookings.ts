import { useState, useCallback, useMemo, useRef } from 'react';
import type { Booking, BookingTourSchedule, PassengerItem, DriverItem } from '../../../data/adminInitialData';
import { initialBookings } from '../../../data/adminInitialData';
import { STORAGE_KEY_BOOKINGS } from './dashboardTypes';
import { safeGet, safeSet } from '../../../lib/safeStorage';
import { filterBookings } from '../../../lib/adminFilters';
import { enqueueMutation, submitMutation } from '../../../lib/offlineQueue';
import { sendTransferPushNotification } from '../../../lib/pwaNotifications';
import { fmtMoney } from '../../../lib/moneyFormat';
import type { ConflictData } from '../ConflictResolutionModal';

export interface UseAdminBookingsArgs {
  drivers: DriverItem[];
  showToast: (msg: string) => void;
  setPendingSyncCount: (fn: (c: number) => number) => void;
  setIsCloudConnected: (val: boolean) => void;
  setIsSyncing: (val: boolean) => void;
  setLastSyncedAt: (d: Date) => void;
  setConflictBooking: (data: ConflictData | null) => void;
}

export function useAdminBookings({
  drivers,
  showToast,
  setPendingSyncCount,
  setIsCloudConnected,
  setIsSyncing,
  setLastSyncedAt,
  setConflictBooking,
}: UseAdminBookingsArgs) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [manifestDate, setManifestDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [pendingBookingIds, setPendingBookingIds] = useState<Set<string>>(new Set());
  const hasSyncedOnce = useRef<boolean>(false);

  const saveBookings = useCallback((next: Booking[]) => {
    setBookings(next);
    safeSet(STORAGE_KEY_BOOKINGS, next);
  }, []);

  const fetchBookingsFromServer = useCallback(
    async (silent = false): Promise<void> => {
      setIsSyncing(true);
      try {
        const res = await fetch('/api/bookings');
        if (!res.ok) {
          if (!silent) showToast('⚠️ Bulut verisi alınamadı.');
          setIsCloudConnected(false);
          return;
        }
        const payload = (await res.json()) as { bookings?: Booking[] };
        if (Array.isArray(payload.bookings)) {
          if (payload.bookings.length > 0 || hasSyncedOnce.current) {
            setBookings(payload.bookings);
            safeSet(STORAGE_KEY_BOOKINGS, payload.bookings);
          } else if (payload.bookings.length === 0 && !safeGet(STORAGE_KEY_BOOKINGS, null)) {
            setBookings(initialBookings);
          }
          hasSyncedOnce.current = true;
          setIsCloudConnected(true);
          setLastSyncedAt(new Date());
        }
      } catch {
        if (!silent) showToast('📶 Çevrimdışı mod: yerel kayıtlar korunuyor.');
        setIsCloudConnected(false);
      } finally {
        setIsSyncing(false);
      }
    },
    [setIsSyncing, setIsCloudConnected, setLastSyncedAt, showToast]
  );

  const handleUpdateSingleBooking = useCallback(
    async (fullBooking: Booking, successMsg?: string): Promise<boolean> => {
      const prevBookings = bookings;
      saveBookings(bookings.map((b) => (b.id === fullBooking.id ? fullBooking : b)));
      if (successMsg) showToast(successMsg);

      const result = await submitMutation({
        type: 'PUT_BOOKING',
        url: '/api/bookings',
        method: 'PUT',
        body: fullBooking,
        description: `${fullBooking.customerName} rezervasyon güncelleme`,
      });

      if (result.status === 'success') {
        return true;
      }

      if (result.status === 'conflict') {
        const serverVersion = result.serverData as Booking;
        setConflictBooking({
          clientBooking: fullBooking,
          serverBooking: serverVersion,
          lastSavedAt: new Date(),
        });
        showToast('⚠️ Bu rezervasyon başka bir kullanıcı tarafından güncellenmiş!');
        return false;
      }

      if (result.status === 'failed') {
        setBookings(prevBookings);
        safeSet(STORAGE_KEY_BOOKINGS, prevBookings);
        showToast(`⚠️ Kayıt geri alındı: ${result.error || 'Bilinmeyen hata'}`);
        return false;
      }

      if (result.status === 'queued') {
        setPendingSyncCount((c) => c + 1);
        setPendingBookingIds((prev) => new Set(prev).add(fullBooking.id));
        showToast('📶 Çevrimdışı kaydedildi: İnternet bağlandığında bulut güncellenecektir.');
        return true;
      }

      return false;
    },
    [bookings, saveBookings, showToast, setConflictBooking, setPendingSyncCount]
  );

  const applyAssignment = useCallback(
    async (
      bookingId: string,
      tourIndex: number,
      patch: Partial<Pick<BookingTourSchedule, 'assignedVehicle' | 'assignedDriver' | 'pickupStatus' | 'pickedUpAt' | 'pickupTime'>>
    ) => {
      const target = bookings.find((b) => b.id === bookingId);
      if (!target) return null;

      const full = { ...target };
      if (patch.pickupTime && (tourIndex === 0 || !full.tours || full.tours.length === 0)) {
        full.pickupTime = patch.pickupTime;
      }
      if (tourIndex >= 0 && full.tours && full.tours[tourIndex]) {
        const nextTours = [...full.tours];
        nextTours[tourIndex] = { ...nextTours[tourIndex], ...patch };
        full.tours = nextTours;
      } else {
        Object.assign(full, patch);
      }

      if (patch.pickupStatus === 'completed') {
        full.status = 'completed';
      }

      await handleUpdateSingleBooking(full);
      return full;
    },
    [bookings, handleUpdateSingleBooking]
  );

  const handleUpdatePickupStatus = useCallback(
    async (
      bookingId: string,
      tourIndex: number,
      status: 'pending' | 'picked_up' | 'on_tour' | 'completed' | 'no_show'
    ) => {
      const nowTime = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      const full = await applyAssignment(bookingId, tourIndex, {
        pickupStatus: status,
        pickedUpAt: status === 'picked_up' ? nowTime : undefined,
      });
      if (full) {
        if (status === 'picked_up') {
          showToast(`🚐 ${full.customerName} otelden alındı (${nowTime})`);
        } else if (status === 'no_show') {
          showToast(`⚠️ ${full.customerName} NO-SHOW olarak işaretlendi`);
        } else {
          showToast(`Durum güncellendi: ${status}`);
        }
      }
    },
    [applyAssignment, showToast]
  );

  const handleQrScanResult = useCallback(
    async (scannedCode: string, tourIndex: number) => {
      const clean = scannedCode.trim().toUpperCase();
      const found = bookings.find(
        (b) =>
          b.id.toUpperCase() === clean ||
          b.id.toUpperCase().includes(clean) ||
          (b.ticketCode && b.ticketCode.toUpperCase() === clean)
      );
      if (!found) {
        showToast(`⚠️ Rezervasyon bulunamadı: ${clean}`);
        return;
      }
      const nowTime = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      await applyAssignment(found.id, tourIndex >= 0 ? tourIndex : 0, {
        pickupStatus: 'picked_up',
        pickedUpAt: nowTime,
      });
      if (found.remainingAmountThb > 0) {
        showToast(`✅ ${found.customerName} bindi! ⚠️ Kalan Alınacak: ${fmtMoney(found.remainingAmountThb)} THB`);
      } else {
        showToast(`✅ ${found.customerName} bilet doğrulandı ve araca bindi olarak kaydedildi.`);
      }
    },
    [bookings, applyAssignment, showToast]
  );

  const handleAssignVehicleToBooking = useCallback(
    async (bookingId: string, tourIndex: number, vehicle: string) => {
      const full = await applyAssignment(bookingId, tourIndex, { assignedVehicle: vehicle });
      if (full) {
        showToast(`🚐 ${full.customerName} için hat atandı: ${vehicle}`);
        void sendTransferPushNotification({
          bookingId: full.id,
          customerName: full.customerName,
          hotel: full.hotel,
          newTime: full.pickupTime || '07:30',
          vehicle,
          roomNumber: full.roomNumber,
        });
      }
    },
    [applyAssignment, showToast]
  );

  const handleAssignDriverToBooking = useCallback(
    async (bookingId: string, tourIndex: number, driverId: string) => {
      const driverName = driverId
        ? drivers.find((d) => d.id === driverId)?.fullName
        : undefined;
      const full = await applyAssignment(bookingId, tourIndex, {
        assignedDriver: driverId || undefined,
      });
      if (full) {
        showToast(
          driverName
            ? `🧑‍✈️ ${full.customerName} için görevli atandı: ${driverName}`
            : `ℹ️ ${full.customerName} için görevli ataması kaldırıldı.`
        );
        if (driverName) {
          void sendTransferPushNotification({
            bookingId: full.id,
            customerName: full.customerName,
            hotel: full.hotel,
            newTime: full.pickupTime || '07:30',
            driverName,
            driverId,
            roomNumber: full.roomNumber,
          });
        }
      }
    },
    [applyAssignment, drivers, showToast]
  );

  const handleUpdatePickupTime = useCallback(
    async (bookingId: string, tourIndex: number, newTime: string) => {
      const booking = bookings.find((b) => b.id === bookingId);
      if (!booking) return;

      const currentSchedule = booking.tours || [];
      const targetTour = currentSchedule[tourIndex] || currentSchedule[0];
      const oldTime = targetTour?.pickupTime || booking.pickupTime || '07:30';

      const full = await applyAssignment(bookingId, tourIndex, { pickupTime: newTime });
      if (full) {
        showToast(`⏰ ${full.customerName} için alınış saati güncellendi: ${oldTime} → ${newTime}`);
        void sendTransferPushNotification({
          bookingId: full.id,
          customerName: full.customerName,
          hotel: full.hotel,
          oldTime,
          newTime,
          roomNumber: full.roomNumber,
        });
      }
    },
    [bookings, applyAssignment, showToast]
  );

  const handleUpdateSupplierStatus = useCallback(
    (
      bookingId: string,
      supplierStatus: 'pending' | 'confirmed' | 'cancelled',
      supplierRefCode?: string
    ) => {
      const updated = bookings.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              supplierStatus,
              ...(supplierRefCode ? { supplierRefCode } : {}),
            }
          : b
      );
      saveBookings(updated);
    },
    [bookings, saveBookings]
  );

  const handleBulkReschedule = useCallback(
    async (bookingIds: string[], newDate: string, reason: string) => {
      const updated = bookings.map((b) => {
        if (!bookingIds.includes(b.id)) return b;
        const nextTours = b.tours?.map((t) => ({ ...t, tourDate: newDate })) || [];
        return {
          ...b,
          tourDate: newDate,
          tours: nextTours,
          specialNotes: b.specialNotes
            ? `${b.specialNotes} | Erteleme: ${reason}`
            : `Erteleme: ${reason}`,
        };
      });

      setBookings(updated);
      safeSet(STORAGE_KEY_BOOKINGS, updated);

      for (const id of bookingIds) {
        const found = updated.find((b) => b.id === id);
        if (found) {
          void handleUpdateSingleBooking(found);
        }
      }
      showToast(`🌊 ${bookingIds.length} rezervasyon ${newDate} tarihine ertelendi.`);
    },
    [bookings, handleUpdateSingleBooking, showToast]
  );

  const handleUpdateBookingPassengers = useCallback(
    async (bookingId: string, passengers: PassengerItem[]) => {
      const target = bookings.find((b) => b.id === bookingId);
      if (!target) return;
      const full: Booking = { ...target, passengers };
      await handleUpdateSingleBooking(full, 'Manifesto pasaport bilgileri kaydedildi ve senkronlandı!');
    },
    [bookings, handleUpdateSingleBooking]
  );

  const handleAcceptServerConflict = useCallback(
    (serverBooking: Booking) => {
      saveBookings(bookings.map((b) => (b.id === serverBooking.id ? serverBooking : b)));
      setConflictBooking(null);
      showToast('Sunucudaki güncel sürüm kabul edildi.');
    },
    [bookings, saveBookings, setConflictBooking, showToast]
  );

  const handleForceOverwriteConflict = useCallback(
    async (clientBooking: Booking) => {
      saveBookings(bookings.map((b) => (b.id === clientBooking.id ? clientBooking : b)));
      setConflictBooking(null);
      await submitMutation({
        type: 'PUT_BOOKING',
        url: '/api/bookings',
        method: 'PUT',
        body: clientBooking,
        description: `${clientBooking.customerName} çakışma zorla üzerine yazma`,
      });
      showToast('Değişiklikleriniz sunucuya zorla yazıldı.');
    },
    [bookings, saveBookings, setConflictBooking, showToast]
  );

  const filteredBookings = useMemo(
    () => filterBookings(bookings, searchQuery, statusFilter, dateFilter),
    [bookings, searchQuery, statusFilter, dateFilter]
  );

  const stats = useMemo(() => {
    const totalRevenue = bookings
      .filter((b) => b.status === 'confirmed' || b.status === 'completed')
      .reduce((acc, curr) => acc + curr.totalPriceThb, 0);

    const pendingCount = bookings.filter((b) => b.status === 'inquiry').length;
    const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;
    const completedCount = bookings.filter((b) => b.status === 'completed').length;
    const unassignedCount = bookings.filter(
      (b) =>
        (b.status === 'confirmed' || b.status === 'inquiry') &&
        (!b.assignedVehicle || b.assignedVehicle === 'Atanmadı')
    ).length;

    return {
      totalBookings: bookings.length,
      confirmedCount,
      pendingCount,
      completedCount,
      unassignedCount,
      totalRevenue,
    };
  }, [bookings]);

  const pendingBookingsCount = useMemo(
    () => bookings.filter((b) => b.status === 'inquiry').length,
    [bookings]
  );

  return {
    bookings,
    setBookings,
    saveBookings,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    manifestDate,
    setManifestDate,
    pendingBookingIds,
    fetchBookingsFromServer,
    handleUpdateSingleBooking,
    applyAssignment,
    handleUpdatePickupStatus,
    handleQrScanResult,
    handleAssignVehicleToBooking,
    handleAssignDriverToBooking,
    handleUpdatePickupTime,
    handleUpdateSupplierStatus,
    handleBulkReschedule,
    handleUpdateBookingPassengers,
    handleAcceptServerConflict,
    handleForceOverwriteConflict,
    filteredBookings,
    stats,
    pendingBookingsCount,
  };
}
