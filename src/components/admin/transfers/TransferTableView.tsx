import type { Booking, VehicleItem, DriverItem } from '../../../data/adminInitialData';
import type { PickupItem } from '../../../lib/adminFilters';
import {
  Car,
  MapPin,
  Phone,
  MessageCircle,
  ExternalLink,
  Ticket,
  CheckCircle2,
  Navigation,
  Star,
  Moon,
  Zap,
  BellRing,
} from 'lucide-react';
import { getSingleHotelMapUrl } from '../../../lib/maps';
import { getConciergeWhatsAppUrl } from '../../../lib/guestConcierge';
import { getGoogleReviewWhatsAppUrl } from '../../../lib/reviewBooster';
import { sendTransferPushNotification } from '../../../lib/pwaNotifications';
import { fmtMoney } from '../../../lib/moneyFormat';

export interface TransferTableViewProps {
  filteredPickups: PickupItem[];
  bookings: Booking[];
  safeVehicles: VehicleItem[];
  safeDrivers: DriverItem[];
  pendingBookingIds?: Set<string>;
  googleReviewUrl?: string;
  showToast: (msg: string) => void;
  isPickupLobbyReady: (p: PickupItem) => boolean;
  handleAssignVehicleToBooking: (bookingId: string, tourIndex: number, vehicle: string) => void;
  handleAssignDriverToBooking?: (bookingId: string, tourIndex: number, driverId: string) => void;
  handleUpdatePickupStatus?: (
    bookingId: string,
    tourIndex: number,
    status: 'pending' | 'picked_up' | 'on_tour' | 'completed' | 'no_show'
  ) => void;
  handleUpdatePickupTime?: (bookingId: string, tourIndex: number, newTime: string) => Promise<void> | void;
  setWhatsAppModalBooking: (b: Booking) => void;
  setVoucherBooking: (b: Booking) => void;
  onOpenWorkflow?: (b: Booking) => void;
}

