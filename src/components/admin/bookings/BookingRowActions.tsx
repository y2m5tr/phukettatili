import {
  ExternalLink,
  Compass,
  ShieldCheck,
  Plane,
  Ticket,
  MessageCircle,
  Star,
  Gift,
  Building,
  FileDown,
  Edit2,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import type { Booking } from '../../../data/adminInitialData';
import {
  generateDriverPickupJobThai,
  generateGuestPickupReminderTurkish,
} from '../../../lib/whatsappEngine';
import { isTourEligibleForReview, getGoogleReviewWhatsAppUrl } from '../../../lib/reviewBooster';
import { getCrossSellWhatsAppUrl } from '../../../lib/crossSell';

export interface BookingRowActionsProps {
  booking: Booking;
  isSalesView?: boolean;
  canDelete?: boolean;
  googleReviewUrl?: string;
  onOpenEdit: (b: Booking) => void;
  onDelete: (id: string, customerName: string) => void;
  setVoucherBooking: (b: Booking) => void;
  setWhatsAppModalBooking: (b: Booking) => void;
  onOpenQuotePdf?: (b: Booking) => void;
  onOpenFlightRadar?: (flight?: string, guestName?: string) => void;
  onOpenWelcomeBoard?: (b: Booking) => void;
  onOpenTourMedia?: (b: Booking) => void;
  onOpenSupplierDispatch?: (b: Booking) => void;
  onOpenWorkflow?: (b: Booking) => void;
}

export function BookingRowActions({
  booking: b,
  isSalesView = false,
  canDelete = true,
  googleReviewUrl,
  onOpenEdit,
  onDelete,
  setVoucherBooking,
  setWhatsAppModalBooking,
  onOpenQuotePdf,
  onOpenFlightRadar,
  onOpenWelcomeBoard,
  onOpenTourMedia,
  onOpenSupplierDispatch,
  onOpenWorkflow,
}: BookingRowActionsProps) {
  const reminder = generateGuestPickupReminderTurkish(b);
  const lineShareUrl = `https://line.me/R/msg/text/?${encodeURIComponent(reminder.message)}`;

  if (isSalesView) {
    return (
      <div className="flex items-center justify-end gap-1.5 flex-wrap">
        <button
          type="button"
          onClick={() => setWhatsAppModalBooking(b)}
          className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer"
          title="💬 WhatsApp ile Bilet & Mesaj Gönder"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>WhatsApp</span>
        </button>
        <button
          type="button"
          onClick={() => window.open(lineShareUrl, '_blank', 'noopener,noreferrer')}
          className="px-2.5 py-1.5 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer"
          title="🟢 LINE ile Bilet & Detayları Paylaş"
        >
          <span className="font-extrabold text-[10px] bg-white text-[#06C755] px-1 py-0.2 rounded">LINE</span>
          <span>Paylaş</span>
        </button>
        <button
          type="button"
          onClick={() => setVoucherBooking(b)}
          className="p-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 hover:bg-purple-600 hover:text-white transition-colors cursor-pointer"
          title="🎫 Dijital Biniş Kartı / Voucher"
        >
          <Ticket className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onOpenEdit(b)}
          className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-colors cursor-pointer"
          title="✏️ Rezervasyonu Düzenle"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      {/* Satır 1: Misafir Portalları & Saha Servisleri */}
      <div
        className="inline-flex items-center justify-end gap-1 p-1 bg-amber-500/5 dark:bg-amber-500/10 rounded-xl border border-amber-500/15"
        title="Misafir Portalları & Saha Linkleri"
      >
        <a
          href={`/bilet/${b.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition-colors"
          title="🎟️ Misafir Canlı Takip Portalını Aç (/bilet/[kod])"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
        <a
          href={`/gezi/${b.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 hover:bg-teal-600 hover:text-white transition-colors"
          title="🧭 Misafir Gün Gün Dijital Tatil Ajandası (/gezi/[id])"
        >
          <Compass className="w-3.5 h-3.5" />
        </a>
        <a
          href={`/sigorta/${b.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-colors"
          title="🛡️ TAT Tur Sigortası & Sağlık Beyanı Formu (/sigorta/[id])"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
        </a>
        <a
          href={`/foto/${b.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 hover:bg-purple-600 hover:text-white transition-colors flex items-center justify-center"
          title="📸 Misafir Fotoğraf Kasası (/foto/[kod])"
        >
          <span className="text-xs leading-none">📸</span>
        </a>
        {onOpenWelcomeBoard && (
          <button
            type="button"
            onClick={() => onOpenWelcomeBoard(b)}
            className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition-colors cursor-pointer flex items-center justify-center"
            title="🪧 VIP Karşılama İsimlik & Tablet Tabelası"
          >
            <span className="text-xs leading-none">🪧</span>
          </button>
        )}
        {onOpenFlightRadar && (
          <button
            type="button"
            onClick={() => onOpenFlightRadar(undefined, b.customerName)}
            className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 hover:bg-sky-600 hover:text-white transition-colors cursor-pointer"
            title="✈️ Havalimanı Uçuş Radarı & Canlı Karşılama"
          >
            <Plane className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          type="button"
          onClick={() => setVoucherBooking(b)}
          className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 hover:bg-purple-600 hover:text-white transition-colors cursor-pointer"
          title="🎫 Bilet / Voucher Kuponu Aç"
        >
          <Ticket className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Satır 2: İletişim, Satış & Yönetim İşlemleri */}
      <div
        className="inline-flex items-center justify-end gap-1 p-1 bg-slate-100/80 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800/80"
        title="İletişim, Satış & Rezervasyon Yönetimi"
      >
        <button
          type="button"
          onClick={() => setWhatsAppModalBooking(b)}
          className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors cursor-pointer"
          title="💬 WhatsApp & LINE Şablonları & Bilet Paylaşımı"
        >
          <MessageCircle className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => window.open(lineShareUrl, '_blank', 'noopener,noreferrer')}
          className="px-1.5 py-1 rounded-lg bg-[#06C755]/15 text-[#06C755] hover:bg-[#06C755] hover:text-white transition-colors cursor-pointer flex items-center justify-center font-black text-[10px]"
          title="🟢 Bilet & Alınış Detaylarını LINE Uygulamasında Paylaş"
        >
          LINE
        </button>
        <button
          type="button"
          onClick={() => {
            const job = generateDriverPickupJobThai(b);
            window.open(job.waUrl, '_blank', 'noopener,noreferrer');
          }}
          className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer flex items-center justify-center text-xs"
          title="🇹🇭 Şoför için Tayca & İngilizce Alınış Kartını WhatsApp'ta Aç"
        >
          <span className="leading-none">🇹🇭</span>
        </button>
        <button
          type="button"
          onClick={() => {
            window.open(reminder.waUrl, '_blank', 'noopener,noreferrer');
          }}
          className="p-1.5 rounded-lg bg-teal-500/15 text-teal-700 dark:text-teal-300 hover:bg-teal-600 hover:text-white transition-colors cursor-pointer flex items-center justify-center text-xs"
          title="🇹🇷 Misafire Türkçe Lobi Alınış Hatırlatmasını WhatsApp'ta Aç"
        >
          <span className="leading-none">🇹🇷</span>
        </button>
        <button
          type="button"
          onClick={() => {
            const url = getGoogleReviewWhatsAppUrl(b, { googleReviewUrl });
            window.open(url, '_blank', 'noopener,noreferrer');
          }}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            isTourEligibleForReview(b)
              ? 'bg-amber-400/25 text-amber-600 dark:text-amber-400 hover:bg-amber-400 hover:text-slate-950'
              : 'bg-slate-200/70 dark:bg-slate-800 text-slate-400 hover:text-amber-500'
          }`}
          title="⭐ 5-Yıldızlı Google Yorum İste (WhatsApp Review Booster)"
        >
          <Star className="w-3.5 h-3.5 fill-current" />
        </button>
        <button
          type="button"
          onClick={() => {
            const url = getCrossSellWhatsAppUrl(b);
            window.open(url, '_blank', 'noopener,noreferrer');
          }}
          className="p-1.5 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 hover:bg-purple-600 hover:text-white transition-colors cursor-pointer"
          title="🎁 %10 İkinci Tur İndirimi & Çapraz Satış Teklifi Gönder (WhatsApp)"
        >
          <Gift className="w-3.5 h-3.5" />
        </button>
        {onOpenTourMedia && (
          <button
            type="button"
            onClick={() => onOpenTourMedia(b)}
            className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 hover:bg-sky-600 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
            title="📂 Fotoğraf Albüm Linki Ekle & WhatsApp Gönder"
          >
            <span className="text-xs leading-none">📂</span>
          </button>
        )}
        {onOpenSupplierDispatch && (
          <button
            type="button"
            onClick={() => onOpenSupplierDispatch(b)}
            className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer"
            title="🏢 Tedarikçiye (Andaman Wave, Seastar vb.) WhatsApp Tur Siparişi İlet"
          >
            <Building className="w-3.5 h-3.5" />
          </button>
        )}
        {onOpenQuotePdf && (
          <button
            type="button"
            onClick={() => onOpenQuotePdf(b)}
            className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
            title="📄 Resmî PDF Fiyat Teklifi / Proforma Oluştur & İndir"
          >
            <FileDown className="w-3.5 h-3.5" />
          </button>
        )}
        {onOpenWorkflow && (
          <button
            type="button"
            onClick={() => onOpenWorkflow(b)}
            className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
            title="⚡ 5 Adımlı Rezervasyon İş Akışını Yönet"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          type="button"
          onClick={() => onOpenEdit(b)}
          className="p-1.5 rounded-lg bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-colors cursor-pointer"
          title="✏️ Rezervasyonu Düzenle"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        {canDelete && (
          <button
            type="button"
            onClick={() => onDelete(b.id, b.customerName)}
            className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
            title="🗑️ Rezervasyonu Kalıcı Sil"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
