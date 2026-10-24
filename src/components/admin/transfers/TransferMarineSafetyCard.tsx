import { useState } from 'react';
import {
  Waves,
  Wind,
  AlertTriangle,
  RefreshCw,
  MessageCircle,
} from 'lucide-react';
import type { MarineSafetyReport } from '../../../lib/marineWeather';
import { getWeatherPostponeWhatsAppUrl } from '../../../lib/marineWeather';
import type { PickupItem } from '../../../lib/adminFilters';
import type { Booking } from '../../../data/adminInitialData';

export interface TransferMarineSafetyCardProps {
  marineReport: MarineSafetyReport | null;
  manifestDate: string;
  dailyPickups: PickupItem[];
  safeDate: string;
  onRefreshMarine: () => Promise<void>;
  isRefreshingMarine: boolean;
}

export default function TransferMarineSafetyCard({
  marineReport,
  manifestDate,
  dailyPickups,
  safeDate,
  onRefreshMarine,
  isRefreshingMarine,
}: TransferMarineSafetyCardProps) {
  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);

  if (!marineReport) return null;

  return (
    <>
      {/* 🌊 ANDAMAN DENİZİ CANLI GÜVENLİK & DALGA RADARI */}
      <div
        className={`p-4 sm:p-5 rounded-3xl border shadow-xs transition-all ${
          marineReport.level === 'severe'
            ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800/60'
            : marineReport.level === 'moderate'
            ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800/60'
            : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/60'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border shadow-xs ${
                marineReport.level === 'severe'
                  ? 'bg-rose-100 dark:bg-rose-500/20 border-rose-300 dark:border-rose-500/40 text-rose-700 dark:text-rose-400'
                  : marineReport.level === 'moderate'
                  ? 'bg-amber-100 dark:bg-amber-500/20 border-amber-300 dark:border-amber-500/40 text-amber-700 dark:text-amber-400'
                  : 'bg-emerald-100 dark:bg-emerald-500/20 border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-400'
              }`}
            >
              {marineReport.level === 'severe' ? (
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              ) : (
                <Waves className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-xs font-black uppercase tracking-wider ${
                    marineReport.level === 'severe'
                      ? 'text-rose-950 dark:text-rose-100'
                      : marineReport.level === 'moderate'
                      ? 'text-amber-950 dark:text-amber-100'
                      : 'text-emerald-950 dark:text-emerald-100'
                  }`}
                >
                  🌊 Andaman Denizi Canlı Güvenlik Radarı
                </span>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border shadow-xs ${
                    marineReport.level === 'severe'
                      ? 'bg-rose-600 text-white border-rose-700 dark:border-rose-500 font-black'
                      : marineReport.level === 'moderate'
                      ? 'bg-amber-500 text-slate-950 border-amber-600 dark:border-amber-400 font-bold'
                      : 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 border-emerald-700 dark:border-emerald-400 font-bold'
                  }`}
                >
                  {marineReport.level === 'severe'
                    ? '🔴 Fırtına / Dalga Alarmı'
                    : marineReport.level === 'moderate'
                    ? '🟡 Orta Dalgalı'
                    : '🟢 Sakin Deniz'}
                </span>
              </div>
              <p
                className={`text-xs font-medium mt-0.5 ${
                  marineReport.level === 'severe'
                    ? 'text-rose-900/90 dark:text-rose-200/90'
                    : marineReport.level === 'moderate'
                    ? 'text-amber-900/90 dark:text-amber-200/90'
                    : 'text-emerald-900/90 dark:text-emerald-200/90'
                }`}
              >
                {marineReport.summary}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div
              className={`px-3 py-1.5 rounded-xl border font-mono flex items-center gap-1.5 shadow-xs ${
                marineReport.level === 'severe'
                  ? 'bg-white/90 dark:bg-slate-950/70 border-rose-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-200'
                  : marineReport.level === 'moderate'
                  ? 'bg-white/90 dark:bg-slate-950/70 border-amber-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-200'
                  : 'bg-white/90 dark:bg-slate-950/70 border-emerald-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-200'
              }`}
            >
              <Waves className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>
                Dalga: <strong className="text-slate-950 dark:text-white font-bold">{marineReport.waveHeightMeters}m</strong>
              </span>
            </div>
            <div
              className={`px-3 py-1.5 rounded-xl border font-mono flex items-center gap-1.5 shadow-xs ${
                marineReport.level === 'severe'
                  ? 'bg-white/90 dark:bg-slate-950/70 border-rose-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-200'
                  : marineReport.level === 'moderate'
                  ? 'bg-white/90 dark:bg-slate-950/70 border-amber-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-200'
                  : 'bg-white/90 dark:bg-slate-950/70 border-emerald-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-200'
              }`}
            >
              <Wind className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>
                Rüzgar: <strong className="text-slate-950 dark:text-white font-bold">{marineReport.windSpeedKnots} Kts</strong> (
                {marineReport.windDirectionText})
              </span>
            </div>
            <button
              type="button"
              onClick={onRefreshMarine}
              disabled={isRefreshingMarine}
              className="p-2 rounded-xl bg-white/90 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white transition disabled:opacity-50 cursor-pointer shadow-xs"
              title="Radarı Yenile"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingMarine ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => setIsWeatherModalOpen(true)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                marineReport.level === 'severe'
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/40'
                  : 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white'
              }`}
              title="Hava Durumu Nedeniyle Misafirlere WhatsApp Bilgilendirmesi Gönder"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
              <span>⚠️ Hava Durumu Erteleme Çağrısı</span>
            </button>
          </div>
        </div>
      </div>

      {/* 🌊 HAVA DURUMU & FIRTINA ERTELEME MODALI */}
      {isWeatherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Hava Durumu & Fırtına Erteleme Bildirimi</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 font-mono">
                      {manifestDate}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Dalga ve fırtına nedeniyle misafirlere tek tıkla alternatif rota veya tarih erteleme WhatsApp mesajı gönderin.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsWeatherModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <span className="text-lg">✕</span>
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-3">
              {dailyPickups.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  Seçilen tarihte kayıtlı yolcu bulunamadı.
                </div>
              ) : (
                dailyPickups.map((p) => {
                  const bObj: Booking = {
                    id: p.bookingId,
                    customerName: p.customerName,
                    phone: p.phone,
                    hotel: p.hotel,
                    tourId: 'sea-tour',
                    tourTitle: p.tourTitle,
                    tourDate: safeDate,
                    adultCount: p.adultCount,
                    childCount: p.childCount,
                    totalPriceThb: 0,
                    paidAmountThb: 0,
                    remainingAmountThb: p.remainingAmountThb,
                    status: 'confirmed',
                    pickupStatus: p.pickupStatus,
                    paymentStatus: 'paid',
                    createdAt: new Date().toISOString(),
                  };

                  return (
                    <div
                      key={`${p.bookingId}-${p.tourIndex}`}
                      className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white truncate">{p.customerName}</span>
                          <span className="text-xs text-slate-400 font-mono">({p.phone})</span>
                        </div>
                        <div className="text-xs text-rose-300 font-medium truncate mt-0.5">
                          🏝️ {p.tourTitle}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          📍 {p.hotel} · ⏰ {p.pickupTime || '07:30'}
                        </div>
                      </div>

                      <a
                        href={getWeatherPostponeWhatsAppUrl(
                          bObj,
                          'James Bond Adası & Phang Nga Kano (Sakin Körfez)'
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-md cursor-pointer"
                        title="Misafire WhatsApp Fırtına/Erteleme Şablonu Gönder"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp Gönder</span>
                      </a>
                    </div>
                  );
                })
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
              <span>💡 Mesajda misafire tarih erteleme, James Bond körfez rotasına geçiş ve iade seçeneği sunulur.</span>
              <button
                type="button"
                onClick={() => setIsWeatherModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
