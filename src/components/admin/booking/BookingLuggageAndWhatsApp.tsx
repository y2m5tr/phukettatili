import React from 'react';
import {
  Luggage,
  Send,
  MessageCircle,
  Copy,
  Check,
} from 'lucide-react';
import type { Booking, BookingHotelStay } from '../../../data/adminInitialData';

export interface BookingLuggageAndWhatsAppProps {
  formData: Partial<Booking>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Booking>>>;
  bookingHotels: BookingHotelStay[];
  copiedType: string | null;
  handleCopyDriverCard: (openWhatsApp?: boolean) => void;
  handleCopyGuestReminder: (openWhatsApp?: boolean) => void;
}

export function BookingLuggageAndWhatsApp({
  formData,
  setFormData,
  bookingHotels,
  copiedType,
  handleCopyDriverCard,
  handleCopyGuestReminder,
}: BookingLuggageAndWhatsAppProps) {
  const isHopOrLuggage = Boolean(
    formData.isHotelHop || formData.hasLuggage || bookingHotels.length > 0
  );

  return (
    <>
      {/* 🧳 Otel Değişimi & Valiz/Bagaj Takibi */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
        <div className="p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/25 border border-purple-200 dark:border-purple-800/60 space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-bold text-purple-950 dark:text-purple-200 flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isHopOrLuggage}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setFormData((prev) => ({
                    ...prev,
                    isHotelHop: checked,
                    hasLuggage: checked,
                    luggageCount: checked ? prev.luggageCount || prev.adultCount || 2 : 0,
                  }));
                }}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
              />
              <span className="flex items-center gap-1.5">
                <Luggage className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>🧳 Otel Değişimi & Tur Aracında Valiz/Bagaj Taşıma (Hotel Hop)</span>
              </span>
            </label>

            {isHopOrLuggage && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-600 text-white shadow-2xs self-start sm:self-auto">
                Minibüste Valiz Alanı Ayrılacak
              </span>
            )}
          </div>

          {isHopOrLuggage && (
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-1 text-xs">
              <div className="sm:col-span-4">
                <label className="block text-[10px] font-bold uppercase text-purple-800 dark:text-purple-300 mb-1">
                  Valiz / Çanta Adedi
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.luggageCount || formData.adultCount || 2}
                  onChange={(e) =>
                    setFormData({ ...formData, luggageCount: Number(e.target.value) || 1 })
                  }
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-700 text-xs font-bold text-purple-950 dark:text-purple-200"
                />
              </div>
              <div className="sm:col-span-8">
                <label className="block text-[10px] font-bold uppercase text-purple-800 dark:text-purple-300 mb-1">
                  Bagaj / Otel Geçiş Notu (Şoför Manifestosu)
                </label>
                <input
                  type="text"
                  placeholder="Örn: Patong otelden check-out yapılacak, tur sonrası Kata otele geçilecek"
                  value={formData.luggageNotes || ''}
                  onChange={(e) => setFormData({ ...formData, luggageNotes: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-700 text-xs text-purple-950 dark:text-purple-200"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 📲 Hızlı Operasyonel WhatsApp Kartları (Şoföre Tayca, Misafire Türkçe) */}
      <div className="pt-2.5 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
          <MessageCircle className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-bold">Saha WhatsApp Görev & Hatırlatma Kartları:</span>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* 🇹🇭 ŞOFÖR KARTI */}
          <div className="inline-flex rounded-xl shadow-2xs overflow-hidden border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => handleCopyDriverCard(false)}
              className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              title="Şoför için Tayca & İngilizce çift dilli iş kartını panoya kopyala"
            >
              {copiedType === 'driver' ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>🇹🇭 Şoför Kartı {copiedType === 'driver' ? '(Kopyalandı)' : ''}</span>
            </button>
            <button
              type="button"
              onClick={() => handleCopyDriverCard(true)}
              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 transition cursor-pointer"
              title="Şoför kartını doğrudan WhatsApp'ta aç"
            >
              <Send className="w-3 h-3" />
              <span>WA Gönder</span>
            </button>
          </div>

          {/* 🇹🇷 MİSAFİR HATIRLATMASI */}
          <div className="inline-flex rounded-xl shadow-2xs overflow-hidden border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => handleCopyGuestReminder(false)}
              className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              title="Misafir için Türkçe lobi alınış hatırlatmasını panoya kopyala"
            >
              {copiedType === 'guest' ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>🇹🇷 Misafir Hatırlatması {copiedType === 'guest' ? '(Kopyalandı)' : ''}</span>
            </button>
            <button
              type="button"
              onClick={() => handleCopyGuestReminder(true)}
              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 transition cursor-pointer"
              title="Misafir hatırlatmasını doğrudan WhatsApp'ta aç"
            >
              <Send className="w-3 h-3" />
              <span>WA Gönder</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
