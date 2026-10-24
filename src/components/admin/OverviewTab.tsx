import { useMemo, useState, useEffect } from 'react';
import type { Booking, TourItem } from '../../data/adminInitialData';
import { calculateTourOccupancy, getTourCapacity } from '../../lib/allotment';
import type {
  OverviewStats,
  OverviewTabProps,
  TodayDispatchSummary,
  TodayDispatchItem,
} from './overview/overviewTypes';
import { OverviewDispatchCockpit } from './overview/OverviewDispatchCockpit';
import { OverviewStatsCards } from './overview/OverviewStatsCards';
import { OverviewOccupancyViewsCards } from './overview/OverviewOccupancyViewsCards';

export type { OverviewStats, OverviewTabProps };

export default function OverviewTab({
  stats,
  bookings = [],
  tours = [],
  bookingsCount,
  toursCount,
  servicesCount,
  blogsCount,
  faqsCount,
  testimonialsCount,
  canViewFinancialMargins = true,
  setActiveTab,
  onOpenCreateBooking,
  onOpenQrScanner,
  onOpenPoliceManifest,
  onOpenBulkReschedule,
  onOpenWorkflow,
  showToast,
  pendingBookingIds,
  sync,
}: OverviewTabProps) {
  // Bugünün Phuket tarihi (UTC+7)
  const todayStr = useMemo(() => {
    try {
      const now = new Date();
      return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(now);
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  }, []);

  // Ziyaretçi ilgi sıralaması (Canlı sayaç API'si)
  const [liveViews, setLiveViews] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch('/api/tour-views')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.views && typeof data.views === 'object') {
          setLiveViews(data.views);
        }
      })
      .catch(() => {});
  }, []);

  const topViewedTours = useMemo(() => {
    const list = tours.map((t: TourItem, index: number) => {
      const realCount = liveViews[t.id];
      const count = typeof realCount === 'number' ? realCount : Math.max(12, 140 - index * 7);
      return {
        ...t,
        viewCount: count,
      };
    });
    return list.sort((a, b) => b.viewCount - a.viewCount).slice(0, 5);
  }, [tours, liveViews]);

  // Bugünün operasyon ve saha verileri
  const todayDispatch: TodayDispatchSummary = useMemo(() => {
    let guests = 0;
    let pickedUp = 0;
    let pending = 0;
    let noShow = 0;
    let cash = 0;
    const vehiclesSet = new Set<string>();
    const items: TodayDispatchItem[] = [];

    bookings.forEach((b: Booking) => {
      if (b.tours && b.tours.length > 0) {
        b.tours.forEach((t) => {
          if (t.tourDate === todayStr) {
            const count = (b.adultCount || 1) + (b.childCount || 0);
            guests += count;
            const status = t.pickupStatus || b.pickupStatus || 'pending';
            if (status === 'picked_up' || status === 'completed' || status === 'on_tour') pickedUp += count;
            else if (status === 'no_show') noShow += count;
            else pending += count;

            if (t.assignedVehicle) vehiclesSet.add(t.assignedVehicle);
            else if (b.assignedVehicle) vehiclesSet.add(b.assignedVehicle);

            cash += Number(b.remainingAmountThb) || 0;

            items.push({
              bookingId: b.id,
              customerName: b.customerName,
              tourTitle: t.tourTitle,
              pickupTime: t.pickupTime || '07:30',
              hotel: b.hotel,
              hotelZone: t.hotelZone || b.hotelZone,
              pickupStatus: status,
              remainingAmountThb: b.remainingAmountThb,
            });
          }
        });
      } else if (b.tourDate === todayStr) {
        const count = (b.adultCount || 1) + (b.childCount || 0);
        guests += count;
        const status = b.pickupStatus || 'pending';
        if (status === 'picked_up' || status === 'completed' || status === 'on_tour') pickedUp += count;
        else if (status === 'no_show') noShow += count;
        else pending += count;

        if (b.assignedVehicle) vehiclesSet.add(b.assignedVehicle);
        cash += Number(b.remainingAmountThb) || 0;

        items.push({
          bookingId: b.id,
          customerName: b.customerName,
          tourTitle: b.tourTitle,
          pickupTime: b.pickupTime || '07:30',
          hotel: b.hotel,
          hotelZone: b.hotelZone,
          pickupStatus: status,
          remainingAmountThb: b.remainingAmountThb,
        });
      }
    });

    const completionRate = guests > 0 ? Math.round((pickedUp / guests) * 100) : 0;

    return {
      totalGuests: guests,
      toursCount: items.length,
      pickedUpCount: pickedUp,
      pendingCount: pending,
      noShowCount: noShow,
      cashToCollectThb: cash,
      assignedVehicles: Array.from(vehiclesSet),
      completionRate,
      todayItems: items,
    };
  }, [bookings, todayStr]);

  // Tur doluluk ve kontenjan barometresi (Bugün ve yaklaşan turlar)
  const tourOccupancies = useMemo(() => {
    const list: Array<{ title: string; capacity: number }> = tours.length > 0
      ? tours.map((t: TourItem) => ({ title: t.title, capacity: t.maxCapacity || getTourCapacity(t.title, t) }))
      : Array.from(new Set(bookings.map((b: Booking) => b.tourTitle))).map((title: string) => ({
          title,
          capacity: getTourCapacity(title),
        }));

    return list
      .map((item) => calculateTourOccupancy(item.title, todayStr, bookings, item.capacity))
      .filter((occ) => occ.bookedPax > 0 || occ.capacity > 0)
      .slice(0, 6);
  }, [tours, bookings, todayStr]);

  const overdueBookings = useMemo(() => {
    return bookings.filter(
      (b: Booking) => b.status !== 'cancelled' && (Number(b.remainingAmountThb) || 0) > 0 && b.tourDate < todayStr
    );
  }, [bookings, todayStr]);

  const overdueAmountThb = useMemo(() => {
    return overdueBookings.reduce((sum: number, b: Booking) => sum + (Number(b.remainingAmountThb) || 0), 0);
  }, [overdueBookings]);

  return (
    <div className="space-y-8">
      {/* 🚀 BUGÜNÜN SAHA & OPERASYON KOKPİTİ */}
      <OverviewDispatchCockpit
        todayStr={todayStr}
        todayDispatch={todayDispatch}
        bookings={bookings}
        pendingBookingIds={pendingBookingIds}
        sync={sync}
        onOpenQrScanner={onOpenQrScanner}
        setActiveTab={setActiveTab}
        onOpenPoliceManifest={onOpenPoliceManifest}
        onOpenBulkReschedule={onOpenBulkReschedule}
        onOpenWorkflow={onOpenWorkflow}
        onOpenCreateBooking={onOpenCreateBooking}
        showToast={showToast}
      />

      {/* 📊 UYARILAR & STAT KARTLARI */}
      <OverviewStatsCards
        stats={stats}
        todayStr={todayStr}
        overdueBookings={overdueBookings}
        overdueAmountThb={overdueAmountThb}
        canViewFinancialMargins={canViewFinancialMargins}
        setActiveTab={setActiveTab}
        onOpenBulkReschedule={onOpenBulkReschedule}
      />

      {/* ⛵ KONTENJAN, İLGİ RADARI & KISAYOLLAR */}
      <OverviewOccupancyViewsCards
        tourOccupancies={tourOccupancies}
        topViewedTours={topViewedTours}
        bookingsCount={bookingsCount}
        toursCount={toursCount}
        servicesCount={servicesCount}
        blogsCount={blogsCount}
        faqsCount={faqsCount}
        testimonialsCount={testimonialsCount}
        setActiveTab={setActiveTab}
      />
    </div>
  );
}
