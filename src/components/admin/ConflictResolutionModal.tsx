import React from 'react';
import { AlertTriangle, RefreshCw, CheckCircle2, X, ArrowRight, ShieldAlert } from 'lucide-react';
import type { Booking } from '../../data/adminInitialData';

export interface ConflictData {
  local: Booking;
  server?: Booking | null;
  message?: string;
}

interface ConflictResolutionModalProps {
  isOpen: boolean;
  conflict: ConflictData | null;
  onAcceptServer: () => void;
  onForceOverwrite: (localBooking: Booking) => void;
  onClose: () => void;
}

export default function ConflictResolutionModal({
  isOpen,
  conflict,
  onAcceptServer,
  onForceOverwrite,
  onClose,
}: ConflictResolutionModalProps) {
  if (!isOpen || !conflict) return null;

  const { local, server, message } = conflict;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-amber-500/30 dark:border-amber-500/40 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                Eşzamanlı Düzenleme Çakışması (409)
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Bu kayıt başka bir ekip üyesi tarafından daha yeni bir tarihte güncellendi.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
            {message ||
              'Aynı rezervasyon üzerinde birden fazla cihaz veya personel işlem yaptı. Yanlışlıkla birbirinizin çalışmasını ezmemek için lütfen hangi verinin geçerli olacağını seçiniz.'}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Local Version */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                  Sizin Değişikliğiniz
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold">
                  Bu Cihaz
                </span>
              </div>
              <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                <div>
                  <span className="text-slate-400">Misafir:</span> <strong>{local.customerName}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Tur / Tarih:</span> {local.tourTitle} ({local.tourDate})
                </div>
                <div>
                  <span className="text-slate-400">Otel:</span> {local.hotel || '-'} {local.roomNumber ? `(Oda ${local.roomNumber})` : ''}
                </div>
                <div>
                  <span className="text-slate-400">Durum:</span>{' '}
                  <span className="font-semibold text-slate-800 dark:text-slate-100 uppercase text-[11px]">
                    {local.status}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Atanan Araç/Şoför:</span>{' '}
                  {local.assignedDriver || local.assignedVehicle || 'Atama Yok'}
                </div>
                <div>
                  <span className="text-slate-400">Ödeme:</span> {local.paidAmountThb} / {local.totalPriceThb} THB
                </div>
              </div>
            </div>

            {/* Server Version */}
            <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-amber-500/20">
                <span className="text-xs font-black text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                  Sunucudaki Güncel Kayıt
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold">
                  En Yeni Bulut
                </span>
              </div>
              {server ? (
                <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                  <div>
                    <span className="text-slate-400">Misafir:</span> <strong>{server.customerName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Tur / Tarih:</span> {server.tourTitle} ({server.tourDate})
                  </div>
                  <div>
                    <span className="text-slate-400">Otel:</span> {server.hotel || '-'} {server.roomNumber ? `(Oda ${server.roomNumber})` : ''}
                  </div>
                  <div>
                    <span className="text-slate-400">Durum:</span>{' '}
                    <span className="font-semibold text-amber-700 dark:text-amber-300 uppercase text-[11px]">
                      {server.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Atanan Araç/Şoför:</span>{' '}
                    {server.assignedDriver || server.assignedVehicle || 'Atama Yok'}
                  </div>
                  <div>
                    <span className="text-slate-400">Ödeme:</span> {server.paidAmountThb} / {server.totalPriceThb} THB
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 italic pt-2">
                  Sunucudaki yeni sürüm başka bir ekip üyesi tarafından kaydedildi. "Sunucudaki Kaydı Kabul Et" butonuna basarak en son sürümü görebilirsiniz.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={() => onForceOverwrite(local)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors"
          >
            Kendi Değişikliğimi Üzerine Zorla Yaz
          </button>
          <button
            type="button"
            onClick={onAcceptServer}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-black text-white bg-brand-primary hover:bg-brand-primary/90 shadow-md shadow-brand-primary/20 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            (Önerilen) Sunucudaki Kaydı Kabul Et
          </button>
        </div>
      </div>
    </div>
  );
}
