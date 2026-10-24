import { useState, useMemo } from 'react';
import {
  X,
  Plane,
  Send,
  MessageCircle,
  AlertTriangle,
  CheckCircle2,
  Car,
  User,
} from 'lucide-react';
import {
  type FlightInfo,
  getFlightStatusInfo,
  normalizeFlightNumber,
  generateDriverFlightDelayWhatsApp,
  generateGuestLandingWelcomeWhatsApp,
  getFlightWhatsAppUrl,
  HKT_COMMON_FLIGHTS,
} from '../../lib/flightRadar';
import type { Booking } from '../../data/adminInitialData';

interface FlightRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings?: Booking[];
  initialFlight?: string;
  initialGuestName?: string;
  showToast: (msg: string) => void;
}

export default function FlightRadarModal({
  isOpen,
  onClose,
  bookings = [],
  initialFlight = 'TK 172',
  initialGuestName = 'Ahmet Yılmaz',
  showToast,
}: FlightRadarModalProps) {
  const [flightInput, setFlightInput] = useState<string>(initialFlight);
  const [delayMinutes, setDelayMinutes] = useState<number>(35);
  const [guestName, setGuestName] = useState<string>(initialGuestName);
  const [guestPhone, setGuestPhone] = useState<string>('+905321112233');
  const [driverName, setDriverName] = useState<string>('Somchai Prasert');
  const [driverPhone, setDriverPhone] = useState<string>('+66812345678');
  // Araç plakası bu modaldan düzenlenmiyor; WhatsApp metinlerinde sabit kullanılır.
  const vehicleCode = 'VIP Van Toyota Commuter 35-1249';
  const [hotelName, setHotelName] = useState<string>('Amari Phuket Patong');

  const flightInfo: FlightInfo = useMemo(() => {
    return getFlightStatusInfo(flightInput, delayMinutes);
  }, [flightInput, delayMinutes]);

  const driverWhatsAppText = useMemo(() => {
    return generateDriverFlightDelayWhatsApp({
      flight: flightInfo,
      driverName,
      guestName,
      vehicleCode,
    });
  }, [flightInfo, driverName, guestName, vehicleCode]);

  const guestWelcomeWhatsAppText = useMemo(() => {
    return generateGuestLandingWelcomeWhatsApp({
      flight: flightInfo,
      guestName,
      driverName,
      driverPhone,
      vehiclePlate: vehicleCode,
      hotelName,
    });
  }, [flightInfo, guestName, driverName, driverPhone, vehicleCode, hotelName]);

  const driverWhatsAppUrl = useMemo(() => {
    return getFlightWhatsAppUrl(driverPhone, driverWhatsAppText);
  }, [driverPhone, driverWhatsAppText]);

  const guestWhatsAppUrl = useMemo(() => {
    return getFlightWhatsAppUrl(guestPhone, guestWelcomeWhatsAppText);
  }, [guestPhone, guestWelcomeWhatsAppText]);

  const handleSelectBooking = (bId: string) => {
    const b = bookings.find((item) => item.id === bId);
    if (b) {
      setGuestName(b.customerName);
      setGuestPhone(b.phone);
      setHotelName(b.hotel);
      // Search flight in special notes or tourTitle
      const match = (b.specialNotes || '').match(/(TK|EK|QR|TG|SU|FD)\s*([0-9]{3,4})/i);
      if (match) {
        setFlightInput(`${match[1].toUpperCase()} ${match[2]}`);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-surface-1 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-sky-50/50 dark:bg-sky-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 flex items-center justify-center font-bold">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Phuket Havalimanı Canlı Uçuş Radarı & Rötar Kalkanı
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-sky-600 text-white uppercase tracking-wider">
                  HKT Flight Sentinel
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Gelen uçak takibi, rötar uyarısı ve şoför/misafir karşılama koordinasyonu
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* Booking Picker (Optional) */}
          {bookings.length > 0 && (
            <div>
              <label htmlFor="flight-booking-select" className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Gelen Misafir Rezervasyonundan Seç (Opsiyonel)
              </label>
              <select
                id="flight-booking-select"
                onChange={(e) => handleSelectBooking(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="">-- Misafir Seçiniz --</option>
                {bookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.customerName} - {b.hotel} ({b.tourTitle})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Flight Search and Quick Chips */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Uçuş Numarası
                </label>
                <div className="relative">
                  <Plane className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={flightInput}
                    onChange={(e) => setFlightInput(e.target.value)}
                    placeholder="Örn: TK 172, EK 396, QR 840"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-black text-sm uppercase text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Rötar Süresi (Simülasyon / Canlı Dakika)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={delayMinutes}
                    onChange={(e) => setDelayMinutes(Number(e.target.value) || 0)}
                    className="w-24 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-sm text-rose-600 focus:outline-none"
                  />
                  <span className="text-xs font-bold text-slate-500">Dakika</span>
                  <div className="flex items-center gap-1 ml-auto">
                    {[0, 20, 45, 90].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDelayMinutes(d)}
                        className={`px-2 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                          delayMinutes === d
                            ? 'bg-rose-500 text-white'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {d === 0 ? 'Vaktinde' : `+${d}dk`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Flight Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
              <span className="text-[10px] uppercase font-bold text-slate-400">Sık İnen Seferler:</span>
              {Object.keys(HKT_COMMON_FLIGHTS).map((fn) => (
                <button
                  key={fn}
                  type="button"
                  onClick={() => setFlightInput(fn)}
                  className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    normalizeFlightNumber(flightInput) === fn
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {fn}
                </button>
              ))}
            </div>
          </div>

          {/* Live Flight Radar Display Card */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-mono font-black text-amber-400">{flightInfo.flightNumber}</span>
                  <span className="text-xs text-slate-300 font-semibold">{flightInfo.airline}</span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  ✈️ Kalkış: <strong>{flightInfo.originCity}</strong> ➔ Varış: <strong>Phuket (HKT)</strong>
                </div>
              </div>

              <div>
                {flightInfo.status === 'delayed' ? (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-500/20 text-rose-400 border border-rose-500/40 inline-flex items-center gap-1.5 animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>+{flightInfo.delayMinutes} Dk Rötar</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 inline-flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Zamanında (On Time)</span>
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Tarifeli İniş</span>
                <span className="text-sm font-mono font-black text-slate-300">{flightInfo.scheduledArrival}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Tahmini İniş (ETA)</span>
                <span className={`text-sm font-mono font-black ${flightInfo.status === 'delayed' ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {flightInfo.estimatedArrival}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Karşılama Kapısı</span>
                <span className="text-xs font-bold text-sky-300 truncate block">{flightInfo.gate}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Bagaj Bandı</span>
                <span className="text-xs font-bold text-amber-300 truncate block">{flightInfo.baggageBelt}</span>
              </div>
            </div>
          </div>

          {/* Guest and Driver Detail Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-white dark:bg-surface-2 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-bold uppercase text-slate-400 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-sky-500" />
                <span>Karşılanacak Misafir</span>
              </span>
              <div className="space-y-1.5">
                <input
                  type="text"
                  placeholder="Misafir Adı"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold"
                />
                <input
                  type="tel"
                  placeholder="Misafir WhatsApp"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white dark:bg-surface-2 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-bold uppercase text-slate-400 flex items-center gap-1">
                <Car className="w-3.5 h-3.5 text-amber-500" />
                <span>Atanan Şoför & Araç</span>
              </span>
              <div className="space-y-1.5">
                <input
                  type="text"
                  placeholder="Şoför Adı"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold"
                />
                <input
                  type="tel"
                  placeholder="Şoför WhatsApp"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer WhatsApp Triggers */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-surface-2/30 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            {/* Driver Delay WhatsApp */}
            <a
              href={driverWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => showToast?.('🇹🇭 Şoför WhatsApp mesajı açılıyor...')}
              className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              title="Şoföre Tayca ve İngilizce rötar bildirimini WhatsApp ile gönder"
            >
              <Send className="w-3.5 h-3.5" />
              <span>🇹🇭 Şoföre Rötar Bildir (WhatsApp)</span>
            </a>

            {/* Guest Landing Greeting WhatsApp */}
            <a
              href={guestWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => showToast?.('Misafir karşılama WhatsApp mesajı açılıyor...')}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              title="Misafire havaalanı iniş kapısı ve karşılama tabelasını WhatsApp ile bildir"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Misafire Karşılama Gönder</span>
            </a>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 font-bold text-slate-800 dark:text-slate-200 text-xs transition-all cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
