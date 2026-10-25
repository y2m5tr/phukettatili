import { useState, useMemo } from 'react';
import { MessageCircle, Zap, Copy } from 'lucide-react';
import type { Booking } from '../../data/adminInitialData';
import {
  getPendingAutomationTriggers,
  markNotificationSent,
  type WhatsAppNotification,
  type WhatsAppTriggerType,
} from '../../lib/whatsappEngine';
import { CANNED_RESPONSES } from './whatsapp/cannedResponses';
import { WhatsAppQuickReplies } from './whatsapp/WhatsAppQuickReplies';
import { WhatsAppSimulator } from './whatsapp/WhatsAppSimulator';
import { WhatsAppTriggersList } from './whatsapp/WhatsAppTriggersList';

interface Props {
  bookings?: Booking[];
  onUpdateBooking?: (updated: Booking, successMsg?: string) => void;
  showToast?: (msg: string) => void;
}

/**
 * Akıllı Otomasyon & WhatsApp Tetikleme Motoru Sekmesi (Aşama 5)
 * Phuket turizm operasyonlarında tüm misafir bildirimlerini tek merkezden yönetir.
 */
export default function WhatsAppTab({ bookings = [], onUpdateBooking, showToast }: Props) {
  const [activeSubTab, setActiveSubTab] = useState<'triggers' | 'templates' | 'quick_replies'>('triggers');
  const [triggerFilter, setTriggerFilter] = useState<'all' | WhatsAppTriggerType>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Şablon Önizleme Durumu
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTriggerType>('t24_reminder');
  const [previewBookingId, setPreviewBookingId] = useState<string>(bookings[0]?.id || '');

  // Otomasyon kuyruğundaki bildirimler
  const pendingTriggers = useMemo(() => {
    return getPendingAutomationTriggers(bookings);
  }, [bookings]);

  // Filtrelenmiş bildirimler
  const filteredTriggers = useMemo(() => {
    if (triggerFilter === 'all') return pendingTriggers;
    return pendingTriggers.filter((t) => t.type === triggerFilter);
  }, [pendingTriggers, triggerFilter]);

  // Sayım istatistikleri
  const stats = useMemo(() => {
    const t24 = pendingTriggers.filter((t) => t.type === 't24_reminder').length;
    const arrived = pendingTriggers.filter((t) => t.type === 'driver_arrived').length;
    const review = pendingTriggers.filter((t) => t.type === 'review_booster').length;
    const balance = pendingTriggers.filter((t) => t.type === 'balance_alert').length;
    return { t24, arrived, review, balance, total: pendingTriggers.length };
  }, [pendingTriggers]);

  // Metin Kopyalama
  const handleCopyText = (text: string, id: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      showToast?.('📋 Mesaj panoya kopyalandı!');
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  // WhatsApp Gönderimi ve Rezervasyonu İşaretleme
  const handleDispatchNotification = (notif: WhatsAppNotification) => {
    // 1. WhatsApp Web / Deep Link aç
    if (typeof window !== 'undefined') {
      window.open(notif.waUrl, '_blank', 'noopener,noreferrer');
    }

    // 2. Rezervasyonda gönderildi işaretle
    const targetBooking = bookings.find((b) => b.id === notif.bookingId);
    if (targetBooking && onUpdateBooking) {
      const updated = markNotificationSent(targetBooking, notif.type);
      onUpdateBooking(updated, `✅ ${notif.customerName} için WhatsApp bildirimi işlendi!`);
    } else {
      showToast?.(`✅ ${notif.customerName} WhatsApp açıldı.`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Üst Başlık & Sekme Seçici */}
      <div className="bg-white dark:bg-surface-2 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-whatsapp/15 text-whatsapp">
            <MessageCircle className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
                Akıllı WhatsApp Otomasyon Merkezi
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Aşama 5 Canlı
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              T-24h otel alınış hatırlatmaları, araç lobi bildirimleri ve Google 5★ Review Booster motoru
            </p>
          </div>
        </div>

        {/* Sekme Geçişi */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('triggers')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'triggers'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Bekleyen Tetiklemeler</span>
            {stats.total > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                {stats.total}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('templates')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'templates'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Copy className="w-3.5 h-3.5 text-blue-500" />
            <span>Şablon Kütüphanesi</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('quick_replies')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'quick_replies'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span>Hızlı Yanıtlar ({CANNED_RESPONSES.length})</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'triggers' && (
        <WhatsAppTriggersList
          stats={stats}
          triggerFilter={triggerFilter}
          setTriggerFilter={setTriggerFilter}
          filteredTriggers={filteredTriggers}
          copiedId={copiedId}
          onCopyText={handleCopyText}
          onDispatchNotification={handleDispatchNotification}
        />
      )}

      {activeSubTab === 'templates' && (
        <WhatsAppSimulator
          bookings={bookings}
          selectedTemplate={selectedTemplate}
          setSelectedTemplate={setSelectedTemplate}
          previewBookingId={previewBookingId}
          setPreviewBookingId={setPreviewBookingId}
          copiedId={copiedId}
          onCopyText={handleCopyText}
        />
      )}

      {activeSubTab === 'quick_replies' && (
        <WhatsAppQuickReplies
          copiedId={copiedId}
          onCopyText={handleCopyText}
        />
      )}
    </div>
  );
}
