import React, { useState, useMemo } from 'react';
import {
  QrCode,
  Download,
  Copy,
  Check,
  X,
  CreditCard,
  ShieldCheck,
  Building,
  Smartphone,
  Info,
} from 'lucide-react';
import {
  generatePromptPayPayload,
  getPromptPayQrImageUrl,
} from '../../lib/promptpay';

interface PromptPayQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingRef?: string;
  customerName?: string;
  initialAmountThb?: number;
  promptPayTarget?: string; // Telefon veya Vergi No
  onMarkPaid?: (amountThb: number) => void;
  showToast?: (msg: string) => void;
}

export default function PromptPayQrModal({
  isOpen,
  onClose,
  bookingRef = 'PT-BOOKING',
  customerName,
  initialAmountThb = 2400,
  promptPayTarget = '0828950665', // Phuket Tatili K-Bank PromptPay
  onMarkPaid,
  showToast = (msg) => alert(msg),
}: PromptPayQrModalProps) {
  if (!isOpen) return null;

  const [amountThb, setAmountThb] = useState<number>(initialAmountThb);
  const [copied, setCopied] = useState(false);

  const payload = useMemo(() => {
    return generatePromptPayPayload({
      target: promptPayTarget,
      amountThb: amountThb > 0 ? amountThb : undefined,
    });
  }, [promptPayTarget, amountThb]);

  const qrImageUrl = useMemo(() => {
    return getPromptPayQrImageUrl(payload, 320);
  }, [payload]);

  const handleCopyPayload = async () => {
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      showToast('📋 PromptPay EMVCo kodu panoya kopyalandı!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast('⚠️ Kopyalama başarısız oldu.');
    }
  };

  const handleDownloadQr = () => {
    const link = document.createElement('a');
    link.href = qrImageUrl;
    link.download = `PromptPay-${bookingRef}-${amountThb}THB.png`;
    link.target = '_blank';
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-surface-2 w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden my-auto">
        {/* HEADER */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  PromptPay Canlı QR
                </h3>
                <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                  THB
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                {bookingRef} {customerName ? `• ${customerName}` : ''}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-5 flex flex-col items-center space-y-4">
          {/* PromptPay Resmi Başlık Şeridi */}
          <div className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-blue-900 text-white text-xs font-bold">
            <div className="flex items-center gap-2">
              <span className="tracking-wider">พร้อมเพย์</span>
              <span className="font-sans font-semibold text-[10px] text-blue-200">PROMPTPAY</span>
            </div>
            <span className="text-[10px] font-mono text-blue-300">Bank of Thailand</span>
          </div>

          {/* QR KOD KARTI */}
          <div className="p-4 rounded-3xl bg-white border-2 border-slate-200 shadow-md flex flex-col items-center">
            <img
              src={qrImageUrl}
              alt="PromptPay QR Code"
              className="w-56 h-56 object-contain rounded-xl"
            />
            <div className="mt-2 text-center">
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block">
                Ödenecek Tutar
              </span>
              <span className="text-2xl font-black text-slate-900 font-mono">
                {amountThb.toLocaleString()} THB
              </span>
            </div>
          </div>

          {/* TUTAR DÜZENLEME & BİLGİ */}
          <div className="w-full space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Tutarı Değiştir:</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="1"
                  step="10"
                  value={amountThb}
                  onChange={(e) => setAmountThb(Math.max(0, Number(e.target.value) || 0))}
                  className="w-28 px-2.5 py-1 text-right rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                />
                <span className="font-bold text-slate-400 text-xs">THB</span>
              </div>
            </div>

            {/* Banka Uygulamaları İpucu */}
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
              <Smartphone className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                K-Bank, SCB Easy, Bangkok Bank veya Wise uygulamasıyla "Scan" sekmesini açarak bu kodu tarayınız.
              </span>
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleDownloadQr}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>İndir</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyPayload}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Kopyalandı' : 'Kodu Kopyala'}</span>
            </button>

            {onMarkPaid && (
              <button
                type="button"
                onClick={() => {
                  onMarkPaid(amountThb);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Ödendi İşaretle</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
