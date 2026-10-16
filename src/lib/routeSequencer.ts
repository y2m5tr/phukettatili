import { getZoneOrder, formatHotelLocation, detectDeparturePier } from './maps';

export type RouteSortMode = 'time' | 'pier_bound' | 'reverse';

export interface RouteStop {
  id: string;
  bookingId: string;
  customerName: string;
  phone: string;
  hotel: string;
  hotelZone: string;
  roomNumber?: string;
  pickupTime: string;
  adultCount: number;
  childCount: number;
  remainingAmountThb: number;
  tourTitle: string;
  assignedDriver?: string;
  assignedVehicle?: string;
}

export interface SequencedRoute {
  vehicle: string;
  driverName?: string;
  driverPhone?: string;
  pier: string;
  sortMode: RouteSortMode;
  stops: RouteStop[];
  totalPassengers: number;
  totalCashToCollectThb: number;
  estimatedDrivingMinutes: number;
  googleMapsUrl: string;
  wazeUrl: string;
}

/**
 * Verilen durakları seçilen moda göre akıllıca sıralar.
 */
export function sequenceRouteStops(stops: RouteStop[], mode: RouteSortMode = 'pier_bound'): RouteStop[] {
  const cloned = [...stops];

  if (mode === 'time') {
    return cloned.sort((a, b) => {
      const timeCompare = (a.pickupTime || '07:30').localeCompare(b.pickupTime || '07:30');
      if (timeCompare !== 0) return timeCompare;
      return getZoneOrder(a.hotelZone) - getZoneOrder(b.hotelZone);
    });
  }

  if (mode === 'pier_bound') {
    // Coğrafi sıralama (Kuzeyden Güneye / İskelelere doğru en kısa hat)
    return cloned.sort((a, b) => {
      const zoneCompare = getZoneOrder(a.hotelZone) - getZoneOrder(b.hotelZone);
      if (zoneCompare !== 0) return zoneCompare;
      return (a.pickupTime || '07:30').localeCompare(b.pickupTime || '07:30');
    });
  }

  // reverse (Güneyden Kuzeye)
  return cloned.sort((a, b) => {
    const zoneCompare = getZoneOrder(b.hotelZone) - getZoneOrder(a.hotelZone);
    if (zoneCompare !== 0) return zoneCompare;
    return (a.pickupTime || '07:30').localeCompare(b.pickupTime || '07:30');
  });
}

/**
 * Şoförün çoklu duraklı rotasını hesaplar ve navigasyon linklerini üretir.
 */
export function buildSequencedRoute(
  vehicle: string,
  rawStops: RouteStop[],
  mode: RouteSortMode = 'pier_bound',
  driverName?: string,
  driverPhone?: string
): SequencedRoute {
  const stops = sequenceRouteStops(rawStops, mode);
  const totalPassengers = stops.reduce((sum, s) => sum + (s.adultCount || 0) + (s.childCount || 0), 0);
  const totalCashToCollectThb = stops.reduce((sum, s) => sum + (s.remainingAmountThb || 0), 0);
  const pier = detectDeparturePier(stops[0]?.tourTitle || '');

  // Tahmini sürüş süresi (durak başı 10-12 dk + iskeleye 25 dk)
  const uniqueHotels = Array.from(new Set(stops.map((s) => s.hotel)));
  const estimatedDrivingMinutes = Math.max(30, uniqueHotels.length * 10 + 20);

  // Google Maps Rota Linki
  let googleMapsUrl = '';
  if (uniqueHotels.length === 0) {
    googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pier)}`;
  } else if (uniqueHotels.length === 1) {
    const origin = encodeURIComponent(formatHotelLocation(uniqueHotels[0]));
    const dest = encodeURIComponent(pier);
    googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}`;
  } else {
    const origin = encodeURIComponent(formatHotelLocation(uniqueHotels[0]));
    const waypoints = uniqueHotels
      .slice(1)
      .map((h) => encodeURIComponent(formatHotelLocation(h)))
      .join('|');
    const dest = encodeURIComponent(pier);
    googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&waypoints=${waypoints}&travelmode=driving`;
  }

  // Waze Linki (İlk otel navigasyonu)
  const firstHotelLocation = uniqueHotels[0] ? formatHotelLocation(uniqueHotels[0]) : pier;
  const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(firstHotelLocation)}&navigate=yes`;

  return {
    vehicle,
    driverName,
    driverPhone,
    pier,
    sortMode: mode,
    stops,
    totalPassengers,
    totalCashToCollectThb,
    estimatedDrivingMinutes,
    googleMapsUrl,
    wazeUrl,
  };
}

