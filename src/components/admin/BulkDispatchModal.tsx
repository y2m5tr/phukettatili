import React, { useState } from 'react';
import {
  X,
  Send,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  ExternalLink,
  Sparkles,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import type { PickupItem } from '../../lib/adminFilters';
import {
  type DispatchMessageType,
  generateGuestReminderMessage,
  getGuestReminderWhatsAppUrl,
} from '../../lib/bulkDispatch';

interface BulkDispatchModalProps {
  pickups: PickupItem[];
  manifestDate: string;
  managerPhone?: string;
  onClose: () => void;
  showToast: (msg: string) => void;
}

export default function BulkDispatchModal({
  pickups,
  manifestDate,
  managerPhone = '66828950665',
  onClose,
  showToast,
}: BulkDispatchModalProps) {
  const [dispatchType, setDispatchType] = useState<DispatchMessageType>('pre_tour_reminder');
  const [sentBookingIds, setSentBookingIds] = useState<Set<string>>(() => new Set());
  const [selectedPickup, setSelectedPickup] = useState<PickupItem | null>(pickups[0] || null);

  const totalCount = pickups.length;
  const sentCount = sentBookingIds.size;
  const progressPercent = totalCount > 0 ? Math.round((sentCount / totalCount) * 100) : 0;

  const handleSendToGuest = (item: PickupItem) => {
    const url = getGuestReminderWhatsAppUrl(item, dispatchType, { managerPhone });
    window.open(url, '_blank', 'noopener,noreferrer');

    setSentBookingIds((prev) => {
      const next = new Set(prev);
      next.add(`${item.bookingId}-${item.tourIndex}`);
      return next;
    });

    showToast(`✓ ${item.customerName} için WhatsApp açıldı!`);
  };

  // Sıradaki gönderilmemiş misafiri bul ve gönder
  const handleSendNext = () => {
    const nextPending = pickups.find(
      (p) => !sentBookingIds.has(`${p.bookingId}-${p.tourIndex}`)
    );
    if (nextPending) {
      setSelectedPickup(nextPending);
      handleSendToGuest(nextPending);
    } else {
      showToast('🎉 Tüm misafirlere bildirim gönderildi!');
    }
  };

  const previewMessage = selectedPickup
    ? generateGuestReminderMessage(selectedPickup, dispatchType, { managerPhone })
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>Toplu WhatsApp Alınış Gönderici</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  {manifestDate}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Gruptaki tüm misafirlere tek tıkla kişiselleştirilmiş lobi ve araç hatırlatmaları gönderin.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dispatch Modları & Progress Bar */}
        <div className="px-6 py-3 bg-slate-900/60 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDispatchType('pre_tour_reminder')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                dispatchType === 'pre_tour_reminder'
                  ? 'bg-brand-primary text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>🌴 Tur Öncesi Lobi Hatırlatması</span>
            </button>
            <button
              type="button"
              onClick={() => setDispatchType('driver_arrived')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                dispatchType === 'driver_arrived'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>🚐 Şoför Lobide Bekliyor</span>
            </button>
            <button
              type="button"
              onClick={() => setDispatchType('balance_reminder')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                dispatchType === 'balance_reminder'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>💰 Kalan Bakiye Çağrısı</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs font-bold text-white font-mono">
                {sentCount} / {totalCount} Gönderildi
              </span>
              <span className="text-[10px] text-slate-400 block font-mono">%{progressPercent} Tamamlandı</span>
            </div>
            <button
              type="button"
              onClick={handleSendNext}
              disabled={totalCount === 0 || sentCount === totalCount}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-black transition flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sıradakine Gönder ➔</span>
            </button>
          </div>
        </div>

        {/* Content Body: Split List & Preview */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Sol: Misafir Listesi */}
          <div className="lg:col-span-6 border-r border-slate-800 overflow-y-auto p-4 space-y-2">
            {pickups.length === 0 ? (
              <div className="py-16 text-center text-slate-500 text-sm">
                Seçilen tarihte ({manifestDate}) kayıtlı transfer alınışı bulunamadı.
              </div>
            ) : (
              pickups.map((p, idx) => {
                const key = `${p.bookingId}-${p.tourIndex}`;
                const isSent = sentBookingIds.has(key);
                const isSelected = selectedPickup?.bookingId === p.bookingId && selectedPickup?.tourIndex === p.tourIndex;

                return (
                  <div
                    key={key}
                    onClick={() => setSelectedPickup(p)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-slate-800/90 border-brand-primary/60 shadow-lg'
                        : isSent
                        ? 'bg-slate-950/40 border-slate-800/40 opacity-70 hover:opacity-100'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-xl bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 font-mono shrink-0">
                        {idx + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white truncate block">
                            {p.customerName}
                          </span>
                          {isSent && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" /> Gönderildi
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5 truncate">
                          <span className="text-amber-400 font-mono font-bold">⏰ {p.pickupTime || '07:30'}</span>
                          <span>·</span>
                          <span className="truncate">{p.hotel}</span>
                          {p.roomNumber && <span className="text-slate-500">(Oda: {p.roomNumber})</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSendToGuest(p);
                        }}
                        className={`p-2 rounded-xl transition flex items-center gap-1 text-xs font-bold ${
                          isSent
                            ? 'bg-slate-800 text-slate-400 hover:bg-emerald-600 hover:text-white'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                        }`}
                        title="WhatsApp İle Gönder"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Sağ: Canlı Mesaj Önizlemesi */}
          <div className="lg:col-span-6 bg-slate-950/70 p-4 sm:p-6 flex flex-col justify-between overflow-y-auto">
            {selectedPickup ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                      Hazırlanan WhatsApp Mesajı
                    </span>
                    <span className="text-sm font-bold text-white">
                      {selectedPickup.customerName} ({selectedPickup.phone})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSendToGuest(selectedPickup)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Şimdi Gönder</span>
                  </button>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-[380px] overflow-y-auto shadow-inner selection:bg-emerald-500 selection:text-slate-950">
                  {previewMessage}
                </div>

                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 text-xs text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Tahsis Edilen Araç:</span>
                    <span className="font-bold text-white font-mono">{selectedPickup.assignedVehicle || 'Atanmadı'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kalan Nakit Tahsilat:</span>
                    <span className="font-bold text-amber-400 font-mono">{selectedPickup.remainingAmountThb.toLocaleString()} THB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bilet Kodu:</span>
                    <a
                      href={`/bilet/${selectedPickup.bookingId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-sky-400 hover:underline flex items-center gap-1 font-mono"
                    >
                      <span>{selectedPickup.bookingId}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-500 text-sm">
                Önizlemek için soldaki listeden bir misafir seçiniz.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>💡 İpucu: Gönderilen misafirler yeşil tik alır ve sıradaki misafir otomatik seçilir.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
