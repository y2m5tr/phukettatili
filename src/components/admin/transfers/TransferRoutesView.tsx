import React from 'react';
import type { Booking, DriverItem } from '../../../data/adminInitialData';
import type { PickupItem } from '../../../lib/adminFilters';
import type { RouteSortMode } from '../../../lib/routeSequencer';
import {
  Car,
  Copy,
  Navigation,
  Phone,
  MessageCircle,
  ExternalLink,
  CheckCircle2,
  Compass,
  Star,
  Zap,
  BellRing,
  MapPin,
} from 'lucide-react';
import { getSingleHotelMapUrl } from '../../../lib/maps';
import { getGoogleReviewWhatsAppUrl } from '../../../lib/reviewBooster';
import { sendTransferPushNotification } from '../../../lib/pwaNotifications';
import { fmtMoney } from '../../../lib/moneyFormat';

export interface RouteData {
  vehicle: string;
  driver?: DriverItem;
  stops: PickupItem[];
  uniqueHotels: string[];
  pier: string;
  mapsUrl: string;
  wazeUrl: string;
  totalGuests: number;
  sortMode: RouteSortMode;
}

export interface TransferRoutesViewProps {
  vehicleRoutes: RouteData[];
  bookings: Booking[];
  pendingBookingIds?: Set<string>;
  googleReviewUrl?: string;
  showToast: (msg: string) => void;
  setRouteSortModes: React.Dispatch<React.SetStateAction<Record<string, RouteSortMode>>>;
  setCustomStopOrder: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  handleMoveStop: (vehicle: string, index: number, direction: 'up' | 'down') => void;
  handleSendWhatsAppRouteToDriver: (route: RouteData) => void;
  handleCopyRouteForDriver: (route: RouteData) => void;
  handleUpdatePickupStatus?: (
    bookingId: string,
    tourIndex: number,
    status: 'pending' | 'picked_up' | 'on_tour' | 'completed' | 'no_show'
  ) => void;
  handleUpdatePickupTime?: (bookingId: string, tourIndex: number, newTime: string) => Promise<void> | void;
  onOpenWorkflow?: (b: Booking) => void;
}

