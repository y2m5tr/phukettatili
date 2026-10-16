import React, { useState, useMemo } from 'react';
import {
  X,
  ShieldAlert,
  AlertTriangle,
  Utensils,
  Ship,
  Copy,
  Check,
  Send,
  MessageCircle,
  Calendar,
  Filter,
  CheckCircle2,
  Users,
} from 'lucide-react';
import type { Booking } from '../../data/adminInitialData';
import {
  extractManifestAlerts,
  generateBoatKitchenManifest,
  getBoatManifestWhatsAppUrl,
  DIETARY_CATEGORIES,
  type GuestDietaryAlert,
} from '../../lib/dietaryManifest';

interface DietaryManifestModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: Booking[];
  showToast: (msg: string) => void;
  defaultDate?: string;
}

export default function DietaryManifestModal({
  isOpen,
  onClose,
  bookings,
  showToast,
  defaultDate,
}: DietaryManifestModalProps) {
  const [selectedDate, setSelectedDate] = useState<string>(
    defaultDate || new Date().toISOString().split('T')[0]
  );
  const [selectedTour, setSelectedTour] = useState<string>('all');
  const [captainPhone, setCaptainPhone] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Available unique dates from bookings
  const availableDates = useMemo(() => {
    const dates = Array.from(new Set(bookings.map((b) => b.tourDate))).filter(Boolean);
    dates.sort();
    return dates;
  }, [bookings]);

  // Available unique tours from bookings for the selected date
  const availableTours = useMemo(() => {
    const relevant = selectedDate ? bookings.filter((b) => b.tourDate === selectedDate) : bookings;
    const tours = Array.from(new Set(relevant.map((b) => b.tourTitle))).filter(Boolean);
    tours.sort();
    return tours;
  }, [bookings, selectedDate]);

  const alerts = useMemo(() => {
    return extractManifestAlerts(bookings, selectedDate || undefined, selectedTour);
  }, [bookings, selectedDate, selectedTour]);

  // Stat counters
  const counters = useMemo(() => {
    return {
      pregnant: alerts.filter((a) => a.categories.includes('pregnant')).length,
      allergy: alerts.filter(
        (a) => a.categories.includes('seafood_allergy') || a.categories.includes('nut_allergy')
      ).length,
      halal: alerts.filter((a) => a.categories.includes('halal')).length,
      veg: alerts.filter(
        (a) => a.categories.includes('vegetarian') || a.categories.includes('vegan')
      ).length,
      totalPax: alerts.reduce((acc, a) => acc + a.adultCount + a.childCount, 0),
    };
  }, [alerts]);

  const briefingText = useMemo(() => {
    return generateBoatKitchenManifest(alerts, selectedTour === 'all' ? 'Tüm Günlük Turlar' : selectedTour, selectedDate);
  }, [alerts, selectedTour, selectedDate]);

  const whatsappUrl = useMemo(() => {
    return getBoatManifestWhatsAppUrl(captainPhone, briefingText);
  }, [captainPhone, briefingText]);

  const handleCopyBriefing = () => {
    navigator.clipboard.writeText(briefingText);
    setCopied(true);
    showToast('📋 Tekne & Mutfak brifing metni panoya kopyalandı!');
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-surface-1 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-rose-50/40 dark:bg-rose-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Misafir Diyet & Medikal Emniyet Manifestosu
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white uppercase tracking-wider">
                  Diet & Medical Sentinel
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Hamilelik oturma kısıtlamaları, deniz ürünü/fıstık alerjileri ve tekne helal yemek koordinasyonu
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <label htmlFor="manifest-date-select" className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Tur Tarihi:</span>
              </label>
              <select
                id="manifest-date-select"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="">Tüm Tarihler</option>
                {availableDates.map((d) => (
                  <option key={d} value={d}>
                    {new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <label htmlFor="manifest-tour-select" className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <Ship className="w-3.5 h-3.5 text-slate-400" />
                <span>Tur:</span>
              </label>
              <select
                id="manifest-tour-select"
                value={selectedTour}
                onChange={(e) => setSelectedTour(e.target.value)}
                className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200 focus:outline-none max-w-xs truncate"
              >
                <option value="all">Tüm Turlar ({availableTours.length})</option>
                {availableTours.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyBriefing}
              className="px-3 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-brand-accent dark:text-slate-950 font-bold text-xs hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Kopyalandı!' : 'Tayca/İngilizce Brifingi Kopyala'}</span>
            </button>
          </div>
        </div>

        {/* Highlight KPI Pills */}
        <div className="px-6 py-2.5 bg-slate-100/60 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
          <div className="px-3 py-1 rounded-xl bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 font-bold flex items-center gap-1.5 shrink-0">
            <span>🤰 Hamile Yolcu (Pruva Yasağı):</span>
            <span className="font-mono font-black text-rose-600 dark:text-rose-300">{counters.pregnant}</span>
          </div>

          <div className="px-3 py-1 rounded-xl bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20 font-bold flex items-center gap-1.5 shrink-0">
            <span>🦐 Alerji Riski (Mutfak):</span>
            <span className="font-mono font-black text-red-600 dark:text-red-300">{counters.allergy}</span>
          </div>

          <div className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-bold flex items-center gap-1.5 shrink-0">
            <span>☪️ Helal Menü:</span>
            <span className="font-mono font-black text-emerald-600 dark:text-emerald-300">{counters.halal}</span>
          </div>

          <div className="px-3 py-1 rounded-xl bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20 font-bold flex items-center gap-1.5 shrink-0">
            <span>🌱 Vejetaryen / Vegan:</span>
            <span className="font-mono font-black text-green-600 dark:text-green-300">{counters.veg}</span>
          </div>

          <div className="ml-auto text-[11px] font-bold text-slate-500 shrink-0">
            Toplam Etkilenen: <span className="font-mono text-slate-900 dark:text-white font-black">{counters.totalPax} Kişi</span>
          </div>
        </div>

        {/* Content Body: Left is Passenger Cards, Right is Captain Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Column: Flagged Bookings */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-rose-500" />
              <span>Özel Durumu Olan Yolcular ({alerts.length})</span>
            </h3>

            {alerts.length === 0 ? (
              <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500/60 mb-2" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Bu tarih/tur için herhangi bir özel diyet veya medikal kısıtlama kaydı bulunmuyor.
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">Tüm yolcular standart menü ve oturma düzenindedir.</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.bookingId}
                  className="p-3.5 rounded-2xl bg-white dark:bg-surface-2/60 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {alert.customerName}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {alert.adultCount} Yetişkin{alert.childCount > 0 ? `, ${alert.childCount} Çocuk` : ''}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        📍 {alert.hotel} {alert.roomNumber ? `(Oda: ${alert.roomNumber})` : ''} • {alert.tourTitle}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {alert.categories.map((c) => {
                        const meta = DIETARY_CATEGORIES[c];
                        return (
                          <span
                            key={c}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${meta.badgeClass}`}
                          >
                            <span>{meta.icon}</span>
                            <span>{meta.shortLabel}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Safety & Kitchen Instructions */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
                      Operasyon & Mutfak Talimatı:
                    </span>
                    {alert.safetyInstructions.map((ins, idx) => (
                      <div key={idx} className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-start gap-1.5">
                        <span className="text-rose-500 font-bold">•</span>
                        <span>{ins}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right Column: Boat & Catering Manifest Preview */}
          <div className="space-y-3 flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <Ship className="w-4 h-4 text-sky-500" />
                <span>Tekne Kaptanı & Mutfak Resmi Brifingi (EN / TH)</span>
              </h3>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                Bilingual Ready
              </span>
            </div>

            <div className="flex-1 rounded-2xl bg-slate-900 text-slate-200 p-4 font-mono text-xs overflow-y-auto whitespace-pre-wrap border border-slate-800 shadow-inner max-h-[360px] leading-relaxed">
              {briefingText}
            </div>

            {/* WhatsApp Dispatch to Captain / Catering Box */}
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
              <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5" />
                <span>Kaptana veya Tekne Tedarikçisine WhatsApp ile Gönder</span>
              </span>
              <div className="flex gap-2">
                <input
                  type="tel"
                  placeholder="Kaptan / Tedarikçi Tel (+66...)"
                  value={captainPhone}
                  onChange={(e) => setCaptainPhone(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-500/30 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                />
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 shrink-0"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Gönder</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-surface-2/30 flex items-center justify-between text-xs text-slate-500">
          <span>
            ⚠️ Emniyet Standardı: Hamile yolcuların sürat teknesi burnuna oturtulması deniz kanunlarınca kesinlikle yasaktır.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 font-bold text-slate-800 dark:text-slate-200 transition-all cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
