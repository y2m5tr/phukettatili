import React, { useState, useMemo } from 'react';
import {
  Camera,
  Car,
  FileText,
  Waves,
  Send,
  Plus,
  WifiOff,
  AlertTriangle,
  RefreshCw,
  Users,
  CheckCircle2,
  DollarSign,
  Compass,
  Zap,
  MessageCircle,
  ExternalLink,
  Star,
} from 'lucide-react';
import type { AdminTab } from '../AdminDashboard';
import type { Booking } from '../../../data/adminInitialData';
import { generateGuestPickupReminderTurkish } from '../../../lib/whatsappEngine';
import { fmtMoney } from '../../../lib/moneyFormat';
import type { TodayDispatchSummary, OverviewTabProps } from './overviewTypes';
import { dispatchT24Reminders, dispatchReviewReminders } from './overviewDispatchActions';

interface OverviewDispatchCockpitProps {
  todayStr: string;
  todayDispatch: TodayDispatchSummary;
  bookings: Booking[];
  pendingBookingIds?: Set<string>;
  sync?: OverviewTabProps['sync'];
  onOpenQrScanner?: () => void;
  setActiveTab: (tab: AdminTab) => void;
  onOpenPoliceManifest?: () => void;
  onOpenBulkReschedule?: () => void;
  onOpenWorkflow?: (b: Booking) => void;
  onOpenCreateBooking?: () => void;
  showToast?: (msg: string) => void;
}

