import { useState, useMemo } from 'react';
import type { DriverItem } from '../../../data/adminInitialData';
import type { PickupItem } from '../../../lib/adminFilters';
import type { RouteSortMode } from '../../../lib/routeSequencer';
import { generateMultiStopMapUrl, getSingleHotelMapUrl, detectDeparturePier, getZoneOrder } from '../../../lib/maps';
import { fmtMoney } from '../../../lib/moneyFormat';
import type { RouteData } from './TransferRoutesView';

interface UseTransferRoutesProps {
  dailyPickups: PickupItem[];
  safeDrivers: DriverItem[];
  safeDate: string;
  showToast: (msg: string) => void;
}

export function useTransferRoutes({
  dailyPickups,
  safeDrivers,
  safeDate,
  showToast,
}: UseTransferRoutesProps) {
  const [routeSortModes, setRouteSortModes] = useState<Record<string, RouteSortMode>>({});
  const [customStopOrder, setCustomStopOrder] = useState<Record<string, string[]>>({});

  const routeVehicles = useMemo(() => {
    return Array.from(new Set(dailyPickups.map((p) => p.assignedVehicle).filter(Boolean)));
  }, [dailyPickups]);

  const vehicleRoutes: RouteData[] = useMemo(() => {
    const groups: Record<string, PickupItem[]> = {};
    dailyPickups.forEach((p) => {
      const v = p.assignedVehicle || 'Atanmadı';
      if (!groups[v]) groups[v] = [];
      groups[v].push(p);
    });

    return Object.entries(groups).map(([vehicle, items]) => {
      const currentMode: RouteSortMode = routeSortModes[vehicle] || 'pier_bound';

      let sortedStops = [...items].sort((a, b) => {
        if (currentMode === 'time') {
          const timeCompare = (a.pickupTime || '07:30').localeCompare(b.pickupTime || '07:30');
          if (timeCompare !== 0) return timeCompare;
          return getZoneOrder(a.hotelZone) - getZoneOrder(b.hotelZone);
        } else if (currentMode === 'reverse') {
          const zoneCompare = getZoneOrder(b.hotelZone) - getZoneOrder(a.hotelZone);
          if (zoneCompare !== 0) return zoneCompare;
          return (a.pickupTime || '07:30').localeCompare(b.pickupTime || '07:30');
        } else {
          const zoneCompare = getZoneOrder(a.hotelZone) - getZoneOrder(b.hotelZone);
          if (zoneCompare !== 0) return zoneCompare;
          return (a.pickupTime || '07:30').localeCompare(b.pickupTime || '07:30');
        }
      });

      const manualOrder = customStopOrder[vehicle];
      if (manualOrder && manualOrder.length > 0) {
        sortedStops = [...sortedStops].sort((a, b) => {
          const keyA = `${a.bookingId}-${a.tourIndex}`;
          const keyB = `${b.bookingId}-${b.tourIndex}`;
          const idxA = manualOrder.indexOf(keyA);
          const idxB = manualOrder.indexOf(keyB);
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          return 0;
        });
      }

      const uniqueHotels = Array.from(new Set(sortedStops.map((s) => s.hotel)));
      const pier = detectDeparturePier(sortedStops[0]?.tourTitle || '');
      const mapsUrl = generateMultiStopMapUrl(uniqueHotels, pier);
      const totalGuests = sortedStops.reduce(
        (sum, s) => sum + (s.adultCount || 0) + (s.childCount || 0),
        0
      );
      const driverId = sortedStops.find((s) => s.assignedDriver)?.assignedDriver;
      const driver = safeDrivers.find((d) => d && d.id === driverId);

      const firstHotelLocation = uniqueHotels[0] ? uniqueHotels[0] : pier;
      const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(
        firstHotelLocation + ', Phuket, Thailand'
      )}&navigate=yes`;

      return {
        vehicle,
        driver,
        stops: sortedStops,
        uniqueHotels,
        pier,
        mapsUrl,
        wazeUrl,
        totalGuests,
        sortMode: currentMode,
      };
    });
  }, [dailyPickups, safeDrivers, routeSortModes, customStopOrder]);

  const handleMoveStop = (vehicle: string, index: number, direction: 'up' | 'down') => {
    const route = vehicleRoutes.find((r) => r.vehicle === vehicle);
    if (!route) return;
    const currentKeys = route.stops.map((s) => `${s.bookingId}-${s.tourIndex}`);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentKeys.length) return;

    const newKeys = [...currentKeys];
    const [moved] = newKeys.splice(index, 1);
    newKeys.splice(targetIndex, 0, moved);

    setCustomStopOrder((prev) => ({
      ...prev,
      [vehicle]: newKeys,
    }));
    showToast('Durak sırası güncellendi 📍');
  };

  const handleSendWhatsAppRouteToDriver = (route: RouteData) => {
    const dateStr = (() => {
      try {
        const d = new Date(safeDate);
        return isNaN(d.getTime())
          ? safeDate
          : d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
      } catch {
        return safeDate;
      }
    })();

    const cleanPhone = (route.driver?.phone || '66828950665').replace(/[^0-9]/g, '');
    const lines = [
      `🚐 *PHUKET TATİLİ — TRANSFER GÖREV EMRİ & ROTA PLANI*`,
      `📅 *Tarih:* ${dateStr}`,
      `🚐 *Hat:* ${route.vehicle}`,
      `🧑‍✈️ *Şoför:* ${route.driver ? `${route.driver.fullName} (${route.driver.phone || 'Tel Yok'})` : 'Atanmadı'}`,
      `👥 *Toplam Yolcu:* ${route.totalGuests} Kişi (${route.stops.length} Alınış)`,
      `🏁 *Varış İskelesi:* ${route.pier}`,
      `🧭 *Sıralama Modu:* ${
        route.sortMode === 'pier_bound'
          ? '🗺️ İskele İstikameti (Kuzey➔Güney)'
          : route.sortMode === 'time'
          ? '🕒 Alınış Saatine Göre'
          : '🔄 Güney➔Kuzey'
      }`,
      `───────────────────────────────`,
      `🗺️ *Canlı Google Haritalar Rotası:*`,
      `${route.mapsUrl}`,
      ``,
      `🚙 *Waze Navigasyon (1. Durak):*`,
      `${route.wazeUrl}`,
      `───────────────────────────────`,
      `📍 *DURAK VE YOLCU SIRALAMASI:*`,
      ...route.stops.map((s, idx) => {
        const pax = `${s.adultCount || 1} Yetişkin${(s.childCount || 0) > 0 ? ` + ${s.childCount} Çocuk` : ''}`;
        const remaining = Number(s.remainingAmountThb) || 0;
        const cash = remaining > 0 ? `\n   💵 *ALINACAK NAKİT:* ${fmtMoney(remaining)} THB` : ' \n   ✅ *Ödeme Alındı*';
        const room = s.roomNumber ? ` (Oda: ${s.roomNumber})` : '';
        const singleMap = getSingleHotelMapUrl(s.hotel);
        return `${idx + 1}️⃣ [⏰ *${s.pickupTime || '07:30'}*] *${s.hotel}*${room}\n   👤 ${s.customerName} (${pax}) · 📞 ${s.phone}${cash}\n   📍 Harita: ${singleMap}`;
      }),
      `───────────────────────────────`,
      `İyi ve güvenli sürüşler dileriz! 🌴🇹🇭`,
    ];

    const message = lines.join('\n');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleCopyRouteForDriver = (route: RouteData) => {
    const dateStr = (() => {
      try {
        const d = new Date(safeDate);
        return isNaN(d.getTime())
          ? safeDate
          : d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
      } catch {
        return safeDate;
      }
    })();

    const lines = [
      `🚐 *TRANSFER GÖREV EMRİ & ROTA PLANI*`,
      `📅 *Tarih:* ${dateStr}`,
      `🚐 *Hat:* ${route.vehicle}`,
      `🧑‍✈️ *Şoför:* ${route.driver ? `${route.driver.fullName} (${route.driver.phone || 'Tel Yok'})` : 'Atanmadı'}`,
      `👥 *Toplam Yolcu:* ${route.totalGuests} Kişi (${route.stops.length} Alınış)`,
      `🏁 *Varış İskelesi:* ${route.pier}`,
      `───────────────────────────────`,
      `🗺️ *Canlı Google Haritalar Rotası:*`,
      `${route.mapsUrl}`,
      `───────────────────────────────`,
      `📍 *DURAK SIRALAMASI:*`,
      ...route.stops.map((s, idx) => {
        const pax = `${s.adultCount || 1} Yetişkin${(s.childCount || 0) > 0 ? ` + ${s.childCount} Çocuk` : ''}`;
        const remaining = Number(s.remainingAmountThb) || 0;
        const cash = remaining > 0 ? ` ⚠️ ALINACAK NAKİT: *${fmtMoney(remaining)} THB*` : ' ✓ Ödendi';
        const room = s.roomNumber ? ` (Oda: ${s.roomNumber})` : '';
        return `${idx + 1}. [${s.pickupTime || '07:30'}] ${s.hotel}${room}\n   👤 ${s.customerName} (${pax}) · 📞 ${s.phone}\n  ${cash}`;
      }),
      `───────────────────────────────`,
      `İyi ve güvenli sürüşler dileriz! 🌴🇹🇭`,
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    showToast(`"${route.vehicle}" şoför görev metni panoya kopyalandı! 📋`);
  };

  return {
    routeVehicles,
    vehicleRoutes,
    routeSortModes,
    setRouteSortModes,
    customStopOrder,
    setCustomStopOrder,
    handleMoveStop,
    handleSendWhatsAppRouteToDriver,
    handleCopyRouteForDriver,
  };
}
