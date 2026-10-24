import type { Booking } from '../../../data/adminInitialData';
import {
  Send,
  Camera,
  Coins,
  Fuel,
  UserCheck,
  ShieldCheck,
  ShieldAlert,
  Wifi,
  Plane,
  Luggage,
  Package,
  FileText,
} from 'lucide-react';

export interface TransferOperationsBarProps {
  onOpenPoliceManifest: () => void;
  onOpenQrScanner?: () => void;
  onOpenLostFound?: () => void;
  onOpenDietaryManifest?: () => void;
  onOpenFieldCashier?: () => void;
  onOpenFlightRadar?: () => void;
  onOpenDriverExpense?: () => void;
  onOpenGuideExpense?: () => void;
  onOpenWelcomeBoard?: (b?: Booking) => void;
  onOpenLuggageExpress?: () => void;
  onOpenCaptainVault?: () => void;
  onOpenCuratedProposal?: (b?: Booking) => void;
  setIsBulkDispatchOpen: (open: boolean) => void;
}

export default function TransferOperationsBar({
  onOpenPoliceManifest,
  onOpenQrScanner,
  onOpenLostFound,
  onOpenDietaryManifest,
  onOpenFieldCashier,
  onOpenFlightRadar,
  onOpenDriverExpense,
  onOpenGuideExpense,
  onOpenWelcomeBoard,
  onOpenLuggageExpress,
  onOpenCaptainVault,
  onOpenCuratedProposal,
  setIsBulkDispatchOpen,
}: TransferOperationsBarProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5">
      {/* GRUP 1: 🚀 SAHA SEVK & CHECK-IN */}
      <div className="bg-white dark:bg-surface-2 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-500 uppercase tracking-wider px-1">
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <Send className="w-3.5 h-3.5" />
            <span>Sevk & Check-in</span>
          </span>
          <span className="text-[10px] text-slate-400">Yolcu</span>
        </div>
        <div className="grid grid-cols-1 gap-1.5">
          <button
            type="button"
            onClick={() => setIsBulkDispatchOpen(true)}
            className="w-full px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs flex items-center justify-between transition-all cursor-pointer"
            title="Gündeki tüm misafirlere WhatsApp lobi ve biniş hatırlatmalarını sırayla gönder"
          >
            <span className="flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5" />
              <span>Toplu WhatsApp Gönderici</span>
            </span>
            <span className="text-[10px] bg-emerald-700/60 px-1.5 py-0.2 rounded-full">Oto-Lobi</span>
          </button>

          {onOpenQrScanner && (
            <button
              type="button"
              onClick={onOpenQrScanner}
              className="w-full px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs flex items-center justify-between transition-all cursor-pointer"
              title="Misafir Kuponu / Bilet QR Kodu Oku & Doğrula"
            >
              <span className="flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5" />
                <span>Bilet QR Oku / Check-in</span>
              </span>
              <span className="text-[10px] bg-purple-700/60 px-1.5 py-0.2 rounded-full">Kamera</span>
            </button>
          )}

          {onOpenWelcomeBoard && (
            <button
              type="button"
              onClick={() => onOpenWelcomeBoard()}
              className="w-full px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Havalimanı VIP Karşılama İsimliği & Tablet Tabelası"
            >
              <span className="text-xs leading-none">🪧</span>
              <span>VIP Karşılama İsimliği</span>
            </button>
          )}
        </div>
      </div>

      {/* GRUP 2: 💵 SAHA KASA & MASRAF MASASI */}
      <div className="bg-white dark:bg-surface-2 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-500 uppercase tracking-wider px-1">
          <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
            <Coins className="w-3.5 h-3.5" />
            <span>Kasa & Masraflar</span>
          </span>
          <span className="text-[10px] text-slate-400">Saha Nakit</span>
        </div>
        <div className="grid grid-cols-1 gap-1.5">
          {onOpenDriverExpense && (
            <button
              type="button"
              onClick={onOpenDriverExpense}
              className="w-full px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 dark:text-amber-200 border border-amber-500/30 text-xs font-bold flex items-center justify-between transition-all cursor-pointer"
              title="Şoför Yakıt, Otopark & Harç Masraf Masası"
            >
              <span className="flex items-center gap-1.5">
                <Fuel className="w-3.5 h-3.5 text-amber-600" />
                <span>Şoför Yakıt & Harç</span>
              </span>
              <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.2 rounded-full font-mono">Dizel/Park</span>
            </button>
          )}

          {onOpenGuideExpense && (
            <button
              type="button"
              onClick={onOpenGuideExpense}
              className="w-full px-3 py-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-900 dark:text-teal-200 border border-teal-500/30 text-xs font-bold flex items-center justify-between transition-all cursor-pointer"
              title="Rehber Taksi/Grab, Yemek, Karşılama & Saha Masraf Masası"
            >
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>Rehber Masrafı</span>
              </span>
              <span className="text-[10px] bg-teal-500/20 px-1.5 py-0.2 rounded-full font-mono">Grab/Yemek</span>
            </button>
          )}

          {onOpenFieldCashier && (
            <button
              type="button"
              onClick={onOpenFieldCashier}
              className="w-full px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Saha Çoklu Döviz & Para Üstü Kasa Hesaplayıcı"
            >
              <Coins className="w-3.5 h-3.5 text-emerald-600" />
              <span>Saha Çoklu Döviz Kasa</span>
            </button>
          )}
        </div>
      </div>

      {/* GRUP 3: 🛡️ EMNİYET & RESMÎ MANİFESTOLAR */}
      <div className="bg-white dark:bg-surface-2 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-500 uppercase tracking-wider px-1">
          <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Emniyet & Manifestolar</span>
          </span>
          <span className="text-[10px] text-slate-400">Resmî / TAT</span>
        </div>
        <div className="grid grid-cols-1 gap-1.5">
          <button
            type="button"
            onClick={onOpenPoliceManifest}
            className="w-full px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center justify-between transition-all cursor-pointer"
            title="Tayland Deniz Polisi & Millî Park Yolcu Manifestosu"
          >
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Deniz Polisi Manifestosu</span>
            </span>
            <span className="text-[10px] bg-indigo-700/60 px-1.5 py-0.2 rounded-full">PDF/Baskı</span>
          </button>

          {onOpenDietaryManifest && (
            <button
              type="button"
              onClick={onOpenDietaryManifest}
              className="w-full px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Misafir Diyet, Alerji ve Tekne Güvenlik Manifestosu"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>Diyet & Medikal Emniyet</span>
            </button>
          )}

          {onOpenCaptainVault && (
            <button
              type="button"
              onClick={onOpenCaptainVault}
              className="w-full px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Andaman Denizi Çevrimdışı Kaptan Kasası & Acil Durum Rehberi (PWA)"
            >
              <Wifi className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>📶 Kaptan Kasası (PWA)</span>
            </button>
          )}
        </div>
      </div>

      {/* GRUP 4: ✈️ LOJİSTİK & TEKLİF BROŞÜRÜ */}
      <div className="bg-white dark:bg-surface-2 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-500 uppercase tracking-wider px-1">
          <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
            <Plane className="w-3.5 h-3.5" />
            <span>Lojistik & Teklif</span>
          </span>
          <span className="text-[10px] text-slate-400">Havalimanı</span>
        </div>
        <div className="grid grid-cols-1 gap-1.5">
          <div className="grid grid-cols-2 gap-1.5">
            {onOpenFlightRadar && (
              <button
                type="button"
                onClick={onOpenFlightRadar}
                className="px-2.5 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-800 dark:text-sky-300 border border-sky-500/30 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                title="Phuket Havalimanı Canlı Uçuş Radarı & Rötar Kalkanı"
              >
                <Plane className="w-3.5 h-3.5 text-sky-600" />
                <span className="truncate">Uçuş Radarı</span>
              </button>
            )}

            {onOpenLuggageExpress && (
              <button
                type="button"
                onClick={onOpenLuggageExpress}
                className="px-2.5 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border border-indigo-500/30 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                title="Oteller Arası Bagaj Transfer & Emanet Takip Masası"
              >
                <Luggage className="w-3.5 h-3.5 text-indigo-600" />
                <span className="truncate">Bagaj Masası</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {onOpenLostFound && (
              <button
                type="button"
                onClick={onOpenLostFound}
                className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                title="Araçta ve teknede unutulan kayıp eşya takibi"
              >
                <Package className="w-3.5 h-3.5 text-amber-600" />
                <span className="truncate">Kayıp Eşya</span>
              </button>
            )}

            {onOpenCuratedProposal && (
              <button
                type="button"
                onClick={() => onOpenCuratedProposal()}
                className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                title="Kişiye Özel Logolu A4 PDF Tur Teklifi & Tatil Broşürü"
              >
                <FileText className="w-3.5 h-3.5 text-amber-600" />
                <span className="truncate">PDF Teklif</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