export default function TransferTableView({
  filteredPickups,
  bookings,
  safeVehicles,
  safeDrivers,
  pendingBookingIds,
  googleReviewUrl,
  showToast,
  isPickupLobbyReady,
  handleAssignVehicleToBooking,
  handleAssignDriverToBooking,
  handleUpdatePickupStatus,
  handleUpdatePickupTime,
  setWhatsAppModalBooking,
  setVoucherBooking,
  onOpenWorkflow,
}: TransferTableViewProps) {
  return (
    <div className="bg-white dark:bg-surface-2 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200/80 dark:border-slate-800 uppercase text-[11px] tracking-wider">
            <tr>
              <th className="py-4 px-5">⏰ Alınış Saati</th>
              <th className="py-4 px-5">📍 Otel & Oda</th>
              <th className="py-4 px-5">🚐 Hat & Minibüs</th>
              <th className="py-4 px-5">🧑‍✈️ Şoför / Rehber</th>
              <th className="py-4 px-5">👤 Misafir & Telefon</th>
              <th className="py-4 px-5">👥 Kişi</th>
              <th className="py-4 px-5">🏝️ Tur & Tedarikçi</th>
              <th className="py-4 px-5">💰 Tahsilat</th>
              <th className="py-4 px-5">🚦 Saha / Biniş Durumu</th>
              <th className="py-4 px-5 text-right">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredPickups.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-14 text-center text-slate-400">
                  <Car className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                  <p className="font-semibold text-slate-600 dark:text-slate-400">
                    Seçilen filtre ve tarihte transfer kaydı bulunamadı.
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Filtreleri sıfırlayabilir veya yukarıdan başka bir tarih seçebilirsiniz.
                  </p>
                </td>
              </tr>
            ) : (
              filteredPickups.map((p, idx) => (
                <tr
                  key={`${p.bookingId}-${idx}`}
                  className={`transition-colors ${
                    isPickupLobbyReady(p)
                      ? 'bg-emerald-500/10 dark:bg-emerald-950/25 border-l-4 border-l-emerald-500 hover:bg-emerald-500/15'
                      : 'hover:bg-slate-50/60 dark:hover:bg-slate-900/30'
                  }`}
                >
                  <td className="py-4 px-5 font-mono text-sm font-extrabold text-brand-primary dark:text-brand-accent">
                    <button
                      type="button"
                      onClick={() => {
                        const current = p.pickupTime || '07:30';
                        const next = prompt(`"${p.customerName}" (${p.hotel}) için yeni alınış saatini girin:`, current);
                        if (next && next.trim() && next.trim() !== current) {
                          if (handleUpdatePickupTime) {
                            handleUpdatePickupTime(p.bookingId, p.tourIndex, next.trim());
                          }
                        }
                      }}
                      className="hover:underline hover:text-amber-500 cursor-pointer text-left"
                      title="Alınış Saatini Değiştir & Şoföre PWA Bildirimi Gönder"
                    >
                      ⏰ {p.pickupTime} ✎
                    </button>
                  </td>

                  <td className="py-4 px-5">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {p.hotel}
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                      {p.roomNumber && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          Oda: {p.roomNumber}
                        </span>
                      )}
                      {(p.specialNotes?.includes('LOBİDE') ||
                        (typeof window !== 'undefined' &&
                          localStorage.getItem(`ptt_lobby_ready_${p.bookingId}`) === 'true')) && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>🙋‍♂️ Lobide Bekliyor</span>
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-5">
                    <select
                      value={p.assignedVehicle || 'Atanmadı'}
                      onChange={(e) =>
                        handleAssignVehicleToBooking(
                          p.bookingId,
                          p.tourIndex,
                          e.target.value
                        )
                      }
                      className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-accent max-w-[190px]"
                    >
                      <option value="Atanmadı">Hat Atanmadı</option>
                      {safeVehicles.filter((v) => v && v.active).map((v) => (
                        <option key={v.id} value={v.label}>
                          {v.kind === 'vip' ? '⭐' : v.kind === 'speedboat' ? '🚤' : '🚐'} {v.label}
                        </option>
                      ))}
                      {p.assignedVehicle &&
                        p.assignedVehicle !== 'Atanmadı' &&
                        !safeVehicles.some((v) => v && v.label === p.assignedVehicle) && (
                          <option value={p.assignedVehicle}>{p.assignedVehicle}</option>
                        )}
                    </select>
                    <div className="text-[10px] text-sky-500 font-semibold mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{p.hotelZone}</span>
                    </div>
                  </td>

                  <td className="py-4 px-5">
                    <select
                      value={p.assignedDriver || ''}
                      onChange={(e) =>
                        handleAssignDriverToBooking &&
                        handleAssignDriverToBooking(
                          p.bookingId,
                          p.tourIndex,
                          e.target.value
                        )
                      }
                      className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-accent max-w-[170px]"
                    >
                      <option value="">Görevli Atanmadı</option>
                      {safeDrivers.filter((d) => d && d.active).map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.role === 'guide' ? '🗣️' : d.role === 'both' ? '⭐' : '🚐'} {d.fullName}
                        </option>
                      ))}
                      {p.assignedDriver &&
                        !safeDrivers.some((d) => d && d.id === p.assignedDriver) && (
                          <option value={p.assignedDriver}>{p.assignedDriver}</option>
                        )}
                    </select>
                    {(() => {
                      const d = safeDrivers.find((drv) => drv && drv.id === p.assignedDriver);
                      return d?.phone ? (
                        <a
                          href={`https://wa.me/${d.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-emerald-600 hover:underline block mt-1"
                        >
                          📞 {d.phone}
                        </a>
                      ) : null;
                    })()}
                  </td>

                  <td className="py-4 px-5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        {p.customerName}
                      </span>
                      {pendingBookingIds?.has(p.bookingId) ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-700 animate-pulse" title="İşlem cihaza kaydedildi, buluta gönderilmeyi bekliyor">
                          <span className="w-1 h-1 rounded-full bg-amber-500"></span>
                          Cihazda
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 text-[9px] text-slate-400 dark:text-slate-500" title="Sunucuyla tam senkronize">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                          Bulut
                        </span>
                      )}
                    </div>
                    <a
                      href={`https://wa.me/${p.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-600 hover:underline inline-flex items-center gap-1 mt-0.5"
                    >
                      <Phone className="w-3 h-3" /> {p.phone}
                    </a>
                  </td>

                  <td className="py-4 px-5">
                    <span className="font-bold">{p.adultCount || 1} Yetişkin</span>
                    {(p.childCount || 0) > 0 && (
                      <span className="text-xs text-slate-500 block">
                        +{p.childCount} Çocuk
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-5">
                    <span className="font-semibold text-slate-900 dark:text-white block">
                      {p.tourTitle}
                    </span>
                    {p.supplier && (
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        Tedarikçi: {p.supplier}
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-5">
                    {(Number(p.remainingAmountThb) || 0) > 0 ? (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 inline-block">
                        Alınacak: {fmtMoney((Number(p.remainingAmountThb) || 0))} THB
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 inline-block">
                        ✓ Tamamı Ödendi
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-5">
                    <select
                      value={p.pickupStatus || 'pending'}
                      onChange={(e) =>
                        handleUpdatePickupStatus &&
                        handleUpdatePickupStatus(
                          p.bookingId,
                          p.tourIndex,
                          e.target.value as any
                        )
                      }
                      className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold focus:outline-none transition-colors cursor-pointer ${
                        p.pickupStatus === 'picked_up'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                          : p.pickupStatus === 'on_tour'
                          ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-300'
                          : p.pickupStatus === 'completed'
                          ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300'
                          : p.pickupStatus === 'no_show'
                          ? 'bg-red-50 dark:bg-red-950/60 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300'
                          : 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      <option value="pending">⏳ Bekliyor</option>
                      <option value="picked_up">🚐 Araca Bindi</option>
                      <option value="on_tour">⛵ Turda</option>
                      <option value="completed">✅ Tamamlandı</option>
                      <option value="no_show">❌ Gelmedi (No-Show)</option>
                    </select>
                    {p.pickedUpAt && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono block mt-0.5">
                        Biniş: {p.pickedUpAt}
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {(() => {
                        const target = bookings.find((b) => b.id === p.bookingId);
                        if (!target) return null;
                        return (
                          <>
                            {onOpenWorkflow && (
                              <button
                                type="button"
                                onClick={() => onOpenWorkflow(target)}
                                className="px-2.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors flex items-center gap-1 text-xs font-bold shrink-0 cursor-pointer"
                                title="⚡ Saha Görev Adımları (İş Akışı Kılavuzu)"
                              >
                                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                <span className="hidden lg:inline">Adımlar</span>
                              </button>
                            )}
                            <a
                              href={getConciergeWhatsAppUrl('evening_breakfast', target)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 hover:bg-purple-600 hover:text-white transition-colors"
                              title="🌙 Akşam 20:00 Hatırlatması & Kahvaltı Kutusu (2 Saat Satırlı)"
                            >
                              <Moon className="w-4 h-4" />
                            </a>
                            <a
                              href={getConciergeWhatsAppUrl('vehicle_in_zone', target, p.hotelZone || 'bölgeniz')}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition-colors"
                              title="🚐 Minivan Bölgede / Lobiye İnin Acil Bildirimi"
                            >
                              <Car className="w-4 h-4" />
                            </a>
                            {p.pickupStatus === 'completed' && (
                              <a
                                href={getGoogleReviewWhatsAppUrl(target)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-xl bg-yellow-50 dark:bg-yellow-950/40 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500 hover:text-slate-950 transition-colors"
                                title="⭐ 18:30 Tur Sonu Akıllı Yorum İste (Google Review Booster)"
                              >
                                <Star className="w-4 h-4" />
                              </a>
                            )}
                          </>
                        );
                      })()}
                      <a
                        href={getSingleHotelMapUrl(p.hotel)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 hover:bg-sky-600 hover:text-white transition-colors"
                        title="Otele Google Harita Navigasyonu Aç"
                      >
                        <Navigation className="w-4 h-4" />
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          const target = bookings.find((b) => b.id === p.bookingId);
                          if (target) setWhatsAppModalBooking(target);
                        }}
                        className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors"
                        title="WhatsApp Şablonları & Hazır Mesajlar"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      <a
                        href={`/bilet/${p.bookingId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition-colors"
                        title="Misafir Canlı Takip Portalını Aç (/bilet/[kod])"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          const target = bookings.find((b) => b.id === p.bookingId);
                          if (target) setVoucherBooking(target);
                        }}
                        className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 hover:bg-purple-600 hover:text-white transition-colors"
                        title="Bilet / Voucher Kuponu Aç"
                      >
                        <Ticket className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const target = bookings.find((b) => b.id === p.bookingId);
                          if (target) {
                            const url = getGoogleReviewWhatsAppUrl(target, { googleReviewUrl });
                            window.open(url, '_blank', 'noopener,noreferrer');
                          }
                        }}
                        className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-400 hover:text-slate-950 transition-colors"
                        title="⭐ Misafirden 5-Yıldızlı Google Yorumu İste (WhatsApp)"
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await sendTransferPushNotification({
                            bookingId: p.bookingId,
                            customerName: p.customerName,
                            hotel: p.hotel,
                            newTime: p.pickupTime || '07:30',
                            vehicle: p.assignedVehicle,
                            driverId: p.assignedDriver,
                            roomNumber: p.roomNumber,
                            phone: p.phone,
                          });
                          showToast(`📢 ${p.customerName} transfer bildirimi şoföre iletildi!`);
                        }}
                        className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                        title="📲 Şoföre Anlık PWA Push Bildirimi Gönder"
                      >
                        <BellRing className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
