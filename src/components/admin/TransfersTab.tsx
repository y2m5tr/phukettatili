/**
 * Günlük Transfer & Şoför Dağıtım Listesi sekmesi — AdminDashboard'tan ayrıldı.
 *
 * manifestDate state'i AdminDashboard'ta kalır (diğer görünüm ve
 * filtrelerle paylaşılıyor). dailyPickups türetimi bura taşındı;
 * sıralama ve özet hesapları bileşen içinde yapılır.
 */
import { Car, Copy, Navigation, ShieldCheck, MapPin, Phone, MessageCircle, ExternalLink, Ticket } from 'lucide-react';
import { detectHotelZone } from '../../data/adminInitialData';
import { generateMultiStopMapUrl, getSingleHotelMapUrl, detectDeparturePier } from '../../lib/maps';
import type { Booking, VehicleItem, DriverItem } from '../../data/adminInitialData';

interface TransfersTabProps {
  bookings: Booking[];
  manifestDate: string;
  setManifestDate: (d: string) => void;
  vehicles: VehicleItem[];
  drivers: DriverItem[];
  /** Toast gösterici — AdminDashboard ile aynı davranış. */
  showToast: (msg: string) => void;
  handleAssignVehicleToBooking: (bookingId: string, tourIndex: number, vehicle: string) => void;
  handleAssignDriverToBooking: (bookingId: string, tourIndex: number, driverId: string) => void;
  setWhatsAppModalBooking: (b: Booking) => void;
  setVoucherBooking: (b: Booking) => void;
  onOpenPoliceManifest: () => void;
}

interface PickupItem {
  bookingId: string;
  customerName: string;
  phone: string;
  hotel: string;
  roomNumber?: string;
  tourTitle: string;
  pickupTime: string;
  adultCount: number;
  childCount: number;
  remainingAmountThb: number;
  specialNotes?: string;
  supplier?: string;
  status: string;
  assignedVehicle?: string;
  assignedDriver?: string;
  hotelZone: string;
  tourIndex: number;
}

