
import {
  Car,
  Hotel,
  ShieldCheck,
  Send,
  MessageCircle,
} from 'lucide-react';
import {
  type LostFoundItem,
  type LostFoundStatus,
  ITEM_TYPE_LABELS,
  STATUS_LABELS,
  generateGuestFoundWhatsApp,
  generateDriverInquiryWhatsApp,
  generateHotelDeliveryWhatsApp,
  getLostFoundWhatsAppUrl,
} from '../../../lib/lostAndFound';

export interface LostFoundItemCardProps {
  item: LostFoundItem;
  onUpdateStatus: (id: string, status: LostFoundStatus) => void;
  showToast: (msg: string) => void;
}

export function LostFoundItemCard({ item, onUpdateStatus, showToast }: LostFoundItemCardProps) {
  const itemType = ITEM_TYPE_LABELS[item.itemType] || ITEM_TYPE_LABELS.other;
  const status = STATUS_LABELS[item.status];
  const guestWhatsAppText = generateGuestFoundWhatsApp(item);
  const guestWhatsAppUrl = getLostFoundWhatsAppUrl(item.guestPhone, guestWhatsAppText);
  const hotelWhatsAppText = generateHotelDeliveryWhatsApp(item);
  const hotelWhatsAppUrl = getLostFoundWhatsAppUrl(item.guestPhone, hotelWhatsAppText);

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-surface-2/60 border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-amber-500/40 transition-all space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-start gap-3">
          <span className="text-2xl shrink-0 p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80">
            {itemType.icon}
          </span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {item.id}
              </span>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                {item.title}
              </h4>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${status.badgeClass}`}>
                {status.label}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {item.description}
            </p>
          </div>
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-1.5 self-end sm:self-center">
          <label htmlFor={`status-select-${item.id}`} className="text-[10px] uppercase font-bold text-slate-400">
            Durum:
          </label>
          <select
            id={`status-select-${item.id}`}
            value={item.status}
            onChange={(e) => onUpdateStatus(item.id, e.target.value as LostFoundStatus)}
            className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none"
          >
            <option value="found_with_driver">🚗 Şoförde / Araçta</option>
            <option value="at_central_office">🏢 Merkez Ofis Kasasında</option>
            <option value="in_transit_to_hotel">🛵 Otele Kuryede</option>
            <option value="returned_to_guest">✅ Misafire Teslim Edildi</option>
          </select>
        </div>
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
          <Car className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="truncate">
            <strong>Araç:</strong> {item.vehicleOrTour} ({item.driverOrGuideName})
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
          <Hotel className="w-3.5 h-3.5 text-sky-500 shrink-0" />
          <span className="truncate">
            <strong>Misafir:</strong> {item.guestName || 'Bilinmiyor'}
            {item.hotelName ? ` - ${item.hotelName}` : ''}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span className="truncate">
            <strong>Konum:</strong> {item.storageLocation}
          </span>
        </div>
      </div>

      {/* 1-Click Action Buttons */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {/* Guest WhatsApp Button */}
        {item.guestPhone ? (
          <a
            href={guestWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all"
            title="Misafire eşyanın bulunduğunu müjdele"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Misafire Müjde Ver (WhatsApp)</span>
          </a>
        ) : (
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(guestWhatsAppText);
              showToast('📋 Misafir bildirim mesajı panoya kopyalandı!');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 transition-all cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Mesajı Kopyala</span>
          </button>
        )}

        {/* Driver Inquiry Button */}
        <button
          type="button"
          onClick={() => {
            const thaiMsg = generateDriverInquiryWhatsApp({
              driverName: item.driverOrGuideName,
              vehicleOrTour: item.vehicleOrTour,
              missingItemDesc: item.title,
              guestName: item.guestName,
              hotelName: item.hotelName,
            });
            if (item.driverPhone) {
              const url = getLostFoundWhatsAppUrl(item.driverPhone, thaiMsg);
              window.open(url, '_blank');
            } else {
              navigator.clipboard.writeText(thaiMsg);
              showToast('🇹🇭 Tayca şoför sorgulama metni panoya kopyalandı!');
            }
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer"
          title="Şoföre Tayca ve İngilizce eşyayı sor"
        >
          <Send className="w-3.5 h-3.5" />
          <span>🇹🇭 Şoföre Tayca Sor</span>
        </button>

        {/* Hotel Delivery Confirmation Button */}
        {item.status === 'in_transit_to_hotel' && (
          <a
            href={hotelWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30 text-xs font-bold transition-all"
          >
            <Hotel className="w-3.5 h-3.5" />
            <span>Otele Teslim Edildi Bildir</span>
          </a>
        )}
      </div>
    </div>
  );
}