export const OverviewDispatchCockpit: React.FC<OverviewDispatchCockpitProps> = ({
  todayStr,
  todayDispatch,
  bookings,
  pendingBookingIds,
  sync,
  onOpenQrScanner,
  setActiveTab,
  onOpenPoliceManifest,
  onOpenBulkReschedule,
  onOpenWorkflow,
  onOpenCreateBooking,
  showToast,
}) => {
  const [todayFilter, setTodayFilter] = useState<'all' | 'pending' | 'picked_up' | 'cash'>('all');
  const [isDispatchingReminders, setIsDispatchingReminders] = useState(false);

  const filteredTodayItems = useMemo(() => {
    return todayDispatch.todayItems.filter((item) => {
      if (todayFilter === 'pending') return item.pickupStatus === 'pending';
      if (todayFilter === 'picked_up') {
        return (
          item.pickupStatus === 'picked_up' ||
          item.pickupStatus === 'on_tour' ||
          item.pickupStatus === 'completed'
        );
      }
      if (todayFilter === 'cash') return (Number(item.remainingAmountThb) || 0) > 0;
      return true;
    });
  }, [todayDispatch.todayItems, todayFilter]);

  const [isDispatchingReviews, setIsDispatchingReviews] = useState(false);

  const handleDispatchT24 = async () => {
    setIsDispatchingReminders(true);
    await dispatchT24Reminders(showToast);
    setIsDispatchingReminders(false);
  };

  const handleDispatchReviews = async () => {
    setIsDispatchingReviews(true);
    await dispatchReviewReminders(showToast);
    setIsDispatchingReviews(false);
  };

  return (
    <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-6 sm:p-7 shadow-xl border border-slate-700/60 relative overflow-hidden">
      {/* Dekoratif Arka Plan Parıltısı */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-brand-accent/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-10 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-6">
        {/* Kokpit Başlığı & Hızlı Aksiyon Butonları */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-accent text-slate-950 font-mono">
                CANLI DISPATCH
              </span>
              <span className="text-xs text-slate-300 font-mono">
                Phuket: {todayStr}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-white mt-1">
              Günün Operasyon Kokpiti
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Bugünün otel transferleri, canlı biniş durumu ve lobilerden tahsil edilecek nakit akışı
            </p>
          </div>

          {/* Hızlı Aksiyon Butonları */}
          <div className="flex items-center gap-2 flex-wrap">
            {onOpenQrScanner && (
              <button
                type="button"
                onClick={onOpenQrScanner}
                className="px-3.5 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Bilet Tara</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab('transfers')}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Car className="w-3.5 h-3.5 text-sky-400" />
              <span>Transferler</span>
            </button>

            {onOpenPoliceManifest && (
              <button
                type="button"
                onClick={onOpenPoliceManifest}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>Manifesto</span>
              </button>
            )}

            {onOpenBulkReschedule && (
              <button
                type="button"
                onClick={onOpenBulkReschedule}
                className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Waves className="w-3.5 h-3.5" />
                <span>Hava Erteleme</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDispatchT24}
              disabled={isDispatchingReminders}
              className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Yarınki turların misafirlerine 20:00 T-24 WhatsApp lobi alınış hatırlatmasını gönder"
            >
              <Send className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isDispatchingReminders ? '...' : 'T-24 WhatsApp'}</span>
            </button>

            <button
              type="button"
              onClick={handleDispatchReviews}
              disabled={isDispatchingReviews}
              className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Dün turu tamamlanan misafirlere T+24 Google & TripAdvisor yorum daveti gönder"
            >
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span>{isDispatchingReviews ? '...' : 'T+24 Yorum İste'}</span>
            </button>

            {onOpenCreateBooking && (
              <button
                type="button"
                onClick={onOpenCreateBooking}
                className="px-3.5 py-2 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Yeni Ekle</span>
              </button>
            )}
          </div>
        </div>

        {/* Canlı Bağlantı & Senkron Bildirimi */}
        {sync && (!sync.isOnline || (sync.failedSyncItems && sync.failedSyncItems.length > 0) || sync.pendingSyncCount > 0) && (
          <div
            role="status"
            className={`p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-semibold ${
              !sync.isOnline
                ? 'bg-amber-500/15 border border-amber-500/30 text-amber-200'
                : sync.failedSyncItems && sync.failedSyncItems.length > 0
                ? 'bg-rose-500/15 border border-rose-500/30 text-rose-200'
                : 'bg-sky-500/15 border border-sky-500/30 text-sky-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {!sync.isOnline ? (
                <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
              ) : sync.failedSyncItems && sync.failedSyncItems.length > 0 ? (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <RefreshCw className="w-4 h-4 text-sky-400 animate-spin shrink-0" />
              )}
              <span>
                {!sync.isOnline
                  ? 'Çevrimdışı Çalışma Modu: Değişiklikler cihazınızda saklanıyor, bağlantı açıldığında buluta otomatik gönderilecek.'
                  : sync.failedSyncItems && sync.failedSyncItems.length > 0
                  ? `⚠️ ${sync.failedSyncItems.length} işlem sunucuya iletilemedi. Lütfen bağlantınızı veya çakışmaları kontrol edin.`
                  : `${sync.pendingSyncCount} operasyonel değişiklik sunucuya aktarılıyor...`}
              </span>
            </div>
            {sync.lastSyncedAt && (
              <span className="text-[10px] text-slate-300/80 font-mono shrink-0">
                Son Başarılı Senkron: {new Date(sync.lastSyncedAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        )}

        {/* Kokpit 4 Ana Metrik Kartı */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Bugünkü Misafir & Tur */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-sky-400" />
              Bugünkü Misafir
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {todayDispatch.totalGuests} <span className="text-sm font-normal text-slate-400">Yolcu</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {todayDispatch.toursCount} farklı tur grubu/transferi
            </p>
          </div>

          {/* 2. Saha Biniş Durumu (Canlı Progress) */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Biniş Durumu
              </span>
              <span className="text-emerald-400">%{todayDispatch.completionRate}</span>
            </div>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${todayDispatch.completionRate}%` }}
              />
            </div>
            <div className="mt-2 flex items-center gap-2 text-[11px] flex-wrap">
              <span className="text-emerald-400 font-bold">🟢 {todayDispatch.pickedUpCount} Bindi</span>
              <span>·</span>
              <span className="text-amber-300 font-bold">🟡 {todayDispatch.pendingCount} Bekliyor</span>
              {todayDispatch.noShowCount > 0 && (
                <>
                  <span>·</span>
                  <span className="text-rose-400 font-bold">🔴 {todayDispatch.noShowCount} No-Show</span>
                </>
              )}
            </div>
          </div>

          {/* 3. Sahada Toplanacak Nakit Kalan */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
              Sahada Toplanacak Nakit
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-mono mt-1">
              {fmtMoney(todayDispatch.cashToCollectThb)} <span className="text-xs font-semibold text-white">THB</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Şoför & rehberlerin lobilerden alacağı bakiye
            </p>
          </div>

          {/* 4. Görevdeki Araçlar */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-purple-400" />
              Aktif Hat & Filo
            </span>
            <div className="text-lg font-bold text-white mt-1 truncate">
              {todayDispatch.assignedVehicles.length > 0
                ? todayDispatch.assignedVehicles.join(', ')
                : 'Otomatik Atama'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {todayDispatch.assignedVehicles.length > 0 ? `${todayDispatch.assignedVehicles.length} Araç hatta` : 'Araç atanmamış transferler var'}
            </p>
          </div>
        </div>

        {/* 5. Bugünün Canlı Saha ve Transfer Tablosu */}
        <div className="pt-4 border-t border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-brand-accent" />
                Bugünün Saha & Karşılama Akışı
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-slate-300">
                {todayDispatch.todayItems.length} Operasyon
              </span>
            </div>

            {/* Filtre Butonları */}
            <div className="flex items-center gap-1 bg-black/30 p-1 rounded-xl text-[11px] font-semibold border border-white/10 flex-wrap">
              <button
                type="button"
                onClick={() => setTodayFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  todayFilter === 'all'
                    ? 'bg-brand-accent text-slate-950 font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Tümü ({todayDispatch.todayItems.length})
              </button>
              <button
                type="button"
                onClick={() => setTodayFilter('pending')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  todayFilter === 'pending'
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                🟡 Bekleyen ({todayDispatch.pendingCount})
              </button>
              <button
                type="button"
                onClick={() => setTodayFilter('picked_up')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  todayFilter === 'picked_up'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                🟢 Binen ({todayDispatch.pickedUpCount})
              </button>
              <button
                type="button"
                onClick={() => setTodayFilter('cash')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  todayFilter === 'cash'
                    ? 'bg-sky-400 text-slate-950 font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                💰 Kalan Tahsilat
              </button>
            </div>
          </div>

          {filteredTodayItems.length === 0 ? (
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center text-xs text-slate-400">
              {todayDispatch.todayItems.length === 0
                ? '🌴 Bugün için planlanmış tur veya transfer kaydı bulunmuyor.'
                : 'Seçili filtreye uygun operasyon kaydı bulunamadı.'}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/40">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] text-slate-400 uppercase tracking-wider bg-white/5">
                    <th className="py-2.5 px-4 font-semibold">Saat & Otel</th>
                    <th className="py-2.5 px-4 font-semibold">Misafir & Tur</th>
                    <th className="py-2.5 px-4 font-semibold">Biniş Durumu</th>
                    <th className="py-2.5 px-4 font-semibold">Bakiye</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Saha Aksiyonu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredTodayItems.map((item) => {
                    const b = bookings.find((x) => x.id === item.bookingId);
                    return (
                      <tr key={`${item.bookingId}-${item.tourTitle}`} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-mono font-bold text-amber-300 text-xs px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 mr-2">
                            {item.pickupTime}
                          </span>
                          <span className="font-semibold text-white">{item.hotel}</span>
                          {item.hotelZone && (
                            <span className="text-[10px] text-slate-400 block ml-1">{item.hotelZone}</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-white">{item.customerName}</span>
                            {pendingBookingIds?.has(item.bookingId) ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse" title="Cihaza kaydedildi, senkron bekliyor">
                                <span className="w-1 h-1 rounded-full bg-amber-400"></span>
                                Cihazda
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 text-[9px] text-slate-400" title="Sunucuyla senkronize">
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                                Bulut
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-300 truncate max-w-xs">{item.tourTitle}</div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {item.pickupStatus === 'picked_up' || item.pickupStatus === 'on_tour' || item.pickupStatus === 'completed' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              🟢 Bindi / Turda
                            </span>
                          ) : item.pickupStatus === 'no_show' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              🔴 No-Show
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              🟡 Lobide Bekliyor
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {Number(item.remainingAmountThb) > 0 ? (
                            <span className="text-amber-300 font-mono font-bold text-xs bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-500/30">
                              💰 {fmtMoney(item.remainingAmountThb)} THB
                            </span>
                          ) : (
                            <span className="text-emerald-400 font-semibold text-xs">
                              ✓ Ödendi
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {b && onOpenWorkflow && (
                              <button
                                type="button"
                                onClick={() => onOpenWorkflow(b)}
                                className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-slate-950 transition-colors font-bold text-xs flex items-center gap-1 cursor-pointer"
                                title="⚡ Saha İş Akışı & 5 Adımlı Operasyon Stepper"
                              >
                                <Zap className="w-3.5 h-3.5" />
                                <span>İş Akışı</span>
                              </button>
                            )}
                            {b && (
                              <button
                                type="button"
                                onClick={() => {
                                  const reminder = generateGuestPickupReminderTurkish(b);
                                  window.open(reminder.waUrl, '_blank', 'noopener,noreferrer');
                                }}
                                className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300 hover:bg-teal-500 hover:text-white transition-colors cursor-pointer"
                                title="🇹🇷 Misafire Lobi Alınış Hatırlatması (WhatsApp)"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <a
                              href={`/bilet/${item.bookingId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white transition-colors"
                              title="🎟️ Canlı Misafir Takip Portalını Aç"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
