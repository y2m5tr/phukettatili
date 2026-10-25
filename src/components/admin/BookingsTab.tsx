import { useState, useMemo } from 'react';
import type { Booking } from '../../data/adminInitialData';
import BulkDispatchModal from './BulkDispatchModal';
import { buildDailyPickups } from '../../lib/adminFilters';
import { BookingsFilterBar } from './bookings/BookingsFilterBar';
import { BookingTableRow } from './bookings/BookingTableRow';

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
  pendingBookingIds?: Set<string>;
  allBookings?: Booking[];
  showToast?: (msg: string) => void;
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
  pendingBookingIds,
  allBookings,
  showToast,
}: BookingsTabProps) {
  const [isBulkDispatchOpen, setIsBulkDispatchOpen] = useState(false);
  const [selectedDispatchDate, setSelectedDispatchDate] = useState('');

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const allBookingsSource = allBookings || filteredBookings;
  const tomorrowPickups = useMemo(() => {
    return buildDailyPickups(allBookingsSource, tomorrowStr);
  }, [allBookingsSource, tomorrowStr]);

  const currentFilterPickups = useMemo(() => {
    if (!dateFilter) return [];
    return buildDailyPickups(allBookingsSource, dateFilter);
  }, [allBookingsSource, dateFilter]);

  const activeDispatchPickups = useMemo(() => {
    const date = selectedDispatchDate || dateFilter || tomorrowStr;
    return buildDailyPickups(allBookingsSource, date);
  }, [allBookingsSource, selectedDispatchDate, dateFilter, tomorrowStr]);

  const handleOpenBulkDispatch = (date: string) => {
    setSelectedDispatchDate(date);
    setIsBulkDispatchOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Üst Filtre Barı */}
      <BookingsFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        todayStr={todayStr}
        tomorrowStr={tomorrowStr}
        tomorrowPickups={tomorrowPickups}
        currentFilterPickups={currentFilterPickups}
        onOpenBulkDispatch={handleOpenBulkDispatch}
        onOpenDietaryManifest={onOpenDietaryManifest}
        onOpenFieldCashier={onOpenFieldCashier}
        onExportCSV={onExportCSV}
        onOpenCreate={onOpenCreate}
      />

      {/* Rezervasyon Listesi Tablosu */}
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
                  <BookingTableRow
                    key={b.id}
                    booking={b}
                    pendingBookingIds={pendingBookingIds}
                    canDelete={canDelete}
                    googleReviewUrl={googleReviewUrl}
                    onOpenEdit={onOpenEdit}
                    onDelete={onDelete}
                    setVoucherBooking={setVoucherBooking}
                    setWhatsAppModalBooking={setWhatsAppModalBooking}
                    onQuickCollect={onQuickCollect}
                    onOpenQuotePdf={onOpenQuotePdf}
                    onOpenFieldCashier={onOpenFieldCashier}
                    onOpenFlightRadar={onOpenFlightRadar}
                    onOpenWelcomeBoard={onOpenWelcomeBoard}
                    onOpenTourMedia={onOpenTourMedia}
                    onUpdateStatus={onUpdateStatus}
                    onOpenSupplierDispatch={onOpenSupplierDispatch}
                    onOpenPromptPayQr={onOpenPromptPayQr}
                    onOpenWorkflow={onOpenWorkflow}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isBulkDispatchOpen && (
        <BulkDispatchModal
          pickups={activeDispatchPickups}
          manifestDate={selectedDispatchDate || dateFilter || tomorrowStr}
          onClose={() => setIsBulkDispatchOpen(false)}
          showToast={showToast || ((m: string) => alert(m))}
        />
      )}
    </div>
  );
}
