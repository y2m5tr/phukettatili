/**
 * Akıllı Otomasyon & WhatsApp Tetikleme Motoru Sekmesi (Aşama 5)
 *
 * Phuket turizm operasyonlarında tüm misafir bildirimlerini tek merkezden yönetir:
 * 1. T-24h Hatırlatma Masası: Yarınki turların otel alınış saati ve bilet linkleri.
 * 2. Lobi & Araç Masası: Sahadaki şoförün otel lobisinde beklediği anlık uyarısı.
 * 3. Review Booster Masası: Tamamlanan turlar için Google 5★ yorum daveti.
 * 4. Bakiye & Millî Park Hatırlatması: Tur sabahı nakit Baht bilgilendirmesi.
 * 5. Canlı Şablon Kütüphanesi & Önizleme Simülatörü.
 */

import { useState, useMemo } from 'react';
import {
  MessageCircle,
  Clock,
  Car,
  Star,
  Copy,
  Check,
  ExternalLink,
  Send,
  Zap,
  AlertCircle,
  Filter,
} from 'lucide-react';
import type { Booking } from '../../data/adminInitialData';
import {
  getPendingAutomationTriggers,
  generateTriggerMessage,
  markNotificationSent,
  type WhatsAppNotification,
  type WhatsAppTriggerType,
} from '../../lib/whatsappEngine';

interface Props {
  bookings?: Booking[];
  onUpdateBooking?: (updated: Booking, successMsg?: string) => void;
  showToast?: (msg: string) => void;
}

