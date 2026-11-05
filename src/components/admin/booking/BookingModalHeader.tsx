import React from 'react';
import { MessageCircle, Sparkles } from 'lucide-react';
import type { Booking } from '../../../data/adminInitialData';
import { fmtMoney } from '../../../lib/moneyFormat';

export interface BookingModalHeaderProps {
  editingBooking: Booking | null;
  formMode?: 'simple' | 'advanced';
  setFormMode?: (m: 'simple' | 'advanced') => void;
  activeTab: 'main' | 'finance' | 'supplier_b2b';
  setActiveTab: (tab: 'main' | 'finance' | 'supplier_b2b') => void;
  isQuickPasteOpen: boolean;
  setIsQuickPasteOpen: React.Dispatch<React.SetStateAction<boolean>>;
  quickPasteText: string;
  setQuickPasteText: (text: string) => void;
  onApplyWhatsAppPaste: () => void;
  onClose: () => void;
  remainingBalance: number;
  hasB2bOrSupplier: boolean;
}

export function BookingModalHeader({
  editingBooking,
  formMode = 'simple',
  setFormMode,
  activeTab,
  setActiveTab,
  isQuickPasteOpen,
  setIsQuickPasteOpen,
  quickPasteText,
  setQuickPasteText,
  onApplyWhatsAppPaste,
  onClose,
  remainingBalance,
  hasB2bOrSupplier,
}: BookingModalHeaderProps) {
  return (
    <div className="p-5 sm:p-6 pb-0 border-b border-slate-100 dark:border-slate-800 shrink-0 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white flex items-center gap-2">
            <span>{editingBooking ? '✏️ Rezervasyonu Düzenle' : '✨ Yeni Rezervasyon Ekle'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {formMode === 'simple'
              ? 'Satış temsilcileri için pratik ve hızlı rezervasyon ekranı.'
              : 'Misafir, otel ve 2\'li lobi alınış saati aralığını kolayca yönetin.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {setFormMode && (
            <div className="p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center border border-slate-200/80 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setFormMode('simple')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  formMode === 'simple'
                    ? 'bg-amber-500 text-slate-950 font-extrabold shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
                title="Sade & Hızlı Satış Formu (Temsilciler için pratik)"
              >
                ⚡ Hızlı Satış
              </button>
              <button
                type="button"
                onClick={() => setFormMode('advanced')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  formMode === 'advanced'
                    ? 'bg-brand-primary text-white font-extrabold shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
                title="Detaylı Operasyon & Tedarikçi Yönetimi"
              >
                ⚙️ Gelişmiş
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={() => setIsQuickPasteOpen((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
              isQuickPasteOpen
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
            }`}
            title="Müşterinin WhatsApp mesajını yapıştırarak formu anında doldurun"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">WhatsApp'tan</span>
            <span>Hızlı Doldur</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>
      </div>

      {isQuickPasteOpen && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/30 space-y-2.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
              <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Akıllı WhatsApp Rezervasyon Ayrıştırıcı</span>
            </div>
            <button
              type="button"
              onClick={() => setIsQuickPasteOpen(false)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              ✕ Kapat
            </button>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            Müşterinin WhatsApp konuşmasını buraya yapıştırın. Sistem; misafir adını, kişi sayısını, tarihi, oteli, oda numarasını, telefonunu ve turu otomatik tespit edip formu doldurur.
          </p>
          <textarea
            value={quickPasteText}
            onChange={(e) => setQuickPasteText(e.target.value)}
            rows={3}
            placeholder="Örn: Merhaba, biz 2 yetişkin 1 çocuk, 24 Ekim Phi Phi turu istiyoruz. Otelimiz Centara Grand, oda no: 304. Tel: 0532 123 4567, fiyat 7200 Baht..."
            className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-500/30 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
          />
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              💡 Türkçe veya serbest mesaj kalıplarını destekler.
            </span>
            <button
              type="button"
              onClick={onApplyWhatsAppPaste}
              disabled={!quickPasteText.trim()}
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Metni Çöz & Formu Doldur</span>
            </button>
          </div>
        </div>
      )}

      {/* Sekmeler veya Sade Mod Bilgisi */}
      {formMode === 'simple' ? (
        <div className="pb-3 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5 font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-300/40">
            ⚡ <strong>Hızlı Satış Modu:</strong> Satışçıların kolayca doldurup WhatsApp veya LINE ile paylaşabilmesi için optimize edildi.
          </span>
          {setFormMode && (
            <button
              type="button"
              onClick={() => setFormMode('advanced')}
              className="text-xs text-brand-primary font-bold hover:underline cursor-pointer shrink-0 ml-2"
            >
              Gelişmiş Formu Aç →
            </button>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('main')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'main'
                ? 'bg-brand-primary text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <span>📋 1. Rezervasyon & Otel</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('finance')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'finance'
                ? 'bg-brand-primary text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <span>💰 2. Kasa & Tahsilat</span>
            {remainingBalance > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-600 dark:text-amber-400 font-mono">
                {fmtMoney(remainingBalance)} ฿
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('supplier_b2b')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'supplier_b2b'
                ? 'bg-brand-primary text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <span>🤝 3. Acenta & Tedarikçi</span>
            {hasB2bOrSupplier && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
