
import {
  Phone,
  Ship,
  Coins,
  QrCode,
  Luggage,
  CheckCircle2,
} from 'lucide-react';
import { type Booking, detectHotelZone, getPhuketSeason } from '../../../data/adminInitialData';
import { analyzeBookingDietaryAndMedical, DIETARY_CATEGORIES } from '../../../lib/dietaryManifest';
import { fmtMoney } from '../../../lib/moneyFormat';
import { BookingRowActions } from './BookingRowActions';

export interface BookingTableRowProps {
  booking: Booking;
  isSalesView?: boolean;
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
  isSalesView = false,
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
        <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
          <a
            href={`https://wa.me/${b.phone.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
          >
            <Phone className="w-3 h-3" /> {b.phone}
          </a>
          {b.lineId && (
            <a
              href={`https://line.me/R/ti/p/~${b.lineId.replace(/^@/, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-bold text-[#06C755] bg-[#06C755]/10 px-1.5 py-0.2 rounded hover:underline inline-flex items-center gap-0.5"
              title={`LINE: ${b.lineId}`}
            >
              LINE: {b.lineId}
            </a>
          )}
        </div>
        {b.salesRep && (
          <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold block mt-0.5">
            💼 Temsilci: {b.salesRep}
          </span>
        )}
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
        <BookingRowActions
          booking={b}
          isSalesView={isSalesView}
          canDelete={canDelete}
          googleReviewUrl={googleReviewUrl}
          onOpenEdit={onOpenEdit}
          onDelete={onDelete}
          setVoucherBooking={setVoucherBooking}
          setWhatsAppModalBooking={setWhatsAppModalBooking}
          onOpenQuotePdf={onOpenQuotePdf}
          onOpenFlightRadar={onOpenFlightRadar}
          onOpenWelcomeBoard={onOpenWelcomeBoard}
          onOpenTourMedia={onOpenTourMedia}
          onOpenSupplierDispatch={onOpenSupplierDispatch}
          onOpenWorkflow={onOpenWorkflow}
        />
      </td>
    </tr>
  );
}
