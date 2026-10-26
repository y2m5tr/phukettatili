
import { Copy, Check, Send } from 'lucide-react';
import type { Booking } from '../../../data/adminInitialData';
import { generateTriggerMessage, type WhatsAppTriggerType } from '../../../lib/whatsappEngine';

export interface WhatsAppSimulatorProps {
  bookings: Booking[];
  selectedTemplate: WhatsAppTriggerType;
  setSelectedTemplate: (tpl: WhatsAppTriggerType) => void;
  previewBookingId: string;
  setPreviewBookingId: (id: string) => void;
  copiedId: string | null;
  onCopyText: (text: string, id: string) => void;
}

export function WhatsAppSimulator({
  bookings,
  selectedTemplate,
  setSelectedTemplate,
  previewBookingId,
  setPreviewBookingId,
  copiedId,
  onCopyText,
}: WhatsAppSimulatorProps) {
  const previewBooking = bookings.find((b) => b.id === previewBookingId) || bookings[0];
  const simulatedMessage = previewBooking
    ? generateTriggerMessage(selectedTemplate, previewBooking)
    : '';

  return (
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
                      ? 'bg-whatsapp/10 border-whatsapp/40 text-whatsapp font-bold'
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
                <div className="w-8 h-8 rounded-full bg-whatsapp text-white flex items-center justify-center font-bold text-xs">
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
              onClick={() => onCopyText(simulatedMessage, 'preview')}
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
                className="px-4 py-2 rounded-xl bg-whatsapp hover:bg-whatsapp-dark text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>WhatsApp İle Gönder</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
