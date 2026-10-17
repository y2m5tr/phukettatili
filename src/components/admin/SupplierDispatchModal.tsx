import { useState, useMemo } from 'react';
import {
  Send,
  Copy,
  Check,
  X,
  Building,
  FileText,
  Languages,
} from 'lucide-react';
import type { Booking, SupplierItem } from '../../data/adminInitialData';
import {
  generateSupplierOrderMessage,
  getSupplierOrderWhatsAppUrl,
} from '../../lib/supplierDispatch';

interface SupplierDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  suppliers: SupplierItem[];
  onUpdateBookingSupplierStatus?: (
    bookingId: string,
    status: 'pending' | 'confirmed' | 'cancelled',
    refCode?: string
  ) => void;
  showToast: (msg: string) => void;
}

export default function SupplierDispatchModal({
  isOpen,
  onClose,
  booking,
  suppliers = [],
  onUpdateBookingSupplierStatus,
  showToast,
}: SupplierDispatchModalProps) {
  if (!isOpen || !booking) return null;

  // Varsayılan tedarikçi eşleşmesi
  const matchedSupplier = useMemo(() => {
    if (!booking.supplier) return suppliers[0] || null;
    return (
      suppliers.find(
        (s) =>
          s.name.toLowerCase().includes(booking.supplier!.toLowerCase()) ||
          booking.supplier!.toLowerCase().includes(s.name.toLowerCase())
      ) ||
      suppliers[0] ||
      null
    );
  }, [booking.supplier, suppliers]);

  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(
    matchedSupplier?.id || suppliers[0]?.id || ''
  );
  const [language, setLanguage] = useState<'en' | 'th'>('en');
  const [customNotes, setCustomNotes] = useState<string>('');
  const [supplierRefCode, setSupplierRefCode] = useState<string>(
    booking.supplierRefCode || ''
  );
  const [copied, setCopied] = useState(false);

  const activeSupplier = useMemo(() => {
    return suppliers.find((s) => s.id === selectedSupplierId) || matchedSupplier;
  }, [suppliers, selectedSupplierId, matchedSupplier]);

  const message = useMemo(() => {
    return generateSupplierOrderMessage({
      booking,
      supplier: activeSupplier,
      tourDate: booking.tourDate,
      tourTitle: booking.tourTitle,
      language,
      customNotes: customNotes.trim() || undefined,
    });
  }, [booking, activeSupplier, language, customNotes]);

  const whatsappUrl = useMemo(() => {
    const phone = activeSupplier?.phone || '+66 82 895 0665';
    return getSupplierOrderWhatsAppUrl(phone, message);
  }, [activeSupplier, message]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      showToast('📋 Sipariş metni panoya kopyalandı!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast('⚠️ Kopyalama başarısız oldu.');
    }
  };

  const handleSendWhatsApp = () => {
    window.open(whatsappUrl, '_blank');
    if (onUpdateBookingSupplierStatus) {
      onUpdateBookingSupplierStatus(booking.id, 'pending', supplierRefCode);
    }
    showToast('💬 Tedarikçi WhatsApp görüşmesi açıldı!');
  };

  const handleMarkConfirmed = () => {
    if (onUpdateBookingSupplierStatus) {
      onUpdateBookingSupplierStatus(
        booking.id,
        'confirmed',
        supplierRefCode.trim() || undefined
      );
      showToast('✅ Tedarikçi siparişi onaylandı olarak işaretlendi!');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-surface-2 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[92vh] flex flex-col overflow-hidden my-auto">
        {/* HEADER */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-serif text-slate-900 dark:text-white">
                  Tedarikçiye WhatsApp Siparişi İlet
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                  B2B Operasyon
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {booking.customerName} ({booking.ticketCode || booking.id}) — {booking.tourTitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SETTINGS BAR */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Tedarikçi Seçimi */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 flex items-center gap-1">
                <Building className="w-3 h-3 text-brand-primary" /> Hedef Tedarikçi / Operatör
              </label>
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.pierOrLocation})
                  </option>
                ))}
              </select>
            </div>

            {/* Dil Seçimi */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 flex items-center gap-1">
                <Languages className="w-3 h-3 text-sky-500" /> Mesaj Dili
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                    language === 'en'
                      ? 'bg-brand-primary text-white border-brand-primary shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  🇬🇧 İngilizce (English)
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('th')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                    language === 'th'
                      ? 'bg-brand-primary text-white border-brand-primary shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  🇹🇭 Tayca (ภาษาไทย)
                </button>
              </div>
            </div>
          </div>

          {/* Özel Operasyon Notu & Onay Kodu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                Tedarikçiye Özel Not (Opsiyonel)
              </label>
              <input
                type="text"
                placeholder="Örn: Ön sırada koltuk rica ederiz, çocuk pusetli..."
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                Tedarikçi Onay Kodu (Confirmation Ref)
              </label>
              <input
                type="text"
                placeholder="Örn: AWM-2026-9912"
                value={supplierRefCode}
                onChange={(e) => setSupplierRefCode(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* MESSAGE PREVIEW */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-brand-primary" /> WhatsApp Mesaj Önizlemesi
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Tel: {activeSupplier?.phone || 'Belirtilmedi'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 font-mono text-xs whitespace-pre-wrap leading-relaxed text-slate-800 dark:text-slate-200 shadow-inner">
            {message}
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Kopyalandı!' : 'Metni Kopyala'}</span>
            </button>
            {supplierRefCode && (
              <button
                type="button"
                onClick={handleMarkConfirmed}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Onaylandı Olarak Kaydet</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md hover:shadow-lg w-full sm:w-auto justify-center"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Tedarikçiye WhatsApp ile Gönder</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
