/**
 * Müşteriler & Rezervasyonlar (CRM) sekmesi — AdminDashboard'tan ayrıldı.
 *
 * Filtre state'leri (arama, durum, tarih) parent'ta kalır çünkü
 * filteredBookings useMemo'su orada hesaplanıyor.
 */
import { Search, Download, Plus, Phone, ExternalLink, Ticket, MessageCircle, Edit2, Trash2 } from 'lucide-react';
import { type Booking, detectHotelZone } from '../../data/adminInitialData';

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
}: BookingsTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-surface-2 p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
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

          {/* Tarih filtresi — dateFilter state'i eskiden ölüydü (setter'ı
              hiçbir UI çağırmıyordu). Operasyonda en sık ihtiyaç duyulan
              filtre: "bugünkü turlar". */}
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              title="Tarih bazlı filtrele (çoklu tur kayıtlarında herhangi bir tur tarihi eşleşirse gösterilir)"
              className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none"
            />
            {dateFilter && (
              <button
                type="button"
                onClick={() => setDateFilter('')}
                title="Tarih filtresini temizle"
                className="px-2.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-500 hover:border-red-300 text-xs font-bold transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
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
                <th className="py-4 px-5 text-right">İşlemler</th>
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
                          <span className="font-semibold text-slate-900 dark:text-white block">{b.tourTitle}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                            📅 {b.tourDate} {b.pickupTime ? `· ⏰ ${b.pickupTime}` : ''}
                          </span>
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
                            {onQuickCollect && (
                              <button
                                type="button"
                                onClick={() => onQuickCollect(b)}
                                className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer"
                              >
                                + Tahsilat Al
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <span
                        className={`text-xs font-bold py-1 px-2.5 rounded-lg border inline-block ${
                          b.status === 'confirmed'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                            : b.status === 'inquiry'
                            ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                            : 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800'
                        }`}
                      >
                        {b.status === 'confirmed' ? '🟢 Onaylandı' : b.status === 'inquiry' ? '🟡 Teklif' : b.status}
                      </span>
                    </td>

                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`/bilet/${b.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition-colors"
                          title="Misafir Canlı Takip Portalını Aç (/bilet/[kod])"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => setVoucherBooking(b)}
                          className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 hover:bg-purple-600 hover:text-white transition-colors"
                          title="Bilet / Voucher Kuponu Aç"
                        >
                          <Ticket className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setWhatsAppModalBooking(b)}
                          className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors"
                          title="WhatsApp Şablonları & Otomatik Mesaj"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onOpenEdit(b)}
                          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-brand-primary hover:text-white transition-colors"
                          title="Düzenle"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {canDelete && (
                          <button
                            onClick={() => onDelete(b.id, b.customerName)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-red-500 hover:text-white transition-colors"
                            title="Kalıcı Olarak Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
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