/**
 * Şoför için doğrudan WhatsApp rota ve görev emri metni oluşturur.
 */
export function formatDriverWhatsAppRouteMessage(route: SequencedRoute, dateStr: string): string {
  const sortModeText =
    route.sortMode === 'pier_bound'
      ? '🗺️ İskele İstikameti (Kuzey ➔ Güney)'
      : route.sortMode === 'time'
      ? '🕒 Alınış Saatine Göre'
      : '🔄 Güney ➔ Kuzey';

  const lines = [
    `🚐 *PHUKET TATİLİ — TRANSFER GÖREV EMRİ & ROTA PLANI*`,
    `📅 *Tarih:* ${dateStr}`,
    `🚐 *Araç / Hat:* ${route.vehicle}`,
    `🧑‍✈️ *Şoför:* ${route.driverName || 'Atanmadı'} ${route.driverPhone ? `(${route.driverPhone})` : ''}`,
    `👥 *Yolcu:* ${route.totalPassengers} Kişi (${route.stops.length} Alınış)`,
    `⏱️ *Tahmini Seyir Süresi:* ~${route.estimatedDrivingMinutes} dakika`,
    `🏁 *Varış İskelesi:* ${route.pier}`,
    `🧭 *Sıralama Modu:* ${sortModeText}`,
    `───────────────────────────────`,
    `🗺️ *CANLI GOOGLE MAPS ROTA LİNKİ:*`,
    `${route.googleMapsUrl}`,
    ``,
    `🚙 *Waze Navigasyon (1. Durak):*`,
    `${route.wazeUrl}`,
    `───────────────────────────────`,
    `📍 *DURAK VE YOLCU SIRALAMASI:*`,
    ...route.stops.map((s, idx) => {
      const pax = `${s.adultCount || 1} Yetişkin${(s.childCount || 0) > 0 ? ` + ${s.childCount} Çocuk` : ''}`;
      const cash =
        s.remainingAmountThb > 0
          ? `\n   💵 *ALINACAK NAKİT:* ${s.remainingAmountThb.toLocaleString()} THB`
          : `\n   ✅ *Ödeme Alındı*`;
      const room = s.roomNumber ? ` (Oda: ${s.roomNumber})` : '';
      const hotelMaps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formatHotelLocation(s.hotel))}`;

      return `${idx + 1}️⃣ [⏰ *${s.pickupTime || '07:30'}*] *${s.hotel}*${room}\n   👤 ${s.customerName} (${pax}) · 📞 ${s.phone}${cash}\n   📍 Harita: ${hotelMaps}`;
    }),
    `───────────────────────────────`,
    route.totalCashToCollectThb > 0
      ? `💰 *TOPLAM TAHSİL EDİLECEK NAKİT:* ${route.totalCashToCollectThb.toLocaleString()} THB\n───────────────────────────────\n`
      : '',
    `İyi ve güvenli sürüşler dileriz! 🌴🇹🇭`,
  ];

  return lines.join('\n');
}

/**
 * Şoförün WhatsApp'ına tek tıkla mesaj atma linki üretir.
 */
export function getDriverRouteWhatsAppUrl(route: SequencedRoute, dateStr: string): string {
  const cleanPhone = (route.driverPhone || '66828950665').replace(/[^0-9]/g, '');
  const message = formatDriverWhatsAppRouteMessage(route, dateStr);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
