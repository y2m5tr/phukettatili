/**
 * Müşteriler & Rezervasyonlar (CRM) sekmesi — AdminDashboard'tan ayrıldı.
 *
 * Filtre state'leri (arama, durum, tarih) parent'ta kalır çünkü
 * filteredBookings useMemo'su orada hesaplanıyor.
 */
import { useMemo } from 'react';
import { Search, Download, Plus, Phone, ExternalLink, Ticket, MessageCircle, Edit2, Trash2, Ship, FileText, Star, Gift, ShieldAlert, Coins, Compass, ShieldCheck, Plane, Building, QrCode, Luggage, Zap, } from 'lucide-react';
import { type Booking, detectHotelZone, getPhuketSeason } from '../../data/adminInitialData';
import { isTourEligibleForReview, getGoogleReviewWhatsAppUrl } from '../../lib/reviewBooster';
import { getCrossSellWhatsAppUrl } from '../../lib/crossSell';
import { analyzeBookingDietaryAndMedical, DIETARY_CATEGORIES } from '../../lib/dietaryManifest';
import { generateDriverPickupJobThai, generateGuestPickupReminderTurkish } from '../../lib/whatsappEngine';

interface BookingsTabProps {
  /** Arama + durum + tarih filtresinden geçmiş liste. */
  filteredBookings: Booking[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  dateFilter: string;
  setDateFilter: (d: string) => void;
  onExportCSV: () => void;
  onOpenCreate: () => void;
  onOpenEdit: (b: Booking) => void;
  onDelete: (id: string, customerName: string) => void;
  canDelete?: boolean;
  setVoucherBooking: (b: Booking) => void;
  setWhatsAppModalBooking: (b: Booking) => void;
  onQuickCollect?: (b: Booking) => void;
  onOpenQuotePdf?: (b: Booking) => void;
  googleReviewUrl?: string;
  onOpenDietaryManifest?: () => void;
  onOpenFieldCashier?: (b?: Booking) => void;
  onOpenFlightRadar?: (flight?: string, guestName?: string) => void;
  onOpenWelcomeBoard?: (b: Booking) => void;
  onOpenTourMedia?: (b: Booking) => void;
  onUpdateStatus?: (b: Booking, status: Booking['status']) => void;
  onOpenSupplierDispatch?: (b: Booking) => void;
  onOpenPromptPayQr?: (b: Booking) => void;
  onOpenWorkflow?: (b: Booking) => void;
}

export default function BookingsTab({
  filteredBookings,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  dateFilter,
  setDateFilter,
  onExportCSV,
  onOpenCreate,
  onOpenEdit,
  onDelete,
  canDelete = true,
  setVoucherBooking,
  setWhatsAppModalBooking,
  onQuickCollect,
  onOpenQuotePdf,
  googleReviewUrl,
  onOpenDietaryManifest,
  onOpenFieldCashier,
  onOpenFlightRadar,
  onOpenWelcomeBoard,
  onOpenTourMedia,
  onUpdateStatus,
  onOpenSupplierDispatch,
  onOpenPromptPayQr,
  onOpenWorkflow,
}: BookingsTabProps) {
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-surface-2 p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-2.5 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Müşteri adı, otel, telefon veya tur ara..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="confirmed">🟢 Onaylananlar</option>
            <option value="inquiry">🟡 Teklif / Bekleyen</option>
            <option value="completed">🔵 Tamamlananlar</option>
            <option value="cancelled">🔴 İptaller</option>
          </select>

          {/* Hızlı Tarih Kısayolları (Chips) */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setDateFilter('')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                !dateFilter
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Tümü
            </button>
            <button
              type="button"
              onClick={() => setDateFilter(todayStr)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                dateFilter === todayStr
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>⚡ Bugün</span>
            </button>
            <button
              type="button"
              onClick={() => setDateFilter(tomorrowStr)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                dateFilter === tomorrowStr
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>🌅 Yarın</span>
            </button>
          </div>

          {/* Tarih Takvim Kutusu */}
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              title="Tarih bazlı filtrele (çoklu tur kayıtlarında herhangi bir tur tarihi eşleşirse gösterilir)"
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none"
            />
            {dateFilter && (
              <button
                type="button"
                onClick={() => setDateFilter('')}
                title="Tarih filtresini temizle"
                className="px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-500 hover:border-red-300 text-xs font-bold transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onOpenDietaryManifest && (
            <button
              type="button"
              onClick={onOpenDietaryManifest}
              className="px-3.5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Misafir Diyet & Medikal Emniyet Manifestosu"
            >
              <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>Diyet & Medikal</span>
            </button>
          )}

          {onOpenFieldCashier && (
            <button
              type="button"
              onClick={() => onOpenFieldCashier()}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Saha Çoklu Döviz & Para Üstü Kasa Hesaplayıcı"
            >
              <Coins className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Saha Döviz Kasa</span>
            </button>
          )}

          <button
            onClick={onExportCSV}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Dışa Aktar (CSV)</span>
          </button>
          <button
            onClick={onOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-bold shadow-md shadow-brand-primary/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Ekle</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-surface-2 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200/80 dark:border-slate-800 uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-4 px-5">ID / Müşteri</th>
                <th className="py-4 px-5">Otel, Bölge & Oda</th>
                <th className="py-4 px-5">Tur & Tarih</th>
                <th className="py-4 px-5">Kişi</th>
                <th className="py-4 px-5">Fiyat / Tahsilat</th>
                <th className="py-4 px-5">Durum</th>
                <th className="py-4 px-5 text-right whitespace-nowrap">İşlemler (Portallar / Yönetim)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Eşleşen rezervasyon kaydı bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="py-4 px-5">
                      <span className="font-mono text-[10px] text-slate-400 block">{b.id}</span>
                      <span className="font-bold text-slate-900 dark:text-white block">{b.customerName}</span>
                      <a
                        href={`https://wa.me/${b.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 mt-0.5"
                      >
                        <Phone className="w-3 h-3" /> {b.phone}
                      </a>
                      {(() => {
                        const alert = analyzeBookingDietaryAndMedical(b);
                        if (!alert || alert.categories.length === 0) return null;
                        return (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {alert.categories.map((c) => {
                              const meta = DIETARY_CATEGORIES[c];
                              return (
                                <span
                                  key={c}
                                  className={`px-1.5 py-0.2 rounded text-[9px] font-bold flex items-center gap-0.5 ${meta.badgeClass}`}
                                  title={alert.safetyInstructions.join('; ')}
                                >
                                  <span>{meta.icon}</span>
                                  <span>{meta.shortLabel}</span>
                                </span>
                              );
                            })}
                          </div>
                        );
                      })()}
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
                                📅 {t.tourDate} {t.pickupTime ? `· ⏰ ${t.pickupTime}` : ''} {t.priceThb ? `· ${t.priceThb.toLocaleString()} THB` : ''}
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
                        {b.totalPriceThb.toLocaleString()} THB
                      </div>
                      <div className="text-xs mt-0.5">
                        {b.remainingAmountThb === 0 ? (
                          <span className="text-emerald-600 font-semibold">✓ Tamamı Ödendi</span>
                        ) : (
                          <div className="flex flex-col items-start gap-1">
                            <span className="text-amber-600 font-semibold">
                              Kalan: {b.remainingAmountThb.toLocaleString()} THB
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