export default function TransferRoutesView({
  vehicleRoutes,
  bookings,
  pendingBookingIds,
  googleReviewUrl,
  showToast,
  setRouteSortModes,
  setCustomStopOrder,
  handleMoveStop,
  handleSendWhatsAppRouteToDriver,
  handleCopyRouteForDriver,
  handleUpdatePickupStatus,
  handleUpdatePickupTime,
  onOpenWorkflow,
}: TransferRoutesViewProps) {
  if (vehicleRoutes.length === 0) {
    return (
      <div className="bg-white dark:bg-surface-2 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center text-slate-400">
        <Car className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
        <p className="font-semibold text-slate-600 dark:text-slate-400">
          Seçilen tarihte hat / araç ataması bulunamadı.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {vehicleRoutes.map((route) => {
        const pickedInRoute = route.stops.filter((s) => s.pickupStatus === 'picked_up').length;
        const totalCashToCollect = route.stops.reduce(
          (acc, s) => acc + (Number(s.remainingAmountThb) || 0),
          0
        );

        return (
          <div
            key={route.vehicle}
            className="bg-white dark:bg-surface-2 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between"
          >
            {/* Route Header */}
            <div className="p-5 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200/80 dark:border-slate-800">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-9 h-9 rounded-xl bg-brand-primary/10 dark:bg-brand-accent/10 text-brand-primary dark:text-brand-accent flex items-center justify-center font-bold text-lg">
                      🚐
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">
                        {route.vehicle}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>🧑‍✈️ {route.driver ? `${route.driver.fullName}` : 'Şoför Atanmadı'}</span>
                        {route.driver?.phone && (
                          <a
                            href={`tel:${route.driver.phone}`}
                            className="text-brand-primary dark:text-brand-accent hover:underline flex items-center gap-0.5 font-medium"
                          >
                            <Phone className="w-3 h-3" />
                            {route.driver.phone}
                          </a>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Pills */}
                <div className="flex flex-col items-end gap-1">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    {route.totalGuests} Misafir · {route.stops.length} Alınış
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    Binen: {pickedInRoute} / {route.stops.length}
                  </span>
                </div>
              </div>

              {/* Cash to collect badge & Pier info */}
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>
                    Varış: <strong className="text-slate-900 dark:text-white">{route.pier}</strong>
                  </span>
                </div>
                {totalCashToCollect > 0 ? (
                  <span className="px-2.5 py-0.5 rounded-lg font-bold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
                    💰 Alınacak Nakit: {fmtMoney(totalCashToCollect)} THB
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-lg font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300">
                    ✓ Nakit Yok (Ödendi)
                  </span>
                )}
              </div>

              {/* Akıllı Sıralama Modu Seçici */}
              <div className="mt-3 p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-between gap-2 flex-wrap text-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-brand-primary" />
                  <span>Rota Sıralaması:</span>
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setRouteSortModes((prev) => ({ ...prev, [route.vehicle]: 'pier_bound' }));
                      setCustomStopOrder((prev) => {
                        const next = { ...prev };
                        delete next[route.vehicle];
                        return next;
                      });
                    }}
                    className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      route.sortMode === 'pier_bound'
                        ? 'bg-brand-primary text-white shadow-xs'
                        : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    🗺️ İskele Yönü (Kuzey➔Güney)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRouteSortModes((prev) => ({ ...prev, [route.vehicle]: 'time' }));
                      setCustomStopOrder((prev) => {
                        const next = { ...prev };
                        delete next[route.vehicle];
                        return next;
                      });
                    }}
                    className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      route.sortMode === 'time'
                        ? 'bg-brand-primary text-white shadow-xs'
                        : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    🕒 Saate Göre
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRouteSortModes((prev) => ({ ...prev, [route.vehicle]: 'reverse' }));
                      setCustomStopOrder((prev) => {
                        const next = { ...prev };
                        delete next[route.vehicle];
                        return next;
                      });
                    }}
                    className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      route.sortMode === 'reverse'
                        ? 'bg-brand-primary text-white shadow-xs'
                        : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    🔄 Ters Sıra
                  </button>
                </div>
              </div>

              {/* Action Buttons for Route */}
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-4 gap-2">
                <a
                  href={route.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Google Maps</span>
                </a>
                <a
                  href={route.wazeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Waze</span>
                </a>
                <button
                  type="button"
                  onClick={() => handleSendWhatsAppRouteToDriver(route)}
                  className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Şoföre Rota At</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCopyRouteForDriver(route)}
                  className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Kopyala</span>
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const firstStop = route.stops[0];
                    await sendTransferPushNotification({
                      bookingId: `ROUTE-${route.vehicle}`,
                      customerName: `${route.totalGuests} Yolcu (${route.stops.length} Durak)`,
                      hotel: `${route.stops.map((s) => s.hotel).slice(0, 2).join(', ')}${route.stops.length > 2 ? '...' : ''}`,
                      newTime: firstStop?.pickupTime || '07:30',
                      vehicle: route.vehicle,
                      driverName: route.driver?.fullName,
                      driverId: route.driver?.id,
                    });
                    showToast(
                      `📲 "${route.vehicle}" şoförüne (${route.driver?.fullName || 'Tüm Ekip'}) PWA bildirimi iletildi!`
                    );
                  }}
                  className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  title="Şoförün telefonuna anlık PWA push bildirimi fırlat"
                >
                  <BellRing className="w-3.5 h-3.5" />
                  <span>PWA Bildir</span>
                </button>
              </div>
            </div>

            {/* Timeline Stops */}
            <div className="p-5 divide-y divide-slate-100 dark:divide-slate-800/60 flex-1">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  📍 Durak Sıralaması ({route.stops.length} Otel)
                </p>
                <span className="text-[10px] text-slate-400">
                  ▲/▼ ile sırayı değiştirebilirsiniz
                </span>
              </div>
              <div className="space-y-4">
                {route.stops.map((stop, idx) => (
                  <div
                    key={`${stop.bookingId}-${stop.tourIndex}`}
                    className="pt-3 first:pt-0 flex items-start gap-2.5"
                  >
                    <div className="flex flex-col items-center gap-0.5 shrink-0 mt-0.5">
                      <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveStop(route.vehicle, idx, 'up')}
                          className="w-4 h-4 rounded text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-20 cursor-pointer flex items-center justify-center"
                          title="Yukarı taşı"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          disabled={idx === route.stops.length - 1}
                          onClick={() => handleMoveStop(route.vehicle, idx, 'down')}
                          className="w-4 h-4 rounded text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-20 cursor-pointer flex items-center justify-center"
                          title="Aşağı taşı"
                        >
                          ▼
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <a
                          href={getSingleHotelMapUrl(stop.hotel)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-slate-900 dark:text-white text-xs truncate hover:text-brand-primary flex items-center gap-1"
                          title="Google Haritalar'da Gör"
                        >
                          <span>{stop.hotel}</span>
                          <ExternalLink className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            const current = stop.pickupTime || '07:30';
                            const next = prompt(
                              `"${stop.customerName}" (${stop.hotel}) için yeni alınış saatini girin:`,
                              current
                            );
                            if (next && next.trim() && next.trim() !== current) {
                              if (handleUpdatePickupTime) {
                                handleUpdatePickupTime(stop.bookingId, stop.tourIndex, next.trim());
                              }
                            }
                          }}
                          className="px-2 py-0.5 rounded-md font-mono text-xs font-bold bg-slate-100 hover:bg-amber-100 dark:bg-slate-800 dark:hover:bg-amber-950/60 text-slate-700 hover:text-amber-700 dark:text-slate-300 dark:hover:text-amber-400 shrink-0 cursor-pointer transition border border-transparent hover:border-amber-300"
                          title="Alınış Saatini Değiştir & Şoföre PWA Bildirimi Gönder"
                        >
                          ⏰ {stop.pickupTime || '07:30'} ✎
                        </button>
                      </div>

                      <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {stop.customerName}
                        </span>
                        {pendingBookingIds?.has(stop.bookingId) ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-700 animate-pulse">
                            <span className="w-1 h-1 rounded-full bg-amber-500"></span>
                            Cihazda
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-0.5 text-[9px] text-slate-400 dark:text-slate-500"
                            title="Sunucuyla senkron"
                          >
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                            Bulut
                          </span>
                        )}
                        <span>·</span>
                        <span>
                          {stop.adultCount || 1} Yetişkin
                          {(stop.childCount || 0) > 0 ? ` + ${stop.childCount} Çocuk` : ''}
                        </span>
                        {stop.roomNumber && (
                          <>
                            <span>·</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              Oda: {stop.roomNumber}
                            </span>
                          </>
                        )}
                      </div>

                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                        {(Number(stop.remainingAmountThb) || 0) > 0 ? (
                          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded">
                            Nakit: {fmtMoney((Number(stop.remainingAmountThb) || 0))} THB
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            ✓ Ödendi
                          </span>
                        )}

                        <div className="flex items-center gap-1.5 flex-wrap">
                          {onOpenWorkflow && (
                            <button
                              type="button"
                              onClick={() => {
                                const target = bookings.find((b) => b.id === stop.bookingId);
                                if (target) onOpenWorkflow(target);
                              }}
                              className="px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                              title="⚡ Saha Görev Adımları"
                            >
                              <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                              <span>Adımlar</span>
                            </button>
                          )}
                          <select
                            value={stop.pickupStatus || 'pending'}
                            onChange={(e) =>
                              handleUpdatePickupStatus &&
                              handleUpdatePickupStatus(
                                stop.bookingId,
                                stop.tourIndex,
                                e.target.value as any
                              )
                            }
                            className={`px-2 py-1 rounded-lg border text-[11px] font-bold focus:outline-none transition-colors cursor-pointer ${
                              stop.pickupStatus === 'picked_up'
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                                : stop.pickupStatus === 'on_tour'
                                ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-300'
                                : 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300'
                            }`}
                          >
                            <option value="pending">⏳ Bekliyor</option>
                            <option value="picked_up">🚐 Bindi</option>
                            <option value="on_tour">⛵ Turda</option>
                            <option value="completed">✅ Bitti</option>
                            <option value="no_show">❌ Gelmedi</option>
                          </select>
                          {stop.pickupStatus === 'completed' && (
                            <button
                              type="button"
                              onClick={() => {
                                const target = bookings.find((b) => b.id === stop.bookingId);
                                if (target) {
                                  const url = getGoogleReviewWhatsAppUrl(target, { googleReviewUrl });
                                  window.open(url, '_blank', 'noopener,noreferrer');
                                }
                              }}
                              className="px-2 py-1 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                              title="Misafire Google Yorum Daveti Gönder (WhatsApp)"
                            >
                              <Star className="w-3 h-3 fill-current" />
                              <span>Yorum</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Pier Final Stop */}
                <div className="pt-3 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    🏁
                  </span>
                  <div className="flex-1">
                    <span className="font-bold text-slate-900 dark:text-white text-xs">
                      {route.pier}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Varış & Tekneye Biniş / Liman Buluşması
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
