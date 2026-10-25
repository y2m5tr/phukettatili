import React from 'react';
import {
  Phone,
  ExternalLink,
  Ticket,
  MessageCircle,
  Edit2,
  Trash2,
  Ship,
  FileText,
  Star,
  Gift,
  Coins,
  Compass,
  ShieldCheck,
  Plane,
  Building,
  QrCode,
  Luggage,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { type Booking, detectHotelZone, getPhuketSeason } from '../../../data/adminInitialData';
import { isTourEligibleForReview, getGoogleReviewWhatsAppUrl } from '../../../lib/reviewBooster';
import { getCrossSellWhatsAppUrl } from '../../../lib/crossSell';
import { analyzeBookingDietaryAndMedical, DIETARY_CATEGORIES } from '../../../lib/dietaryManifest';
import { generateDriverPickupJobThai, generateGuestPickupReminderTurkish } from '../../../lib/whatsappEngine';
import { fmtMoney } from '../../../lib/moneyFormat';

export interface BookingTableRowProps {
  booking: Booking;
  pendingBookingIds?: Set<string>;
  canDelete?: boolean;
  googleReviewUrl?: string;
  onOpenEdit: (b: Booking) => void;
  onDelete: (id: string, customerName: string) => void;
  setVoucherBooking: (b: Booking) => void;
  setWhatsAppModalBooking: (b: Booking) => void;
  onQuickCollect?: (b: Booking) => void;
  onOpenQuotePdf?: (b: Booking) => void;
  onOpenFieldCashier?: (b?: Booking) => void;
  onOpenFlightRadar?: (flight?: string, guestName?: string) => void;
  onOpenWelcomeBoard?: (b: Booking) => void;
  onOpenTourMedia?: (b: Booking) => void;
  onUpdateStatus?: (b: Booking, status: Booking['status']) => void;
  onOpenSupplierDispatch?: (b: Booking) => void;
  onOpenPromptPayQr?: (b: Booking) => void;
  onOpenWorkflow?: (b: Booking) => void;
}

export function BookingTableRow({
  booking: b,
  pendingBookingIds,
  canDelete = true,
  googleReviewUrl,
  onOpenEdit,
  onDelete,
  setVoucherBooking,
  setWhatsAppModalBooking,
  onQuickCollect,
  onOpenQuotePdf,
  onOpenFieldCashier,
  onOpenFlightRadar,
  onOpenWelcomeBoard,
  onOpenTourMedia,
  onUpdateStatus,
  onOpenSupplierDispatch,
  onOpenPromptPayQr,
  onOpenWorkflow,
}: BookingTableRowProps) {
  const dietaryAlert = analyzeBookingDietaryAndMedical(b);

  return (
    <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-900/30 transition-colors">
      <td className="py-4 px-5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-mono text-[10px] text-slate-400 block">{b.id}</span>
          {pendingBookingIds?.has(b.id) ? (
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-700 animate-pulse"
              title="İşlem cihaza kaydedildi, buluta gönderilmeyi bekliyor"
            >
              <span className="w-1 h-1 rounded-full bg-amber-500"></span>
              Cihazda
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-0.5 text-[9px] text-slate-400 dark:text-slate-500"
              title="Sunucuyla tam senkronize"
            >
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
              Bulut
            </span>
          )}
        </div>
        <span className="font-bold text-slate-900 dark:text-white block">{b.customerName}</span>
        <a
          href={`https://wa.me/${b.phone.replace(/[^0-9]/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 mt-0.5"
        >
          <Phone className="w-3 h-3" /> {b.phone}
        </a>
        {dietaryAlert && dietaryAlert.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {dietaryAlert.categories.map((c) => {
              const meta = DIETARY_CATEGORIES[c];
              return (
                <span
                  key={c}
                  className={`px-1.5 py-0.2 rounded text-[9px] font-bold flex items-center gap-0.5 ${meta.badgeClass}`}
                  title={dietaryAlert.safetyInstructions.join('; ')}
                >
                  <span>{meta.icon}</span>
                  <span>{meta.shortLabel}</span>
                </span>
              );
            })}
          </div>
        )}
      </td>

      <td className="py-4 px-5">
        <span className="font-medium text-slate-800 dark:text-slate-200 block">{b.hotel}</span>
        <div className="flex items-center gap-1.5 flex-wrap mt-1">
          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/60">
            📍 {b.hotelZone || detectHotelZone(b.hotel)}
          </span>
          {b.roomNumber && (
            <span className="text-xs text-slate-500 dark:text-slate-400">Oda: {b.roomNumber}</span>
          )}
          {(b.isHotelHop || b.hasLuggage || (b.hotels && b.hotels.length > 0)) && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-black bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700">
              <Luggage className="w-3 h-3 text-purple-600 dark:text-purple-400" />
              <span>🧳 Valizli ({b.luggageCount || 2})</span>
            </span>
          )}
        </div>
      </td>

      <td className="py-4 px-5">
        {b.tours && b.tours.length > 1 ? (
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-brand-primary text-white shadow-2xs">
              🌴 {b.tours.length} Farklı Tur Paketi
            </span>
            {b.tours.map((t, idx) => (
              <div key={idx} className="text-xs">
                <span className="font-semibold text-slate-900 dark:text-white block">
                  {idx + 1}. {t.tourTitle}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  📅 {t.tourDate} {t.pickupTime ? `· ⏰ ${t.pickupTime}` : ''} {t.priceThb ? `· ${fmtMoney(t.priceThb)} THB` : ''}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-slate-900 dark:text-white">{b.tourTitle}</span>
              {(() => {
                const s = getPhuketSeason(b.tourDate);
                return (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold border ${s.badgeColor}`}>
                    {s.season === 'peak' ? 'Peak' : s.season === 'low' ? 'Low' : 'High'}
                  </span>
                );
              })()}
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
              📅 {b.tourDate} {b.pickupTime ? `· ⏰ ${b.pickupTime}` : ''}
            </span>
            {b.supplier && (
              <span className="inline-flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 flex-wrap">
                <Ship className="w-3 h-3 text-rose-500" />
                <span>{b.supplier}</span>
                {b.supplierRefCode && (
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                    ({b.supplierRefCode})
                  </span>
                )}
                {b.supplierStatus && (
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                      b.supplierStatus === 'confirmed'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : b.supplierStatus === 'pending'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {b.supplierStatus === 'confirmed'
                      ? '✓ Onaylı'
                      : b.supplierStatus === 'pending'
                      ? '⏳ Bekliyor'
                      : '✕ İptal'}
                  </span>
                )}
              </span>
            )}
          </>
        )}
      </td>

      <td className="py-4 px-5">
        <span className="font-bold">{b.adultCount} Yetişkin</span>
        {b.childCount > 0 && <span className="text-xs text-slate-500 block">+{b.childCount} Çocuk</span>}
      </td>

      <td className="py-4 px-5">
        <div className="font-bold text-slate-900 dark:text-white">
          {fmtMoney(b.totalPriceThb)} THB
        </div>
        <div className="text-xs mt-0.5">
          {b.remainingAmountThb === 0 ? (
            <span className="text-emerald-600 font-semibold">✓ Tamamı Ödendi</span>
          ) : (
            <div className="flex flex-col items-start gap-1">
              <span className="text-amber-600 font-semibold">
                Kalan: {fmtMoney(b.remainingAmountThb)} THB
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {onQuickCollect && (
                  <button
                    type="button"
                    onClick={() => onQuickCollect(b)}
                    className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer"
                  >
                    + Tahsilat Al
                  </button>
                )}
                {onOpenFieldCashier && (
                  <button
                    type="button"
                    onClick={() => onOpenFieldCashier(b)}
                    className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-all cursor-pointer flex items-center gap-1"
                    title="Saha Döviz & Para Üstü Kasa Hesaplayıcı"
                  >
                    <Coins className="w-3 h-3" />
                    <span>💱 Döviz Kasa</span>
                  </button>
                )}
                {onOpenPromptPayQr && (
                  <button
                    type="button"
                    onClick={() => onOpenPromptPayQr(b)}
                    className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-500/10 text-sky-700 dark:text-sky-300 hover:bg-sky-600 hover:text-white transition-all cursor-pointer flex items-center gap-1"
                    title="PromptPay Dinamik QR Kodu Göster (K-Bank / SCB)"
                  >
                    <QrCode className="w-3 h-3 text-sky-500" />
                    <span>PromptPay QR</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </td>

      <td className="py-4 px-5">
        <select
          value={b.status}
          onChange={(e) => onUpdateStatus?.(b, e.target.value as Booking['status'])}
          className={`text-xs font-bold py-1 px-2.5 rounded-lg border cursor-pointer focus:outline-none transition-all ${
            b.status === 'confirmed'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
              : b.status === 'inquiry'
              ? 'bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700 font-extrabold shadow-sm'
              : b.status === 'completed'
              ? 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800'
              : 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
          }`}
          title="Rezervasyon durumunu anında değiştirmek için tıklayın"
        >
          <option value="confirmed">🟢 Onaylandı</option>
          <option value="inquiry">🟡 Teklif / Talep</option>
          <option value="completed">🔵 Tamamlandı</option>
          <option value="cancelled">🔴 İptal</option>
        </select>
      </td>

      <td className="py-3 px-5 text-right align-middle">
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
              title="💬 WhatsApp Şablonları & Otomatik Mesaj"
            >
              <MessageCircle className="w-3.5 h-3.5" />
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
                const reminder = generateGuestPickupReminderTurkish(b);
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
                className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                title="📄 Kurumsal Teklif / Voucher (PDF) Oluştur"
              >
                <FileText className="w-3.5 h-3.5" />
              </button>
            )}
            {onOpenWorkflow && (
              <button
                type="button"
                onClick={() => onOpenWorkflow(b)}
                className="px-2 py-1 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 hover:bg-amber-500 hover:text-slate-950 transition-colors cursor-pointer flex items-center gap-1 font-bold text-xs"
                title="⚡ Saha İş Akışı & 5 Adımlı Operasyon Yönetimi"
              >
                <Zap className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">İş Akışı</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onOpenEdit(b)}
              className="p-1.5 rounded-lg bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-brand-primary hover:text-white transition-colors cursor-pointer"
              title="✏️ Rezervasyonu Düzenle"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            {canDelete && (
              <button
                type="button"
                onClick={() => onDelete(b.id, b.customerName)}
                className="p-1.5 rounded-lg bg-slate-200/80 dark:bg-slate-800 text-slate-400 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                title="🗑️ Kalıcı Olarak Sil"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}
