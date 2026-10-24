import React from 'react';
import {
  Clock,
  CheckCircle2,
  MapPin,
  Bus,
  DollarSign,
  Check,
  CreditCard,
  AlertTriangle,
  Navigation,
  Phone,
  MessageCircle,
  Ticket,
  RefreshCw,
} from 'lucide-react';
import { fmtMoney } from '../../lib/moneyFormat';
import { getSingleHotelMapUrl } from '../../lib/maps';
import type { FieldScheduleItem } from './fieldTypes';
import type { Booking } from '../../data/adminInitialData';

export interface FieldScheduleCardProps {
  item: FieldScheduleItem;
  isDriverOnly: boolean;
  onOpenCashModal: (item: FieldScheduleItem) => void;
  onOpenWhatsAppModal: (booking: Booking) => void;
  onOpenBoardingPass: (booking: Booking, tourIndex: number) => void;
  onSetPickupStatus: (
    item: FieldScheduleItem,
    status: 'pending' | 'picked_up' | 'on_tour' | 'completed' | 'no_show'
  ) => void;
}

export function FieldScheduleCard({
  item,
  isDriverOnly,
  onOpenCashModal,
  onOpenWhatsAppModal,
  onOpenBoardingPass,
  onSetPickupStatus,
}: FieldScheduleCardProps) {
  const isPickedUp = item.pickupStatus === 'picked_up' || item.pickupStatus === 'completed';
  const isNoShow = item.pickupStatus === 'no_show';
  const hasBalance = item.remainingAmountThb > 0;

  return (
    <div
      className={`rounded-3xl border transition-all overflow-hidden ${
        isPickedUp
          ? 'bg-slate-900/60 border-emerald-500/40 shadow-emerald-500/5'
          : isNoShow
          ? 'bg-rose-950/20 border-rose-500/40'
          : 'bg-slate-900/90 border-slate-800 shadow-lg'
      }`}
    >
      {/* Kart Üst Bilgisi: Saat + Otel + Durum Rozeti */}
      <div className="p-4 pb-3 border-b border-slate-800/60">
        <div className="flex items-start justify-between gap-2">
          {/* Alınış Saati */}
          <div className="flex items-center gap-2">
            <div
              className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 ${
                isPickedUp
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{item.pickupTime}</span>
            </div>

            {/* Tur Başlığı */}
            <div className="text-xs font-medium text-slate-300 truncate max-w-[190px]">
              {item.tourTitle}
            </div>
          </div>

          {/* Durum Rozeti */}
          <div>
            {isPickedUp ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>{item.pickedUpAt ? `Alındı (${item.pickedUpAt})` : 'Alındı'}</span>
              </span>
            ) : isNoShow ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                No-Show
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-amber-500/20">
                Bekleniyor
              </span>
            )}
          </div>
        </div>

        {/* Misafir Adı & Kişi Sayısı */}
        <div className="mt-2.5 flex items-baseline justify-between">
          <h3 className="text-base font-bold text-white tracking-tight">
            {item.customerName}
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            {item.adultCount} Yetişkin{item.childCount > 0 ? `, ${item.childCount} Ç` : ''}
          </span>
        </div>

        {/* Otel & Oda No */}
        <div className="mt-1 flex items-center gap-1.5 text-xs text-amber-300/90 font-medium">
          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate">{item.hotel}</span>
          {item.roomNumber && (
            <span className="shrink-0 text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded-md text-[10px]">
              Oda: {item.roomNumber}
            </span>
          )}
        </div>

        {/* Hat / Minibüs & Bölge */}
        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-sky-400 font-medium">
          <Bus className="w-3 h-3 text-sky-400 shrink-0" />
          <span className="font-semibold">{item.assignedVehicle !== 'Atanmadı' ? item.assignedVehicle : 'Hat Atanmadı'}</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">{item.hotelZone}</span>
        </div>
      </div>

      {/* Finansal Durum & Millî Park Hatırlatması */}
      <div className="px-4 py-2.5 bg-slate-950/40 border-b border-slate-800/40 flex items-center justify-between text-xs">
        <div>
          {hasBalance ? (
            <div className="flex items-center gap-1.5">
              <span className="text-rose-400 font-bold flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" />
                Kalan: {fmtMoney(item.remainingAmountThb)} THB
              </span>
              <span className="text-[10px] text-slate-500">
                ({item.paidAmountThb > 0 ? `${fmtMoney(item.paidAmountThb)} ฿ ödendi` : 'kapora yok'})
              </span>
            </div>
          ) : (
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              Tamamı Ödendi ({fmtMoney(item.totalPriceThb)} THB)
            </span>
          )}
        </div>

        {/* Hızlı Tahsilat Butonu */}
        {hasBalance && !isDriverOnly && (
          <button
            onClick={() => onOpenCashModal(item)}
            className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-[11px] active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
          >
            <CreditCard className="w-3 h-3" />
            <span>Tahsil Et</span>
          </button>
        )}
      </div>

      {/* Özel Not & Millî Park Uyarısı */}
      {(item.specialNotes || !item.nationalParkFeeIncluded) && (
        <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800/40 space-y-1 text-[11px]">
          {!item.nationalParkFeeIncluded && (
            <div className="text-amber-400 flex items-center gap-1 font-medium">
              <AlertTriangle className="w-3 h-3 shrink-0" />
              <span>Millî Park Hariç (Kişi başı 400 THB nakit alınacak)</span>
            </div>
          )}
          {item.specialNotes && (
            <div className="text-slate-400 italic">
              💬 Not: {item.specialNotes}
            </div>
          )}
        </div>
      )}

      {/* BUTONLAR & SAHA AKSİYONLARI */}
      <div className="p-3 bg-slate-950/80 flex items-center gap-2">
        {/* Harita */}
        <a
          href={getSingleHotelMapUrl(item.hotel)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Google Maps'te Aç"
          className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
        >
          <Navigation className="w-3.5 h-3.5 text-sky-400" />
          <span>Harita</span>
        </a>

        {/* Telefon */}
        <a
          href={`tel:${item.phone.replace(/[^0-9+]/g, '')}`}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-emerald-400 font-semibold text-xs flex items-center justify-center active:scale-95 transition-all"
          title="Telefonla Ara"
        >
          <Phone className="w-3.5 h-3.5 text-emerald-400" />
        </a>

        {/* WhatsApp Şablonları */}
        <button
          type="button"
          onClick={() => onOpenWhatsAppModal(item.fullBooking)}
          className="px-2.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-emerald-400 font-semibold text-xs flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
          title="WhatsApp Şablonları & Hazır Mesaj Motoru"
        >
          <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>Şablonlar</span>
        </button>

        {/* Biniş Kartı & QR Voucher */}
        <button
          type="button"
          onClick={() =>
            onOpenBoardingPass(
              item.fullBooking,
              item.tourIndex >= 0 ? item.tourIndex : 0
            )
          }
          title="Biniş Kartı & QR Kod"
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-400 font-semibold text-xs flex items-center justify-center active:scale-95 transition-all cursor-pointer"
        >
          <Ticket className="w-4 h-4" />
        </button>

        {/* Alındı Yoklama Butonu */}
        {!isPickedUp ? (
          <button
            onClick={() => onSetPickupStatus(item, 'picked_up')}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Alındı</span>
          </button>
        ) : (
          <button
            onClick={() => onSetPickupStatus(item, 'pending')}
            title="Geri al"
            className="px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 text-xs active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