export default function WhatsAppTab({ bookings = [], onUpdateBooking, showToast }: Props) {
  const [activeSubTab, setActiveSubTab] = useState<'triggers' | 'templates'>('triggers');
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

  const previewBooking = bookings.find((b) => b.id === previewBookingId) || bookings[0];
  const simulatedMessage = previewBooking
    ? generateTriggerMessage(selectedTemplate, previewBooking)
    : '';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Üst Başlık & Sekme Seçici */}
      <div className="bg-white dark:bg-surface-2 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-[#25D366]/15 text-[#25D366]">
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
        </div>
      </div>

      {activeSubTab === 'triggers' && (
        <div className="space-y-6">
          {/* İstatistik Metrik Kartları */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            <button
              type="button"
              onClick={() => setTriggerFilter('t24_reminder')}
              className={`p-4 rounded-2xl border transition-all text-left cursor-pointer ${
                triggerFilter === 't24_reminder'
                  ? 'bg-emerald-500/10 border-emerald-500/40 dark:bg-emerald-500/15'
                  : 'bg-white dark:bg-surface-2 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  T-24h Hatırlatma
                </span>
                <Clock className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.t24}</div>
              <p className="text-[10px] text-slate-400 mt-1">Yarınki tur misafirleri</p>
            </button>

            <button
              type="button"
              onClick={() => setTriggerFilter('driver_arrived')}
              className={`p-4 rounded-2xl border transition-all text-left cursor-pointer ${
                triggerFilter === 'driver_arrived'
                  ? 'bg-blue-500/10 border-blue-500/40 dark:bg-blue-500/15'
                  : 'bg-white dark:bg-surface-2 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  Araç Lobide
                </span>
                <Car className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.arrived}</div>
              <p className="text-[10px] text-slate-400 mt-1">Bugünkü tur alınışları</p>
            </button>

            <button
              type="button"
              onClick={() => setTriggerFilter('review_booster')}
              className={`p-4 rounded-2xl border transition-all text-left cursor-pointer ${
                triggerFilter === 'review_booster'
                  ? 'bg-amber-500/10 border-amber-500/40 dark:bg-amber-500/15'
                  : 'bg-white dark:bg-surface-2 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  Review Booster
                </span>
                <Star className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.review}</div>
              <p className="text-[10px] text-slate-400 mt-1">Google 5★ yorum bekleyen</p>
            </button>

            <button
              type="button"
              onClick={() => setTriggerFilter('balance_alert')}
              className={`p-4 rounded-2xl border transition-all text-left cursor-pointer ${
                triggerFilter === 'balance_alert'
                  ? 'bg-rose-500/10 border-rose-500/40 dark:bg-rose-500/15'
                  : 'bg-white dark:bg-surface-2 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  Kalan Bakiye
                </span>
                <AlertCircle className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.balance}</div>
              <p className="text-[10px] text-slate-400 mt-1">Nakit Baht uyarısı</p>
            </button>
          </div>

          {/* Filtre Barı */}
          <div className="flex items-center justify-between gap-3 bg-white dark:bg-surface-2 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Filtrele:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setTriggerFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    triggerFilter === 'all'
                      ? 'bg-brand-accent text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Tümü ({stats.total})
                </button>
                <button
                  type="button"
                  onClick={() => setTriggerFilter('t24_reminder')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    triggerFilter === 't24_reminder'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  T-24h ({stats.t24})
                </button>
                <button
                  type="button"
                  onClick={() => setTriggerFilter('driver_arrived')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    triggerFilter === 'driver_arrived'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Araç Lobide ({stats.arrived})
                </button>
                <button
                  type="button"
                  onClick={() => setTriggerFilter('review_booster')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    triggerFilter === 'review_booster'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Yorum ({stats.review})
                </button>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 hidden sm:block">
              {filteredTriggers.length} bekleyen bildirim
            </div>
          </div>

          {/* Bildirim Kuyruğu Listesi */}
          {filteredTriggers.length === 0 ? (
            <div className="bg-white dark:bg-surface-2 p-10 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center mb-3">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Harika! Bekleyen Otomatik Bildirim Yok
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Tüm yarınki turlar hatırlatılmış, araçlar yönlendirilmiş ve değerlendirmeler tamamlanmıştır.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTriggers.map((notif) => {
                const isCopied = copiedId === notif.id;

                const badgeBg =
                  notif.type === 't24_reminder'
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                    : notif.type === 'driver_arrived'
                    ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                    : notif.type === 'review_booster'
                    ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                    : 'bg-rose-500/10 text-rose-600 border-rose-500/20';

                return (
                  <div
                    key={notif.id}
                    className="bg-white dark:bg-surface-2 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
                  >
                    <div>
                      {/* Üst Başlık Satırı */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider mb-1.5 ${badgeBg}`}
                          >
                            {notif.title}
                          </span>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            {notif.customerName}
                          </h4>
                        </div>
                        <span className="text-[11px] font-mono font-semibold text-slate-500">
                          {notif.phone}
                        </span>
                      </div>

                      {/* Tur ve Saat Bilgisi */}
                      <div className="text-xs text-slate-600 dark:text-slate-300 space-y-0.5 mb-3">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          🏝️ {notif.tourTitle}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                          <span>📅 {notif.tourDate}</span>
                          <span>•</span>
                          <span>⏰ Lobi: {notif.pickupTime}</span>
                        </div>
                      </div>

                      {/* Önizleme Kutusuna Kısaltılmış Metin */}
                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 text-[11px] font-mono text-slate-700 dark:text-slate-300 max-h-24 overflow-y-auto whitespace-pre-line border border-slate-100 dark:border-slate-800/80 mb-3">
                        {notif.message.slice(0, 220)}...
                      </div>
                    </div>

                    {/* Alt Aksiyon Butonları */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => handleCopyText(notif.message, notif.id)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Mesajı panoya kopyala"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Kopyalandı</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Kopyala</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDispatchNotification(notif)}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>WhatsApp'ta Aç & Gönder</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Şablon Kütüphanesi & Simülatör Sekmesi */}
      {activeSubTab === 'templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sol Kolon: Şablon Seçici & Misafir Seçici */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-surface-2 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  1. Şablon Türü Seçin
                </label>
                <div className="space-y-1.5">
                  {[
                    { id: 't24_reminder', label: '🌴 T-24h Tur & Lobi Hatırlatması', desc: 'Turdan 1 gün önce akşam' },
                    { id: 'driver_arrived', label: '🚐 Aracınız Lobide Bekliyor', desc: 'Şoför otel kapısına vardığında' },
                    { id: 'driver_assigned', label: '🚗 Araç & Şoför Atama Bilgisi', desc: 'Hat belirlendiğinde' },
                    { id: 'review_booster', label: '⭐ Google 5★ Yorum Daveti', desc: 'Tur bitiminde memnuniyet' },
                    { id: 'balance_alert', label: '💰 Kalan Bakiye Bilgilendirmesi', desc: 'Tur sabahı nakit Baht' },
                  ].map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setSelectedTemplate(tpl.id as WhatsAppTriggerType)}
                      className={`w-full text-left p-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer border ${
                        selectedTemplate === tpl.id
                          ? 'bg-[#25D366]/10 border-[#25D366]/40 text-[#25D366] font-bold'
                          : 'bg-slate-50 dark:bg-slate-900 border-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <div>{tpl.label}</div>
                      <div className="text-[10px] text-slate-400 font-normal mt-0.5">{tpl.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {bookings.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    2. Misafir Verisini Doldur
                  </label>
                  <select
                    value={previewBookingId}
                    onChange={(e) => setPreviewBookingId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
                  >
                    {bookings.slice(0, 30).map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.customerName} ({b.tourDate} - {b.tourTitle.slice(0, 24)}...)
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Sağ Kolon: Canlı Simülasyon Ekranı (WhatsApp Baloncuğu) */}
          <div className="lg:col-span-2">
            <div className="bg-[#EFEAE2] dark:bg-slate-950 p-5 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-inner flex flex-col justify-between min-h-[460px]">
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-300/40 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center font-bold text-xs">
                      PT
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        Phuket Tatili Operasyon
                      </div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        Çevrimiçi
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono">
                    {previewBooking ? previewBooking.phone : '+66 82 895 0665'}
                  </span>
                </div>

                {/* WhatsApp Mesaj Baloncuğu */}
                <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl rounded-tl-sm shadow-sm border border-slate-200/50 dark:border-slate-800/80 max-w-xl">
                  <pre className="font-sans text-xs text-slate-800 dark:text-slate-100 whitespace-pre-wrap leading-relaxed">
                    {simulatedMessage || 'Lütfen simülasyon için bir misafir seçiniz.'}
                  </pre>
                  <div className="text-right text-[10px] text-slate-400 mt-2 font-mono flex items-center justify-end gap-1">
                    <span>{new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="text-[#53bdeb]">✓✓</span>
                  </div>
                </div>
              </div>

              {/* Alt Butonlar */}
              <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-slate-300/40 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => handleCopyText(simulatedMessage, 'preview')}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedId === 'preview' ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>Kopyalandı!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Mesajı Kopyala</span>
                    </>
                  )}
                </button>

                {previewBooking && (
                  <button
                    type="button"
                    onClick={() => {
                      const url = `https://wa.me/${previewBooking.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(simulatedMessage)}`;
                      window.open(url, '_blank', 'noopener,noreferrer');
                    }}
                    className="px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>WhatsApp İle Gönder</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
