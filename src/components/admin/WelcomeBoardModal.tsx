import { useState, useMemo } from 'react';
import {
  X,
  Printer,
  Copy,
  Check,
  Send,
  MessageCircle,
  Maximize2,
  Sparkles,
  Plane,
  Hotel,
  Users,
} from 'lucide-react';
import {
  type WelcomeBoardTheme,
  WELCOME_BOARD_THEMES,
  formatNameboardGuestName,
  generateWelcomeBoardUrl,
  generateDriverNameboardWhatsApp,
  getDriverNameboardWhatsAppUrl,
} from '../../lib/welcomeBoard';
import type { Booking, DriverItem } from '../../data/adminInitialData';

interface WelcomeBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings?: Booking[];
  drivers?: DriverItem[];
  initialBooking?: Booking | null;
  showToast: (msg: string) => void;
}

export default function WelcomeBoardModal({
  isOpen,
  onClose,
  bookings = [],
  drivers = [],
  initialBooking,
  showToast,
}: WelcomeBoardModalProps) {
  if (!isOpen) return null;

  const [selectedBookingId, setSelectedBookingId] = useState<string>(initialBooking?.id || bookings[0]?.id || '');
  const [customGuestName, setCustomGuestName] = useState<string>(initialBooking?.customerName || '');
  const [customFlight, setCustomFlight] = useState<string>(initialBooking?.flightNumber || 'TK 172');
  const [customHotel, setCustomHotel] = useState<string>(initialBooking?.hotel || '');
  const [selectedTheme, setSelectedTheme] = useState<WelcomeBoardTheme>('luxury_dark');
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const activeBooking = useMemo(() => {
    return bookings.find((b) => b.id === selectedBookingId) || initialBooking;
  }, [bookings, selectedBookingId, initialBooking]);

  const guestName = customGuestName || activeBooking?.customerName || 'Murat Yılmaz';
  const flightNumber = (customFlight || activeBooking?.flightNumber || 'TK 172').toUpperCase();
  const hotelName = customHotel || activeBooking?.hotel || 'The Shore at Katathani';
  const formattedName = formatNameboardGuestName(guestName);

  const boardPath = generateWelcomeBoardUrl(activeBooking?.ticketCode || activeBooking?.id || 'demo', selectedTheme);
  const boardFullUrl = typeof window !== 'undefined' ? `${window.location.origin}${boardPath}` : `https://phukettatili.com${boardPath}`;

  const selectedDriver = useMemo(() => {
    return drivers.find((d) => d.id === selectedDriverId);
  }, [drivers, selectedDriverId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(boardFullUrl);
    setCopied(true);
    showToast('Tabela linki panoya kopyalandı! 📋');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyWhatsAppText = () => {
    const text = generateDriverNameboardWhatsApp(
      selectedDriver?.fullName || 'Şoför',
      guestName,
      flightNumber,
      boardPath
    );
    navigator.clipboard.writeText(text);
    showToast('Şoför WhatsApp görev metni kopyalandı! 📋');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <span className="text-xl">🪧</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>VIP Karşılama Tabela Stüdyosu</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold">
                  Tablet & Baskı
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Havalimanı ve iskele şoförleri için tam ekran dijital karşılama isimliği ve A4 baskı şablonu.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Controls: Booking select, Theme & Driver */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1.5">
                Rezervasyon Seçimi
              </label>
              <select
                value={selectedBookingId}
                onChange={(e) => {
                  setSelectedBookingId(e.target.value);
                  const b = bookings.find((bk) => bk.id === e.target.value);
                  if (b) {
                    setCustomGuestName(b.customerName);
                    setCustomFlight(b.flightNumber || 'TK 172');
                    setCustomHotel(b.hotel);
                  }
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
              >
                <option value="">Serbest Giriş (Özel İsimlik)</option>
                {bookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.customerName} ({b.flightNumber || 'Uçuşsuz'}) - {b.hotel}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1.5">
                Görsel Tema
              </label>
              <select
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value as WelcomeBoardTheme)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
              >
                {Object.values(WELCOME_BOARD_THEMES).map((th) => (
                  <option key={th.id} value={th.id}>
                    {th.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1.5">
                Görevli Şoför (WhatsApp Bildirimi İçin)
              </label>
              <select
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
              >
                <option value="">Şoför Seç (İsteğe Bağlı)</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.fullName} {d.phone ? `(${d.phone})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Edit Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Misafir Adı</label>
              <input
                type="text"
                value={customGuestName}
                onChange={(e) => setCustomGuestName(e.target.value)}
                placeholder="Örn: MURAT YILMAZ"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Uçuş Kodu</label>
              <input
                type="text"
                value={customFlight}
                onChange={(e) => setCustomFlight(e.target.value)}
                placeholder="Örn: TK 172"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Varış Oteli</label>
              <input
                type="text"
                value={customHotel}
                onChange={(e) => setCustomHotel(e.target.value)}
                placeholder="Örn: The Shore at Katathani"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none"
              />
            </div>
          </div>

          {/* CANLI MİNYATÜR ÖNİZLEME (Mini Board Mockup) */}
          <div className="border border-slate-800 rounded-3xl p-6 sm:p-8 bg-slate-950 text-center relative shadow-inner overflow-hidden">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border mb-4 border-amber-500/30 text-amber-400 bg-amber-500/10">
              <Sparkles className="w-3 h-3" />
              <span>PHUKET TATİLİ VIP CONCIERGE</span>
            </div>

            <p className="text-sm font-serif text-slate-400 font-light tracking-wide">
              Phuket'e Hoş Geldiniz
            </p>

            <div className="my-4 border-y border-amber-500/30 py-4 max-w-xl mx-auto">
              <h2 className="text-2xl sm:text-4xl font-black font-serif tracking-tight text-white uppercase break-words">
                {formattedName}
              </h2>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 text-xs max-w-lg mx-auto">
              <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 font-mono text-amber-300 flex items-center gap-1.5">
                <Plane className="w-3.5 h-3.5" />
                <span>{flightNumber}</span>
              </span>
              <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1.5 truncate max-w-[200px]">
                <Hotel className="w-3.5 h-3.5 text-sky-400" />
                <span>{hotelName}</span>
              </span>
              <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-purple-400" />
                <span>{activeBooking ? (activeBooking.adultCount || 1) + (activeBooking.childCount || 0) : 2} Pax</span>
              </span>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <a
              href={boardPath}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-black shadow-lg shadow-amber-500/20 flex items-center gap-2 transition cursor-pointer"
              title="Yeni sekmede tam ekran tablet görünümünü aç"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Tam Ekran Aç (Tablet)</span>
            </a>

            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Kopyalandı' : 'Linki Kopyala'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {selectedDriver?.phone ? (
              <a
                href={getDriverNameboardWhatsAppUrl(
                  selectedDriver.phone,
                  selectedDriver.fullName,
                  guestName,
                  flightNumber,
                  boardPath
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Şoföre WhatsApp'la İlet</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={handleCopyWhatsAppText}
                className="px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Şoför Metnini Kopyala</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                const w = window.open(boardPath, '_blank');
                if (w) {
                  w.focus();
                  setTimeout(() => w.print(), 1000);
                }
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              title="A4 Çıktı Al"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Yazdır</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