export default function TransfersTab({
  bookings,
  manifestDate,
  setManifestDate,
  vehicles,
  drivers,
  showToast,
  handleAssignVehicleToBooking,
  handleAssignDriverToBooking,
  setWhatsAppModalBooking,
  setVoucherBooking,
  onOpenPoliceManifest,
}: TransfersTabProps) {
  // Flatten all scheduled tour pickups for the chosen date
  const dailyPickups: PickupItem[] = [];
  bookings.forEach((b) => {
    if (b.status === 'cancelled') return;

    if (b.tours && b.tours.length > 0) {
      b.tours.forEach((t, tIdx) => {
        if (t.tourDate === manifestDate) {
          dailyPickups.push({
            bookingId: b.id,
            customerName: b.customerName,
            phone: b.phone,
            hotel: b.hotel,
            roomNumber: b.roomNumber,
            tourTitle: t.tourTitle,
            pickupTime: t.pickupTime || '07:30',
            adultCount: b.adultCount,
            childCount: b.childCount,
            remainingAmountThb: b.remainingAmountThb,
            specialNotes: b.specialNotes,
            supplier: t.supplier || b.supplier,
            status: b.status,
            assignedVehicle: t.assignedVehicle || b.assignedVehicle || 'Atanmadı',
            assignedDriver: t.assignedDriver || b.assignedDriver,
            hotelZone: b.hotelZone || t.hotelZone || detectHotelZone(b.hotel),
            tourIndex: tIdx,
          });
        }
      });
    } else if (b.tourDate === manifestDate) {
      dailyPickups.push({
        bookingId: b.id,
        customerName: b.customerName,
        phone: b.phone,
        hotel: b.hotel,
        roomNumber: b.roomNumber,
        tourTitle: b.tourTitle,
        pickupTime: b.pickupTime || '07:30',
        adultCount: b.adultCount,
        childCount: b.childCount,
        remainingAmountThb: b.remainingAmountThb,
        specialNotes: b.specialNotes,
        supplier: b.supplier,
        status: b.status,
        assignedVehicle: b.assignedVehicle || 'Atanmadı',
        assignedDriver: b.assignedDriver,
        hotelZone: b.hotelZone || detectHotelZone(b.hotel),
        tourIndex: -1,
      });
    }
  });

  // Sort pickups chronologically by pickupTime
  dailyPickups.sort((a, b) => a.pickupTime.localeCompare(b.pickupTime));

  const totalDailyPassengers = dailyPickups.reduce(
    (acc, p) => acc + p.adultCount + p.childCount,
    0
  );

  // Generate clipboard text for drivers / suppliers
  const handleCopyManifest = () => {
    if (dailyPickups.length === 0) {
      showToast('Seçilen tarihte transfer kaydı bulunmuyor.');
      return;
    }
    const dateStr = new Date(manifestDate).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const textLines = [
      `🚐 *PHUKET TATİLİ - GÜNLÜK TRANSFER & OPERASYON LİSTESİ*`,
      `📅 *Tarih:* ${dateStr}`,
      `👥 *Toplam Yolcu:* ${totalDailyPassengers} Kişi (${dailyPickups.length} Transfer)`,
      `───────────────────────────────`,
      ...dailyPickups.map((p, idx) => {
        const guests = `${p.adultCount} Yetişkin${p.childCount > 0 ? ` + ${p.childCount} Çocuk` : ''}`;
        const remainingText =
          p.remainingAmountThb > 0
            ? ` ⚠️ Tahsil Edilecek: *${p.remainingAmountThb.toLocaleString()} THB*`
            : ` ✅ Ödendi`;
        return (
          `${idx + 1}️⃣ ⏰ *${p.pickupTime}* — *${p.hotel}* ${p.roomNumber ? `(Oda: ${p.roomNumber})` : ''}\n` +
          `   👤 Misafir: *${p.customerName}* (${guests})\n` +
          `   📞 Tel: ${p.phone}\n` +
          `   🏝️ Tur: *${p.tourTitle}*` +
          (p.supplier ? ` [${p.supplier}]` : '') +
          `\n   💰 Durum:${remainingText}` +
          (p.specialNotes ? `\n   📝 Not: ${p.specialNotes}` : '') +
          `\n`
        );
      }),
      `───────────────────────────────`,
      `🇹🇭 Phuket Tatili Operasyon Merkezi`,
    ];

    navigator.clipboard.writeText(textLines.join('\n'));
    showToast('Transfer listesi WhatsApp için panoya kopyalandı! 📋');
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white dark:bg-surface-2 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
              <Car className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
              Günlük Transfer & Şoför Dağıtım Listesi
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Şoförlere ve yerel transfer firmalarına iletilecek saat sıralı alınış listesi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Date Shortcuts */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setManifestDate(new Date().toISOString().split('T')[0])}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                manifestDate === new Date().toISOString().split('T')[0]
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Bugün
            </button>
            <button
              type="button"
              onClick={() => {
                const d = new Date();
                d.setDate(d.getDate() + 1);
                setManifestDate(d.toISOString().split('T')[0]);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900"
            >
              Yarın
            </button>
          </div>

          {/* Date Input */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={manifestDate}
              onChange={(e) => setManifestDate(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleCopyManifest}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
          >
            <Copy className="w-4 h-4" />
            <span>Şoför İçin Kopyala</span>
          </button>

          {dailyPickups.length > 0 && (
            <a
              href={generateMultiStopMapUrl(
                dailyPickups.map((p) => p.hotel),
                detectDeparturePier(dailyPickups[0]?.tourTitle)
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-sky-600/20 flex items-center gap-1.5 transition-all"
              title="Günün tüm otellerini ardışık Google Maps rotası olarak aç"
            >
              <Navigation className="w-4 h-4" />
              <span>🗺️ Çoklu Rota (Maps)</span>
            </a>
          )}

          <button
            type="button"
            onClick={onOpenPoliceManifest}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
            title="Tayland Deniz Polisi & Millî Park Yolcu Manifestosu"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>🛂 Deniz Polisi Manifestosu</span>
          </button>
        </div>
      </div>

      {/* Summary Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-surface-2 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-bold uppercase text-slate-400 block">Seçilen Tarih</span>
          <span className="text-base font-bold text-slate-900 dark:text-white mt-0.5 block">
            {new Date(manifestDate).toLocaleDateString('tr-TR', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>

        <div className="bg-white dark:bg-surface-2 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-bold uppercase text-slate-400 block">Transfer Sayısı</span>
          <span className="text-base font-bold text-emerald-600 mt-0.5 block">
            {dailyPickups.length} Araç Alınışı
          </span>
        </div>

        <div className="bg-white dark:bg-surface-2 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-bold uppercase text-slate-400 block">Taşınacak Yolcu</span>
          <span className="text-base font-bold text-purple-600 mt-0.5 block">
            {totalDailyPassengers} Misafir
          </span>
        </div>

        <div className="bg-white dark:bg-surface-2 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-bold uppercase text-slate-400 block">Sahada Kalan Tahsilat</span>
          <span className="text-base font-bold text-amber-600 mt-0.5 block">
            {dailyPickups
              .reduce((acc, p) => acc + p.remainingAmountThb, 0)
              .toLocaleString()}{' '}
            THB
          </span>
        </div>
      </div>

      {/* Manifest Table */}
      <div className="bg-white dark:bg-surface-2 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200/80 dark:border-slate-800 uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-4 px-5">⏰ Alınış Saati</th>
                <th className="py-4 px-5">📍 Otel & Oda</th>
                <th className="py-4 px-5">🚐 Hat & Minibüs</th>
                <th className="py-4 px-5">🧑‍✈️ Şoför / Rehber</th>
                <th className="py-4 px-5">👤 Misafir & Telefon</th>
                <th className="py-4 px-5">👥 Kişi</th>
                <th className="py-4 px-5">🏝️ Tur & Tedarikçi</th>
                <th className="py-4 px-5">💰 Tahsilat Durumu</th>
                <th className="py-4 px-5 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {dailyPickups.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center text-slate-400">
                    <Car className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                    <p className="font-semibold text-slate-600 dark:text-slate-400">
                      Bu tarihte planlanmış herhangi bir transfer veya tur bulunamadı.
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Yukarıdan başka bir tarih seçebilir veya rezervasyon ekleyebilirsiniz.
                    </p>
                  </td>
                </tr>
              ) : (
                dailyPickups.map((p, idx) => (
                  <tr
                    key={`${p.bookingId}-${idx}`}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-900/30 transition-colors"
                  >
                    <td className="py-4 px-5 font-mono text-sm font-extrabold text-brand-primary dark:text-brand-accent">
                      ⏰ {p.pickupTime}
                    </td>

                    <td className="py-4 px-5">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {p.hotel}
                      </span>
                      {p.roomNumber && (
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          Oda: {p.roomNumber}
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-5">
                      <select
                        value={p.assignedVehicle || 'Atanmadı'}
                        onChange={(e) =>
                          handleAssignVehicleToBooking(
                            p.bookingId,
                            p.tourIndex,
                            e.target.value
                          )
                        }
                        className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-accent max-w-[190px]"
                      >
                        <option value="Atanmadı">Hat Atanmadı</option>
                        {vehicles.filter((v) => v.active).map((v) => (
                          <option key={v.id} value={v.label}>
                            {v.kind === 'vip' ? '⭐' : v.kind === 'speedboat' ? '🚤' : '🚐'} {v.label}
                          </option>
                        ))}
                        {p.assignedVehicle &&
                          p.assignedVehicle !== 'Atanmadı' &&
                          !vehicles.some((v) => v.label === p.assignedVehicle) && (
                            <option value={p.assignedVehicle}>{p.assignedVehicle}</option>
                          )}
                      </select>
                      <div className="text-[10px] text-sky-500 font-semibold mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{p.hotelZone}</span>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <select
                        value={p.assignedDriver || ''}
                        onChange={(e) =>
                          handleAssignDriverToBooking(
                            p.bookingId,
                            p.tourIndex,
                            e.target.value
                          )
                        }
                        className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-accent max-w-[170px]"
                      >
                        <option value="">Görevli Atanmadı</option>
                        {drivers.filter((d) => d.active).map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.role === 'guide' ? '🗣️' : d.role === 'both' ? '⭐' : '🚐'} {d.fullName}
                          </option>
                        ))}
                        {p.assignedDriver &&
                          !drivers.some((d) => d.id === p.assignedDriver) && (
                            <option value={p.assignedDriver}>{p.assignedDriver}</option>
                          )}
                      </select>
                      {(() => {
                        const d = drivers.find((drv) => drv.id === p.assignedDriver);
                        return d?.phone ? (
                          <a
                            href={`https://wa.me/${d.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-emerald-600 hover:underline block mt-1"
                          >
                            📞 {d.phone}
                          </a>
                        ) : null;
                      })()}
                    </td>

                    <td className="py-4 px-5">
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        {p.customerName}
                      </span>
                      <a
                        href={`https://wa.me/${p.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-emerald-600 hover:underline inline-flex items-center gap-1 mt-0.5"
                      >
                        <Phone className="w-3 h-3" /> {p.phone}
                      </a>
                    </td>

                    <td className="py-4 px-5">
                      <span className="font-bold">{p.adultCount} Yetişkin</span>
                      {p.childCount > 0 && (
                        <span className="text-xs text-slate-500 block">
                          +{p.childCount} Çocuk
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-5">
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        {p.tourTitle}
                      </span>
                      {p.supplier && (
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          Tedarikçi: {p.supplier}
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-5">
                      {p.remainingAmountThb > 0 ? (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 inline-block">
                          Alınacak: {p.remainingAmountThb.toLocaleString()} THB
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 inline-block">
                          ✓ Tamamı Ödendi
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={getSingleHotelMapUrl(p.hotel)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 hover:bg-sky-600 hover:text-white transition-colors"
                          title="Otele Google Harita Navigasyonu Aç"
                        >
                          <Navigation className="w-4 h-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            const target = bookings.find((b) => b.id === p.bookingId);
                            if (target) setWhatsAppModalBooking(target);
                          }}
                          className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors"
                          title="WhatsApp Şablonları & Hazır Mesajlar"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        <a
                          href={`/bilet/${p.bookingId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition-colors"
                          title="Misafir Canlı Takip Portalını Aç (/bilet/[kod])"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            const target = bookings.find((b) => b.id === p.bookingId);
                            if (target) setVoucherBooking(target);
                          }}
                          className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 hover:bg-purple-600 hover:text-white transition-colors"
                          title="Bilet / Voucher Kuponu Aç"
                        >
                          <Ticket className="w-4 h-4" />
                        </button>
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
