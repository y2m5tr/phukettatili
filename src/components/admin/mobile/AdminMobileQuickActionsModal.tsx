import {
  Plus,
  Fuel,
  UserCheck,
  Wallet,
  QrCode,
  ScanLine,
  Plane,
  ClipboardList,
  MessageCircle,
  X,
  Sparkles,
  Compass,
} from 'lucide-react';
import type { AdminTab } from '../adminNav';
import type { AdminHeaderActions } from '../AdminHeader';

interface AdminMobileQuickActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNewBooking: () => void;
  onSelectTab: (tab: AdminTab) => void;
  actions: AdminHeaderActions;
  canCreateBookings: boolean;
}

export function AdminMobileQuickActionsModal({
  isOpen,
  onClose,
  onNewBooking,
  onSelectTab,
  actions,
  canCreateBookings,
}: AdminMobileQuickActionsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Bottom Sheet Drawer */}
      <div className="relative z-10 w-full max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-5 pb-[calc(2rem+env(safe-area-inset-bottom,0px))] shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Drag handle */}
        <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                Hızlı Saha & Operasyon
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Sık kullanılan araçlar ve masraflar
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            aria-label="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Action Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {/* 1. Yeni Rezervasyon */}
          {canCreateBookings && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onNewBooking();
              }}
              className="flex flex-col items-start p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 hover:from-amber-500/20 hover:to-amber-500/10 border border-amber-500/30 text-left transition-all cursor-pointer active:scale-98"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center mb-2.5 shadow-xs">
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
                Yeni Rezervasyon
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                Tur veya transfer ekle
              </span>
            </button>
          )}

          {/* 2. Şoför Masrafı */}
          <button
            type="button"
            onClick={() => {
              onClose();
              actions.openDriverExpense();
            }}
            className="flex flex-col items-start p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-left transition-all cursor-pointer active:scale-98"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center mb-2.5">
              <Fuel className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
              Şoför Masrafı
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
              Yakıt & otopark fişi
            </span>
          </button>

          {/* 3. Rehber Masrafı */}
          <button
            type="button"
            onClick={() => {
              onClose();
              actions.openGuideExpense();
            }}
            className="flex flex-col items-start p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-left transition-all cursor-pointer active:scale-98"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center mb-2.5">
              <UserCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
              Rehber Masrafı
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
              Bahşiş, park & harç
            </span>
          </button>

          {/* 4. Saha Kasa / Tahsilat */}
          <button
            type="button"
            onClick={() => {
              onClose();
              actions.openFieldCashier();
            }}
            className="flex flex-col items-start p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-left transition-all cursor-pointer active:scale-98"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-500 flex items-center justify-center mb-2.5">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
              Saha Kasa / Tahsilat
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
              Nakit & kart tahsilat
            </span>
          </button>

          {/* 5. PromptPay QR Üret */}
          <button
            type="button"
            onClick={() => {
              onClose();
              actions.openPromptPayQr();
            }}
            className="flex flex-col items-start p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-left transition-all cursor-pointer active:scale-98"
          >
            <div className="w-9 h-9 rounded-xl bg-sky-500/15 text-sky-500 flex items-center justify-center mb-2.5">
              <QrCode className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
              PromptPay QR
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
              Tayland QR ile ödeme al
            </span>
          </button>

          {/* 6. QR Bilet Tara */}
          <button
            type="button"
            onClick={() => {
              onClose();
              actions.openQrScanner();
            }}
            className="flex flex-col items-start p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-left transition-all cursor-pointer active:scale-98"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center mb-2.5">
              <ScanLine className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
              QR Bilet Tara
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
              Biniş & kupon doğrula
            </span>
          </button>

          {/* 7. Uçuş Radarı */}
          <button
            type="button"
            onClick={() => {
              onClose();
              actions.openFlightRadar();
            }}
            className="flex flex-col items-start p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-left transition-all cursor-pointer active:scale-98"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center mb-2.5">
              <Plane className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
              Uçuş Radarı
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
              HKT uçuş durumları
            </span>
          </button>

          {/* 8. Karşılama Panosu */}
          <button
            type="button"
            onClick={() => {
              onClose();
              actions.openWelcomeBoard();
            }}
            className="flex flex-col items-start p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-left transition-all cursor-pointer active:scale-98"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center mb-2.5">
              <ClipboardList className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
              Karşılama Panosu
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
              Havalimanı isim kartı
            </span>
          </button>
        </div>

        {/* Secondary Navigation Row */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-around gap-2 text-xs">
          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectTab('whatsapp');
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-emerald-500" />
            <span>WhatsApp Sohbet</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectTab('tours');
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
          >
            <Compass className="w-4 h-4 text-amber-500" />
            <span>Turlar</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectTab('finance');
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
          >
            <Wallet className="w-4 h-4 text-purple-500" />
            <span>Kasa & Finans</span>
          </button>
        </div>
      </div>
    </div>
  );
}
